import { Link } from 'react-router-dom'

const experiments = [
  {
    path: '/experiments/projectile',
    title: 'Projectile Motion',
    icon: '🚀',
    tag: 'Kinematics',
    desc: 'Explore two-dimensional projectile motion and investigate how initial velocity, launch angle, and gravity affect the trajectory.',
  },
  {
    path: '/experiments/pendulum',
    title: 'Simple Pendulum',
    icon: '🕰',
    tag: 'Oscillations',
    desc: 'Investigate oscillatory motion and explore how pendulum length and gravity affect its period.',
  },
  {
    path: '/experiments/harmonic',
    title: 'Harmonic Oscillator',
    icon: '〰',
    tag: 'SHM',
    desc: 'Explore simple harmonic motion and observe the relationship between displacement, velocity, acceleration, and energy.',
  },
]

export default function Experiments() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Experiments</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Choose a physics experiment to simulate, visualize, and verify.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {experiments.map(e => (
          <div key={e.path} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2.2rem' }}>{e.icon}</span>
              <span style={{
                background: 'rgba(88,166,255,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(88,166,255,0.3)',
                borderRadius: '20px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}>{e.tag}</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{e.title}</h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--muted)', lineHeight: 1.65, flex: 1 }}>{e.desc}</p>
            <Link to={e.path} className="btn-primary" style={{ borderRadius: 6, textAlign: 'center', padding: '0.55rem' }}>
              Launch Experiment
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
