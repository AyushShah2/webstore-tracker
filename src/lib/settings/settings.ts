import browser from "webextension-polyfill"

import { STORES } from "./stores"

export interface Settings {
  version: 1
  enabled: Record<string, boolean>
}

const KEY = "settings"

const deriveDefaults = (): Settings => ({
  version: 1,
  enabled: Object.fromEntries(STORES.map((s) => [s.id, s.enabledByDefault ?? true])),
})

export function withDefaults(base?: Partial<Settings>): Settings {
  const defaults = deriveDefaults()
  const sameVersion = base?.version === defaults.version

  return {
    version: defaults.version,
    enabled: { ...defaults.enabled, ...(sameVersion ? base?.enabled : undefined) },
  }
}

export async function loadSettings(): Promise<Settings> {
  const obj = await browser.storage.sync.get(KEY)
  return withDefaults(obj[KEY] as Settings)
}

export async function saveSettings(s: Settings): Promise<void> {
  await browser.storage.sync.set({ [KEY]: withDefaults(s) })
}
