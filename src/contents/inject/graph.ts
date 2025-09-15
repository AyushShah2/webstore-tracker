import * as Plot from "@observablehq/plot"
import { sendToBackground } from "@plasmohq/messaging"
import type { Product } from "~lib/db/scraperDB"

export type HTMLSVGElement = HTMLElement & SVGElement

export async function getGraphForItem(key: string) {
    const priceData = ((await sendToBackground({ name: "getItem", body: { key: key } })).item as Product).priceHistory
    const dateToPrice = Object.entries(priceData).map((val) => [new Date(val[0]), val[1]])
    return Plot.plot({
        height: 500,
        width: 500,
        x: { label: "Date", labelArrow: null },
        y: { label: "Price", grid: true },
        marks: [
            Plot.line(dateToPrice, { stroke: "steelblue", tip: true })
        ]
    })
}