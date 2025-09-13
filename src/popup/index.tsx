import { useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { loadSettings, withDefaults, type Settings } from "~lib/settings/settings"
import { STORES } from "~lib/settings/stores"

import "./popup.css"

export default function Popup() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    let mounted = true
    loadSettings().then((s) => mounted && setSettings(withDefaults(s)))

    // live-update if Options changes settings in another tab
    const onChanged = (changes: Record<string, browser.Storage.StorageChange>, area: string) => {
      if (area === "sync" && changes?.settings) {
        setSettings(withDefaults(changes.settings.newValue))
      }
    }
    browser.storage.onChanged.addListener(onChanged)
    return () => {
      mounted = false
      browser.storage.onChanged.removeListener(onChanged)
    }
  }, [])

  const openOptions = async () => await browser.runtime.openOptionsPage()

  if (!settings) {
    return (
      <main className="popup">
        <div className="heading">Webstore Tracker</div>
        <div className="muted">Loading…</div>
      </main>
    )
  }

  return (
    <main className="popup">
      <div className="heading">Webstore Tracker</div>

      <button className="btn" onClick={openOptions}>
        Open Options
      </button>

      <div className="subheading">Stores</div>
      <ul className="list">
        {STORES.map((s) => {
          const on = settings.enabled?.[s.id] ?? s.enabledByDefault ?? true
          return (
            <li key={s.id} className="row">
              <span className="store">{s.name}</span>
              <span className={`pill ${on ? "on" : "off"}`}>{on ? "On" : "Off"}</span>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
