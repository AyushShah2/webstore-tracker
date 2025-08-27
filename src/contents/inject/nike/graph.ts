import * as Plot from "@observablehq/plot"
import type { StoreId } from "~lib/stores"
import { getRecordByKey, type StoreDef } from "~lib/useDB"

export type HTMLSVGElement = HTMLElement & SVGElement

// Should remove this, and not require this argument in the future
// Also this only works for Nike I guess
const STORE_NAME: StoreId = "nike"
const STORE_INFO: StoreDef = {
    keyPath: "key",
    indexes: [
        { name: "groupKey", keyPath: "groupKey", unique: false },
        { name: "productCode", keyPath: "productCode", unique: true }
    ]
}

export async function getGraphForItem(key: string) {
    const priceData = (await getRecordByKey(STORE_NAME, STORE_INFO, key)).priceHistory;
    return Plot.line(Object.entries(priceData), { stroke: "steelblue", tip: true }).plot({y: { grid: true }})
}