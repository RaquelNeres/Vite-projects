<template>
  <div class="card p-4">
    <canvas ref="canvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useRunsStore } from '../stores/runsStore'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler)

const canvas = ref(null)
let chart = null
const runsStore = useRunsStore()

function buildData() {
  const data = runsStore.weeklyData || []
  const labels = data.map(d => d.label)
  const values = data.map(d => d.distanceKm)
  return { labels, values }
}

function renderChart() {
  const ctx = canvas.value && canvas.value.getContext('2d')
  if (!ctx) return
  const d = buildData()
  if (chart) chart.destroy()
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        {
          label: 'Km por semana',
          data: d.values,
          borderColor: '#FF4D1C',
          backgroundColor: 'rgba(255,77,28,0.12)',
          tension: 0.3,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })
}

onMounted(renderChart)
watch(() => runsStore.weeklyData, renderChart, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<style scoped>
canvas { width: 100%; height: 220px; }
</style>
