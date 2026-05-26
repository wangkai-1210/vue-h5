import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import ReportDisplay from '@/components/ReportDisplay.vue'

// 移动端适配
import 'amfe-flexible'

// 全局样式
import '@/assets/styles/reset.less'

// Vant 组件按需引入（在页面/组件中引入）



// 全局注册，组件名称为 'report-display'
// Vue.component('report-display', ReportDisplay)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
