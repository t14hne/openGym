// Stack-aware progression and the separate assistance-machine direction.
import { describe, expect, it } from 'vitest'
import { nextPrescription } from './progression.js'
import { buildPlannedEntry } from './session-start.js'

const FLY = '0596'
const DIP = '0009'
const stack = [5, 11.3, 18.1, 24.9, 31.7, 38.5]
const session = (date, id, weight, reps, target) => ({
  d: date,
  entries: [{ id, target, sets: reps.map(r => ({ w: weight, r, done: true })) }],
})

describe('machine progression', () => {
  it('deloads triple progression to a weight on the configured stack', () => {
    const cfg = { id: FLY, mode: 'reps', prog: 'triple', sets: 2, setsMax: 2, reps: 12, repsMin: 8, inc: 2.5 }
    const workouts = ['2026-10-01', '2026-10-03', '2026-10-05']
      .map(date => session(date, FLY, 31.7, [10, 6], cfg))
    const state = { unit: 'kg', workouts, routines: [], exWeights: {}, stackWeights: { [FLY]: { unit: 'kg', weights: stack } } }

    expect(nextPrescription(state, cfg)).toMatchObject({ kind: 'deload', weight: 24.9, rowReps: [8, 8] })
    const entry = buildPlannedEntry(state, cfg, null)
    expect(entry.sets.filter(set => !set.warmup).map(set => set.w)).toEqual([24.9, 24.9])
  })

  it('keeps the current setting when no lighter stack weight exists', () => {
    const cfg = { id: FLY, mode: 'reps', prog: 'triple', sets: 2, setsMax: 2, reps: 12, repsMin: 8, inc: 2.5 }
    const workouts = ['2026-10-01', '2026-10-03', '2026-10-05']
      .map(date => session(date, FLY, 5, [10, 6], cfg))
    const state = { unit: 'kg', workouts, routines: [], exWeights: {}, stackWeights: { [FLY]: { unit: 'kg', weights: stack } } }

    expect(nextPrescription(state, cfg)).toMatchObject({ kind: 'hold', weight: 5, reps: 8 })
  })

  it('continues to use less help for assisted progression without a configured stack', () => {
    const cfg = { id: DIP, mode: 'reps', prog: 'linear', sets: 2, reps: 8, inc: 5 }
    const state = { unit: 'kg', routines: [], exWeights: {}, workouts: [session('2026-10-01', DIP, 40, [8, 8], cfg)] }

    expect(nextPrescription(state, cfg)).toMatchObject({ kind: 'up', weight: 35 })
  })

  it('holds the top of the range when the machine has no heavier setting', () => {
    const cfg = { id: FLY, mode: 'reps', prog: 'triple', sets: 2, setsMax: 2, reps: 12, repsMin: 8, inc: 2.5 }
    const state = {
      unit: 'kg', routines: [], exWeights: {},
      stackWeights: { [FLY]: { unit: 'kg', weights: stack } },
      workouts: [session('2026-10-01', FLY, 38.5, [12, 12], cfg)],
    }

    expect(nextPrescription(state, cfg)).toMatchObject({ kind: 'hold', weight: 38.5, reps: 12 })
  })
})
