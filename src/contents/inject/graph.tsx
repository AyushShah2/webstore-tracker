import * as Plot from "@observablehq/plot"
import { useEffect, useRef } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import type { Product, ScraperDBSpec } from "~lib/db/scraperDB"

type GraphElement = (SVGSVGElement | HTMLElement) & Plot.Plot

export default function Graph({ productKey, spec }: { productKey: string; spec: ScraperDBSpec }) {
  const graphDiv = useRef<HTMLDivElement>()

  useEffect(() => {
    let plot: GraphElement = null

    async function getAndAddGraph() {
      plot = await getGraphForItem(productKey, spec)
      graphDiv.current.append(plot)
    }
    getAndAddGraph()

    return () => {
      if (plot) {
        plot.remove()
      }
    }
  }, [productKey])

  return (
    <div>
      <button>Hello</button>
      <div ref={graphDiv}></div>
    </div>
  )
}

async function getGraphForItem(key: string, spec: ScraperDBSpec) {
  const priceData = ((await sendToBackground({ name: "getItem", body: { key: key, spec: spec } })).item as Product).priceHistory
  const dateToPrice = Object.entries(priceData).map((val) => [new Date(val[0]), val[1]])
  const plot = Plot.plot({
    height: 200,
    width: 400,
    marginBottom: 45,
    x: { label: "Date", labelArrow: null, interval: "day" },
    y: { label: "Price", grid: true, labelArrow: null },
    marks: [Plot.ruleY([0]), Plot.ruleX([priceData[0]]), Plot.line(dateToPrice, { stroke: "steelblue", tip: true })],
  })
  return plot
}
