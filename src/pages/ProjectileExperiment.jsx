import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { simulateProjectile, calculateProjectileResults, verifyProjectile } from '../physics/projectile'
import { fmt, fmtM, fmtS, fmtMs } from '../physics/units'
import ParamControl from '../components/ParamControl'
import VerificationPanel from '../components/VerificationPanel'

const DEFAULT = { v0: 20, angle: 45, g: 9.81, h0: 0 }

function validate({ v0, angle, g, h0 }) {
  const errs = {}
  if (!v0 || v0 < 1 || v0 > 100) errs.v0 = 'Initial velocity must be 1–100 m/s.'
  if (!angle || angle < 1 || angle > 89) errs.angle = 'Launch angle must be 1–89°.'
  if (!g || g < 1 || g > 25) errs.g = 'Gravity must be 1–25 m/s².'
  if (h0 < 0 || h0 > 100) errs.h0 = 'Initial height must be 0–100 m.'
  return errs
}

// Canvas drawing
function drawProjectile(canvas, data, currentIdx) {
  if (!canvas || !data.length) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const pad = { t: 24, r: 24, b: 36, l: 40 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b

  const maxX = data[data.length - 1].x
  const maxY = Math.max(...data.map(d => d.y), 1)

  const sx = x => pad.l + (x / maxX) * iW
  const sy = y => pad.t + iH - (y / (maxY * 1.15)) * iH

  ctx.clearRect(0, 0, W, H)

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = '#1c2230'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    const gx = pad.l + i * iW / 4
    const gy = pad.t + i * iH / 4
    ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, pad.t + iH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + iW, gy); ctx.stroke()
  }

  // Axes
  ctx.strokeStyle = '#30363d'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + iH)
  ctx.moveTo(pad.l, pad.t + iH); ctx.lineTo(pad.l + iW, pad.t + iH)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = '#8b949e'
  ctx.font = '11px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('0', pad.l, pad.t + iH + 16)
  ctx.fillText(fmt(maxX) + ' m', pad.l + iW, pad.t + iH + 16)
  ctx.textAlign = 'right'
  ctx.fillText(fmt(maxY) + ' m', pad.l - 4, pad.t + 8)

  // Ground
  ctx.strokeStyle = '#30363d'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pad.l, pad.t + iH)
  ctx.lineTo(pad.l + iW, pad.t + iH)
  ctx.stroke()

  // Full trajectory (faded)
  ctx.strokeStyle = 'rgba(88,166,255,0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  data.forEach((d, i) => {
    if (i === 0) ctx.moveTo(sx(d.x), sy(d.y))
    else ctx.lineTo(sx(d.x), sy(d.y))
  })
  ctx.stroke()
  ctx.setLineDash([])

  // Animated trajectory up to currentIdx
  const trail = data.slice(0, currentIdx + 1)
  ctx.strokeStyle = '#58a6ff'
  ctx.lineWidth = 2
  ctx.beginPath()
  trail.forEach((d, i) => {
    if (i === 0) ctx.moveTo(sx(d.x), sy(d.y))
    else ctx.lineTo(sx(d.x), sy(d.y))
  })
  ctx.stroke()

  // Launch point
  ctx.fillStyle = '#3fb950'
  ctx.beginPath()
  ctx.arc(sx(0), sy(0), 5, 0, Math.PI * 2)
  ctx.fill()

  // Landing point marker (only if sim reached end)
  if (currentIdx >= data.length - 1) {
    const last = data[data.length - 1]
    ctx.fillStyle = '#f85149'
    ctx.beginPath()
    ctx.arc(sx(last.x), sy(0), 5, 0, Math.PI * 2)
    ctx.fill()
    // label
    ctx.fillStyle = '#f85149'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(fmtM(last.x), sx(last.x) + 4, pad.t + iH - 6)
  }

  // Projectile ball at current position
  if (currentIdx < data.length) {
    const cur = data[currentIdx]
    ctx.fillStyle = '#f0b429'
    ctx.shadowColor = '#f0b429'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(sx(cur.x), sy(cur.y), 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

export default function ProjectileExperiment() {
  const [params, setParams] = useState(DEFAULT)
  const [errors, setErrors] = useState({})
  const [simData, setSimData] = useState(null)
  const [results, setResults] = useState(null)
  const [verification, setVerification] = useState(null)
  const [animIdx, setAnimIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [tab, setTab] = useState('trajectory')
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)

  const setParam = (key) => (val) => {
    setParams(p => ({ ...p, [key]: val }))
  }

  const runSim = useCallback(() => {
    const errs = validate(params)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = simulateProjectile({ ...params, steps: 400 })
    const res = calculateProjectileResults(params)
    const ver = verifyProjectile(data, params)
    setSimData(data)
    setResults(res)
    setVerification(ver)
    setAnimIdx(0)
    setPlaying(false)
  }, [params])

  const reset = () => {
    setParams(DEFAULT)
    setErrors({})
    setSimData(null)
    setResults(null)
    setVerification(null)
    setAnimIdx(0)
    setPlaying(false)
  }

  // Animation loop
  useEffect(() => {
    if (!playing || !simData) return
    const step = (ts) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts
      const elapsed = (ts - lastTimeRef.current) / 1000 // s
      lastTimeRef.current = ts

      const simDuration = simData[simData.length - 1].t
      const framesPerSec = simData.length / simDuration * speed
      const increment = Math.max(1, Math.round(framesPerSec * elapsed))

      setAnimIdx(prev => {
        const next = prev + increment
        if (next >= simData.length - 1) {
          setPlaying(false)
          return simData.length - 1
        }
        return next
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [playing, simData, speed])

  // Draw canvas
  useEffect(() => {
    if (simData) drawProjectile(canvasRef.current, simData, animIdx)
  }, [simData, animIdx])

  // Initial empty canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#30363d'
    ctx.fillRect(0, canvas.height - 2, canvas.width, 2)
    ctx.fillStyle = '#8b949e'
    ctx.font = '13px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Set parameters and click Run Simulation', canvas.width / 2, canvas.height / 2)
  }, [])

  const curPoint = simData ? simData[Math.min(animIdx, simData.length - 1)] : null

  // Prepare chart data (downsample to 100 pts for performance)
  const chartData = simData
    ? simData.filter((_, i) => i % Math.max(1, Math.floor(simData.length / 100)) === 0)
    : []

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        <Link to="/experiments" style={{ color: 'var(--muted)' }}>Experiments</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>Projectile Motion</span>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Projectile Motion</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Explore two-dimensional projectile motion. Adjust parameters and run the simulation.
      </p>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        {/* Parameters */}
        <div className="card">
          <div className="section-title">Parameters</div>
          <ParamControl label="Initial Velocity" unit="m/s" value={params.v0} min={1} max={100} step={0.5} onChange={setParam('v0')} error={errors.v0} />
          <ParamControl label="Launch Angle" unit="°" value={params.angle} min={1} max={89} step={0.5} onChange={setParam('angle')} error={errors.angle} />
          <ParamControl label="Gravity" unit="m/s²" value={params.g} min={1} max={25} step={0.01} onChange={setParam('g')} error={errors.g} />
          <ParamControl label="Initial Height" unit="m" value={params.h0} min={0} max={100} step={0.5} onChange={setParam('h0')} error={errors.h0} />
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
            <button className="btn-ghost btn-danger" onClick={reset} style={{ flex: '0 0 auto' }}>Reset</button>
            <button className="btn-primary" onClick={runSim} style={{ flex: 1 }}>▶ Run Simulation</button>
          </div>
        </div>

        {/* Canvas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Simulation</div>
          <canvas
            ref={canvasRef}
            width={560}
            height={280}
            style={{ width: '100%', borderRadius: 6, background: '#0d1117', border: '1px solid var(--border)' }}
            aria-label="Projectile motion animation"
          />
          {curPoint && (
            <div className="sim-time" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span>t = <strong>{fmt(curPoint.t, 2)} s</strong></span>
              <span>x = <strong>{fmtM(curPoint.x)}</strong></span>
              <span>y = <strong>{fmtM(curPoint.y)}</strong></span>
              <span>v = <strong>{fmtMs(curPoint.v)}</strong></span>
            </div>
          )}
          {simData && (
            <div className="anim-controls">
              <button className="btn-ghost" onClick={() => { setPlaying(true) }} disabled={playing || animIdx >= simData.length - 1} aria-label="Play">▶ Play</button>
              <button className="btn-ghost" onClick={() => setPlaying(false)} disabled={!playing} aria-label="Pause">⏸ Pause</button>
              <button className="btn-ghost" onClick={() => { setAnimIdx(0); setPlaying(false) }} aria-label="Restart">↺ Restart</button>
              <button className="btn-ghost" onClick={() => setAnimIdx(i => Math.min(i + 5, simData.length - 1))} disabled={playing} aria-label="Step">⏭ Step</button>
              <div className="speed-row">
                <span>Speed:</span>
                <input type="range" min={0.25} max={5} step={0.25} value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} aria-label="Animation speed" />
                <span>{speed}×</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Simulation Results</div>
          <div className="metric-grid">
            <div className="metric"><div className="metric-label">Flight Time</div><div className="metric-value">{fmtS(results.tFlight)}</div></div>
            <div className="metric"><div className="metric-label">Max Height</div><div className="metric-value">{fmtM(results.maxHeight)}</div></div>
            <div className="metric"><div className="metric-label">Range</div><div className="metric-value">{fmtM(results.range)}</div></div>
            <div className="metric"><div className="metric-label">Impact Velocity</div><div className="metric-value">{fmtMs(results.vImpact)}</div></div>
            <div className="metric"><div className="metric-label">Impact Angle</div><div className="metric-value">{fmt(results.impactAngle, 1)}°</div></div>
          </div>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Graphs</div>
          <div className="tabs">
            {['trajectory', 'position', 'velocity', 'energy'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'trajectory' ? 'Trajectory' : t === 'position' ? 'Position vs Time' : t === 'velocity' ? 'Velocity vs Time' : 'Energy'}
              </button>
            ))}
          </div>

          <div style={{ height: 240 }}>
            {tab === 'trajectory' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="x" label={{ value: 'Distance (m)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis label={{ value: 'Height (m)', angle: -90, position: 'insideLeft', fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `x = ${fmt(v)} m`} formatter={(v, n) => [`${fmt(v)} m`, 'y']} />
                  <Line type="monotone" dataKey="y" stroke="#58a6ff" dot={false} strokeWidth={2} name="Height" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'position' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v, n) => [`${fmt(v)} m`, n]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
                  <Line type="monotone" dataKey="x" stroke="#58a6ff" dot={false} strokeWidth={2} name="x(t)" />
                  <Line type="monotone" dataKey="y" stroke="#3fb950" dot={false} strokeWidth={2} name="y(t)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'velocity' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v, n) => [`${fmt(v)} m/s`, n]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
                  <Line type="monotone" dataKey="vx" stroke="#58a6ff" dot={false} strokeWidth={2} name="vₓ(t)" />
                  <Line type="monotone" dataKey="vy" stroke="#f85149" dot={false} strokeWidth={2} name="vᵧ(t)" />
                  <Line type="monotone" dataKey="v" stroke="#d29922" dot={false} strokeWidth={1.5} strokeDasharray="4 2" name="|v|(t)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'energy' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v, n) => [`${fmt(v)} J`, n]} />
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

      {/* Verification */}
      <div className="card">
        <div className="section-title">Physics Verification</div>
        <VerificationPanel result={verification} />
      </div>
    </div>
  )
}
