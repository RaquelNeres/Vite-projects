<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Progresso</h1>
    </div>

    <ProgressChart />

    <div class="card mt-4">
      <div class="p-4">
        <h2 class="section-title">Últimas corridas</h2>
        <div v-if="runs.length" class="flex flex-col gap-2 mt-3">
          <RunCard v-for="r in runs.slice(0,6)" :key="r.id" :run="r" :prs="runsStore.prs" />
        </div>
        <div v-else class="text-center py-8 text-sm text-muted">Nenhuma corrida registrada ainda.</div>
      </div>
    </div>
    <div class="card mt-4 p-4">
      <h2 class="section-title">Predições de prova (Riegel)</h2>
      <div v-if="predictions.length" class="grid grid-cols-2 gap-3 mt-3">
        <div v-for="p in predictions" :key="p.dist" class="text-sm">
          <div class="font-medium">{{ p.dist }} km</div>
          <div>{{ p.time ? formatSecondsToHMS(p.time) : '--:--:--' }}</div>
        </div>
      </div>
      <div v-else class="text-sm text-muted mt-3">Registre corridas para gerar previsões.</div>
    </div>
  </div>
</template>

<script setup>
import ProgressChart from '../components/ProgressChart.vue'
import RunCard from '../components/RunCard.vue'
import { useRunsStore } from '../stores/runsStore.js'
import { predictTimeSeconds, formatSecondsToHMS } from '../utils/predictor.js'
import { computed } from 'vue'

const runsStore = useRunsStore()
const runs = runsStore.sortedRuns

const referenceRun = computed(() => {
  // choose fastest pace run available
  const arr = runs.value || []
  if (!arr.length) return null
  let best = arr[0]
  let bestPace = (best.durationSeconds || 0) / (best.distanceKm || 1)
  for (const r of arr) {
    if (r.distanceKm && r.durationSeconds) {
      const p = r.durationSeconds / r.distanceKm
      if (p < bestPace) { best = r; bestPace = p }
    }
  }
  return best
})

const predictions = computed(() => {
  const ref = referenceRun.value
  if (!ref) return []
  const baseDist = ref.distanceKm
  const baseTime = ref.durationSeconds
  const targets = [5, 10, 21.0975, 42.195]
  return targets.map(t => ({ dist: t, time: predictTimeSeconds(baseTime, baseDist, t) }))
})
</script>

<style scoped>
</style>
