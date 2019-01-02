import utils from './utils.js';
import numeral from 'numeral'
import t from '../../assets/lang'
import { language } from './config'
const storage = weex.requireModule('bmStorage');

const getLocale = storage.getDataSync('language').data
let locale = getLocale ? JSON.parse(getLocale) : language; //en 英文，zh-CN 中文 
const $t = (x) => {
    return t(x, locale)
}
const filters = {
    ...utils,
    dateFormat(timestamp, format) {
        if (!timestamp) {
            return '';
        }
        var date = new Date();
        date.setTime(timestamp * 1000);
        var o = {
            "M+": date.getMonth() + 1, //month
            "d+": date.getDate(), //day
            "h+": date.getHours(), //hour
            "m+": date.getMinutes(), //minute
            "s+": date.getSeconds(), //second
            "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
            "S+": date.getMilliseconds(), //millisecond
            "w": date.getDay() //week
        };
        if (/w/.test(format)) {
            var dayToWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            o['w'] = $t(dayToWeek[o['w']]);
        }
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    cutWords(str = ' ', length = 6) {
        if (str.length > length) {
            var str2 = str.substr(0, length - 1);
            str2 += ' ...';
            return str2;
        }
        return str;
    },
    getTimeWeek(timestamp) {
        var ts = timestamp || new Date().getTime();
        var weekDay = [$t("星期日"), $t("星期一"), $t("星期二"), $t("星期三"), $t("星期四"), $t("星期五"), $t("星期六")];
        var dateStr = filters.dateFormat(ts / 1000, 'yyyy-MM-dd');
        var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
        if (!timestamp) {
            return weekDay[myDate.getDay()] + $t('(今天)');
        }
        return weekDay[myDate.getDay()];
    },
    getDateNow(timestamp) {
        let now = new Date().getTime();
        let str = filters.dateFormat(timestamp / 1000, 'yyyy-MM-dd');
        let strnow = filters.dateFormat(now / 1000, 'yyyy-MM-dd');
        let day = new Date(str).getTime();
        let daynow = new Date(strnow).getTime();
        let cha = (daynow - day) / (24 * 60 * 60 * 1000);
        if (cha == 0) {
            return $t('(今天)');
        } else if (cha == 1) {
            return $t('(昨天)')
        } else if (cha == 2) {
            return $t('(前天)')
        } else {
            return '';
        }
    },
    getNow(timestamp) {
        let now = new Date().getTime();
        let str = filters.dateFormat(timestamp, 'yyyy-MM-dd');
        let strnow = filters.dateFormat(now / 1000, 'yyyy-MM-dd');
        let day = new Date(str).getTime();
        let daynow = new Date(strnow).getTime();
        let cha = (daynow - day) / (24 * 60 * 60 * 1000);
        if (cha == 0) {
            return $t('今天');
        } else if (cha == 1) {
            return $t('昨天')
        } else if (cha == 2) {
            return $t('前天')
        } else {
            return '' + cha + $t('天前');
        }
    },
    getPublishTime(publish_time) {
        var format = 'yyyy-MM-dd hh:mm';
        publish_time = filters.dateFormat(publish_time / 1000, format);
        publish_time = publish_time.replace('00:00', '');
        return publish_time;
    },
    getFormatTime(timestamp) {
        timestamp = timestamp * 1000;
        if (timestamp == 0) {
            return ' ';
        }
        var today = new Date();
        var today_date = today.getDate();

        var thatday = new Date();
        thatday.setTime(timestamp);
        var thatday_date = thatday.getDate();

        var format = 'yyyy-MM-dd hh:mm';

        var delta_ms = today.getTime() - thatday.getTime();
        var delta_day = today_date - thatday_date;

        if (delta_ms < 24 * 3600 * 1000 && delta_day < 1 && delta_day >= 0) {
            format = 'hh:mm';
        }
        let date_format_str = filters.dateFormat(timestamp / 1000, format);
        if (date_format_str.indexOf('00:00') != -1) {
            format = 'yyyy-MM-dd';
            date_format_str = filters.dateFormat(timestamp / 1000, format);
        }
        return date_format_str
    },
    getFormatFastTime(timestamp) {
        let date_str = filters.getFormatTime(timestamp);
        if (date_str.indexOf(' ') != -1) {
            date_str = date_str.replace(' ', '\n');
        }
        return date_str;
    },
    getFormatMoment(timestamp) {
        var minute = 1000 * 60;
        var hour = minute * 60;
        var now = new Date().getTime();
        var diffValue = now - timestamp;
        if (diffValue < minute) { return $t('刚刚'); }
        var hourC = diffValue / hour;
        var minC = diffValue / minute;
        var result = '';
        if (hourC >= 1 && hourC < 24) {
            result = "" + parseInt(hourC) + $t("小时前");
        } else if (minC >= 1 && minC < 60) {
            result = "" + parseInt(minC) + $t("分钟前");
        } else
            result = filters.dateFormat(timestamp / 1000, 'MM-dd hh:mm');;
        return result;
    },
    fixNumber(number, num = 2) {
        if (Math.abs(number) < 0.0001) {
            return number;
        }
        number = number || 0;
        let result = new Number(number).toFixed(num);
        result = parseFloat(result);
        return result;
    },
    fixNumberUnit(number = 0) {
        let result = 0;
        if (number >= 1000) {
            result = filters.fixNumber(number/1000) + 'k';
        }
        if (number >= 10000) {
            result = filters.fixNumber(number/10000) + $t('万');
        }
        if (number >= 100000000) {
            result = filters.fixNumber(number/100000000) + $t('亿');
        }
        return result;
    },
    getQuality(type) {
        if (type === 'superior') {
            return $t('精选')
        }
        if (type === 'primer') {
            return $t('入门')
        }
    },
    getOrderName(order, value) {
        if (order === 'rank') {
            return $t('流通市值排名')
        }
        if (order === 'publish_count_rank') {
            return $t('交易所数量排名')
        }
        if (order === 'well_know_count') {
            return $t('知名交易所数量')
        }
        if (order === 'publish_date') {
            return $t('发行日期')
        }
        if (order === 'is_star_team') {
            return $t('明星团队')
        }
        if (order === 'conceptual_plate') {
            return $t('概念板块')
        }
        if (order === 'media_attention_sum_count_rank') {
            return $t('媒体关注度排名')
        }
        if (order === 'polocy_profitable') {
            return $t('近期政策利好')
        }
        if (order === 'github_stars_sum_count_rank') {
            return $t('开源代码热度排名')
        }
        if (order === 'volume_usd_24h_rank') {
            return $t('24小时交易量排名')
        }
        if (order === 'percent_change_24h_rank') {
            return $t('24小时涨幅值')
        }
        if (order === 'price_max') {
            if (value === $t('价格创近7天新高')) {
                return $t('7天新高')
            }
            if (value === $t('价格创近30天新高')) {
                return $t('30天新高')
            }
        }
        if (order === 'fall_back') {
            return $t('止跌回升')
        }
        if (order === 'attack') {
            return $t('放量上攻')
        }
        if (order === 'price_cny_rank') {
            return $t('价格排名')
        }
        if (order === 'average_price_precent_rank') {
            return $t('现价/众筹均价比')
        }

    },
    getTrueAndFalse(num) {
        if (num === 1) {
            return $t('是')
        }
        if (num === 0) {
            return $t('否')
        }
    },
    getPosAndNeg(type) {
        if (type === 'pos') {
            return $t('利好')
        }
        if (type === 'neg') {
            return $t('利空')
        }
    },
    getMediaHot(type) {
        if (type === 'high') {
            return $t('高')
        }
        if (type === 'mid') {
            return $t('中')
        }
        if (type === 'low') {
            return $t('低')
        }
    },
    getruleState(state) {
        if (state === 'sended') {
            return {
                text: $t('已通知-再编辑可生效'),
                class_name: 'sended'
            }
        }
        if (state === 'expired') {
            return {
                text: $t('套餐过期-点我续期'),
                class_name: 'expired'
            }
        }
        if (state === 'saved') {
            return {
                text: $t('已保存-请开通套餐激活'),
                class_name: 'saved'
            }
        }
        if (state === 'stating') {
            return {
                text: $t('监控中'),
                class_name: 'stating'
            }
        }
        if (state === 'local') {
            return {
                text: $t('已保存-点我登录激活'),
                class_name: 'local'
            }
        }
    },
    //剪切字符串 以省略号的形式展示 str=放入的字符串 len=限定要显示的字数 
    cutString(str, len) {
        //length属性读出来的汉字长度为1 
        if (str.length * 2 <= len) {
            return str;
        }
        var strlen = 0;
        var s = "";
        for (var i = 0; i < str.length; i++) {
            s = s + str.charAt(i);
            if (str.charCodeAt(i) > 128) {
                strlen = strlen + 2;
                if (strlen >= len) {
                    return s.substring(0, s.length - 1) + "...";
                }
            } else {
                strlen = strlen + 1;
                if (strlen >= len) {
                    return s.substring(0, s.length - 2) + "...";
                }
            }
        }
        return s;
    },
    isChinese(temp) {
        let pattern = new RegExp("[\u4E00-\u9FA5]+");
        if (pattern.test(temp)) {
            return true;
        } else {
            return false;
        }
    },
    lessnowTime(obj) {
        var time = new Date().getTime();
        if (obj <= time) {
            return true;
        } else {
            return
        }
    },
    fixLittleNumber(number) {
        if (Math.abs(number) < 1) {
            number = numeral(number).format('0.00[00000000]');
        } else if (Math.abs(number) < 10) {
            number = numeral(number).format('0.00[00]');
        } else {
            number = numeral(number).format('0.00');
        }
        return numeral(number).value();
    },
    // 得到倒计时的函数
    countDown(times) {
        var timer = null;
        timer = setInterval(function() {
            var day = 0,
                hour = 0,
                minute = 0,
                second = 0; //时间默认值
            if (times > 0) {
                day = Math.floor(times / (60 * 60 * 24));
                hour = Math.floor(times / (60 * 60)) - (day * 24);
                minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (day <= 9) day = '0' + day;
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            //
            console.log(day + $t("天") + ':' + hour + $t("小时") + ':' + minute + $t("分钟") + ':' + second + $t("秒"));
            times--;
        }, 1000);
        if (times <= 0) {
            clearInterval(timer);
        }
    },
    // 16进制颜色转成rgb颜色值
    colorRgb(colorHex, opacity) {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        let sColor = colorHex.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                let sColorNew = "#";
                for (let i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            let sColorChange = [];
            for (let i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return "rgba(" + sColorChange.join(",") + "," + opacity + ")";
        } else {
            return sColor;
        }
    }
}
export default filters;
