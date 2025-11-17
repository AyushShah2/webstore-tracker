import { BaseDB, type DBItem, type IndexProps } from "./baseDB"

export interface Product extends DBItem {
  priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
  link: string
}

export interface ScraperDBSpec {
  storeName: string
  version: number
  indexes: IndexProps[]
}

export class ScraperDB<T extends Product> {
  private db: BaseDB<T>
  private static DB_NAME = "webstore-tracker"
  private storeName: string
  private version: number
  private indexes: IndexProps[]

  constructor(spec: ScraperDBSpec) {
    this.storeName = spec.storeName
    this.version = spec.version
    this.indexes = spec.indexes
  }

  private async init(): Promise<void> {
    if (!this.db) {
      this.db = await BaseDB.getBaseDB(ScraperDB.DB_NAME, this.version, [{ name: this.storeName, indexes: this.indexes }])
    }
  }

  async addOrUpdateProduct(item: T): Promise<boolean> {
    await this.init()
    return this.db.addOrUpdateItem(this.storeName, item)
  }

  async getProductByKey(key: string): Promise<T | null> {
    await this.init()
    return this.db.getItemByKey(this.storeName, key)
  }

  async getRecordByIndex(indexName: string, key: string): Promise<T | null> {
    await this.init()
    return this.db.getItemByIndex(this.storeName, indexName, key)
  }

  async size(): Promise<number | null> {
    await this.init()
    return this.db.size(this.storeName)
  }
}
