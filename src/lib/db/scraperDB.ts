import { BaseDB, type DBItem, type DBUpgrader, type IndexProps } from "./baseDB"

export interface Product extends DBItem {
  priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
  link: string
}

export interface ScraperDBSpec {
  storeName: string
  version: number
  indexes?: IndexProps[]
  dbUpgrader?: DBUpgrader
}

export class ScraperDB<T extends Product> {
  private db: BaseDB<T>
  private static DB_NAME = "webstore-tracker"
  private storeName: string
  private version: number
  private upgrader: DBUpgrader | undefined
  private indexes: IndexProps[] | undefined

  constructor(spec: ScraperDBSpec) {
    this.storeName = spec.storeName
    this.version = spec.version
    this.indexes = spec?.indexes
    this.upgrader = spec?.dbUpgrader
  }

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await BaseDB.getBaseDB(ScraperDB.DB_NAME, this.version, [{ name: this.storeName, indexes: this.indexes }], this.upgrader)
    }
  }

  ready(): boolean {
    return !!this.db
  }

  async addOrUpdateProduct(item: T): Promise<boolean> {
    return this.db.addOrUpdateItem(this.storeName, item)
  }

  async getProductByKey(key: string): Promise<T | null> {
    return this.db.getItemByKey(this.storeName, key)
  }

  async getRecordByIndex(indexName: string, key: string): Promise<T | null> {
    return this.db.getItemByIndex(this.storeName, indexName, key)
  }

  async size(): Promise<number | null> {
    return this.db.size(this.storeName)
  }
}
