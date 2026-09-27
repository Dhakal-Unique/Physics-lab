import { describe, it, expect } from 'vitest'
import { simulateProjectile, calculateProjectileResults, verifyProjectile } from '../src/physics/projectile.js'

describe('Projectile Motion', () => {
  const params45 = { v0: 20, angle: 45, g: 9.81, h0: 0 }

  it('calculates correct flight time for 45° launch', () => {
    const r = calculateProjectileResults(params45)
    // t = 2*v0*sin(theta)/g
    const expected = 2 * 20 * Math.sin(Math.PI / 4) / 9.81
    expect(r.tFlight).toBeCloseTo(expected, 3)
  })

  it('calculates correct maximum height for 45° launch', () => {
    const r = calculateProjectileResults(params45)
    // H = v0^2 * sin^2(theta) / (2g)
    const expected = 20 * 20 * 0.5 / (2 * 9.81)
    expect(r.maxHeight).toBeCloseTo(expected, 3)
  })

  it('calculates correct range for 45° launch at h0=0', () => {
    const r = calculateProjectileResults(params45)
    // R = v0^2 * sin(2*theta) / g
    const expected = 20 * 20 * Math.sin(Math.PI / 2) / 9.81
    expect(r.range).toBeCloseTo(expected, 2)
  })

  it('impact velocity equals launch velocity (energy conservation)', () => {
    const r = calculateProjectileResults(params45)
    expect(r.vImpact).toBeCloseTo(20, 2)
  })

  it('simulation data starts at (0, 0) for h0=0', () => {
    const data = simulateProjectile(params45)
    expect(data[0].x).toBeCloseTo(0, 5)
    expect(data[0].y).toBeCloseTo(0, 5)
  })

  it('simulation ends at ground level (y ≈ 0)', () => {
    const data = simulateProjectile(params45)
    const last = data[data.length - 1]
    expect(last.y).toBeCloseTo(0, 3)
  })

  it('horizontal velocity stays constant throughout', () => {
    const data = simulateProjectile(params45)
    const vx0 = data[0].vx
    for (const d of data) {
      expect(d.vx).toBeCloseTo(vx0, 4)
    }
  })

  it('maximum height occurs near mid-flight', () => {
    const data = simulateProjectile(params45)
    const apex = data.reduce((m, d) => d.y > m.y ? d : m, data[0])
    const midT = data[data.length - 1].t / 2
    expect(apex.t).toBeCloseTo(midT, 1)
  })

  it('handles initial height correctly', () => {
    const r = calculateProjectileResults({ v0: 20, angle: 45, g: 9.81, h0: 10 })
    expect(r.maxHeight).toBeGreaterThan(10)
    expect(r.tFlight).toBeGreaterThan(
      calculateProjectileResults(params45).tFlight
    )
  })

  it('passes physics verification', () => {
    const data = simulateProjectile(params45)
    const ver = verifyProjectile(data, params45)
    expect(ver.failed).toBe(0)
    expect(ver.passed).toBeGreaterThanOrEqual(4)
  })

  it('rejects invalid inputs gracefully (does not throw)', () => {
    // Edge case: very small angle
    const r = calculateProjectileResults({ v0: 20, angle: 1, g: 9.81, h0: 0 })
    expect(r.range).toBeGreaterThan(0)
    expect(r.tFlight).toBeGreaterThan(0)
  })
})
