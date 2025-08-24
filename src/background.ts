export { };
    import Browser from "webextension-polyfill";
    import { main as scrapeNikeV1 } from "~lib/nike/v1/scraper";
    import { loadSettings } from "~lib/settings";
    import { STORES, type StoreId } from "~lib/stores";

async function ensureDailyBatch(){
    STORES.forEach(async store => {
        const isActive: boolean = await isStoreEnabled(store.id);
        if (!isActive) return;
        const today = new Date();
        const formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(); //YYYY-MM-DD format

        const storeData = await Browser.storage.local.get(store.id);
        const lastScrapedDate = storeData?.lastScraped ?? " ";
        
        const storageKeyValue = {lastScraped: lastScrapedDate, isActive: isActive}
        await Browser.storage.local.set({[store.id]: storageKeyValue});

        if (lastScrapedDate === formattedDate) return;
        else{
            if(store.id === "nike"){
                console.log(lastScrapedDate);
                await scrapeNikeV1();
            }
            else{
                console.log("WRONG STORE ID")
            }
        }
        
    });
}

async function isStoreEnabled(storeId: StoreId): Promise<boolean> {
    const settings = await loadSettings();
    return settings.enabled?.[storeId];
}

function scheduleDaily() {
  // Runs every 24h from creation time.
  Browser.alarms.create("dailyCheck", { periodInMinutes: 1440 });
}

Browser.runtime.onInstalled.addListener(() => {
    console.log("Webstore Tracker installed");
    scheduleDaily();
    ensureDailyBatch();
});

Browser.runtime.onStartup.addListener(() => {
    console.log("Webstore Tracker startup check");
    scheduleDaily();
    ensureDailyBatch();
});

Browser.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "dailyCheck") ensureDailyBatch();
});
