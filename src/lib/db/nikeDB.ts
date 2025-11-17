import { type Product, type ScraperDBSpec } from "./scraperDB"

export interface NikeProduct extends Product {
  groupKey: string
  productCode: string
}

export const NikeSpec: ScraperDBSpec = {
  storeName: "nike",
  version: 1,
  indexes: [
    { indexName: "groupKey", keyPath: "groupKey", unique: false },
    { indexName: "productCode", keyPath: "productCode", unique: true },
  ],
}
