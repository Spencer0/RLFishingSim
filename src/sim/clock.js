export class SimClock {
  constructor() {
    this.hour = 8
    this.minute = 0
  }

  tick(deltaMinutes) {
    // Add minutes
    this.minute += deltaMinutes

    // Handle overflow
    while (this.minute >= 60) {
      this.minute -= 60
      this.hour += 1
    }

    // Handle hour overflow (24-hour clock)
    while (this.hour >= 24) {
      this.hour -= 24
    }

    // Ensure hour stays positive
    while (this.hour < 0) {
      this.hour += 24
    }
  }

  getAngle() {
    // Convert 24-hour time to degrees (0° = 12:00 midnight)
    // Each hour = 15 degrees (360° / 24 hours)
    const hourAngle = this.hour * 15

    // Each minute = 0.25 degrees (15° per hour / 60 minutes)
    const minuteAngle = this.minute * 0.25

    // Total angle in degrees
    return hourAngle + minuteAngle
  }

  getTimeString() {
    let displayHour = this.hour % 12
    if (displayHour === 0) displayHour = 12

    const amPm = this.hour < 12 ? 'AM' : 'PM'

    // Format minutes with leading zero
    const minuteStr = this.minute.toString().padStart(2, '0')

    return `${displayHour}:${minuteStr} ${amPm}`
  }

  isWakeTime() {
    return this.hour === 8 && this.minute === 0
  }

  isSellTime() {
    return this.hour >= 20
  }

  reset() {
    this.hour = 8
    this.minute = 0
  }
}

// Keep backward compatibility
export { SimClock as Clock }