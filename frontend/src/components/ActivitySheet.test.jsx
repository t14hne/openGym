// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ S: { unit: 'kg', activities: {} }, sheet: null, toast: vi.fn() }))
vi.mock('../store/useStore.js', () => ({ useStore: selector => selector({ S: mocks.S, update: fn => fn(mocks.S) }) }))
vi.mock('../store/useUI.js', () => ({ useUI: Object.assign(selector => selector({ toast: mocks.toast }), {
  getState: () => ({ openSheet: fn => { mocks.sheet = fn(() => {}) } }),
}) }))
import { activitySheet } from './ActivitySheet.jsx'
import { activitiesOf } from '../lib/activities.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
let root, host
afterEach(() => { if (root) act(() => root.unmount()); host?.remove() })

it('lets a user choose and save a manual walk', () => {
  activitySheet({ day: '2026-11-02' })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => root.render(mocks.sheet))
  const walk = [...host.querySelectorAll('[role="radio"]')].find(el => el.textContent.trim() === 'Walk')
  expect(walk).toBeDefined()
  act(() => walk.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  const save = [...host.querySelectorAll('button')].find(el => el.textContent.trim() === 'Save')
  act(() => save.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(activitiesOf(mocks.S)).toMatchObject([{ sport: 'walk', d: '2026-11-02', min: 60, src: 'manual' }])
})
