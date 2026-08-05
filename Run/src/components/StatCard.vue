<template>
  <div class="card flex flex-col gap-1 relative overflow-hidden" :class="highlight ? 'border-flame/30' : ''">
    <div v-if="highlight" class="absolute inset-0 bg-flame/5 pointer-events-none" />
    <div class="flex items-center gap-1.5 relative">
      <component :is="iconComponent" v-if="iconComponent" class="w-3.5 h-3.5" :class="highlight ? 'text-flame' : 'text-muted'" />
      <span class="stat-label">{{ label }}</span>
    </div>
    <div class="relative flex items-baseline gap-1">
      <span class="stat-value" :class="highlight ? 'text-flame' : 'text-white'" :style="valueStyle">{{ value }}</span>
      <span v-if="unit" class="text-sm text-muted">{{ unit }}</span>
      <div v-if="change !== null && change !== undefined" class="ml-auto flex items-center gap-0.5 text-xs font-medium" :class="changePositive ? 'text-success' : 'text-red-400'">
        <component :is="changePositive ? TrendingUp : TrendingDown" class="w-3 h-3" />
        {{ Math.abs(change).toFixed(1) }}{{ changeUnit }}
      </div>
    </div>
    <p v-if="subtitle" class="text-xs text-muted">{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Activity, Zap, Clock, MapPin, Heart, Flame, Mountain } from 'lucide-vue-next'

const props = defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  subtitle: String,
  highlight: Boolean,
  icon: String,
  change: Number,
  changeUnit: { type: String, default: '%' },
  changePositive: { type: Boolean, default: true },
  valueStyle: Object,
})

const iconMap = {
  activity: Activity, zap: Zap, clock: Clock, pin: MapPin,
  heart: Heart, flame: Flame, mountain: Mountain, trending: TrendingUp,
}

const iconComponent = computed(() => props.icon ? iconMap[props.icon] : null)
</script>
