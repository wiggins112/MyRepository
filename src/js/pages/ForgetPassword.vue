<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('修改密码')">
            </wxc-minibar>
            <div class="box_bd">
                <div class="phone">
                    <div class="input_box">
                        <input placeholder-color="#f1c983" type="text" class="input" :placeholder="$t('请输入手机号')" :autofocus="true" v-model="form.phone" ref="input_dom" />
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
                <div class="phone_code">
                    <div class="input_box">
                        <input placeholder-color="#f1c983" type="password" class="input" :placeholder="$t('设置新密码')" v-model="form.password" />
                    </div>
                </div>
            </div>
            <div class="box_ft">
                <wxc-button :class="['confirm']" :text="$t('完成')" @wxcButtonClicked="ReceivBzhClick"></wxc-button>
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
            form: {
                phone: '',
                code: '',
                password: '',
            },
            show_countdown: false,
            countdown_time: new Date().getTime() + 6000 * 10,
            router_params: {},
            API_BaseUrl: API_BaseUrl,
            show_captcha: true,
            side_code: {},
            get_code_text: this.$t('获取验证码'),
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
        init() {
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
        ReceivBzhClick() {
            this.putUserForgetPassword();
        },
        onCompletedTwo() {
            this.get_code_text = this.$t('重新获取');
            this.show_countdown = false;
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
                this.$refs['input_dom'].blur();
                if (this.get_code_text === this.$t('重新获取') && !this.side_code.ticket) {
                    this.reloadImageCodeWeb();
                }
                if (!this.side_code.ticket) {
                    this.showTencentCaptcha();
                }
            }
        },
        getUserPhoneCode() {
            let params = {};
            params.phone = this.form.phone;
            params.ticket = this.side_code.ticket;
            params.randstr = this.side_code.randstr;
            params.code_type = 'forget';
            params.type = 't1';
            if (!params.ticket) {
                this.$notice.toast({ message: this.$t('请先进行安全验证！') })
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                url: `${API_BaseUrl}/api/v2/user/${params.phone}/code`,
                method: 'GET',
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
        putUserForgetPassword() {
            let params = {};
            params.password = this.form.password;
            params.code = this.form.code;
            if (this.isPhoneValid(this.form.phone)) {
                params.phone = this.form.phone;
            } else {
                this.$notice.toast({ message: this.$t('请输入正确的手机号') })
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'putUserForgetPassword',
                method: 'PUT',
                data: {
                    rsa_form: common.rsaEncrypt(params)
                }
            }).then(async resData => {
                if (resData.error === 0) {
                    this.$notice.toast({ message: this.$t('修改成功！') });
                    setTimeout(() => {
                        this.$router.back();
                    }, 500)
                } else {
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
                this.$notice.loading.hide()

            }).catch((e) => {
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
    },
    computed: {
        is_form_register() {
            let name = this.router_params.name;
            let f = (name === 'register') ? true : false;
            return f;
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
    margin-top: 50px;
}

.phone {
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
