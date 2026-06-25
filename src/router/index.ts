import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import OperationLandingView from '../views/OperationLandingView.vue'
import OperationView from '../views/OperationView.vue'
import LogbookView from '../views/LogbookView.vue'
import PreferencesView from '../views/PreferencesView.vue'
import MorseTestView from '../views/MorseTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                name: 'home',       component: LandingView },
    { path: '/operation',       name: 'operation',  component: OperationLandingView },
    { path: '/operation/:id',   name: 'activation', component: OperationView },
    { path: '/logbook',         name: 'logbook',    component: LogbookView },
    { path: '/preferences',     name: 'preferences',component: PreferencesView },
    { path: '/morse',           name: 'morse',      component: MorseTestView },
  ],
})

export default router
