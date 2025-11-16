import browser from "webextension-polyfill"

import { STORES } from "./stores"

export interface Settings {
  enabled: Record<string, boolean>
}

const KEY = "settings"
const defaults: Settings = {
  enabled: Object.fromEntries(STORES.map((s) => [s.id, s.enabledByDefault ?? true])),
}

export function withDefaults(base?: Partial<Settings>): Settings {
  return {
    ...defaults,
    ...base,
  }
}

export async function loadSettings(): Promise<Settings> {
  const obj = await browser.storage.sync.get({ [KEY]: {} })
  return withDefaults(obj[KEY] as Partial<Settings>)
}

export async function saveSettings(s: Settings): Promise<void> {
  await browser.storage.sync.set({ [KEY]: withDefaults(s) })
}
