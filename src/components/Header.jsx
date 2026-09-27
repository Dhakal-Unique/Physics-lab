import { NavLink, Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="PhysicsLab home">
          <span className="logo-icon">⚛</span>
          <span className="logo-text">PhysicsLab</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/experiments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Experiments</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
          <NavLink to="/devlog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dev Log</NavLink>
        </nav>
        <Link to="/experiments" className="btn-primary" style={{ borderRadius: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
          Start Experiment
        </Link>
      </div>
    </header>
  )
}
