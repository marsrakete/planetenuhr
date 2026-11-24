window.PLANETENUHR_EXTERNAL_CONTENT_PREFERENCES = (() => {
  'use strict';

  const storeName = 'external-content';

  /** Creates persistent storage for the independent choices about external content.
   * @param {Window} browser Browser providing the IndexedDB factory.
   * @returns {object} Methods to read and write one provider's versioned preference.
   */
  function create(browser){
    let connection;

    /** Opens the browser database and initializes its object store on first use.
     * No parameters. @returns {Promise<IDBDatabase>}
     */
    function open(){
      if (!connection) {
        connection = new Promise((resolve, reject) => {
          const request = browser.indexedDB.open('planetenuhr-preferences', 1);
          request.onupgradeneeded = () => request.result.createObjectStore(storeName);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          request.onblocked = () => reject(new Error('Preferences database is blocked'));
        }).catch(error => {
          connection = null;
          throw error;
        });
      }
      return connection;
    }

    /** Returns true only for a saved grant matching the current version of the notice.
     * @param {string} key Provider key. @param {number} version Current notice version.
     * @returns {Promise<boolean>} Whether the visitor granted access.
     */
    async function read(key, version){
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).get(key);
        transaction.oncomplete = () => {
          const stored = request.result;
          resolve(stored?.allowed === true && stored.version === version);
        };
        transaction.onabort = () => reject(transaction.error);
      });
    }

    /** Saves an explicit grant or revocation and resolves after the transaction commits.
     * @param {string} key Provider key. @param {number} version Notice version.
     * @param {boolean} allowed Current user choice. @returns {Promise<void>}
     */
    async function write(key, version, allowed){
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put({allowed,version,updatedAt:new Date().toISOString()}, key);
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error);
      });
    }

    return {read,write};
  }

  return {create};
})();
