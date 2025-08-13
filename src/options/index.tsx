import { useEffect, useState } from "react"
import "./options.css"
import { STORES } from "~lib/stores"
import { loadSettings, saveSettings, withDefaults, type Settings } from "~lib/settings"

export default function Options() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => setSettings(withDefaults(s)))
  }, [])

  const onToggle = (id: string) => {
    if (!settings) return
    const next = { ...settings, enabled: { ...settings.enabled, [id]: !settings.enabled[id] } }
    setSettings(next)
    setSaving(true)
    saveSettings(next).finally(() => setSaving(false))
  }

  if (!settings) {
    return (
      <main className="page">
        <div className="panel">Loading…</div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="panel">
        <h1 className="title">Webstore Tracker</h1>
        <p className="subtitle">Choose which stores to enable</p>

        <section className="list">
          {STORES.map((s) => {
            const checked = (settings.enabled?.[s.id] ?? s.enabledByDefault ?? true)
            return (
              <label key={s.id} className="row">
                <span className="store">{s.name}</span>
                <span className="toggle">
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label={`Enable ${s.name}`}
                    checked={checked}
                    onChange={() => onToggle(s.id)}
                  />
                  <span className="slider" aria-hidden />
                </span>
              </label>
            )
          })}
        </section>

        <div aria-live="polite" className="saveHint">{saving ? "Saving…" : "Saved"}</div>
      </div>
    </main>
  )
}