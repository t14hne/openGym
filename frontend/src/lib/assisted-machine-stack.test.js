import { describe, expect, it } from 'vitest'
import { canHaveStack, ownedWeightsFor, stepOwned } from './dumbbells.js'
import { nextPrescription } from './progression.js'
import { buildPlannedEntry } from './session-start.js'
import { insertWarmupRow, rerampWarmups } from './history.js'
import { gymView } from './gym-inventory.js'

const DIP = '0009'
const weights = [10, 17.5, 25, 32.5, 40]
const cfg = (extra = {}) => ({ id: DIP, mode: 'reps', prog: 'linear', sets: 2, reps: 8, inc: 5, ...extra })
const session = (date, w, reps, target = cfg()) => ({ d: date, entries: [{ id: DIP, target, sets: reps.map(r => ({ w, r, done: true })) }] })
const state = (workouts = [], list = weights) => ({ unit: 'kg', workouts, routines: [], exWeights: {}, stackWeights: { [DIP]: { unit: 'kg', weights: list } } })

describe('assisted machines with a listed stack', () => {
  it('offers the stack editor and uses the list for the set controls', () => {
    expect(canHaveStack(DIP)).toBe(true)
    expect(ownedWeightsFor(state(), cfg())).toEqual(weights)
    expect(stepOwned(ownedWeightsFor(state(), cfg()), 25, -1)).toBe(17.5)
  })

  it('uses a listed stack for a custom assisted bodyweight exercise', () => {
    const custom = { id: 'custom-assisted', custom: true, eq: 'custom', assisted: true, bodyweight: true }
    const S = { unit: 'kg', stackWeights: { [custom.id]: { unit: 'kg', weights: [10, 20, 30] } } }
    expect(canHaveStack(custom)).toBe(true)
    expect(ownedWeightsFor(S, custom)).toEqual([10, 20, 30])
  })

  it.each(['linear', 'double', 'steady', 'triple', 'density'])(
    '%s progression chooses the next lower assistance setting', policy => {
      const c = cfg({ prog: policy, reps: 8, repsMin: 6, setsMax: 2, restSec: 45, restMin: 45 })
      const p = nextPrescription(state([session('2026-10-01', 25, [8, 8], c)]), c)
      expect(p).toMatchObject({ kind: 'up', weight: 17.5 })
      expect(p.why.slice(1)).toContain(7.5)
    },
  )

  it('holds at the lowest listed assistance instead of inventing zero or resetting reps', () => {
    const c = cfg({ prog: 'triple', reps: 8, repsMin: 6, setsMax: 2 })
    expect(nextPrescription(state([session('2026-10-01', 10, [8, 8], c)]), c))
      .toMatchObject({ kind: 'hold', weight: 10, reps: 8, rowReps: [8, 8] })
  })

  it('describes the actual jump on an ordinary irregular stack in triple progression', () => {
    const id = '0596'
    const c = { id, mode: 'reps', prog: 'triple', sets: 2, setsMax: 2, reps: 8, repsMin: 6, inc: 2.5 }
    const workout = { d: '2026-10-01', entries: [{ id, target: c, sets: [8, 8].map(r => ({ w: 31.7, r, done: true })) }] }
    const S = { unit: 'kg', workouts: [workout], routines: [], exWeights: {}, stackWeights: { [id]: { unit: 'kg', weights: [24.9, 31.7, 38.5] } } }
    const p = nextPrescription(S, c)
    expect(p).toMatchObject({ kind: 'up', weight: 38.5 })
    expect(p.why.slice(1)).toContain(6.8)
  })

  it('takes the next higher setting after repeated missed reps', () => {
    const c = cfg()
    const workouts = ['2026-10-01', '2026-10-03', '2026-10-05'].map(d => session(d, 25, [8, 5], c))
    expect(nextPrescription(state(workouts), c)).toMatchObject({ kind: 'deload', weight: 32.5 })
  })

  it('does not recommend more assistance than the highest listed setting', () => {
    const c = cfg()
    const workouts = ['2026-10-01', '2026-10-03', '2026-10-05'].map(d => session(d, 40, [8, 5], c))
    expect(nextPrescription(state(workouts), c)).toMatchObject({ kind: 'hold', weight: 40 })
  })

  it.each(['linear', 'double', 'steady', 'triple', 'density'])(
    '%s holds at the heaviest assistance after repeated misses', policy => {
      const c = cfg({ prog: policy, reps: 8, repsMin: 6, setsMax: 2, restSec: 45, restMin: 45 })
      const workouts = ['2026-10-01', '2026-10-03', '2026-10-05'].map(d => session(d, 40, [8, 5], c))
      expect(nextPrescription(state(workouts), c)).toMatchObject({ kind: 'hold', weight: 40 })
    },
  )

  it('preserves the existing increment rule when the machine has no list', () => {
    const c = cfg()
    expect(nextPrescription(state([session('2026-10-01', 25, [8, 8], c)], []), c))
      .toMatchObject({ kind: 'up', weight: 20 })
  })

  it('uses two available steps for a Greyskull double jump', () => {
    const c = cfg({ prog: 'greyskull' })
    expect(nextPrescription(state([session('2026-10-01', 32.5, [8, 16], c)]), c))
      .toMatchObject({ kind: 'up', weight: 17.5 })
  })

  it('does not claim a double jump when just one lower assistance setting exists', () => {
    const c = cfg({ prog: 'greyskull' })
    const p = nextPrescription(state([session('2026-10-01', 17.5, [8, 16], c)]), c)
    expect(p).toMatchObject({ kind: 'up', weight: 10 })
    expect(p.why[0]).not.toMatch(/double jump/i)
    expect(p.why.slice(1)).toContain(7.5)
  })

  it('keeps another gym’s assisted-machine history out when the exercise is split', () => {
    const c = cfg()
    const here = { ...session('2026-10-01', 25, [8, 8], c), gym: { id: 'here' } }
    const elsewhere = { ...session('2026-10-03', 40, [8, 8], c), gym: { id: 'elsewhere' } }
    const S = { ...state([here, elsewhere]), activeEquipId: 'here', exGym: { [DIP]: { split: true } } }
    expect(nextPrescription(S, c)).toMatchObject({ kind: 'up', weight: 17.5 })
  })

  it('reads a stack in the profile unit and chooses that gym’s inventory', () => {
    const S = { ...state(), unit: 'lb', activeEquipId: 'home', equipProfiles: [
      { id: 'home', stackWeights: { [DIP]: { unit: 'kg', weights: [10, 20] } } },
      { id: 'gym', stackWeights: { [DIP]: { unit: 'lb', weights: [30, 45, 60] } } },
    ] }
    expect(ownedWeightsFor(S, cfg())).toEqual([22, 38.6, 55.1, 71.7, 88.2])
    expect(ownedWeightsFor(gymView(S, 'gym'), cfg())).toEqual([30, 45, 60])
  })

  it('rounds assisted warm-ups upward to available help, preserving completed rows', () => {
    const rows = [{ w: 40, r: 8, done: true, phase: 'warmup', warmup: true }, { w: 0, r: 8, done: false, phase: 'warmup', warmup: true }, { w: 25, r: 8, done: false }]
    expect(rerampWarmups(rows, weights, 0, true).map(s => s.w)).toEqual([40, 32.5, 25])
    expect(insertWarmupRow([{ w: 25, r: 8, done: false }], 'reps', cfg(), weights)[0].w).toBe(40)
  })

  it('puts the new assistance and usable warm-ups into the planned workout', () => {
    const c = cfg({ warmupSets: 1 })
    const entry = buildPlannedEntry(state([session('2026-10-01', 25, [8, 8], c)]), c, null)
    expect(entry.sets.map(s => s.w)).toEqual([32.5, 17.5, 17.5])
  })
})
