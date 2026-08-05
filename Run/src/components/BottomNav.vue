<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe" style="background: rgba(10,10,15,0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.06);">
      <div class="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        <div v-for="item in navItems" :key="item.to" class="flex-1 flex justify-center">
          <RouterLink :to="item.to" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200" :class="isActive(item.to) ? 'text-flame' : 'text-muted hover:text-white'">
            <component :is="icons[item.icon]" class="w-5 h-5 transition-transform duration-200" :class="isActive(item.to) ? 'scale-110' : ''" />
            <span class="text-xs font-medium" style="font-family: Space Grotesk, sans-serif">{{ item.label }}</span>
            <div v-if="isActive(item.to)" class="w-1 h-1 rounded-full bg-flame mt-0.5" />
          </RouterLink>
        </div>

        <!-- FAB center button -->
        <div class="relative -mt-6">
          <router-link
            to="/registrar"
            class="w-14 h-14 rounded-2xl flame-gradient flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 flame-glow"
          >
            <Plus class="w-7 h-7 text-white" :stroke-width="2.5" />
          </router-link>
        </div>
      </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { Home, Activity, Plus, Zap, TrendingUp, BarChart2 } from 'lucide-vue-next'

const route = useRoute()
const icons = { home: Home, activity: Activity, zap: Zap, 'trending-up': TrendingUp }
const navItems = [
  { to: '/', icon: 'home', label: 'Início' },
  { to: '/atividades', icon: 'activity', label: 'Atividades' },
  { to: '/treino', icon: 'zap', label: 'Treino' },
  { to: '/progresso', icon: 'trending-up', label: 'Progresso' },
]
function isActive(to) { return route.path === to }
</script>
