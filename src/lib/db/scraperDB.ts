import { BaseDB, type DBItem, type IndexProps } from "./baseDB"

export interface Product extends DBItem {
  priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
  link: string
}

export class ScraperDB<T extends Product> {
  private db: BaseDB<T>
  private DB_NAME = "webstore-tracker"
  private storeName: string
  private version: number
  private indexes: IndexProps[]

  constructor(storeName: string, version: number, indexes?: IndexProps[]) {
    this.storeName = storeName
    this.version = version
    this.indexes = indexes
  }

  private async init(): Promise<void> {
    if (!this.db) {
      this.db = await BaseDB.getBaseDB(this.DB_NAME, this.version, [{ name: this.storeName, indexes: this.indexes }])
    }
  }

  async addOrUpdateProduct(item: T): Promise<void> {
    await this.init()
    return this.db.addOrUpdateItem(this.storeName, item)
  }

  async getProductByKey(key: string): Promise<T> {
    await this.init()
    return this.db.getItemByKey(this.storeName, key)
  }

  async getRecordByIndex(indexName: string, key: string): Promise<T> {
    await this.init()
    return this.db.getItemByIndex(this.storeName, indexName, key)
  }

  async size(): Promise<number> {
    await this.init()
    return this.db.size(this.storeName)
  }
}
