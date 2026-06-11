<template>
  <div class="page-container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-xs text-muted uppercase tracking-widest" style="font-family: Space Grotesk, sans-serif">{{ greeting }}</p>
        <h1 class="text-2xl font-bold" style="font-family: Space Grotesk, sans-serif">{{ userStore.profile.name }}</h1>
      </div>
      <div class="flex items-center gap-3">
        <!-- Streak badge -->
        <div v-if="runsStore.streak > 0" class="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-1.5">
          <Flame class="w-4 h-4 text-amber-400" />
          <span class="text-sm font-bold text-amber-400" style="font-family: Space Grotesk, sans-serif">{{ runsStore.streak }}d</span>
        </div>
        <RouterLink to="/perfil" class="w-9 h-9 rounded-xl bg-elevated border border-border flex items-center justify-center hover:border-flame/50 transition-colors">
          <User class="w-4 h-4 text-muted" />
        </RouterLink>
      </div>
    </div>

    <!-- Today's training card -->
    <div v-if="todayWorkout" class="mb-4">
      <div class="rounded-2xl overflow-hidden border border-border" :class="todayWorkout.type === 'rest' ? 'bg-surface' : 'bg-surface border-flame/20'">
        <div class="px-4 pt-4 pb-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 rounded-full bg-flame animate-pulse" />
            <span class="text-xs font-semibold text-flame uppercase tracking-widest" style="font-family: Space Grotesk, sans-serif">Treino de hoje</span>
            <span class="text-xs text-muted ml-auto">Semana {{ todayWorkout.week }}</span>
          </div>
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-bold text-white" style="font-family: Space Grotesk, sans-serif">{{ todayWorkout.label }}</h2>
              <p class="text-sm text-muted mt-0.5">{{ todayWorkout.note }}</p>
            </div>
            <div v-if="todayWorkout.distanceKm > 0" class="text-right">
              <p class="text-xl font-bold text-white pace-display">{{ todayWorkout.distanceKm }}</p>
              <p class="text-xs text-muted">km</p>
            </div>
          </div>
        </div>
        <div class="px-4 pb-4">
          <RouterLink to="/registrar" class="btn-primary w-full text-sm py-2.5">
            <Plus class="w-4 h-4" /> Registrar corrida
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- No plan prompt -->
    <div v-else-if="!userStore.trainingPlan" class="card mb-4 text-center py-6">
      <Target class="w-10 h-10 text-muted mx-auto mb-3" />
      <p class="text-sm text-muted mb-3">Nenhum plano de treino ativo</p>
      <RouterLink to="/treino" class="btn-primary text-sm px-5 py-2.5 inline-flex">Criar plano</RouterLink>
    </div>

    <!-- Week stats -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="section-title">Esta semana</h2>
        <div class="flex items-center gap-1.5 text-xs text-muted">
          <span v-if="weekVsLast !== null" :class="weekVsLast >= 0 ? 'text-success' : 'text-red-400'" class="font-medium">
            {{ weekVsLast >= 0 ? '+' : '' }}{{ weekVsLast.toFixed(1) }}km vs sem. anterior
          </span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <StatCard
          label="Distância"
          :value="weekStats.distanceKm.toFixed(1)"
          unit="km"
          icon="pin"
          :highlight="weekStats.distanceKm > 0"
        />
        <StatCard
          label="Tempo"
          :value="formatTime(weekStats.timeSeconds)"
          icon="clock"
        />
        <StatCard
          label="Corridas"
          :value="weekStats.count"
          unit="runs"
          icon="activity"
        />
      </div>
    </div>

    <!-- Weekly goal progress -->
    <div v-if="userStore.profile.weeklyGoalKm" class="card mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-white" style="font-family: Space Grotesk, sans-serif">Meta semanal</span>
        <span class="text-sm font-bold text-flame pace-display">
          {{ weekStats.distanceKm.toFixed(1) }} / {{ userStore.profile.weeklyGoalKm }} km
        </span>
      </div>
      <div class="h-2 bg-border rounded-full overflow-hidden">
        <div
          class="h-full flame-gradient rounded-full transition-all duration-700"
          :style="{ width: `${Math.min(100, (weekStats.distanceKm / userStore.profile.weeklyGoalKm) * 100)}%` }"
        />
      </div>
      <p class="text-xs text-muted mt-1.5">
        {{ weekGoalRemaining > 0 ? `Faltam ${weekGoalRemaining.toFixed(1)} km` : '🎉 Meta atingida!' }}
      </p>
    </div>

    <!-- Mini weekly chart -->
    <div class="card mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title">Últimas 8 semanas</h2>
        <RouterLink to="/progresso" class="text-xs text-flame hover:text-ember font-medium transition-colors" style="font-family: Space Grotesk, sans-serif">Ver tudo →</RouterLink>
      </div>
      <div class="flex items-end gap-1.5 h-20">
        <div
          v-for="(week, i) in lastEightWeeks"
          :key="i"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div class="w-full rounded-t-sm relative flex-1 flex items-end">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :class="i === lastEightWeeks.length - 1 ? 'bg-flame' : 'bg-faint'"
              :style="{ height: `${Math.max(2, (week.distanceKm / maxWeekKm) * 64)}px` }"
            />
          </div>
          <span class="text-[9px] text-muted" style="font-family: Space Grotesk, sans-serif">{{ week.label }}</span>
        </div>
      </div>
    </div>

    <!-- Fitness score -->
    <div class="card mb-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="stat-label">Forma física</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-4xl font-bold" style="font-family: JetBrains Mono, monospace; color: {{ fitnessColor }}">{{ runsStore.fitnessScore }}</span>
            <span class="text-sm text-muted">/ 100</span>
          </div>
          <p class="text-xs text-muted mt-1">{{ fitnessLabel }}</p>
        </div>
        <div class="relative w-16 h-16">
          <svg viewBox="0 0 64 64" class="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#252532" stroke-width="6" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              :stroke="fitnessColor" stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="`${(runsStore.fitnessScore / 100) * 163.4} 163.4`"
              class="transition-all duration-1000"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <Activity class="w-5 h-5" :style="{ color: fitnessColor }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent activities -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="section-title">Atividades recentes</h2>
        <RouterLink to="/atividades" class="text-xs text-flame hover:text-ember font-medium transition-colors" style="font-family: Space Grotesk, sans-serif">Ver todas →</RouterLink>
      </div>

      <div v-if="runsStore.recentRuns.length" class="flex flex-col gap-3">
        <RunCard
          v-for="run in runsStore.recentRuns.slice(0, 5)"
          :key="run.id"
          :run="run"
          :prs="runsStore.prs"
        />
      </div>

      <div v-else class="card text-center py-12">
        <MapPin class="w-12 h-12 text-muted mx-auto mb-4" />
        <h3 class="font-semibold mb-2" style="font-family: Space Grotesk, sans-serif">Nenhuma corrida ainda</h3>
        <p class="text-sm text-muted mb-4">Registre sua primeira corrida!</p>
        <RouterLink to="/registrar" class="btn-primary inline-flex text-sm px-6 py-2.5">
          <Plus class="w-4 h-4" /> Registrar corrida
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Flame, User, Plus, Target, Activity, MapPin } from 'lucide-vue-next'
import dayjs from 'dayjs'
import StatCard from '../components/StatCard.vue'
import RunCard from '../components/RunCard.vue'
import { useRunsStore } from '../stores/runsStore.js'
import { useUserStore } from '../stores/userStore.js'
import { formatTime, getLastWeekStats } from '../utils/calculations.js'

const runsStore = useRunsStore()
const userStore = useUserStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const todayWorkout = computed(() => userStore.todayWorkout)
const weekStats = computed(() => runsStore.weekStats)

const lastEightWeeks = computed(() => runsStore.weeklyData.slice(-8))
const maxWeekKm = computed(() => Math.max(1, ...lastEightWeeks.value.map(w => w.distanceKm)))

const weekVsLast = computed(() => {
  const lastWeek = getLastWeekStats(runsStore.runs)
  if (!lastWeek.distanceKm) return null
  return weekStats.value.distanceKm - lastWeek.distanceKm
})

const weekGoalRemaining = computed(() =>
  Math.max(0, userStore.profile.weeklyGoalKm - weekStats.value.distanceKm)
)

const fitnessColor = computed(() => {
  const s = runsStore.fitnessScore
  if (s >= 70) return '#22C55E'
  if (s >= 40) return '#FF8F4F'
  if (s >= 20) return '#FF4D1C'
  return '#6B6B88'
})

const fitnessLabel = computed(() => {
  const s = runsStore.fitnessScore
  if (s >= 70) return 'Excelente condicionamento'
  if (s >= 40) return 'Bom condicionamento'
  if (s >= 20) return 'Em desenvolvimento'
  return 'Comece a treinar!'
})
</script>
