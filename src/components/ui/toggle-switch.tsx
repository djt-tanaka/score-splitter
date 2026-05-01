'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
  name?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  name,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3 px-3.5 rounded-xl border border-border bg-card">
      {name && <input type="hidden" name={name} value={String(checked)} />}
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-sub-text mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-[26px] rounded-full transition-colors shrink-0 ml-3"
        style={{
          background: checked ? 'var(--neon-cyan)' : 'oklch(0.85 0.01 260)',
        }}
      >
        <span
          className="absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-[left]"
          style={{ left: checked ? 20 : 2 }}
        />
      </button>
    </div>
  )
}
