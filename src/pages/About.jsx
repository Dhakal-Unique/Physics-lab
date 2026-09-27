export default function About() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>About PhysicsLab</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        An interactive physics simulation and verification tool.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">What is PhysicsLab?</div>
        <p style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
          PhysicsLab is a browser-based physics lab. Pick an experiment, change the parameters,
          run the simulation, watch it animate, and check whether the numbers actually match what
          the physics equations say they should be. Everything runs client-side with no backend needed.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">How It Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            ['📐', 'Equations', 'Each experiment is built on real physics equations from classical mechanics. Nothing is faked or hardcoded.'],
            ['⚙️', 'Simulation', 'The parameters you set feed directly into the equations and generate time-series data point by point.'],
            ['📊', 'Visualization', 'The data is rendered as a canvas animation and interactive charts so you can actually see what is happening.'],
            ['✅', 'Verification', 'A separate engine compares the simulation output against the analytical formulas and tells you if the physics checks out.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(88,166,255,0.3)' }}>
        <div className="section-title">About the Creator</div>
        <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: '0.75rem' }}>
          PhysicsLab was built by <strong style={{ color: 'var(--text)' }}>Unique Dhakal</strong>.
          The idea, the experiment choices, the physics engine design, and the overall product
          are original work by him.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--accent)' }}>IBM Bob 2.0</strong> was used as a coding assistant
          to help write and scaffold the code based on his design and specs.
          The creative decisions and the concept are his.
        </p>
      </div>

      <div className="card" style={{ background: 'rgba(210,153,34,0.07)', borderColor: 'rgba(210,153,34,0.3)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--warn)' }}>Note:</strong>{' '}
          PhysicsLab is an educational tool. The results come from idealized physics models and are
          not experimental measurements.
        </p>
      </div>
    </div>
  )
}
