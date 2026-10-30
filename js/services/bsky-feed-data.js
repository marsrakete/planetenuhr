window.PLANETENUHR_BSKY_FEED_DATA = (() => {
  'use strict';

  /** Creates a reader and selector for configured public Bluesky author feeds.
   * @param {object} options Fetch implementation, feed list and current-time provider.
   * @returns {object} Feed loading, URL and item-selection operations.
   */
  function create(options){
    let now = () => new Date();
    if (typeof options.now === 'function') now = options.now;

    /** Builds a stable local YYYY-MM-DD key for comparing post and current dates.
     * @param {Date} date Date in the browser's local timezone.
     * @returns {string} Local calendar date key.
     */
    function localDateKey(date){
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    /** Builds the public Bluesky post URL or returns the configured profile fallback.
     * @param {object} post Bluesky post-view record.
     * @param {string} fallbackProfileUrl Configured author profile URL.
     * @returns {string} Post URL, profile URL or safe placeholder.
     */
    function postUrl(post, fallbackProfileUrl){
      let handle = '';
      if (post.author && post.author.handle) handle = post.author.handle;
      else if (fallbackProfileUrl) handle = fallbackProfileUrl.split('/').pop();
      let rkey = '';
      if (post.uri) rkey = post.uri.split('/').pop();
      if (!handle || !rkey) return fallbackProfileUrl || '#';
      return 'https://bsky.app/profile/' + encodeURIComponent(handle) + '/post/' + encodeURIComponent(rkey);
    }

    /** Extracts renderable images from the supported author-feed embed shape.
     * @param {object} post Bluesky post-view record.
     * @returns {Array<{src:string,alt:string}>} Valid image URL and alt-text pairs.
     */
    function postImages(post){
      let images = [];
      if (post.embed && Array.isArray(post.embed.images)) images = post.embed.images;
      return images
        .map(image => ({src:image.fullsize || image.thumb,alt:image.alt || ''}))
        .filter(image => image.src);
    }

    /** Determines whether a post was created on the current local calendar date.
     * @param {object} post Bluesky post-view record.
     * @returns {boolean} True when its creation date is today locally.
     */
    function isTodayPost(post){
      let stamp = 0;
      if (post.record && post.record.createdAt) stamp = post.record.createdAt;
      else if (post.indexedAt) stamp = post.indexedAt;
      const createdAt = new Date(stamp);
      return localDateKey(createdAt) === localDateKey(now());
    }

    /** Fetches the latest image posts for one configured author feed.
     * @param {object} feed Configured account handle and display metadata.
     * @returns {Promise<Array<object>>} Image posts sorted newest first.
     */
    async function fetchImagePosts(feed){
      const url = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor='
        + encodeURIComponent(feed.handle) + '&limit=20&filter=posts_no_replies';
      const response = await options.fetch(url, {headers:{accept:'application/json'}});
      if (!response.ok) throw new Error('Bluesky HTTP ' + response.status);
      const data = await response.json();
      let feedItems = [];
      if (Array.isArray(data.feed)) feedItems = data.feed;
      return feedItems
        .map(item => item.post)
        .filter(Boolean)
        .map(post => ({
          feed,
          post,
          images:postImages(post),
          createdAt:new Date((post.record && post.record.createdAt) || post.indexedAt || 0)
        }))
        .filter(item => item.images.length)
        .sort((a,b) => b.createdAt - a.createdAt);
    }

    /** Fetches all configured accounts concurrently while preserving per-feed failures.
     * @returns {Promise<Array<object>>} Promise.allSettled results in configured feed order.
     */
    function fetchAll(){
      const feeds = options.feeds || [];
      return Promise.allSettled(feeds.map(fetchImagePosts));
    }

    /** Chooses today's image post or the newest available fallback for one feed.
     * @param {Array<object>} items Newest-first image posts for one author.
     * @returns {{item:object|undefined,isFallback:boolean}} Chosen item and fallback status.
     */
    function chooseFeedItem(items){
      const todayItem = items.find(item => isTodayPost(item.post));
      return {item:todayItem || items[0],isFallback:!todayItem};
    }

    return {localDateKey,postUrl,postImages,isTodayPost,fetchImagePosts,fetchAll,chooseFeedItem};
  }

  return {create};
})();
