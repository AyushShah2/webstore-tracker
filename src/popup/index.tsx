import { useEffect, useState } from "react"
import "./popup.css"
import { STORES } from "~lib/stores"
import { loadSettings, withDefaults, type Settings } from "~lib/settings"

export default function Popup() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    let mounted = true
    loadSettings().then((s) => mounted && setSettings(withDefaults(s)))

    // live-update if Options changes settings in another tab
    const onChanged = (changes: any, area: string) => {
      if (area === "sync" && changes?.settings) {
        setSettings(withDefaults(changes.settings.newValue))
      }
    }
    chrome.storage.onChanged.addListener(onChanged)
    return () => {
      mounted = false
      chrome.storage.onChanged.removeListener(onChanged)
    }
  }, [])

  const openOptions = () => chrome.runtime.openOptionsPage()

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

      <button className="btn" onClick={openOptions}>Open Options</button>

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