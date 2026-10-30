const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

/** Creates a layout instance with measurable cards and observable browser scheduling.
 * @param {number} [width=1280] Viewport width. @returns {object} Layout and fake browser state.
 */
function fixture(width = 1280){
  const frames = new Map();
  const listeners = new Map();
  const observed = [];
  const scrollCalls = [];
  let nextFrame = 0;
  let disconnects = 0;
  let observerCallback;
  class Element {}
  const scroll = new Element();
  scroll.scrollTop = 500;
  scroll.scrollLeft = 0;
  const cards = [180,260].map(height => ({height,top:100,offsetHeight:height,scrollHeight:height,isConnected:true,
    style:{gridRowEnd:'span 8'},querySelectorAll:() => [],
    getBoundingClientRect(){return {height:this.height,top:this.top,bottom:this.top + this.height};}
  }));
  const grid = {querySelectorAll:() => cards};
  const browser = {innerWidth:width,HTMLElement:Element,
    getComputedStyle:node => {if (node === grid) {return {gridAutoRows:'8px',rowGap:'20px'};} return {display:'block'};},
    requestAnimationFrame(callback){nextFrame += 1; frames.set(nextFrame, callback); return nextFrame;},
    setTimeout(){},scrollTo:(x,y) => scrollCalls.push(['to',x,y]),scrollBy:(x,y) => scrollCalls.push(['by',x,y]),
    addEventListener(type, callback){if (!listeners.has(type)) {listeners.set(type, []);} listeners.get(type).push(callback);},
    ResizeObserver:class {
      constructor(callback){observerCallback = callback;}
      observe(card){observed.push(card);}
      disconnect(){disconnects += 1;}
    }
  };
  const realm = vm.createContext({window:{},WeakMap,Math,Array,parseFloat});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core/dashboard-layout.js'), 'utf8'), realm);
  const layout = realm.window.PLANETENUHR_LAYOUT.create({window:browser,
    document:{scrollingElement:scroll,querySelector:selector => {if (selector === '.grid') {return grid;} return null;}},
    syncDateMobilePanel(){},refresh(){}
  });
  /** Delivers all currently queued animation frames once.
   * No parameters. @returns {void}
   */
  function flush(){const current = [...frames.values()];frames.clear();current.forEach(callback => callback());}
  return {layout,browser,cards,frames,listeners,observed,scrollCalls,scroll,flush,
    deliver:entries => observerCallback(entries),getDisconnects:() => disconnects};
}

test('layout preserves spans during measurement, coalesces batches and initializes once', () => {
  const f = fixture();
  f.layout.initMasonryLayout(); f.layout.initMasonryLayout();
  assert.equal(f.listeners.get('resize').length, 1);
  f.flush();
  assert.equal(f.cards[0].style.gridRowEnd, 'span 8');
  assert.equal(f.cards[1].style.gridRowEnd, 'span 11');
  let writes = 0;
  const firstSpan = f.cards[0].style.gridRowEnd;
  Object.defineProperty(f.cards[0].style, 'gridRowEnd', {get:() => firstSpan,set(){writes += 1;}});
  f.layout.updateMasonryLayout();
  assert.equal(writes, 0);
  let finished = 0;
  f.layout.runWithDeferredMasonryLayout(() => {
    f.layout.requestMasonryLayout();f.layout.requestMasonryLayout();
  }, () => {finished += 1;});
  assert.equal(f.frames.size, 1);
  f.flush(); assert.equal(finished, 1);
});

test('a working scroll-container correction is not applied again through the window', () => {
  const f = fixture();
  const card = f.cards[0];
  card.getBoundingClientRect = () => ({top:130 - (f.scroll.scrollTop - 500),bottom:310});
  f.browser.scrollBy = (x, y) => { f.scroll.scrollTop += y; };
  f.layout.restoreViewportAnchor({element:card,top:100});
  assert.equal(f.scroll.scrollTop, 530);
  assert.equal(card.getBoundingClientRect().top, 100);
});

test('observation is desktop-only and unchanged or suppressed resize deliveries schedule nothing', () => {
  const f = fixture(390);
  f.layout.initMasonryLayout(); f.flush();
  assert.equal(f.observed.length, 0);
  assert.equal(f.cards[0].style.gridRowEnd, '');
  f.browser.innerWidth = 1280;
  f.layout.syncMasonryObservation();f.layout.syncMasonryObservation();
  assert.equal(f.observed.length, 2);
  const entry = {target:f.cards[0],contentRect:{width:360,height:180}};
  f.deliver([entry]); assert.equal(f.frames.size, 1); f.flush();
  f.deliver([entry]); assert.equal(f.frames.size, 0);
  entry.contentRect.height = 250;
  f.layout.withSuppressedMasonryObserver(() => f.deliver([entry]));
  assert.equal(f.frames.size, 0);
  f.deliver([entry]); assert.equal(f.frames.size, 1); f.flush();
  f.browser.innerWidth = 760; f.layout.syncMasonryObservation();
  assert.equal(f.getDisconnects(), 1);
  f.browser.innerWidth = 761; f.layout.syncMasonryObservation();
  assert.equal(f.observed.length, 4);
});

test('pending viewport corrections can be released before opening a detail view', () => {
  const f = fixture();
  const anchor = f.layout.captureViewportAnchor();
  f.cards[0].top += 30;
  f.layout.restoreViewportAnchor(anchor);
  assert.deepEqual(f.scrollCalls[0], ['by',0,30]);
  f.layout.refreshDateDrivenTilesWithAnchor();
  f.layout.releasePendingViewportRestoration();
  f.scrollCalls.length = 0;
  f.cards[0].top += 40;
  f.layout.scheduleMasonryLayout(); f.flush();
  assert.equal(f.scrollCalls.length, 0);
});
