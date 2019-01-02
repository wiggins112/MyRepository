<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('设置登录密码')">
            </wxc-minibar>
            <div class="box_bd">
                <div class="input_box">
                    <input type="password" class="input password" :placeholder="$t('请输入密码')" :autofocus="true" v-model="password" />
                </div>
                <wxc-button :class="['confirm', is_form_register && 'main_btn']" :text="$t('完成')" @wxcButtonClicked="putUserPassword"></wxc-button>
            </div>
            <div class="box_ft">
            </div>
            <Dialog title="" :show="is_show_dialog" :cancelText="$t('跳过')" :confirmText="$t('去邀请')" mainBtnColor="#2F83E5" @wxcDialogCancelBtnClicked="closeDialog" @wxcDialogConfirmBtnClicked="confirm">
                <div slot="content">
                    <div class="correct_box" @click.stop="">
                        <div class="body">
                            <image class="succeed_icon" :src="succeed_icon"/>
                            <text class="succeed_text">{{ $t('您已成功领取') }} {{router_params.bzh}}BZH</text>
                            <text class="tips_text">{{ $t('邀请好友下载注册') }}</text>
                            <text class="tips_text">{{ $t('能获取更多BZH奖励哦！') }}</text>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    </div>
</template>
<script>
import { wxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Dialog from '../components/Dialog.vue'
import { API_BaseUrl } from '../config/config.js'
import common from '../config/common'


export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        Dialog
    },
    data() {
        return {
            succeed_icon: `bmlocal://assets/images/succeed_icon.png`,
            password: '',
            is_show_dialog: false,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            router_params: {},
        };
    },
    beforeCreate: function() {

    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            })
        },

        closeDialog() {
            this.is_show_dialog = false;
            this.$router.back({
                length: 2,
            });
        },
        confirm() {
            this.is_show_dialog = false;
            this.$router.open({
                name: 'Invite',
                type: 'PUSH',
                canBack: false,
                gesBack: false,
                params: {route_length: 3},
            })
        },
        putUserPassword() {
            let params = {};
            params.password = this.password;
            if (!params.password) {
                this.$notice.toast({ message: this.$t('请输入密码') });
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'putUserPassword',
                method: 'PUT',
                data: {
                    rsa_form: common.rsaEncrypt(params)
                }
            }).then(async resData => {
                if (resData.error === 0) {
                    if (!resData.redirect) { //没有登录后跳转的页面  展示现在弹框
                        this.is_show_dialog = true;
                    } else {
                        if (resData.redirect.type === 'app_page') {
                            this.$router.open({
                                name: resData.redirect.link,
                                params: resData.redirect.link_params,
                            })
                        } else if (resData.redirect.type === 'link' && resData.redirect.link_type === 'outlink') {
                            this.$router.openBrowser(resData.redirect.link);
                        } else {
                            this.$router.toWebView({
                                url: resData.redirect.link, // 页面 url
                                title: '', // 页面 title
                                navShow: true // 是否显示native端导航栏，默认是true
                            })
                        }
                    }


                } else {
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
                this.$notice.loading.hide();
            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },

    },
    computed: {
        is_form_register() {
            let name = this.router_params.name;
            let f = (name === 'register') ? true : false;
            return f;
        },
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
    margin-top: 50px;
}

.input_box {
    width: 650px;
    height: 90px;
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
    margin-top: 40px;
    width: 650px;
    background-color: #2F83E5;
    border-radius: 80px;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

.main_btn {
    background-color: @main_color;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

.body {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.succeed_icon {
    width: 176px;
    height: 176px;
    border-radius: 12px;
}

.succeed_text {
    padding-top: 22px;
    padding-bottom: 30px;
    font-size: 36px;
    color: #2F83E5;
    text-align: center;
}

.tips_text {
    line-height: 60px;
    font-size: 30px;
    text-align: center;
}

</style>
