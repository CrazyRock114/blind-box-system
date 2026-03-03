import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Layout from '../components/Layout.vue'
import Dashboard from '../pages/Dashboard.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '数据概览' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
