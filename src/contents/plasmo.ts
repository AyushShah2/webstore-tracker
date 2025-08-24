import type { PlasmoCSConfig } from "plasmo"
import browser from 'webextension-polyfill'
import { SCRAPER_STATUS_KEY } from "~background/store"

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

  const scraperStatus: boolean = await browser.storage.sync.get({ SCRAPER_STATUS_KEY: false })[SCRAPER_STATUS_KEY]
  if (!scraperStatus) {
    browser.storage.onChanged.addListener(
      (changes: Record<string, browser.Storage.StorageChange>, area: string) => {
        if (area === "sync" && !changes?.SCRAPER_STATUS_KEY.oldValue && changes?.SCRAPER_STATUS_KEY.newValue) {
            // injectedLoadElem.replaceWith()
        }
      }
    )
  }
})


