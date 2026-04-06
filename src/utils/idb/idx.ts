/**
 * Indexed DB promise index.
 * Wrapper of the IDBIndex IndexedDB API object.
 */
import { Cursor } from "./cursor.js";
import { CursorWithValue } from "./cursor-w-value.js";

export class Index {
  _iDbIndex: IDBIndex;
  /**
   * Index constructor.
   * @param {IDBIndex} iDbIndex The index interface object.
   */
  constructor(iDbIndex: IDBIndex) {
    // Set index interface object
    this._iDbIndex = iDbIndex;
  }

  /**
   * Get index interface object.
   * @return {IDBIndex} The index object.
   */
  get iDbIndex(): IDBIndex {
    // Return the index interface object
    return this._iDbIndex;
  }

  /**
   * Gets the key path value that was used when creating the index.
   * @return {String | String[]} The key path value.
   */
  get keyPath(): string | string[] {
    // Return the key path value
    return this._iDbIndex.keyPath;
  }

  /**
   * Gets the multi entry value that was used when creating the index.
   */
  get multiEntry() {
    // Return the multi entry value
    return this._iDbIndex.multiEntry;
  }

  /**
   * Gets the name of the index.
   * @return {String | String[]} The index's name.
   */
  get name(): string {
    // Return the index's name
    return this._iDbIndex.name;
  }

  /**
   * Gets the object store the index is linked to.
   * @return {IDBObjectStore} The object store interface object.
   */
  get objectStore(): IDBObjectStore {
    // Return the object store interface object
    return this._iDbIndex.objectStore;
  }

  /**
   * Gets the unique value that was used when creating the index.
   * @return {Boolean} The unquie value.
   */
  get unique(): boolean {
    // Return the unique value
    return this._iDbIndex.unique;
  }

  /**
   * Count the number of objects in the index that match the query.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [key] The key or key range to use when counting. If not given then all objects
   * are courted.
   * @return {Promise<Number>} A promise that resolves with the count value.
   */
  count<T extends IDBValidKey | IDBKeyRange>(key: T) {
    // Create promise
    const promise = new Promise<number>((resolve, reject) => {
      // Count the number of objects with index
      const request = this._iDbIndex.count(key);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise with the count value
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Get the first matching object with the index. There may be more than one found
   * but only the first one is given.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [key] Either a key value or a key range object.
   * @return {Promise<*>} A promise that resolves the first object found.
   */
  get<T extends IDBValidKey | IDBKeyRange, TResult>(key: T) {
    // Create promise
    const promise = new Promise<TResult>((resolve, reject) => {
      // Get the object using the key
      const request = this._iDbIndex.get(key);

      // Handle the on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise with the first found object
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Get all the matching objects with the index.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [query] Either a key value or a key range object.
   * @param {Number} [count] The maximum number of objects that can be returned.
   * @return {Promise<*[]} A promise that resolves with a list of found objects.
   */
  getAll<T extends IDBValidKey | IDBKeyRange, TResult>(query: T, count: number) {
    // Create promise
    const promise = new Promise<TResult[]>((resolve, reject) => {
      // Get all the objects with the index
      const request = this._iDbIndex.getAll(query, count);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise with the object list
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Get all the keys that match the query.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [query] Either a key value or a key range object.
   * @param {Number} [count] The maximum number of keys that can be returned.
   * @return {Promise<*[]>} A promise that resolves with a list of found keys.
   */
  getAllKeys<T extends IDBValidKey | IDBKeyRange>(query: T, count: number) {
    // Create promise
    const promise = new Promise<IDBValidKey[]>((resolve, reject) => {
      // Get all the keys with the index
      const request = this._iDbIndex.getAllKeys(query, count);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise with the list of keys
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Get the first matching key from the query. There may be more than one found
   * but only the first one is given.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [key] Either a key value or a key range object.
   * @return {Promise<*>} A promise that resolves with the first key found.
   */
  getKey<T extends IDBValidKey | IDBKeyRange>(key: T) {
    // Create promise
    const promise = new Promise<IDBValidKey>((resolve, reject) => {
      // Get the key form with index
      const request = this._iDbIndex.getKey(key);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise with the key value
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Open a cursor with the index over the object store that contains their values. Cursors are used to move through a list of objects
   * inside the object store, using the index.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [range] Either a key value or a key range object.
   * @param {String} [direction] Either "next", "nextunique", "prev" or "prevunique".
   * @return {Promise<CursorWithValue|null>} A promise that resolves with either the cursor with value object or undefined
   * if nothing was found.
   */
  openCursor<T extends IDBValidKey | IDBKeyRange>(range: T, direction: IDBCursorDirection) {
    // Create promise
    const promise = new Promise<CursorWithValue | null>((resolve, reject) => {
      // Open the cursor
      const request = this._iDbIndex.openCursor(range, direction);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // If nothing found then resolve with nothing
        if (request.result === null) {
          resolve(null);
          return;
        }

        // Create a cursor with value object from the resulting iDbCursorWithValue
        const cursorWithValue = new CursorWithValue(request.result, request);

        // Resolve the promise with cursor with value object
        resolve(cursorWithValue);
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Open a cursor with the index over the object store that contains their keys only (not the values). Cursors are used to move through
   * a list of objects inside the object store, using the index.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [range] Either a key value or a key range object.
   * @param {String} [direction] Either "next", "nextunique", "prev" or "prevunique".
   * @return {Promise<Cursor|null>} A promise that resolves with either the cursor object (with keys, but no values) or undefined
   * if nothing was found.
   */
  openKeyCursor<T extends IDBValidKey | IDBKeyRange>(range: T, direction: IDBCursorDirection) {
    // Create promise
    const promise = new Promise<Cursor | null>((resolve, reject) => {
      // Open the cursor
      const request = this._iDbIndex.openKeyCursor(range, direction);

      // Handle the on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // If nothing found then resolve with nothing
        if (request.result === null) {
          resolve(null);
          return;
        }

        // Create a cursor object from the resulting iDbCursor
        const cursor = new Cursor(request.result, request);

        // Resolve the promise with cursor object
        resolve(cursor);
      };
    });

    // Return the promise
    return promise;
  }
}
