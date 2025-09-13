import type { PlasmoCSConfig } from "plasmo"
import { getGraphForItem } from "./inject/graph"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["./inject/nike/extra.css"]
}

window.addEventListener("load", async () => {
  const key = document.getElementById("__NEXT_DATA__").textContent.match('"globalProductId":"(?<key>[a-z\-0-9]+)"')?.groups["key"];
  const graph = await getGraphForItem(key)
  document.querySelector("div[data-testid='favorite-button']").insertAdjacentElement("beforebegin", graph)
})


