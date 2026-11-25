// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Workout from './Workout.jsx'
import { DEF, useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'

vi.mock('../lib/sound.js', () => ({ beep: vi.fn(), vibrate: vi.fn(), unlock: vi.fn(), alertBuzz: vi.fn(), restOver: vi.fn() }))
vi.mock('../lib/api.js', () => ({ api: vi.fn(() => Promise.resolve({})) }))
globalThis.IS_REACT_ACT_ENVIRONMENT = true
let root, host, sheetRoot, sheetHost

beforeEach(() => {
  useUI.setState({ sheets: [], toastMsg: '', timer: null, work: null })
  const S = JSON.parse(JSON.stringify(DEF))
  S.unit = 'kg'
  S.stackWeights = { '0009': { unit: 'kg', weights: [10, 17.5, 25, 32.5, 40], _ts: 1 } }
  S.active = { id: 'assist-focus', d: '2026-11-25', start: Date.now(), routineId: null, name: 'Workout', cur: 0, workoutView: 'focus', entries: [{ id: '0009', target: { sets: 1, reps: 8, mode: 'reps' }, sets: [{ w: 25, r: 8, done: false }] }] }
  useStore.setState({ S, user: null })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => root.render(<MemoryRouter><Workout /></MemoryRouter>))
})

afterEach(() => {
  if (sheetRoot) act(() => sheetRoot.unmount())
  if (root) act(() => root.unmount())
  sheetHost?.remove()
  host?.remove()
  root = host = sheetRoot = sheetHost = null
  useUI.getState().stopRest()
})

it('adds an easier assisted drop on the configured stack from the focus view', () => {
  act(() => host.querySelector('button[aria-label="Set menu"]').click())
  const sheet = useUI.getState().sheets.at(-1)
  sheetHost = document.createElement('div')
  document.body.appendChild(sheetHost)
  sheetRoot = createRoot(sheetHost)
  act(() => sheetRoot.render(sheet.render(() => useUI.getState().closeSheet(sheet.id))))
  const item = [...sheetHost.querySelectorAll('.menu-item')].find(el => el.querySelector('.tt')?.textContent === 'Add drop set')
  expect(item).toBeTruthy()
  act(() => item.click())
  expect(useStore.getState().S.active.entries[0].sets[0].drops[0].w).toBe(32.5)
})
