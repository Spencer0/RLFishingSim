import { Agent } from './rl/agent.js'
import { Environment } from './rl/environment.js'
import { QTable } from './rl/qtable.js'
import { Clock } from './sim/clock.js'
import { Day } from './sim/day.js'
import { Canvas } from './ui/canvas.js'
import { Panel } from './ui/panel.js'

console.log('RL Fishing Sim loaded')
console.log({ Agent, Environment, QTable, Clock, Day, Canvas, Panel })

// Entry point will be called after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')
})