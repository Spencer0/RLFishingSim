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
  const speedButtons = document.querySelectorAll('.speed-btn')

  if (!canvas || !panelContainer || !hamburgerBtn || speedButtons.length === 0) {
    console.error('Required DOM elements not found')
    return
  }

  // Create RL components
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

  // Create UI components
  const renderer = new SceneRenderer(canvas)
  const panel = new BrainPanel(panelContainer)

  // Simulation state
  let simSpeed = 1000 // ms per phase transition
  let lastTransitionTime = 0
  let animationFrameId = null

  // Wire up hamburger button
  hamburgerBtn.addEventListener('click', () => {
    panel.toggle()
  })

  // Wire up speed control buttons
  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseInt(btn.dataset.speed, 10)
      simSpeed = speed

      // Update active button styling
      speedButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      console.log(`Simulation speed set to ${speed}ms per phase`)
    })
  })

  // Function to advance simulation to next phase based on current state
  function advanceSimulation() {
    try {
      const state = simulation.state

      switch (state) {
        case 'idle':
          simulation.start()
          break
        case 'deciding':
          simulation.fish()
          break
        case 'fishing':
          simulation.sell()
          break
        case 'selling':
          simulation.rest()
          break
        case 'resting':
          simulation.nextDay()
          break
        default:
          console.warn(`Unknown simulation state: ${state}`)
          simulation.state = 'idle' // Reset to idle
      }
    } catch (error) {
      console.error('Error advancing simulation:', error)
      // Reset simulation to idle state
      simulation.state = 'idle'
      simulation.clock.reset()
      simulation.currentAction = null
      simulation.lastReward = null
    }
  }

  // Function to update UI with current simulation and agent state
  function updateUI() {
    const simStatus = simulation.getStatus()
    const agentState = agent.getState()

    // Add last action and reward to agent state for panel display
    agentState.lastAction = simStatus.currentAction
    agentState.lastReward = simStatus.market?.revenue ?? simStatus.lastReward

    // Update canvas
    renderer.render(simStatus, agentState)

    // Update panel (even if hidden, so it's ready when shown)
    panel.render(agentState)
  }

  // Animation frame loop
  function simulationLoop(timestamp) {
    // Initialize lastTransitionTime on first frame
    if (lastTransitionTime === 0) {
      lastTransitionTime = timestamp
    }

    // Check if enough time has passed for next phase transition
    if (timestamp - lastTransitionTime >= simSpeed) {
      advanceSimulation()
      updateUI()
      lastTransitionTime = timestamp
    }

    // Continue the loop
    animationFrameId = requestAnimationFrame(simulationLoop)
  }

  // Start the simulation loop
  function startSimulation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    // Initial UI update
    updateUI()

    // Start the loop
    lastTransitionTime = 0
    animationFrameId = requestAnimationFrame(simulationLoop)
    console.log('Simulation started')
  }

  // Expose day log for debugging and Playwright testing
  window.simDayLog = simulation.dayLog

  // For manual testing: expose components to global scope
  window.rlSim = {
    agent,
    environment,
    simulation,
    renderer,
    panel,
    startSimulation,
    simSpeed: () => simSpeed
  }

  // Start simulation automatically
  startSimulation()
})