<template>
  <div id="app">
    <div class="page-body" :class="{ 'page-body--with-tabbar': showTabbar }">
      <router-view />
    </div>

    <TabBar v-if="showTabbar" />
  </div>
</template>

<script>
import TabBar from '@/components/TabBar.vue'

export default {
  name: 'App',
  components: {
    TabBar
  },
  computed: {
    showTabbar() {
      return this.$route.meta.showTabbar
    }
  }
}
</script>

<style lang="less">
#app {
  --app-tabbar-height: 50px;
  --app-safe-area-bottom: constant(safe-area-inset-bottom);
  --app-safe-area-bottom: env(safe-area-inset-bottom);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-body {
  min-height: 100vh;
}

.page-body--with-tabbar {
  padding-bottom: calc(var(--app-tabbar-height) + var(--app-safe-area-bottom));
}
</style>
