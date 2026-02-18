import { SimClock } from '../../src/sim/clock.js'

describe('SimClock', () => {
  let clock

  beforeEach(() => {
    clock = new SimClock()
  })

  it('starts at 8:00 AM', () => {
    expect(clock.hour).toBe(8)
    expect(clock.minute).toBe(0)
    expect(clock.getTimeString()).toBe('8:00 AM')
  })

  it('tick() advances time correctly', () => {
    clock.tick(30)
    expect(clock.minute).toBe(30)
    expect(clock.hour).toBe(8)

    clock.tick(45) // 30 + 45 = 75 minutes -> 1 hour 15 minutes
    expect(clock.minute).toBe(15)
    expect(clock.hour).toBe(9)

    clock.tick(60 * 15) // Advance 15 hours
    expect(clock.hour).toBe(0) // 9 + 15 = 24 -> 0 (midnight)
    expect(clock.minute).toBe(15)
  })

  it('getTimeString() formats correctly for AM and PM', () => {
    expect(clock.getTimeString()).toBe('8:00 AM')

    clock.tick(60 * 4) // Advance to 12:00 PM
    expect(clock.getTimeString()).toBe('12:00 PM')

    clock.tick(60 * 6) // Advance to 6:00 PM
    expect(clock.getTimeString()).toBe('6:00 PM')

    clock.tick(60 * 6) // Advance to 12:00 AM
    expect(clock.getTimeString()).toBe('12:00 AM')

    clock.tick(60 * 8) // Advance to 8:00 AM
    expect(clock.getTimeString()).toBe('8:00 AM')
  })

  it('isWakeTime() true only at 8:00 AM', () => {
    expect(clock.isWakeTime()).toBe(true)

    clock.tick(1)
    expect(clock.isWakeTime()).toBe(false)

    clock.reset()
    expect(clock.isWakeTime()).toBe(true)

    clock.tick(60 * 24) // Full day
    expect(clock.isWakeTime()).toBe(true) // Back to 8:00 AM
  })

  it('isSellTime() true at 8 PM and later', () => {
    // Start at 8 AM
    expect(clock.isSellTime()).toBe(false)

    // Advance to 7:59 PM
    clock.tick(60 * 11 + 59)
    expect(clock.isSellTime()).toBe(false)

    // Advance to 8:00 PM
    clock.tick(1)
    expect(clock.isSellTime()).toBe(true)

    // Advance to 10:00 PM
    clock.tick(60 * 2)
    expect(clock.isSellTime()).toBe(true)

    // Advance to 7:59 AM next day
    clock.tick(60 * 9 + 59)
    expect(clock.isSellTime()).toBe(false)
  })

  it('getAngle() returns 0 at 12:00, 180 at 18:00 (6 PM)', () => {
    // Test at 12:00 AM (midnight)
    clock.hour = 0
    clock.minute = 0
    expect(clock.getAngle()).toBe(0)

    // Test at 6:00 AM
    clock.hour = 6
    clock.minute = 0
    expect(clock.getAngle()).toBe(90)

    // Test at 12:00 PM (noon)
    clock.hour = 12
    clock.minute = 0
    expect(clock.getAngle()).toBe(180)

    // Test at 6:00 PM
    clock.hour = 18
    clock.minute = 0
    expect(clock.getAngle()).toBe(270)

    // Test at 8:00 AM (should be 8 * 15 = 120 degrees)
    clock.hour = 8
    clock.minute = 0
    expect(clock.getAngle()).toBe(120)

    // Test with minutes: 8:30 AM = 120 + (30 * 0.25) = 120 + 7.5 = 127.5
    clock.minute = 30
    expect(clock.getAngle()).toBe(127.5)
  })
})