export class BrainPanel {
  constructor(containerElement) {
    this.container = containerElement
    this.isVisible = false
  }

  render(agentState) {
    // Ensure agentState has required properties
    const state = agentState || {
      epsilon: 0,
      epsilonDecay: 0,
      epsilonMin: 0,
      learningRate: 0,
      discountFactor: 0,
      episode: 0,
      qValues: { lake: 0, river: 0 }
    }

    // Calculate Q value max for bar scaling
    const qLake = state.qValues?.lake || 0
    const qRiver = state.qValues?.river || 0
    const qMax = Math.max(Math.abs(qLake), Math.abs(qRiver), 1) // Avoid division by zero

    // Calculate bar percentages (0-100%)
    const lakeBarWidth = Math.min(100, Math.abs(qLake) / qMax * 100)
    const riverBarWidth = Math.min(100, Math.abs(qRiver) / qMax * 100)

    // Determine which action is favored
    let favoring = 'UNDECIDED'
    if (qLake > qRiver) favoring = 'LAKE'
    else if (qRiver > qLake) favoring = 'RIVER'

    // Format numbers to 4 decimal places
    const format = (num) => typeof num === 'number' ? num.toFixed(4) : '0.0000'

    this.container.innerHTML = `
      <div class="panel-section">
        <h2>Policy Parameters</h2>
        <div class="param-row">
          <span class="param-label">Epsilon (exploration)</span>
          <span class="param-value">${format(state.epsilon)}</span>
        </div>
        <div class="param-row">
          <span class="param-label">Epsilon Decay</span>
          <span class="param-value">${format(state.epsilonDecay)}</span>
        </div>
        <div class="param-row">
          <span class="param-label">Epsilon Min</span>
          <span class="param-value">${format(state.epsilonMin)}</span>
        </div>
        <div class="param-row">
          <span class="param-label">Learning Rate</span>
          <span class="param-value">${format(state.learningRate)}</span>
        </div>
        <div class="param-row">
          <span class="param-label">Discount Factor</span>
          <span class="param-value">${format(state.discountFactor)}</span>
        </div>
        <div class="param-row">
          <span class="param-label">Current Day</span>
          <span class="param-value">${state.episode || 0}</span>
        </div>
      </div>

      <div class="panel-section">
        <h2>Q Values</h2>

        <div class="q-value-row">
          <span class="q-value-label">Lake</span>
          <span class="q-value-number">${format(qLake)}</span>
        </div>
        <div class="q-value-bar-container">
          <div class="q-value-bar" style="width: ${lakeBarWidth}%"></div>
        </div>

        <div class="q-value-row">
          <span class="q-value-label">River</span>
          <span class="q-value-number">${format(qRiver)}</span>
        </div>
        <div class="q-value-bar-container">
          <div class="q-value-bar" style="width: ${riverBarWidth}%"></div>
        </div>

        <div class="favoring">
          Favoring: ${favoring}
        </div>
      </div>

      <div class="panel-section">
        <h2>Last Decision</h2>
        <div class="decision-info">
          <div class="decision-row">
            <span class="param-label">Action Taken</span>
            <span>
              ${state.lastAction ? `<span class="action-badge ${state.lastAction === 'lake' ? 'action-lake' : 'action-river'}">${state.lastAction}</span>` : 'None yet'}
            </span>
          </div>
          <div class="decision-row">
            <span class="param-label">Reward Received</span>
            <span class="param-value">${state.lastReward !== undefined ? format(state.lastReward) : '0.0000'}</span>
          </div>
        </div>
      </div>
    `
  }

  show() {
    this.container.classList.add('show')
    this.isVisible = true
  }

  hide() {
    this.container.classList.remove('show')
    this.isVisible = false
  }

  toggle() {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }
}

// Keep backward compatibility
export { BrainPanel as Panel }