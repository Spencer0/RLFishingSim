export class DayLogPanel {
  constructor(containerElement) {
    this.container = containerElement
    this.isVisible = false
  }

  render(dayLog = []) {
    if (!Array.isArray(dayLog)) {
      this.container.innerHTML = '<h2>Day Log</h2><p>Log unavailable.</p>'
      return
    }

    const entries = dayLog.slice().reverse().slice(0, 40)

    const rows = entries.length === 0
      ? '<p>No days completed yet. Start the simulation to generate log entries.</p>'
      : entries.map(entry => {
        const actionEmoji = entry.action === 'lake' ? '🏞️' : '🌊'
        const catchCount = Math.round(entry.reward ?? 0)
        const revenue = entry.market?.revenue ?? 0
        const price = entry.market?.pricePerFish ?? 0

        return `
          <div class="log-entry">
            <div><strong>Day ${entry.day}</strong> ${actionEmoji} ${entry.action}</div>
            <div>🎣 Catch: ${catchCount} fish</div>
            <div>🪙 Price: ${price.toFixed(2)} / fish</div>
            <div>💰 Revenue: ${revenue.toFixed(2)}</div>
            <div>ε: ${(entry.epsilon ?? 0).toFixed(4)}</div>
          </div>
        `
      }).join('')

    this.container.innerHTML = `
      <div class="panel-section">
        <h2>Day Log</h2>
        <p style="font-size:13px; color:#9fb3d1; margin-top:0;">Most recent 40 days (newest first).</p>
        ${rows}
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
    if (this.isVisible) this.hide()
    else this.show()
  }
}
