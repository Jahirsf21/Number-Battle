import { createRouter, createWebHistory } from 'vue-router'
import main from '@/views/main.vue'
import game from '@/views/game.vue'
import history from '@/views/history.vue'
import stats from '../views/stats.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: main,
    },
    {
      path: '/game',
      name: 'game',
      component: game,
    },
    {
      path: '/history',
      name: 'history',
      component: history
    },
    {
      path: '/stats',
      name: 'stats',
      component: stats  
    }
  ],
})

export default router;