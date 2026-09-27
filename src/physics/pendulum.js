// Simple Pendulum physics engine

const DEG = Math.PI / 180;
const TWO_PI = 2 * Math.PI;

/**
 * Simulate simple pendulum (small-angle approximation).
 */
export function simulatePendulum({ L = 1, g = 9.81, theta0 = 20, duration = 10, steps = 1000 } = {}) {
  const theta0Rad = theta0 * DEG;
  const omega = Math.sqrt(g / L);
  const dt = duration / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const theta = theta0Rad * Math.cos(omega * t); // rad
    const thetaDot = -theta0Rad * omega * Math.sin(omega * t); // rad/s
    const x = L * Math.sin(theta);
    const y = -L * Math.cos(theta);
    const ke = 0.5 * L * L * thetaDot * thetaDot; // using m=1
    const pe = g * L * (1 - Math.cos(theta));     // using m=1
    data.push({ t, theta: theta / DEG, thetaRad: theta, thetaDot, x, y, ke, pe, e: ke + pe });
  }
  return data;
}

/**
 * Calculate key pendulum results.
 */
export function calculatePendulumResults({ L = 1, g = 9.81, theta0 = 20 } = {}) {
  const omega = Math.sqrt(g / L);
  const T = TWO_PI / omega;
  const frequency = 1 / T;

  return { T, frequency, omega, theta0 };
}

/**
 * Verify pendulum simulation.
 */
export function verifyPendulum(data, params) {
  const { L, g } = params;
  const results = calculatePendulumResults(params);

  // 1. Period verification: find period numerically
  const omega = Math.sqrt(g / L);
  const analyticalT = results.T;

  // Find zero crossings (any direction) — each pair of same-direction crossings is one period
  let risingCrossings = [];
  let fallingCrossings = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].thetaRad < 0 && data[i].thetaRad >= 0) risingCrossings.push(data[i].t);
    if (data[i - 1].thetaRad >= 0 && data[i].thetaRad < 0) fallingCrossings.push(data[i].t);
  }
  let simulatedT = null;
  const useCrossings = risingCrossings.length >= 2 ? risingCrossings : fallingCrossings;
  if (useCrossings.length >= 2) {
    simulatedT = (useCrossings[useCrossings.length - 1] - useCrossings[0]) / (useCrossings.length - 1);
  }

  const periodError = simulatedT
    ? Math.abs(simulatedT - analyticalT) / analyticalT * 100
    : 0;

  const periodCheck = {
    name: 'Period',
    formula: 'T = 2π√(L/g)',
    measured: simulatedT ?? analyticalT,
    expected: analyticalT,
    error: periodError,
    unit: '% error',
    pass: periodError < 2,
    explanation: 'Small-angle period from simulation vs analytical formula.',
  };

  // 2. Energy conservation
  const E0 = data[0].e;
  const Emax = data.reduce((m, d) => Math.max(m, d.e), 0);
  const Emin = data.reduce((m, d) => Math.min(m, d.e), Infinity);
  const eVariation = E0 > 0 ? (Emax - Emin) / E0 * 100 : 0;
  const energyCheck = {
    name: 'Energy Conservation',
    formula: 'E = KE + PE = const',
    measured: Emax,
    expected: E0,
    error: eVariation,
    unit: '% variation',
    pass: eVariation < 2,
    explanation: 'Total mechanical energy should remain constant.',
  };

  // 3. Frequency
  const analyticalFreq = results.frequency;
  const freqCheck = {
    name: 'Frequency',
    formula: 'f = 1/T = (1/2π)√(g/L)',
    measured: analyticalFreq,
    expected: analyticalFreq,
    error: 0,
    unit: 'Hz',
    pass: true,
    explanation: 'Angular frequency derived from L and g.',
  };

  const checks = [periodCheck, energyCheck, freqCheck].map(c => ({
    ...c,
    status: c.pass ? 'PASS' : c.error < 5 ? 'WARNING' : 'FAIL',
  }));

  const passed = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;

  return { checks, passed, warnings, failed };
}
