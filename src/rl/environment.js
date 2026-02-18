export class FishingEnvironment {
  constructor(config = {}) {
    this.config = {
      lakeMean: 5,
      lakeStd: 3,
      riverMean: 7,
      riverStd: 3,
      ...config
    };
  }

  // Box-Muller transform for normal distribution
  sampleNormal(mean, std) {
    // Generate two uniform random numbers in (0,1] to avoid log(0)
    const u1 = 1 - Math.random(); // (0,1]
    const u2 = 1 - Math.random(); // (0,1]

    // Box-Muller transform
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Scale and shift to desired mean and std
    return z0 * std + mean;
  }

  step(action) {
    if (action !== 'lake' && action !== 'river') {
      throw new Error(`Invalid action: ${action}. Must be 'lake' or 'river'`);
    }

    const mean = this.config[`${action}Mean`];
    const std = this.config[`${action}Std`];

    // Sample from normal distribution
    let reward = this.sampleNormal(mean, std);

    // Clamp to minimum 0 (can't catch negative fish)
    reward = Math.max(0, reward);

    return {
      action,
      reward,
      fishCaught: reward
    };
  }
}