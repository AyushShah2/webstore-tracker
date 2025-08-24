import type { Product } from "./nike/v1/types";

import { type StoreId } from "~lib/stores";

const indexedDB = globalThis.indexedDB;
if (!indexedDB) {
    throw new Error("IndexedDB is not available in this environment.");
}

const DB_NAME = "webstore-tracker";
const DB_VERSION = 1;
let i = 1;
// any stores database should have this structure
export type StoreDef ={
    keyPath: string | string[];
    indexes?: Array<{name: string; keyPath: string | string[]; unique?: boolean}>;
}

export interface StoreMetadata {
    id : StoreId;                //"nike", "ae"
    name?: string;              //"Nike", "American Eagle"
    isActive?: boolean;
    lastScraped?: string;       //YYYY-MM-DD format
}

async function openDB(storeName: string, storeInfo: StoreDef): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath: storeInfo.keyPath });
                    if (storeInfo.indexes) {
                        storeInfo.indexes.forEach(index => {
                            store.createIndex(index.name, index.keyPath, { unique: index.unique });
                        });
                    }
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
                console.warn("Database upgrade blocked. Please close all other tabs using this database.");
            };
    });
}


export async function addOrUpdateProduct(storeName: string, storeInfo: StoreDef, product: Product): Promise<void> {
    const db = await openDB(storeName, storeInfo);
    try {
        const trxn = db.transaction(storeName, "readwrite");
        const store = trxn.objectStore(storeName);

        await new Promise<void>((resolve, reject) => {
            const request = store.put(product);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        await new Promise<void>((resolve, reject) => {
            trxn.oncomplete = () => {
                console.log(`(${i}) Product ${product.key} recorded successfully.`);
                i++;
                resolve();
            };
            trxn.onerror = () => reject(trxn.error);
        });
    } finally {
        db.close();
    }
}

export async function getRecordByKey(storeName: string, storeInfo: StoreDef, key: string): Promise<Product | undefined> {
    const db = await openDB(storeName, storeInfo);
    try {
        const trxn = db.transaction(storeName, "readonly");
        const store = trxn.objectStore(storeName);
        const result = await new Promise<any | undefined>((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        await new Promise<void>((resolve, reject) => {
            trxn.oncomplete = () => resolve();
            trxn.onerror = () => reject(trxn.error);
        });
        return result;
    } finally {
        db.close();
    }
}

export async function getRecordByIndex(storeName: string, storeInfo: StoreDef, indexName: string, searchKey: string): Promise<Product | undefined> {
    const db = await openDB(storeName, storeInfo);
    try {
        const trxn = db.transaction(storeName, "readonly");
        const store = trxn.objectStore(storeName);
        const result = await new Promise<Product | undefined>((resolve, reject) => {
            const request = store.index(indexName)?.get(searchKey);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        await new Promise<void>((resolve, reject) => {
            trxn.oncomplete = () => resolve();
            trxn.onerror = () => reject(trxn.error);
        });
        return result;
    } finally {
        db.close();
    }
}