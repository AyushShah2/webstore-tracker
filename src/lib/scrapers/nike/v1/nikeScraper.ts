import { getTodayDateString } from "~lib/common";
import { NikeDB, type NikeProduct } from "~lib/db/nikeDB";
import { BaseScraper } from "~lib/scrapers/BaseScraper";

export class NikeScraper extends BaseScraper<NikeProduct> {
    private readonly BASE_URL: string
    private readonly BASE_PARAMS: object
    private readonly COUNT: number

    constructor() {
        super(new NikeDB());
        this.BASE_URL = "https://api.nike.com/discover/product_wall/v1/marketplace/CA/language/en-GB/consumerChannelId/d9a5bc42-4b9c-4976-858a-f159cf99c647"
        this.BASE_PARAMS = { path: "/ca/w", queryType: "PRODUCTS" }
        this.COUNT = 100
    }

    private async getNikeProductInfo(anchor: number, count: number): Promise<Response> {
        const params = { ...this.BASE_PARAMS, anchor: `${anchor}`, count: `${count}` }
        const queryString = new URLSearchParams(params).toString()
        const fullUrl = `${this.BASE_URL}?${queryString}`
        return await fetch(fullUrl, {
            method: "GET",
            headers: { "nike-api-caller-id": "nike:dotcom:browse:wall.client:2.0" },
        })
    }

    protected async getData(): Promise<Record<string, unknown>[]> {
        let total: number;
        let products: Record<string, unknown>[] = []

        let anchor: number = 0;
        do {
            const response = await (await this.getNikeProductInfo(anchor, this.COUNT)).json()
            if (!total) { total = response?.pages?.totalResources }
            for (const group of response?.productGroupings) {
                products = products.concat(group?.products)
            }
            
            anchor += this.COUNT
        } while (anchor < total)
        return products
    }

    protected parseData(data: Record<string, unknown>): NikeProduct {
        return {
            key: data?.globalProductId,
            priceHistory: {
                [getTodayDateString()]: (data?.prices as { currentPrice: number })?.currentPrice,
            },
            groupKey: data?.groupKey,
            productCode: data?.productCode,
            link: (data?.pdpUrl as { url: string })?.url,
        } as NikeProduct
    }

    protected mergeData(parsedData: NikeProduct, oldData: NikeProduct): NikeProduct {
        return {...parsedData, priceHistory: { ...oldData?.priceHistory, ...parsedData.priceHistory }}
    }
}