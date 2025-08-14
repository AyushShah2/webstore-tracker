import { STORES, type StoreId } from "./stores";

export interface Settings {
    version: 1
    enabled: Record<string, boolean>
}

const KEY = "settings"

const deriveDefaults = (): Settings => ({
    version: 1,
    enabled: Object.fromEntries(STORES.map(s => [s.id, s.enabledByDefault ?? true]))
})

export function withDefaults(base?: Partial<Settings>): Settings {
    const defaults = deriveDefaults()
    const sameVersion = base?.version === defaults.version
    const merged: Settings = {
        version: defaults.version,
        enabled: {...defaults.enabled, ...(sameVersion ? base?.enabled : undefined) }
    }

    for (const s of STORES) {
        if (merged.enabled[s.id] === undefined) {
            merged.enabled[s.id] = defaults.enabled[s.id]
        }
    }
    
    return merged
}

export async function loadSettings(): Promise<Settings> {
    const obj = await chrome.storage.sync.get(KEY)
    return withDefaults(obj[KEY])
}

export async function saveSettings(s: Settings): Promise<void> {
    await chrome.storage.sync.set({ [KEY]: withDefaults(s) })
}
