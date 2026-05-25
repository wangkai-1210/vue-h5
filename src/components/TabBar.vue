<template>
  <div class="tabbar-wrapper">
    <van-tabbar v-model="active" @change="onTabChange" fixed safe-area-inset-bottom>
      <van-popover
        v-model="showBusinessSubmenu"
        placement="top"
        :offset="[0, 10]"
        get-container="body"
        popper-class="tabbar-popover"
      >
        <div class="popover-menu">
          <button
            v-for="item in businessActions"
            :key="item.routeName"
            type="button"
            class="popover-menu-item"
            :class="{ active: isActionActive(item) }"
            @click="onMenuItemClick(item)"
          >
            <span class="popover-menu-content">
              <van-icon :name="item.icon" class="menu-icon" />
              <span class="menu-text">{{ item.text }}</span>
            </span>
            <van-icon v-if="isActionActive(item)" name="success" class="active-icon" />
          </button>
        </div>

        <van-tabbar-item slot="reference" name="business" @click="openBusinessSubmenu">
          <span>商业</span>
          <template #icon="props">
            <van-icon :name="props.active ? 'shop' : 'shop-o'" />
          </template>
        </van-tabbar-item>
      </van-popover>

      <van-popover
        v-model="showLifeSubmenu"
        placement="top"
        :offset="[0, 10]"
        get-container="body"
        popper-class="tabbar-popover"
      >
        <div class="popover-menu">
          <button
            v-for="item in lifeActions"
            :key="item.routeName"
            type="button"
            class="popover-menu-item"
            :class="{ active: isActionActive(item) }"
            @click="onMenuItemClick(item)"
          >
            <span class="popover-menu-content">
              <van-icon :name="item.icon" class="menu-icon" />
              <span class="menu-text">{{ item.text }}</span>
            </span>
            <van-icon v-if="isActionActive(item)" name="success" class="active-icon" />
          </button>
        </div>

        <van-tabbar-item slot="reference" name="life" @click="openLifeSubmenu">
          <span>生命</span>
          <template #icon="props">
            <van-icon :name="props.active ? 'like' : 'like-o'" />
          </template>
        </van-tabbar-item>
      </van-popover>

      <van-popover
        v-model="showMineSubmenu"
        placement="top"
        :offset="[0, 10]"
        get-container="body"
        popper-class="tabbar-popover"
      >
        <div class="popover-menu">
          <button
            v-for="item in mineActions"
            :key="item.routeName"
            type="button"
            class="popover-menu-item"
            :class="{ active: isActionActive(item) }"
            @click="onMenuItemClick(item)"
          >
            <span class="popover-menu-content">
              <van-icon :name="item.icon" class="menu-icon" />
              <span class="menu-text">{{ item.text }}</span>
            </span>
            <van-icon v-if="isActionActive(item)" name="success" class="active-icon" />
          </button>
        </div>

        <van-tabbar-item slot="reference" name="mine" @click="openMineSubmenu">
          <span>我的</span>
          <template #icon="props">
            <van-icon :name="props.active ? 'manager' : 'manager-o'" />
          </template>
        </van-tabbar-item>
      </van-popover>
    </van-tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem, Popover, Icon } from 'vant'

export default {
  name: 'TabBar',
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Popover.name]: Popover,
    [Icon.name]: Icon
  },
  data() {
    return {
      active: 'business',
      showBusinessSubmenu: false,
      showLifeSubmenu: false,
      showMineSubmenu: false,
      businessActions: [
        { text: '诊断分析', icon: 'chart-trending-o', routeName: 'BusinessDiagnosis' },
        { text: '数据分析', icon: 'bar-chart-o', routeName: 'BusinessAnalysis' }
      ],
      lifeActions: [
        { text: '八字', icon: 'notes-o', routeName: 'LifeBazi' },
        { text: '奇门', icon: 'fire-o', routeName: 'LifeQimen' }
      ],
      mineActions: [
        { text: '个人中心', icon: 'user-o', routeName: 'MineProfile' }
      ]
    }
  },
  computed: {
    currentActive() {
      const path = this.$route.path
      if (path.startsWith('/business')) return 'business'
      if (path.startsWith('/life')) return 'life'
      if (path.startsWith('/mine')) return 'mine'
      return ''
    }
  },
  watch: {
    '$route.path': {
      handler() {
        this.active = this.currentActive
        if (!this.$route.path.startsWith('/business')) {
          this.showBusinessSubmenu = false
        }
        if (!this.$route.path.startsWith('/life')) {
          this.showLifeSubmenu = false
        }
        if (!this.$route.path.startsWith('/mine')) {
          this.showMineSubmenu = false
        }
      },
      immediate: true
    }
  },
  methods: {
    onTabChange(name) {
      if (name === 'business') {
        this.openBusinessSubmenu()
        return
      }
      if (name === 'life') {
        this.openLifeSubmenu()
        return
      }
      if (name === 'mine') {
        this.openMineSubmenu()
        return
      }
    },
    openBusinessSubmenu() {
      this.showBusinessSubmenu = true
      this.showLifeSubmenu = false
      this.showMineSubmenu = false
      this.$nextTick(() => {
        this.active = this.currentActive || 'business'
      })
    },
    openLifeSubmenu() {
      this.showLifeSubmenu = true
      this.showBusinessSubmenu = false
      this.showMineSubmenu = false
      this.$nextTick(() => {
        this.active = this.currentActive || 'life'
      })
    },
    openMineSubmenu() {
      this.showMineSubmenu = true
      this.showBusinessSubmenu = false
      this.showLifeSubmenu = false
      this.$nextTick(() => {
        this.active = this.currentActive || 'mine'
      })
    },
    onMenuItemClick(action) {
      this.showBusinessSubmenu = false
      this.showLifeSubmenu = false
      this.showMineSubmenu = false
      if (this.$route.name !== action.routeName) {
        this.$router.push({ name: action.routeName })
      }
    },
    isActionActive(action) {
      return this.$route.name === action.routeName
    }
  }
}
</script>

<style lang="less" scoped>
.tabbar-wrapper {
  position: relative;
}

.popover-menu {
  padding: 4px 0;

  .popover-menu-item {
    width: 100%;
    min-height: 48px;
    padding: 0 14px;
    border: 0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #323233;
    font-size: 15px;
    text-align: left;
    white-space: nowrap;

    &:active {
      background-color: #f7f8fa;
    }

    &.active {
      color: #1989fa;
      background-color: #f2f8ff;
      font-weight: 500;
    }
  }

  .popover-menu-content {
    display: flex;
    align-items: center;
  }

  .menu-icon {
    margin-right: 10px;
    font-size: 18px;
  }

  .menu-text {
    line-height: 20px;
  }

  .active-icon {
    margin-left: 12px;
    font-size: 16px;
    color: #1989fa;
  }
}
</style>

<style lang="less">
.tabbar-popover {
  z-index: 3000 !important;
  max-width: calc(100vw - 32px) !important;
  padding: 6px 0 !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;

  &::before {
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.08)) !important;
  }
}

.van-tabbar .van-popover__wrapper {
  flex: 1;
}

.van-tabbar > .van-popover {
  flex: 1;
}
</style>
