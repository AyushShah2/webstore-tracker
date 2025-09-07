import type { Product, ScraperDB } from "~lib/db/scraperDB";

export abstract class BaseScraper<T extends Product> {
    private db: ScraperDB<T>

    constructor(db: ScraperDB<T>) {
        this.db = db
    }

    protected abstract getData(): Promise<Record<string, unknown>[]>
    protected abstract parseData(data: Record<string, unknown>): T
    protected abstract mergeData(parsedData: T, oldData: T): T
    
    public async scrape() {
        for (const data of await this.getData()) {
            const parsedData = this.parseData(data)
            const oldData = await this.db.getProductByKey(parsedData.key)
            const mergedData = this.mergeData(parsedData, oldData)
            await this.db.addOrUpdateProduct(mergedData)
        }
    }
}