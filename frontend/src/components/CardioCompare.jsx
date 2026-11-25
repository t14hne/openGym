import { comparableCardio } from '../lib/cardio-compare.js'
import { modeOf } from '../lib/history.js'
import { exerciseOf } from '../lib/exercises.js'
import { fmtDate, fmtNum, exerciseNameText } from '../lib/format.js'
import { fmtSpeed, speedUnitOf } from '../lib/speed.js'
import { t } from '../lib/i18n.js'

export default function CardioCompare({ S }) {
  const hasCardio = (Array.isArray(S?.workouts) ? S.workouts : []).some(w => (Array.isArray(w?.entries) ? w.entries : []).some(e => e && modeOf({ ...(e.target || {}), id: e.id }) === 'cardio'))
  if (!hasCardio) return null
  const match = comparableCardio(S)
  const ex = match && ((Array.isArray(S.customEx) ? S.customEx : []).find(x => x?.id === match.exerciseId) || exerciseOf(match.exerciseId))
  const settings = match && [t('{0} min', fmtNum(match.min)), fmtSpeed(match.speed, speedUnitOf(S)),
    match.incline != null ? t('{0}% incline', fmtNum(match.incline)) : null,
    match.level != null ? t('Level {0}', fmtNum(match.level)) : null].filter(Boolean).join(' · ')
  return <div className="card" data-cardio-compare>
    <h2>{t('Cardio: matching settings')}</h2>
    {match ? <>
      <div>{exerciseNameText(ex)}{match.gymName ? ' · ' + match.gymName : ''}</div>
      <div className="small muted">{settings}</div>
      <p>{t('Heart rate')} · {t('Average')}: {fmtDate(match.earlier.d, true, true)} — {t('{0} bpm', fmtNum(match.earlier.avg))} · {fmtDate(match.later.d, true, true)} — {t('{0} bpm', fmtNum(match.later.avg))}</p>
      <p className="small dim">{t('Matching settings may use different machines. Heart rate varies for many reasons.')}</p>
    </> : <>
      <p>{t('No data yet')}</p>
      <p className="small dim">{t('Two completed continuous sessions need the same gym, duration, speed and machine settings, plus heart rate.')}</p>
    </>}
  </div>
}
