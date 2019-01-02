<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="!is_code_login ? $t('密码登录') : $t('验证码登录')" :rightWidth="language === 'zh-CN' ? '130px' : '200px'">
                <text slot="right" class="" style="font-size: 32px; font-weight:bold;" @click="goRegister">{{ $t('注册') }}</text>
            </wxc-minibar>
            <div class="box_bd">
                <div class="input_box">
                    <input placeholder-color="#f1c983" type="text" class="input phone" :placeholder="$t('请输入手机号')" :autofocus="false" v-model="phone" ref="input_dom" />
                </div>
                <div class="input_box" v-if="!is_code_login">
                    <input placeholder-color="#f1c983" type="password" class="input password" :placeholder="$t('请输入密码')" :autofocus="false" v-model="password" />
                </div>
                <div class="phone_code" v-if="is_code_login">
                    <div class="input_box input_code">
                        <input placeholder-color="#f1c983" type="text" class="input_code" :placeholder="$t('手机验证码')" v-model="code" />
                    </div>
                    <div :class="['btn_code', show_countdown && 'disable_btn']" @click="getPhoneCode">
                        <text class="btn_text" v-if="!show_countdown">{{get_code_text}}</text>
                        <wxc-countdown v-if="show_countdown" tpl="{s}S" :timeBoxStyle="{backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '30px', color: '#fff'}" :dotTextStyle="{color: '#fff', fontSize: '30px', fontWeight: 'normal'}" :dotBoxStyle="{width: '30px'}" :style="{justifyContent: 'center'}" :time="countdown_time" @wxcOnComplete="onCompletedTwo">
                        </wxc-countdown>
                    </div>
                </div>
                <wxc-button class="confirm" :text="$t('登录')" @wxcButtonClicked="getUserLogin"></wxc-button>
                <div class="less_row tips_box">
                    <text class="text tips_left" @click="showLoginDialog">{{ $t('登录遇到问题') }}</text>
                    <text class="text tips_right" @click="toggleLogin">{{ is_code_login ? $t('密码登录') : $t('验证码登录')}}</text>
                </div>
            </div>
            <div class="box_ft">
                <div class="login_other" v-if="!this.hideModule['loginWechat']">
                    <div class="less_center less_middle other_title">
                        <text class="title_line"></text>
                        <text class="text title_text">{{ $t('使用第三方登录') }}</text>
                        <text class="title_line"></text>
                    </div>
                    <div class="less_center other_list">
                        <div class="other_item wechat_icon" @click="loginFromWechat">
                            <image class="wechat_icon" :src="wechat_icon"></image>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Dialog title="" :show="show_dialog_login" :confirmText="$t('取消')" mainBtnColor="#f5593f" :single="true" @wxcDialogConfirmBtnClicked="closeLoginDialog">
            <div slot>
                <div class="dialog_item" @click="jumpForgetPassword">
                    <text class="text item_text">{{ $t('忘记密码') }}</text>
                </div>
                <div class="dialog_item" @click="jumpLoginQA">
                    <text class="text item_text">{{ $t('手机号收不到验证码') }}</text>
                </div>
                <div class="dialog_item" @click="closeLoginDialog">
                    <text class="text item_text cancel_text">{{ $t('取消') }}</text>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import { wxcButton, WxcCountdown } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Dialog from '../components/Dialog.vue'
import { API_BaseUrl } from '../config/config.js'
import common from '../config/common'
const bmWXShare = weex.requireModule('bmWXShare')

export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        WxcCountdown,
        Dialog,
    },
    data() {
        return {
            phone: '',
            password: '',
            code: '',
            wechat_icon: `bmlocal://assets/images/wechat_icon.png`,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            show_dialog_login: false,
            is_code_login: false,
            show_countdown: false,
            countdown_time: new Date().getTime() + 6000 * 10,
            get_code_text: this.$t('获取验证码'),
            side_code: {},
        };
    },
    beforeCreate: function() {

    },
    created() {
        this.init();
    },
    eros: {
        beforeDisappear() {
            this.$event.emit('m-setData', { is_on_login_page: false });
        },
        beforeBackAppear(params) {
            params.name === 'login_qa' ? this.is_code_login = false : this.is_code_login = this.is_code_login;
        }
    },
    methods: {
        init() {
            common.initUM();
            common.initWX();
        },
        showLoginDialog() {
            this.$refs['input_dom'].blur();
            this.show_dialog_login = true;
        },
        closeLoginDialog() {
            this.show_dialog_login = false;
        },
        isPhoneValid(string) {
            return common.isPhoneValid(string);
        },
        goRegister() {
            this.$router.open({
                name: 'ReceiveBzh',
                type: 'PUSH',
                params: {
                    name: 'register'
                }
            })
        },
        toggleLogin() {
            this.password = '';
            this.code = '';
            this.is_code_login = !this.is_code_login;
        },
        jumpForgetPassword() {
            this.$router.open({
                name: 'ForgetPassword',
                params: {}
            })
            this.closeLoginDialog();
        },
        jumpLoginQA() {
            this.$router.open({
                name: 'LoginQA',
                params: {}
            })
            this.closeLoginDialog();
        },
        getUserLogin() {
            let params = {};
            if (!this.isPhoneValid(this.phone)) {
                this.$notice.toast({ message: this.$t('请输入正确的手机号') })
                return;
            }
            if (this.is_code_login) {
                if (!this.code) {
                    this.$notice.toast({ message: this.$t('请输入验证码') });
                    return;
                }
                params.code = this.code;
            } else {
                if (!this.password) {
                    this.$notice.toast({ message: this.$t('请输入密码') });
                    return;
                }
                params.password = this.password;
            }
            params.phone = this.phone;
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUserLogin',
                method: 'POST',
                data: {
                    rsa_form: common.rsaEncrypt(params),
                    device_id: weex.config.eros.deviceId,
                    device_name: weex.config.eros.sysModel
                }
            }).then(async resData => {
                if (resData.error === 0) {
                    resData.result.is_login = true;
                    this.setUserInfoToStorage(resData);
                } else {
                    this.$notice.loading.hide()
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
            }).catch((e) => {
                console.log(e.message);
                // this.$notice.toast({ message: this.$t('登陆失败，请稍后再试试！') });
                this.$notice.loading.hide();
            });
        },
        loginFromWechat() {
            let isInstall_wechat = bmWXShare.isInstallWXApp();
            if (!isInstall_wechat) {
                this.$notice.toast({ message: '未安装该应用' });
                return;
            }
            bmWXShare.authLogin((resData) => {
                // 授权结果，成功的话会将所有的userInfo返回
                if (resData.status === 0) {
                    this.postAuthLoginWeixin(resData.data);
                }
            });
        },
        postAuthLoginWeixin(weixin_info) {
            let params = {};
            params.accessToken = weixin_info.accessToken;
            params.openid = weixin_info.openid;
            params.originalResponse = weixin_info.originalResponse;
            this.$notice.loading.show();
            this.$fetch({
                name: 'postAuthLoginWeixin',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    if (resData.code === 100) {
                        this.$router.open({
                            name: 'ReceiveBzh',
                            type: 'PUSH',
                            params: {
                                name: 'weixin_register',
                                openid: params.openid,
                                accessToken: params.accessToken,
                            }
                        })
                    } else {
                        resData.result.is_login = true;
                        this.setUserInfoToStorage(resData);
                    }

                } else {
                    this.$notice.loading.hide()
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        getPhoneCode() {
            if (!this.isPhoneValid(this.phone)) {
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
        getUserPhoneCode() {
            let params = {};
            params.phone = this.phone;
            params.ticket = this.side_code.ticket;
            params.randstr = this.side_code.randstr;
            params.type = 't1';
            params.code_type = 'login';
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
        reloadImageCodeWeb() {
            this.get_code_text = this.$t('重新获取');
            this.side_code = {};
        },
        onCompletedTwo() {
            this.get_code_text = this.$t('重新获取');
            this.show_countdown = false;
        },
        async setUserInfoToStorage(resData) {
            this.$storage.setSync('user_token', resData.result.token);
            this.$storage.setSync('user_info', resData.result);
            await common.initPush(resData.result.token);
            this.$notice.toast({ message: this.$t('登录成功') });
            this.$notice.loading.hide()
            this.$router.back();
        },
    },
    computed: {
        language() {
            return this.$storage.getSync('language');
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

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
    margin-top: 20px;
}

.input_box {
    width: 650px;
    height: 90px;
    margin-top: 25px;
    border-bottom-color: rgba(0, 0, 0, .1);
    border-bottom-style: solid;
    border-bottom-width: 1px;
}

.input {
    width: 650px;
    height: 90px;
}

.phone {}

.password {}

.confirm {
    margin-top: 60px;
    width: 650px;
    background-color: #f7b237;
    border-radius: 80px;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}
.phone_code {
    margin-top: 40px;
    width: 650px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.input_code {
    flex: 1;
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
.tips_box {
    width: 620px;
    height: 80px;
}

.tips_left {
    flex: 1;
    line-height: 80px;
    text-align: left;
}

.tips_right {
    flex: 1;
    line-height: 80px;
    text-align: right;
}

.dialog_item {
    padding: 30px 0;
    border-bottom-width: 1px;
    border-bottom-color: #e7eaf1;
}

.item_text {
    text-align: center;
}

.cancel_text {
    color: #f5593f;
}

.title_line {
    width: 166px;
    height: 1px;
    background-color: #8d8d8d;
}

.title_text {
    padding: 0 15px;
}

.login_other {
    margin-top: 380px;
}
.other_list {
    margin-top: 70px;
}
.wechat_icon {
    width: 74px;
    height: 74px;
    border-radius: 50%;
}

</style>