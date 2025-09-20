import type { PlasmoCSConfig } from "plasmo"
import { getGraphForItem, GRAPH_ID } from "./inject/graph"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["./inject/nike/extra.css"]
}

window.addEventListener("load", async () => {
  const currentURL = location.href
  const urlToGPID = new Map<string, string>()
  for (const variant of JSON.parse(document.getElementById("__NEXT_DATA__").textContent)?.props?.pageProps?.colorwayImages) {
    urlToGPID.set(variant?.pdpUrl, variant?.globalProductId)
  }
  
  const graph = await getGraphForItem(urlToGPID.get(currentURL))
  
  document.querySelector("div[data-testid='favorite-button']").insertAdjacentElement("beforebegin", graph)

  for (const elem of document.querySelectorAll<HTMLAnchorElement>("a[data-testid^='colorway-link")) {
    elem.addEventListener("click", async () => {
      document.getElementById(GRAPH_ID).replaceWith(await getGraphForItem(urlToGPID.get(elem.href)))
    })
  }
})
