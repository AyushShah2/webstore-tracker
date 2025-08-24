export { };
import browser from "webextension-polyfill";
import scrapeNikeV1 from "~lib/nike/v1/nikeScraper";
import { loadSettings } from "~lib/settings";
import { STORES, type StoreId } from "~lib/stores";

async function ensureDailyBatch(){
    STORES.forEach(async store => {
        const isActive: boolean = await isStoreEnabled(store.id);
        if (!isActive) return;
        const today = new Date();
        const formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(); //YYYY-MM-DD format

        const storeData = await browser.storage.local.get(store.id);
        const lastScrapedDate = storeData?.lastScraped ?? " ";
        
        const storageKeyValue = {lastScraped: lastScrapedDate, isActive: isActive}
        await browser.storage.local.set({[store.id]: storageKeyValue});

        if (lastScrapedDate === formattedDate) return;
        else {
            console.log(lastScrapedDate);
            await scrapeNikeV1();
        }
        
    });
}

async function isStoreEnabled(storeId: StoreId): Promise<boolean> {
    const settings = await loadSettings();
    return settings.enabled?.[storeId];
}

function scheduleDaily() {
  // Runs every 24h from creation time.
  browser.alarms.create("dailyCheck", { periodInMinutes: 1440 });
}

browser.runtime.onInstalled.addListener(() => {
    console.log("Webstore Tracker installed");
    scheduleDaily();
    ensureDailyBatch();
});

browser.runtime.onStartup.addListener(() => {
    console.log("Webstore Tracker startup check");
    scheduleDaily();
    ensureDailyBatch();
});
browser.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "dailyCheck") ensureDailyBatch();
});
