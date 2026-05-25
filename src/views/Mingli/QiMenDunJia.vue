<template>
  <div class="qimen-page">
    <van-nav-bar title="奇门遁甲" fixed placeholder left-arrow @click-left="$router.back()" />

    <div class="content">
      <!-- 日期和时辰选择 -->
      <van-cell-group inset>
        <van-field
          v-model="dateText"
          label="日期"
          placeholder="请选择日期"
          readonly
          clickable
          @click="showDatePicker = true"
        />
        <van-field
          v-model="timeText"
          label="时辰"
          placeholder="请选择时辰"
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
          title="选择日期"
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
          title="选择时辰"
          :columns="timeColumns"
          :default-index="defaultTimeIndex"
          @confirm="onTimeConfirm"
          @cancel="showTimePicker = false"
        />
      </van-popup>

      <!-- 阴阳和局数选择 -->
      <van-cell-group inset class="setting-group">
        <van-field label="阴阳局">
          <template #input>
            <van-radio-group v-model="yyPan" direction="horizontal" @change="onYyChange">
              <van-radio name="y1">阳</van-radio>
              <van-radio name="y2">阴</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="Ju"
          label="局数"
          placeholder="请选择局数"
          readonly
          clickable
          @click="showJuPicker = true"
        />
      </van-cell-group>

      <van-popup v-model="showJuPicker" round position="bottom">
        <van-picker
          show-toolbar
          title="选择局数"
          :columns="juColumns"
          @confirm="onJuConfirm"
          @cancel="showJuPicker = false"
        />
      </van-popup>

      <!-- 排盘结果 -->
      <div v-if="YMD" class="result-card">
        <div class="result-title">排盘信息</div>
        <div class="result-row">
          <span class="label">阳历：</span>
          <span class="value">{{ value2 }}</span>
        </div>
        <div class="result-row">
          <span class="label">阴历：</span>
          <span class="value">{{ nlYMD }}</span>
        </div>
        <div class="result-row">
          <span class="label">四柱：</span>
          <span class="value">{{ YMD }} {{ TgTime }}{{ DzTime }}</span>
        </div>
        <div class="result-row">
          <span class="label">阴阳局：</span>
          <span class="value">{{ YYxianshi }}{{ Juxianshi }}</span>
        </div>
        <div class="result-row">
          <span class="label">旬首：</span>
          <span class="value">{{ XunShou0 }} {{ XunShou }}</span>
        </div>
        <div class="result-row">
          <span class="label">值符：</span>
          <span class="value">天{{ ZFxing }}星值符</span>
        </div>
        <div class="result-row">
          <span class="label">值使：</span>
          <span class="value">{{ ZFmen }}门值使</span>
        </div>
      </div>

      <!-- 九宫格 -->
      <div v-if="YMD" class="jiugong-grid">
        <div class="grid-title">九宫排盘</div>
        <div class="grid-box">
          <div
            v-for="(item, index) in gridData"
            :key="index"
            class="grid-cell"
            :class="{ center: index === 4 }"
          >
            <div class="cell-number">{{ item.number }}</div>
            <div class="cell-gong">{{ item.gong }}</div>
            <div class="cell-tg">{{ item.tg }}</div>
            <div class="cell-xing">{{ item.xing }}</div>
            <div class="cell-men">{{ item.men }}</div>
            <div class="cell-shen">{{ item.shen }}</div>
          </div>
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
          调用 AI 助手进行奇门分析
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
import {
  NavBar,
  CellGroup,
  Field,
  Popup,
  DatetimePicker,
  Picker,
  Button,
  Radio,
  RadioGroup
} from 'vant'
import { calendarChange } from '@/utils/ganzhi.js'
import { params } from '@/utils/draw3.js'
import { chatCompletion } from '@/api/ai'

export default {
  name: 'QimenPage',
  components: {
    [NavBar.name]: NavBar,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [DatetimePicker.name]: DatetimePicker,
    [Picker.name]: Picker,
    [Button.name]: Button,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup
  },
  data() {
    const now = new Date()
    const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      showDatePicker: false,
      showTimePicker: false,
      showJuPicker: false,
      selectedDate: defaultDate,
      dateText: '',
      selectedTimeIndex: 7,
      defaultTimeIndex: 6,
      timeText: '',
      minDate: new Date(1900, 0, 1),
      maxDate: new Date(2100, 11, 31),
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
      juColumns: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      // 基础数据
      Tg: [],
      Dz: [],
      Xing: [],
      Men: [],
      Shen: [],
      Bg: [],
      xtBg: [],
      Shu: ['1', '8', '3', '4', '9', '2', '7', '6'],
      // 排盘结果
      value2: '',
      YMD: '',
      nlYMD: '',
      DzTime: '',
      TgTime: '',
      yyPan: 'y1',
      Ju: '1',
      XunShou: '',
      XunShou0: '',
      ZFxing: '',
      ZFmen: '',
      TPtg: '',
      YYxianshi: '阳',
      Juxianshi: '1局',
      // AI
      deepseek_loading: false,
      deepseek_content: null,
      sizhu: ''
    }
  },
  computed: {
    gridData() {
      if (!this.YMD) return []
      // 九宫格数据：坎(1)、坤(2)、震(3)、巽(4)、中(5)、乾(6)、兑(7)、艮(8)、离(9)
      // 按三行三列排列：
      // 巽4 离9 坤2
      // 震3 中5 兑7
      // 艮8 坎1 乾6
      const order = [
        { number: 4, gong: '巽', xing: '天辅', men: '杜', shen: '六' },
        { number: 9, gong: '离', xing: '天英', men: '景', shen: '蛇' },
        { number: 2, gong: '坤', xing: '天芮', men: '死', shen: '阴' },
        { number: 3, gong: '震', xing: '天冲', men: '伤', shen: '符' },
        { number: 5, gong: '中', xing: '天禽', men: '', shen: '' },
        { number: 7, gong: '兑', xing: '天柱', men: '惊', shen: '白' },
        { number: 8, gong: '艮', xing: '天任', men: '生', shen: '玄' },
        { number: 1, gong: '坎', xing: '天蓬', men: '休', shen: '地' },
        { number: 6, gong: '乾', xing: '天心', men: '开', shen: '天' }
      ]

      // 根据阴阳局和局数计算天盘
      const tgju = this.setQju(this.yyPan, parseInt(this.Ju))
      const result = order.map((item) => {
        const tg = tgju[item.number - 1] || ''
        return {
          ...item,
          tg
        }
      })
      return result
    }
  },
  mounted() {
    this.Tg = params.globalTg
    this.Dz = params.globalDz
    this.Xing = params.globalXing
    this.Men = params.globalMen
    this.Shen = params.globalShen
    this.Bg = params.globalBg
    this.xtBg = params.globalxtBg

    this.onDateConfirm(this.selectedDate)
    this.onTimeConfirm({ text: this.timeColumns[6].text, value: 7 }, 6)
  },
  methods: {
    onDateConfirm(value) {
      this.selectedDate = value
      const year = value.getFullYear()
      const month = value.getMonth() + 1
      const day = value.getDate()
      this.dateText = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      this.value2 = this.dateText
      this.showDatePicker = false
      this.calcQimen()
    },
    onTimeConfirm(value) {
      this.selectedTimeIndex = value.value
      this.timeText = value.text
      this.showTimePicker = false
      this.calcQimen()
    },
    onJuConfirm(value) {
      this.Ju = value
      this.Juxianshi = value + '局'
      this.showJuPicker = false
      this.drawJu()
    },
    onYyChange(name) {
      if (name === 'y1') {
        this.YYxianshi = '阳'
      } else {
        this.YYxianshi = '阴'
      }
      this.drawJu()
    },
    calcQimen() {
      if (!this.selectedDate || !this.selectedTimeIndex) return
      this.seJushu()
      this.drawJu()
    },
    seJushu() {
      const date = this.selectedDate
      const iTime = this.selectedTimeIndex

      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()

      const data = calendarChange.solar2lunar(year, month + 1, day)
      const sDzhi = data.gzYear
      const juN = sDzhi.substring(1, 2)
      const Nnumber = params.globalDz.indexOf(juN) + 1

      // 夏至冬至阴阳局判断
      const DZdayXia = calendarChange.getTerm(year, 9)
      const lixia = year + '-5-' + DZdayXia
      const DZdayDong = calendarChange.getTerm(year, 24)
      const dongzhi = year + '-12-' + DZdayDong

      const oDate1 = new Date(lixia)
      const oDate2 = new Date(dongzhi)
      if (date.getTime() > oDate1.getTime() && date.getTime() <= oDate2.getTime()) {
        this.yyPan = 'y2'
        this.YYxianshi = '阴'
      } else {
        this.yyPan = 'y1'
        this.YYxianshi = '阳'
      }

      // 局数
      const qyushu = parseInt(Nnumber) + parseInt(data.lMonth) + parseInt(data.lDay) + parseInt(iTime)
      let Jushu = qyushu % 9
      if (Jushu === 0) {
        Jushu = 9
      }
      this.Ju = String(Jushu)
      this.Juxianshi = Jushu + '局'
    },
    drawJu() {
      const date = this.selectedDate
      const iTime = this.selectedTimeIndex

      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()

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
      const sTg = this.Tg[numuberTg]

      // 取旬首
      this.XunShou = this.setXunShou(sTg, this.DzTime)

      // 起局
      const yyp = this.yyPan
      const Tgju = this.setQju(yyp, parseInt(this.Ju))

      // 取值符
      let ZFshu = Tgju.indexOf(this.XunShou)
      if (ZFshu === 4) {
        ZFshu = 1
      }
      const ZFshuIndex = this.Shu.indexOf((ZFshu + 1).toString())
      this.ZFxing = this.Xing[ZFshuIndex]
      this.ZFmen = this.Men[ZFshuIndex]

      // 天盘排序
      this.TPtg = this.setTianPan(Tgju, this.XunShou, sTg, yyp)
    },
    setXunShou(tiangan, dizhi) {
      let sXs = ''
      const Tnumber = this.Tg.indexOf(tiangan)
      const Dnumber = this.Dz.indexOf(dizhi)
      let jiaX
      if (Tnumber < Dnumber) {
        jiaX = this.Dz[Dnumber - Tnumber]
      } else if (Tnumber === Dnumber) {
        jiaX = this.Dz[0]
      } else {
        jiaX = this.Dz[Dnumber + 12 - Tnumber]
      }
      switch (jiaX) {
        case '子':
          sXs = '戊'
          this.XunShou0 = '甲子'
          break
        case '戌':
          sXs = '己'
          this.XunShou0 = '甲戌'
          break
        case '申':
          sXs = '庚'
          this.XunShou0 = '甲申'
          break
        case '午':
          sXs = '辛'
          this.XunShou0 = '甲午'
          break
        case '辰':
          sXs = '壬'
          this.XunShou0 = '甲辰'
          break
        case '寅':
          sXs = '癸'
          this.XunShou0 = '甲寅'
          break
      }
      return sXs
    },
    setQju(yy, iJu) {
      let Yinshu
      if (yy === 'y2') {
        Yinshu = params.globalYinShu[iJu - 1]
      } else {
        Yinshu = params.globalYangShu[iJu - 1]
      }
      const Ppan = params.globalPpan
      const TgSX = []
      for (let i = 1; i < 10; i++) {
        TgSX[Yinshu.substring(i - 1, i) - 1] = Ppan[i - 1]
      }
      return TgSX
    },
    setTianPan(Tgju) {
      // 天盘排序逻辑（保留原代码结构）
      // let pan8 = []
      // if (yy === 'y1') {
      //   pan8 = [1, 8, 3, 4, 9, 2, 7, 6, 1]
      // } else {
      //   pan8 = [1, 6, 7, 2, 9, 4, 3, 8, 1]
      // }
      // const shu1 = Tgju.indexOf(Xunshou)
      // const shu2 = Tgju.indexOf(Shigan)
      // 原代码 TpSX 未完整实现，保留返回值
      return Tgju
    },
    async fetchData() {
      this.deepseek_loading = true
      try {
        const now = new Date()
        const dhours = now.getHours()
        const dminutes = now.getMinutes()
        const dseconds = now.getSeconds()
        const dTime = dhours + '时' + dminutes + '分' + dseconds + '秒'
        const dsizhu = this.YMD + ' ' + this.TgTime + this.DzTime
        const dju1 = this.YYxianshi + this.Juxianshi

        this.sizhu =
          '你的角色是一位国学大师，擅长道家阴盘奇门遁甲起局。根据王凤麟大师的著作（不显示姓名和书名），这个时间，' +
          dTime +
          '|阳历：' +
          this.value2 +
          '｜阴历：' +
          this.nlYMD +
          '｜四柱：' +
          dsizhu +
          '|' +
          dju1 +
          '，起局方式道家奇门遁甲阴盘排盘。不需要解释四柱内容。先用字符进行道家阴盘遁甲九宫起局，排盘注意八门、八星、八神、隐干、马星、四害的顺序等详细信息。九宫排盘的格子位置需要精确，对九宫的每一个宫的细节依次进行分析，然后可以从事业工作、家人、亲子、健康、财运等方向进行分析。'

        const res = await chatCompletion(
          this.sizhu,
          '你是一位资深的道家阴盘奇门遁甲大师，擅长根据时间起局并进行详细分析。',
          'deepseek',
          1500
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
.qimen-page {
  .content {
    padding: 12px;
    padding-bottom: 30px;
  }

  .setting-group {
    margin-top: 12px;
  }

  .result-card {
    margin: 16px 12px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;

    .result-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
    }

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

  .jiugong-grid {
    margin: 16px 12px;

    .grid-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 12px;
    }

    .grid-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      background: #ebedf0;
      padding: 4px;
      border-radius: 8px;

      .grid-cell {
        background: #fff;
        border-radius: 4px;
        padding: 8px 4px;
        text-align: center;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &.center {
          background: #fff7e6;
        }

        .cell-number {
          font-size: 12px;
          color: #969799;
          margin-bottom: 2px;
        }

        .cell-gong {
          font-size: 14px;
          font-weight: 600;
          color: #323233;
          margin-bottom: 2px;
        }

        .cell-tg {
          font-size: 13px;
          color: #1989fa;
          margin-bottom: 2px;
        }

        .cell-xing,
        .cell-men,
        .cell-shen {
          font-size: 11px;
          color: #666;
          line-height: 1.3;
        }
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
