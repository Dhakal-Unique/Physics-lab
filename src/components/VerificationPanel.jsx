// Shared verification results panel

function statusIcon(s) {
  if (s === 'PASS') return <span className="verify-icon pass" aria-label="Pass">✓</span>
  if (s === 'WARNING') return <span className="verify-icon warning" aria-label="Warning">⚠</span>
  return <span className="verify-icon fail" aria-label="Fail">✕</span>
}

export default function VerificationPanel({ result }) {
  if (!result) return (
    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', padding: '1rem 0' }}>
      Run a simulation to see physics verification results.
    </div>
  )

  const { checks, passed, warnings, failed } = result
  const allPass = failed === 0 && warnings === 0
  const overallLabel = failed > 0 ? 'PHYSICS INCONSISTENT' : warnings > 0 ? 'PHYSICS WITH WARNINGS' : 'PHYSICS CONSISTENT'
  const overallClass = failed > 0 ? 'badge badge-fail overall-badge' : warnings > 0 ? 'badge badge-warn overall-badge' : 'badge badge-pass overall-badge'

  return (
    <div>
      <div className="verify-summary">
        <span className="badge badge-pass">✓ {passed} passed</span>
        {warnings > 0 && <span className="badge badge-warn">⚠ {warnings} warnings</span>}
        {failed > 0 && <span className="badge badge-fail">✕ {failed} failed</span>}
        <span className={overallClass}>Overall: {overallLabel}</span>
      </div>

      <div>
        {checks.map((c, i) => (
          <div key={i} className="verify-row">
            {statusIcon(c.status)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="verify-name">{c.name}</div>
              <div className="verify-formula">{c.formula}</div>
              <div className="verify-vals">
                Measured: <strong>{typeof c.measured === 'number' ? c.measured.toFixed(4) : c.measured}</strong>{' '}
                {c.unit !== '% error' && c.unit !== '% variation' && c.unit}
                {' '}· Expected: <strong>{typeof c.expected === 'number' ? c.expected.toFixed(4) : c.expected}</strong>{' '}
                {c.unit !== '% error' && c.unit !== '% variation' && c.unit}
                {' '}· Error: <strong style={{ color: c.status === 'PASS' ? 'var(--success)' : c.status === 'WARNING' ? 'var(--warn)' : 'var(--danger)' }}>
                  {typeof c.error === 'number' ? c.error.toFixed(3) : c.error} {c.unit}
                </strong>
              </div>
              <div className="verify-explain">{c.explanation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
