import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { simulatePendulum, calculatePendulumResults, verifyPendulum } from '../physics/pendulum'
import { fmt, fmtS } from '../physics/units'
import ParamControl from '../components/ParamControl'
import VerificationPanel from '../components/VerificationPanel'

const DEFAULT = { L: 1, g: 9.81, theta0: 20, duration: 10 }

function validate({ L, g, theta0, duration }) {
  const errs = {}
  if (L < 0.1 || L > 10) errs.L = 'Length must be 0.1–10 m.'
  if (g < 1 || g > 25) errs.g = 'Gravity must be 1–25 m/s².'
  if (theta0 < 1 || theta0 > 45) errs.theta0 = 'Initial angle must be 1–45° (small-angle approximation).'
  if (duration < 1 || duration > 60) errs.duration = 'Duration must be 1–60 s.'
  return errs
}

function drawPendulum(canvas, data, idx) {
  if (!canvas || !data.length) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const cx = W / 2
  const cy = 60
  const scale = Math.min((H - 80) / 1.1, (W / 2 - 30))

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, W, H)

  const d = data[Math.min(idx, data.length - 1)]
  const L = Math.sqrt(d.x * d.x + (d.y) * (d.y)) || 1
  const normScale = scale // already relative

  // Pivot support
  ctx.fillStyle = '#30363d'
  ctx.fillRect(cx - 20, cy - 12, 40, 12)

  // Trail
  const trailLen = Math.min(idx, 50)
  for (let i = Math.max(0, idx - trailLen); i <= idx; i++) {
    const td = data[i]
    const alpha = (i - (idx - trailLen)) / trailLen * 0.4
    ctx.strokeStyle = `rgba(88,166,255,${alpha})`
    ctx.lineWidth = 1.5
    if (i === Math.max(0, idx - trailLen)) {
      ctx.beginPath()
      ctx.moveTo(cx + td.x * normScale, cy - td.y * normScale)
    } else {
      ctx.lineTo(cx + td.x * normScale, cy - td.y * normScale)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + td.x * normScale, cy - td.y * normScale)
    }
  }

  const bx = cx + d.x * normScale
  const by = cy - d.y * normScale

  // Rod
  ctx.strokeStyle = '#8b949e'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(bx, by)
  ctx.stroke()

  // Pivot dot
  ctx.fillStyle = '#30363d'
  ctx.beginPath()
  ctx.arc(cx, cy, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#8b949e'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, 7, 0, Math.PI * 2)
  ctx.stroke()

  // Bob
  ctx.fillStyle = '#f0b429'
  ctx.shadowColor = '#f0b429'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(bx, by, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Angle annotation
  ctx.strokeStyle = 'rgba(210,153,34,0.5)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx, cy + scale * 0.4)
  ctx.stroke()
  ctx.setLineDash([])

  // Equilibrium line
  ctx.strokeStyle = 'rgba(63,185,80,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx, cy + scale * 1.05)
  ctx.stroke()
  ctx.setLineDash([])

  // Info
  ctx.fillStyle = '#8b949e'
  ctx.font = '11px system-ui'
  ctx.textAlign = 'left'
  ctx.fillText(`θ = ${fmt(d.theta, 1)}°`, 10, 20)
  ctx.fillText(`ω = ${fmt(d.thetaDot, 3)} rad/s`, 10, 34)
  ctx.fillText(`t = ${fmt(d.t, 2)} s`, 10, 48)
}

export default function PendulumExperiment() {
  const [params, setParams] = useState(DEFAULT)
  const [errors, setErrors] = useState({})
  const [simData, setSimData] = useState(null)
  const [results, setResults] = useState(null)
  const [verification, setVerification] = useState(null)
  const [animIdx, setAnimIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [tab, setTab] = useState('angle')
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)

  const setParam = key => val => setParams(p => ({ ...p, [key]: val }))

  const runSim = useCallback(() => {
    const errs = validate(params)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = simulatePendulum({ ...params, steps: 600 })
    const res = calculatePendulumResults(params)
    const ver = verifyPendulum(data, params)
    setSimData(data)
    setResults(res)
    setVerification(ver)
    setAnimIdx(0)
    setPlaying(false)
  }, [params])

  const reset = () => {
    setParams(DEFAULT); setErrors({}); setSimData(null); setResults(null)
    setVerification(null); setAnimIdx(0); setPlaying(false)
  }

  useEffect(() => {
    if (!playing || !simData) return
    const step = (ts) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts
      const elapsed = (ts - lastTimeRef.current) / 1000
      lastTimeRef.current = ts
      const framesPerSec = simData.length / params.duration * speed
      const inc = Math.max(1, Math.round(framesPerSec * elapsed))
      setAnimIdx(prev => {
        const next = (prev + inc) % simData.length
        return next
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(rafRef.current); lastTimeRef.current = null }
  }, [playing, simData, speed, params.duration])

  useEffect(() => {
    if (simData) drawPendulum(canvasRef.current, simData, animIdx)
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
        <Link to="/experiments" style={{ color: 'var(--muted)' }}>Experiments</Link> / <span style={{ color: 'var(--text)' }}>Simple Pendulum</span>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Simple Pendulum</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Oscillatory motion — investigate how length and gravity affect the period.
      </p>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="section-title">Parameters</div>
          <ParamControl label="Length (L)" unit="m" value={params.L} min={0.1} max={10} step={0.1} onChange={setParam('L')} error={errors.L} />
          <ParamControl label="Gravity (g)" unit="m/s²" value={params.g} min={1} max={25} step={0.01} onChange={setParam('g')} error={errors.g} />
          <ParamControl label="Initial Angle (θ₀)" unit="°" value={params.theta0} min={1} max={45} step={0.5} onChange={setParam('theta0')} error={errors.theta0} />
          <ParamControl label="Duration" unit="s" value={params.duration} min={1} max={60} step={1} onChange={setParam('duration')} error={errors.duration} />
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
            <button className="btn-ghost btn-danger" onClick={reset}>Reset</button>
            <button className="btn-primary" onClick={runSim} style={{ flex: 1 }}>▶ Run Simulation</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Simulation</div>
          <canvas ref={canvasRef} width={400} height={300}
            style={{ width: '100%', borderRadius: 6, background: '#0d1117', border: '1px solid var(--border)' }}
            aria-label="Pendulum animation" />
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
            <div className="metric"><div className="metric-label">Period (T)</div><div className="metric-value">{fmtS(results.T)}</div></div>
            <div className="metric"><div className="metric-label">Frequency</div><div className="metric-value">{results.frequency.toFixed(3)} Hz</div></div>
            <div className="metric"><div className="metric-label">Angular Freq (ω)</div><div className="metric-value">{results.omega.toFixed(3)} rad/s</div></div>
            <div className="metric"><div className="metric-label">Initial Angle</div><div className="metric-value">{results.theta0}°</div></div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Graphs</div>
          <div className="tabs">
            {['angle', 'omega', 'energy'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'angle' ? 'Angle vs Time' : t === 'omega' ? 'Angular Velocity' : 'Energy'}
              </button>
            ))}
          </div>
          <div style={{ height: 220 }}>
            {tab === 'angle' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v) => [`${fmt(v)}°`, 'θ']} />
                  <Line type="monotone" dataKey="theta" stroke="#58a6ff" dot={false} strokeWidth={2} name="θ (°)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tab === 'omega' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="t" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#8b949e', fontSize: 11 }} tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }} labelFormatter={v => `t = ${fmt(v)} s`} formatter={(v) => [`${fmt(v)} rad/s`, 'ω']} />
                  <Line type="monotone" dataKey="thetaDot" stroke="#f0b429" dot={false} strokeWidth={2} name="ω (rad/s)" />
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
