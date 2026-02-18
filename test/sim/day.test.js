import { DaySimulation } from '../../src/sim/day.js'
import { FishingAgent } from '../../src/rl/agent.js'
import { FishingEnvironment } from '../../src/rl/environment.js'

describe('DaySimulation', () => {
  let agent, environment, sim

  beforeEach(() => {
    agent = new FishingAgent({ epsilon: 0.0 }) // Deterministic for testing
    environment = new FishingEnvironment()
    sim = new DaySimulation(agent, environment)
  })

  it('initial state is idle', () => {
    expect(sim.state).toBe('idle')
    expect(sim.getStatus().state).toBe('idle')
  })

  it('start() sets state to deciding and sets currentAction', () => {
    const action = sim.start()

    expect(sim.state).toBe('deciding')
    expect(sim.currentAction).toBe(action)
    expect(sim.getStatus().state).toBe('deciding')
    expect(sim.getStatus().currentAction).toBe(action)
  })

  it('currentAction after start() is "lake" or "river"', () => {
    sim.start()

    expect(['lake', 'river']).toContain(sim.currentAction)
    expect(['lake', 'river']).toContain(sim.getStatus().currentAction)
  })

  it('fish() sets state to fishing and sets lastReward', () => {
    sim.start()
    const reward = sim.fish()

    expect(sim.state).toBe('fishing')
    expect(sim.lastReward).toBe(reward)
    expect(sim.getStatus().state).toBe('fishing')
    expect(sim.getStatus().lastReward).toBe(reward)
    expect(sim.lastReward).toBeGreaterThanOrEqual(0)
  })

  it('sell() sets state to selling and pushes to dayLog', () => {
    sim.start()
    sim.fish()
    const logEntry = sim.sell()

    expect(sim.state).toBe('selling')
    expect(sim.dayLog).toHaveLength(1)
    expect(sim.dayLog[0]).toBe(logEntry)
  })

  it('dayLog entry has all required keys', () => {
    sim.start()
    sim.fish()
    const logEntry = sim.sell()

    const expectedKeys = ['day', 'action', 'reward', 'qValues', 'epsilon']
    expectedKeys.forEach(key => {
      expect(logEntry).toHaveProperty(key)
    })

    expect(logEntry.qValues).toHaveProperty('lake')
    expect(logEntry.qValues).toHaveProperty('river')
    expect(typeof logEntry.day).toBe('number')
    expect(['lake', 'river']).toContain(logEntry.action)
    expect(typeof logEntry.reward).toBe('number')
    expect(typeof logEntry.epsilon).toBe('number')
  })

  it('After sell(), agent.episode has incremented', () => {
    const initialEpisode = agent.episode

    sim.start()
    sim.fish()
    sim.sell()

    expect(agent.episode).toBe(initialEpisode + 1)
    expect(sim.dayLog[0].day).toBe(initialEpisode + 1)
  })

  it('Running start→fish→sell 50 times fills dayLog with 50 entries', () => {
    for (let i = 0; i < 50; i++) {
      sim.start()
      sim.fish()
      sim.sell()
      sim.nextDay()
    }

    expect(sim.dayLog).toHaveLength(50)
    expect(sim.state).toBe('idle')

    // Verify each entry has unique day number (should increment)
    const days = sim.dayLog.map(entry => entry.day)
    const uniqueDays = new Set(days)
    expect(uniqueDays.size).toBe(50)

    // Verify days are sequential
    for (let i = 0; i < days.length - 1; i++) {
      expect(days[i + 1]).toBe(days[i] + 1)
    }
  })
})