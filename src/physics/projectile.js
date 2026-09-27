// Projectile motion physics engine

const DEG = Math.PI / 180;

/**
 * Simulate projectile motion.
 * Returns an array of {t, x, y, vx, vy, v, ke, pe, e} data points.
 */
export function simulateProjectile({ v0 = 20, angle = 45, g = 9.81, h0 = 0, mass = 1, steps = 500 } = {}) {
  const theta = angle * DEG;
  const vx = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  // Time of flight: solve y(t)=0  =>  h0 + vy0*t - 0.5*g*t^2 = 0
  const disc = vy0 * vy0 + 2 * g * h0;
  const tFlight = disc < 0 ? 0 : (vy0 + Math.sqrt(disc)) / g;

  const dt = tFlight / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const x = vx * t;
    const y = h0 + vy0 * t - 0.5 * g * t * t;
    const vy = vy0 - g * t;
    const v = Math.sqrt(vx * vx + vy * vy);
    const ke = 0.5 * mass * v * v;
    const pe = mass * g * Math.max(y, 0);
    data.push({ t, x, y: Math.max(y, 0), vy, vx, v, ke, pe, e: ke + pe });
  }
  return data;
}

/**
 * Calculate key projectile results from parameters.
 */
export function calculateProjectileResults({ v0 = 20, angle = 45, g = 9.81, h0 = 0, mass = 1 } = {}) {
  const theta = angle * DEG;
  const vx = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  const disc = vy0 * vy0 + 2 * g * h0;
  const tFlight = disc < 0 ? 0 : (vy0 + Math.sqrt(disc)) / g;
  const range = vx * tFlight;

  const maxHeight = h0 + (vy0 * vy0) / (2 * g);

  const vyImpact = vy0 - g * tFlight;
  const vImpact = Math.sqrt(vx * vx + vyImpact * vyImpact);
  const impactAngle = Math.atan2(Math.abs(vyImpact), vx) / DEG;

  const maxV = v0; // at launch (maximum for typical angles since energy conserved)
  const minV = Math.abs(vx); // at apex

  return {
    tFlight,
    range,
    maxHeight,
    vImpact,
    impactAngle,
    maxV,
    minV,
    vx,
    vy0,
  };
}

/**
 * Verify projectile simulation against analytical physics.
 */
export function verifyProjectile(data, params) {
  const { v0, angle, g, h0, mass = 1 } = params;
  const theta = angle * DEG;
  const vx = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  const results = calculateProjectileResults(params);
  const { range, maxHeight, tFlight } = results;

  // 1. Horizontal velocity is constant (ax ≈ 0)
  const axMeasured = (data[data.length - 1].vx - data[0].vx) / data[data.length - 1].t;
  const axCheck = {
    name: 'Horizontal Acceleration',
    formula: 'aₓ ≈ 0 m/s²',
    measured: axMeasured,
    expected: 0,
    error: Math.abs(axMeasured),
    unit: 'm/s²',
    pass: Math.abs(axMeasured) < 0.01,
    explanation: 'No horizontal force acts on the projectile, so horizontal velocity should be constant.',
  };

  // 2. Vertical acceleration ≈ -g
  const ayMeasured = (data[data.length - 1].vy - data[0].vy) / data[data.length - 1].t;
  const ayCheck = {
    name: 'Vertical Acceleration',
    formula: 'aᵧ ≈ -g',
    measured: ayMeasured,
    expected: -g,
    error: Math.abs(ayMeasured - (-g)),
    unit: 'm/s²',
    pass: Math.abs(ayMeasured - (-g)) < 0.05,
    explanation: 'Gravity accelerates the projectile downward at g m/s².',
  };

  // 3. Range vs analytical
  const analyticalRange = h0 === 0
    ? (v0 * v0 * Math.sin(2 * theta)) / g
    : vx * tFlight;
  const simRange = data[data.length - 1].x;
  const rangeError = Math.abs(simRange - analyticalRange) / Math.max(analyticalRange, 1e-9) * 100;
  const rangeCheck = {
    name: 'Horizontal Range',
    formula: h0 === 0 ? 'R = v₀²sin(2θ)/g' : 'R = vₓ · t_flight',
    measured: simRange,
    expected: analyticalRange,
    error: rangeError,
    unit: '% error',
    pass: rangeError < 1,
    explanation: 'Compares simulated landing distance with analytical formula.',
  };

  // 4. Maximum height vs analytical
  const analyticalH = h0 + (vy0 * vy0) / (2 * g);
  const simH = data.reduce((m, d) => Math.max(m, d.y), 0);
  const hError = Math.abs(simH - analyticalH) / Math.max(analyticalH, 1e-9) * 100;
  const heightCheck = {
    name: 'Maximum Height',
    formula: 'H = h₀ + v₀²sin²θ / (2g)',
    measured: simH,
    expected: analyticalH,
    error: hError,
    unit: '% error',
    pass: hError < 1,
    explanation: 'Compares simulated peak height with analytical formula.',
  };

  // 5. Energy conservation
  const E0 = data[0].e;
  const Ef = data[data.length - 1].e;
  const eError = Math.abs(Ef - E0) / Math.max(E0, 1e-9) * 100;
  const energyCheck = {
    name: 'Energy Conservation',
    formula: 'E_final ≈ E_initial',
    measured: Ef,
    expected: E0,
    error: eError,
    unit: '% error',
    pass: eError < 1,
    warning: eError < 5,
    explanation: 'Total mechanical energy should remain constant in ideal projectile motion.',
  };

  const checks = [axCheck, ayCheck, rangeCheck, heightCheck, energyCheck].map(c => ({
    ...c,
    status: c.pass ? 'PASS' : c.warning ? 'WARNING' : 'FAIL',
  }));

  const passed = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;

  return { checks, passed, warnings, failed };
}
