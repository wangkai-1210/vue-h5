export default [
  {
    path: '/business',
    name: 'Business',
    component: () => import('@/views/Business/Layout.vue'),
    meta: { title: '商业', showTabbar: true },
    redirect: '/business/diagnosis',
    children: [
      {
        path: 'diagnosis',
        name: 'BusinessDiagnosis',
        component: () => import('@/views/Business/Diagnosis.vue'),
        meta: { title: '诊断', showTabbar: true, keepAlive: true }
      },
      {
        path: 'analysis',
        name: 'BusinessAnalysis',
        component: () => import('@/views/Business/Analysis.vue'),
        meta: { title: '数据分析', showTabbar: true, keepAlive: true }
      }
    ]
  }
]
