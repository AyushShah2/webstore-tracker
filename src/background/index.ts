import browser from "webextension-polyfill"

import { getTodayDateString } from "~lib/common"
import { NikeScraper } from "~lib/scrapers/nike/v1/nikeScraper"
import { loadSettings } from "~lib/settings/settings"
import { STORES } from "~lib/settings/stores"

export {}

async function ensureDailyBatch() {
  const settings = await loadSettings()
  STORES.forEach(async (store) => {
    const storeId = store.id
    const isActive: boolean = settings.enabled?.[storeId]
    if (!isActive) return
    const formattedDate = getTodayDateString()

    const { lastScraped } = (await browser.storage.local.get({ [storeId]: { lastScraped: "" } })) as { lastScraped: string }

    if (lastScraped === "" || lastScraped !== formattedDate) {
      switch (storeId) {
        case "nike":
          await new NikeScraper().scrape()
          browser.storage.local.set({ [storeId]: { lastScraped: formattedDate } })
          break
      }
    }
  })
}

function scheduleDaily() {
  // Runs every 24h from creation time.
  browser.alarms.create("dailyCheck", { periodInMinutes: 1440 })
}

browser.runtime.onStartup.addListener(() => {
  ensureDailyBatch()
})

browser.runtime.onInstalled.addListener(() => {
  console.log("Webstore Tracker installed")
  scheduleDaily()
  ensureDailyBatch()
})

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyCheck") ensureDailyBatch()
})
