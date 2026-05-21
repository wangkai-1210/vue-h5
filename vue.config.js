const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',

  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
    webSocketServer: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/deepseek-api': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        pathRewrite: {
          '^/deepseek-api': ''
        }
      },
      '/qwen-api': {
        target: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        changeOrigin: true,
        pathRewrite: {
          '^/qwen-api': ''
        }
      },
      '/kimi-api': {
        target: 'https://api.moonshot.cn/v1',
        changeOrigin: true,
        pathRewrite: {
          '^/kimi-api': ''
        }
      },
      '/openai-api': {
        target: 'https://api.openai.com/v1',
        changeOrigin: true,
        pathRewrite: {
          '^/openai-api': ''
        }
      }
    }
  },

  // 路径别名
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'components': path.resolve(__dirname, 'src/components'),
        'views': path.resolve(__dirname, 'src/views'),
        'utils': path.resolve(__dirname, 'src/utils'),
        'assets': path.resolve(__dirname, 'src/assets')
      }
    }
  },

  // 全局样式变量
  css: {
    loaderOptions: {
      less: {
        additionalData: `
          @import "~@/assets/styles/variables.less";
        `
      }
    }
  }
})
