<template>
  <div class="business-layout">
    <keep-alive :include="cachedViews">
      <router-view v-if="$route.meta.keepAlive" />
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </div>
</template>

<script>
export default {
  name: 'BusinessLayout',
  data() {
    return {
      cachedViews: ['BusinessDiagnosis', 'BusinessAnalysis']
    }
  }
}
</script>

<style lang="less" scoped>
.business-layout {
  min-height: 100%;
  background-color: #f5f5f5;
}
</style>
