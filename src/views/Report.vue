<template>
  <div class="report-page">
    <van-nav-bar
      title="企业诊断分析报告"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div v-if="report" class="content">
      <!-- 报告头部信息 -->
      <div class="report-header">
        <div class="report-title">{{ report.company || '企业诊断报告' }}</div>
        <div class="report-meta">
          <van-tag round type="primary" class="meta-tag">
            {{ report.modelName }}
          </van-tag>
          <span class="meta-time">{{ report.time }}</span>
        </div>
      </div>

      <!-- 报告内容 -->
      <div class="report-card">
        <div class="report-body">
          <div
            v-for="(node, index) in parsedContent"
            :key="index"
            :class="['md-node', node.type]"
          >
            <!-- 标题 -->
            <template v-if="node.type === 'h1'">
              <h1>{{ node.text }}</h1>
            </template>
            <template v-else-if="node.type === 'h2'">
              <h2>{{ node.text }}</h2>
            </template>
            <template v-else-if="node.type === 'h3'">
              <h3>{{ node.text }}</h3>
            </template>

            <!-- 分隔线 -->
            <template v-else-if="node.type === 'hr'">
              <div class="md-hr" />
            </template>

            <!-- 列表项 -->
            <template v-else-if="node.type === 'li'">
              <div class="md-li">
                <span class="li-marker">{{ node.ordered ? `${node.index}.` : '•' }}</span>
                <span class="li-text">{{ node.text }}</span>
              </div>
            </template>

            <!-- 引用块 -->
            <template v-else-if="node.type === 'blockquote'">
              <blockquote>{{ node.text }}</blockquote>
            </template>

            <!-- 普通段落 -->
            <template v-else>
              <p>{{ node.text }}</p>
            </template>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="report-actions">
        <van-button round block type="primary" @click="$router.back()">
          返回重新填写
        </van-button>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="empty-state">
      <van-empty description="暂无报告数据，请返回首页生成" />
      <van-button round block type="primary" class="empty-btn" @click="$router.replace('/')">
        去生成报告
      </van-button>
    </div>
  </div>
</template>

<script>
import { NavBar, Tag, Button, Empty } from 'vant'

export default {
  name: 'ReportPage',
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Button.name]: Button,
    [Empty.name]: Empty
  },
  data() {
    return {
      report: null
    }
  },
  computed: {
    parsedContent() {
      if (!this.report || !this.report.content) return []
      return this.parseMarkdown(this.report.content)
    }
  },
  created() {
    const data = this.$store.state.reportData
    if (data) {
      this.report = data
    }
  },
  methods: {
    parseMarkdown(text) {
      const lines = text.split('\n')
      const nodes = []
      let listIndex = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line) {
          continue
        }

        // 分隔线
        if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
          nodes.push({ type: 'hr' })
          continue
        }

        // 标题
        if (line.startsWith('# ')) {
          nodes.push({ type: 'h1', text: this.stripInlineMd(line.slice(2)) })
          continue
        }
        if (line.startsWith('## ')) {
          nodes.push({ type: 'h2', text: this.stripInlineMd(line.slice(3)) })
          continue
        }
        if (line.startsWith('### ')) {
          nodes.push({ type: 'h3', text: this.stripInlineMd(line.slice(4)) })
          continue
        }

        // 无序列表
        if (line.startsWith('- ') || line.startsWith('* ')) {
          nodes.push({ type: 'li', text: this.stripInlineMd(line.slice(2)), ordered: false })
          continue
        }

        // 有序列表
        const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/)
        if (orderedMatch) {
          listIndex = parseInt(orderedMatch[1])
          nodes.push({
            type: 'li',
            text: this.stripInlineMd(orderedMatch[2]),
            ordered: true,
            index: listIndex
          })
          continue
        }

        // 引用块
        if (line.startsWith('> ')) {
          nodes.push({ type: 'blockquote', text: this.stripInlineMd(line.slice(2)) })
          continue
        }

        // 普通段落
        nodes.push({ type: 'p', text: this.stripInlineMd(line) })
      }

      return nodes
    },
    stripInlineMd(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
    }
  }
}
</script>

<style lang="less" scoped>
.report-page {
  background-color: #f7f8fa;
  min-height: 100vh;

  .content {
    padding: 12px;
    padding-bottom: 30px;
  }

  .report-header {
    text-align: center;
    padding: 16px 0 20px;

    .report-title {
      font-size: 20px;
      font-weight: bold;
      color: #323233;
      margin-bottom: 12px;
    }

    .report-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      .meta-tag {
        font-size: 12px;
        padding: 2px 10px;
      }

      .meta-time {
        font-size: 12px;
        color: #969799;
      }
    }
  }

  .report-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    overflow: hidden;

    .report-body {
      padding: 20px 16px;
    }
  }

  .md-node {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    h1 {
      font-size: 18px;
      font-weight: bold;
      color: #323233;
      margin: 0 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebedf0;
    }

    h2 {
      font-size: 16px;
      font-weight: bold;
      color: #323233;
      margin: 16px 0 10px;
      padding-left: 8px;
      border-left: 3px solid #1989fa;
    }

    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #444;
      margin: 12px 0 8px;
    }

    p {
      font-size: 14px;
      line-height: 1.8;
      color: #555;
      margin: 0;
    }

    blockquote {
      margin: 0;
      padding: 10px 14px;
      background: #f5f7fa;
      border-radius: 6px;
      border-left: 3px solid #1989fa;
      font-size: 14px;
      color: #666;
      line-height: 1.7;
    }

    .md-hr {
      height: 1px;
      background: #ebedf0;
      margin: 16px 0;
    }

    .md-li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 14px;
      line-height: 1.8;
      color: #555;
      margin-bottom: 6px;

      .li-marker {
        flex-shrink: 0;
        color: #1989fa;
        font-weight: bold;
        min-width: 18px;
        text-align: center;
      }

      .li-text {
        flex: 1;
      }
    }
  }

  .report-actions {
    margin-top: 24px;
    padding: 0 12px;
  }

  .empty-state {
    padding-top: 80px;

    .empty-btn {
      margin: 24px 16px 0;
    }
  }
}
</style>
