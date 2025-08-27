import type { Product } from "~common";

export interface NikeProduct extends Product {
    groupKey: string,
    productCode: string
}