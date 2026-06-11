<template>
  <div class="card group transition-all duration-200 hover:border-faint" :class="{'border-flame/30': hasAnyPR}">
    <!-- PR banner -->
    <div v-if="hasAnyPR" class="flex gap-2 flex-wrap mb-3">
      <div v-for="pr in runPRs" :key="pr.key" class="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-0.5">
        <Trophy class="w-3 h-3 text-amber-400" />
        <span class="text-xs font-bold text-amber-400" style="font-family: Space Grotesk, sans-serif">PR {{ pr.distance }}</span>
      </div>
    </div>

    <div class="flex items-start justify-between gap-3">
      <!-- Left: info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <!-- Type badge -->
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full" :style="{ background: typeInfo.color + '22', color: typeInfo.color }" style="font-family: Space Grotesk, sans-serif">
            {{ typeInfo.emoji }} {{ typeInfo.label }}
          </span>
          <span class="text-xs text-muted">{{ formattedDate }}</span>
        </div>

        <!-- Main stats row -->
        <div class="flex items-baseline gap-4 mb-1">
          <div>
            <span class="text-xl font-bold text-white pace-display">{{ formatDistance(run.distanceKm) }}</span>
            <span class="text-xs text-muted ml-1">km</span>
          </div>
          <div>
            <span class="text-base font-medium text-white pace-display">{{ formatTime(run.durationSeconds) }}</span>
          </div>
          <div>
            <span class="text-base font-medium text-flame pace-display">{{ pace }}</span>
            <span class="text-xs text-muted ml-1">/km</span>
          </div>
        </div>

        <!-- Secondary stats -->
        <div class="flex items-center gap-3 flex-wrap">
          <span v-if="run.elevationM" class="text-xs text-muted flex items-center gap-1">
            <ArrowUp class="w-3 h-3" /> {{ Math.round(run.elevationM) }}m
          </span>
          <span v-if="run.avgHeartRate" class="text-xs text-muted flex items-center gap-1">
            <Heart class="w-3 h-3 text-red-400" /> {{ run.avgHeartRate }} bpm
          </span>
          <span v-if="run.rpe" class="text-xs text-muted">
            RPE {{ run.rpe }}/10
          </span>
        </div>

        <p v-if="run.notes" class="text-xs text-muted mt-2 truncate">{{ run.notes }}</p>
      </div>

      <!-- Right: actions -->
      <div class="flex flex-col items-end gap-2">
        <button
          v-if="showDelete"
          @click.stop="$emit('delete', run.id)"
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <div v-if="run.rpe" class="flex gap-0.5 mt-auto">
          <div v-for="i in 10" :key="i" class="w-1.5 h-4 rounded-sm" :class="i <= run.rpe ? 'bg-flame' : 'bg-border'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Trophy, Trash2, ArrowUp, Heart } from 'lucide-vue-next'
import { formatPace, formatTime, formatDistance, calculatePacePerKm, getRunType } from '../utils/calculations.js'

dayjs.locale('pt-br')

const props = defineProps({
  run: { type: Object, required: true },
  prs: { type: Object, default: () => ({}) },
  showDelete: { type: Boolean, default: false },
})

defineEmits(['delete'])

const typeInfo = computed(() => getRunType(props.run))

const formattedDate = computed(() =>
  dayjs(props.run.date).format('DD [de] MMM[.] YYYY')
)

const pace = computed(() =>
  formatPace(calculatePacePerKm(props.run.distanceKm, props.run.durationSeconds))
)

// Check if this run set any PRs
const runPRs = computed(() => {
  const result = []
  for (const [key, pr] of Object.entries(props.prs)) {
    if (pr.runId === props.run.id) {
      const labels = {
        '1km': '1 km', '1mi': '1 milha', '5km': '5 km',
        '10km': '10 km', 'half': 'Meia', 'marathon': 'Maratona',
      }
      result.push({ key, distance: labels[key] || key })
    }
  }
  return result
})

const hasAnyPR = computed(() => runPRs.value.length > 0)
</script>
