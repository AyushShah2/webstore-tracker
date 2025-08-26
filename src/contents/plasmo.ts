import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"],
  css: ["./inject/general.css", "./inject/nike/extra.css"]
}

const loadHtml = 
`<div id="injectContainer">
  <div id="injectedLoad"></div>
</div>`

window.addEventListener("load", async () => {
  document.getElementById("exclusionMsg").insertAdjacentHTML("beforebegin", loadHtml)
  const injectedLoadElem = document.getElementById("injectedLoad")
  
})


