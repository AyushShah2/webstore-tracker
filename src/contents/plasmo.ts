import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/ca/t/*"]
}

const loadHtml = `<div style="border: 16px solid #f3f3f3; 
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;" id="injectedLoad"></div>`

window.addEventListener("load", async () => {
  document.getElementById("exclusionMsg").insertAdjacentHTML("beforebegin", loadHtml)
  const injectedLoadElem = document.getElementById("injectedLoad")
})


