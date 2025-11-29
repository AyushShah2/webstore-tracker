import { useEffect, useState, type ReactNode } from "react"

import { loadSettings, saveSettings, type Settings } from "~lib/settings/settings"
import { STORES } from "~lib/settings/stores"

import "./options.css"

interface FieldProps {
  label: string
}

interface GroupFieldProps extends FieldProps {
  children: ReactNode
}

function RowField({ label, children }: GroupFieldProps) {
  return (
    <label className="field-label row">
      {label}
      {children}
    </label>
  )
}

interface SilderProps extends FieldProps {
  value: boolean
  listener?: React.ChangeEventHandler<HTMLInputElement>
}

function Slider({ label, value, listener }: SilderProps) {
  return (
    <RowField label={label}>
      <div className="toggle">
        <input type="checkbox" role="switch" aria-label={`Enable ${label}`} checked={value} onChange={listener} />
        <span className="slider" aria-hidden />
      </div>
    </RowField>
  )
}

interface CollapsibleProps extends GroupFieldProps {
  defaultValue?: boolean
  listener?: React.MouseEventHandler<HTMLDivElement>
}

function Collapsible({ label, children, defaultValue, listener }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultValue ?? true)

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setOpen(!open)
    listener?.(e)
  }

  return (
    <section>
      <div className="collapse-control" onClick={handleClick}>
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

            <section className="list">
              <Collapsible label="Store Settings">
                <section className="list">
                  {STORES.map((s) => {
                    const checked = settings.enabled?.[s.id] ?? s.enabledByDefault ?? true
                    return <Slider label={s.name} key={s.id} value={checked} listener={() => onToggle(s.id)} />
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
