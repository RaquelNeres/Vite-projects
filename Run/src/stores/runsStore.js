import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRunsStore = defineStore('runs', () => {
  const runs = ref([])
  const prs = ref({})
  const shoes = ref([])

  const sortedRuns = computed(() => [...runs.value].sort((a, b) => (b.date || b.id) > (a.date || a.id) ? 1 : -1))
  const recentRuns = computed(() => sortedRuns.value.slice(0, 10))

  const streak = computed(() => 0)

  const weekStats = computed(() => ({ distanceKm: runs.value.reduce((s, r) => s + (r.distanceKm || 0), 0), timeSeconds: runs.value.reduce((s, r) => s + (r.durationSeconds || 0), 0), count: runs.value.length }))

  const weeklyData = computed(() => [{ label: 'W1', distanceKm: weekStats.value.distanceKm }])

  const fitnessScore = computed(() => 0)

  function load() {
    try {
      const raw = localStorage.getItem('runs')
      if (raw) runs.value = JSON.parse(raw)
      const rawPrs = localStorage.getItem('prs')
      if (rawPrs) prs.value = JSON.parse(rawPrs)
    } catch (e) {
      runs.value = []
    }
  }

  function addRun(run) {
    const newRun = { id: Date.now(), ...run }
    runs.value.unshift(newRun)

    // detect PRs for standard distances
    const thresholds = { '1km': 1, '5km': 5, '10km': 10, 'half': 21.0975, 'marathon': 42.195 }
    const newPRs = []
    const pace = (newRun.durationSeconds && newRun.distanceKm) ? (newRun.durationSeconds / newRun.distanceKm) : Infinity
    for (const [key, minKm] of Object.entries(thresholds)) {
      if ((newRun.distanceKm || 0) >= minKm) {
        const prev = prs.value[key]
        if (!prev || pace < prev.pace) {
          prs.value[key] = { runId: newRun.id, pace }
          newPRs.push(key)
        }
      }
    }

    try {
      localStorage.setItem('runs', JSON.stringify(runs.value))
      localStorage.setItem('prs', JSON.stringify(prs.value))
    } catch (e) {}

    return { newPRs }
  }

  function deleteRun(id) {
    runs.value = runs.value.filter(r => r.id !== id)
    try { localStorage.setItem('runs', JSON.stringify(runs.value)) } catch (e) {}
  }

  return { runs, prs, shoes, load, addRun, deleteRun, sortedRuns, recentRuns, streak, weekStats, weeklyData, fitnessScore }
})
