<template>
  <div class="bazi-page">
    <van-nav-bar title="八字" fixed placeholder left-arrow @click-left="$router.back()" />

    <div class="content">
      <!-- 日期和时辰选择 -->
      <van-cell-group inset>
        <van-field
          v-model="dateText"
          label="出生日期"
          placeholder="请选择出生日期"
          readonly
          clickable
          @click="showDatePicker = true"
        />
        <van-field
          v-model="timeText"
          label="出生时辰"
          placeholder="请选择出生时辰"
          readonly
          clickable
          @click="showTimePicker = true"
        />
      </van-cell-group>

      <!-- 日期弹窗 -->
      <van-popup v-model="showDatePicker" round position="bottom">
        <van-datetime-picker
          v-model="selectedDate"
          type="date"
          title="选择出生日期"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 时辰弹窗 -->
      <van-popup v-model="showTimePicker" round position="bottom">
        <van-picker
          show-toolbar
          title="选择出生时辰"
          :columns="timeColumns"
          :default-index="defaultTimeIndex"
          @confirm="onTimeConfirm"
          @cancel="showTimePicker = false"
        />
      </van-popup>

      <!-- 排盘结果 -->
      <div v-if="YMD" class="result-card">
        <div class="result-row">
          <span class="label">阳历：</span>
          <span class="value">{{ solarDate }}</span>
        </div>
        <div class="result-row">
          <span class="label">阴历：</span>
          <span class="value">{{ nlYMD }}</span>
        </div>
        <div class="result-row">
          <span class="label">四柱：</span>
          <span class="value">{{ YMD }} {{ TgTime }}{{ DzTime }}</span>
        </div>
      </div>

      <!-- AI 分析 -->
      <div v-if="YMD" class="ai-section">
        <van-button
          round
          block
          type="primary"
          :loading="deepseek_loading"
          @click="fetchData"
        >
          调用 AI 助手进行八字分析
        </van-button>

        <div v-if="deepseek_loading && !deepseek_content" class="loading-text">
          思考中...
        </div>

        <div v-if="deepseek_content" class="ai-result">
          <pre>{{ deepseek_content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar, CellGroup, Field, Popup, DatetimePicker, Picker, Button } from 'vant'
import { calendarChange } from '@/utils/ganzhi.js'
import { params } from '@/utils/draw3.js'
import { chatCompletion } from '@/api/ai'

export default {
  name: 'BaziPage',
  components: {
    [NavBar.name]: NavBar,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [DatetimePicker.name]: DatetimePicker,
    [Picker.name]: Picker,
    [Button.name]: Button
  },
  data() {
    const now = new Date()
    const defaultDate = new Date(now.getFullYear() - 25, 0, 1)
    return {
      showDatePicker: false,
      showTimePicker: false,
      selectedDate: defaultDate,
      dateText: '',
      selectedTimeIndex: 1,
      defaultTimeIndex: 0,
      timeText: '',
      minDate: new Date(1900, 0, 1),
      maxDate: now,
      timeColumns: [
        { text: '子时 (23:00-1:00)', value: 1 },
        { text: '丑时 (1:00-3:00)', value: 2 },
        { text: '寅时 (3:00-5:00)', value: 3 },
        { text: '卯时 (5:00-7:00)', value: 4 },
        { text: '辰时 (7:00-9:00)', value: 5 },
        { text: '巳时 (9:00-11:00)', value: 6 },
        { text: '午时 (11:00-13:00)', value: 7 },
        { text: '未时 (13:00-15:00)', value: 8 },
        { text: '申时 (15:00-17:00)', value: 9 },
        { text: '酉时 (17:00-19:00)', value: 10 },
        { text: '戌时 (19:00-21:00)', value: 11 },
        { text: '亥时 (21:00-23:00)', value: 12 }
      ],
      Tg: [],
      Dz: [],
      YMD: '',
      DzTime: '',
      TgTime: '',
      nlYMD: '',
      solarDate: '',
      dSizhu: '',
      deepseek_loading: false,
      deepseek_content: null
    }
  },
  mounted() {
    this.Tg = params.globalTg
    this.Dz = params.globalDz
    // 初始化默认显示
    this.onDateConfirm(this.selectedDate)
    this.onTimeConfirm({ text: this.timeColumns[0].text, value: 1 }, 0)
  },
  methods: {
    onDateConfirm(value) {
      this.selectedDate = value
      const year = value.getFullYear()
      const month = value.getMonth() + 1
      const day = value.getDate()
      this.dateText = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      this.solarDate = this.dateText
      this.showDatePicker = false
      this.calcBazi()
    },
    onTimeConfirm(value) {
      this.selectedTimeIndex = value.value
      this.timeText = value.text
      this.showTimePicker = false
      this.calcBazi()
    },
    calcBazi() {
      if (!this.selectedDate || !this.selectedTimeIndex) return

      const idate = this.selectedDate
      const iTime = this.selectedTimeIndex

      const year = idate.getFullYear()
      const month = idate.getMonth()
      const day = idate.getDate()

      const data = calendarChange.solar2lunar(year, month + 1, day)
      this.nlYMD = data.cYear + '年' + data.IMonthCn + data.IDayCn

      const yearGz = data.gzYear
      const monthGz = data.gzMonth
      const dayGz = data.gzDay

      this.YMD = yearGz + ' ' + monthGz + ' ' + dayGz

      // 地支时辰
      this.DzTime = this.Dz[iTime - 1]

      // 日天干
      const sday = dayGz.substring(0, 1)
      const rTg = this.Tg.indexOf(sday)

      // 时天干 = 日天干×2 + 时地支 - 2
      let numuberTg = Number(rTg + 1) * 2
      numuberTg = numuberTg + Number(iTime) - 2
      numuberTg = numuberTg % 10
      if (numuberTg === 0) {
        numuberTg = 9
      } else {
        numuberTg = numuberTg - 1
      }

      this.TgTime = this.Tg[numuberTg]
      this.dSizhu =
        '日期：' +
        this.dateText +
        '｜' +
        data.gzYear +
        '年' +
        data.gzMonth +
        '月' +
        data.gzDay +
        '日' +
        this.TgTime +
        this.DzTime +
        '时'
    },
    async fetchData() {
      this.deepseek_loading = true
      try {
        const prompt =
          '你是一个国学大师，结合李涵辰大师的学术著作（不输出姓名），进行八字分析与命理策划；请对这个时间' +
          this.dateText +
          '的四柱进行排盘分析' +
          this.dSizhu +
          '并且标出天干地支上下排列；标注十神、定命格、忌神用神 大运、纳音、流年分别领起一行；藏干十神领起一行列出；分男女分别列出大运流年;然后可以从事业工作、家人、亲子、健康、财运等方向进行分类分析。；排盘表格的搁置对齐一些；'

        const res = await chatCompletion(
          prompt,
          '你是一位资深的八字命理大师，擅长根据四柱八字进行命理分析和策划。',
          'deepseek',
          2000
        )
        if (res && res.choices && res.choices[0]) {
          this.deepseek_content = res.choices[0].message.content
        }
      } catch (error) {
        console.error('API 调用失败:', error)
      } finally {
        this.deepseek_loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.bazi-page {
  .content {
    padding: 12px;
    padding-bottom: 30px;
  }

  .result-card {
    margin: 16px 12px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;

    .result-row {
      margin-bottom: 10px;
      font-size: 15px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
      }

      .value {
        color: #323233;
        font-weight: 500;
      }
    }
  }

  .ai-section {
    margin: 16px 12px;

    .loading-text {
      margin-top: 16px;
      text-align: center;
      color: #969799;
      font-size: 14px;
    }

    .ai-result {
      margin-top: 16px;

      pre {
        margin: 0;
        padding: 1rem;
        background: #f8f9fa;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-x: auto;
        border-radius: 8px;
        line-height: 1.6;
        font-size: 14px;
        color: #323233;
      }
    }
  }
}
</style>
