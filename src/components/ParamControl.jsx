// Reusable parameter slider + number input control

export default function ParamControl({ label, unit, value, min, max, step = 0.01, onChange, error }) {
  return (
    <div className="param-row">
      <label className="param-label">
        <span>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value))}
            aria-label={`${label} value`}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 36 }}>{unit}</span>
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        aria-label={`${label} slider`}
      />
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}
