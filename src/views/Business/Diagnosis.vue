<template>
  <div class="diagnosis-page">
    <van-nav-bar title="企业诊断咨询" fixed placeholder />

    <div class="content">
      <van-form @submit="onSubmit">
        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请填写姓名' }]"
          />
          <van-field name="gender" label="性别">
            <template #input>
              <van-radio-group v-model="form.gender" direction="horizontal">
                <van-radio name="男">男</van-radio>
                <van-radio name="女">女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="form.company"
            name="company"
            label="公司名称"
            placeholder="请输入公司名称"
            :rules="[{ required: true, message: '请填写公司名称' }]"
          />
          <van-field
            v-model="form.position"
            name="position"
            label="职务"
            placeholder="请输入职务"
          />
          <van-field
            v-model="form.mobile"
            name="mobile"
            type="tel"
            label="手机号码"
            placeholder="请输入手机号码"
            :rules="[
              { required: true, message: '请填写手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="form.wechat"
            name="wechat"
            label="微信号"
            placeholder="请输入微信号"
          />
          <van-field
            v-model="form.qq"
            name="qq"
            type="digit"
            label="QQ号"
            placeholder="请输入QQ号"
          />
        </van-cell-group>

        <!-- 企业信息 -->
        <div class="section-title">企业信息</div>
        <van-cell-group inset>
          <van-field
            v-model="form.industry"
            name="industry"
            label="所属行业"
            placeholder="请输入所属行业"
            readonly
            clickable
            @click="showIndustryPicker = true"
          />
          <van-popup v-model="showIndustryPicker" round position="bottom">
            <van-picker
              show-toolbar
              :columns="industryOptions"
              @confirm="onIndustryConfirm"
              @cancel="showIndustryPicker = false"
            />
          </van-popup>

          <van-field
            v-model="form.city"
            name="city"
            label="所属城市"
            placeholder="请输入所属城市"
            readonly
            clickable
            @click="showCityPicker = true"
          />
          <van-popup v-model="showCityPicker" round position="bottom">
            <van-cascader
              v-model="form.cityCode"
              title="选择城市"
              :options="cityOptions"
              @close="showCityPicker = false"
              @finish="onCityFinish"
            />
          </van-popup>

          <van-field
            v-model="form.revenue"
            name="revenue"
            type="digit"
            label="营业额"
            placeholder="请输入营业额">
            <template #extra>万元</template>
          </van-field>
          <van-field
            v-model="form.grossMargin"
            name="grossMargin"
            type="number"
            label="毛利率"
            placeholder="请输入毛利率">
            <template #extra>%</template>
          </van-field>
        </van-cell-group>

        <!-- 产业链（选配） -->
        <div class="section-title">产业链</div>
        <van-cell-group inset>
          <van-field name="chain" label="">
            <template #input>
              <van-checkbox-group v-model="form.chain" direction="horizontal">
                <van-checkbox name="终端商" shape="square">终端商</van-checkbox>
                <van-checkbox name="品牌商" shape="square">品牌商</van-checkbox>
                <van-checkbox name="制造商" shape="square">制造商</van-checkbox>
              </van-checkbox-group>
            </template>
          </van-field>
        </van-cell-group>

        <!-- 组织架构 -->
        <div class="section-title">组织架构</div>
        <van-cell-group inset>
          <van-field
            v-model="form.orgList"
            name="orgList"
            label=""
            placeholder="请描述企业组织架构，如各部门设置及人员配置"
            type="textarea"
            rows="4"
          />
        </van-cell-group>

        <!-- 年度目标 -->
        <div class="section-title">年度目标</div>
        <van-cell-group inset>
          <van-field
            v-model="form.targetYear1"
            name="targetYear1"
            type="digit"
            label="一年目标"
            placeholder="请输入一年目标">
            <template #extra>双</template>
          </van-field>
          <van-field
            v-model="form.targetYear2"
            name="targetYear2"
            type="digit"
            label="两年目标"
            placeholder="请输入两年目标">
            <template #extra>双</template>
          </van-field>
          <van-field
            v-model="form.targetYear3"
            name="targetYear3"
            type="digit"
            label="三年目标"
            placeholder="请输入三年目标">
            <template #extra>双</template>
          </van-field>
          <van-field
            v-model="form.targetYear4"
            name="targetYear4"
            type="digit"
            label="四年目标"
            placeholder="请输入四年目标">
            <template #extra>双</template>
          </van-field>
          <van-field
            v-model="form.targetYear5"
            name="targetYear5"
            label="五年目标"
            placeholder="请输入五年目标"
            type="textarea"
            rows="2"
          />
        </van-cell-group>

        <!-- 企业难题 -->
        <div class="section-title">企业难题</div>
        <van-cell-group inset>
          <van-field
            v-model="form.problems"
            name="problems"
            label=""
            placeholder="请描述目前企业遇到的难题"
            type="textarea"
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </van-cell-group>

        <!-- AI 模型选择 -->
        <div class="section-title">AI 模型选择</div>
        <van-cell-group inset>
          <van-field
            v-model="modelName"
            name="model"
            label="选择模型"
            placeholder="请选择 AI 模型"
            readonly
            clickable
            @click="showModelPicker = true"
          />
          <van-popup v-model="showModelPicker" round position="bottom">
            <van-picker
              show-toolbar
              :columns="modelColumns"
              @confirm="onModelConfirm"
              @cancel="showModelPicker = false"
            />
          </van-popup>
        </van-cell-group>

        <div class="submit-area">
          <van-button round block type="primary" native-type="submit">
            使用 {{ modelName }} 生成报告
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import {
  NavBar,
  Form,
  Field,
  CellGroup,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Button,
  Picker,
  Popup,
  Cascader,
  Toast,
  Loading
} from 'vant'
import { generateReport, MODEL_CONFIGS } from '@/api/ai'

export default {
  name: 'BusinessDiagnosis',
  components: {
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [Button.name]: Button,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    [Cascader.name]: Cascader,
    [Loading.name]: Loading
  },
  data() {
    return {
      form: {
        name: '',
        gender: '男',
        company: '',
        position: '',
        mobile: '',
        wechat: '',
        qq: '',
        industry: '',
        city: '',
        cityCode: '',
        revenue: '',
        grossMargin: '',
        chain: [],
        orgList: '厂长\n设计部\n车间主任\n财务\n包装组',
        targetYear1: '',
        targetYear2: '',
        targetYear3: '',
        targetYear4: '',
        targetYear5: '',
        problems: ''
      },
      showIndustryPicker: false,
      showCityPicker: false,
      showModelPicker: false,
      selectedModel: 'deepseek',
      industryOptions: [
        '制造鞋子',
        '服装制造',
        '电子制造',
        '食品加工',
        '机械制造',
        '其他'
      ],
      cityOptions: [
        {
          text: '辽宁省',
          value: '210000',
          children: [
            { text: '沈阳市', value: '210100' },
            { text: '大连市', value: '210200' },
            { text: '鞍山市', value: '210300' },
            { text: '抚顺市', value: '210400' }
          ]
        },
        {
          text: '广东省',
          value: '440000',
          children: [
            { text: '广州市', value: '440100' },
            { text: '深圳市', value: '440300' },
            { text: '东莞市', value: '441900' }
          ]
        },
        {
          text: '浙江省',
          value: '330000',
          children: [
            { text: '杭州市', value: '330100' },
            { text: '宁波市', value: '330200' },
            { text: '温州市', value: '330300' }
          ]
        }
      ]
    }
  },
  computed: {
    modelName() {
      const config = MODEL_CONFIGS.find(m => m.key === this.selectedModel)
      return config ? config.name : 'DeepSeek'
    },
    modelColumns() {
      return MODEL_CONFIGS.map(m => m.name)
    }
  },
  methods: {
    onIndustryConfirm(value) {
      this.form.industry = value
      this.showIndustryPicker = false
    },
    onCityFinish({ selectedOptions }) {
      this.form.city = selectedOptions.map(option => option.text).join('/')
      this.showCityPicker = false
    },
    onModelConfirm(value) {
      const config = MODEL_CONFIGS.find(m => m.name === value)
      if (config) {
        this.selectedModel = config.key
      }
      this.showModelPicker = false
    },
    async onSubmit() {
      console.log('提交数据:', this.form)

      const toast = Toast.loading({
        message: `${this.modelName} 正在生成分析报告...`,
        forbidClick: true,
        duration: 0
      })

      try {
        const res = await generateReport(this.form, this.selectedModel)
        const reportContent = res.choices?.[0]?.message?.content || '生成报告失败，请重试'

        toast.clear()

        this.$store.commit('SET_REPORT_DATA', {
          content: reportContent,
          modelName: this.modelName,
          company: this.form.company,
          time: new Date().toLocaleString('zh-CN')
        })

        this.$router.push('/report')
      } catch (error) {
        toast.clear()
        console.error('生成报告失败:', error)
        Toast.fail('生成报告失败，请重试')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.diagnosis-page {
  .content {
    padding: 12px;
    padding-bottom: 30px;
  }

  .section-title {
    margin: 16px 12px 8px;
    font-size: 14px;
    font-weight: bold;
    color: #323233;
    position: relative;
    padding-left: 8px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      background: #1989fa;
      border-radius: 2px;
    }
  }

  .submit-area {
    margin-top: 24px;
    padding: 0 12px;
  }
}
</style>
