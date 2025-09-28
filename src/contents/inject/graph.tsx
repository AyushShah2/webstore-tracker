import * as Plot from "@observablehq/plot"
import { sendToBackground } from "@plasmohq/messaging"
import { useEffect, useRef } from "react"
import type { Product } from "~lib/db/scraperDB"

type GraphElement = (SVGSVGElement | HTMLElement) & Plot.Plot

export default function Graph({ productKey }: { productKey: string }) {
    const graphDiv = useRef<HTMLDivElement>();

    useEffect(() => {
        let plot: GraphElement = null;

        async function getAndAddGraph() {
            plot = await getGraphForItem(productKey)
            graphDiv.current.append(plot)
        }
        getAndAddGraph()
        
        return () => { if (plot) { plot.remove() } }
    }, [productKey])

    return (
        <div>
            <button>Hello</button>
            <div ref={graphDiv}></div>
        </div>
    )
}

async function getGraphForItem(key: string) {
    const priceData = ((await sendToBackground({ name: "getItem", body: { key: key } })).item as Product).priceHistory
    const dateToPrice = Object.entries(priceData).map((val) => [new Date(val[0]), val[1]])
    const plot = Plot.plot({
        height: 200,
        width: 400,
        marginBottom: 45,
        x: { label: "Date", labelArrow: null, interval: 'day' },
        y: { label: "Price", grid: true, labelArrow: null },
        marks: [
            Plot.ruleY([0]),
            Plot.ruleX([priceData[0]]),
            Plot.line(dateToPrice, { stroke: "steelblue", tip: true })
        ]
    })
    return plot
}