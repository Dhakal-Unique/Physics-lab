import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Experiments from './pages/Experiments'
import ProjectileExperiment from './pages/ProjectileExperiment'
import PendulumExperiment from './pages/PendulumExperiment'
import HarmonicExperiment from './pages/HarmonicExperiment'
import About from './pages/About'
import DevLog from './pages/DevLog'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/experiments/projectile" element={<ProjectileExperiment />} />
          <Route path="/experiments/pendulum" element={<PendulumExperiment />} />
          <Route path="/experiments/harmonic" element={<HarmonicExperiment />} />
          <Route path="/about" element={<About />} />
          <Route path="/devlog" element={<DevLog />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
