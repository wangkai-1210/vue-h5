import axios from 'axios'
import { Toast } from 'vant'

// 模型配置列表
export const MODEL_CONFIGS = [
  {
    // DeepSeek - 杭州深度求索出品
    // 特点：推理能力强，中文理解优秀，价格实惠，是国内主流大模型之一
    // 文档：https://platform.deepseek.com/api-docs/
    key: 'deepseek',
    name: 'DeepSeek',
    model: 'deepseek-chat',
    baseURL: process.env.VUE_APP_DEEPSEEK_BASE_URL || '/deepseek-api',
    apiKeyEnv: 'VUE_APP_DEEPSEEK_API_KEY'
  },
  {
    // 通义千问 - 阿里云出品
    // 特点：中文知识丰富，与阿里生态集成度高，适合国内企业场景
    // 文档：https://help.aliyun.com/zh/dashscope/
    key: 'qwen',
    name: '通义千问',
    model: 'qwen-turbo',
    baseURL: process.env.VUE_APP_QWEN_BASE_URL || '/qwen-api',
    apiKeyEnv: 'VUE_APP_QWEN_API_KEY'
  },
  {
    // Kimi - 月之暗面出品
    // 特点：长文本处理能力突出（支持超长上下文），适合处理大量信息
    // 文档：https://platform.moonshot.cn/docs/
    key: 'kimi',
    name: 'Kimi',
    model: 'moonshot-v1-8k',
    baseURL: process.env.VUE_APP_KIMI_BASE_URL || '/kimi-api',
    apiKeyEnv: 'VUE_APP_KIMI_API_KEY'
  },
  {
    // OpenAI - 国际主流大模型
    // 特点：综合能力均衡，全球生态最完善，但国内访问可能不稳定
    // 文档：https://platform.openai.com/docs/
    key: 'openai',
    name: 'OpenAI',
    model: 'gpt-3.5-turbo',
    baseURL: process.env.VUE_APP_OPENAI_BASE_URL || '/openai-api',
    apiKeyEnv: 'VUE_APP_OPENAI_API_KEY'
  }
]

/**
 * 获取 axios 客户端
 * @param {string} baseURL
 * @param {string} apiKeyEnv
 */
function createClient(baseURL, apiKeyEnv) {
  const client = axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  client.interceptors.request.use(
    config => {
      const apiKey = process.env[apiKeyEnv]
      if (apiKey) {
        config.headers['Authorization'] = `Bearer ${apiKey}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  client.interceptors.response.use(
    response => response.data,
    error => {
      const message = error.response?.data?.error?.message || error.message || 'AI 请求失败'
      Toast.fail(message)
      return Promise.reject(error)
    }
  )

  return client
}

/**
 * 生成企业诊断分析报告
 * @param {Object} formData 表单数据
 * @param {string} modelKey 模型 key，默认 deepseek
 */
export function generateReport(formData, modelKey = 'deepseek') {
  const config = MODEL_CONFIGS.find(m => m.key === modelKey) || MODEL_CONFIGS[0]
  const client = createClient(config.baseURL, config.apiKeyEnv)
  const prompt = buildDiagnosisPrompt(formData)

  return client({
    url: '/chat/completions',
    method: 'post',
    data: {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一位资深的企业管理咨询专家，擅长制造业企业诊断分析。请根据用户提供的企业信息，生成一份专业、详实、可落地的企业诊断分析报告。报告要结构清晰，包含企业现状分析、问题诊断、改进建议等内容，语言专业且务实。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    }
  })
}

function buildDiagnosisPrompt(formData) {
  const {
    name,
    company,
    position,
    industry,
    city,
    revenue,
    grossMargin,
    chain,
    orgList,
    targetYear1,
    targetYear2,
    targetYear3,
    targetYear4,
    targetYear5,
    problems
  } = formData

  return `请根据以下企业信息，生成一份详细的企业诊断分析报告：

【基本信息】
- 咨询人：${name || '未填写'}（${position || '未填写'}）
- 企业名称：${company || '未填写'}
- 所属行业：${industry || '未填写'}
- 所在城市：${city || '未填写'}

【经营数据】
- 年营业额：${revenue ? revenue + '万元' : '未填写'}
- 毛利率：${grossMargin ? grossMargin + '%' : '未填写'}
- 产业链位置：${chain?.length ? chain.join('、') : '未填写'}

【组织架构】
现有部门：${orgList?.length ? orgList.join('、') : '未填写'}

【年度目标】
- 一年目标：${targetYear1 ? targetYear1 + '双' : '未填写'}
- 两年目标：${targetYear2 ? targetYear2 + '双' : '未填写'}
- 三年目标：${targetYear3 ? targetYear3 + '双' : '未填写'}
- 四年目标：${targetYear4 ? targetYear4 + '双' : '未填写'}
- 五年目标：${targetYear5 || '未填写'}

【企业难题】
${problems || '未填写'}

请生成一份结构化的企业诊断分析报告，包含以下内容：
1. 企业现状概述
2. 组织架构分析
3. 经营数据分析
4. 目标可行性评估
5. 核心问题诊断
6. 改进建议与落地措施
7. 实施路径规划`
}
