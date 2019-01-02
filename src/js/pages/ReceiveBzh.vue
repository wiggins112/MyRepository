<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="get_nav_title">
                <text slot="left" class="icon delete_icon" @click="minibarLeftButtonClick">&#xe91a;</text>
            </wxc-minibar>
            <div class="box_bd">
                <div class="bind_tips" v-if="router_params.name === 'weixin_register'">
                    <text class="text tips">{{ $t('*应《中华人民共和国网络安全法》要求我们将进一步强化实名制认证机制。')}}</text>
                    <text class="text tips">{{ $t('为全面体验产品服务，烦请您绑定手机号。') }}</text>
                </div>
                <div class="phone">
                    <div class="input_box">
                        <input placeholder-color="#f1c983" type="text" class="input" :placeholder="$t('请输入手机号')" :autofocus="true" v-model="form.phone" />
                    </div>
                </div>
                <div class="phone_code">
                    <div class="input_box">
                        <input placeholder-color="#f1c983" type="text" class="input input_code" :placeholder="$t('手机验证码')" v-model="form.code" />
                    </div>
                    <div :class="['btn_code', is_form_register && 'main_btn', show_countdown && 'disable_btn']" @click="getPhoneCode">
                        <text class="btn_text" v-if="!show_countdown">{{get_code_text}}</text>
                        <wxc-countdown v-if="show_countdown" tpl="{s}S" :timeBoxStyle="{backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '30px', color: '#fff'}" :dotTextStyle="{color: '#fff', fontSize: '30px', fontWeight: 'normal'}" :dotBoxStyle="{width: '30px'}" :style="{justifyContent: 'center'}" :time="countdown_time" @wxcOnComplete="onCompletedTwo">
                        </wxc-countdown>
                    </div>
                </div>
                <div class="invite">
                    <div class="less_row">
                        <text class="text">{{ $t('请在下方输入邀请码') }}</text>
                        <text class="icon text icon_text">&#xe936;</text>
                        <text class="text">{{ $t('(选填)') }}</text>
                    </div>
                    <input placeholder-color="#f1c983" type="text" class="invite_code" :placeholder="$t('请输入邀请码')" @input="oninput" />
                    <text class="tips">{{$t('*输入有效邀请码将获得1000BZH，')}}</text>
                    <div class="less_row">
                        <text class="tips tips_color">{{ $t('若无邀请码') }}</text>
                        <text class="tips">{{ $t('直接领取将获得') }}600BZH</text>
                    </div>
                </div>
            </div>
            <div class="box_ft">
                <wxc-button :class="['confirm', is_form_register && 'main_btn']" :text="$t('马上领取')" @wxcButtonClicked="ReceivBzhClick"></wxc-button>
            </div>
        </div>
    </div>
</template>
<script>
import { wxcButton, WxcCountdown } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import common from '../config/common'
const webview = weex.requireModule('webview');
const GoalKeeper = weex.requireModule('GoalKeeper');

export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        WxcCountdown,
    },
    data() {
        return {
            is_ios: String(weex.config.env.platform).toLowerCase() === 'ios' ? true : false,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            captcha_image: '',
            form: {
                phone: '',
                code: '',
                invite_code: '',
            },
            show_countdown: false,
            countdown_time: new Date().getTime() + 6000 * 10,
            router_params: {},
            API_BaseUrl: API_BaseUrl,
            show_captcha: true,
            side_code: {},
            get_code_text: this.$t('获取验证码'),
            goalKeeper_permission: {},
            goalKeeper_code: {},
            open_goalkeeper: {},
        };
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            // this.goalKeeper_permission = await common.initGoalKeeperPermission();
            // console.log('xxxxxxx', this.goalKeeper_permission);
            this.getConfig();
            this.getRouterParams();
            this.setCaptchaEvent();
        },
        isPhoneValid(string) {
            return common.isPhoneValid(string);
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            })
        },
        goRegister() {
            this.$router.toWebView({
                url: 'https://i.bizhihui.vip/register',
                title: '注册-币智慧',
                navShow: true
            })
        },
        minibarLeftButtonClick() {
            this.$router.back();
        },
        ReceivBzhClick() {
            this.postUser();
        },
        jumpSetPassword() {
            let params = {
                name: 'register',
                bzh: this.form.invite_code ? 1000 : 600
            };
            this.is_form_register ? params : params = {};
            this.$router.open({
                name: 'SetPassword',
                type: 'PUSH',
                params: params,
            })
        },
        jumpInvite(route_length) {
            this.$router.open({
                name: 'Invite',
                type: 'PUSH',
                canBack: false,
                gesBack: false,
                params: {route_length: route_length},
            })
        },
        onCompletedTwo() {
            this.get_code_text = this.$t('重新获取');
            this.show_countdown = false;
        },
        async postUser() {
            let params = {};
            if (!this.form.code) {
                this.$notice.toast({ message: this.$t('请输入验证码') })
                return;
            }
            params.phone = this.form.phone;
            params.code = this.form.code;
            params.ic = this.form.invite_code;
            params.device_id = weex.config.eros.deviceId;
            params.device_name = weex.config.eros.sysModel;
            params.from = 'app';
            params.regist_type = 'bind';
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUser',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    resData.result.is_login = true;
                    this.$storage.setSync('user_token', resData.result.token);
                    this.$storage.setSync('user_info', resData.result);
                    this.$notice.toast({ message: resData.message });
                    if (this.router_params.name === 'weixin_register') {
                        this.postAuthLoginWeixin();
                    }
                    await common.initPush(resData.result.token);
                    if (resData.code === 200) {
                        this.jumpSetPassword();
                    }
                    if (resData.code === 201) {
                        this.jumpInvite(2);
                    }

                } else {
                    this.form.code = '';
                    this.show_countdown = false;
                    this.reloadImageCodeWeb();
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                this.show_countdown = false;
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        showTencentCaptcha() {
            common.showCaptcha((result) => {
                if (result.ret === 0) {
                    this.side_code = result;
                    this.getUserPhoneCode();
                } else {
                    this.reloadImageCodeWeb();
                    this.$notice.toast({ message: this.$t('验证失败！') })
                }
            });
        },
        getPhoneCode() {
            if (!this.isPhoneValid(this.form.phone)) {
                this.$notice.toast({ message: this.$t('请输入正确的手机号！') })
                return;
            }
            if (!this.show_countdown) {
                if (this.get_code_text === this.$t('重新获取') && !this.side_code.ticket) {
                    this.reloadImageCodeWeb();
                }
                if (!this.side_code.ticket) {
                    // this.showTencentCaptcha();
                    if (this.is_ios) {
                        if (this.open_goalkeeper.ios) {
                            this.getJsCollectInfos();
                        } else {
                            this.showTencentCaptcha();
                        }
                    } else {
                        if (this.open_goalkeeper.android) {
                            this.getJsCollectInfos();
                        } else {
                            this.showTencentCaptcha();
                        }
                    }
                }
            }
        },
        getUserPhoneCode() {
            let params = {};
            params.phone = this.form.phone;
            params.anti_data = this.goalKeeper_code.result;
            params.ticket = this.side_code.ticket;
            params.randstr = this.side_code.randstr;
            params.type = 't1';
            params.code_type = 'regist';
            if (!params.ticket) {
                this.$notice.toast({ message: this.$t('请先进行安全验证！') })
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                url: `${API_BaseUrl}/api/v3/user/${params.phone}/code`,
                method: 'POST',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.side_code = {};
                    this.show_countdown = true;
                    this.countdown_time = new Date().getTime() + 6000 * 10;
                } else {
                    this.$notice.toast({ message: resData.message })
                    setTimeout(() => {
                        this.reloadImageCodeWeb();
                    }, 2000)
                }
                this.$notice.loading.hide();
            }).catch((e) => {
                setTimeout(() => {
                    this.reloadImageCodeWeb();
                }, 2000)
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        reloadImageCodeWeb() {
            // this.$notice.loading.show();
            // webview.reload(this.$refs.webview_image_code);
            this.show_captcha = false;
            this.get_code_text = this.$t('重新获取');
            this.side_code = {};
            setTimeout(() => {
                this.show_captcha = true;
            }, 200);
        },
        onPageFinish(e) {
            this.$notice.loading.hide();
        },
        onError(e) {
            this.$notice.loading.hide();
        },
        setCaptchaEvent() {
            this.$event.on('CaptchaEvent', params => {
                params = params || `{}`;
                let params_data = JSON.parse(params);
                this.side_code = params_data;
                console.log('CaptchaEvent', params_data);
            });
        },
        onCaptchaPageFinish() {

        },
        postAuthLoginWeixin() {
            let params = {};
            params.accessToken = this.router_params.accessToken;
            params.openid = this.router_params.openid;
            this.$notice.loading.show();
            this.$fetch({
                name: 'postAuthLoginWeixin',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        async getJsCollectInfos() {
            const permission = this.$storage.getSync('goalKeeper_permission');
            if (!permission) {
                this.goalKeeper_permission = await common.initGoalKeeperPermission();
                this.$storage.setSync('goalKeeper_permission', true);
                return;
            }
            let phone = this.form.phone || '';
            GoalKeeper.jsCollectInfos(phone, (res) => {
                this.goalKeeper_code = res || {};
                this.showTencentCaptcha();
            });
        },
        getConfig() {
            let params = {};
            params.type = 'app_config';
            params.key = 'goalkeeper';
            this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.open_goalkeeper = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                console.log(e.message)
            });
        },
        oninput(event) {
            this.form.invite_code = event.value;
        },
    },
    computed: {
        is_form_register() {
            let name = this.router_params.name;
            let f = (name === 'register') ? true : false;
            return f;
        },
        get_nav_title() {
            let name = this.router_params.name;
            let title = this.$t('注册');
            if (name === 'register') {
                title = this.$t('注册领取1000BZH');
            } else if (name === 'weixin_register') {
                title = this.$t('绑定手机号');
            } else {
                title = this.$t('领取1000BZH');
            }
            return title;
        },
        captcha_slider_url() {
            return `${API_BaseUrl}/api/user/captcha/slider`
        }

    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.icon {
    font-family: iconfont2;
}

.delete_icon {
    font-size: 40px;
}

.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
}

.box_bd {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.bind_tips {
    padding: 10px 0;
    width: 750px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #FFF9EE;
}
.phone {
    margin-top: 50px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 750px;
    padding-left: 60px;
    padding-right: 60px;
}

.phone_code {
    margin-top: 40px;
    padding-left: 60px;
    padding-right: 60px;
    width: 750px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.btn_code_image {
    width: 340px;
    height: 90px;
    position: relative;
}

.web_image_code {
    position: absolute;
    top: 0;
    left: 0;
    width: 340px;
    height: 90px;
}

.overlay_image_code {
    position: absolute;
    top: 0;
    left: 0;
    width: 340px;
    height: 90px;
    background-color: transparent;
}

.input_code {}

.input_box {
    flex: 1;
    border-bottom-color: rgba(0, 0, 0, .1);
    border-bottom-style: solid;
    border-bottom-width: 1px;
    flex-direction: column;
}
.border_none {
    border-bottom-color: transparent;
}
.input {
    width: 650px;
    height: 90px;
}

.invite {
    padding-top: 54px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.invite_title {
    flex-direction: row;
}
.invite_code {
    margin: 25px 0;
    padding: 0 15px;
    width: 360px;
    height: 88px;
    border-width: 3px;
    border-color: #f1c983;
    border-radius: 6px;
}

.password {}

.confirm {
    margin-top: 40px;
    width: 650px;
    border-radius: 80px;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

.main_btn {
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

.btn_code {
    width: 220px;
    padding: 22px 0;
    background-color: #2F83E5;
    border-radius: 80px;
    color: #fff;
    text-align: center;
    opacity: 1;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

.disable_btn {
    opacity: 0.8;
}

.btn_text {
    color: #fff;
    text-align: center;
    font-size: 30px;
}

.tips {
    font-size: 20px;
    color: #f1c983;
    line-height: 33px;
}
.tips_color {
    color: #fa9b5d;
}
.text {
    font-size: 24px;
}
.icon_text {
    font-size: 32px;
    color: #f1c983;
}
.box_ft {
    padding-top: 15px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.captcha_side {
    flex: 1;
    height: 105px;
}
</style>
