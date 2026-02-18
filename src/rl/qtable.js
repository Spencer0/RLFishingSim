export class QTable {
  constructor() {
    this.values = {
      lake: 0.0,
      river: 0.0
    };
  }

  getValue(action) {
    if (!(action in this.values)) {
      throw new Error(`Invalid action: ${action}`);
    }
    return this.values[action];
  }

  update(action, reward, learningRate, discountFactor) {
    if (!(action in this.values)) {
      throw new Error(`Invalid action: ${action}`);
    }

    // max(Q) - maximum Q value across all actions
    const maxQ = Math.max(this.values.lake, this.values.river);

    // Q-learning update rule
    this.values[action] += learningRate * (reward + discountFactor * maxQ - this.values[action]);
  }

  getValues() {
    return { ...this.values };
  }

  reset() {
    this.values.lake = 0.0;
    this.values.river = 0.0;
  }
}