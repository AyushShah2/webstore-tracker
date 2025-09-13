import type { IndexProps } from "./baseDB";
import { ScraperDB, type Product } from "./scraperDB";

export interface NikeProduct extends Product {
    groupKey: string,
    productCode: string
}

export class NikeDB extends ScraperDB<NikeProduct> {
    constructor() {
        const indexes: IndexProps[] = [
            { indexName: "groupKey", keyPath: "groupKey", unique: false },
            { indexName: "productCode", keyPath: "productCode", unique: true }
        ]
        super('nike', 1, indexes)
    }
}
