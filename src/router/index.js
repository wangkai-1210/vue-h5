import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 导入路由模块
import businessRoutes from './modules/business'
import lifeRoutes from './modules/life'
import mineRoutes from './modules/mine'
import otherRoutes from './modules/other'

// 合并所有路由
const routes = [
  ...businessRoutes,
  ...lifeRoutes,
  ...mineRoutes,
  ...otherRoutes
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title || 'Vue2 移动端 H5'
  next()
})

export default router
