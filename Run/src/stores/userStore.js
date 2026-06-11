import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateTrainingPlan } from '../utils/training.js'

export const useUserStore = defineStore('user', () => {
  const profile = ref({ anthropicApiKey: '', name: 'Usuário', weeklyGoalKm: 20 })
  const toasts = ref([])
  const trainingPlan = ref(null)
  const todayWorkout = ref(null)

  function load() {
    try {
      const raw = localStorage.getItem('user')
      if (raw) profile.value = JSON.parse(raw)
    } catch (e) {}
  }

  function save() {
    try { localStorage.setItem('user', JSON.stringify(profile.value)) } catch (e) {}
  }

  function showToast(message, type = 'info') {
    toasts.value.push({ id: Date.now(), message, type })
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function showPRToast(prs) {
    showToast('Novo recorde pessoal! 🏅', 'success')
  }

  function createPlan(runs) {
    // compute km in the last 7 days
    const now = Date.now()
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const recentRuns = (runs || []).filter(r => {
      const d = r.date ? new Date(r.date).getTime() : 0
      return d && (now - d) <= weekMs
    })
    const currentWeeklyKm = recentRuns.reduce((s, r) => s + (r.distanceKm || 0), 0)
    // default target from profile
    const target = profile.value.weeklyGoalKm || Math.max(20, Math.round(currentWeeklyKm * 1.3))
    trainingPlan.value = { createdAt: Date.now(), runsCount: runs?.length || 0, plan: generateTrainingPlan(currentWeeklyKm, target, 12) }
  }

  return { profile, toasts, trainingPlan, todayWorkout, load, save, showToast, dismissToast, showPRToast, createPlan }
})
