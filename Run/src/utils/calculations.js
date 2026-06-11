export function calculatePacePerKm(distanceKm, seconds) {
  if (!distanceKm || !seconds) return 0
  return seconds / distanceKm
}

export function formatPace(secPerKm) {
  if (!secPerKm) return ''
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function calculateSpeedKmh(distanceKm, seconds) {
  if (!distanceKm || !seconds) return 0
  return (distanceKm / (seconds / 3600))
}

export function parseTimeToSeconds(hhmmss) {
  if (!hhmmss) return 0
  const parts = hhmmss.split(':').map(Number).reverse()
  let seconds = 0
  if (parts[0]) seconds += parts[0]
  if (parts[1]) seconds += parts[1] * 60
  if (parts[2]) seconds += parts[2] * 3600
  return seconds
}

export const RUN_TYPES = [
  { value: 'easy', label: 'Easy', emoji: '🏃', color: '#FF4D1C' },
  { value: 'tempo', label: 'Tempo', emoji: '⚡', color: '#1E90FF' },
]

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getLastWeekStats(runs) {
  return { totalKm: (runs || []).reduce((s, r) => s + (r.distanceKm || 0), 0) }
}

export function formatDistance(km) {
  return km == null ? '' : `${km.toFixed(2)} km`
}

export function getRunType(run) {
  return run?.type || 'easy'
}
