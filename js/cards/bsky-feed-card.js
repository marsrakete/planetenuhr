window.PLANETENUHR_BSKY_FEED_CARD = (() => {
  'use strict';

  /** Creates the translated Bluesky feed view, leaving all network access in its data service.
   * @param {object} options DOM, templates, data service, feeds, translation and layout dependencies.
   * @returns {object} Feed-card loading operation.
   */
  function create(options){
    const document = options.document;

    /** Builds one localized per-feed error or empty-state article from a template.
     * @param {object} feed Configured author feed.
     * @param {string} message Localized error or no-image message.
     * @returns {HTMLElement} Populated feed-status article.
     */
    function createFeedMessage(feed, message){
      const fragment = options.cloneTemplate('bskyFeedMessageTemplate');
      const item = fragment.querySelector('article');
      item.querySelector('.bsky-author-name').textContent = feed.label || feed.handle;
      item.querySelector('.bsky-status').textContent = message;
      return item;
    }

    /** Builds one post article, including optional author image, fallback note and image grid.
     * @param {object} item Normalized feed item and extracted images.
     * @param {boolean} isFallback True when the feed has no post from today's local date.
     * @returns {HTMLElement} Populated post article.
     */
    function createPostElement(item, isFallback){
      const post = item.post;
      let author = {};
      if (post.author) author = post.author;
      const fragment = options.cloneTemplate('bskyPostTemplate');
      const feedItem = fragment.querySelector('article');
      let avatar = feedItem.querySelector('.bsky-avatar');
      if (author.avatar) {
        const image = document.createElement('img');
        image.className = 'bsky-avatar';
        image.alt = author.displayName || author.handle || item.feed.label || '';
        image.loading = 'lazy';
        image.src = author.avatar;
        avatar.replaceWith(image);
        avatar = image;
      } else {
        avatar.textContent = (author.displayName || item.feed.label || author.handle || '?').trim().charAt(0);
      }

      const authorName = feedItem.querySelector('.bsky-author-name');
      authorName.textContent = author.displayName || item.feed.label || author.handle || item.feed.handle;
      const date = item.createdAt;
      feedItem.querySelector('.bsky-date').textContent = options.formatDate(date) + ' ' + date.toLocaleTimeString(options.getLanguage(), {
        hour:'2-digit',
        minute:'2-digit',
        hour12:false
      });

      if (isFallback) {
        const note = options.cloneTemplate('bskyFallbackNoteTemplate');
        note.querySelector('.bsky-account-note').textContent = options.getTranslations().bsky_no_today || 'No image post today; showing the latest image post.';
        feedItem.querySelector('.bsky-author').after(note);
      }

      let postText = '';
      if (post.record && post.record.text) postText = post.record.text;
      const text = feedItem.querySelector('.bsky-text');
      text.textContent = postText;
      const imageGrid = feedItem.querySelector('.bsky-images');
      if (item.images.length === 1) imageGrid.classList.add('single');
      item.images.slice(0, 4).forEach(imageData => {
        const imageFragment = options.cloneTemplate('bskyImageTemplate');
        const image = imageFragment.querySelector('img');
        image.src = imageData.src;
        image.alt = imageData.alt || text.textContent || authorName.textContent;
        imageGrid.appendChild(image);
      });

      const link = feedItem.querySelector('.bsky-link');
      link.href = options.data.postUrl(post, item.feed.profileUrl);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = options.getTranslations().bsky_open || 'Open on Bluesky';
      return feedItem;
    }

    /** Loads and renders configured feeds while preserving individual errors and empty states.
     * @returns {Promise<void>} Resolves after all configured feeds finish rendering.
     */
    async function load(){
      const card = document.getElementById('bskyCard');
      const status = document.getElementById('bskyStatus');
      if (!card || !status) return;
      const feeds = options.feeds || [];
      if (options.getProtocol() === 'file:' || !feeds.length) {
        card.hidden = true;
        return;
      }

      card.hidden = false;
      status.hidden = false;
      status.textContent = options.getTranslations().bsky_loading || 'Loading Bluesky post...';
      const target = document.getElementById('bskyPost');
      if (!target) return;
      target.replaceChildren();
      target.hidden = true;

      const results = await options.data.fetchAll();
      results.forEach((result, index) => {
        const feed = feeds[index];
        if (result.status !== 'fulfilled') {
          target.appendChild(createFeedMessage(feed, options.getTranslations().bsky_error || 'Could not load Bluesky post.'));
          return;
        }
        if (!result.value.length) {
          target.appendChild(createFeedMessage(feed, options.getTranslations().bsky_empty || 'No image post found.'));
          return;
        }
        const choice = options.data.chooseFeedItem(result.value);
        target.appendChild(createPostElement(choice.item, choice.isFallback));
      });

      status.hidden = true;
      target.hidden = false;
      options.requestLayout();
    }

    return {load};
  }

  return {create};
})();
