import { createRouter, createWebHistory } from 'vue-router'
import main from '@/views/main.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: main
    }
  ],
})

export default router
