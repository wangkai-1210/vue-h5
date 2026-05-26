<!--
 * @Description: 报告文件组件
 * @Author: wang_k
 * @Date: 2026-05-25 17:01:05
 * @LastEditTime: 2026-05-26 11:33:09
 * @FilePath: /vue2-mobile-h5/src/components/ReportDisplay.vue
-->
<template>
  <div class="report-display">
    <van-nav-bar
      title="分析报告"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />
    <!-- 头部信息区域（可配置显示） -->
    <div v-if="showHeader && finalReport" class="report-header">
      <div class="report-title">{{ finalReport.company || "分析报告" }}</div>
      <div class="report-meta">
        <van-tag
          v-if="finalReport.modelName"
          round
          type="primary"
          class="meta-tag"
        >
          {{ finalReport.modelName }}
        </van-tag>
        <span v-if="finalReport.time" class="meta-time">{{
          finalReport.time
        }}</span>
      </div>
    </div>

    <!-- 主要内容卡片 -->
    <div v-if="finalReport && finalReport.content" class="report-card">
      <div class="report-body" id="content" v-html="markdownContent"></div>
    </div>

    <!-- 空状态展示 -->
    <div v-else-if="!finalReport || !finalReport.content" class="empty-state">
      <slot name="empty">
        <van-empty :description="emptyText" />
      </slot>
    </div>

    <!-- 底部操作区插槽（用于放置按钮等自定义操作） -->
    <div v-if="$slots.actions" class="report-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
import { marked } from "marked";
import { NavBar, Tag, Empty } from "vant";

export default {
  name: "ReportDisplay",
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Empty.name]: Empty,
  },
  props: {
    // 报告数据对象（优先使用 prop，若未传入则从 store 读取）
    report: {
      type: Object,
      default: null,
    },
    // 是否显示报告头部信息
    showHeader: {
      type: Boolean,
      default: true,
    },
    // 空状态提示文本
    emptyText: {
      type: String,
      default: "暂无报告数据",
    },
  },
  data() {
    return {
      finalReport: null,
      markdownContent: "",
    };
  },
  computed: {
    // 解析后的内容节点列表
    parsedContent() {
      console.log(this.finalReport, "finalReport");

      if (!this.finalReport || !this.finalReport.content) return [];
      return this.parseMarkdown(this.finalReport.content);
    },
  },
  created() {
    // 从 store 中获取报告数据
    const data = this.$store.state.reportData;
    if (data) {
      this.finalReport = data;
      this.markdownContent = this.renderMarkdown(data.content);
    }
  },
  methods: {
    /**
     * 渲染 Markdown 内本为 HTML
     * @param markdown Markdown 格式文本
     * @returns HTML 字符串
     */
    renderMarkdown(markdown) {
      return marked.parse(markdown);
    },
    /**
     * 解析 Markdown 文本为节点数组（增强版）
     * @param {string} text - Markdown 格式文本
     * @returns {Array} 节点数组
     */
    parseMarkdown(text) {
      const lines = text.split(/\r?\n/);
      const nodes = [];
      let i = 0;
      const total = lines.length;

      // 辅助：判断是否为空行
      const isEmptyLine = (line) => line.trim() === "";

      while (i < total) {
        const line = lines[i];
        const trimmed = line.trim();

        // 空行直接跳过（不产生节点，但会结束当前块）
        if (isEmptyLine(line)) {
          i++;
          continue;
        }

        // 1. 分隔线
        if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
          nodes.push({ type: "hr" });
          i++;
          continue;
        }

        // 2. 标题
        if (trimmed.startsWith("# ")) {
          nodes.push({
            type: "h1",
            text: this.stripInlineMd(trimmed.slice(2)),
          });
          i++;
          continue;
        }
        if (trimmed.startsWith("## ")) {
          nodes.push({
            type: "h2",
            text: this.stripInlineMd(trimmed.slice(3)),
          });
          i++;
          continue;
        }
        if (trimmed.startsWith("### ")) {
          nodes.push({
            type: "h3",
            text: this.stripInlineMd(trimmed.slice(4)),
          });
          i++;
          continue;
        }

        // 3. 代码块 ```...```
        if (trimmed.startsWith("```")) {
          const lang = trimmed.slice(3).trim();
          let codeLines = [];
          i++; // 跳过开始标记行
          while (i < total && !lines[i].trim().startsWith("```")) {
            codeLines.push(lines[i]);
            i++;
          }
          i++; // 跳过结束标记行
          nodes.push({
            type: "code",
            text: codeLines.join("\n"),
            lang: lang || "",
          });
          continue;
        }

        // 4. 有序列表项 (数字. 开头)，支持多行（后续行以空格或制表符开头）
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          const index = parseInt(orderedMatch[1], 10);
          let content = orderedMatch[2];
          let j = i + 1;
          while (j < total && /^\s+\S/.test(lines[j])) {
            content += " " + lines[j].trim();
            j++;
          }
          nodes.push({
            type: "li",
            text: this.stripInlineMd(content),
            ordered: true,
            index: index,
          });
          i = j;
          continue;
        }

        // 5. 无序列表项 (- * +)，支持多行
        const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
        if (unorderedMatch) {
          let content = unorderedMatch[1];
          let j = i + 1;
          while (j < total && /^\s+\S/.test(lines[j])) {
            content += " " + lines[j].trim();
            j++;
          }
          nodes.push({
            type: "li",
            text: this.stripInlineMd(content),
            ordered: false,
          });
          i = j;
          continue;
        }

        // 6. 引用块 (> 开头)，支持多行连续引用
        if (trimmed.startsWith(">")) {
          let quoteLines = [];
          let j = i;
          while (j < total && lines[j].trim().startsWith(">")) {
            let quoteLine = lines[j].trim().slice(1).trim();
            quoteLines.push(quoteLine);
            j++;
          }
          nodes.push({
            type: "blockquote",
            text: this.stripInlineMd(quoteLines.join("\n")),
          });
          i = j;
          continue;
        }

        // 7. 普通段落（多行合并，直到遇到空行或其它块级标记）
        let paragraphLines = [];
        let j = i;
        while (j < total) {
          const curLine = lines[j];
          const curTrimmed = curLine.trim();
          // 遇到空行或其它特殊行标记则结束段落
          if (
            curTrimmed === "" ||
            curTrimmed.startsWith("#") ||
            curTrimmed.startsWith("```") ||
            /^---+$/.test(curTrimmed) ||
            /^\*\*\*+$/.test(curTrimmed) ||
            /^\d+\.\s/.test(curTrimmed) ||
            /^[-*+]\s/.test(curTrimmed) ||
            curTrimmed.startsWith(">")
          ) {
            break;
          }
          paragraphLines.push(curLine.trim());
          j++;
        }
        if (paragraphLines.length) {
          nodes.push({
            type: "p",
            text: this.stripInlineMd(paragraphLines.join(" ")),
          });
        }
        i = j;
      }

      return nodes;
    },

    /**
     * 增强版：移除行内 Markdown 标记（加粗、斜体、行内代码、链接、图片、删除线等）
     * @param {string} text - 原始文本
     * @returns {string} 纯文本
     */
    stripInlineMd(text) {
      if (!text) return "";
      return text
        .replace(/\*\*(.*?)\*\*/g, "$1") // 加粗
        .replace(/\*(.*?)\*/g, "$1") // 斜体
        .replace(/`(.*?)`/g, "$1") // 行内代码
        .replace(/!\[.*?\]\(.*?\)/g, "") // 图片
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 链接
        .replace(/~~(.*?)~~/g, "$1") // 删除线（扩展）
        .replace(/^>\s?/, ""); // 去除引用标记残留
    },
  },
  beforeDestroy() {
    this.$store.commit("SET_REPORT_DATA", null);
  },
};
</script>

<style lang="less" scoped>
.report-display {
  background-color: #f7f8fa;
  width: 100%;

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
      font-size: 18px;
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

    // 代码块样式
    .md-code {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 12px;
      overflow-x: auto;
      font-size: 13px;
      font-family: "Courier New", "SF Mono", Monaco, Consolas, monospace;
      margin: 12px 0;
      line-height: 1.5;

      code {
        background: transparent;
        padding: 0;
        font-size: inherit;
        color: #2c3e50;
      }
    }
  }

  .report-actions {
    margin-top: 24px;
    padding: 0 12px;
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}

</style>
