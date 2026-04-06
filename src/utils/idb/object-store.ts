/**
 * Indexed DB promise object store.
 * Wrapper of the IDBObjectStore IndexedDB API object.
 */
import { Cursor } from "./cursor.js";
import { CursorWithValue } from "./cursor-w-value.js";
import { Index } from "./idx.js";

export class ObjectStore {
  _iDbObjectStore: IDBObjectStore;
  /**
   * Object store constructor.
   * @param {IDBObjectStore} iDbObjectStore The object store interface object.
   */
  constructor(iDbObjectStore: IDBObjectStore) {
    // Set object store interface object
    this._iDbObjectStore = iDbObjectStore;
  }

  /**
   * Get object store interface object.
   * @return {IDBObjectStore} The object store object.
   */
  get iDbObjectStore(): IDBObjectStore {
    // Return the object store interface object
    return this._iDbObjectStore;
  }

  /**
   * Gets the auto increment value that was used when creating the object store.
   * @return {Boolean} The auto increment value.
   */
  get autoIncrement(): boolean {
    // Return the auto increment value
    return this._iDbObjectStore.autoIncrement;
  }

  /**
   * Gets the list of index names the object store has.
   * @return {DOMStringList} The list of index names. Use .item(index) or [index] to get the name.
   */
  get indexNames(): DOMStringList {
    // Return the index names value
    return this._iDbObjectStore.indexNames;
  }

  /**
   * Gets the key path value that was used when creating the object store.
   * @return {String} The key path value.
   */
  get keyPath(): string | string[] {
    // Return the key path value
    return this._iDbObjectStore.keyPath;
  }

  /**
   * Gets the name of the object store.
   * @return {String} The object store's name.
   */
  get name(): string {
    // Return the name value
    return this._iDbObjectStore.name;
  }

  /**
   * Gets the transaction the object store is linked to.
   * @return {IDBTransaction} The transaction interface object.
   */
  get transaction(): IDBTransaction {
    // Return the transaction interface object
    return this._iDbObjectStore.transaction;
  }

  /**
   * Add a new value into the object store. If the key already exists then it
   * will throw an error.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {Object} value The object to be stored.
   * @param {*} [key] If the object store has no key path then this key will be used.
   * @return {Promise<*>} A promise that resolves with the key value.
   */
  add<T>(value: T, key?: IDBValidKey) {
    // Create promise
    const promise = new Promise<IDBValidKey>((resolve, reject) => {
      // Add value to the object store
      const request = this._iDbObjectStore.add(value, key);

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
   * Clear the object store by deleting all objects from it.
   *
   * **WARNING:** Must be used with `async/await`.
   * @return {Promise} A promise.
   */
  clear() {
    // Create promise
    const promise = new Promise<void>((resolve, reject) => {
      // Clear the object store
      const request = this._iDbObjectStore.clear();

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise
        resolve();
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Count the number of objects in the object store that match the query.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {IDBKeyRange} [query] The query to use when counting. If not given then all objects
   * are courted.
   * @return {Promise<Number>} A promise that resolves with the count value.
   */
  count(query: IDBKeyRange) {
    // Create promise
    const promise = new Promise<number>((resolve, reject) => {
      // Count the number of objects in store
      const request = this._iDbObjectStore.count(query);

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
   * Create a new index in the object store.
   * @param {String} indexName The name of the index. It must be unique to the object store.
   * @param {String} keyPath The name of the property in the objects added, that the index looks at.
   * @param {Object} [options] Extra options.
   * @param {Boolean} [options.unique] Can the objects with the same key value exist in the object store.
   * @param {Boolean} [options.multiEntry] If true the index will add an index for each array element.
   * @return {Index} The created index object.
   */
  createIndex(
    indexName: string,
    keyPath: string,
    options: { unique?: boolean; multiEntry?: boolean },
  ): Index {
    // Create index interface object
    const iDbIndex = this._iDbObjectStore.createIndex(indexName, keyPath, options);

    // Create and return an Index object
    return new Index(iDbIndex);
  }

  /**
   * Delete one or more objects from the object store.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} key Either a key value or a key range object.
   * @return {Promise} A promise.
   */
  delete<T extends IDBValidKey | IDBKeyRange = IDBValidKey>(key: T) {
    // Create promise
    const promise = new Promise<void>((resolve, reject) => {
      // Delete the objects from the object store
      const request = this._iDbObjectStore.delete(key);

      // Handle on error event
      request.onerror = () => {
        // Reject the promise with the error
        reject(request.error);
      };

      // Handle on success event
      request.onsuccess = () => {
        // Resolve the promise
        resolve();
      };
    });

    // Return the promise
    return promise;
  }

  /**
   * Delete an index from the object store. This can only be called within the upgrade process.
   * @param {String} indexName The name of the index to delete.
   */
  deleteIndex(indexName: string) {
    // Delete the index from the object store
    this._iDbObjectStore.deleteIndex(indexName);
  }

  /**
   * Get the first matching object from the object store. There may be more than one found
   * but only the first one is given.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} key Either a key value or a key range object.
   * @return {Promise<*>} A promise that resolves the first object found.
   */
  get<TResult, T extends IDBValidKey | IDBKeyRange = IDBValidKey>(key: T) {
    // Create promise
    const promise = new Promise<TResult>((resolve, reject) => {
      // Get the object using the key
      const request = this._iDbObjectStore.get(key);

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
   * Get all the matching objects from the object store.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [query] Either a key value or a key range object.
   * @param {Number} [count] The maximum number of objects that can be returned.
   * @return {Promise<*[]} A promise that resolves with a list of found objects.
   */
  getAll<TResult, T extends IDBValidKey | IDBKeyRange = IDBValidKey>(query?: T, count?: number) {
    // Create promise
    const promise = new Promise<TResult[]>((resolve, reject) => {
      // Get all the objects from the object store
      const request = this._iDbObjectStore.getAll(query, count);

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
  getAllKeys<T extends IDBValidKey | IDBKeyRange = IDBValidKey>(query?: T, count?: number) {
    // Create promise
    const promise = new Promise<IDBValidKey[]>((resolve, reject) => {
      // Get all the keys from the object store
      const request = this._iDbObjectStore.getAllKeys(query, count);

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
   * Get the first matching key from the object store. There may be more than one found
   * but only the first one is given.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [key] Either a key value or a key range object.
   * @return {Promise<*>} A promise that resolves with the first key found.
   */
  getKey<T extends IDBValidKey | IDBKeyRange = IDBValidKey>(key: T) {
    // Create promise
    const promise = new Promise<IDBValidKey>((resolve, reject) => {
      // Get the key form the object store
      const request = this._iDbObjectStore.getKey(key);

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
   * Get the object store index object.
   * @param {String} name The name of the index.
   * @return {Index} The index object.
   */
  index(name: string): Index {
    // Get index interface object
    const iDbIndex = this._iDbObjectStore.index(name);

    // Create and return an Index object
    return new Index(iDbIndex);
  }

  /**
   * Open a cursor to the object store that contains their values. Cursors are used to move through a list of objects
   * inside the object store.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [query] Either a key value or a key range object.
   * @param {String} [direction] Either "next", "nextunique", "prev" or "prevunique".
   * @return {Promise<CursorWithValue|undefined>} A promise that resolves with either the cursor with value object or undefined
   * if nothing was found.
   */
  openCursor<T extends IDBValidKey | IDBKeyRange = IDBValidKey>(
    query: T,
    direction: IDBCursorDirection,
  ) {
    // Create promise
    const promise = new Promise<CursorWithValue | null>((resolve, reject) => {
      // Open the cursor
      const request = this._iDbObjectStore.openCursor(query, direction);

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
   * Open a cursor to the object store that contains their keys only (not the values). Cursors are used to move through
   * a list of objects inside the object store.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {*|IDBKeyRange} [query] Either a key value or a key range object.
   * @param {String} [direction] Either "next", "nextunique", "prev" or "prevunique".
   * @return {Promise<Cursor|undefined>} A promise that resolves with either the cursor object (with keys, but no values) or undefined
   * if nothing was found.
   */
  openKeyCursor<T extends IDBValidKey | IDBKeyRange = IDBValidKey>(
    query: T,
    direction: IDBCursorDirection,
  ) {
    // Create promise
    const promise = new Promise<Cursor | null>((resolve, reject) => {
      // Open the cursor
      const request = this._iDbObjectStore.openKeyCursor(query, direction);

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

  /**
   * Update an existing object, or insert it if it does not exist, into the object store.
   * Consider using Cursor.update instead.
   *
   * **WARNING:** Must be used with `async/await`.
   * @param {Object} value The object to be updated.
   * @param {*} [key] If the object store has no key path then this key will be used.
   * @return {Promise<*>} A promise that resolves with the key value.
   */
  put<T>(value: T, key?: IDBValidKey) {
    // Create promise
    const promise = new Promise<IDBValidKey>((resolve, reject) => {
      // Put the value into the object store
      const request = this._iDbObjectStore.put(value, key);

      // Handle on error event
      request.onerror = () => {
        // Reject the promose with the error
        reject(request.error);
      };

      // Handle the on success event
      request.onsuccess = () => {
        // Resolve the promise with the key value
        resolve(request.result);
      };
    });

    // Return the promise
    return promise;
  }
}
