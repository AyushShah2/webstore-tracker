import * as Plot from "@observablehq/plot"
import { sendToBackground } from "@plasmohq/messaging"

export type HTMLSVGElement = HTMLElement & SVGElement

export async function getGraphForItem(key: string) {
    const priceData = (await sendToBackground({ name: "getItem", body: { key: key } })).item.priceHistory
    return Plot.line(Object.entries(priceData).map((val: [string, number]) => [new Date(val[0]), val[1]]), { stroke: "steelblue", tip: true }).plot({y: { grid: true }, height: 500, width: 500})
}