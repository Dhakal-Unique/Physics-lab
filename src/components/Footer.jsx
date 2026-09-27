export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '1.5rem',
      textAlign: 'center',
      fontSize: '0.78rem',
      color: 'var(--muted)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>PhysicsLab</strong>
          {' '}— An interactive physics simulation &amp; verification tool.
        </p>
      </div>
    </footer>
  )
}
