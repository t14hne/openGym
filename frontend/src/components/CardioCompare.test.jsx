import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CardioCompare from './CardioCompare.jsx'

const ex = { id: 'walk-machine', n: 'Treadmill walk', eq: 'treadmill', bp: 'cardio' }
const workout = (id, d, avg, incline = 4) => ({ id, d, start: Date.parse(d + 'T10:00:00Z'), gym: { id: 'one', name: 'Gym' }, entries: [
  { id: ex.id, target: { mode: 'cardio' }, sets: [{ min: 20, speed: 5, incline, done: true, hr: { avg, max: avg + 10 } }] },
] })
const render = S => renderToStaticMarkup(<CardioCompare S={S} />)

describe('cardio comparison', () => {
  it('shows the recorded conditions and each measured heart rate with its limits', () => {
    const html = render({ unit: 'kg', customEx: [ex], workouts: [workout('a', '2026-11-01', 140), workout('b', '2026-11-10', 130)] })
    expect(html.toLowerCase()).toContain('treadmill walk')
    expect(html).toContain('140')
    expect(html).toContain('130')
    expect(html).toContain('5 km/h')
    expect(html).toContain('4% incline')
    expect(html).toContain('Heart rate varies for many reasons')
  })
  it('explains what is missing when there is no comparable pair', () => {
    const html = render({ unit: 'kg', customEx: [ex], workouts: [workout('a', '2026-11-01', 140)] })
    expect(html).toContain('No data yet')
    expect(html).toContain('Two completed continuous sessions')
  })
})
