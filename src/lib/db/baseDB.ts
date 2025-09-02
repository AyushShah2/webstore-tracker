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

type TransactionAction = (store: IDBObjectStore, setResult: (res: unknown) => void) => Promise<void>

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
            if (upgradeDB) {
              upgradeDB(event.oldVersion, event.newVersion, db)
            } else {
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

  async addOrUpdateItem(storeName: string, item: S): Promise<void> {
    const action: TransactionAction = async (store, setResult) => {
      const result = await new Promise<void>((resolve, reject) => {
        const request = store.put(item)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      setResult(result)
    }

    return await this.makeTransaction(storeName, "readwrite", action) as void
  }

  async getItemByKey(storeName: string, key: string): Promise<S | undefined> {
    const action: TransactionAction = async (store, setResult) => {
      const result = await new Promise<S | undefined>((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      setResult(result)
    }

    return await this.makeTransaction(storeName, "readonly", action) as S | undefined
  }

  async getItemByIndex(storeName: string, indexName: string, searchKey: string): Promise<S | undefined> {
    const action: TransactionAction = async (store, setResult) => {
      const result = await new Promise<S | undefined>((resolve, reject) => {
        const request = store.index(indexName)?.get(searchKey)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      setResult(result)
    }

    return await this.makeTransaction(storeName, "readonly", action) as S | undefined
  }

  async size(storeName: string): Promise<number> {
    const action: TransactionAction = async (store, setResult) => {
      const result = await new Promise<number>((resolve, reject) => {
        const request = store.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      setResult(result)
    }
    
    return await this.makeTransaction(storeName, "readonly", action) as number
  }

  async makeTransaction(storeName: string, mode: IDBTransactionMode, action: TransactionAction): Promise<unknown> {
    const trxn = this.db.transaction(storeName, mode)
    const store = trxn.objectStore(storeName)

    let result: unknown;
    const setFunction = (res: unknown) => result = res
    await action(store, setFunction)

    await new Promise<void>((resolve, reject) => {
      trxn.oncomplete = () => resolve()
      trxn.onerror = () => reject(trxn.error)
    })
    return result;
  }
}
