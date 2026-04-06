import { compress, decompress } from "#/utils/compress.ts";
import { getHasher, Bigint2Hex } from "#/utils/hashing.ts";
import { randomBigInt } from "#/utils/random.ts";
import { Bigint2Base64 } from "../../utils/hashing.ts";

type CompressedSaveDataBase = {
  dataChecksum: string;
  seed: string;
  data: string;
  hashId: string;
};

export type CompressedSaveSlot = {
  worldId: string;
  saveTime: string;
} & CompressedSaveDataBase;

export function processSaveSlot(data: SaveSlot): CompressedSaveSlot {
  const hasher = getHasher();
  const seed = randomBigInt(64);
  const header = hasher.h64(`${data.worldId}/${data.saveDate}/${seed}`, seed);

  const comp = compress(JSON.stringify(data, null, 0));

  const checksum = hasher.h64(comp, seed);

  return {
    // this wont do shit, just to prevent collision
    hashId: Bigint2Base64(header),
    worldId: data.worldId!,
    saveTime: data.saveDate,
    dataChecksum: Bigint2Base64(checksum),
    seed: Bigint2Hex(seed, false),
    data: comp,
  };
}

export function processSaveSlotMultiple(saves: SaveSlot[]): CompressedSaveSlot[] {
  const hasher = getHasher();
  const l = saves.length;
  const arr: CompressedSaveSlot[] = [];

  for (let i = 0; i < l; i++) {
    const data = saves[i];
    const seed = randomBigInt(64);
    const header = hasher.h64(`${data.worldId}/${data.saveDate}/${seed}`, seed);

    const comp = compress(JSON.stringify(data, null, 0));
    const checksum = hasher.h64(comp, seed);

    arr.push({
      // this wont do shit, just to prevent collision
      hashId: Bigint2Base64(header),
      worldId: data.worldId!,
      saveTime: data.saveDate,
      dataChecksum: Bigint2Base64(checksum),
      seed: Bigint2Hex(seed, false),
      data: comp,
    });
  }

  return arr;
}

export function parseSaveSlot(compressed: CompressedSaveSlot): SaveSlot | null {
  const hasher = getHasher();
  const seed = BigInt(compressed.seed[1] !== "x" ? `0x${compressed.seed}` : compressed.seed);

  const checksum = Bigint2Base64(hasher.h64(compressed.data, seed));
  if (compressed.dataChecksum !== checksum) {
    return null;
  }

  const saveSlot = JSON.parse(decompress(compressed.data));

  return saveSlot;
}

export function parseSaveSlotMultiple(compresses: CompressedSaveSlot[]): SaveSlot[] {
  const hasher = getHasher();
  const l = compresses.length;
  const arr: SaveSlot[] = [];
  for (let i = 0; i < l; i++) {
    const saves = compresses[i];
    const seed = BigInt(saves.seed[1] !== "x" ? `0x${saves.seed}` : saves.seed);

    const checksum = Bigint2Base64(hasher.h64(saves.data, seed));
    if (saves.dataChecksum !== checksum) {
      throw new Error("Data mismatch, likely tampered with or suffered data corruption");
    }

    arr.push(JSON.parse(decompress(saves.data)));
  }

  return arr;
}
