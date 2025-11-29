import browser from "webextension-polyfill"

import { getTodayDateString } from "~lib/common"
import { NikeScraper } from "~lib/scrapers/nikeScraper"
import { loadSettings } from "~lib/settings/settings"
import { STORES } from "~lib/settings/stores"

export {}

const dailyScrapeAlarmName = "dailyCheck"

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
  browser.alarms.create(dailyScrapeAlarmName, { periodInMinutes: 1440 })
}

browser.runtime.onStartup.addListener(async () => {
  console.log("Checking if alarm is present...")
  const alarm = await browser.alarms.get(dailyScrapeAlarmName)
  if (!alarm) {
    console.log("Alarm not present, creating...")
    scheduleDaily()
  }
})

browser.runtime.onInstalled.addListener(() => {
  console.log("Webstore Tracker installed")
  scheduleDaily()
  ensureDailyBatch()
})

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === dailyScrapeAlarmName) ensureDailyBatch()
})
