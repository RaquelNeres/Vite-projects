import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Edentro from './components/Edentro.vue';

const routes = [
  { path: '/', component: Home },
  {
    path: '/task',
    name: 'TaskDetails',
    component: Edentro,
    props: route => ({
      title: route.query.title,
      description: route.query.description || ''
    })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;