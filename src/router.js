import Home from './views/Home.vue'
import Dashboard from './views/Dashboard.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard },
]

export const router = new createRouter({
  history: createWebHistory(),
  routes,
})
