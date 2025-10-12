import * as Plot from "@observablehq/plot"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { sendToBackground } from "@plasmohq/messaging"

import type { Product, ScraperDBSpec } from "~lib/db/scraperDB"

type GraphElement = (SVGSVGElement | HTMLElement) & Plot.Plot

export default function Graph({ productKey, spec, expandable }: { productKey: string; spec: ScraperDBSpec; expandable?: boolean }) {
  const graphDiv = useRef<HTMLDivElement>()
  const [showPopup, setShowPopup] = useState(false)

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
    <>
      <div id="graph-div">
        <div ref={graphDiv}></div>
        {expandable && (
          <button id="expand-graph" onClick={() => setShowPopup(true)}>
            <svg width="24px" height="24px" viewBox="0 0 16 16" version="1.1">
              <rect width="16" height="16" id="icon-bound" fill="none" />
              <path d="M3,5h4V3H1v12h12V9h-2v4H3V5z M16,8V0L8,0v2h4.587L6.294,8.294l1.413,1.413L14,3.413V8H16z" />
            </svg>
          </button>
        )}
        <RenderInWindow open={showPopup} setOpen={setShowPopup}>
          <Graph productKey={productKey} spec={spec} />
        </RenderInWindow>
      </div>
    </>
  )
}

// from https://stackoverflow.com/a/64391469
function RenderInWindow({ open, setOpen, children }) {
  const _window = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // If open, create window and store in ref
    if (open) {
      _window.current = window.open("", "", "width=600,height=400,left=200,top=200,popup")

      // Save reference to window for cleanup
      const curWindow = _window.current

      curWindow.onbeforeunload = () => {
        setReady(false)
        setOpen(false)
      }

      setReady(true)
      // Return cleanup function
    } else {
      _window.current?.close()
      setReady(false)
    }
  }, [open])

  return open && ready && createPortal(children, _window.current?.document.body)
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
