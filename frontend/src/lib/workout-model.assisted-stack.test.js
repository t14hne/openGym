import { describe, expect, it } from 'vitest'
import { dropGrid } from './plates.js'
import { addSideDrop, makeSideSet, nextDropWeight } from './workout-model.js'
import { applyIntensifierPlan, liveReramp } from './history.js'

const id = '0009'
const cfg = { id, mode: 'reps', intensifier: { type: 'dropset', count: 2, pct: 20 } }
const state = { unit: 'kg', stackWeights: { [id]: { unit: 'kg', weights: [10, 17.5, 25, 32.5, 40] } } }

describe('assisted drop sets and live warm-ups', () => {
  it('adds help on the available stack and stops at its upper end', () => {
    const grid = dropGrid(state, cfg)
    expect(nextDropWeight(25, 20, grid, true)).toBe(32.5)
    expect(nextDropWeight(40, 20, grid, true)).toBe(40)
    expect(nextDropWeight(25, 20, 5, true)).toBe(30)
  })

  it('uses the same easier direction for planned and per-side drops', () => {
    const grid = dropGrid(state, cfg)
    const rows = applyIntensifierPlan([{ w: 25, r: 8 }], cfg, grid)
    expect(rows[0].drops.map(d => d.w)).toEqual([32.5, 40])
    const row = addSideDrop(makeSideSet({ w: 25, r: 16 }), 20, grid, true)
    expect(row.sides.L.drops[0].w).toBe(32.5)
    expect(row.sides.R.drops[0].w).toBe(32.5)
  })

  it('keeps re-aimed warm-ups on the assisted stack', () => {
    const rows = [{ w: 40, r: 8, phase: 'warmup', warmup: true }, { w: 25, r: 8 }]
    expect(liveReramp(rows, dropGrid(state, cfg), 0, true).map(s => s.w)).toEqual([40, 25])
  })
})
