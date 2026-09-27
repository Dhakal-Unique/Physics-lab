# PhysicsLab

> **Experiment. Simulate. Verify.**

PhysicsLab is an interactive browser-based physics lab built with React and Vite. Pick an experiment, adjust the parameters, run the simulation, watch it animate, and check whether the numbers actually agree with the physics equations. No backend, no API keys — everything runs in the browser.

Built by **Unique Dhakal**

---

## Table of Contents

- [Live Demo](#live-demo)
- [What it does](#what-it-does)
- [Experiments](#experiments)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [How Verification Works](#how-verification-works)
- [Deploying to Vercel](#deploying-to-vercel)
- [About](#about)

---

## Live Demo

**Live site:** [https://physicslab-ashen.vercel.app](https://physicslab-ashen.vercel.app)

Deploy your own copy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dhakal-Unique/Physics-lab)

Or run it locally:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in the browser.

---

## What it does

| Feature | Details |
|---|---|
| 3 Physics Experiments | Projectile Motion, Simple Pendulum, Harmonic Oscillator |
| Canvas Animations | Play, Pause, Restart, Step controls with adjustable speed |
| Synced Controls | Sliders and number inputs stay in sync |
| 4 Charts per Experiment | Trajectory, Position vs Time, Velocity vs Time, Energy vs Time |
| Physics Verification | PASS / WARNING / FAIL checks with measured value, expected value, and % error |
| Results Panel | Flight time, max height, range, impact velocity with proper units |
| Responsive | Works on desktop, tablet, and mobile |
| Input Validation | Bad values never crash the app or produce NaN |
| Tests | 30 automated unit tests across all three physics engines |

---

## Experiments

### Projectile Motion

Adjust initial velocity, launch angle, gravity, and initial height. The trajectory follows:

```
x(t) = v0 * cos(angle) * t
y(t) = h0 + v0 * sin(angle) * t - 0.5 * g * t^2
```

**Verification checks:** horizontal acceleration near zero, vertical acceleration near -g, range vs analytical formula, max height vs formula, energy conservation.

---

### Simple Pendulum

Uses the small-angle approximation:

```
theta(t) = theta0 * cos(omega * t)
omega    = sqrt(g / L)
T        = 2 * pi * sqrt(L / g)
```

Animated with a pivot, rod, bob, and motion trail. Checks period, frequency, and energy conservation.

---

### Harmonic Oscillator

Spring-mass system:

```
x(t)  = A * cos(omega * t + phi)
omega = sqrt(k / m)
```

Animated spring with zig-zag coil rendering. Checks Hooke's law, energy conservation, amplitude, and angular frequency.

---

## Project Structure

```
Physics-lab/
├── src/
│   ├── physics/
│   │   ├── projectile.js           # Projectile motion engine
│   │   ├── pendulum.js             # Pendulum engine
│   │   ├── harmonicOscillator.js   # SHM engine
│   │   └── units.js                # Unit formatting helpers
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ParamControl.jsx        # Slider + number input
│   │   ├── VerificationPanel.jsx   # PASS/WARNING/FAIL display
│   │   └── MiniProjectile.jsx      # Home page live preview
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Experiments.jsx
│   │   ├── ProjectileExperiment.jsx
│   │   ├── PendulumExperiment.jsx
│   │   ├── HarmonicExperiment.jsx
│   │   ├── About.jsx
│   │   └── DevLog.jsx
│   ├── App.jsx
│   └── index.css
├── tests/
│   ├── projectile.test.js          # 11 tests
│   ├── pendulum.test.js            # 8 tests
│   └── harmonicOscillator.test.js  # 11 tests
├── vercel.json
└── vite.config.js
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| React Router 7 | Client-side routing |
| Recharts | Interactive charts |
| HTML Canvas | Physics animations |
| Vitest | Unit testing |
| CSS Variables | Dark scientific theme |

---

## Getting Started

**Requirements:** Node.js 18+ and npm 9+

```bash
# Clone the repo
git clone https://github.com/Dhakal-Unique/Physics-lab.git
cd Physics-lab

# Install dependencies
npm install

# Start the dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all 30 unit tests |

---

## How Verification Works

After each simulation, the verification engine compares the output against what the physics equations actually predict. Every check shows:

- **Status** — PASS, WARNING, or FAIL (never hard-coded)
- **Measured value** — taken directly from the simulation data
- **Expected value** — calculated from the analytical formula
- **Percentage error** — so the difference is always quantified
- **Explanation** — plain description of what is being checked

The results change based on whatever parameters are set. Nothing is faked.

---

## Deploying to Vercel

Push the repo to GitHub, go to [vercel.com](https://vercel.com), import the repo, and click Deploy. Vercel picks up the build settings from `vercel.json` automatically.

The rewrite rule in `vercel.json` is important — it makes React Router work correctly so refreshing a URL like `/experiments/projectile` does not return a 404.

**Using the Vercel CLI instead:**

```bash
npm install -g vercel
cd Physics-lab
vercel
```

---

## About

PhysicsLab was designed and built by **Unique Dhakal**. The idea, the experiment choices, the physics engine design, and the overall product are original work by him.

**IBM Bob 2.0** was used as a coding assistant to help write and scaffold the code based on his design and specs. The creative decisions and the concept are his.

---

## Disclaimer

PhysicsLab is an educational tool. Results come from idealized physics models and are not experimental measurements.

---

## License

MIT &copy; Unique Dhakal
