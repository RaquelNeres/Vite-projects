<template>
  <div class="page-container">
    <div class="page-header">
      <RouterLink to="/" class="btn-ghost p-2">
        <ChevronLeft class="w-5 h-5" />
      </RouterLink>
      <h1 class="page-title">Registrar Corrida</h1>
      <div class="w-10" />
    </div>

    <!-- Mode tabs -->
    <div class="flex gap-2 mb-6 bg-surface rounded-2xl p-1 border border-border">
      <button
        v-for="mode in modes"
        :key="mode.key"
        @click="activeMode = mode.key"
        class="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
        :class="activeMode === mode.key ? 'bg-flame text-white' : 'text-muted hover:text-white'"
        style="font-family: Space Grotesk, sans-serif"
      >
        <component :is="mode.icon" class="w-3.5 h-3.5" />
        {{ mode.label }}
      </button>
    </div>

    <GPXUploader @parsed="onGPXParsed" />

    <!-- MANUAL MODE -->
    <form v-if="activeMode === 'manual'" @submit.prevent="submitRun" class="flex flex-col gap-4">

      <!-- Date -->
      <div>
        <label class="stat-label block mb-1.5">Data</label>
        <input v-model="form.date" type="date" :max="today" required />
      </div>

      <!-- Distance -->
      <div>
        <label class="stat-label block mb-1.5">Distância (km)</label>
        <input
          v-model="form.distanceKm"
          type="number"
          step="0.01"
          min="0.1"
          max="500"
          placeholder="0,00"
          class="text-2xl font-bold pace-display"
          required
          @input="recalcPace"
        />
      </div>

      <!-- Duration -->
      <div>
        <label class="stat-label block mb-1.5">Duração (hh:mm:ss)</label>
        <input
          v-model="form.duration"
          type="text"
          placeholder="00:00:00"
          pattern="\d{1,2}:\d{2}:\d{2}"
          class="text-2xl font-bold pace-display tracking-widest"
          required
          @input="recalcPace"
          @blur="formatDuration"
        />
        <p v-if="computedPace" class="text-xs text-muted mt-1.5">
          Pace calculado: <span class="text-flame font-bold pace-display">{{ computedPace }}</span> /km
          · Velocidade: <span class="font-medium">{{ computedSpeed }}</span> km/h
        </p>
      </div>

      <!-- Run type -->
      <div>
        <label class="stat-label block mb-1.5">Tipo</label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="rt in runTypes"
            :key="rt.value"
            type="button"
            @click="form.type = rt.value"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
            :class="form.type === rt.value ? 'border-white text-white' : 'border-border text-muted hover:border-faint'"
            :style="form.type === rt.value ? { background: rt.color + '30', borderColor: rt.color, color: rt.color } : {}"
            style="font-family: Space Grotesk, sans-serif"
          >
            {{ rt.emoji }} {{ rt.label }}
          </button>
        </div>
      </div>

      <!-- Optional fields toggle -->
      <button
        type="button"
        @click="showOptional = !showOptional"
        class="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
        style="font-family: Space Grotesk, sans-serif"
      >
        <ChevronDown class="w-4 h-4 transition-transform" :class="showOptional ? 'rotate-180' : ''" />
        {{ showOptional ? 'Ocultar' : 'Mostrar' }} campos opcionais
      </button>

      <Transition name="expand">
        <div v-if="showOptional" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="stat-label block mb-1.5">Freq. cardíaca média (bpm)</label>
              <input v-model="form.avgHeartRate" type="number" min="60" max="220" placeholder="160" />
            </div>
            <div>
              <label class="stat-label block mb-1.5">FC máxima (bpm)</label>
              <input v-model="form.maxHeartRate" type="number" min="60" max="220" placeholder="180" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="stat-label block mb-1.5">Elevação (m)</label>
              <input v-model="form.elevationM" type="number" min="0" placeholder="0" />
            </div>
            <div>
              <label class="stat-label block mb-1.5">Cadência (ppm)</label>
              <input v-model="form.cadence" type="number" min="100" max="250" placeholder="170" />
            </div>
          </div>

          <!-- RPE slider -->
          <div>
            <label class="stat-label block mb-1.5">Esforço percebido (RPE): {{ form.rpe }}/10</label>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted">Fácil</span>
              <input
                v-model="form.rpe"
                type="range"
                min="1"
                max="10"
                class="flex-1 accent-flame"
              />
              <span class="text-xs text-muted">Máximo</span>
            </div>
            <div class="flex justify-between mt-1">
              <div v-for="i in 10" :key="i" class="w-2 h-2 rounded-full" :class="i <= form.rpe ? 'bg-flame' : 'bg-border'" />
            </div>
          </div>

          <!-- Shoe selection -->
          <div v-if="runsStore.shoes.length">
            <label class="stat-label block mb-1.5">Tênis utilizado</label>
            <select v-model="form.shoeId">
              <option value="">Sem tênis</option>
              <option v-for="shoe in runsStore.shoes" :key="shoe.id" :value="shoe.id">
                {{ shoe.name }}
              </option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label class="stat-label block mb-1.5">Anotações</label>
            <textarea v-model="form.notes" rows="3" placeholder="Como foi o treino?" class="resize-none" />
          </div>
        </div>
      </Transition>

      <button type="submit" class="btn-primary w-full py-3.5 text-base" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
        <CheckCircle v-else class="w-5 h-5" />
        {{ isSubmitting ? 'Salvando...' : 'Salvar corrida' }}
      </button>
    </form>

    <!-- AI PHOTO MODE -->
    <div v-if="activeMode === 'photo'">
      <div class="card mb-4">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles class="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-white" style="font-family: Space Grotesk, sans-serif">Análise por IA</p>
            <p class="text-xs text-muted mt-0.5">Envie um print do seu app de corrida e a IA extrai os dados automaticamente</p>
          </div>
        </div>

        <!-- API Key check -->
        <div v-if="!hasApiKey" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
          <p class="text-xs text-amber-400 mb-2">⚠️ Chave da API Anthropic necessária para análise de imagens.</p>
          <RouterLink to="/perfil" class="text-xs text-flame underline">Configurar no perfil →</RouterLink>
        </div>

        <div
          class="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-flame/50 transition-colors"
          :class="isDragging ? 'border-flame bg-flame/5' : ''"
          @click="$refs.fileInput.click()"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

          <div v-if="!previewUrl">
            <Camera class="w-10 h-10 text-muted mx-auto mb-3" />
            <p class="text-sm text-muted">Toque para selecionar ou arraste uma imagem</p>
            <p class="text-xs text-muted/60 mt-1">PNG, JPG, HEIC suportados</p>
          </div>

          <div v-else class="relative">
            <img :src="previewUrl" class="max-h-48 mx-auto rounded-xl object-contain" />
            <button type="button" @click.stop="clearImage" class="absolute top-2 right-2 w-7 h-7 bg-void/80 rounded-full flex items-center justify-center">
              <X class="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        <button
          v-if="previewUrl && hasApiKey"
          @click="analyzeImage"
          class="btn-primary w-full mt-4"
          :disabled="isAnalyzing"
        >
          <Loader2 v-if="isAnalyzing" class="w-4 h-4 animate-spin" />
          <Sparkles v-else class="w-4 h-4" />
          {{ isAnalyzing ? 'Analisando...' : 'Analisar imagem' }}
        </button>
      </div>

      <!-- Extracted data (pre-fill form) -->
      <div v-if="extractedData" class="card mb-4 border-success/30">
        <div class="flex items-center gap-2 mb-3">
          <CheckCircle class="w-4 h-4 text-success" />
          <span class="text-sm font-medium text-success" style="font-family: Space Grotesk, sans-serif">Dados extraídos com sucesso!</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div v-if="extractedData.distanceKm"><span class="text-muted">Distância:</span> <span class="text-white font-medium pace-display">{{ extractedData.distanceKm }} km</span></div>
          <div v-if="extractedData.duration"><span class="text-muted">Duração:</span> <span class="text-white font-medium pace-display">{{ extractedData.duration }}</span></div>
          <div v-if="extractedData.avgHeartRate"><span class="text-muted">FC média:</span> <span class="text-white font-medium">{{ extractedData.avgHeartRate }} bpm</span></div>
          <div v-if="extractedData.elevationM"><span class="text-muted">Elevação:</span> <span class="text-white font-medium">{{ extractedData.elevationM }} m</span></div>
        </div>
        <button @click="useExtractedData" class="btn-primary w-full mt-3 text-sm py-2.5">
          Usar estes dados
        </button>
      </div>

      <!-- Error -->
      <div v-if="analysisError" class="card border-red-500/30 mb-4">
        <p class="text-sm text-red-400">{{ analysisError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  ChevronLeft, ChevronDown, CheckCircle, Loader2,
  PenLine, Camera, X, Sparkles, Bot
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useRunsStore } from '../stores/runsStore.js'
import { useUserStore } from '../stores/userStore.js'
import { formatPace, calculatePacePerKm, calculateSpeedKmh, parseTimeToSeconds, RUN_TYPES, formatTime } from '../utils/calculations.js'
import GPXUploader from '../components/GPXUploader.vue'

const router = useRouter()
const runsStore = useRunsStore()
const userStore = useUserStore()

const modes = [
  { key: 'manual', label: 'Manual', icon: PenLine },
  { key: 'photo', label: 'Via foto (IA)', icon: Camera },
]
const activeMode = ref('manual')
const showOptional = ref(false)
const isSubmitting = ref(false)
const runTypes = RUN_TYPES

const today = dayjs().format('YYYY-MM-DD')

const form = ref({
  date: today,
  distanceKm: '',
  duration: '',
  type: 'easy',
  avgHeartRate: '',
  maxHeartRate: '',
  elevationM: '',
  cadence: '',
  rpe: 5,
  shoeId: runsStore.shoes[0]?.id || '',
  notes: '',
})

function onGPXParsed(data) {
  if (!data) return
  form.value.distanceKm = data.distanceKm
  form.value.duration = formatTime(data.durationSeconds)
}

const computedPace = computed(() => {
  const dist = parseFloat(form.value.distanceKm)
  const sec = parseTimeToSeconds(form.value.duration)
  if (!dist || !sec) return null
  return formatPace(calculatePacePerKm(dist, sec))
})

const computedSpeed = computed(() => {
  const dist = parseFloat(form.value.distanceKm)
  const sec = parseTimeToSeconds(form.value.duration)
  if (!dist || !sec) return null
  return calculateSpeedKmh(dist, sec).toFixed(1)
})

function recalcPace() {}

function formatDuration() {
  let v = form.value.duration.replace(/\D/g, '')
  if (v.length <= 4) {
    const m = v.slice(0, -2) || '0'
    const s = v.slice(-2) || '00'
    form.value.duration = `00:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
  } else if (v.length <= 6) {
    const h = v.slice(0, -4) || '0'
    const m = v.slice(-4, -2)
    const s = v.slice(-2)
    form.value.duration = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
  }
}

async function submitRun() {
  isSubmitting.value = true
  try {
    const runData = {
      date: form.value.date,
      distanceKm: parseFloat(form.value.distanceKm),
      durationSeconds: parseTimeToSeconds(form.value.duration),
      type: form.value.type,
      avgHeartRate: form.value.avgHeartRate ? parseInt(form.value.avgHeartRate) : null,
      maxHeartRate: form.value.maxHeartRate ? parseInt(form.value.maxHeartRate) : null,
      elevationM: form.value.elevationM ? parseInt(form.value.elevationM) : 0,
      cadence: form.value.cadence ? parseInt(form.value.cadence) : null,
      rpe: parseInt(form.value.rpe),
      shoeId: form.value.shoeId || null,
      notes: form.value.notes,
    }

    const { newPRs } = runsStore.addRun(runData)
    if (newPRs.length) {
      userStore.showPRToast(newPRs)
    } else {
      userStore.showToast('Corrida registrada com sucesso! 🏃', 'success')
    }
    router.push('/')
  } finally {
    isSubmitting.value = false
  }
}

// ─── AI Photo mode ────────────────────────────────────────────────
const fileInput = ref(null)
const previewUrl = ref(null)
const imageBase64 = ref(null)
const isDragging = ref(false)
const isAnalyzing = ref(false)
const extractedData = ref(null)
const analysisError = ref(null)

const hasApiKey = computed(() => !!userStore.profile.anthropicApiKey)

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function processFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    imageBase64.value = e.target.result.split(',')[1]
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  previewUrl.value = null
  imageBase64.value = null
  extractedData.value = null
  analysisError.value = null
}

async function analyzeImage() {
  if (!imageBase64.value || !hasApiKey.value) return
  isAnalyzing.value = true
  analysisError.value = null
  extractedData.value = null

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': userStore.profile.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64.value },
            },
            {
              type: 'text',
              text: 'Extraia os dados de corrida desta imagem. Responda APENAS com JSON válido no formato: {"distanceKm": number, "duration": "HH:MM:SS", "avgHeartRate": number|null, "maxHeartRate": number|null, "elevationM": number|null, "pace": "M:SS"|null, "cadence": number|null}. Se um campo não estiver visível, use null.',
            },
          ],
        }],
      }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    extractedData.value = JSON.parse(clean)
  } catch (e) {
    analysisError.value = `Erro ao analisar: ${e.message}. Verifique sua chave de API.`
  } finally {
    isAnalyzing.value = false
  }
}

function useExtractedData() {
  if (!extractedData.value) return
  const d = extractedData.value
  if (d.distanceKm) form.value.distanceKm = d.distanceKm
  if (d.duration) form.value.duration = d.duration
  if (d.avgHeartRate) form.value.avgHeartRate = d.avgHeartRate
  if (d.maxHeartRate) form.value.maxHeartRate = d.maxHeartRate
  if (d.elevationM) form.value.elevationM = d.elevationM
  if (d.cadence) form.value.cadence = d.cadence
  showOptional.value = true
  activeMode.value = 'manual'
}
</script>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #252532;
  border: none;
  padding: 0;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FF4D1C;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(255, 77, 28, 0.5);
}
</style>
