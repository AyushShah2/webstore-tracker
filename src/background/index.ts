import browser from "webextension-polyfill"

import { getTodayDateString } from "~common"
import scrapeNikeV1 from "~lib/scrapers/nike/v1/nikeScraper"
import { loadSettings } from "~lib/settings"
import { STORES } from "~lib/stores"

export {}

async function ensureDailyBatch() {
  const settings = await loadSettings()
  STORES.forEach(async (store) => {
    const storeId = store.id
    const isActive: boolean = settings.enabled?.[storeId]
    if (!isActive) return
    const formattedDate = getTodayDateString()

    const { lastScraped } = await browser.storage.local.get({ storeId: { lastScraped: "" } })
    console.log(lastScraped)

    if (lastScraped === "" || lastScraped !== formattedDate) {
      switch (store.id) {
        case "nike":
          await scrapeNikeV1()
          browser.storage.local.set({ storeId: { lastScraped: formattedDate } })
          break
      }
    }
  })
}

function scheduleDaily() {
  // Runs every 24h from creation time.
  browser.alarms.create("dailyCheck", { periodInMinutes: 1440 })
}

browser.runtime.onInstalled.addListener(() => {
  console.log("Webstore Tracker installed")
  scheduleDaily()
  ensureDailyBatch()
})

// Just for testing, should remove
browser.runtime.onStartup.addListener(() => {
  ensureDailyBatch()
})

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyCheck") ensureDailyBatch()
})
