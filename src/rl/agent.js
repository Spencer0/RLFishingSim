import { QTable } from './qtable.js'

export class FishingAgent {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      epsilon: 1.0,
      epsilonDecay: 0.995,
      epsilonMin: 0.05,
      learningRate: 0.1,
      discountFactor: 0.9,
      ...config
    }

    // Initialize from config
    this.epsilon = this.config.epsilon
    this.epsilonDecay = this.config.epsilonDecay
    this.epsilonMin = this.config.epsilonMin
    this.learningRate = this.config.learningRate
    this.discountFactor = this.config.discountFactor

    // RL components
    this.qtable = new QTable()
    this.episode = 0
  }

  chooseAction() {
    // Epsilon-greedy action selection
    if (Math.random() < this.epsilon) {
      // Random exploration: choose lake or river with equal probability
      return Math.random() < 0.5 ? 'lake' : 'river'
    } else {
      // Greedy exploitation: choose action with highest Q value
      const values = this.qtable.getValues()

      // If Q values are equal, choose randomly
      if (values.lake === values.river) {
        return Math.random() < 0.5 ? 'lake' : 'river'
      }

      // Otherwise return action with higher Q value
      return values.lake > values.river ? 'lake' : 'river'
    }
  }

  learn(action, reward) {
    this.qtable.update(action, reward, this.learningRate, this.discountFactor)
  }

  endEpisode() {
    this.episode++
    // Decay epsilon
    this.epsilon = Math.max(this.epsilon * this.epsilonDecay, this.epsilonMin)
  }

  getState() {
    return {
      epsilon: this.epsilon,
      episode: this.episode,
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      epsilonDecay: this.epsilonDecay,
      epsilonMin: this.epsilonMin,
      qValues: this.qtable.getValues()
    }
  }

  reset() {
    this.qtable.reset()
    this.episode = 0
    this.epsilon = this.config.epsilon
  }
}

// Keep backward compatibility
export class Agent {}