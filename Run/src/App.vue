<template>
  <div class="min-h-screen bg-void">
    <!-- Toast notifications -->
    <Teleport to="body">
      <div class="fixed bottom-24 left-0 right-0 z-[100] flex flex-col gap-2 items-center px-4 pointer-events-none">
        <TransitionGroup name="toast">
          <div
            v-for="toast in userStore.toasts"
            :key="toast.id"
            class="pointer-events-auto max-w-sm w-full rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl cursor-pointer"
            :class="toastClass(toast.type)"
            @click="userStore.dismissToast(toast.id)"
          >
            <Trophy v-if="toast.type === 'pr'" class="w-5 h-5 text-amber-400 flex-shrink-0" />
            <CheckCircle v-else-if="toast.type === 'success'" class="w-5 h-5 text-success flex-shrink-0" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-400 flex-shrink-0" />
            <Info v-else class="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span class="text-sm font-medium text-white" style="font-family: Space Grotesk, sans-serif">{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- Router view -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Bottom navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { Trophy, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'
import BottomNav from './components/BottomNav.vue'
import { useRunsStore } from './stores/runsStore.js'
import { useUserStore } from './stores/userStore.js'

const runsStore = useRunsStore()
const userStore = useUserStore()

onMounted(() => {
  runsStore.load()
  userStore.load()
  // Auto-create training plan if none exists
  if (!userStore.trainingPlan) {
    userStore.createPlan(runsStore.runs)
  }
})

function toastClass(type) {
  const map = {
    pr: 'bg-amber-500/20 border border-amber-500/40',
    success: 'bg-success/20 border border-success/40',
    error: 'bg-red-500/20 border border-red-500/40',
    info: 'bg-blue-500/20 border border-blue-500/40',
  }
  return map[type] || map.info
}
</script>

<style>
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>