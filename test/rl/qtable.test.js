import { QTable } from '../../src/rl/qtable.js'

describe('QTable', () => {
  let qtable

  beforeEach(() => {
    qtable = new QTable()
  })

  it('initializes both actions to 0', () => {
    expect(qtable.getValue('lake')).toBe(0)
    expect(qtable.getValue('river')).toBe(0)
  })

  it('getValue returns correct initial value', () => {
    expect(qtable.getValue('lake')).toBe(0)
    expect(qtable.getValue('river')).toBe(0)
  })

  it('update() changes the Q value for the correct action', () => {
    qtable.update('lake', 5, 0.1, 0.9)
    expect(qtable.getValue('lake')).not.toBe(0)
    expect(qtable.getValue('river')).toBe(0)

    const lakeValue = qtable.getValue('lake')
    qtable.update('lake', 3, 0.1, 0.9)
    expect(qtable.getValue('lake')).not.toBe(lakeValue)
  })

  it('After many updates favoring "river", river Q value is higher than lake', () => {
    // Give river consistently higher rewards
    for (let i = 0; i < 100; i++) {
      qtable.update('river', 10, 0.1, 0.9)
      qtable.update('lake', 1, 0.1, 0.9)
    }

    expect(qtable.getValue('river')).toBeGreaterThan(qtable.getValue('lake'))
  })

  it('reset() returns both values to 0', () => {
    qtable.update('lake', 5, 0.1, 0.9)
    qtable.update('river', 3, 0.1, 0.9)

    expect(qtable.getValue('lake')).not.toBe(0)
    expect(qtable.getValue('river')).not.toBe(0)

    qtable.reset()

    expect(qtable.getValue('lake')).toBe(0)
    expect(qtable.getValue('river')).toBe(0)
  })

  it('getValues() returns an object with both keys', () => {
    const values = qtable.getValues()
    expect(values).toEqual({
      lake: 0,
      river: 0
    })
    expect(values.lake).toBeDefined()
    expect(values.river).toBeDefined()
  })
})