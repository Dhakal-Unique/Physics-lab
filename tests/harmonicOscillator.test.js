import { describe, it, expect } from 'vitest'
import { simulateHarmonicOscillator, calculateOscillatorResults, verifyOscillator } from '../src/physics/harmonicOscillator.js'

describe('Harmonic Oscillator', () => {
  const params = { mass: 1, k: 10, x0: 1, v0: 0, duration: 10 }

  it('calculates correct angular frequency ω = √(k/m)', () => {
    const r = calculateOscillatorResults(params)
    expect(r.omega).toBeCloseTo(Math.sqrt(10 / 1), 5)
  })

  it('calculates correct period T = 2π/ω', () => {
    const r = calculateOscillatorResults(params)
    const omega = Math.sqrt(10)
    expect(r.T).toBeCloseTo(2 * Math.PI / omega, 5)
  })

  it('calculates correct amplitude for x0≠0, v0=0', () => {
    const r = calculateOscillatorResults(params)
    expect(r.A).toBeCloseTo(1, 5)
  })

  it('amplitude is correct when both x0 and v0 are nonzero', () => {
    const r = calculateOscillatorResults({ mass: 1, k: 10, x0: 1, v0: 1 })
    const omega = Math.sqrt(10)
    const expected = Math.sqrt(1 + (1 / omega) ** 2)
    expect(r.A).toBeCloseTo(expected, 5)
  })

  it('simulation starts at initial displacement x0', () => {
    const data = simulateHarmonicOscillator(params)
    expect(data[0].x).toBeCloseTo(1, 4)
  })

  it('simulation starts at initial velocity v0', () => {
    const data = simulateHarmonicOscillator(params)
    expect(data[0].v).toBeCloseTo(0, 4)
  })

  it('maximum displacement equals amplitude', () => {
    const data = simulateHarmonicOscillator(params)
    const maxX = data.reduce((m, d) => Math.max(m, Math.abs(d.x)), 0)
    expect(maxX).toBeCloseTo(1, 2)
  })

  it('energy conservation: total energy stays constant', () => {
    const data = simulateHarmonicOscillator(params)
    const E0 = data[0].e
    const Emax = data.reduce((m, d) => Math.max(m, d.e), 0)
    const Emin = data.reduce((m, d) => Math.min(m, d.e), Infinity)
    const variation = (Emax - Emin) / E0 * 100
    expect(variation).toBeLessThan(1)
  })

  it("Hooke's law: acceleration = -(k/m)*x", () => {
    const data = simulateHarmonicOscillator(params)
    const omega2 = 10 / 1
    for (let i = 0; i < data.length; i += 50) {
      expect(data[i].a).toBeCloseTo(-omega2 * data[i].x, 6)
    }
  })

  it('passes physics verification', () => {
    const data = simulateHarmonicOscillator(params)
    const ver = verifyOscillator(data, params)
    expect(ver.failed).toBe(0)
    expect(ver.passed).toBeGreaterThanOrEqual(3)
  })

  it('handles nonzero initial velocity', () => {
    const data = simulateHarmonicOscillator({ mass: 1, k: 10, x0: 0, v0: 2 })
    const E0 = data[0].e
    expect(E0).toBeCloseTo(0.5 * 1 * 4, 4) // 0.5 * m * v0^2
  })
})
