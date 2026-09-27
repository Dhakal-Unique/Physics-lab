import { useEffect, useRef } from 'react'
import { simulateProjectile } from '../physics/projectile'

// Small canvas projectile preview for the home page
export default function MiniProjectile() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const data = simulateProjectile({ v0: 20, angle: 45, g: 9.81, h0: 0, steps: 200 })

    const W = canvas.width
    const H = canvas.height
    const pad = 20
    const maxX = data[data.length - 1].x
    const maxY = Math.max(...data.map(d => d.y))

    const sx = x => pad + (x / maxX) * (W - 2 * pad)
    const sy = y => H - pad - (y / (maxY * 1.1)) * (H - 2 * pad)

    ctx.clearRect(0, 0, W, H)

    // ground
    ctx.strokeStyle = '#30363d'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, H - pad)
    ctx.lineTo(W - pad, H - pad)
    ctx.stroke()

    // grid lines
    ctx.strokeStyle = '#1c2230'
    ctx.lineWidth = 0.5
    for (let i = 1; i < 4; i++) {
      const y = pad + i * (H - 2 * pad) / 4
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke()
    }

    // trajectory
    ctx.strokeStyle = '#58a6ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    data.forEach((d, i) => {
      if (i === 0) ctx.moveTo(sx(d.x), sy(d.y))
      else ctx.lineTo(sx(d.x), sy(d.y))
    })
    ctx.stroke()

    // launch dot
    ctx.fillStyle = '#3fb950'
    ctx.beginPath()
    ctx.arc(sx(0), sy(0), 4, 0, Math.PI * 2)
    ctx.fill()

    // landing dot
    const last = data[data.length - 1]
    ctx.fillStyle = '#f85149'
    ctx.beginPath()
    ctx.arc(sx(last.x), sy(0), 4, 0, Math.PI * 2)
    ctx.fill()

    // apex
    const apex = data.reduce((m, d) => d.y > m.y ? d : m, data[0])
    ctx.fillStyle = '#d29922'
    ctx.beginPath()
    ctx.arc(sx(apex.x), sy(apex.y), 3, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={180}
      style={{ width: '100%', maxWidth: 480, borderRadius: 6, background: '#0d1117', border: '1px solid var(--border)' }}
      aria-label="Mini projectile trajectory preview"
    />
  )
}
