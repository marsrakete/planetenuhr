const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const realm = vm.createContext({window:{},Math,Date,Promise,Number,String,Array,encodeURIComponent});
for (const file of ['js/data/aurora-data-config.js','js/services/aurora-data.js','js/services/bsky-feed-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
}

const auroraFactory = realm.window.PLANETENUHR_AURORA_DATA;
const auroraConfig = realm.window.PLANETENUHR_AURORA_DATA_CONFIG;
const blueskyFactory = realm.window.PLANETENUHR_BSKY_FEED_DATA;

/** Creates a minimal successful JSON response for injected fetch tests.
 * @param {*} payload JSON payload returned by response.json.
 * @returns {object} Response-shaped test value.
 */
function jsonResponse(payload){
  return {ok:true,json:async () => payload};
}

test('Aurora sample normalization supports NOAA table rows and object variants', () => {
  const service = auroraFactory.create({config:auroraConfig,fetch:async () => jsonResponse(null)});
  assert.deepEqual(JSON.parse(JSON.stringify(service.normalizeSample(['2026-10-27 12:00:00','5.2']))),{timeTag:'2026-10-27 12:00:00',kp:5.2});
  assert.deepEqual(JSON.parse(JSON.stringify(service.normalizeSample({time_tag:'2026-10-27',kp_index:'6'}))),{timeTag:'2026-10-27',kp:6});
  assert.deepEqual(JSON.parse(JSON.stringify(service.normalizeSample({date:'2026-10-27',estimated_kp:7}))),{timeTag:'2026-10-27',kp:7});
  assert.equal(service.normalizeSample(['time_tag','Kp']),null);
  assert.equal(service.normalizeSample({time_tag:'now',kp:'unknown'}),null);
});

test('Aurora payload parsing takes the final valid row and retains Kp thresholds', () => {
  const service = auroraFactory.create({config:auroraConfig,fetch:async () => jsonResponse(null)});
  assert.deepEqual(JSON.parse(JSON.stringify(service.parsePayload([['time_tag','Kp'],['first',2],['bad','x'],['last',5.3]]))),{timeTag:'last',kp:5.3});
  assert.deepEqual(JSON.parse(JSON.stringify(service.parsePayload({data:[['time_tag','Kp'],['latest',6.1]]}))),{timeTag:'latest',kp:6.1});
  assert.equal(service.parsePayload({data:[['time_tag','Kp']]}),null);
  assert.deepEqual([0,4.9,5,6,7].map(service.bandForKp),['low','low','medium','high','extreme']);
  assert.equal(service.bandForKp(-1),'low');
});

test('Aurora shares in-flight requests, reuses the 20-minute cache and retries the fallback source', async () => {
  let now = 1000;
  let calls = 0;
  let resolveFirst;
  const service = auroraFactory.create({
    config:auroraConfig,
    now:() => now,
    fetch:async (url,options) => {
      calls++;
      assert.equal(options.cache,'no-store');
      if (calls === 1) return new Promise(resolve => {resolveFirst = resolve;});
      if (calls === 2) return {ok:false,json:async () => null};
      return jsonResponse([['time_tag','Kp'],['fallback',6.4]]);
    }
  });
  const first = service.load();
  const concurrent = service.load();
  assert.equal(first,concurrent);
  assert.equal(service.getState().pending,true);
  resolveFirst(jsonResponse([['time_tag','Kp'],['initial',5.2]]));
  assert.deepEqual(JSON.parse(JSON.stringify(await first)),{timeTag:'initial',kp:5.2});
  assert.equal(calls,1);
  now += 20 * 60 * 1000 - 1;
  assert.deepEqual(JSON.parse(JSON.stringify(service.getFreshSample())),{timeTag:'initial',kp:5.2});
  assert.deepEqual(JSON.parse(JSON.stringify(await service.load())),{timeTag:'initial',kp:5.2});
  assert.equal(calls,1);
  now++;
  assert.equal(service.getFreshSample(),null);
  assert.deepEqual(JSON.parse(JSON.stringify(await service.load())),{timeTag:'fallback',kp:6.4});
  assert.equal(calls,3);
  assert.equal(service.getState().pending,false);
});

test('Aurora forced reload bypasses fresh data and total failure remains a null result', async () => {
  let calls = 0;
  const service = auroraFactory.create({config:auroraConfig,fetch:async () => {
    calls++;
    if (calls === 1) return jsonResponse({timeTag:'first',kp:3});
    return {ok:false,json:async () => null};
  }});
  await service.load();
  assert.deepEqual(JSON.parse(JSON.stringify(service.getFreshSample())),{timeTag:'first',kp:3});
  assert.equal(await service.load(true),null);
  assert.equal(calls,3);
  assert.equal(service.getState().lastSample.kp,3);
});

test('Bluesky image feed requests preserve endpoint, filter and newest-first data selection', async () => {
  let requestedUrl = '';
  let requestedHeaders = null;
  const now = new Date('2026-10-27T12:00:00Z');
  const feed = {handle:'some account.bsky.social',label:'Example',profileUrl:'https://bsky.app/profile/example'};
  const service = blueskyFactory.create({
    feeds:[feed],now:() => new Date(now),
    fetch:async (url,options) => {
      requestedUrl = url;
      requestedHeaders = options.headers;
      return jsonResponse({feed:[
        {post:{uri:'at://did:plc:x/app.bsky.feed.post/old',indexedAt:'2026-10-26T10:00:00Z',record:{createdAt:'2026-10-26T10:00:00Z'},embed:{images:[{thumb:'old.jpg',alt:'old'}]}}},
        {post:{uri:'at://did:plc:x/app.bsky.feed.post/no-image',record:{createdAt:'2026-10-27T11:00:00Z'},embed:{}}},
        {post:{uri:'at://did:plc:x/app.bsky.feed.post/today',indexedAt:'2026-10-27T11:00:00Z',author:{handle:'some account.bsky.social'},record:{createdAt:'2026-10-27T11:00:00Z'},embed:{images:[{fullsize:'today.jpg',alt:'today'}]}}}
      ]});
    }
  });
  const items = await service.fetchImagePosts(feed);
  assert.match(requestedUrl,/app\.bsky\.feed\.getAuthorFeed\?actor=some%20account\.bsky\.social&limit=20&filter=posts_no_replies/);
  assert.deepEqual(JSON.parse(JSON.stringify(requestedHeaders)),{accept:'application/json'});
  assert.deepEqual(items.map(item => item.post.uri.split('/').pop()),['today','old']);
  assert.deepEqual(JSON.parse(JSON.stringify(items[0].images)),[{src:'today.jpg',alt:'today'}]);
  assert.equal(service.chooseFeedItem(items).item.post.uri.split('/').pop(),'today');
  assert.equal(service.chooseFeedItem(items).isFallback,false);
  assert.equal(service.chooseFeedItem(items.slice(1)).isFallback,true);
  assert.equal(service.postUrl(items[0].post,feed.profileUrl),'https://bsky.app/profile/some%20account.bsky.social/post/today');
});

test('Bluesky all-feed results retain per-account errors, empty feeds and configured order', async () => {
  const feeds = [{handle:'good.test'},{handle:'empty.test'},{handle:'error.test'}];
  const service = blueskyFactory.create({
    feeds,
    fetch:async url => {
      if (url.includes('error.test')) return {ok:false,status:503,json:async () => null};
      if (url.includes('empty.test')) return jsonResponse({feed:[]});
      return jsonResponse({feed:[{post:{uri:'at://did:plc:x/app.bsky.feed.post/one',record:{createdAt:'2026-10-27T10:00:00Z'},embed:{images:[{thumb:'one.jpg'}]}}}]});
    }
  });
  const results = await service.fetchAll();
  assert.deepEqual(results.map(result => result.status),['fulfilled','fulfilled','rejected']);
  assert.equal(results[0].value[0].feed,feeds[0]);
  assert.equal(results[1].value.length,0);
  assert.match(results[2].reason.message,/HTTP 503/);
});
