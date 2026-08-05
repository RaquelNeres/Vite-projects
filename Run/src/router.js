import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from './views/DashboardView.vue'
import ActivitiesView from './views/ActivitiesView.vue'
import LogRunView from './views/LogRunView.vue'
import TrainingView from './views/TrainingView.vue'
import ProgressView from './views/ProgressView.vue'
import ProfileView from './views/ProfileView.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/atividades', name: 'Activities', component: ActivitiesView },
  { path: '/registrar', name: 'LogRun', component: LogRunView },
  { path: '/treino', name: 'Training', component: TrainingView },
  { path: '/progresso', name: 'Progress', component: ProgressView },
  { path: '/perfil', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
