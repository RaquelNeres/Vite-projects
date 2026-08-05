<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Perfil</h1>
    </div>

    <div class="card p-4 max-w-md">
      <label class="block mb-2">Nome</label>
      <input v-model="profile.name" class="w-full mb-3 p-2" />

      <label class="block mb-2">Meta semanal (km)</label>
      <input type="number" v-model.number="profile.weeklyGoalKm" class="w-full mb-3 p-2" />

      <label class="block mb-2">Chave Anthropic (opcional)</label>
      <input v-model="profile.anthropicApiKey" class="w-full mb-3 p-2" />

      <div class="flex gap-2">
        <button @click="save" class="btn-primary">Salvar</button>
        <button @click="reset" type="button" class="btn-ghost">Restaurar padrão</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore.js'
import { useRunsStore } from '../stores/runsStore.js'
import { reactive } from 'vue'

const runsStore = useRunsStore()

const userStore = useUserStore()
const profile = reactive({ ...userStore.profile })

function save() {
  userStore.profile = { ...profile }
  try { localStorage.setItem('user', JSON.stringify(userStore.profile)) } catch (e) {}
  userStore.showToast('Perfil salvo', 'success')
  // regenerate plan with latest runs
  userStore.createPlan(runsStore.runs)
}

function reset() {
  profile.name = 'Usuário'
  profile.weeklyGoalKm = 20
  profile.anthropicApiKey = ''
}
</script>

<style scoped>
</style>
