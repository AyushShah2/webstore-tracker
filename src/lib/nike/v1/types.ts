export interface Product {
    key: string,
    priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
}

export interface NikeProduct extends Product{
    groupKey: string,
    productCode: string
}