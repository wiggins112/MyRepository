<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('提币')">
            </wxc-minibar>
            <div class="box_bd" :style="{height: page_height}">
                <div class="eth_url">
                    <div class="eth_name">
                        <text class="name_text">{{ $t('以太坊地址') }}</text>
                        <div class="btn_edit" v-if="!user_info.put_eth_url && (!show_eth_input)" @click="toggleEditEthURL">
                            <text class="edit_icon icon">{{'&#xe91e;'}}</text>
                            <text class="edit_text">{{$t('修改')}}</text>
                        </div>
                        <div class="btn_edit" v-if="!user_info.put_eth_url && show_eth_input">
                            <text class="edit_clear" @click="cancalEditEthURL">{{ $t('取消') }}</text>
                            <text class="edit_clear"> | </text>
                            <text class="edit_text" @click="toggleEditEthURL">{{ $t('保存') }}</text>
                        </div>
                    </div>
                    <div class="edit_box">
                        <text v-if="!show_eth_input" class="eth_url_text">{{form.eth_url}}</text>
                        <textarea v-if="show_eth_input" type="text" class="input eth_url_input"  :placeholder="$t('请输入以太坊地址')" :autofocus="true" v-model="form.eth_url"></textarea>
                        <text  v-if="show_eth_input" class="icon delete_icon" @click="clear_input">&#xe91a;</text>
                    </div>
                </div>
                <div class="pick_num">
                    <div class="eth_name">
                        <text class="name_text">{{ $t('提取数量') }}</text>
                    </div>
                    <div class="input_box">
                        <input class="input_bzh" ref="input_bzh" type="number" :placeholder="`共可提${form.bzh_total}`" :autofocus="false" v-model="form.bzh" @input="oninput" />
                        <div class="btn_box" @click="pickAll">
                            <text class="bzh_unit">{{form.symbol}}</text>
                            <text class="btn_pick_text">{{ $t('全部提取') }}</text>
                        </div>
                    </div>
                    <div class="tips_box" v-if="!router_params.airdrop_id">
                        <text class="tips_bzh">{{ $t('*一个自然月可提取一次，余下的BZH继续保留在平台内，保留在平台内的BZH越多，自动获得其他优质项目方空投币越多') }}</text>
                        <text class="tips_bzh">{{ $t('*提币需要实名认证') }}</text>
                    </div>
                    <div class="tips_box" v-if="router_params.airdrop_id">
                        <text class="tips_bzh">{{ $t('*一个自然月可提取一次，')}}</text>
                        <text class="tips_bzh">{{ $t('*提币需要实名认证') }}</text>
                    </div>
                </div>
                <wxc-button class="confirm" :text="$t('提取')" @wxcButtonClicked="confirmPickBzh"></wxc-button>
            </div>
            <div class="box_ft">
            </div>
            <Dialog title="" :content="$t('首次提币操作需要进行实名认证！')" :confirmText="$t('去认证')" :show="realname_dialog_show" @wxcDialogCancelBtnClicked="realnameDialogCancelClicked" @wxcDialogConfirmBtnClicked="realnameDialogConfirmClicked">
            </Dialog>
            <Dialog :title="$t('提取申请成功！')" titleColor="#F7B237" :content="$t('您提取的') + `${form.bzh}${form.symbol}` + $t('已经提交后台，提币到账时间约7个工作日，以太坊拥堵情况为准，到时请注意查收')" :show="succeed_dialog_show" @wxcDialogConfirmBtnClicked="succeedDialogConfirmClicked" :single="true">
            </Dialog>
            <Dialog :title="$t('手机验证')" :show="phone_dialog_show" @wxcDialogCancelBtnClicked="closepopupPhone" @wxcDialogConfirmBtnClicked="confirmpopupPhone">
                <div slot="content" class="picker_content">
                    <div class="popup_box_bd">
                        <text class="popup_phone_num">{{ $t('注册手机号') }}：{{user_info.phone}}</text>
                        <div class="popup_input">
                            <input type="text" :placeholder="$t('请输入验证码')" class="input_name" v-model="form.code" />
                            <div class="popup_edit_box">
                                <div :class="['btn_code', show_countdown && 'disable_btn']" @click="getPhoneCode">
                                    <text class="btn_text" v-if="!show_countdown">{{ $t('获取验证码') }}</text>
                                    <wxc-countdown v-if="show_countdown" tpl="{s}S" :timeBoxStyle="{backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '30px', color: '#fff'}" :dotTextStyle="{color: '#fff', fontSize: '30px', fontWeight: 'normal'}" :dotBoxStyle="{width: '30px'}" :style="{justifyContent: 'center'}" :time="countdown_time" @wxcOnComplete="onCompletedTwo">
                                    </wxc-countdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog  :content="$t('确定提取') + `${form.bzh}${form.symbol}` + '吗？'"  title=""   :show="comfirm_dialog_show" @wxcDialogCancelBtnClicked="comfirm_dialog_show = false" @wxcDialogConfirmBtnClicked="ConfirmBiClicked">
            </Dialog>
            <Dialog  :content="error_message"  :title="$t('提示')" titleColor="#F75B37"  :show="error_show"  @wxcDialogConfirmBtnClicked="ConfirmHideErrorClicked" :single="true">
            </Dialog>
        </div>
    </div>
</template>
<script>
import { WxcCountdown, wxcButton, Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Dialog from '../components/Dialog.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        WxcCountdown,
        Dialog
    },
    data() {
        return {
            succeed_icon: `bmlocal://assets/images/succeed_icon.png`,
            form: {
                eth_url: '',
                bzh_total: '',
                bzh: '',
                code: '',
                phone: '',
                symbol: 'BZH',
            },
            show_eth_input: false,
            realname_dialog_show: false,
            succeed_dialog_show: false,
            phone_dialog_show: false,
            comfirm_dialog_show: false,
            popup_height: 600,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            show_countdown: false,
            countdown_time: new Date().getTime() + 6000 * 10,
            user_info: {},
            router_params: {},
            error_message: '',
            error_show: false,
            history_input: '',
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
    eros: {
        beforeBackAppear(params, options) {
            this.init();
        },
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.getUserInfo();
                this.initTokenValue();
            })
        },
        initTokenValue() {
            if (this.router_params.airdrop_id) {
                this.getAirdropWallet();
            } else {
                this.getUserTokenTrans();
            }
        },
        toggleEditEthURL() {
            if (!this.show_eth_input) {
                this.history_input = this.form.eth_url;
                this.show_eth_input = true;
            } else {
                this.putUserEth();
            }
        },
        cancalEditEthURL() {
            this.form.eth_url = this.history_input;
            this.show_eth_input = false;
        },
        clear_input() {
            this.form.eth_url = '';
        },
        onEthInputBlur() {
            let _self = this;
            this.$notice.confirm({
                title: '',
                message: '是否保存以太坊地址',
                okTitle: '保存',
                cancelTitle: '取消',
                okCallback() {
                    _self.putUserEth();
                },
                cancelCallback() {
                    // 点击取消按钮的回调
                }

            })
        },
        pickAll() {
            this.form.bzh = '';
            this.form.bzh = this.form.bzh_total;
        },
        ethDialogConfirmClicked() {
            this.show_eth_input = !this.show_eth_input;
        },
        realnameDialogCancelClicked() {
            this.realname_dialog_show = false;
        },
        realnameDialogConfirmClicked() {
            this.realname_dialog_show = false;
            this.$router.open({
                name: 'Certification',
                params: {},
            })
        },
        succeedDialogConfirmClicked() {
            this.$router.back();
        },
        closepopupPhone() {
            this.phone_dialog_show = false;
        },
        confirmpopupPhone() {
            this.postUserTokenWithdraw("needcode"); // 需要提交验证码
        },
        confirmPickBzh() {
            if (!this.user_info.idcard_verify) { //提币必须先验证身份证
                this.realname_dialog_show = true;
            } else {
                if (!this.form.bzh) {
                    this.$notice.toast({ message: `请输入提取${this.form.symbol}数量` });
                    return;
                } else if (this.form.bzh > this.form.bzh_total) {
                    this.$notice.toast({ message: '不能提取超过可提取数量哦~' });
                    return;
                } else {
                    this.comfirm_dialog_show = true;
                }
            }
        },
        getUserTokenTrans() {
            let params = {};
            params.page = 1;
            params.size = 5;
            this.$fetch({
                name: 'getUserTokenTrans',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.form.bzh_total = resData.result.total || 0;
                    this.form.symbol = resData.result.symbol || 'BZH';
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getAirdropWallet() {
            let params = {};
            params.airdrop_id = this.router_params.airdrop_id;
            this.$fetch({
                name: 'getAirdropWallet',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.form.bzh_total = resData.result.count || 0;
                    this.form.symbol = resData.result.symbol || 'BZH';
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        putUserEth() {
            let params = {};
            params.eth_url = this.form.eth_url;
            if (!params.eth_url) {
                this.$notice.toast({ message: this.$t('以太坊地址') });
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'putUserEth',
                method: 'PUT',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.show_eth_input = false;
                    this.$notice.toast({ message: this.$t('修改成功') });
                    this.getUserInfo();
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
        postUserTokenWithdraw(needcode) {
            let params = {};
            params.amount = this.form.bzh;
            params.code = this.form.code;
            if (this.router_params.airdrop_id) {
                params.airdrop_id = this.router_params.airdrop_id;
            }
            if (!params.code && needcode) {
                this.$notice.toast({ message: this.$t('请输入验证码！') });
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUserTokenWithdraw',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.succeed_dialog_show = true;
                    this.closepopupPhone();
                } else {
                    this.error_message = resData.message;
                    this.error_show = true;
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        getPhoneCode() {
            if (!this.show_countdown) {
                this.getUserPhoneCode();
            }
        },
        getUserPhoneCode() {
            let params = {};
            this.$fetch({
                name: 'getUserPhoneCode',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.show_countdown = true;
                    this.countdown_time = new Date().getTime() + 6000 * 10;
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                console.log(e.message)
            });
        },
        getUserInfo() {
            let params = {};
            this.$fetch({
                name: 'getUserInfo',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    let info = resData.result || {};
                    this.user_info = info;
                    this.form.eth_url = info.eth_url;
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        onCompletedTwo() {
            this.show_countdown = false;
        },
        oninput(e) {

        },
        ConfirmBiClicked() {
            this.comfirm_dialog_show = false;
            if (this.form.bzh >= 10000) { // 提币超过1w的时候需要短信验证
                this.phone_dialog_show = true;
            } else { // 不需要短信验证 可以直接提取 提交请求接口
                this.postUserTokenWithdraw();
            }
        },
        ConfirmHideErrorClicked() {
            this.error_show= false;
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {}

.icon {
    font-family: iconfont2;
}

.box_bd {
    width: 750px;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
}

.eth_url {
    padding: 45px 70px;
    width: 750px;
    background-color: #fff;
    border-top-width: 22px;
    border-bottom-width: 22px;
    border-color: #EEF1F5;
}

.eth_name {
    flex-direction: row;
    align-items: center;
}

.name_text {
    flex: 1;
    font-size: 32px;
}

.btn_edit {
    width: 180px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.edit_icon {
    color: @main_color;
    font-size: 32px;
}

.edit_clear {
    color: #9b9da4;
    font-size: 28px;
    padding: 10px 0 10px 10px;
}

.edit_text {
    padding: 10px 0 10px 10px;
    color: @main_color;
    font-size: 28px;
}

.edit_box {
    padding-top: 40px;
    flex-direction: column;
    position: relative;
}

.eth_url_text {
    font-size: 24px;
    color: #434343;
}

.input {
    border-bottom-color: rgba(0, 0, 0, .1);
    border-bottom-style: solid;
    border-bottom-width: 1px;
}

.eth_url_input {
    color: #434343;
    margin-right: 70px;
}

.pick_num {
    padding: 45px 70px;
    width: 750px;
    background-color: #fff;
    margin-top: 22px;
}

.input_box {
    padding-top: 15px;
    width: 750px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.input_bzh {
    flex: 1;
    height: 90px;
    border-bottom-width: 1px;
    border-color: rgba(0, 0, 0, .1);
}

.btn_box {
    width: 320px;
    flex-direction: row;
}

.bzh_unit {
    font-size: 32px;
    color: #434343;
}

.btn_pick_text {
    padding-left: 20px;
    color: @main_color;
    font-size: 30px;
}

.tips_box {
    margin-top: 15px;
    padding: 10px;
    background-color: #FFF9EE;
}

.tips_bzh {
    font-size: 22px;
    color: #DDB46C;
    line-height: 36px;
}

.confirm {
    margin-top: 40px;
    width: 650px;
    background-color: @main_color;
    border-radius: 80px;
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
}

.tips_text {
    line-height: 60px;
    font-size: 30px;
}

.succeed_dialog_title {
    font-size: 36px;
    text-align: center;
    margin-bottom: 24px;
    color: @main_color;
}


.popup_phone_num {
    padding-top: 15px;
    padding-bottom: 30px;
    text-align: center;
    font-size: 30px;
    color: #434343;
}

.popup_input {
    flex-direction: row;
    justify-content: space-between;
    height: 100px;
    align-items: center;
    padding-bottom: 20px;
}

.input_name {
    flex: 1;
    height: 100px;
    color: #434343;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: rgba(0, 0, 0, .1);
}

.popup_edit_box {
    width: 200px;
    flex-direction: row;
}


.icon_edit {
    position: relative;
    top: 1px;
}

.btn_code {
    width: 200px;
    padding: 18px 0;
    background-color: @main_color;
    border-radius: 4px;
    color: #fff;
    text-align: center;
}

.disable_btn {
    background-color: rgba(247, 178, 55, 0.8);
}

.btn_text {
    color: #fff;
    text-align: center;
    font-size: 30px;
}
.delete_icon {
    position: absolute;
    right: 0;
    top: 50px;
    color: #666;
}

</style>
