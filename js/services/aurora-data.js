window.PLANETENUHR_AURORA_DATA = (() => {
  'use strict';

  /** Creates a cached NOAA reader for planetary Kp samples.
   * @param {object} options Fetch implementation, clock and optional cache duration.
   * @returns {object} Cache and loading operations; performs no request until load is called.
   */
  function create(options){
    const config = options.config;
    let fetchedAt = 0;
    let lastSample = null;
    let pending = null;
    let now = Date.now;
    if (typeof options.now === 'function') now = options.now;
    let cacheDurationMs = config.cacheDurationMs;
    if (Number.isFinite(options.cacheDurationMs)) cacheDurationMs = options.cacheDurationMs;

    /** Maps a planetary Kp value to its existing four-level aurora band.
     * @param {number} kp Planetary Kp index.
     * @returns {string} low, medium, high or extreme.
     */
    function bandForKp(kp){
      if (!(kp >= 0)) return 'low';
      if (kp >= 7) return 'extreme';
      if (kp >= 6) return 'high';
      if (kp >= 5) return 'medium';
      return 'low';
    }

    /** Normalizes one NOAA array row or supported object sample.
     * @param {Array|object} item NOAA sample.
     * @returns {{timeTag:string,kp:number}|null} Normalized sample or null when invalid.
     */
    function normalizeSample(item){
      if (!item) return null;
      if (Array.isArray(item)) {
        if (item.length < 2 || item[0] === 'time_tag') return null;
        const kp = Number(item[1]);
        if (!Number.isFinite(kp)) return null;
        return {timeTag:String(item[0]),kp};
      }
      const kp = Number(item.kp_index ?? item.kp ?? item.estimated_kp ?? item.KP);
      const timeTag = item.time_tag || item.timeTag || item.observed_time || item.date || item.timestamp;
      if (!Number.isFinite(kp) || !timeTag) return null;
      return {timeTag:String(timeTag),kp};
    }

    /** Selects the last valid sample from the NOAA endpoint's supported payload shapes.
     * @param {object|Array} payload Decoded NOAA response.
     * @returns {{timeTag:string,kp:number}|null} Latest valid sample or null.
     */
    function parsePayload(payload){
      if (!payload) return null;
      if (Array.isArray(payload)) {
        const candidates = payload.map(normalizeSample).filter(Boolean);
        if (candidates.length) return candidates[candidates.length - 1];
        return null;
      }
      if (Array.isArray(payload.data)) {
        const candidates = payload.data.map(normalizeSample).filter(Boolean);
        if (candidates.length) return candidates[candidates.length - 1];
        return null;
      }
      return normalizeSample(payload);
    }

    /** Returns the cached sample while it remains within the existing 20-minute lifetime.
     * @returns {{timeTag:string,kp:number}|null} Fresh cached sample or null.
     */
    function getFreshSample(){
      if (!lastSample) return null;
      if (now() - fetchedAt >= cacheDurationMs) return null;
      return {...lastSample};
    }

    /** Reports whether one endpoint request sequence is already in progress.
     * @returns {boolean} True when a load promise is pending.
     */
    function hasPending(){
      return pending !== null;
    }

    /** Loads NOAA data, reuses a fresh cache and shares concurrent requests.
     * @param {boolean} [force=false] Bypasses a fresh cache while retaining in-flight deduplication.
     * @returns {Promise<object|null>} Latest sample, or null when every source fails.
     */
    function load(force = false){
      if (!force) {
        const cached = getFreshSample();
        if (cached) return Promise.resolve(cached);
      }
      if (pending) return pending;

      pending = (async () => {
        let sample = null;
        for (const source of config.sources) {
          try {
            const response = await options.fetch(source, {cache:'no-store'});
            if (!response.ok) continue;
            const payload = await response.json();
            sample = parsePayload(payload);
            if (sample) break;
          } catch (error) {}
        }
        if (sample) {
          fetchedAt = now();
          lastSample = {...sample};
        }
        pending = null;
        return sample;
      })();
      return pending;
    }

    /** Returns a snapshot useful for deterministic cache diagnostics.
     * @returns {object} Copy of cache metadata and current pending state.
     */
    function getState(){
      let sample = null;
      if (lastSample) sample = {...lastSample};
      return {fetchedAt,lastSample:sample,pending:hasPending()};
    }

    return {bandForKp,normalizeSample,parsePayload,getFreshSample,hasPending,load,getState};
  }

  return {create};
})();
