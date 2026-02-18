import { SimClock } from './clock.js'

export class DaySimulation {
  constructor(agent, environment) {
    this.agent = agent
    this.environment = environment
    this.state = 'idle'
    this.clock = new SimClock()
    this.currentAction = null
    this.lastReward = null
    this.dayLog = []
  }

  start() {
    if (this.state !== 'idle') {
      throw new Error(`Cannot start from state: ${this.state}`)
    }

    this.state = 'deciding'
    this.currentAction = this.agent.chooseAction()

    // Advance clock to 10 AM (from 8 AM)
    this.clock.tick(120) // 2 hours * 60 minutes = 120 minutes

    return this.currentAction
  }

  fish() {
    if (this.state !== 'deciding') {
      throw new Error(`Cannot fish from state: ${this.state}`)
    }

    this.state = 'fishing'
    const result = this.environment.step(this.currentAction)
    this.lastReward = result.reward

    // Advance clock to 8 PM (from 10 AM)
    // From 10 AM to 8 PM is 10 hours * 60 minutes = 600 minutes
    this.clock.tick(600)

    return this.lastReward
  }

  sell() {
    if (this.state !== 'fishing') {
      throw new Error(`Cannot sell from state: ${this.state}`)
    }

    this.state = 'selling'

    // Agent learns from the experience
    this.agent.learn(this.currentAction, this.lastReward)

    // End the episode (decays epsilon, increments episode)
    this.agent.endEpisode()

    // Log the day's results
    const dayLogEntry = {
      day: this.agent.episode, // After endEpisode, episode is incremented
      action: this.currentAction,
      reward: this.lastReward,
      qValues: this.agent.qtable.getValues(),
      epsilon: this.agent.epsilon
    }

    this.dayLog.push(dayLogEntry)

    // Advance clock to 8 PM (already at 8 PM from fish(), but ensure)
    // Actually fish() already advanced to 8 PM, so no need
    // But we could advance a bit more for realism

    return dayLogEntry
  }

  nextDay() {
    if (this.state !== 'selling') {
      throw new Error(`Cannot start next day from state: ${this.state}`)
    }

    // Reset clock for new day
    this.clock.reset()

    // Reset simulation state
    this.state = 'idle'
    this.currentAction = null
    this.lastReward = null
  }

  getStatus() {
    return {
      state: this.state,
      currentAction: this.currentAction,
      lastReward: this.lastReward,
      day: this.agent.episode,
      clock: this.clock.getTimeString()
    }
  }
}

// Keep backward compatibility
export { DaySimulation as Day }