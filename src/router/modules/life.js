export default [
  {
    path: '/life',
    name: 'Life',
    component: () => import('@/views/Life.vue'),
    meta: { title: '生命', showTabbar: true }
  },
  {
    path: '/life/bazi',
    name: 'LifeBazi',
    component: () => import('@/views/Life/Bazi.vue'),
    meta: { title: '八字', showTabbar: true }
  },
  {
    path: '/life/qimen',
    name: 'LifeQimen',
    component: () => import('@/views/Life/Qimen.vue'),
    meta: { title: '奇门', showTabbar: true }
  }
]
