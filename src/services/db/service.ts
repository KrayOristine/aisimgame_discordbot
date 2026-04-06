import { upgrade0to5, migrateDBStructurev7, addSaveCompression } from "#/services/db/migration";
import { parseSaveSlot, processSaveSlot } from "#/services/db/processing";
import type { CompressedSaveSlot } from "#/services/db/processing";
import { Database } from "#/utils/idb";
import type { Transaction } from "#/utils/idb";
import ld from "lodash";

/**
 * @deprecated Use newer data structure instead
 */
export const enum DEP_DBStoreName {
  SAVES = "saves",
  FANDOM = "fandom_files",
  TURN_VECTORS = "turn_vectors",
  SUMMARY_VECTORS = "summary_vectors",
  ENTITY_VECTORS = "entity_vectors",
  GRAPH_NODES = "graph_nodes",
  GRAPH_EDGES = "graph_edges",
}

// new data structure
export const enum DBStoreName {
  WORLD = "world", // save renamed
  DATA_VECTORS = "data_vector", // merge of turn, summary, entity
  GRAPH_VECTOR = "graph_vector",
  GRAPH_HEAD = "graph_header",
  PREPARED_WORLD = "wfandom",
}

export const enum DB {
  NAME = "ai-rpg-simulator-db",
  VERSION = 8, // increase if modify
}

let database = new Database(DB.NAME, DB.VERSION);
database._upgrade = async function (t, vold, vnew) {
  switch (vold) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      upgrade0to5(vold, t.db);

    case 6:
      migrateDBStructurev7(t.db);
    case 7:
      // apply save compression
      addSaveCompression(t);
      break;
  }
};

export async function addSave(save: SaveSlot) {
  try {
    const db = await database.open();

    const transaction = db.transaction(DBStoreName.WORLD, "readwrite");
    const store = transaction.objectStore(DBStoreName.WORLD);
    const data = processSaveSlot(save);

    console.table(data);
    store.put(data);
  } catch (e) {
    console.error("Cant store save data to indexedDB:", e);
  }
}

export async function getAllSaves() {
  try {
    const db = await database.open();
    const trans = db.transaction(DBStoreName.WORLD, "readonly");
    const store = trans.objectStore(DBStoreName.WORLD);
    const cs = await store.getAll<CompressedSaveSlot>();

    const r: SaveSlot[] = [];

    for (const s of cs) {
      const p = parseSaveSlot(s);
      if (p === null) {
        console.log(`Saves #${s.hashId} can not be parsed!, possibly data corruption`);
        continue;
      }

      r.push(p);
    }

    return r;
  } catch (e) {
    console.error("Cant get save data from indexedDB:", e);
  }
}

function deleteSaveCleanUp(t: Transaction) {
  const nl = [DBStoreName.DATA_VECTORS, DBStoreName.GRAPH_HEAD, DBStoreName.GRAPH_VECTOR];

  for (const name of nl) {
    const s = t.objectStore(name);
    const idx = s.index("worldId");
  }
}

export async function deleteSave(saveHash: number): Promise<void> {
  try {
    const db = await database.open();
    const t = db.transaction(
      [
        DBStoreName.WORLD,
        DBStoreName.DATA_VECTORS,
        DBStoreName.GRAPH_HEAD,
        DBStoreName.GRAPH_VECTOR,
      ],
      "readwrite",
    );

    t.objectStore(DBStoreName.WORLD).delete(saveHash);
  } catch {
    console.error("Can not delete save of hash: ", saveHash);
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [
        DEP_DBStoreName.SAVES,
        DEP_DBStoreName.TURN_VECTORS,
        DEP_DBStoreName.SUMMARY_VECTORS,
        DEP_DBStoreName.ENTITY_VECTORS,
        DEP_DBStoreName.GRAPH_NODES,
        DEP_DBStoreName.GRAPH_EDGES,
      ],
      "readwrite",
    );

    // Xóa save slot
    transaction.objectStore(DEP_DBStoreName.SAVES).delete(saveId);

    // Xóa các vector liên quan
    const deleteFromStore = (storeName: string) => {
      const store = transaction.objectStore(storeName);
      const index = store.index("worldId");
      const request = index.openKeyCursor(IDBKeyRange.only(saveId));
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    };

    deleteFromStore(DEP_DBStoreName.TURN_VECTORS);
    deleteFromStore(DEP_DBStoreName.SUMMARY_VECTORS);
    deleteFromStore(DEP_DBStoreName.ENTITY_VECTORS);
    deleteFromStore(DEP_DBStoreName.GRAPH_NODES);
    deleteFromStore(DEP_DBStoreName.GRAPH_EDGES);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      console.error("Lỗi khi xóa save và các vector liên quan từ IndexedDB:", transaction.error);
      reject("Không thể xóa file lưu và dữ liệu liên quan.");
    };
  });
}

export async function trimSaves(maxSaves: number): Promise<void> {
  const allSaves = await getAllSaves();
  if (allSaves.length > maxSaves) {
    const savesToDelete = allSaves.slice(maxSaves);
    for (const save of savesToDelete) {
      await deleteSave(save.saveId);
    }
  }
}

// --- Fandom File Functions ---

export async function addFandomFile(file: FandomFile): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.FANDOM, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.FANDOM);
    const request = store.put(file);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể lưu tệp nguyên tác.");
  });
}

export async function getAllFandomFiles(): Promise<FandomFile[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.FANDOM, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.FANDOM);
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.id - a.id));
    };
    request.onerror = () => reject("Không thể tải các tệp nguyên tác.");
  });
}

export async function deleteFandomFile(id: number): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.FANDOM, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.FANDOM);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể xóa tệp nguyên tác.");
  });
}

// --- Vector Store Functions ---

// Turn Vectors
export async function addTurnVector(vector: TurnVector): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.TURN_VECTORS, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.TURN_VECTORS);
    const request = store.put(vector);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể lưu vector lượt chơi.");
  });
}

export async function getAllTurnVectors(worldId: string): Promise<TurnVector[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.TURN_VECTORS, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.TURN_VECTORS);
    const index = store.index("worldId");
    const request = index.getAll(worldId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Không thể tải vector lượt chơi.");
  });
}

// Summary Vectors
export async function addSummaryVector(vector: SummaryVector): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.SUMMARY_VECTORS, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.SUMMARY_VECTORS);
    const request = store.put(vector);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể lưu vector tóm tắt.");
  });
}

export async function getAllSummaryVectors(worldId: string): Promise<SummaryVector[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.SUMMARY_VECTORS, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.SUMMARY_VECTORS);
    const index = store.index("worldId");
    const request = index.getAll(worldId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Không thể tải vector tóm tắt.");
  });
}

// --- Entity Vector Functions ---

export async function addEntityVector(vector: EntityVector): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.ENTITY_VECTORS, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.ENTITY_VECTORS);
    const request = store.put(vector);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể lưu vector thực thể.");
  });
}

export async function getAllEntityVectors(worldId: string): Promise<EntityVector[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.ENTITY_VECTORS, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.ENTITY_VECTORS);
    const index = store.index("worldId");
    const request = index.getAll(worldId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Không thể tải vector thực thể.");
  });
}

export async function deleteEntityVector(id: string): Promise<void> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.ENTITY_VECTORS, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.ENTITY_VECTORS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Không thể xóa vector thực thể.");
  });
}

// --- Graph Store Functions ---

export async function addGraphNodes(nodes: (GraphNode & { worldId: string })[]): Promise<void> {
  if (nodes.length === 0) return;
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.GRAPH_NODES, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.GRAPH_NODES);
    let completed = 0;
    let errors = false;

    nodes.forEach((node) => {
      const request = store.put(node);
      request.onsuccess = () => {
        completed++;
        if (completed === nodes.length) resolve();
      };
      request.onerror = () => {
        errors = true;
        console.error("Error adding graph node:", request.error);
      };
    });

    transaction.oncomplete = () => {
      if (!errors && completed !== nodes.length) resolve(); // Resolve if transaction completes
    };
    transaction.onerror = () => reject("Error storing graph nodes");
  });
}

export async function addGraphEdges(edges: (GraphEdge & { worldId: string })[]): Promise<void> {
  if (edges.length === 0) return;
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.GRAPH_EDGES, "readwrite");
    const store = transaction.objectStore(DEP_DBStoreName.GRAPH_EDGES);
    let completed = 0;

    edges.forEach((edge) => {
      store.put(edge);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Error storing graph edges");
  });
}

export async function getGraphEdgesBySource(
  worldId: string,
  sourceId: string,
): Promise<GraphEdge[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.GRAPH_EDGES, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.GRAPH_EDGES);
    const index = store.index("source");
    // Composite key search isn't directly supported by simple index,
    // we get all by source then filter by worldId.
    // Optimization: Create a compound index if performance degrades.
    const request = index.getAll(sourceId);

    request.onsuccess = () => {
      const edges = (request.result as (GraphEdge & { worldId: string })[]).filter(
        (e) => e.worldId === worldId,
      );
      resolve(edges);
    };
    request.onerror = () => reject("Error fetching graph edges");
  });
}

export async function getGraphEdgesByTarget(
  worldId: string,
  targetId: string,
): Promise<GraphEdge[]> {
  const db = await database.open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DEP_DBStoreName.GRAPH_EDGES, "readonly");
    const store = transaction.objectStore(DEP_DBStoreName.GRAPH_EDGES);
    const index = store.index("target");
    const request = index.getAll(targetId);

    request.onsuccess = () => {
      const edges = (request.result as (GraphEdge & { worldId: string })[]).filter(
        (e) => e.worldId === worldId,
      );
      resolve(edges);
    };
    request.onerror = () => reject("Error fetching graph edges");
  });
}
