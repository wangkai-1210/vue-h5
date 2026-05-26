<template>
  <div class="qimen-page">
    <van-nav-bar
      title="奇门遁甲"
      fixed
      placeholder
      left-arrow
      @click-left="$router.back()"
    />

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

      <!-- 阴阳局模式切换 -->
      <div class="mode-switch-row">
        <span class="mode-label">阴阳局模式</span>
        <van-switch
          v-model="isManualMode"
          active-color="#1989fa"
          inactive-color="#dcdee0"
        >
          <template #node>
            <span style="font-size: 12px; padding: 0 4px">{{
              isManualMode ? "手动" : "自动"
            }}</span>
          </template>
        </van-switch>
      </div>

      <!-- 阴阳局显示（自动计算或手动选择） -->
      <van-cell-group inset class="setting-group">
        <van-field
          :label="isManualMode ? '阴阳局(可修改)' : '阴阳局(自动)'"
          :value="YYxianshi + Juxianshi"
          readonly
          :clickable="isManualMode"
          @click="openJuPicker"
          :right-icon="isManualMode ? 'arrow' : ''"
        />
        <div v-if="isManualMode" class="manual-tip">
          点击右侧箭头可手动选择阴阳遁局数
        </div>
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

      <!-- 手动选择阴阳局弹窗 -->
      <van-popup v-model="showJuPicker" round position="bottom">
        <van-picker
          show-toolbar
          title="选择阴阳遁局数"
          :columns="juOptions"
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
          <span>地盘奇仪</span> <span>天盘奇仪</span> <span>九星</span>
          <span>八门</span> <span>八神</span>
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
          <!-- AI返回内容展示 -->
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
  Switch,
} from "vant";
import { calendarChange } from "@/utils/ganzhi.js";
import { params } from "@/utils/draw3.js";
import { chatCompletion } from "@/api/ai";

export default {
  name: "QimenPage",
  components: {
    [NavBar.name]: NavBar,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [DatetimePicker.name]: DatetimePicker,
    [Picker.name]: Picker,
    [Button.name]: Button,
    [Switch.name]: Switch,
  },
  data() {
    const now = new Date();
    const defaultDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return {
      showDatePicker: false,
      showTimePicker: false,
      showJuPicker: false,
      selectedDate: defaultDate,
      dateText: "",
      selectedTimeIndex: 7, // 默认午时
      defaultTimeIndex: 6,
      timeText: "",
      minDate: new Date(1900, 0, 1),
      maxDate: new Date(2100, 11, 31),
      timeColumns: [
        { text: "子时 (23:00-1:00)", value: 1 },
        { text: "丑时 (1:00-3:00)", value: 2 },
        { text: "寅时 (3:00-5:00)", value: 3 },
        { text: "卯时 (5:00-7:00)", value: 4 },
        { text: "辰时 (7:00-9:00)", value: 5 },
        { text: "巳时 (9:00-11:00)", value: 6 },
        { text: "午时 (11:00-13:00)", value: 7 },
        { text: "未时 (13:00-15:00)", value: 8 },
        { text: "申时 (15:00-17:00)", value: 9 },
        { text: "酉时 (17:00-19:00)", value: 10 },
        { text: "戌时 (19:00-21:00)", value: 11 },
        { text: "亥时 (21:00-23:00)", value: 12 },
      ],
      // 基础数据（从 params 导入）
      Tg: [], // 十天干 ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
      Dz: [], // 十二地支
      Xing: [], // 九星 ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英']
      Men: [], // 八门 ['休','生','伤','杜','景','死','惊','开']
      Shen: [], // 八神 ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天']
      // 排盘结果
      value2: "",
      YMD: "", // 四柱（年月日）
      nlYMD: "",
      DzTime: "", // 时支
      TgTime: "", // 时干
      yyPan: "y1", // 'y1'阳遁 'y2'阴遁
      Ju: 1, // 局数 1-9
      XunShou: "", // 旬首（六仪）
      XunShou0: "", // 旬首（甲子等）
      ZFxing: "", // 值符星
      ZFmen: "", // 值使门
      YYxianshi: "阳",
      Juxianshi: "1局",
      // 排盘核心数据
      dipan: [], // 地盘奇仪（9宫顺序）
      tianpan: [], // 天盘奇仪（9宫顺序）
      xingPan: [], // 九星（9宫顺序）
      menPan: [], // 八门（9宫顺序）
      shenPan: [], // 八神（9宫顺序）
      // AI
      deepseek_loading: false,
      deepseek_content: null,
      sizhu: "",
      //阴阳局手动/自动模式
      isManualMode: false, // false=自动节气局数，true=手动指定
      manualJuYang: true, // 手动选择的阴阳：true阳遁 false阴遁
      manualJuNumber: 1, // 手动局数1-9
    };
  },
  computed: {
    // 手动选择器的选项列表
    juOptions() {
      const opts = [];
      for (let i = 1; i <= 9; i++) {
        opts.push({ text: `阳遁 ${i} 局`, value: { yang: true, ju: i } });
      }
      for (let i = 1; i <= 9; i++) {
        opts.push({ text: `阴遁 ${i} 局`, value: { yang: false, ju: i } });
      }
      return opts;
    },
    // 按九宫格展示顺序：巽4 离9 坤2 | 震3 中5 兑7 | 艮8 坎1 乾6
    gridData() {
      if (!this.YMD) return [];
      const order = [
        { number: 4, gong: "巽" },
        { number: 9, gong: "离" },
        { number: 2, gong: "坤" },
        { number: 3, gong: "震" },
        { number: 5, gong: "中" },
        { number: 7, gong: "兑" },
        { number: 8, gong: "艮" },
        { number: 1, gong: "坎" },
        { number: 6, gong: "乾" },
      ];
      return order.map((item) => {
        const idx = item.number - 1;
        return {
          ...item,
          dipan: this.dipan[idx] || "",
          tianpan: this.tianpan[idx] || "",
          xing: this.xingPan[idx] || "",
          men: this.menPan[idx] || "",
          shen: this.shenPan[idx] || "",
        };
      });
    },
  },
  watch: {
    // 监听手动模式切换
    isManualMode(newMode) {
      if (newMode === true) {
        // 切换到手动：将当前显示的阴阳局同步到手动变量
        const isYang = this.YYxianshi === "阳";
        let juNum = parseInt(this.Juxianshi);
        if (isNaN(juNum)) juNum = 1;
        this.manualJuYang = isYang;
        this.manualJuNumber = juNum;
        this.applyManualJuToGlobal();
        // 重新排盘（保持当前日期时辰）
        this.calcQimen();
      } else {
        // 切换到自动：根据当前日期时辰重新计算节气局数并刷新排盘
        this.computeSizhuAndJuAuto();
        this.calcQimen();
      }
    },
  },
  mounted() {
    // 初始化基础数据
    this.Tg = params.globalTg;
    this.Dz = params.globalDz;
    this.Xing = params.globalXing;
    this.Men = params.globalMen;
    this.Shen = params.globalShen;

    // 默认排今日午时
    this.onDateConfirm(this.selectedDate);
    this.onTimeConfirm({ text: this.timeColumns[6].text, value: 7 }, 6);
  },
  methods: {
    openJuPicker() {
      if (this.isManualMode) {
        this.showJuPicker = true;
      }
    },
    // 日期确认
    onDateConfirm(value) {
      this.selectedDate = value;
      const year = value.getFullYear();
      const month = value.getMonth() + 1;
      const day = value.getDate();
      this.dateText = `${year}-${String(month).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      this.value2 = this.dateText;
      this.showDatePicker = false;
      this.refreshByDateTime();
    },
    // 时辰确认
    onTimeConfirm(value) {
      this.selectedTimeIndex = value.value;
      this.timeText = value.text;
      this.showTimePicker = false;
      this.refreshByDateTime();
    },
    // 手动选择阴阳局确认
    onJuConfirm(selected) {
      const { yang, ju } = selected.value;
      this.manualJuYang = yang;
      this.manualJuNumber = ju;
      this.applyManualJuToGlobal();
      this.showJuPicker = false;
      this.calcQimen(); // 重新排盘
    },
    // 将手动选择的局数应用到全局
    applyManualJuToGlobal() {
      this.YYxianshi = this.manualJuYang ? "阳" : "阴";
      this.Juxianshi = this.manualJuNumber + "局";
      this.yyPan = this.manualJuYang ? "y1" : "y2";
      this.Ju = this.manualJuNumber;
    },
    // 根据当前模式刷新：日期/时辰变化时调用
    refreshByDateTime() {
      if (this.isManualMode) {
        // 手动模式：只更新四柱、时干支等，保留手动局数不变
        this.computeSizhuOnly();
        this.calcQimen();
      } else {
        // 自动模式：完整重新计算节气局数
        this.computeSizhuAndJuAuto();
        this.calcQimen();
      }
    },
    // 仅计算四柱、时干、阴历，不改变阴阳局（手动模式专用）
    computeSizhuOnly() {
      const date = this.selectedDate;
      const iTime = this.selectedTimeIndex;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const lunar = calendarChange.solar2lunar(year, month, day);
      this.nlYMD = lunar.lYear + "年" + lunar.IMonthCn + lunar.IDayCn;

      const yearGz = lunar.gzYear;
      const monthGz = lunar.gzMonth;
      const dayGz = lunar.gzDay;
      this.YMD = `${yearGz} ${monthGz} ${dayGz}`;

      // 时柱
      this.DzTime = this.Dz[iTime - 1];
      const rTg = this.Tg.indexOf(dayGz.charAt(0));
      let tIndex = (rTg + 1) * 2 + iTime - 2;
      tIndex = (tIndex - 1) % 10;
      this.TgTime = this.Tg[tIndex];
    },

    // 自动模式：完整计算四柱、节气、阴阳遁局数
    computeSizhuAndJuAuto() {
      const date = this.selectedDate;
      const iTime = this.selectedTimeIndex;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // 农历转换（得到年月日干支）
      const lunar = calendarChange.solar2lunar(year, month, day);
      this.nlYMD = lunar.lYear + "年" + lunar.IMonthCn + lunar.IDayCn;

      const yearGz = lunar.gzYear; // 年柱
      const monthGz = lunar.gzMonth; // 月柱
      const dayGz = lunar.gzDay; // 日柱
      this.YMD = `${yearGz} ${monthGz} ${dayGz}`;

      // 时柱
      this.DzTime = this.Dz[iTime - 1]; // 地支
      const rTg = this.Tg.indexOf(dayGz.charAt(0)); // 日干索引（甲0～癸9）
      let tIndex = (rTg + 1) * 2 + iTime - 2; // 时干序号（1-10）
      tIndex = (tIndex - 1) % 10; // 0-9
      this.TgTime = this.Tg[tIndex];
      const shiGan = this.Tg[tIndex];

      // 获取当前节气，确定阴阳遁和局数（拆补法）
      const solarTerm = this.getCurrentSolarTerm(year, month, day);
      const isYang = this.isYangDun(solarTerm);
      this.yyPan = isYang ? "y1" : "y2";
      this.YYxianshi = isYang ? "阳" : "阴";

      // 计算局数（拆补法：根据符头所在的节气三元）
      const ju = this.getJuFromSolarTerm(solarTerm, year, month, day, shiGan);
      this.Ju = ju;
      this.Juxianshi = ju + "局";
    },

    // 获取当前节气（返回节气名称如“冬至”）
    getCurrentSolarTerm(year, month, day) {
      const solarTerms = [
        "小寒",
        "大寒",
        "立春",
        "雨水",
        "惊蛰",
        "春分",
        "清明",
        "谷雨",
        "立夏",
        "小满",
        "芒种",
        "夏至",
        "小暑",
        "大暑",
        "立秋",
        "处暑",
        "白露",
        "秋分",
        "寒露",
        "霜降",
        "立冬",
        "小雪",
        "大雪",
        "冬至",
      ];
      const date = new Date(year, month - 1, day);
      let currentTerm = "冬至";
      for (let i = 0; i < solarTerms.length; i++) {
        const termDay = calendarChange.getTerm(year, i + 1);
        if (termDay) {
          const termDate = new Date(year, month - 1, termDay);
          if (date >= termDate) {
            currentTerm = solarTerms[i];
          } else {
            break;
          }
        }
      }
      return currentTerm;
    },

    isYangDun(solarTerm) {
      const yangTerms = [
        "冬至",
        "小寒",
        "大寒",
        "立春",
        "雨水",
        "惊蛰",
        "春分",
        "清明",
        "谷雨",
        "立夏",
        "小满",
        "芒种",
      ];
      return yangTerms.includes(solarTerm);
    },

    // 拆补法计算局数（基于符头和节气）
    getJuFromSolarTerm(solarTerm, year, month, day) {
      const lunar = calendarChange.solar2lunar(year, month, day);
      const dayGz = lunar.gzDay;
      const dayGan = dayGz[0];
      let yuan;
      if (dayGan === "甲" || dayGan === "己") yuan = "上元";
      else if (dayGan === "乙" || dayGan === "庚") yuan = "中元";
      else yuan = "下元";

      const termJu = {
        // 阳遁
        冬至: { 上元: 1, 中元: 7, 下元: 4 },
        小寒: { 上元: 2, 中元: 8, 下元: 5 },
        大寒: { 上元: 3, 中元: 9, 下元: 6 },
        立春: { 上元: 8, 中元: 5, 下元: 2 },
        雨水: { 上元: 9, 中元: 6, 下元: 3 },
        惊蛰: { 上元: 1, 中元: 7, 下元: 4 },
        春分: { 上元: 3, 中元: 9, 下元: 6 },
        清明: { 上元: 4, 中元: 1, 下元: 7 },
        谷雨: { 上元: 5, 中元: 2, 下元: 8 },
        立夏: { 上元: 4, 中元: 1, 下元: 7 },
        小满: { 上元: 5, 中元: 2, 下元: 8 },
        芒种: { 上元: 6, 中元: 3, 下元: 9 },
        // 阴遁
        夏至: { 上元: 9, 中元: 3, 下元: 6 },
        小暑: { 上元: 8, 中元: 2, 下元: 5 },
        大暑: { 上元: 7, 中元: 1, 下元: 4 },
        立秋: { 上元: 2, 中元: 5, 下元: 8 },
        处暑: { 上元: 1, 中元: 4, 下元: 7 },
        白露: { 上元: 9, 中元: 3, 下元: 6 },
        秋分: { 上元: 7, 中元: 1, 下元: 4 },
        寒露: { 上元: 6, 中元: 9, 下元: 3 },
        霜降: { 上元: 5, 中元: 8, 下元: 2 },
        立冬: { 上元: 6, 中元: 9, 下元: 3 },
        小雪: { 上元: 5, 中元: 8, 下元: 2 },
        大雪: { 上元: 4, 中元: 7, 下元: 1 },
      };
      const ju = termJu[solarTerm][yuan];
      return ju;
    },

    // 完整排盘入口（依赖当前的 yyPan, Ju, dipan 等）
    calcQimen() {
      if (!this.YMD) return;
      // 1. 排地盘奇仪
      this.setDipan();
      // 2. 计算旬首、值符、值使
      this.setXunShouAndZhiFuZhiShi();
      // 3. 排天盘奇仪
      this.setTianpan();
      // 4. 排九星
      this.setXing();
      // 5. 排八门
      this.setMen();
      // 6. 排八神
      this.setShen();
    },

    // 地盘奇仪
    setDipan() {
      // 地盘奇仪顺序：1坎 2坤 3震 4巽 5中 6乾 7兑 8艮 9离
      // 根据局数，阳遁顺排戊己庚辛壬癸丁丙乙，阴遁逆排
      const yiShu = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
      let dipanOrder = [];
      if (this.yyPan === "y1") {
        // 阳遁
        const start = this.Ju - 1;
        for (let i = 0; i < 9; i++) {
          dipanOrder[(start + i) % 9] = yiShu[i];
        }
      } else {
        // 阴遁
        const start = this.Ju - 1;
        for (let i = 0; i < 9; i++) {
          dipanOrder[(start - i + 9) % 9] = yiShu[i];
        }
      }
      this.dipan = dipanOrder; // 索引0对应坎1宫，依此类推
    },

    // 旬首、值符、值使
    setXunShouAndZhiFuZhiShi() {
      const shiGan = this.TgTime;
      const shiZhi = this.DzTime;
      const tgIndex = this.Tg.indexOf(shiGan);
      const dzIndex = this.Dz.indexOf(shiZhi);
      let diff = tgIndex - dzIndex;
      if (diff < 0) diff += 12;
      // 旬首地支
      const xunShouZhi = this.Dz[(dzIndex - diff + 12) % 12];
      // 旬首天干根据六仪规律
      const xunShouMap = {
        子: "戊",
        戌: "己",
        申: "庚",
        午: "辛",
        辰: "壬",
        寅: "癸",
      };
      this.XunShou = xunShouMap[xunShouZhi];
      this.XunShou0 = "甲" + xunShouZhi;

      // 旬首所在宫位（地盘）
      const xunShouIndex = this.dipan.indexOf(this.XunShou);
      // 值符星 = 旬首所在宫对应的原始九星
      const starOrder = [
        "天蓬",
        "天芮",
        "天冲",
        "天辅",
        "天禽",
        "天心",
        "天柱",
        "天任",
        "天英",
      ];
      this.ZFxing = starOrder[xunShouIndex];
      const menOrder = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];
      const menPalace = [1, 8, 3, 4, 9, 2, 7, 6];
      const palaceNum = xunShouIndex + 1;
      let menIdx = menPalace.indexOf(palaceNum);
      if (menIdx === -1) menIdx = 4;
      this.ZFmen = menOrder[menIdx];
    },

    // 天盘奇仪
    setTianpan() {
      // 天盘奇仪：将旬首所在宫的地盘奇仪移到时干所在宫，然后顺排
      const xunShou = this.XunShou;
      const shiGan = this.TgTime;
      const xunIndex = this.dipan.indexOf(xunShou);
      const shiGanIndex = this.dipan.indexOf(shiGan);
      if (xunIndex !== -1 && shiGanIndex !== -1) {
        const offset = (shiGanIndex - xunIndex + 9) % 9;
        const newPan = new Array(9);
        for (let i = 0; i < 9; i++) {
          newPan[(i + offset) % 9] = this.dipan[i];
        }
        this.tianpan = newPan;
      } else {
        this.tianpan = [...this.dipan];
      }
    },

    // 九星
    setXing() {
      // 九星原始顺序（对应宫位1-9）
      const starOrder = [
        "天蓬",
        "天芮",
        "天冲",
        "天辅",
        "天禽",
        "天心",
        "天柱",
        "天任",
        "天英",
      ];
      const zhiFuIndex = starOrder.indexOf(this.ZFxing);
      const shiGan = this.TgTime;
      const shiGanPalace = this.dipan.indexOf(shiGan);
      if (shiGanPalace === -1) return;
      const offset = (shiGanPalace - zhiFuIndex + 9) % 9;
      const newXing = new Array(9);
      for (let i = 0; i < 9; i++) {
        newXing[(i + offset) % 9] = starOrder[i];
      }
      const tianRuiIndex = newXing.indexOf("天芮");
      if (tianRuiIndex !== -1 && newXing[1] === "天芮") {
        newXing[4] = "天禽";
      }
      this.xingPan = newXing;
    },

    // 八门
    setMen() {
      const menOrder = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];
      const zhiShiIndex = menOrder.indexOf(this.ZFmen);
      const shiZhi = this.DzTime;
      const xunShouZhi = this.XunShou0[1];
      const startIdx = this.Dz.indexOf(xunShouZhi);
      const endIdx = this.Dz.indexOf(shiZhi);
      let steps = endIdx - startIdx;
      if (steps < 0) steps += 12;
      const menPalaceMap = [1, 8, 3, 4, 9, 2, 7, 6];
      let startPalace = menPalaceMap[zhiShiIndex];
      let finalPalace = startPalace;
      if (this.yyPan === "y1") {
        finalPalace = ((startPalace - 1 + steps) % 9) + 1;
      } else {
        finalPalace = ((startPalace - 1 - steps + 900) % 9) + 1;
      }
      const menPan = new Array(9).fill("");
      let currentMenIdx = zhiShiIndex;
      let currentPalace = finalPalace;
      for (let i = 0; i < 8; i++) {
        menPan[currentPalace - 1] = menOrder[currentMenIdx % 8];
        if (this.yyPan === "y1") {
          currentPalace = (currentPalace % 9) + 1;
        } else {
          currentPalace = ((currentPalace - 2 + 9) % 9) + 1;
        }
        currentMenIdx = (currentMenIdx + 1) % 8;
      }
      this.menPan = menPan;
    },

    // 八神
    setShen() {
      const shenOrder = [
        "值符",
        "螣蛇",
        "太阴",
        "六合",
        "白虎",
        "玄武",
        "九地",
        "九天",
      ];
      const shiGan = this.TgTime;
      const shiGanPalace = this.dipan.indexOf(shiGan);
      if (shiGanPalace === -1) return;
      const shenPan = new Array(9).fill("");
      let currentShenIdx = 0;
      let currentPalace = shiGanPalace + 1;
      for (let i = 0; i < 8; i++) {
        shenPan[currentPalace - 1] = shenOrder[currentShenIdx];
        if (this.yyPan === "y1") {
          currentPalace = (currentPalace % 9) + 1;
        } else {
          currentPalace = ((currentPalace - 2 + 9) % 9) + 1;
        }
        currentShenIdx = (currentShenIdx + 1) % 8;
      }
      this.shenPan = shenPan;
    },

    // AI 分析
    async fetchData() {
      this.deepseek_loading = true;
      try {
        const now = new Date();
        const dhours = now.getHours();
        const dminutes = now.getMinutes();
        const dseconds = now.getSeconds();
        const dTime = dhours + "时" + dminutes + "分" + dseconds + "秒";
        const dsizhu = this.YMD + " " + this.TgTime + this.DzTime;
        const dju1 = this.YYxianshi + this.Juxianshi;

        this.sizhu =
          "你的角色是一位国学大师，擅长道家阴盘奇门遁甲起局。根据王凤麟大师的著作（不显示姓名和书名），这个时间，" +
          dTime +
          "|阳历：" +
          this.value2 +
          "｜阴历：" +
          this.nlYMD +
          "｜四柱：" +
          dsizhu +
          "|" +
          dju1 +
          "，起局方式道家奇门遁甲阴盘排盘。不需要解释四柱内容。先用字符进行道家阴盘遁甲九宫起局，排盘注意八门、八星、八神、隐干、马星、四害的顺序等详细信息。九宫排盘的格子位置需要精确，对九宫的每一个宫的细节依次进行分析，然后可以从事业工作、家人、亲子、健康、财运等方向进行分析。";

        const res = await chatCompletion(
          this.sizhu,
          "你是一位资深的道家阴盘奇门遁甲大师，擅长根据时间起局并进行详细分析。",
          "deepseek",
          1500,
        );
        if (res && res.choices && res.choices[0]) {
          this.deepseek_content = res.choices[0].message.content;
          this.$store.commit("SET_REPORT_DATA", {
            content: this.deepseek_content,
            modelName: "",
            company: "",
            time: new Date().toLocaleString("zh-CN"),
          });

          this.$router.push("/report-display");
        }
      } catch (error) {
        console.error("API 调用失败:", error);
      } finally {
        this.deepseek_loading = false;
      }
    },
  },
  beforeDestroy() {
    this.$store.commit("SET_REPORT_DATA", null);
  },
};
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

  .mode-switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fff;
    border-radius: 12px;
    margin: 12px 12px 0 12px;

    .mode-label {
      font-size: 14px;
      color: #323233;
      font-weight: 500;
    }
  }

  .manual-tip {
    font-size: 12px;
    color: #ee0a24;
    padding: 4px 16px 12px 16px;
    background: #fff;
    border-radius: 0 0 12px 12px;
    margin-top: -8px;
  }

  .result-card {
    margin: 16px 12px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

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
        margin-right: 8px;
      }

      .value {
        color: #323233;
        font-weight: 500;
      }
    }
  }

  // ========== 九宫格样式规范化 ==========
  .jiugong-grid {
    margin: 16px 12px;

    .grid-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 12px;
      padding-left: 4px;
    }

    .grid-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: transparent;
      padding: 0;

      .grid-cell {
        background: #ffffff;
        border-radius: 12px;
        padding: 10px 4px;
        text-align: center;
        min-height: 130px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
        border: 1px solid #f0f0f0;

        &.center {
          background: #fff9e6;
          border-color: #ffe6a3;
          box-shadow: 0 2px 6px rgba(255, 193, 7, 0.1);
        }

        .cell-number {
          font-size: 13px;
          font-weight: 700;
          color: #c0c4cc;
          background: #f5f7fa;
          display: inline-block;
          width: 24px;
          line-height: 20px;
          border-radius: 20px;
          margin-bottom: 4px;
        }

        .cell-gong {
          font-size: 16px;
          font-weight: 700;
          color: #3f495e;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }

        // 统一每行信息样式
        .cell-dipan,
        .cell-tianpan,
        .cell-xing,
        .cell-men,
        .cell-shen {
          line-height: 1.5;
          font-size: 11px;
          white-space: nowrap;
          overflow-x: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          padding: 0 2px;
        }

        // 区分地盘和天盘颜色（可选）
        .cell-dipan {
          color: #2c3e4e;
          font-weight: 500;
          &::before {
            content: "地";
            font-size: 9px;
            background: #eef2f6;
            padding: 1px 4px;
            border-radius: 10px;
            margin-right: 4px;
            color: #5d6f83;
          }
        }
        .cell-tianpan {
          color: #b95b0d;
          font-weight: 500;
          &::before {
            content: "天";
            font-size: 9px;
            background: #fff0e0;
            padding: 1px 4px;
            border-radius: 10px;
            margin-right: 4px;
            color: #c26b1a;
          }
        }
        .cell-xing::before {
          content: "⭐";
          font-size: 9px;
          margin-right: 3px;
        }
        .cell-men::before {
          content: "🚪";
          font-size: 9px;
          margin-right: 3px;
        }
        .cell-shen::before {
          content: "✨";
          font-size: 9px;
          margin-right: 3px;
        }
      }
    }

    .legend {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      padding: 8px 12px;
      background: #f8f9fc;
      border-radius: 30px;
      font-size: 11px;
      color: #7d8e9f;

      span {
        flex: 1;
        text-align: center;
        &:first-child {
          text-align: left;
        }
        &:last-child {
          text-align: right;
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

// 移动端适配：当屏幕宽度较小时，适当缩小内边距
@media (max-width: 420px) {
  .jiugong-grid .grid-box .grid-cell {
    padding: 6px 2px;
    min-height: 115px;

    .cell-gong {
      font-size: 14px;
    }
    .cell-dipan,
    .cell-tianpan,
    .cell-xing,
    .cell-men,
    .cell-shen {
      font-size: 10px;
      white-space: normal;
      word-break: keep-all;
    }
    .cell-dipan::before,
    .cell-tianpan::before,
    .cell-xing::before,
    .cell-men::before,
    .cell-shen::before {
      display: inline-block;
      transform: scale(0.9);
    }
  }
}
</style>
