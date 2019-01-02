import Widget from 'eros-widget'
import apis from './apis'
import routes from './routes'
import { API_BaseUrl, CHANNEL, language, PUBLISH_COUNTRY, CURRENCY, OPEN } from './config'
import common from './common'
import './push'
import t from '../../assets/lang';
import fixSymbol from './tools'
const modal = weex.requireModule('modal');
const storage = weex.requireModule('bmStorage');
const bmEvents = weex.requireModule('bmEvents');
const bmRouter = weex.requireModule('bmRouter');
const bmTool = weex.requireModule('bmTool')
var axios = weex.requireModule('bmAxios')
let is_on_login_page = false;
let is_network_toasting = {
    NOT_REACHABLE: false,
    timeout: false,
    error: false,
};

// 语言-国际化
const getLocale = storage.getDataSync('language').data;
let locale = getLocale ? JSON.parse(getLocale) : language; // en 英文，zh-CN 中文 ind 印尼语

const getCurrency = storage.getDataSync('currency').data;
let _currency = getCurrency ? JSON.parse(getCurrency) : CURRENCY;

const getOpen = storage.getDataSync('open').data;
let _open = getOpen ? JSON.parse(getOpen) : OPEN;
// console.log('xxxxxxxxxxxxx')
// const i18n = new locals({locale})
// Vue.use(i18n);
Vue.prototype.$t = (x) => {
    return t(x, locale)
}
Vue.prototype.$locale = () => {
    return locale
}
Vue.prototype.$fixSymbol = (x, lang = locale) => {
    return fixSymbol(x, lang)
}
Vue.prototype.$publish_country = PUBLISH_COUNTRY;

new Widget({
    router: {
        /**
         * 路由配置表
         */
        routes
    },
    ajax: {
        baseUrl: API_BaseUrl,
        /**
         * 接口别名
         */
        apis,
        // 接口超时时间
        timeout: 30000,

        /**
         * 请求发送统一拦截器 （可选）
         * options 你请求传入的所有参数和配置
         * next
         */
        requestHandler(options, next) {
            // modal.toast({ message: options, duration: 3 })
            try {
                let _locale = locale;
                let _country = PUBLISH_COUNTRY;
                let platform = String(weex.config.env.platform).toLowerCase();
                let versioncode = weex.config.env.appVersion;
                let user_token = storage.getDataSync('user_token').data;
                options.header = options.header || {};
                if (user_token) {
                    user_token = JSON.parse(user_token);
                    options.header.Cookie = `token=${user_token}; platform=${platform}; versioncode=${versioncode}; _locale=${_locale}; _country=${_country}; channel=${CHANNEL}; _currency=${_currency.currency_code}; _open=${_open.open_code}`;
                }
                options.data = options.data || {};
                options.data.versioncode = versioncode;
                options.data.sys_os = platform;
                options.data.channel = CHANNEL;
                options.data._locale = _locale;
                options.data._country = _country;
                options.data._currency = _currency.currency_code;
                options.data._open = _open.open_code;
                options.data._t = Date.now();
                let sign = common.calculateParamsSign(options.data);
                options.header['X-S'] = sign;
            } catch (error) {
                console.log('requestHandler', error);
            }
            next();
        },
        /**
         * 请求返回统一拦截器 （可选）
         * options 你请求传入的所有参数和配置
         * resData 服务器端返回的所有数据
         * resolve 请求成功请resolve你得结果，这样请求的.then中的成功回调就能拿到你resolve的数据
         * reject 请求成功请resolve你得结果，这样请求的.then中的失败回调就能拿到你reject的数据
         */
        responseHandler(options, resData, resolve, reject) {
            common.saveAppApiStat(options, resData)

            const { status, errorMsg, data } = resData
            if (status !== 200) {
                console.log(`invoke error status: ${status}`)
                console.log(`invoke error message: ${errorMsg}`)
                const networkStatus = bmTool.networkStatus();
                if (networkStatus === 'NOT_REACHABLE') {
                    !is_network_toasting.NOT_REACHABLE && modal.toast({ message: t('网络中断，请检查你的网络连接', locale), duration: 3 });
                    is_network_toasting.NOT_REACHABLE = true;
                } else {
                    if (status === 9) {
                        !is_network_toasting.timeout && modal.toast({ message:  t(`连接超时，请稍后重试`, locale), duration: 3 });
                        is_network_toasting.timeout = true;
                    } else {
                        !is_network_toasting.error && modal.toast({ message: t('出错了，状态码：', locale) + status, duration: 3 });
                        is_network_toasting.error = true;
                    }
                }
                reject(resData)
            } else {
                // 需要登录的接口，自动跳转至登录页面
                if (data.error === 1) {
                    // storage.removeDataSync(); // 退出登录后清除用户数据
                    // bmEvents.emit('LoginOut')
                    if (!is_on_login_page) {
                        is_on_login_page = true;
                        bmRouter.open({
                            url: '/pages/Login.js', // 页面对应的 js 地址(注意路径从 /pages/ 开始)
                            type: 'PUSH',
                            params: {}, // 传到下一个页面的参数，params 通过 router.getParams(callback) 获取 
                            navShow: false, // 是否显示原生导航栏
                            isRunBackCallback: false
                        }, function() {});
                        setTimeout(() => {
                            is_on_login_page = false;
                        }, 3000)
                    }
                }
                // 自定义请求逻辑
                resolve(data)
            }
        }
    }
})

