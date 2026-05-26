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

      <!-- 阴阳和局数显示（自动计算，不可手动修改） -->
      <van-cell-group inset class="setting-group">
        <van-field label="阴阳局" :value="YYxianshi + Juxianshi" readonly />
      </van-cell-group>

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
            :class="{ center: item.number === 5 }"
          >
            <div class="cell-number">{{ item.number }}</div>
            <div class="cell-gong">{{ item.gong }}</div>
            <div class="cell-dipan">{{ item.dipan }}</div>
            <div class="cell-tianpan">{{ item.tianpan }}</div>
            <div class="cell-xing">{{ item.xing }}</div>
            <div class="cell-men">{{ item.men }}</div>
            <div class="cell-shen">{{ item.shen }}</div>
          </div>
        </div>
        <div class="legend">
          <span>地盘奇仪</span> <span>天盘奇仪</span> <span>九星</span> <span>八门</span> <span>八神</span>
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
  Button
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
    [Button.name]: Button
  },
  data() {
    const now = new Date()
    const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      showDatePicker: false,
      showTimePicker: false,
      selectedDate: defaultDate,
      dateText: '',
      selectedTimeIndex: 7,   // 默认午时
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
      // 基础数据（从 params 导入）
      Tg: [],      // 十天干 ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
      Dz: [],      // 十二地支
      Xing: [],    // 九星 ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英']
      Men: [],     // 八门 ['休','生','伤','杜','景','死','惊','开']
      Shen: [],    // 八神 ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天']
      // 排盘结果
      value2: '',
      YMD: '',          // 四柱（年月日）
      nlYMD: '',
      DzTime: '',       // 时支
      TgTime: '',       // 时干
      yyPan: 'y1',      // 'y1'阳遁 'y2'阴遁
      Ju: 1,            // 局数 1-9
      XunShou: '',      // 旬首（六仪）
      XunShou0: '',     // 旬首（甲子等）
      ZFxing: '',       // 值符星
      ZFmen: '',        // 值使门
      YYxianshi: '阳',
      Juxianshi: '1局',
      // 排盘核心数据
      dipan: [],        // 地盘奇仪（9宫顺序）
      tianpan: [],      // 天盘奇仪（9宫顺序）
      xingPan: [],      // 九星（9宫顺序）
      menPan: [],       // 八门（9宫顺序）
      shenPan: [],      // 八神（9宫顺序）
      // AI
      deepseek_loading: false,
      deepseek_content: null,
      sizhu: ''
    }
  },
  computed: {
    // 按九宫格展示顺序：巽4 离9 坤2 | 震3 中5 兑7 | 艮8 坎1 乾6
    gridData() {
      if (!this.YMD) return []
      const order = [
        { number: 4, gong: '巽' },
        { number: 9, gong: '离' },
        { number: 2, gong: '坤' },
        { number: 3, gong: '震' },
        { number: 5, gong: '中' },
        { number: 7, gong: '兑' },
        { number: 8, gong: '艮' },
        { number: 1, gong: '坎' },
        { number: 6, gong: '乾' }
      ]
      return order.map(item => {
        const idx = item.number - 1
        return {
          ...item,
          dipan: this.dipan[idx] || '',
          tianpan: this.tianpan[idx] || '',
          xing: this.xingPan[idx] || '',
          men: this.menPan[idx] || '',
          shen: this.shenPan[idx] || ''
        }
      })
    }
  },
  mounted() {
    // 初始化基础数据
    this.Tg = params.globalTg
    this.Dz = params.globalDz
    this.Xing = params.globalXing
    this.Men = params.globalMen
    this.Shen = params.globalShen

    // 默认排今日午时
    this.onDateConfirm(this.selectedDate)
    this.onTimeConfirm({ text: this.timeColumns[6].text, value: 7 }, 6)
  },
  methods: {
    // 日期确认
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
    // 时辰确认
    onTimeConfirm(value) {
      this.selectedTimeIndex = value.value
      this.timeText = value.text
      this.showTimePicker = false
      this.calcQimen()
    },
    // 完整排盘入口
    calcQimen() {
      if (!this.selectedDate || !this.selectedTimeIndex) return
      // 1. 计算四柱、阴阳遁、局数
      this.computeSizhuAndJu()
      // 2. 排地盘奇仪
      this.setDipan()
      // 3. 计算旬首、值符、值使
      this.setXunShouAndZhiFuZhiShi()
      // 4. 排天盘奇仪
      this.setTianpan()
      // 5. 排九星
      this.setXing()
      // 6. 排八门
      this.setMen()
      // 7. 排八神
      this.setShen()
    },

    // ------------------- 1. 四柱、节气、局数（拆补法）-------------------
    computeSizhuAndJu() {
      const date = this.selectedDate
      const iTime = this.selectedTimeIndex
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      // 农历转换（得到年月日干支）
      const lunar = calendarChange.solar2lunar(year, month, day)
      this.nlYMD = lunar.lYear + '年' + lunar.IMonthCn + lunar.IDayCn

      const yearGz = lunar.gzYear      // 年柱
      const monthGz = lunar.gzMonth    // 月柱
      const dayGz = lunar.gzDay        // 日柱
      this.YMD = `${yearGz} ${monthGz} ${dayGz}`

      // 时柱
      this.DzTime = this.Dz[iTime - 1]               // 地支
      const rTg = this.Tg.indexOf(dayGz.charAt(0))   // 日干索引（甲0～癸9）
      let tIndex = (rTg + 1) * 2 + iTime - 2         // 时干序号（1-10）
      tIndex = ((tIndex - 1) % 10)                   // 0-9
      this.TgTime = this.Tg[tIndex]
      const shiGan = this.Tg[tIndex]

      // 获取当前节气，确定阴阳遁和局数（拆补法）
      // 先找到当前时间对应的节气（根据日柱判断符头）
      const solarTerm = this.getCurrentSolarTerm(year, month, day)
      // 根据节气确定阴阳遁：冬至~夏至为阳遁，夏至~冬至为阴遁
      const isYang = this.isYangDun(solarTerm)
      this.yyPan = isYang ? 'y1' : 'y2'
      this.YYxianshi = isYang ? '阳' : '阴'

      // 计算局数（拆补法：根据符头所在的节气三元）
      const ju = this.getJuFromSolarTerm(solarTerm, year, month, day, shiGan)
      this.Ju = ju
      this.Juxianshi = ju + '局'
    },

    // 获取当前节气（返回节气名称如“冬至”）
    getCurrentSolarTerm(year, month, day) {
      // 简化：使用已有的getTerm，返回该年所有节气日期，然后比较
      const solarTerms = [
        '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
        '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
        '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
      ]
      const date = new Date(year, month-1, day)
      let currentTerm = '冬至' // 默认
      for (let i = 0; i < solarTerms.length; i++) {
        const termDay = calendarChange.getTerm(year, i+1)  // i+1 为节气序号
        if (termDay) {
          const termDate = new Date(year, month-1, termDay)
          if (date >= termDate) {
            currentTerm = solarTerms[i]
          } else {
            break
          }
        }
      }
      return currentTerm
    },

    isYangDun(solarTerm) {
      const yangTerms = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种']
      return yangTerms.includes(solarTerm)
    },

    // 拆补法计算局数（基于符头和节气）
    getJuFromSolarTerm(solarTerm, year, month, day) {
      // 获取日柱干支
      const lunar = calendarChange.solar2lunar(year, month, day)
      const dayGz = lunar.gzDay
      const dayGan = dayGz[0]
      // const dayZhi = dayGz[1]
      // 符头：甲己为上元，乙庚为中元，丙辛为下元
      let yuan
      if (dayGan === '甲' || dayGan === '己') yuan = '上元'
      else if (dayGan === '乙' || dayGan === '庚') yuan = '中元'
      else yuan = '下元'

      // 节气对应的局数表（阳遁顺排，阴遁逆排）
      const termJu = {
        // 阳遁
        '冬至': { '上元': 1, '中元': 7, '下元': 4 },
        '小寒': { '上元': 2, '中元': 8, '下元': 5 },
        '大寒': { '上元': 3, '中元': 9, '下元': 6 },
        '立春': { '上元': 8, '中元': 5, '下元': 2 },
        '雨水': { '上元': 9, '中元': 6, '下元': 3 },
        '惊蛰': { '上元': 1, '中元': 7, '下元': 4 },
        '春分': { '上元': 3, '中元': 9, '下元': 6 },
        '清明': { '上元': 4, '中元': 1, '下元': 7 },
        '谷雨': { '上元': 5, '中元': 2, '下元': 8 },
        '立夏': { '上元': 4, '中元': 1, '下元': 7 },
        '小满': { '上元': 5, '中元': 2, '下元': 8 },
        '芒种': { '上元': 6, '中元': 3, '下元': 9 },
        // 阴遁
        '夏至': { '上元': 9, '中元': 3, '下元': 6 },
        '小暑': { '上元': 8, '中元': 2, '下元': 5 },
        '大暑': { '上元': 7, '中元': 1, '下元': 4 },
        '立秋': { '上元': 2, '中元': 5, '下元': 8 },
        '处暑': { '上元': 1, '中元': 4, '下元': 7 },
        '白露': { '上元': 9, '中元': 3, '下元': 6 },
        '秋分': { '上元': 7, '中元': 1, '下元': 4 },
        '寒露': { '上元': 6, '中元': 9, '下元': 3 },
        '霜降': { '上元': 5, '中元': 8, '下元': 2 },
        '立冬': { '上元': 6, '中元': 9, '下元': 3 },
        '小雪': { '上元': 5, '中元': 8, '下元': 2 },
        '大雪': { '上元': 4, '中元': 7, '下元': 1 }
      }
      const ju = termJu[solarTerm][yuan]
      return ju
    },

    // ------------------- 2. 地盘奇仪 -------------------
    setDipan() {
      // 地盘奇仪顺序：1坎 2坤 3震 4巽 5中 6乾 7兑 8艮 9离
      // 根据局数，阳遁顺排戊己庚辛壬癸丁丙乙，阴遁逆排
      const yiShu = ['戊','己','庚','辛','壬','癸','丁','丙','乙']
      let dipanOrder = []
      if (this.yyPan === 'y1') { // 阳遁
        // 从局数对应的宫开始顺排
        const start = this.Ju - 1
        for (let i = 0; i < 9; i++) {
          dipanOrder[(start + i) % 9] = yiShu[i]
        }
      } else { // 阴遁
        const start = this.Ju - 1
        for (let i = 0; i < 9; i++) {
          dipanOrder[(start - i + 9) % 9] = yiShu[i]
        }
      }
      this.dipan = dipanOrder  // 索引0对应坎1宫，依此类推
    },

    // ------------------- 3. 旬首、值符、值使 -------------------
    setXunShouAndZhiFuZhiShi() {
      const shiGan = this.TgTime
      const shiZhi = this.DzTime
      const tgIndex = this.Tg.indexOf(shiGan)
      const dzIndex = this.Dz.indexOf(shiZhi)
      let diff = tgIndex - dzIndex
      if (diff < 0) diff += 12
      // 旬首地支
      const xunShouZhi = this.Dz[(dzIndex - diff + 12) % 12]
      // 旬首天干根据六仪规律
      const xunShouMap = {
        '子': '戊', '戌': '己', '申': '庚', '午': '辛', '辰': '壬', '寅': '癸'
      }
      this.XunShou = xunShouMap[xunShouZhi]
      this.XunShou0 = '甲' + xunShouZhi

      // 旬首所在宫位（地盘）
      const xunShouIndex = this.dipan.indexOf(this.XunShou)  // 0-8
      // 值符星 = 旬首所在宫对应的原始九星
      const starOrder = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英']
      this.ZFxing = starOrder[xunShouIndex]
      // 值使门 = 旬首所在宫对应的原始八门（需要映射：1休2生3伤4杜5景6死7惊8开）
      const menOrder = ['休','生','伤','杜','景','死','惊','开']
      // 八门对应宫位：1休-坎，2生-艮，3伤-震，4杜-巽，5景-离，6死-坤，7惊-兑，8开-乾
      const menPalace = [1,8,3,4,9,2,7,6]  // 索引0休在坎1
      const palaceNum = xunShouIndex + 1   // 1-9
      let menIdx = menPalace.indexOf(palaceNum)
      if (menIdx === -1) menIdx = 4 // 中宫寄坤，景门？实际中宫不用，但取景门
      this.ZFmen = menOrder[menIdx]
    },

    // ------------------- 4. 天盘奇仪 -------------------
    setTianpan() {
      // 天盘奇仪：将旬首所在宫的地盘奇仪移到时干所在宫，然后顺排
      const xunShou = this.XunShou
      const shiGan = this.TgTime
      const xunIndex = this.dipan.indexOf(xunShou)      // 旬首宫位
      const shiGanIndex = this.dipan.indexOf(shiGan)    // 时干宫位（实际上时干在地盘某宫）
      // 若找不到时干（一般能找到），则用值符星宫位代替
      let tianpanBase = [...this.dipan]
      if (xunIndex !== -1 && shiGanIndex !== -1) {
        // 将旬首所在宫的地盘奇仪移动到时干宫
        // const moveValue = tianpanBase[xunIndex]
        // 偏移量
        const offset = (shiGanIndex - xunIndex + 9) % 9
        const newPan = new Array(9)
        for (let i = 0; i < 9; i++) {
          newPan[(i + offset) % 9] = tianpanBase[i]
        }
        this.tianpan = newPan
      } else {
        this.tianpan = [...this.dipan]
      }
    },

    // ------------------- 5. 九星排布 -------------------
    setXing() {
      // 九星原始顺序（对应宫位1-9）
      const starOrder = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英']
      // 值符星原始宫位
      const zhiFuStar = this.ZFxing
      const zhiFuIndex = starOrder.indexOf(zhiFuStar)   // 0-8
      // 值符星现在落到时干所在宫（天盘时干宫）
      const shiGan = this.TgTime
      const shiGanPalace = this.dipan.indexOf(shiGan)   // 时干在地盘宫位
      if (shiGanPalace === -1) return
      // 偏移量
      const offset = (shiGanPalace - zhiFuIndex + 9) % 9
      const newXing = new Array(9)
      for (let i = 0; i < 9; i++) {
        newXing[(i + offset) % 9] = starOrder[i]
      }
      // 中宫天禽星寄坤二宫（宫位索引1，因为坤2宫对应索引1）
      // 通常天禽星随天芮星
      const tianRuiIndex = newXing.indexOf('天芮')
      if (tianRuiIndex !== -1 && newXing[1] === '天芮') {
        newXing[4] = '天禽'  // 中宫5宫索引4
      }
      this.xingPan = newXing
    },

    // ------------------- 6. 八门排布 -------------------
    setMen() {
      const menOrder = ['休','生','伤','杜','景','死','惊','开']
      const zhiShiMen = this.ZFmen
      const zhiShiIndex = menOrder.indexOf(zhiShiMen)
      // 值使门落宫：根据时辰旬首到当前时辰的流转步数
      const shiZhi = this.DzTime
      const xunShouZhi = this.XunShou0[1]  // 旬首地支
      const startIndex = this.Dz.indexOf(xunShouZhi)
      const endIndex = this.Dz.indexOf(shiZhi)
      let steps = endIndex - startIndex
      if (steps < 0) steps += 12
      // 值使门原始宫位（1休2生3伤4杜5景6死7惊8开）
      const menPalaceMap = [1,8,3,4,9,2,7,6]
      let startPalace = menPalaceMap[zhiShiIndex]
      // 阴遁逆数，阳遁顺数
      let finalPalace = startPalace
      if (this.yyPan === 'y1') { // 阳遁顺数
        finalPalace = (startPalace - 1 + steps) % 9 + 1
      } else {
        finalPalace = (startPalace - 1 - steps + 900) % 9 + 1
      }
      // 将八门按顺序排入九宫（从值使门落宫开始顺/逆排）
      const menPan = new Array(9).fill('')
      let currentMenIdx = zhiShiIndex
      let currentPalace = finalPalace
      for (let i = 0; i < 8; i++) {
        menPan[currentPalace - 1] = menOrder[currentMenIdx % 8]
        if (this.yyPan === 'y1') { // 阳遁顺转
          currentPalace = (currentPalace % 9) + 1
        } else { // 阴遁逆转
          currentPalace = (currentPalace - 2 + 9) % 9 + 1
        }
        currentMenIdx = (currentMenIdx + 1) % 8
      }
      this.menPan = menPan
    },

    // ------------------- 7. 八神排布 -------------------
    setShen() {
      const shenOrder = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天']
      // 八神值符落在值符星落宫（即天盘时干宫）
      const shiGan = this.TgTime
      const shiGanPalace = this.dipan.indexOf(shiGan)   // 时干地盘宫位索引
      if (shiGanPalace === -1) return
      const shenPan = new Array(9).fill('')
      let currentShenIdx = 0  // 值符开始
      let currentPalace = shiGanPalace + 1   // 1-9
      for (let i = 0; i < 8; i++) {
        shenPan[currentPalace - 1] = shenOrder[currentShenIdx]
        if (this.yyPan === 'y1') { // 阳遁顺转
          currentPalace = (currentPalace % 9) + 1
        } else {
          currentPalace = (currentPalace - 2 + 9) % 9 + 1
        }
        currentShenIdx = (currentShenIdx + 1) % 8
      }
      this.shenPan = shenPan
    },

    // ------------------- AI 分析 -------------------
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
          // this.$store.commit("SET_REPORT_DATA", {
          //   content: this.deepseek_content,
          //   modelName: "",
          //   company: "",
          //   time: new Date().toLocaleString("zh-CN"),
          // });

          // this.$router.push("/report-display");
        }
      } catch (error) {
        console.error('API 调用失败:', error)
      } finally {
        this.deepseek_loading = false
      }
    }
  },
  beforeDestroy() {
    this.$store.commit('SET_REPORT_DATA', null)
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
        padding: 6px 2px;
        text-align: center;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 11px;

        &.center {
          background: #fff7e6;
        }

        .cell-number {
          font-size: 12px;
          font-weight: bold;
          color: #969799;
        }
        .cell-gong {
          font-size: 14px;
          font-weight: bold;
          color: #323233;
        }
        .cell-dipan, .cell-tianpan, .cell-xing, .cell-men, .cell-shen {
          line-height: 1.4;
          margin-top: 2px;
        }
      }
    }
    .legend {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 10px;
      color: #969799;
      span {
        flex: 1;
        text-align: center;
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