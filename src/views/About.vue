<template>
  <div class="about-page">
    <van-nav-bar
      title="关于"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div class="content">
      <van-cell-group inset>
        <van-cell title="项目名称" value="vue2-mobile-h5" />
        <van-cell title="版本" value="1.0.0" />
        <van-cell title="技术栈" value="Vue2 + Vant + Vuex + VueRouter" />
        <van-cell title="作者" value="Your Name" />
      </van-cell-group>

      <div class="desc">
        <h3>项目特性</h3>
        <ul>
          <li>基于 Vue CLI 5 构建</li>
          <li>REM 移动端适配（375px 设计稿基准）</li>
          <li>Vant 2 组件库按需加载</li>
          <li>Vue Router 路由管理</li>
          <li>Vuex 状态管理</li>
          <li>Axios 请求封装 + 拦截器</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar, Cell, CellGroup } from 'vant'

export default {
  name: 'AboutPage',
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  }
}
</script>

<style lang="less" scoped>
.about-page {
  .content {
    padding: 12px;
  }

  .desc {
    margin-top: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;

    h3 {
      margin-bottom: 12px;
      font-size: 16px;
      color: #323233;
    }

    ul {
      padding-left: 20px;
      list-style: disc;
    }

    li {
      margin-bottom: 8px;
      color: #666;
      font-size: 14px;
    }
  }
}
</style>
