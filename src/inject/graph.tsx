import Chart from "chart.js/auto"

import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { sendToBackground } from "@plasmohq/messaging"

import type { Product, ScraperDBSpec } from "~lib/db/scraperDB"

export default function Graph({ productKey, spec, expandable }: { productKey: string; spec: ScraperDBSpec; expandable?: boolean }) {
  const graphDiv = useRef<HTMLDivElement>()
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    let canvas: HTMLCanvasElement = null

    async function getAndAddGraph() {
      canvas = document.createElement("canvas")
      graphDiv.current.append(canvas)
      await setGraphForItem(canvas, productKey, spec)
    }
    getAndAddGraph()

    return () => {
      if (canvas) {
        canvas.remove()
        canvas = null
      }
    }
  }, [productKey])

  return (
    <>
      <div id="graph-div">
        <div ref={graphDiv}></div>
        {expandable && (
          <>
            <button id="expand-graph" onClick={() => setShowPopup(true)}>
              <svg width="24px" height="24px" viewBox="0 0 16 16" version="1.1">
                <rect width="16" height="16" id="icon-bound" fill="none" />
                <path d="M3,5h4V3H1v12h12V9h-2v4H3V5z M16,8V0L8,0v2h4.587L6.294,8.294l1.413,1.413L14,3.413V8H16z" />
              </svg>
            </button>

            <RenderInWindow open={showPopup} setOpen={setShowPopup} width={600} height={400}>
              <Graph productKey={productKey} spec={spec} expandable={false} />
            </RenderInWindow>
          </>
        )}
      </div>
    </>
  )
}

// from https://stackoverflow.com/a/64391469
function RenderInWindow({ open, setOpen, width, height, children }) {
  const _window = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // If open, create window and store in ref
    if (open) {
      _window.current = window.open("", "", `width=${width},height=${height},left=0,top=0,popup`)

      const curWindow = _window.current

      curWindow.onbeforeunload = () => {
        setReady(false)
        setOpen(false)
      }

      // Popup window is ready
      setReady(true)
      // Return cleanup function
    } else {
      // If window is requested to be closed via "open" prop being set to false
      _window.current?.close()
      setReady(false)
    }
  }, [open])

  return open && ready && createPortal(children, _window.current?.document.body)
}

async function setGraphForItem(canvas: HTMLCanvasElement, key: string, spec: ScraperDBSpec) {
  const priceData = ((await sendToBackground({ name: "getItem", body: { key: key, spec: spec } })).item as Product).priceHistory
  console.log(priceData)
  new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Price",
          data: Object.entries(priceData).map((datapoint) => {
            return { x: datapoint[0], y: datapoint[1] }
          }),
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "dddd, MMMM DD, YYYY",
          },
        },
        y: {
          min: 0,
        },
      },
    },
  })
}
