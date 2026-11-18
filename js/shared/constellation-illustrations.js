window.PLANETENUHR_CONSTELLATION_ART = (() => {
  'use strict';
  /** Creates the shared illustration adapter for monthly charts, details and year-wheel miniatures.
   * @param {object} options Document and generated illustration config.
   * @returns {{prepare:Function,append:Function}} Stateless layout and template renderer.
   */
  function create(options){
    /** Fits a figure and its projected artwork into the same square without changing the source data.
     * @param {object} item Original constellation figure.
     * @returns {object} Figure copy with transformed stars and optional illustration, or original when absent.
     */
    function prepare(item){
      if(!item || !Array.isArray(item.stars)) return item;
      let key=item.key;
      if(!key)key=options.config.aliases[item.name];
      const art=options.config.entries[key];
      if(!art)return item;
      return {...item, illustration:art, stars:item.stars.map(star=>[
        star[0]*art.scale+art.offset[0],star[1]*art.scale+art.offset[1]
      ])};
    }
    /** Appends an aligned decorative image before the caller's stars, lines and labels.
     * @param {SVGElement} target SVG or SVG group receiving the underlay.
     * @param {object} item Prepared constellation figure.
     * @param {number} size Square image size in the target's coordinate units.
     * @param {number} [origin=0] x/y origin, for centered year-wheel miniatures.
     * @param {number} [originY=origin] Optional separate vertical origin for rectangular thumbnails.
     * @returns {SVGImageElement|null} Inserted image; null for figures without artwork.
     */
    function append(target,item,size,origin=0,originY=origin){
      if(!item || !item.illustration)return null;
      const image=options.document.getElementById('constellationIllustrationTemplate').content.querySelector('image').cloneNode(true);
      image.setAttribute('href',item.illustration.src);
      image.setAttribute('x',String(origin));image.setAttribute('y',String(originY));
      image.setAttribute('width',String(size));image.setAttribute('height',String(size));
      target.appendChild(image);
      return image;
    }
    return {prepare,append};
  }
  return {create};
})();
