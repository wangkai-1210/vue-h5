export default [
  {
    path: '/life',
    name: 'Life',
    component: () => import('@/views/Life.vue'),
    meta: { title: '命理', showTabbar: true }
  },
  {
    path: '/mingli/bazi',
    name: 'MingliBaZi',
    component: () => import('@/views/Mingli/BaZi.vue'),
    meta: { title: '八字', showTabbar: true }
  },
  {
    path: '/mingli/qimen-dunjia',
    name: 'MingliQiMenDunJia',
    component: () => import('@/views/Mingli/QiMenDunJia.vue'),
    meta: { title: '奇门遁甲', showTabbar: true }
  }
]
