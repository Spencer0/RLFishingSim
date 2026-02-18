# RL Fishing Sim

A reinforcement learning fishing simulation built with vanilla JavaScript and Vite.

## Project Structure

```
src/
├── rl/           # Reinforcement learning components
│   ├── agent.js
│   ├── environment.js
│   └── qtable.js
├── sim/          # Simulation components
│   ├── clock.js
│   └── day.js
├── ui/           # UI components
│   ├── canvas.js
│   └── panel.js
└── main.js       # Entry point

test/             # Unit tests mirroring src/rl/
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Development

This project uses:
- **Vite** for bundling and development server
- **Vitest** for unit testing
- **Vanilla JavaScript** (no frameworks)

All RL logic will be implemented in the `src/rl/` directory.