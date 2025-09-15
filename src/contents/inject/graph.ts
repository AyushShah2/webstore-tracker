import * as Plot from "@observablehq/plot"
import { sendToBackground } from "@plasmohq/messaging"
import type { Product } from "~lib/db/scraperDB"

export type HTMLSVGElement = HTMLElement & SVGElement

export async function getGraphForItem(key: string) {
    const priceData = ((await sendToBackground({ name: "getItem", body: { key: key } })).item as Product).priceHistory
    const dateToPrice = Object.entries(priceData).map((val) => [new Date(val[0]), val[1]])
    return Plot.plot({
        height: 300,
        width: 600,
        marginBottom: 45,
        x: { label: "Date", labelArrow: null, interval: 'day' },
        y: { label: "Price", grid: true, labelArrow: null },
        marks: [
            Plot.ruleY([0]),
            Plot.ruleX([priceData[0]]),
            Plot.line(dateToPrice, { stroke: "steelblue", tip: true })
        ]
    })
}