export class SceneRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')

    // Set fixed canvas size
    this.canvas.width = 800
    this.canvas.height = 500

    // Predefine coordinates for scene elements
    this.sceneCoords = {
      lake: { x: 200, y: 300, width: 150, height: 80 },
      river: { x: 550, y: 300, width: 200, height: 40 },
      market: { x: 350, y: 400, width: 100, height: 50 },
      home: { x: 400, y: 450 },
      clock: { x: 700, y: 450, radius: 40 }
    }
  }

  // Parse time string like "8:00 AM" or "3:30 PM"
  parseTimeString(timeStr) {
    const [timePart, ampm] = timeStr.split(' ')
    const [hourStr, minuteStr] = timePart.split(':')
    let hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)
    const isPM = ampm === 'PM'

    // Convert to 24-hour for clock calculations
    let hour24 = hour
    if (isPM && hour !== 12) hour24 = hour + 12
    if (!isPM && hour === 12) hour24 = 0

    return { hour, minute, hour24, isPM }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawBackground() {
    const { width, height } = this.canvas
    const ctx = this.ctx

    // Sky (top 60%)
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, width, height * 0.6)

    // Ground (bottom 20%)
    ctx.fillStyle = '#90EE90'
    ctx.fillRect(0, height * 0.8, width, height * 0.2)

    // Water for lake and river areas
    ctx.fillStyle = '#4682B4'

    // Lake water (ellipse)
    const lake = this.sceneCoords.lake
    ctx.beginPath()
    ctx.ellipse(lake.x, lake.y, lake.width / 2, lake.height / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // River water (rectangle)
    const river = this.sceneCoords.river
    ctx.fillRect(river.x - river.width / 2, river.y - river.height / 2,
                 river.width, river.height)
  }

  drawLake() {
    const ctx = this.ctx
    const lake = this.sceneCoords.lake

    // Lake water (already drawn in background, but add outline)
    ctx.strokeStyle = '#1E3A5F'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(lake.x, lake.y, lake.width / 2, lake.height / 2, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Label
    ctx.fillStyle = '#1E3A5F'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('LAKE', lake.x, lake.y - lake.height / 2 - 10)
  }

  drawRiver() {
    const ctx = this.ctx
    const river = this.sceneCoords.river

    // River outline
    ctx.strokeStyle = '#1E3A5F'
    ctx.lineWidth = 3
    ctx.strokeRect(river.x - river.width / 2, river.y - river.height / 2,
                   river.width, river.height)

    // Label
    ctx.fillStyle = '#1E3A5F'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('RIVER', river.x, river.y - river.height / 2 - 10)
  }

  drawMarket() {
    const ctx = this.ctx
    const market = this.sceneCoords.market

    // Market building (brown rectangle)
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(market.x - market.width / 2, market.y - market.height / 2,
                 market.width, market.height)

    // Outline
    ctx.strokeStyle = '#5D2906'
    ctx.lineWidth = 2
    ctx.strokeRect(market.x - market.width / 2, market.y - market.height / 2,
                   market.width, market.height)

    // Label
    ctx.fillStyle = '#5D2906'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('MARKET', market.x, market.y - market.height / 2 - 10)
  }

  drawFisherman(x, y, label = '') {
    const ctx = this.ctx

    // Save context for transformations
    ctx.save()

    // Move origin to fisherman position
    ctx.translate(x, y)

    // Head (circle)
    ctx.fillStyle = '#FFD700' // Gold/yellow
    ctx.beginPath()
    ctx.arc(0, -25, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#B8860B'
    ctx.lineWidth = 2
    ctx.stroke()

    // Body (line)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -15)
    ctx.lineTo(0, 15)
    ctx.stroke()

    // Arms (two lines from shoulders)
    ctx.beginPath()
    ctx.moveTo(-10, -5)
    ctx.lineTo(10, -5)
    ctx.stroke()

    // Legs (two lines from hips)
    ctx.beginPath()
    ctx.moveTo(-8, 15)
    ctx.lineTo(0, 25)
    ctx.moveTo(8, 15)
    ctx.lineTo(0, 25)
    ctx.stroke()

    // Label below fisherman
    if (label) {
      ctx.fillStyle = '#000'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(label, 0, 45)
    }

    ctx.restore()
  }

  drawClock(hour, minute) {
    const ctx = this.ctx
    const clock = this.sceneCoords.clock

    // Clock face
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(clock.x, clock.y, clock.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()

    // Clock center dot
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(clock.x, clock.y, 3, 0, Math.PI * 2)
    ctx.fill()

    // Convert to 12-hour format for display
    const displayHour = hour % 12 === 0 ? 12 : hour % 12
    const isPM = hour >= 12

    // Hour hand (shorter, thicker)
    const hourAngle = (hour % 12 + minute / 60) * (Math.PI / 6) - Math.PI / 2
    const hourLength = clock.radius * 0.5
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(clock.x, clock.y)
    ctx.lineTo(
      clock.x + Math.cos(hourAngle) * hourLength,
      clock.y + Math.sin(hourAngle) * hourLength
    )
    ctx.stroke()

    // Minute hand (longer, thinner)
    const minuteAngle = minute * (Math.PI / 30) - Math.PI / 2
    const minuteLength = clock.radius * 0.7
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(clock.x, clock.y)
    ctx.lineTo(
      clock.x + Math.cos(minuteAngle) * minuteLength,
      clock.y + Math.sin(minuteAngle) * minuteLength
    )
    ctx.stroke()

    // AM/PM label
    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(isPM ? 'PM' : 'AM', clock.x, clock.y + clock.radius + 20)
  }

  drawFishCount(count) {
    const ctx = this.ctx
    ctx.fillStyle = '#1E3A5F'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`🐟 x ${count}`, 20, 40)
  }

  drawDayCounter(day) {
    const ctx = this.ctx
    ctx.fillStyle = '#1E3A5F'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Day ${day}`, this.canvas.width / 2, 40)
  }

  render(simStatus, agentState) {
    this.clear()
    this.drawBackground()
    this.drawLake()
    this.drawRiver()
    this.drawMarket()

    // Parse clock time
    const time = this.parseTimeString(simStatus.clock)

    // Draw fisherman based on state
    let fishermanPos = this.sceneCoords.home
    let fishermanLabel = ''

    switch (simStatus.state) {
      case 'fishing':
        if (simStatus.currentAction === 'lake') {
          fishermanPos = this.sceneCoords.lake
          fishermanLabel = 'Fishing at Lake'
        } else if (simStatus.currentAction === 'river') {
          fishermanPos = this.sceneCoords.river
          fishermanLabel = 'Fishing at River'
        }
        break

      case 'selling':
        fishermanPos = this.sceneCoords.market
        fishermanLabel = 'Selling Fish'
        break

      case 'idle':
      case 'deciding':
      default:
        fishermanPos = this.sceneCoords.home
        fishermanLabel = 'At Home'
        break
    }

    this.drawFisherman(fishermanPos.x, fishermanPos.y, fishermanLabel)

    // Draw clock
    this.drawClock(time.hour24, time.minute)

    // Draw day counter
    this.drawDayCounter(simStatus.day)

    // Draw fish count (use lastReward if available, otherwise 0)
    const fishCount = simStatus.lastReward !== null ? Math.round(simStatus.lastReward) : 0
    this.drawFishCount(fishCount)
  }
}

// Keep backward compatibility
export { SceneRenderer as Canvas }