import { describe, expect, it } from 'vitest'
import { comparableCardio } from './cardio-compare.js'

const treadmill = { id: 'my-treadmill', n: 'Treadmill walk', eq: 'treadmill', bp: 'cardio' }
const workout = (id, d, avg, extras = {}) => ({
  id, d, start: Date.parse(`${d}T10:00:00Z`), gym: { id: 'gym-a', name: 'Gym' },
  entries: [{ id: treadmill.id, target: { mode: 'cardio' }, sets: [{ min: 20, speed: 5, incline: 4, done: true, hr: { avg, max: avg + 10 }, ...extras }] }],
})

describe('recorded cardio comparisons', () => {
  it('shows two completed sessions at the same recorded settings and gym, in date order', () => {
    const S = { customEx: [treadmill], workouts: [workout('later', '2026-11-10', 130), workout('earlier', '2026-11-01', 140)] }
    expect(comparableCardio(S)).toMatchObject({ exerciseId: treadmill.id, gym: 'gym-a', min: 20, speed: 5, incline: 4,
      earlier: { d: '2026-11-01', avg: 140 }, later: { d: '2026-11-10', avg: 130 } })
  })
  it('does not equate an unrecorded incline with a known grade', () => {
    const S = { customEx: [treadmill], workouts: [workout('a', '2026-11-01', 140, { incline: undefined }), workout('b', '2026-11-10', 130, { incline: undefined })] }
    expect(comparableCardio(S)).toBeNull()
  })
  it('can compare explicitly recorded flat incline without treating an omitted grade as zero', () => {
    const S = { customEx: [treadmill], workouts: [workout('a', '2026-11-01', 140, { incline: 0 }), workout('b', '2026-11-10', 130, { incline: 0 })] }
    expect(comparableCardio(S)).toMatchObject({ incline: 0 })
  })
  it('does not compare two blocks from the same saved workout', () => {
    const w = workout('one', '2026-11-01', 140)
    w.entries.push({ ...w.entries[0] })
    expect(comparableCardio({ customEx: [treadmill], workouts: [w] })).toBeNull()
  })
  it('does not guess the order of same-day sessions without distinct timestamps', () => {
    const a = workout('a', '2026-11-01', 140), b = workout('b', '2026-11-01', 130)
    delete a.start
    delete b.start
    expect(comparableCardio({ customEx: [treadmill], workouts: [a, b] })).toBeNull()
  })
  it('does not combine different gym or recorded machine brands', () => {
    const first = workout('a', '2026-11-01', 140)
    const otherGym = workout('b', '2026-11-10', 130)
    otherGym.gym.id = 'gym-b'
    expect(comparableCardio({ customEx: [treadmill], workouts: [first, otherGym] })).toBeNull()
    otherGym.gym.id = 'gym-a'
    first.entries[0].brand = 'Brand A'
    otherGym.entries[0].brand = 'Brand B'
    expect(comparableCardio({ customEx: [treadmill], workouts: [first, otherGym] })).toBeNull()
  })
  it('does not treat an empty gym identifier as a known gym', () => {
    const a = workout('a', '2026-11-01', 140), b = workout('b', '2026-11-10', 130)
    a.gym.id = ''
    b.gym.id = ''
    expect(comparableCardio({ customEx: [treadmill], workouts: [a, b] })).toBeNull()
  })
  it('rejects malformed measurements instead of comparing them', () => {
    for (const bad of [{ speed: Infinity }, { speed: true }, { min: Infinity }, { min: true }, { incline: 'bad' }, { incline: '' }, { incline: true }, { incline: -3 }, { level: 'bad' }, { level: true }]) {
      const S = { customEx: [treadmill], workouts: [workout('a', '2026-11-01', 140, bad), workout('b', '2026-11-10', 130, bad)] }
      expect(comparableCardio(S), JSON.stringify(bad)).toBeNull()
    }
  })
  it('does not compare incomplete, interval, or heart-rate-free sessions', () => {
    const good = workout('a', '2026-11-01', 140)
    for (const modify of [
      w => { w.entries[0].sets[0].done = false },
      w => { delete w.entries[0].sets[0].hr },
      w => { w.entries[0].sets.push({ ...w.entries[0].sets[0] }) },
    ]) {
      const b = workout('b', '2026-11-10', 130)
      modify(b)
      expect(comparableCardio({ customEx: [treadmill], workouts: [good, b] })).toBeNull()
    }
  })
  it('ignores malformed imported records without breaking the screen', () => {
    expect(() => comparableCardio({ workouts: [null, { id: 'bad', d: '2026-11-02', gym: { id: 'x' }, entries: [null] }] })).not.toThrow()
    expect(comparableCardio({ workouts: [null, { id: 'bad', d: '2026-11-02', gym: { id: 'x' }, entries: [null] }] })).toBeNull()
  })
  it('requires an explicitly recorded resistance level on a bike', () => {
    const bike = { id: 'my-bike', n: 'Stationary bike', eq: 'stationary bike', bp: 'cardio' }
    const make = (id, d, avg, level) => ({ ...workout(id, d, avg), entries: [{ id: bike.id, target: { mode: 'cardio' },
      sets: [{ min: 20, speed: 12, level, done: true, hr: { avg, max: avg + 10 } }] }] })
    expect(comparableCardio({ customEx: [bike], workouts: [make('a', '2026-11-01', 140, 5), make('b', '2026-11-10', 130, 5)] })).toMatchObject({ level: 5 })
    expect(comparableCardio({ customEx: [bike], workouts: [make('a', '2026-11-01', 140), make('b', '2026-11-10', 130)] })).toBeNull()
  })
  it('compares stair machines by their displayed level, without inventing an incline', () => {
    const make = (id, d, avg) => ({ ...workout(id, d, avg), entries: [{ id: '2311', target: { mode: 'cardio' },
      sets: [{ min: 20, speed: 5, level: 3, done: true, hr: { avg, max: avg + 10 } }] }] })
    expect(comparableCardio({ workouts: [make('a', '2026-11-01', 140), make('b', '2026-11-10', 130)] })).toMatchObject({ exerciseId: '2311', level: 3 })
  })
})
