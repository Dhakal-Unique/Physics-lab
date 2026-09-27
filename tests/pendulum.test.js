import { describe, it, expect } from 'vitest'
import { simulatePendulum, calculatePendulumResults, verifyPendulum } from '../src/physics/pendulum.js'

describe('Simple Pendulum', () => {
  const params = { L: 1, g: 9.81, theta0: 20, duration: 10 }

  it('calculates correct period T = 2π√(L/g)', () => {
    const r = calculatePendulumResults(params)
    const expected = 2 * Math.PI * Math.sqrt(1 / 9.81)
    expect(r.T).toBeCloseTo(expected, 5)
  })

  it('calculates correct frequency f = 1/T', () => {
    const r = calculatePendulumResults(params)
    const T = 2 * Math.PI * Math.sqrt(1 / 9.81)
    expect(r.frequency).toBeCloseTo(1 / T, 5)
  })

  it('calculates correct angular frequency ω = √(g/L)', () => {
    const r = calculatePendulumResults(params)
    expect(r.omega).toBeCloseTo(Math.sqrt(9.81 / 1), 5)
  })

  it('period scales correctly with length', () => {
    const r1 = calculatePendulumResults({ ...params, L: 1 })
    const r4 = calculatePendulumResults({ ...params, L: 4 })
    // T ∝ √L: T(4m) = 2 * T(1m)
    expect(r4.T).toBeCloseTo(r1.T * 2, 3)
  })

  it('simulation starts at initial angle', () => {
    const data = simulatePendulum(params)
    expect(Math.abs(data[0].theta)).toBeCloseTo(20, 1)
  })

  it('simulation shows oscillatory motion (angle changes sign)', () => {
    const data = simulatePendulum(params)
    const hasPositive = data.some(d => d.theta > 1)
    const hasNegative = data.some(d => d.theta < -1)
    expect(hasPositive).toBe(true)
    expect(hasNegative).toBe(true)
  })

  it('energy conservation holds throughout simulation', () => {
    const data = simulatePendulum(params)
    const E0 = data[0].e
    const Emax = data.reduce((m, d) => Math.max(m, d.e), 0)
    const Emin = data.reduce((m, d) => Math.min(m, d.e), Infinity)
    const variation = (Emax - Emin) / E0 * 100
    expect(variation).toBeLessThan(2) // < 2% variation
  })

  it('passes physics verification', () => {
    const data = simulatePendulum(params)
    const ver = verifyPendulum(data, params)
    expect(ver.failed).toBe(0)
  })
})
