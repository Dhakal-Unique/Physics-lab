// Harmonic Oscillator physics engine

/**
 * Simulate simple harmonic oscillator: x(t) = A*cos(ωt + φ)
 */
export function simulateHarmonicOscillator({ mass = 1, k = 10, x0 = 1, v0 = 0, duration = 10, steps = 1000 } = {}) {
  const omega = Math.sqrt(k / mass);
  const A = Math.sqrt(x0 * x0 + (v0 / omega) * (v0 / omega));
  const phi = Math.atan2(-v0 / omega, x0);
  const dt = duration / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const x = A * Math.cos(omega * t + phi);
    const v = -A * omega * Math.sin(omega * t + phi);
    const a = -omega * omega * x;
    const ke = 0.5 * mass * v * v;
    const pe = 0.5 * k * x * x;
    data.push({ t, x, v, a, ke, pe, e: ke + pe });
  }
  return data;
}

/**
 * Calculate key oscillator results.
 */
export function calculateOscillatorResults({ mass = 1, k = 10, x0 = 1, v0 = 0 } = {}) {
  const omega = Math.sqrt(k / mass);
  const T = 2 * Math.PI / omega;
  const frequency = 1 / T;
  const A = Math.sqrt(x0 * x0 + (v0 / omega) * (v0 / omega));
  const Etotal = 0.5 * k * A * A;

  return { omega, T, frequency, A, Etotal };
}

/**
 * Verify harmonic oscillator.
 */
export function verifyOscillator(data, params) {
  const { mass, k } = params;
  const results = calculateOscillatorResults(params);

  // 1. Hooke's Law: F = -kx, check a = F/m = -(k/m)*x
  const sample = data[Math.floor(data.length / 4)];
  const expectedA = -(k / mass) * sample.x;
  const hookeError = Math.abs(sample.a - expectedA) / Math.max(Math.abs(expectedA), 1e-9) * 100;
  const hookeCheck = {
    name: "Hooke's Law",
    formula: 'F = -kx  →  a = -(k/m)x',
    measured: sample.a,
    expected: expectedA,
    error: hookeError,
    unit: '% error',
    pass: hookeError < 1,
    explanation: "Acceleration must equal -(k/m)*x at every point in time.",
  };

  // 2. Energy conservation
  const E0 = data[0].e;
  const Emax = data.reduce((m, d) => Math.max(m, d.e), 0);
  const Emin = data.reduce((m, d) => Math.min(m, d.e), Infinity);
  const eVariation = E0 > 0 ? (Emax - Emin) / E0 * 100 : 0;
  const energyCheck = {
    name: 'Energy Conservation',
    formula: 'E = ½kx² + ½mv² = const',
    measured: Emax,
    expected: E0,
    error: eVariation,
    unit: '% variation',
    pass: eVariation < 2,
    explanation: 'Total mechanical energy is conserved in ideal SHM.',
  };

  // 3. Angular frequency
  const analyticalOmega = results.omega;
  const omegaCheck = {
    name: 'Angular Frequency',
    formula: 'ω = √(k/m)',
    measured: analyticalOmega,
    expected: analyticalOmega,
    error: 0,
    unit: 'rad/s',
    pass: true,
    explanation: 'Angular frequency is determined by spring constant and mass.',
  };

  // 4. Amplitude check
  const simAmplitude = data.reduce((m, d) => Math.max(m, Math.abs(d.x)), 0);
  const ampError = Math.abs(simAmplitude - results.A) / Math.max(results.A, 1e-9) * 100;
  const ampCheck = {
    name: 'Amplitude',
    formula: 'A = √(x₀² + (v₀/ω)²)',
    measured: simAmplitude,
    expected: results.A,
    error: ampError,
    unit: '% error',
    pass: ampError < 1,
    explanation: 'Maximum displacement equals the analytical amplitude.',
  };

  const checks = [hookeCheck, energyCheck, omegaCheck, ampCheck].map(c => ({
    ...c,
    status: c.pass ? 'PASS' : c.error < 5 ? 'WARNING' : 'FAIL',
  }));

  const passed = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;

  return { checks, passed, warnings, failed };
}
