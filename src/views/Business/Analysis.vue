<template>
  <div class="analysis-page">
    <van-nav-bar title="数据分析" />

    <div class="content">
      <div class="analysis-card">
        <van-empty description="数据分析功能建设中" />
        <p class="analysis-desc">
          后续将展示企业经营指标、诊断趋势和行业对标等分析内容。
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar, Empty } from 'vant'

export default {
  name: 'BusinessAnalysis',
  components: {
    [NavBar.name]: NavBar,
    [Empty.name]: Empty
  }
}
</script>

<style lang="less" scoped>
.analysis-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .content {
    padding: 16px;
  }

  .analysis-card {
    padding: 24px 16px;
    background: #fff;
    border-radius: 12px;
  }

  .analysis-desc {
    margin: 0 auto;
    max-width: 280px;
    color: #646566;
    font-size: 14px;
    line-height: 22px;
    text-align: center;
  }
}
</style>
