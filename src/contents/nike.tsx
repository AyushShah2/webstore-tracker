import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useState } from "react"

import { NikeSpec } from "~lib/db/nikeDB"

import Graph from "./inject/graph"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["./inject/nike/extra.css"],
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector("div[data-testid='favorite-button']"),
  insertPosition: "beforebegin",
})

export default function NikeGraph() {
  const [key, setKey] = useState<string>(getKey(location.href))

  function getKey(link: string): string {
    let key: string
    for (const variant of JSON.parse(document.getElementById("__NEXT_DATA__").textContent)?.props?.pageProps?.colorwayImages) {
      if (variant?.pdpUrl === link) {
        key = variant?.globalProductId
      }
    }
    return key
  }

  for (const elem of document.querySelectorAll<HTMLAnchorElement>("a[data-testid^='colorway-link")) {
    elem.addEventListener("click", () => setKey(getKey(elem.href)))
  }

  return <Graph productKey={key} spec={NikeSpec} />
}
