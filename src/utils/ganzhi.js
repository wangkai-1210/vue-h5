/*
 * @Description: 1900-2100区间内的公历、农历互转
 * @charset  UTF-8
 * @Author: wang_k
 * @Date: 2026-05-25 15:06:35
 * @LastEditTime: 2026-05-28 09:58:03
 * @FilePath: /vue2-mobile-h5/src/utils/ganzhi.js
 * @公历转农历：calendarChange.solar2lunar(1987,11,01);
 * @农历转公历：calendarChange.lunar2solar(1987,09,10);
 */


export const calendarChange = {
    // ==================== 常量数据 ====================

    /**
     * 农历年信息表（1900 年 - 2100 年）
     * 每个元素是一个 32 位整数，编码了该年的以下信息：
     * - 低 4 位（0xF）：闰月月份，0 表示无闰月
     * - 第 5-16 位（0x1FFF0）：表示 1-12 月的大小，1 为大月（30天），0 为小月（29天）
     * - 第 17 位（0x10000）：闰月大小，1 为大月（30天），0 为小月（29天）
     */
    lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950,
        0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0,
        0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60,
        0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3,
        0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0,
        0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0,
        0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263,
        0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558,
        0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40,
        0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0,
        0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7,
        0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0,
        0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0,
        0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6,
        0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50,
        0x1b255, 0x06d20, 0x0ada0,
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50,
        0x06b20, 0x1a6c4, 0x0aae0,
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55,
        0x056a0, 0x0a6d0, 0x055d4,
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0,
        0x0aba4, 0x0a5b0, 0x052b0,
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60,
        0x0a570, 0x054e4, 0x0d160,
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4,
        0x0a2d0, 0x0d150, 0x0f252,
        0x0d520
    ],

    /** 公历各月天数（平年），用于快速查询 */
    solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    /** 十天干 */
    Gan: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],

    /** 十二地支 */
    Zhi: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],

    /** 十二生肖对应地支顺序 */
    Animals: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],

    /** 二十四节气名称（从小寒开始） */
    solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"],

    /**
     * 节气数据表（1900-2100年）
     * 每个年份对应一个字符串，编码了该年24个节气的日期（公历）
     * 编码方式：每5个十六进制字符表示一个节气的日期信息，需要解析
     */
    sTermInfo: ['9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c3598082c95f8c965cc920f',
        '97bd0b06bdb0722c965ce1cfcc920f',
        'b027097bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f',
        '97bd0b06bdb0722c965ce1cfcc920f',
        'b027097bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f',
        '97bd0b06bdb0722c965ce1cfcc920f',
        'b027097bd097c36b0b6fc9274c91aa',
        '9778397bd19801ec9210c965cc920e',
        '97b6b97bd19801ec95f8c965cc920f',
        '97bd09801d98082c95f8e1cfcc920f',
        '97bd097bd097c36b0b6fc9210c8dc2',
        '9778397bd197c36c9210c9274c91aa',
        '97b6b97bd19801ec95f8c965cc920e',
        '97bd09801d98082c95f8e1cfcc920f',
        '97bd097bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa',
        '97b6b97bd19801ec95f8c965cc920e',
        '97bcf97c3598082c95f8e1cfcc920f',
        '97bd097bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c3598082c95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c3598082c95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f',
        '97bd097bd07f595b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9210c8dc2',
        '9778397bd19801ec9210c9274c920e',
        '97b6b97bd19801ec95f8c965cc920f',
        '97bd07f5307f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c920e',
        '97b6b97bd19801ec95f8c965cc920f',
        '97bd07f5307f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bd07f1487f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c9274c920e',
        '97bcf7f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa',
        '97b6b97bd197c36c9210c9274c920e',
        '97bcf7f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c920e',
        '97b6b7f0e47f531b0723b0b6fb0722',
        '7f0e37f5307f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36b0b70c9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0787b0721',
        '7f0e27f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f149b0723b0787b0721',
        '7f0e27f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa',
        '977837f0e37f149b0723b0787b0721',
        '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c8dc2',
        '977837f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722',
        '7f0e37f5307f595b0b0bc920fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2',
        '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722',
        '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f149b0723b0787b0721',
        '7f0e27f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722',
        '977837f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722',
        '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e37f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722',
        '7f0e37f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e37f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e37f14898082b072297c35',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f149b0723b0787b0721',
        '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14998082b0723b06bd',
        '7f07e7f0e47f149b0723b0787b0721',
        '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14998082b0723b06bd',
        '7f07e7f0e37f14998083b0787b0721',
        '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14898082b0723b02d5',
        '7f07e7f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722',
        '7f0e36665b66aa89801e9808297c35',
        '665f67f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722',
        '7f0e36665b66a449801e9808297c35',
        '665f67f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e36665b66a449801e9808297c35',
        '665f67f0e37f14898082b072297c35',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e26665b66a449801e9808297c35',
        '665f67f0e37f1489801eb072297c35',
        '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722'
    ],

    /** 中文数字 0-10 用于表示日期 */
    nStr1: ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],

    /** 日期前缀（初、十、廿、卅） */
    nStr2: ["初", "十", "廿", "卅"],

    /** 农历月份名称（正月、二月...腊月） */
    nStr3: ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"],

    // ==================== 农历天数计算函数 ====================

    /**
     * 获取农历年的总天数
     * @param {number} y - 农历年份（1900-2100）
     * @returns {number} 该农历年的总天数（平年354天左右，闰年384天左右）
     */
    lYearDays: function (y) {
        let sum = 348;  // 基础天数（12个29天小月）
        // 遍历第5位到第16位（共12位），表示1-12月的大小（1为大月30天）
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
        }
        return sum + this.leapDays(y);
    },

    /**
     * 获取农历年的闰月月份
     * @param {number} y - 农历年份
     * @returns {number} 闰月月份（1-12），0 表示无闰月
     */
    leapMonth: function (y) {
        return this.lunarInfo[y - 1900] & 0xf;
    },

    /**
     * 获取农历年闰月的天数
     * @param {number} y - 农历年份
     * @returns {number} 闰月天数（29或30），无闰月返回0
     */
    leapDays: function (y) {
        if (this.leapMonth(y)) {
            return (this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    },

    /**
     * 获取农历某月的天数
     * @param {number} y - 农历年份
     * @param {number} m - 月份（1-12）
     * @returns {number} 该月天数（29或30），无效返回-1
     */
    monthDays: function (y, m) {
        if (m > 12 || m < 1) return -1;
        // 第5-16位，按位判断，m=1对应最高位(0x10000>>1)，依次类推
        return (this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    },

    /**
     * 获取公历某月的天数（考虑闰年）
     * @param {number} y - 公历年份
     * @param {number} m - 月份（1-12）
     * @returns {number} 该月天数
     */
    solarDays: function (y, m) {
        if (m > 12 || m < 1) return -1;
        const ms = m - 1;
        if (ms === 1) {  // 二月
            return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 29 : 28;
        } else {
            return this.solarMonth[ms];
        }
    },

    // ==================== 干支与中文转换 ====================

    /**
     * 将偏移量转换为干支字符串
     * @param {number} offset - 干支序号（60进制，0=甲子）
     * @returns {string} 形如“甲子”
     */
    toGanZhi: function (offset) {
        return this.Gan[offset % 10] + this.Zhi[offset % 12];
    },

    /**
     * 获取指定年份某节气的公历日期（日数）
     * @param {number} y - 公历年份（1900-2100）
     * @param {number} n - 节气序号（1-24，从小寒开始）
     * @returns {number} 该节气在该年的公历日期（几号），失败返回-1
     */
    getTerm: function (y, n) {
        if (y < 1900 || y > 2100 || n < 1 || n > 24) return -1;
        const _table = this.sTermInfo[y - 1900];
        // 每5个十六进制字符为一个节气的编码（共24节气，5*24=120字符，但实际字符串长度为30？原表存储形式特殊）
        // 这里将字符串每5位解析为一个整数，再拆解为日期部分（具体算法继承自原实现）
        const _info = [
            parseInt(`0x${_table.substr(0, 5)}`).toString(),
            parseInt(`0x${_table.substr(5, 5)}`).toString(),
            parseInt(`0x${_table.substr(10, 5)}`).toString(),
            parseInt(`0x${_table.substr(15, 5)}`).toString(),
            parseInt(`0x${_table.substr(20, 5)}`).toString(),
            parseInt(`0x${_table.substr(25, 5)}`).toString()
        ];
        // 解析每个编码中的具体日数值（每个编码代表4个节气？具体逻辑复杂，保留原样）
        const _calday = [
            _info[0].substr(0, 1), _info[0].substr(1, 2), _info[0].substr(3, 1), _info[0].substr(4, 2),
            _info[1].substr(0, 1), _info[1].substr(1, 2), _info[1].substr(3, 1), _info[1].substr(4, 2),
            _info[2].substr(0, 1), _info[2].substr(1, 2), _info[2].substr(3, 1), _info[2].substr(4, 2),
            _info[3].substr(0, 1), _info[3].substr(1, 2), _info[3].substr(3, 1), _info[3].substr(4, 2),
            _info[4].substr(0, 1), _info[4].substr(1, 2), _info[4].substr(3, 1), _info[4].substr(4, 2),
            _info[5].substr(0, 1), _info[5].substr(1, 2), _info[5].substr(3, 1), _info[5].substr(4, 2)
        ];
        return parseInt(_calday[n - 1]);
    },

    /**
     * 将月份数字转换为中文月份名称
     * @param {number} m - 月份（1-12）
     * @returns {string} 如“正月”
     */
    toChinaMonth: function (m) {
        if (m > 12 || m < 1) return -1;
        return this.nStr3[m - 1] + "月";
    },

    /**
     * 将日期数字转换为中文日期表示
     * @param {number} d - 日期数字（1-30）
     * @returns {string} 如“初一”、“十五”、“廿三”
     */
    toChinaDay: function (d) {
        if (d === 10) return '初十';
        if (d === 20) return '二十';
        if (d === 30) return '三十';
        return this.nStr2[Math.floor(d / 10)] + this.nStr1[d % 10];
    },

    /**
     * 根据年份获取生肖
     * @param {number} y - 年份（公历或农历年，基于农历年）
     * @returns {string} 生肖名称
     */
    getAnimal: function (y) {
        return this.Animals[(y - 4) % 12];
    },

    // ==================== 公历转农历 ====================

    /**
     * 公历转农历（核心函数）
     * @param {number} y - 公历年份
     * @param {number} m - 公历月份（1-12）
     * @param {number} d - 公历日期（1-31）
     * @returns {object|number} 返回包含农历信息的对象，失败返回 -1
     * 返回对象属性：
     *   lYear, lMonth, lDay: 农历年月日
     *   Animal: 生肖
     *   IMonthCn, IDayCn: 中文月份和日期
     *   cYear, cMonth, cDay: 公历年月日
     *   gzYear, gzMonth, gzDay: 干支年月日
     *   isToday: 是否为当天
     *   isLeap: 是否闰月
     *   nWeek, ncWeek: 星期几（数字和中文）
     *   isTerm: 是否为节气日
     *   Term: 节气名称（如果不是节气则为 null）
     */
    solar2lunar: function (y, m, d) {
        // 范围限制
        if (y < 1900 || y > 2100) return -1;
        if (y === 1900 && m === 1 && d < 31) return -1;

        const objDate = new Date(y, m - 1, d);
        const year = objDate.getFullYear();
        const month = objDate.getMonth() + 1;
        const day = objDate.getDate();

        // 计算从1900-01-31（农历1900-01-01）到目标日期的天数差
        let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;
        if (offset < 0) return -1;

        let lunarYear = 1900;
        let daysInYear = this.lYearDays(lunarYear);
        // 确定农历年份（减去每个完整农历年的天数）
        while (offset >= daysInYear && lunarYear < 2100) {
            offset -= daysInYear;
            lunarYear++;
            daysInYear = this.lYearDays(lunarYear);
        }

        const leap = this.leapMonth(lunarYear);
        let isLeap = false;
        let lunarMonth = 1;
        let lunarDay = 1;

        // 确定农历月份和日期（处理闰月）
        for (let i = 1; i <= 12; i++) {
            let monthDays;
            if (leap > 0 && i === leap) {
                // 遇到闰月，先处理闰月
                monthDays = this.leapDays(lunarYear);
                if (offset < monthDays) {
                    isLeap = true;
                    lunarMonth = i;
                    lunarDay = offset + 1;
                    break;
                }
                offset -= monthDays;
                // 闰月后的同序号普通月
                monthDays = this.monthDays(lunarYear, i);
                if (offset < monthDays) {
                    isLeap = false;
                    lunarMonth = i;
                    lunarDay = offset + 1;
                    break;
                }
                offset -= monthDays;
            } else {
                monthDays = this.monthDays(lunarYear, i);
                if (offset < monthDays) {
                    lunarMonth = i;
                    lunarDay = offset + 1;
                    break;
                }
                offset -= monthDays;
            }
        }

        // 星期处理
        let nWeek = objDate.getDay();
        const cWeek = this.nStr1[nWeek];
        if (nWeek === 0) nWeek = 7;  // 将周日转为7

        // 干支年（以立春为界，立春通常在2月4日左右）
        const term3 = this.getTerm(lunarYear, 3);  // 立春的节气序号为3
        let gzY;
        if (month < 2 || (month === 2 && day < term3)) {
            // 还没到立春，年干支为去年
            gzY = this.toGanZhi(lunarYear - 5);
        } else {
            gzY = this.toGanZhi(lunarYear - 4);
        }

        // 干支月（以节气为界）
        const firstNode = this.getTerm(year, month * 2 - 1);  // 本月第一个节气
        const secondNode = this.getTerm(year, month * 2);     // 本月第二个节气
        let gzM = this.toGanZhi((year - 1900) * 12 + month + 11);  // 默认月干支（当前月）
        if (day >= firstNode) {
            gzM = this.toGanZhi((year - 1900) * 12 + month + 12);  // 已过第一个节气，换下个月干支
        }

        // 节气检测
        let isTerm = false;
        let Term = null;
        if (firstNode === day) {
            isTerm = true;
            Term = this.solarTerm[month * 2 - 2];
        }
        if (secondNode === day) {
            isTerm = true;
            Term = this.solarTerm[month * 2 - 1];
        }

        // 干支日（基于公历日期的固定偏移）
        const dayCyclical = Date.UTC(year, month - 1, 1) / 86400000 + 25567 + 10;
        const gzD = this.toGanZhi(dayCyclical + day - 1);

        // 判断是否为今天
        const nowDate = new Date();
        const isToday = nowDate.getFullYear() === year && (nowDate.getMonth() + 1) === month && nowDate.getDate() === day;

        return {
            lYear: lunarYear,
            lMonth: lunarMonth,
            lDay: lunarDay,
            Animal: this.getAnimal(lunarYear),
            IMonthCn: (isLeap ? "闰" : "") + this.toChinaMonth(lunarMonth),
            IDayCn: this.toChinaDay(lunarDay),
            cYear: year,
            cMonth: month,
            cDay: day,
            gzYear: gzY,
            gzMonth: gzM,
            gzDay: gzD,
            isToday: isToday,
            isLeap: isLeap,
            nWeek: nWeek,
            ncWeek: "星期" + cWeek,
            isTerm: isTerm,
            Term: Term
        };
    },

    // ==================== 农历转公历 ====================

    /**
     * 农历转公历
     * @param {number} y - 农历年份（1900-2100）
     * @param {number} m - 农历月份（1-12，如闰月需单独指定）
     * @param {number} d - 农历日期（1-30）
     * @param {boolean} isLeapMonth - 是否为闰月
     * @returns {object|number} 返回对应公历日期的农历信息（调用 solar2lunar 获得），失败返回 -1
     */
    lunar2solar: function (y, m, d, isLeapMonth) {
        if (y < 1900 || y > 2100) return -1;
        const leapMonth = this.leapMonth(y);
        // 闰月有效性检查
        if (isLeapMonth && leapMonth !== m) return -1;
        if ((y === 2100 && m === 12 && d > 1) || (y === 1900 && m === 1 && d < 31)) return -1;

        // 检查农历日期是否有效
        const monthDays = isLeapMonth ? this.leapDays(y) : this.monthDays(y, m);
        if (d > monthDays) return -1;

        // 计算从1900年正月初一到目标农历日期的偏移天数
        let offset = 0;
        // 累加完整农历年
        for (let i = 1900; i < y; i++) {
            offset += this.lYearDays(i);
        }
        // 累加目标月之前的月份（正确处理闰月）
        const leap = this.leapMonth(y);
        for (let i = 1; i < m; i++) {
            offset += this.monthDays(y, i);
            if (leap > 0 && i === leap) {
                offset += this.leapDays(y);  // 闰月紧跟在普通月之后
            }
        }
        // 如果是闰月，额外加上闰月天数
        if (isLeapMonth) {
            offset += this.leapDays(y);
        }
        // 加上当月日期偏移
        offset += d - 1;

        // 基准日期：1900年1月31日（公历）对应农历1900-01-01
        const baseDate = Date.UTC(1900, 0, 31);
        const targetDate = new Date(baseDate + offset * 86400000);
        const cY = targetDate.getUTCFullYear();
        const cM = targetDate.getUTCMonth() + 1;
        const cD = targetDate.getUTCDate();

        // 返回公历日期对应的完整农历信息（便于统一处理）
        return this.solar2lunar(cY, cM, cD);
    }
};