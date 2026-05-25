export default [
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/Mine.vue'),
    meta: { title: '我的', showTabbar: true }
  },
  {
    path: '/mine/profile',
    name: 'MineProfile',
    component: () => import('@/views/Mine/Profile.vue'),
    meta: { title: '个人中心', showTabbar: true }
  }
]
