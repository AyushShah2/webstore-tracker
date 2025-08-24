export interface NikeProduct {
    globalProductId: string,
    groupKey: string,
    productCode: string,
    priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
    lastUpdated: string // format YYYY-MM-DD
}