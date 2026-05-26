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
    path: '/report-display',
    name: 'ReportDisplay',
    component: () => import('@/components/ReportDisplay.vue'),
    meta: { title: '分析报告' }
  },
  {
    path: '*',
    redirect: '/business/diagnosis'
  }
]
