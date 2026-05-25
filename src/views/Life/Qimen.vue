<template>
  <div class="qimen-page">
    <van-nav-bar title="奇门" fixed placeholder left-arrow @click-left="$router.back()" />

    <div class="content">
      <div class="placeholder-card">
        <div class="placeholder-title">奇门模块</div>
        <div class="placeholder-desc">内容待补充</div>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar } from 'vant'

export default {
  name: 'QimenPage',
  components: {
    [NavBar.name]: NavBar
  }
}
</script>

<style lang="less" scoped>
.qimen-page {
  .content {
    padding: 12px;
  }

  .placeholder-card {
    padding: 24px 16px;
    border-radius: 12px;
    background: #fff;
    text-align: center;
  }

  .placeholder-title {
    color: #323233;
    font-size: 18px;
    font-weight: 600;
  }

  .placeholder-desc {
    margin-top: 8px;
    color: #969799;
    font-size: 14px;
  }
}
</style>
