import { modeOf, workoutDay } from './history.js'
import { isWarmupRow } from './workout-model.js'
import { sanitizeHr } from './heart-rate.js'
import { exerciseOf } from './exercises.js'
import { inclineFits, levelFits, INCLINE_MAX, LEVEL_MAX } from './incline.js'
import { cleanBrand } from './gym-split.js'

const recordedNumber = value => typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN

/** The latest two completed, single-block sessions with matching recorded settings. */
export function comparableCardio(S) {
  const groups = new Map()
  for (const w of Array.isArray(S?.workouts) ? S.workouts : []) {
    const d = workoutDay(w), gym = w?.gym?.id
    if (!d || typeof gym !== 'string' || !gym.trim() || !w.id) continue
    for (const entry of Array.isArray(w.entries) ? w.entries : []) {
      if (!entry || typeof entry !== 'object') continue
      if (modeOf({ ...(entry.target || {}), id: entry.id }) !== 'cardio') continue
      const ex = (Array.isArray(S.customEx) ? S.customEx : []).find(x => x?.id === entry.id) || exerciseOf(entry.id)
      if (!ex) continue
      if (!Array.isArray(entry.sets) || entry.sets.some(s => !s || typeof s !== 'object')) continue
      const rows = entry.sets.filter(s => !isWarmupRow(s))
      if (rows.length !== 1 || rows[0]?.done !== true) continue
      const row = rows[0], hr = sanitizeHr(row.hr)
      const min = recordedNumber(row.min), speed = recordedNumber(row.speed)
      const incline = row.incline == null ? null : recordedNumber(row.incline)
      const level = row.level == null ? null : recordedNumber(row.level)
      if (!Number.isFinite(min) || min <= 0 || min > 1440 || !Number.isFinite(speed) || speed <= 0 || !hr) continue
      if (incline != null && (!Number.isFinite(incline) || incline < 0 || incline > INCLINE_MAX)) continue
      if (level != null && (!Number.isInteger(level) || level < 1 || level > LEVEL_MAX)) continue
      // Match the setting this exercise normally displays. Missing is unknown, including an
      // incline which older versions omit for flat. Any additional recorded setting also joins
      // the key below, so one row with it cannot match one without it.
      if (levelFits(ex) ? row.level == null : inclineFits(ex) && row.incline == null) continue
      const key = JSON.stringify([entry.id, gym, cleanBrand(entry.brand).toLocaleLowerCase(), min, speed, incline, level])
      const item = { exerciseId: entry.id, gym, min, speed,
        ...(incline != null ? { incline } : {}), ...(level != null ? { level } : {}),
        d, avg: hr.avg, start: Number(w.start) || 0, workoutId: w.id, gymName: typeof w.gym.name === 'string' ? w.gym.name : '' }
      if (!groups.has(key)) groups.set(key, [])
      if (!groups.get(key).some(x => x.workoutId === w.id)) groups.get(key).push(item)
    }
  }
  let best = null
  for (const group of groups.values()) {
    group.sort((a, b) => a.d.localeCompare(b.d) || a.start - b.start)
    if (group.length < 2) continue
    const [earlier, later] = group.slice(-2)
    if (earlier.d === later.d && (!(earlier.start > 0) || !(later.start > earlier.start))) continue
    if (!best || later.d > best.later.d || (later.d === best.later.d && later.start > best.later.start)) best = { ...later, earlier, later }
  }
  return best
}
