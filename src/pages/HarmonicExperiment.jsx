import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { simulateHarmonicOscillator, calculateOscillatorResults, verifyOscillator } from '../physics/harmonicOscillator'
import { fmt } from '../physics/units'
import ParamControl from '../components/ParamControl'
import VerificationPanel from '../components/VerificationPanel'

const DEFAULT = { mass: 1, k: 10, x0: 1, v0: 0, duration: 10 }

function validate({ mass, k, x0, v0, duration }) {
  const errs = {}
  if (mass < 0.1 || mass > 20) errs.mass = 'Mass must be 0.1–20 kg.'
  if (k < 0.1 || k > 200) errs.k = 'Spring constant must be 0.1–200 N/m.'
  if (x0 < -5 || x0 > 5) errs.x0 = 'Initial displacement must be -5 to 5 m.'
  if (duration < 1 || duration > 60) errs.duration = 'Duration must be 1–60 s.'
  return errs
}

function drawOscillator(canvas, data, idx) {
  if (!canvas || !data.length) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, W, H)

  const d = data[Math.min(idx, data.length - 1)]
  const A = data.reduce((m, dd) => Math.max(m, Math.abs(dd.x)), 0)
  const scale = A > 0 ? (W / 2 - 80) / A : 100

  const wallX = 40
  const cy = H / 2
  const eqX = W / 2  // equilibrium x on canvas
  const massX = eqX + d.x * scale
  const massR = 18

  // Wall
  ctx.fillStyle = '#30363d'
  ctx.fillRect(wallX - 8, cy - 60, 8, 120)
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = '#8b949e'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(wallX - 8, cy - 60 + i * 16)
    ctx.lineTo(wallX - 20, cy - 44 + i * 16)
    ctx.stroke()
  }

  // Spring (zig-zag from wall to mass)
  const springEnd = massX - massR
  const springStart = wallX
  const nCoils = 10
  const coilW = 16
  ctx.strokeStyle = '#8b949e'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(springStart, cy)
  const segLen = (springEnd - springStart) / (nCoils + 1)
  ctx.lineTo(springStart + segLen * 0.5, cy)
  for (let i = 0; i < nCoils; i++) {
    const sx = springStart + segLen * (0.5 + i)
    const ex = springStart + segLen * (1.5 + i)
    const mid = (sx + ex) / 2
    ctx.lineTo(mid, cy - coilW)
    ctx.lineTo(ex, cy)
  }
  ctx.lineTo(springEnd, cy)
  ctx.stroke()

  // Equilibrium line
  ctx.strokeStyle = 'rgba(63,185,80,0.35)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(eqX, cy - 50)
  ctx.lineTo(eqX, cy + 50)
  ctx.stroke()
  ctx.setLineDash([])

  // Displacement arrow
  if (Math.abs(d.x) > 0.01) {
    ctx.strokeStyle = 'rgba(88,166,255,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(eqX, cy + 40)
    ctx.lineTo(massX, cy + 40)
    ctx.stroke()
    ctx.fillStyle = 'rgba(88,166,255,0.6)'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`x=${fmt(d.x,2)}m`, (eqX + massX) / 2, cy + 55)
  }

  // Mass
  ctx.fillStyle = '#f0b429'
  ctx.shadowColor = '#f0b429'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(massX, cy, massR, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Info
  ctx.fillStyle = '#8b949e'
  ctx.font = '11px system-ui'
  ctx.textAlign = 'left'
  ctx.fillText(`t = ${fmt(d.t, 2)} s`, 10, 20)
  ctx.fillText(`v = ${fmt(d.v, 3)} m/s`, 10, 34)
  ctx.fillText(`a = ${fmt(d.a, 3)} m/s²`, 10, 48)
  ctx.fillText('Eq', eqX - 8, cy - 55)
}

export default function HarmonicExperiment() {
  const [params, setParams] = useState(DEFAULT)
  const [errors, setErrors] = useState({})
  const [simData, setSimData] = useState(null)
  const [results, setResults] = useState(null)
  const [verification, setVerification] = useState(null)
  const [animIdx, setAnimIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [tab, setTab] = useState('displacement')
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)

  const setParam = key => val => setParams(p => ({ ...p, [key]: val }))

  const runSim = useCallback(() => {
    const errs = validate(params)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = simulateHarmonicOscillator({ ...params, steps: 600 })
    const res = calculateOscillatorResults(params)
    const ver = verifyOscillator(data, params)
    setSimData(data); setResults(res); setVerification(ver)
    setAnimIdx(0); setPlaying(false)
  }, [params])

  const reset = () => {
    setParams(DEFAULT); setErrors({}); setSimData(null); setResults(null)
    setVerification(null); setAnimIdx(0); setPlaying(false)
  }

  useEffect(() => {
    if (!playing || !simData) return
    const step = ts => {
      if (!lastTimeRef.current) lastTimeRef.current = ts
      const elapsed = (ts - lastTimeRef.current) / 1000
      lastTimeRef.current = ts
      const framesPerSec = simData.length / params.duration * speed
      const inc = Math.max(1, Math.round(framesPerSec * elapsed))
      setAnimIdx(prev => (prev + inc) % simData.length)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(rafRef.current); lastTimeRef.current = null }
  }, [playing, simData, speed, params.duration])

  useEffect(() => {
    if (simData) drawOscillator(canvasRef.current, simData, animIdx)
  }, [simData, animIdx])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || simData) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#8b949e'
    ctx.font = '13px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Set parameters and click Run Simulation', canvas.width / 2, canvas.height / 2)
  }, [simData])

  const chartData = simData
    ? simData.filter((_, i) => i % Math.max(1, Math.floor(simData.length / 120)) === 0)
    : []

  return (
    <div>
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        <Link to="/experiments" style={{ color: 'var(--muted)' }}>Experiments</Link> / <span style={{ color: 'var(--text)' }}>Harmonic Oscillator</span>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Harmonic Oscillator</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Simple harmonic motion — explore the spring-mass system and energy conservation.
      </p>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="section-title">Parameters</div>
          <ParamControl label="Mass (m)" unit="kg" value={params.mass} min={0.1} max={20} step={0.1} onChange={setParam('mass')} error={errors.mass} />
          <ParamControl label="Spring Constant (k)" unit="N/m" value={params.k} min={0.1} max={200} step={0.5} onChange={setParam('k')} error={errors.k} />
          <ParamControl label="Initial Displacement (x₀)" unit="m" value={params.x0} min={-5} max={5} step={0.1} onChange={setParam('x0')} error={errors.x0} />
          <ParamControl label="Initial Velocity (v₀)" unit="m/s" value={params.v0} min={-10} max={10} step={0.1} onChange={setParam('v0')} />
          <ParamControl label="Duration" unit="s" value={params.duration} min={1} max={60} step={1} onChange={setParam('duration')} error={errors.duration} />
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
            <button className="btn-ghost btn-danger" onClick={reset}>Reset</button>
            <button className="btn-primary" onClick={runSim} style={{ flex: 1 }}>▶ Run Simulation</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Simulation</div>
          <canvas ref={canvasRef} width={460} height={260}
            style={{ width: '100%', borderRadius: 6, background: '#0d1117', border: '1px solid var(--border)' }}
            aria-label="Spring-mass oscillator animation" />
          {simData && (
            <div className="anim-controls">
              <button className="btn-ghost" onClick={() => setPlaying(true)} disabled={playing}>▶ Play</button>
              <button className="btn-ghost" onClick={() => setPlaying(false)} disabled={!playing}>⏸ Pause</button>
              <button className="btn-ghost" onClick={() => { setAnimIdx(0); setPlaying(false) }}>↺ Restart</button>
              <div className="speed-row">
                <span>Speed:</span>
                <input type="range" min={0.25} max={5} step={0.25} value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                <span>{speed}×</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Results</div>
          <div className="metric-grid">
            <div className="metric"><div className="metric-label">Period (T)</div><div className="metric-value">{results.T.toFixed(3)} s</div></div>
            <div className="metric"><div className="metric-label">Frequency</div><div className="metric-value">{results.frequency.toFixed(3)} Hz</div></div>
            <div className="metric"><div className="metric-label">ω</div><div className="metric-value">{results.omega.toFixed(3)} rad/s</div></div>
            <div className="metric"><div className="metric-label">Amplitude</div><div className="metric-value">{results.A.toFixed(3)} m</div></div>
            <div className="metric"><div className="metric-label">Total Energy</div><div className="metric-value">{results.Etotal.toFixed(3)} J</div></div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Graphs</div>
          <div className="tabs">
            {['displacement', 'velocity', 'acceleration', 'energy'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'displacement' ? 'Displacement' : t === 'velocity' ? 'Velocity' : t === 'acceleration' ? 'Acceleration' : 'Energy'}
              </button>
            ))}
          </div>
          <div style={{ height: 220 }}>
            {tab === 'displacement' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={v => [`${fmt(v)} m`, 'x']} />
                  <Line type="monotone" dataKey="x" stroke="#58a6ff" dot={false} strokeWidth={2} name="x(t)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'velocity' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={v => [`${fmt(v)} m/s`, 'v']} />
                  <Line type="monotone" dataKey="v" stroke="#f0b429" dot={false} strokeWidth={2} name="v(t)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'acceleration' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={v => [`${fmt(v)} m/s²`, 'a']} />
                  <Line type="monotone" dataKey="a" stroke="#f85149" dot={false} strokeWidth={2} name="a(t)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'energy' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v, n) => [`${fmt(v, 4)} J`, n]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
                  <Line type="monotone" dataKey="ke" stroke="#f0b429" dot={false} strokeWidth={2} name="KE" />
                  <Line type="monotone" dataKey="pe" stroke="#3fb950" dot={false} strokeWidth={2} name="PE" />
                  <Line type="monotone" dataKey="e" stroke="#58a6ff" dot={false} strokeWidth={2} strokeDasharray="4 2" name="Total E" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Physics Verification</div>
        <VerificationPanel result={verification} />
      </div>
    </div>
  )
}
