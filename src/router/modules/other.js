export default [
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/Report.vue'),
    meta: { title: '诊断分析报告' }
  },
  {
    path: '*',
    redirect: '/business/diagnosis'
  }
]
