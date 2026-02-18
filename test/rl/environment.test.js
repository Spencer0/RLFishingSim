import { FishingEnvironment } from '../../src/rl/environment.js'

describe('FishingEnvironment', () => {
  let env

  beforeEach(() => {
    env = new FishingEnvironment()
  })

  it('step() returns an object with action, reward, fishCaught', () => {
    const result = env.step('lake')
    expect(result).toHaveProperty('action', 'lake')
    expect(result).toHaveProperty('reward')
    expect(result).toHaveProperty('fishCaught')
    expect(result.reward).toBe(result.fishCaught)
  })

  it('fishCaught is always >= 0', () => {
    // Test many times to account for randomness
    for (let i = 0; i < 100; i++) {
      const lakeResult = env.step('lake')
      const riverResult = env.step('river')
      expect(lakeResult.fishCaught).toBeGreaterThanOrEqual(0)
      expect(riverResult.fishCaught).toBeGreaterThanOrEqual(0)
    }
  })

  it('Over 1000 samples, river mean reward is higher than lake mean reward', () => {
    let lakeTotal = 0
    let riverTotal = 0
    const samples = 1000

    for (let i = 0; i < samples; i++) {
      lakeTotal += env.step('lake').reward
      riverTotal += env.step('river').reward
    }

    const lakeMean = lakeTotal / samples
    const riverMean = riverTotal / samples

    // River should have higher mean (7 vs 5 from defaults)
    expect(riverMean).toBeGreaterThan(lakeMean)
  })

  it('sampleNormal produces values within reasonable range (mean ± 4*std)', () => {
    const mean = 5
    const std = 3
    const samples = 1000
    let withinRange = 0

    for (let i = 0; i < samples; i++) {
      const value = env.sampleNormal(mean, std)
      if (value >= mean - 4 * std && value <= mean + 4 * std) {
        withinRange++
      }
    }

    // At least 99.9% of samples should be within mean ± 4*std
    // This is a statistical test that should pass for normal distribution
    expect(withinRange / samples).toBeGreaterThanOrEqual(0.999)
  })
})