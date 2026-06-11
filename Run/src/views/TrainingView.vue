<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Treino</h1>
    </div>

    <div v-if="plan && plan.length">
      <div v-for="w in plan" :key="w.week" class="card mb-3 p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold">Semana {{ w.week }} — {{ w.weekKm }} km</h3>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="s in w.sessions" :key="s.name" class="text-sm text-muted">
            <div class="font-medium">{{ s.name }}</div>
            <div>{{ s.count }} x {{ s.eachKm }} km</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="card text-center py-12">
      <p class="text-sm text-muted">Nenhum plano gerado — registre algumas corridas para criar um plano.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/userStore.js'

const userStore = useUserStore()
const plan = computed(() => userStore.trainingPlan?.plan || [])
</script>

<style scoped>
</style>
