<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Atividades</h1>
      <div class="flex items-center gap-2">
        <button @click="showFilters = !showFilters" class="btn-ghost text-sm py-1.5 px-3">
          <Filter class="w-4 h-4" />
          <span v-if="activeFilter !== 'all'" class="w-1.5 h-1.5 rounded-full bg-flame" />
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="relative mb-3">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar corridas..."
        class="pl-10 pr-4 py-2.5 text-sm"
      />
    </div>

    <!-- Filters -->
    <Transition name="slide-down">
      <div v-if="showFilters" class="mb-4">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            v-for="f in filterOptions"
            :key="f.value"
            @click="activeFilter = f.value"
            class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium"
            :class="activeFilter === f.value
              ? 'bg-flame border-flame text-white'
              : 'border-border text-muted hover:border-faint hover:text-white'"
            style="font-family: Space Grotesk, sans-serif"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Summary bar -->
    <div class="card mb-4" v-if="filteredRuns.length">
      <div class="flex justify-around">
        <div class="text-center">
          <p class="stat-value text-xl">{{ totalFilteredDistance }}</p>
          <p class="stat-label">km total</p>
        </div>
        <div class="w-px bg-border" />
        <div class="text-center">
          <p class="stat-value text-xl">{{ filteredRuns.length }}</p>
          <p class="stat-label">corridas</p>
        </div>
        <div class="w-px bg-border" />
        <div class="text-center">
          <p class="stat-value text-xl">{{ avgPaceFormatted }}</p>
          <p class="stat-label">pace médio</p>
        </div>
      </div>
    </div>

    <!-- Run list grouped by month -->
    <div v-if="groupedRuns.length">
      <div v-for="group in groupedRuns" :key="group.month" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <h2 class="text-sm font-semibold text-muted uppercase tracking-wider" style="font-family: Space Grotesk, sans-serif">{{ group.month }}</h2>
          <div class="flex-1 h-px bg-border" />
          <span class="text-xs text-muted">{{ group.totalKm.toFixed(1) }} km</span>
        </div>
        <div class="flex flex-col gap-3">
          <RunCard
            v-for="run in group.runs"
            :key="run.id"
            :run="run"
            :prs="runsStore.prs"
            :show-delete="true"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <Activity class="w-12 h-12 text-muted mx-auto mb-4" />
      <h3 class="font-semibold mb-2" style="font-family: Space Grotesk, sans-serif">
        {{ searchQuery || activeFilter !== 'all' ? 'Nenhuma corrida encontrada' : 'Sem atividades' }}
      </h3>
      <p class="text-sm text-muted">
        {{ searchQuery ? 'Tente outros termos' : 'Registre sua primeira corrida!' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Filter, Search, Activity } from 'lucide-vue-next'
import RunCard from '../components/RunCard.vue'
import { useRunsStore } from '../stores/runsStore.js'
import { useUserStore } from '../stores/userStore.js'
import { formatPace, calculatePacePerKm } from '../utils/calculations.js'

dayjs.locale('pt-br')

const runsStore = useRunsStore()
const userStore = useUserStore()

const showFilters = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

const filterOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'easy', label: '🟢 Fácil' },
  { value: 'tempo', label: '🟡 Tempo' },
  { value: 'long', label: '🔵 Long Run' },
  { value: 'intervals', label: '🟣 Intervalos' },
  { value: 'race', label: '🔴 Corrida' },
  { value: 'pr', label: '🏆 PRs' },
]

const filteredRuns = computed(() => {
  let result = [...runsStore.sortedRuns]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.notes?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.distanceKm.toString().includes(q)
    )
  }

  if (activeFilter.value === 'pr') {
    const prRunIds = new Set(Object.values(runsStore.prs).map(p => p.runId))
    result = result.filter(r => prRunIds.has(r.id))
  } else if (activeFilter.value !== 'all') {
    result = result.filter(r => r.type === activeFilter.value)
  }

  return result
})

const groupedRuns = computed(() => {
  const groups = {}
  for (const run of filteredRuns.value) {
    const key = dayjs(run.date).format('MMMM YYYY')
    if (!groups[key]) groups[key] = { month: key, runs: [], totalKm: 0 }
    groups[key].runs.push(run)
    groups[key].totalKm += run.distanceKm
  }
  return Object.values(groups)
})

const totalFilteredDistance = computed(() =>
  filteredRuns.value.reduce((s, r) => s + r.distanceKm, 0).toFixed(1)
)

const avgPaceFormatted = computed(() => {
  const valid = filteredRuns.value.filter(r => r.distanceKm > 0 && r.durationSeconds > 0)
  if (!valid.length) return '--:--'
  const avgPace = valid.reduce((s, r) => s + r.durationSeconds / r.distanceKm, 0) / valid.length
  return formatPace(avgPace)
})

function handleDelete(id) {
  if (confirm('Remover esta corrida?')) {
    runsStore.deleteRun(id)
    userStore.showToast('Corrida removida', 'info')
  }
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
