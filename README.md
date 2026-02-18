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

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that:

1. Installs dependencies with `npm ci`
2. Runs tests with `npm test -- --run`
3. Builds the site with the right base path for GitHub Pages
4. Deploys the `dist/` output to GitHub Pages

### One-time GitHub setup

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger if it is different).
4. Push to `main` (or run the workflow manually from the Actions tab).

After the workflow finishes, your site will be live at:

- `https://<username>.github.io/<repo>/` for project pages
- `https://<username>.github.io/` if your repo name ends with `.github.io`
