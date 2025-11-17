import styleText from "data-text:~inject/graph.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from "plasmo"
import { useState } from "react"

import { NikeSpec } from "~lib/db/nikeDB"

import Graph from "../inject/graph"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["../inject/nike/extra.css"],
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () => ({
  element: document.querySelector("div[data-testid='favorite-button']") as Element,
  insertPosition: "beforebegin",
})

export default function NikeGraph() {
  const [key, setKey] = useState<string | null>(getKey(location.href))

  function getKey(link: string): string | null {
    let key: string | null = null
    const nikeData = document.getElementById("__NEXT_DATA__")?.textContent
    if (nikeData) {
      for (const variant of JSON.parse(nikeData)?.props?.pageProps?.colorwayImages) {
        if (variant?.pdpUrl === link) {
          key = variant?.globalProductId
        }
      }
    }
    return key
  }

  for (const elem of document.querySelectorAll<HTMLAnchorElement>("a[data-testid^='colorway-link")) {
    elem.addEventListener("click", () => setKey(getKey(elem.href)))
  }

  return key ? <Graph productKey={key} spec={NikeSpec} expandable={true} /> : <p>Could not find data for this product.</p>
}
