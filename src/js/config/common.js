const bmPush = weex.requireModule('bmPush')
const storage = weex.requireModule('bmStorage');
const axios = weex.requireModule('bmAxios');
const modal = weex.requireModule('modal')
const bmWXShare = weex.requireModule('bmWXShare')
const globalEvent = weex.requireModule('globalEvent')
const bmRouter = weex.requireModule('bmRouter');
const bmUMAnalytics = weex.requireModule('bmUMAnalytics');
const bmBundleUpdate = weex.requireModule('bmBundleUpdate')
const GoalKeeper = weex.requireModule('GoalKeeper');
const bmTool = weex.requireModule('bmTool')
const tencentCaptcha = weex.requireModule('tencentCaptcha');


import _ from 'lodash'
import MD5 from 'blueimp-md5'
import { API_BaseUrl, UM_KEY, CHANNEL, bundleUpdate, APP_NAME, GETUI, TENCENT_CAPTCHA, PUBLICKEY, CURRENCY } from './config'
import apis from './apis'
import JSEncrypt from './jsencrypt-weex.js'

const getCurrency = storage.getDataSync('currency').data;
let _currency = getCurrency ? JSON.parse(getCurrency) : CURRENCY;

export default {
    StorageKey: {
        task_dialogs: 'task_dialogs',
    },
    rsaEncrypt (obj) {
        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(PUBLICKEY)
        return encrypt.encrypt(JSON.stringify(obj))
    },
    showCaptcha(callback) {
        let platform = weex.config.env.platform;
        if (platform === 'iOS') {
            tencentCaptcha.showCaptcha(TENCENT_CAPTCHA.IOS.APP_ID, callback);
        } else {
            // android
            tencentCaptcha.showCaptcha(TENCENT_CAPTCHA.ANDROID.APP_ID, callback);
        }
    },
    getPushCid() {
        return new Promise((resolve, reject) => {
            bmPush.getCid(result => {
                resolve(result);
            })
        })
    },
    initPush(user_token) {
        return new Promise((resolve, reject) => {
            if (!user_token) {
                user_token = storage.getDataSync('user_token').data;
                user_token = user_token ? JSON.parse(user_token) : '';
                if (!user_token) {
                    resolve();
                    return;
                }
            }
            console.log('initPush');
            bmPush.initPush({
                appId: GETUI.AppID,
                appKey: GETUI.AppKey,
                appSecret: GETUI.AppSecret
            });
            setTimeout(() => {
                bmPush.getCid(result => {
                    console.log('getCid', result)
                    if (!result || !result.data || !result.data.cid) {
                        resolve();
                        return;
                    }
                    axios.fetch({
                        url: `${API_BaseUrl}/api/user_config/notice`,
                        name: 'putUserConfigNotice',
                        method: 'PUT',
                        data: { device: { cid: result.data.cid, os: weex.config.env.platform, type: 'getui', device_name: result.data.manufacturer || weex.config.eros.sysModel } },
                        header: { Cookie: `token=${user_token}` }
                    }, (resData) => {
                        console.log('put cid success:', result.data.cid);
                        resolve();
                    });
                });
            }, 2000)

        })
    },
    initUM() {
        return new Promise((resolve, reject) => {
            let platform = weex.config.env.platform;
            if (platform === 'iOS') {
                bmWXShare.initUM(UM_KEY.iOS);
            } else {
                // android
                bmWXShare.initUMShare(UM_KEY.ANDROID, CHANNEL);
            }
            resolve();
        })
    },
    initUMAppStat() {
        return new Promise((resolve, reject) => {
            let platform = weex.config.env.platform;
            if (platform === 'iOS') {
                bmUMAnalytics.initUM(UM_KEY_iOS);
            } else {
                // android
                bmUMAnalytics.initUMStat(UM_KEY.ANDROID, CHANNEL);
                // modal.toast({ message: 'umeng: ' + platform + UM_KEY.ANDROID + CHANNEL, duration: 3 })
            }
            resolve();
        })
    },
    // 初始化微信
    initWX() {
        return new Promise((resolve, reject) => {
            bmWXShare.initWX({
                appKey: 'wx3d87b0a1c9f9c3ba', // 微信开发平台申请的appkey
                appSecret: '6e726d1ecb95606888d234d768b00af8', // appKey对应的appSecret，
                redirectURL: '' // 授权回调页面
            })
            resolve();
        })
    },
    // 初始化新浪微博
    initWeibo() {
        return new Promise((resolve, reject) => {
            bmWXShare.initWX({
                Platform: 'sinaWeibo',
                appKey: '3392723904', // 微信开发平台申请的appkey
                appSecret: '6da8ffda90c134202d5d235feb084148', // appKey对应的appSecret，
                redirectURL: '' // 授权回调页面
            })
            resolve();
        })
    },
    // 初始化Twitter
    initTwitter() {
        return new Promise((resolve, reject) => {
            bmWXShare.initWX({
                Platform: 'Twitter',
                appKey: '3392723904', // 微信开发平台申请的appkey
                appSecret: '6da8ffda90c134202d5d235feb084148', // appKey对应的appSecret，
                redirectURL: '' // 授权回调页面
            })
            resolve();
        })
    },
    // 获取防刷需要的权限
    initGoalKeeperPermission() {
        if (GoalKeeper && GoalKeeper.jsRequestPermission) {
            return new Promise((resolve, reject) => {
                GoalKeeper.jsRequestPermission((res) => {
                    resolve(res);
                });
            })
        }
    },
    initDbBackExit(unback_exit, toast_tips) {
        let curHomeBackTriggerTimes = 0;
        let maxHomeBackTriggerTimes = 2;
        globalEvent.addEventListener('homeBack', options => {
            if (unback_exit) {
                bmRouter.finish();
                return;
            }
            curHomeBackTriggerTimes++;
            if (curHomeBackTriggerTimes == 1) {
                modal.toast({ message: toast_tips || `再按一次退出程序` })
            }
            if (curHomeBackTriggerTimes === maxHomeBackTriggerTimes) {
                bmRouter.finish()
            }
            setTimeout(() => {
                curHomeBackTriggerTimes--;
            }, 800);
        })
    },
    calculateParamsSign(params) {
        let key_value_arr = [];
        for (let key in params) {
            if (key === '_s') {
                continue;
            }
            key_value_arr.push({ key, value: params[key] })
        }
        let sorted_key_value_arr = _.sortBy(key_value_arr, 'key');
        let concat_str = sorted_key_value_arr.map(i => {
            return String(i.value === undefined ? '' : i.value);
        }).join('');
        let sign = MD5(concat_str);
        return sign;
    },
    initHotUpdate() {
        bmBundleUpdate.getJsVersion(version => {
            // 直接返回版本号，如果取不到会返回空的字符串
            axios.fetch({
                url: bundleUpdate,
                method: 'GET',
                data: {
                    jsVersion: version,
                    appName: APP_NAME,
                    isDiff: 0,
                    [weex.config.env.platform]: weex.config.env.appVersion,
                    customBundleUpdate: 1,
                },
            }, (resData) => {
                if (resData.data.resCode === 0) {
                    console.log('initHotUpdate start', resData.data.data.path, resData.data.data.diff, '');
                    // 包下载的地址
                    bmBundleUpdate.download({
                        path: resData.data.data.path, // jsbundle zip包下载地址
                        diff: resData.data.data.diff // 是否下载差分包
                    }, resData => {
                        console.log('initHotUpdate resData2', resData);
                        bmBundleUpdate.update();
                    })
                }
            });
        });
    },
    addUmengClickEvent(event_name) {
        // 友盟统计-自定义事件计数
        if (bmUMAnalytics.event) {
            bmUMAnalytics.event(event_name);
        }
    },
    isPhoneValid(string) {
        if (!string.length) {
            return false
        } else {
            return true
        }
        // return /^1\d{10}$/.test(string);
    },
    getApiStatPerNum() {
        axios.fetch({
            url: API_BaseUrl + '/api/app_api_stat_per',
            method: 'GET'
        }, function(res) {
            if (res.status === 200 && res.data && res.data.hasOwnProperty('perNum')) {
                const num = res.data.perNum + ''
                storage.setDataSync('apiInfoPerNum', num)
            } else {
                storage.setDataSync('apiInfoPerNum', '0')
            }
        })
    },

    saveAppApiStat(options, resData) {
        const perNum = +storage.getDataSync('apiInfoPerNum').data || 0
        if (!perNum) return
        try {
            const apiInfo = JSON.parse(storage.getDataSync('apiInfo').data) || {}

            if (!apiInfo.data) { // 不存在就建立新数组
                storage.setDataSync('apiInfo', {
                    deviceId: weex.config.env.deviceId,
                    data: []
                })
            }
            // 将请求信息写入数组
            const _options = JSON.parse(JSON.stringify(options))
            delete _options.data
            delete _options.name
            _options.url = _options.url ?
                _options.url.replace(API_BaseUrl, '') :
                apis[options.name]
            _options.params = options.data
            _options.method = _options.method || options.methods
            if (_options.methods) delete _options.methods
            apiInfo.data.push(Object.assign({}, _options, {
                status: resData.status,
                serverDate: resData.header.date[0],
                _resDate: Date.now(),
                networkStatus: bmTool.networkStatus(),
                api_time: +resData.header['api-time'][0]
            }))
            storage.setDataSync('apiInfo', {
                deviceId: weex.config.env.deviceId,
                data: apiInfo.data
            })
            // 判断数组长度
            if (apiInfo.data.length >= perNum) { // 请求数据超过 n 个就发送
                storage.setDataSync('apiInfo', {
                    deviceId: weex.config.env.deviceId,
                    data: []
                })
                axios.fetch({
                    url: API_BaseUrl + '/api/app_api_stat',
                    method: 'POST',
                    data: apiInfo
                }, function() {})
            }
        } catch (e) {
            storage.setDataSync('apiInfo', {
                deviceId: weex.config.env.deviceId,
                data: []
            })
        }
    },
    storageSetData(name, datas, ms=5 * 60 * 1000) { //数据缓存 过期时间的判断 传递毫秒数
        let storage_name = _currency.currency_code + "_" + name;
        storage.setDataSync(storage_name, {
            data: datas,
            expired: Date.now() + ms
        });
    },
    storageGetData(name, always_save) { // 默认不永久缓存 always_save = false
        let storage_name = _currency.currency_code + "_" + name;
        let data = storage.getDataSync(storage_name).data || '';
        if(!data) return false;
        data = JSON.parse(data);
        if(always_save) return data.data;
        if(Date.now() < data.expired) return data.data;
        return false;
    },
}
