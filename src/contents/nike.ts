import type { PlasmoCSConfig } from "plasmo"
import { getGraphForItem } from "./inject/graph"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["./inject/nike/extra.css"]
}

window.addEventListener("load", async () => {
  const variantData = JSON.parse(document.getElementById("__NEXT_DATA__").textContent)?.props?.pageProps?.colorwayImages
  let key: string;
  for (const variant of variantData) {
    if (variant?.pdpUrl === location.href) {
      key = variant?.globalProductId
    }
  }
  const graph = await getGraphForItem(key)
  document.querySelector("div[data-testid='favorite-button']").insertAdjacentElement("beforebegin", graph)
})


