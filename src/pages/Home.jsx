import { Link } from 'react-router-dom'
import MiniProjectile from '../components/MiniProjectile'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚛</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.5rem' }}>
          PhysicsLab
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '1rem', letterSpacing: '0.05em' }}>
          Experiment. Simulate. Verify.
        </p>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          An interactive physics laboratory for exploring physical systems, visualizing
          motion, and checking whether numerical results agree with fundamental physics.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/experiments" className="btn-primary" style={{ borderRadius: 8, padding: '0.65rem 1.6rem', fontSize: '0.95rem' }}>
            Explore Experiments
          </Link>
          <Link to="/about" className="btn-secondary" style={{ borderRadius: 8, padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
            How It Works
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '🔬', title: 'Interactive Experiments', desc: 'Change physical parameters and immediately observe how the system responds.' },
            { icon: '📊', title: 'Visual Simulations', desc: 'Watch physical systems evolve through interactive animations and graphs.' },
            { icon: '✅', title: 'Physics Verification', desc: 'Automatically compare numerical results against analytical physics relationships.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mini preview */}
      <section className="card" style={{ marginBottom: '3rem' }}>
        <div className="section-title">Interactive Preview</div>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          A live miniature projectile simulation with default values. Click <strong style={{ color: 'var(--text)' }}>Try it</strong> to open the full experiment.
        </p>
        <MiniProjectile />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/experiments/projectile" className="btn-primary" style={{ borderRadius: 8 }}>
            Try it →
          </Link>
        </div>
      </section>

      {/* Available Experiments */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Available Experiments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { path: '/experiments/projectile', title: 'Projectile Motion', desc: 'Explore two-dimensional motion and investigate how initial velocity, launch angle, and gravity affect the trajectory.', icon: '🚀' },
            { path: '/experiments/pendulum', title: 'Simple Pendulum', desc: 'Investigate oscillatory motion and explore how pendulum length and gravity affect its period.', icon: '🕰' },
            { path: '/experiments/harmonic', title: 'Harmonic Oscillator', desc: 'Explore simple harmonic motion and observe the relationship between displacement, velocity, and energy.', icon: '〰' },
          ].map(e => (
            <div key={e.path} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{e.icon}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{e.title}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>{e.desc}</p>
              <Link to={e.path} className="btn-secondary" style={{ alignSelf: 'flex-start', borderRadius: 6, fontSize: '0.85rem' }}>
                Launch Experiment
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
