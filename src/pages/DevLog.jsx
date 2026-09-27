const tasks = [
  { done: true, text: 'Wrote the projectile simulation engine (projectile.js)' },
  { done: true, text: 'Wrote the pendulum simulation engine (pendulum.js)' },
  { done: true, text: 'Wrote the harmonic oscillator engine (harmonicOscillator.js)' },
  { done: true, text: 'Built the canvas animation for the projectile trajectory' },
  { done: true, text: 'Built the canvas animation for the pendulum with pivot, rod, bob, and trail' },
  { done: true, text: 'Built the canvas animation for the spring-mass system' },
  { done: true, text: 'Built the physics verification engine with PASS, WARNING, and FAIL checks' },
  { done: true, text: 'Added energy conservation checks for all three experiments' },
  { done: true, text: 'Added charts for trajectory, velocity, position, and energy using Recharts' },
  { done: true, text: 'Added Play, Pause, Restart, Step controls and a speed slider for animations' },
  { done: true, text: 'Made sliders and number inputs stay in sync' },
  { done: true, text: 'Made the layout responsive so it works on desktop and mobile' },
  { done: true, text: 'Added input validation so bad values never break the simulation' },
  { done: true, text: 'Wrote a units formatting utility so every value shows the right unit' },
  { done: true, text: 'Built the home page with the hero section, feature cards, and live mini preview' },
  { done: true, text: 'Built the experiments catalogue page' },
  { done: true, text: 'Built the About and Dev Log pages' },
  { done: true, text: 'Wrote 30 automated tests for all three physics engines using Vitest' },
  { done: true, text: 'Set up Vercel deployment config and confirmed the production build works' },
]

export default function DevLog() {
  const done = tasks.filter(t => t.done).length
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Dev Log</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        Everything that got built for this project.
      </p>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{done}</span> tasks done
      </p>

      <div className="card">
        <div className="section-title">Completed</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((t, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.6rem 0',
              borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: t.done ? 'var(--success)' : 'var(--muted)', flexShrink: 0, fontSize: '1rem', marginTop: 2 }}>
                {t.done ? '✓' : '○'}
              </span>
              <span style={{ fontSize: '0.9rem', color: t.done ? 'var(--text)' : 'var(--muted)' }}>{t.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', borderColor: 'rgba(88,166,255,0.3)' }}>
        <div className="section-title">A note on IBM Bob 2.0</div>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.75 }}>
          The idea for PhysicsLab and everything about how it works came from{' '}
          <strong style={{ color: 'var(--text)' }}>Unique Dhakal</strong>.
          IBM Bob 2.0 was used as a coding assistant to help write and scaffold the code based
          on his design and specs. The physics calculations are real mathematical models
          written in JavaScript and have nothing to do with AI.
        </p>
      </div>
    </div>
  )
}
