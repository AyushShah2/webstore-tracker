import { useEffect, useState, type ReactNode } from "react"

import { loadSettings, saveSettings, withDefaults, type Settings } from "~lib/settings/settings"
import { STORES } from "~lib/settings/stores"

import "./options.css"

function Collapsible({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <div className="collapse-control" onClick={() => setOpen(!open)}>
        <span className="section-settings-header">{label}</span>
        <span style={{ marginLeft: "10px" }} className={open ? "arrow-down" : "arrow-right"}></span>
      </div>
      {open && children}
    </section>
  )
}

export default function Options() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function getSettings() {
      setSettings(await loadSettings())
    }
    getSettings()
  }, [])

  const onToggle = (id: string) => {
    if (!settings) return
    const next = { ...settings, enabled: { ...settings.enabled, [id]: !settings.enabled[id] } }
    setSettings(next)
    setSaving(true)
    saveSettings(next).finally(() => setSaving(false))
  }

  return (
    <main id="page">
      <div className="panel">
        {settings ? (
          <>
            <section id="header">
              <h1 className="title">Webstore Tracker</h1>
              <p className="subtitle">Choose which stores to enable</p>

              <div aria-live="polite" id="saveHint">
                {saving ? "Saving…" : "Saved"}
              </div>
            </section>

            <section id="settings">
              <Collapsible label="Store Settings">
                <section className="list">
                  {STORES.map((s) => {
                    const checked = settings.enabled?.[s.id] ?? s.enabledByDefault ?? true
                    return (
                      <label key={s.id} className="row">
                        <span className="store">{s.name}</span>
                        <span className="toggle">
                          <input type="checkbox" role="switch" aria-label={`Enable ${s.name}`} checked={checked} onChange={() => onToggle(s.id)} />
                          <span className="slider" aria-hidden />
                        </span>
                      </label>
                    )
                  })}
                </section>
              </Collapsible>
            </section>
          </>
        ) : (
          "Loading..."
        )}
      </div>
    </main>
  )
}
