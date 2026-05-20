<template>
  <div class="home-page">
    <van-nav-bar title="首页" fixed placeholder />

    <div class="content">
      <van-swipe class="banner" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(item, index) in banners" :key="index">
          <div class="banner-item" :style="{ background: item.color }">
            {{ item.text }}
          </div>
        </van-swipe-item>
      </van-swipe>

      <van-grid :column-num="4" class="grid-nav">
        <van-grid-item
          v-for="item in gridList"
          :key="item.text"
          :icon="item.icon"
          :text="item.text"
          @click="onGridClick(item)"
        />
      </van-grid>

      <van-cell-group class="list-group" inset>
        <van-cell
          v-for="item in newsList"
          :key="item.id"
          :title="item.title"
          :label="item.desc"
          is-link
          @click="onCellClick(item)"
        />
      </van-cell-group>

      <van-button
        type="primary"
        block
        class="btn-about"
        @click="$router.push('/about')"
      >
        跳转关于页
      </van-button>
    </div>
  </div>
</template>

<script>
import {
  NavBar,
  Swipe,
  SwipeItem,
  Grid,
  GridItem,
  Cell,
  CellGroup,
  Button,
  Toast
} from 'vant'

export default {
  name: 'HomePage',
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button
  },
  data() {
    return {
      banners: [
        { text: 'Banner 1', color: '#39a9ed' },
        { text: 'Banner 2', color: '#07c160' },
        { text: 'Banner 3', color: '#ff976a' }
      ],
      gridList: [
        { icon: 'photo-o', text: '图片', path: '' },
        { icon: 'chat-o', text: '消息', path: '' },
        { icon: 'cart-o', text: '购物车', path: '' },
        { icon: 'user-o', text: '我的', path: '' },
        { icon: 'star-o', text: '收藏', path: '' },
        { icon: 'setting-o', text: '设置', path: '' },
        { icon: 'location-o', text: '定位', path: '' },
        { icon: 'phone-o', text: '电话', path: '' }
      ],
      newsList: [
        { id: 1, title: 'Vue2 移动端项目搭建完成', desc: '基于 Vue CLI + Vant 的 H5 脚手架' },
        { id: 2, title: 'REM 适配方案', desc: '使用 amfe-flexible + postcss-pxtorem' },
        { id: 3, title: '按需加载 Vant', desc: '通过 babel-plugin-import 实现组件按需引入' }
      ]
    }
  },
  methods: {
    onGridClick(item) {
      Toast(item.text)
    },
    onCellClick(item) {
      Toast(item.title)
    }
  }
}
</script>

<style lang="less" scoped>
.home-page {
  .content {
    padding: 12px;
  }

  .banner {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;

    .banner-item {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
    }
  }

  .grid-nav {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
  }

  .list-group {
    margin-bottom: 12px;
  }

  .btn-about {
    margin-top: 12px;
  }
}
</style>
