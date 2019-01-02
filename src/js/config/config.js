const {currency} = require('./language');

const test = process.env.NODE_ENV === 'prodtest';
const prerelease = process.env.NODE_ENV === 'prerelease';
const debug = process.env.NODE_ENV === 'production' ? false : !test && !prerelease;
const prod = process.env.NODE_ENV === 'production';

const Bizhihui_Url = 'https://www.bizhihui.vip'; // 官网url

// 默认发行国家
// const PUBLISH_COUNTRY = 'CHN'; //  CHN 中国版
const PUBLISH_COUNTRY = 'IDN'; //  IDN 印尼版

// 默认语言
const LANGUAGE = 'ind'; // en 英文 zh-CN 中文 ind 印尼语
// const LANGUAGE = 'zh-CN'; // en 英文 zh-CN 中文 ind 印尼语

// 线上
const API_BaseUrl_Prod = 'https://appapi.bizhihui.info';
const API_BaseUrl_Prod_IDN = 'https://appapi.tokenwiz.vip';

const API_BaseUrl_Prerelease = 'http://prerelease.appapi.bizhihui.pro';
// 测试
const API_BaseUrl_Test = 'http://test.appapi.bizhihui.pro';
// 本地
const API_BaseUrl_Dev = 'http://10.0.0.10:8863';

// const API_BaseUrl = API_BaseUrl_Dev;
// const API_BaseUrl = API_BaseUrl_Test;
// const API_BaseUrl = API_BaseUrl_Prod;
// const API_BaseUrl = API_BaseUrl_Prod_IDN;
// const API_BaseUrl = API_BaseUrl_Prerelease;
const API_BaseUrl = debug ? API_BaseUrl_Dev : (test ? API_BaseUrl_Test : (prerelease ? API_BaseUrl_Prerelease : (PUBLISH_COUNTRY === 'CHN' ? API_BaseUrl_Prod : API_BaseUrl_Prod_IDN)));

// 糖果官网
const Token_Website = prod ? 'https://i.bizhihui.vip' : 'http://i.test.bizhihui.vip';

// 空投h5URL
const STATIC_SERVER = debug ? 'http://10.0.0.142:3000/static' : API_BaseUrl + '/static';

const CHANNEL = 'default';
// const CHANNEL = 'test';
// const CHANNEL = 'uc';
// const CHANNEL = 's360';
// const CHANNEL = 'xiaomi'; // 隐藏提币按钮
// const CHANNEL = 'baidu';
// const CHANNEL = 'huawei'; // 隐藏提币按钮
// const CHANNEL = 'sogou';
// const CHANNEL = 'lenovo'; // 联想
// const CHANNEL = 'vivo'; // 隐藏提币按钮
// const CHANNEL = 'oppo'; // 还没上，暂时不用打包

// const CHANNEL = 'gionee'; // 金立
// const CHANNEL = 'eoemarket'; // 优亿市场
// const CHANNEL = 'wostore'; // 沃商店
// const CHANNEL = 'anzhi'; // 安智市场
// const CHANNEL = 'mumayi'; // 木蚂蚁
// const CHANNEL = 'gfan'; // 机锋市场
// const CHANNEL = 'ChainStore'; // ChainStore
// const CHANNEL = 'biyongbao'; // 币用宝
// const CHANNEL = 'mofangbuluo'; // 币用宝


// const CHANNEL = 'yingyongbao';
// const CHANNEL = 'googleplay';
// const CHANNEL = 'googleplay-IDN';

// ios 渠道
// const CHANNEL = 'appstore';
// const CHANNEL = 'fir';
// const CHANNEL = 'pgyer';

// const CHANNEL = 'sms3k';
// const CHANNEL = 'sms6k';
// const CHANNEL = 'sms9k';

// 默认涨跌幅时间
const OPEN = {
    open_txt: '8点开盘',
    open_code: '8am',
};
// 默认价格换算
const CURRENCY = currency.currency_list[0];

const QINIU_CDN = 'https://ganlan-cdn.bizhihui.vip'; // ganlanCdn

const Iconfont = 'bmlocal://iconfont/fonts/icomoon.ttf';

const diff_proxy = QINIU_CDN + '/app/diff/ganlan_bc_app/'; // 热更新包下载接口
console.log('diff_proxy', diff_proxy);

const bundleUpdate = `${API_BaseUrl}/api/tools/app/check`; // 热更新检查接口
console.log('bundleUpdate', bundleUpdate);

const UM_KEY_I18N = {
    IDN: {
        ANDROID: '5bcac853f1f556107b0009a0', // 安卓 印尼版
        iOS: '5bcac92ab465f50f4c000715', // iOS 印尼版
    },
    CHN: {
        ANDROID: '5b20ee70f43e4869800000e4', // 安卓 国内版
        iOS: '5b20e1698f4a9d5efd000012', // iOS 国内版
    }
}
const UM_KEY = UM_KEY_I18N[PUBLISH_COUNTRY];
const GETUI_I18N = {
    IDN: {
        AppID: 'GmLlWY2gja5Blyuc495wL6',
        AppSecret: '3D1Y9hGsoq9BgF8Leqymw5',
        AppKey: 'uKXnd8YBUz9dZzwofeoJL6',
    },
    CHN: {
        AppID: 'kxGODFzsI28RCE8z0bAMD5',
        AppSecret: 'YebB9MoRJqAoL70MaT82J2',
        AppKey: 'HduFAPMhpr7tKenszXE0m5',
    }
}
const GETUI = GETUI_I18N[PUBLISH_COUNTRY];

const APP_NAME_I18N = {
    IDN: 'TokenWiz',
    CHN: 'ganlan_bc_app',
}
const APP_NAME = APP_NAME_I18N[PUBLISH_COUNTRY];

const TENCENT_CAPTCHA = {
    ANDROID: {
        APP_ID: '2012623632'
    },
    IOS: {
        APP_ID: '2073284510'
    }
}

const PUBLICKEY = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUKbHytB3P+YRCJyk++Cz1nmcw
lDuGMgLsNmTfOjODd11uE/CpA+9q2q9GZDdwLwzXCClYOEJc9Tmwylfp+oXRtIyh
/FlM91hJddjcuDcVQesiD5obLa9jM8lyYph5H8ZEAY7by9MK9Szp2cdBXHa/0HHV
8H067SuVZLHgXCkdUQIDAQAB`

module.exports.test = test;
module.exports.debug = debug;
module.exports.Bizhihui_Url = Bizhihui_Url;
module.exports.API_BaseUrl = API_BaseUrl;
module.exports.QINIU_CDN = QINIU_CDN;
module.exports.CHANNEL = CHANNEL;
module.exports.diff_proxy = diff_proxy;
module.exports.bundleUpdate = bundleUpdate;
module.exports.Iconfont = Iconfont;
module.exports.UM_KEY = UM_KEY;
module.exports.Token_Website = Token_Website;
module.exports.APP_NAME = APP_NAME;
module.exports.TENCENT_CAPTCHA = TENCENT_CAPTCHA;
module.exports.STATIC_SERVER = STATIC_SERVER;
module.exports.language = LANGUAGE;
module.exports.CURRENCY = CURRENCY;
module.exports.OPEN = OPEN;
module.exports.PUBLISH_COUNTRY = PUBLISH_COUNTRY;
module.exports.GETUI = GETUI;
module.exports.PUBLICKEY = PUBLICKEY
console.log(new Date().toLocaleString());
console.log(module.exports);
