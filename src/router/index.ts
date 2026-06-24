import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import OperationView from '../views/OperationView.vue'
import LogView from '../views/LogView.vue'
import PreferencesView from '../views/PreferencesView.vue'
import MorseTestView from '../views/MorseTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                  name: 'home',        component: LandingView },
    { path: '/operation/:id?',    name: 'operation',   component: OperationView },
    { path: '/log',               name: 'log',         component: LogView },
    { path: '/preferences',       name: 'preferences', component: PreferencesView },
    { path: '/morse',             name: 'morse',       component: MorseTestView },
  ],
})

export default router
