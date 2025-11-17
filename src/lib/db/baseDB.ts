import { printError } from "~lib/common"

export interface ObjectStore {
  name: string
  indexes?: Array<IndexProps>
}

export interface IndexProps {
  indexName: string
  keyPath: string | string[]
  unique?: boolean
}

export type DBUpgrader = (oldVersion: number, newVersion: number, db: IDBDatabase) => void

export interface DBItem {
  key: string
}

type TransactionAction = (store: IDBObjectStore) => IDBRequest<unknown>

export class BaseDB<S extends DBItem> {
  private static instanceMap: Map<string, BaseDB<DBItem>> = new Map()
  private db: IDBDatabase
  public readonly DB_NAME: string
  public readonly DB_VERSION: number

  private constructor(dbName: string, dbVersion: number) {
    this.DB_NAME = dbName
    this.DB_VERSION = dbVersion
  }

  static async getBaseDB<T extends DBItem>(dbName: string, dbVersion: number, stores: ObjectStore[], upgradeDB?: DBUpgrader): Promise<BaseDB<T>> {
    let instance = BaseDB.instanceMap.get(dbName)

    if (!instance || instance.DB_VERSION < dbVersion) {
      instance = new BaseDB(dbName, dbVersion)
      const db = await this.openDB(dbName, dbVersion, stores, upgradeDB)
      instance.db = db
      BaseDB.instanceMap.set(dbName, instance)
    }
    // if caller specifies that it is containing items of type T, then we should probably believe them
    return instance as BaseDB<T>
  }

  private static async openDB(dbName: string, dbVersion: number, stores: ObjectStore[], upgradeDB?: DBUpgrader): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onupgradeneeded = (event) => {
        const db = request.result
        switch (event.oldVersion) {
          case 0:
            for (const store of stores) {
              // we can use 'key' here, since the types of stuff we store must extend DBItem
              const createdStore = db.createObjectStore(store.name, {
                keyPath: "key",
              })
              if (store.indexes) {
                store.indexes.forEach((index) => {
                  createdStore.createIndex(index.indexName, index.keyPath, {
                    unique: index.unique,
                  })
                })
              }
            }
            break
          default:
            // newVersion being null means db is being deleted
            if (upgradeDB && event.newVersion) {
              upgradeDB(event.oldVersion, event.newVersion, db)
            } else if (!upgradeDB) {
              reject(new Error("DB needs upgrade, but no upgrade handler was provided."))
            }
            break
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
      request.onblocked = () => {
        console.warn("Database upgrade blocked. Please close all other tabs using this database.")
      }
    })
  }

  async addOrUpdateItem(storeName: string, item: S): Promise<boolean> {
    const action: TransactionAction = (store) => store.put(item)

    const result = await this.makeObjectStoreRequest(storeName, "readwrite", action)
    return !!result
  }

  async getItemByKey(storeName: string, key: string): Promise<S | null> {
    const action: TransactionAction = (store) => store.get(key)

    const item = await this.makeObjectStoreRequest(storeName, "readonly", action)
    if (item && typeof item === "object") {
      return item as S
    }
    return null
  }

  async getItemByIndex(storeName: string, indexName: string, searchKey: string): Promise<S | null> {
    const action: TransactionAction = (store) => store.index(indexName)?.get(searchKey)

    const item = await this.makeObjectStoreRequest(storeName, "readonly", action)
    if (item && typeof item === "object") {
      return item as S
    }
    return null
  }

  async size(storeName: string): Promise<number | null> {
    const action: TransactionAction = (store) => store.count()

    const item = await this.makeObjectStoreRequest(storeName, "readonly", action)
    if (typeof item === "number") {
      return item
    }
    return null
  }

  private async makeObjectStoreRequest(storeName: string, mode: IDBTransactionMode, action: TransactionAction): Promise<unknown> {
    const trxn = this.db.transaction(storeName, mode)
    const store = trxn.objectStore(storeName)

    try {
      const result = await new Promise<unknown>((resolve, reject) => {
        const request = action(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      // wait for transaction auto-commit
      await new Promise<void>((resolve, reject) => {
        trxn.oncomplete = () => resolve()
        trxn.onerror = () => reject(trxn.error)
      })
      return result
    } catch (error: unknown) {
      if (Error.isError(error)) {
        printError(error)
        return null
      }
    }
  }
}
