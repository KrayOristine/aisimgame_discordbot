import { getHasher, HashBigSeed } from "@utils/hashing";
import { Bigint2Hex } from "@utils/hashing";
import { processSaveSlot } from "#/services/db/processing";
import { DBStoreName, DEP_DBStoreName } from "#/services/db/service";
import type { Transaction } from "#/utils/idb";

export function upgrade0to5(oldVer: number, dbInstance: IDBDatabase) {
  switch (oldVer) {
    case 0:
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.SAVES)) {
        dbInstance.createObjectStore(DEP_DBStoreName.SAVES, {
          keyPath: "saveId",
        });
      }
    case 1:
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.FANDOM)) {
        dbInstance.createObjectStore(DEP_DBStoreName.FANDOM, {
          keyPath: "id",
        });
      }
    case 2:
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.TURN_VECTORS)) {
        const store = dbInstance.createObjectStore(DEP_DBStoreName.TURN_VECTORS, {
          keyPath: "turnId",
        });
        store.createIndex("turnIndex", "turnIndex", { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.SUMMARY_VECTORS)) {
        const store = dbInstance.createObjectStore(DEP_DBStoreName.SUMMARY_VECTORS, {
          keyPath: "summaryId",
        });
        store.createIndex("summaryIndex", "summaryIndex", {
          unique: false,
        });
      }
    case 3:
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.ENTITY_VECTORS)) {
        dbInstance.createObjectStore(DEP_DBStoreName.ENTITY_VECTORS, {
          keyPath: "id",
        });
      }
    case 4:
      let trans = dbInstance.transaction(
        [
          DEP_DBStoreName.TURN_VECTORS,
          DEP_DBStoreName.ENTITY_VECTORS,
          DEP_DBStoreName.SUMMARY_VECTORS,
        ],
        "readwrite",
      );
      if (dbInstance.objectStoreNames.contains(DEP_DBStoreName.TURN_VECTORS)) {
        const store = trans.objectStore(DEP_DBStoreName.TURN_VECTORS);
        if (!store.indexNames.contains("worldId")) {
          store.createIndex("worldId", "worldId", { unique: false });
        }
      }
      if (dbInstance.objectStoreNames.contains(DEP_DBStoreName.SUMMARY_VECTORS)) {
        const store = trans.objectStore(DEP_DBStoreName.SUMMARY_VECTORS);
        if (!store.indexNames.contains("worldId")) {
          store.createIndex("worldId", "worldId", { unique: false });
        }
      }
      if (dbInstance.objectStoreNames.contains(DEP_DBStoreName.ENTITY_VECTORS)) {
        const store = trans.objectStore(DEP_DBStoreName.ENTITY_VECTORS);
        if (!store.indexNames.contains("worldId")) {
          store.createIndex("worldId", "worldId", { unique: false });
        }
      }

      trans.commit();
    case 5:
      // Nâng cấp từ v5 lên v6: Thêm Graph Nodes và Edges
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.GRAPH_NODES)) {
        const store = dbInstance.createObjectStore(DEP_DBStoreName.GRAPH_NODES, {
          keyPath: ["worldId", "id"],
        });
        store.createIndex("worldId", "worldId", { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(DEP_DBStoreName.GRAPH_EDGES)) {
        const store = dbInstance.createObjectStore(DEP_DBStoreName.GRAPH_EDGES, {
          keyPath: ["worldId", "source", "target", "relation"],
        });
        store.createIndex("worldId", "worldId", { unique: false });
        store.createIndex("source", "source", { unique: false });
        store.createIndex("target", "target", { unique: false });
      }
  }
}

export function migrateDBStructurev7(dbInstance: IDBDatabase) {
  console.log("Migrating indexedDB data structure from v6 to v7...");
  // Migrate to a new data structure, aim to improve accessing performance
  const trans = dbInstance.transaction(
    [
      DEP_DBStoreName.SAVES,
      DEP_DBStoreName.GRAPH_NODES,
      DEP_DBStoreName.GRAPH_EDGES,
      DEP_DBStoreName.ENTITY_VECTORS,
      DEP_DBStoreName.SUMMARY_VECTORS,
      DEP_DBStoreName.TURN_VECTORS,
    ],
    "readonly",
  );

  // gather all saved information and cache it while we migrate everything
  const gatherData = function (db: IDBDatabase, storeName: string) {
    const t = db.transaction(storeName, "readonly");
    const store = t.objectStore(storeName);
    const q = store.getAll();
    t.commit();

    return q.result;
  };
  const gatherKey = function (t: IDBTransaction, storeName: string) {
    const store = t.objectStore(storeName);
    const key: string[] = []; //our key will be index + keyPath
    const tKey = store.keyPath!;

    if (typeof tKey === "string") key.push(tKey);
    else key.push(...tKey);

    const idx = store.indexNames;
    const idxL = idx.length;
    for (let i = 0; i < idxL; i++) {
      const item = idx.item(i)!;
      if (typeof item === "string") key.push(idx.item(i)!);
    }

    return key;
  };
  const cacheData = function (t: IDBTransaction) {
    const cache: {
      storeName: string;
      data: string[];
      key: string[] | string;
    }[] = [];
    let store = t.objectStoreNames;
    let storeLength = store.length;
    for (let i = 0; i < storeLength; i++) {
      const name = store.item(i)!;
      cache.push({
        storeName: name,
        data: gatherData(dbInstance, name),
        key: gatherKey(t, name),
      });
    }
    return cache;
  };

  const data: {
    storeName: string;
    data: string[];
    key: string[] | string;
  }[] = cacheData(trans);

  trans.commit();

  dbInstance.deleteObjectStore(DEP_DBStoreName.SAVES);
  dbInstance.deleteObjectStore(DEP_DBStoreName.GRAPH_NODES);
  dbInstance.deleteObjectStore(DEP_DBStoreName.GRAPH_EDGES);
  dbInstance.deleteObjectStore(DEP_DBStoreName.SUMMARY_VECTORS);
  dbInstance.deleteObjectStore(DEP_DBStoreName.ENTITY_VECTORS);
  dbInstance.deleteObjectStore(DEP_DBStoreName.TURN_VECTORS);
  dbInstance.deleteObjectStore(DEP_DBStoreName.FANDOM);

  const worldStore = dbInstance.createObjectStore(DBStoreName.WORLD, {
    keyPath: ["hashId"],
  });
  const dataVectorStore = dbInstance.createObjectStore(DBStoreName.DATA_VECTORS, {
    keyPath: ["hashId"],
  });
  const graphVectorStore = dbInstance.createObjectStore(DBStoreName.GRAPH_VECTOR, {
    keyPath: ["hashId"],
  });
  const graphHeadStore = dbInstance.createObjectStore(DBStoreName.GRAPH_HEAD, {
    keyPath: ["hashId"],
  });
  const wFandomStore = dbInstance.createObjectStore(DBStoreName.PREPARED_WORLD, {
    keyPath: ["hashId"],
  });

  worldStore.createIndex("worldId", "worldId", { unique: false });
  dataVectorStore.createIndex("worldId", "worldId", { unique: false });
  dataVectorStore.createIndex("dataType", "dataType", {
    unique: false,
  });
  graphVectorStore.createIndex("worldId", "worldId", { unique: false });
  graphHeadStore.createIndex("worldId", "worldId", { unique: false });
  wFandomStore.createIndex("id", "id");

  // restore previous data to new structure
  const hasher = getHasher();
  const getHashFromKey = function (key: string[], data: object) {
    const k = Object.keys(data);
    const kL = k.length;
    if (kL <= 0) return "";
    const hL = key.length;
    const content = [];
    for (let i = 0; i < kL; i++) {
      for (let j = 0; j < hL; j++) {
        if (k[i] === key[j]) {
          //@ts-ignore
          content.push(data[k[i]]);
        }
      }
    }
    return Bigint2Hex(hasher.h64(content.join("\\"), HashBigSeed));
  };
  const restoreData = function (
    store: IDBObjectStore,
    keyToHash: string[],
    data: string[],
    extraData?: object,
  ) {
    let dataLength = data.length;
    for (let i = 0; i < dataLength; i++) {
      try {
        const obj = JSON.parse(data[i]);
        const hash = getHashFromKey(keyToHash, obj);

        if (hash === "" || hash.length == 0) {
          continue;
        }

        let base: object;
        if (typeof extraData !== "undefined" && extraData !== null) {
          base = { hashId: hash, ...extraData };
        } else {
          base = { hashId: hash };
        }

        store.add(Object.assign(base, obj));
      } catch {} // skip
    }
  };

  for (const v of data) {
    let vecType: string;
    let okey = typeof v.key === "string" ? [v.key] : v.key;
    switch (v.storeName) {
      case DEP_DBStoreName.SAVES:
        restoreData(worldStore, okey, v.data);
        break;

      case DEP_DBStoreName.GRAPH_NODES:
        restoreData(graphHeadStore, okey, v.data);
        break;

      case DEP_DBStoreName.GRAPH_EDGES:
        restoreData(graphVectorStore, okey, v.data);
        break;

      case DEP_DBStoreName.SUMMARY_VECTORS:
      case DEP_DBStoreName.ENTITY_VECTORS:
      case DEP_DBStoreName.TURN_VECTORS:
        vecType = v.storeName.split("_")[0];
        restoreData(graphVectorStore, okey, v.data, { vecType });
        break;

      case DEP_DBStoreName.FANDOM:
        restoreData(wFandomStore, okey, v.data);
    }
  }
}

export async function addSaveCompression(t: Transaction) {
  // currently, for performance only saves are being compressed
  const s = t.objectStore(DBStoreName.WORLD);
  const o = await s.getAll<SaveSlot>();

  for (const v of o) {
    const p = processSaveSlot(v);
    s.delete(v.hashId);
    s.put(p);
  }
}

export function addVectorCompression(t: Transaction) {
  // to be used when we finally improve vectors performance and caching
}
