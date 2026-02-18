import { FishingAgent } from './rl/agent.js'
import { FishingEnvironment } from './rl/environment.js'
import { QTable } from './rl/qtable.js'
import { SimClock } from './sim/clock.js'
import { DaySimulation } from './sim/day.js'
import { SceneRenderer } from './ui/canvas.js'
import { BrainPanel } from './ui/panel.js'

console.log('RL Fishing Sim loaded')

// Entry point will be called after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')

  // Get DOM elements
  const canvas = document.getElementById('main-canvas')
  const panelContainer = document.getElementById('brain-panel')
  const hamburgerBtn = document.getElementById('hamburger-btn')

  if (!canvas || !panelContainer || !hamburgerBtn) {
    console.error('Required DOM elements not found')
    return
  }

  // Create UI components
  const renderer = new SceneRenderer(canvas)
  const panel = new BrainPanel(panelContainer)

  // Wire up hamburger button
  hamburgerBtn.addEventListener('click', () => {
    panel.toggle()
  })

  // Create RL components for demo
  const agent = new FishingAgent({
    epsilon: 1.0,
    epsilonDecay: 0.995,
    epsilonMin: 0.05,
    learningRate: 0.1,
    discountFactor: 0.9
  })

  const environment = new FishingEnvironment({
    lakeMean: 5,
    lakeStd: 3,
    riverMean: 7,
    riverStd: 3
  })

  const simulation = new DaySimulation(agent, environment)

  // Initial render with demo data
  const demoAgentState = agent.getState()
  demoAgentState.lastAction = 'lake'
  demoAgentState.lastReward = 5.3

  panel.render(demoAgentState)

  // Initial canvas render with demo simulation status
  const demoSimStatus = simulation.getStatus()
  renderer.render(demoSimStatus, demoAgentState)

  console.log('UI components initialized')
  console.log('Click the hamburger button (☰) to toggle the brain panel')

  // For manual testing: expose components to global scope
  window.rlSim = {
    agent,
    environment,
    simulation,
    renderer,
    panel
  }
})