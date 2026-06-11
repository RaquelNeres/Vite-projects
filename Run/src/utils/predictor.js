// Riegel formula: T2 = T1 * (D2/D1)^1.06
export function predictTimeSeconds(timeSeconds, distFromKm, distToKm) {
  if (!timeSeconds || !distFromKm || !distToKm) return null
  const exponent = 1.06
  return Math.round(timeSeconds * Math.pow(distToKm / distFromKm, exponent))
}

export function formatSecondsToHMS(sec) {
  if (!sec && sec !== 0) return '--:--:--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
