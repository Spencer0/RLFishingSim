import { FishingAgent } from '../../src/rl/agent.js'

describe('FishingAgent', () => {
  let agent

  beforeEach(() => {
    agent = new FishingAgent()
  })

  it('initializes with correct default config', () => {
    const state = agent.getState()
    expect(state.epsilon).toBe(1.0)
    expect(state.epsilonDecay).toBe(0.995)
    expect(state.epsilonMin).toBe(0.05)
    expect(state.learningRate).toBe(0.1)
    expect(state.discountFactor).toBe(0.9)
    expect(state.episode).toBe(0)
    expect(state.qValues).toEqual({ lake: 0, river: 0 })
  })

  it('chooseAction() returns "lake" or "river" (nothing else)', () => {
    const actions = new Set()

    // Test many times to increase confidence
    for (let i = 0; i < 100; i++) {
      actions.add(agent.chooseAction())
    }

    expect(actions.has('lake')).toBe(true)
    expect(actions.has('river')).toBe(true)
    expect(actions.size).toBe(2)
  })

  it('With epsilon=1.0, chooseAction() is random (run 1000 times, both actions appear)', () => {
    agent = new FishingAgent({ epsilon: 1.0 })
    let lakeCount = 0
    let riverCount = 0
    const trials = 1000

    for (let i = 0; i < trials; i++) {
      const action = agent.chooseAction()
      if (action === 'lake') lakeCount++
      else if (action === 'river') riverCount++
    }

    // Both actions should appear at least once
    expect(lakeCount).toBeGreaterThan(0)
    expect(riverCount).toBeGreaterThan(0)

    // Roughly equal distribution (should be close to 50/50)
    // With epsilon=1.0, it's pure random, so expect ~500 each
    // Use tolerance of ±100 (should be very unlikely to fail)
    expect(lakeCount).toBeGreaterThan(trials * 0.4)
    expect(lakeCount).toBeLessThan(trials * 0.6)
  })

  it('With epsilon=0.0, chooseAction() always picks the highest Q value action', () => {
    agent = new FishingAgent({ epsilon: 0.0 })

    // First test with equal Q values (should pick randomly, but that's OK)
    // Actually with equal Q values, our implementation picks randomly
    // So we need to set different Q values

    // Set higher Q value for lake
    agent.qtable.update('lake', 10, 0.1, 0.9)

    // Should always pick lake now
    for (let i = 0; i < 100; i++) {
      expect(agent.chooseAction()).toBe('lake')
    }

    // Now set higher Q value for river
    agent.qtable.reset()
    agent.qtable.update('river', 10, 0.1, 0.9)

    for (let i = 0; i < 100; i++) {
      expect(agent.chooseAction()).toBe('river')
    }
  })

  it('learn() updates the qtable (Q value for chosen action changes)', () => {
    const initialLakeValue = agent.qtable.getValue('lake')
    const initialRiverValue = agent.qtable.getValue('river')

    agent.learn('lake', 5)

    expect(agent.qtable.getValue('lake')).not.toBe(initialLakeValue)
    expect(agent.qtable.getValue('river')).toBe(initialRiverValue) // Should not change
  })

  it('endEpisode() increments episode counter', () => {
    expect(agent.getState().episode).toBe(0)

    agent.endEpisode()
    expect(agent.getState().episode).toBe(1)

    agent.endEpisode()
    expect(agent.getState().episode).toBe(2)
  })

  it('endEpisode() decays epsilon but not below epsilonMin', () => {
    agent = new FishingAgent({ epsilon: 0.5, epsilonDecay: 0.5, epsilonMin: 0.2 })

    // First decay: 0.5 * 0.5 = 0.25 (above epsilonMin)
    agent.endEpisode()
    expect(agent.getState().epsilon).toBe(0.25)

    // Second decay: 0.25 * 0.5 = 0.125 (below epsilonMin, should clamp to 0.2)
    agent.endEpisode()
    expect(agent.getState().epsilon).toBe(0.2)

    // Further decays should stay at epsilonMin
    agent.endEpisode()
    expect(agent.getState().epsilon).toBe(0.2)
  })

  it('After 200 endEpisode() calls, epsilon equals epsilonMin', () => {
    const epsilonMin = 0.05
    // Use epsilonDecay=0.9 so that after 200 episodes, epsilon will be clamped to epsilonMin
    agent = new FishingAgent({ epsilon: 1.0, epsilonDecay: 0.9, epsilonMin })

    // Apply 200 episodes
    for (let i = 0; i < 200; i++) {
      agent.endEpisode()
    }

    // Epsilon should decay to epsilonMin (clamped)
    expect(agent.getState().epsilon).toBe(epsilonMin)
  })

  it('getState() returns object with all expected keys', () => {
    const state = agent.getState()

    const expectedKeys = [
      'epsilon', 'episode', 'learningRate', 'discountFactor',
      'epsilonDecay', 'epsilonMin', 'qValues'
    ]

    expectedKeys.forEach(key => {
      expect(state).toHaveProperty(key)
    })

    // Check nested structure
    expect(state.qValues).toHaveProperty('lake')
    expect(state.qValues).toHaveProperty('river')
  })

  it('reset() restores initial state', () => {
    // Modify some state
    agent.learn('lake', 5)
    agent.endEpisode()
    agent.endEpisode()

    // Store initial epsilon from config
    const initialEpsilon = agent.config.epsilon

    // Reset
    agent.reset()

    const state = agent.getState()
    expect(state.episode).toBe(0)
    expect(state.epsilon).toBe(initialEpsilon)
    expect(state.qValues.lake).toBe(0)
    expect(state.qValues.river).toBe(0)
  })
})