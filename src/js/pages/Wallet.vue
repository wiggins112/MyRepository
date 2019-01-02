<template>
    <div class="container">
        <div class="wrapper">
            <div class="head">
                <StatusBar></StatusBar>
                <wxc-minibar :title="$t('我的钱包')" backgroundColor="transparent" borderBottomWidth="0px">
                    <wxc-icon slot="left" name="back" style="font-weight: bold;font-size: 60px;position: relative;left: -14px;" @wxcIconClicked="minibarLeftClicked"></wxc-icon>
                    <text slot="right" class="icon_list" @click="goWalletDetailList">{{ $t('明细') }}</text>
                </wxc-minibar>
            </div>
            <list class="cont" ref="balance_dom" index="0" infinite="false" loadmoreoffset="550" :style="{ height: page_height }" @loadmore="loadmore">
                <Refresher @refresh="refreshWallet" @refreshEnd="refreshEnd" :loading="loading.airdrop"></Refresher>
                <cell class="body" v-if="!hideModule['ExtractBzh']">
                    <text class="tips_text">{{widthdraw.withdraw_tips}}</text>
                </cell>
                <!-- BZH项  -->
                <cell>
                    <div class="bzh_box">
                        <div class="bzh_balance">
                            <text class="bzh_value">{{ bzh }}</text>
                            <text class="bzh_unit">BZH</text>
                        </div>
                        <text class="bzh_hint_text" v-if="!hideModule['ExtractBzh']">{{widthdraw.withdraw_tips_short}}</text>
                        <div class="btn_pick" @click="jumpExtractBzh" v-if="!hideModule['ExtractBzh']">
                            <text class="btn_icon icon">&#xe934;</text>
                            <text class="btn_text">{{ $t('提币') }}</text>
                        </div>
                    </div>
                </cell>
                <!-- ETH项 -->
                <!-- <div class="eth_box">
                    <div class="bzh_balance">
                        <text class="bzh_value">{{ bzh }}</text>
                        <text class="bzh_unit">BZH</text>
                    </div>
                    <text class="eth_hint_text">每月15号提币</text>
                    <div class="btn_pick" @click="jumpExtractBzh" v-if="!hideModule['ExtractBzh']">
                        <text class="eth_icon icon">&#xe934;</text>
                        <text class="eth_text">{{ $t('提币') }}</text>
                    </div>
                </div> -->
                <cell v-if="!hideModule['MyAirdropList']">
                    <div class="list">
                        <div class="less_row">
                            <image class="bi_bg" src="bmlocal://assets/images/coin/bi_bg.png" :style="{width: $locale() === 'zh-CN' ? 200 : 280}"></image>
                            <text class="b_list">{{$t('空投币')}}</text>
                        </div>
                        <div class="foot" v-for="(log,index) in airdrop">
                            <div class="item" @click="jumpAirdropDetail(log)">
                                <div class="less_star left">
                                    <div class="air_logo">
                                        <image class="air_logo" resize="cover" :src="log.icon || default_coin_icon"></image>
                                    </div>
                                    <div class="air_name">
                                        <text class="text air_name_text">{{log.title}}</text>
                                        <div class="less_row value_box">
                                            <text class="value_text">{{log.count}}</text>
                                            <text class="text value_text_unit">{{log.symbol}}</text>
                                        </div>
                                    </div>
                                </div>
                                <div class="right">
                                    <div @click="getAccount(log)" v-if="!hideModule['ExtractBzh']">
                                        <text :class="['btn_box', log.bt_class]">{{log.button_text || $t('提币')}}</text>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Loadmore :loading="loading.airdrop" :empty="$t('空空如也~')" :nomore="$t('加载完了哦~')"></Loadmore>
                        <div v-if="widthdraw.airdrop_tips && !hideModule['ExtractBzh']">
                            <div class="air_tips_box">
                                <text class="air_tips_text">{{widthdraw.airdrop_tips}}</text>
                            </div>
                        </div>
                    </div>
                </cell>
            </list>
            <Dialog title="" :content="dialog_message" :confirmText="$t('我知道了')" :show="dialog_show" :single="true" @wxcDialogConfirmBtnClicked="DialogConfirm">
            </Dialog>
        </div>
    </div>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import filters from '../config/filters.js'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import { Iconfont } from '../config/config.js'

export default {
    components: {
        WxcTabBar,
        WxcButton,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        Dialog
    },
    data() {
        return {
            loading: {
                airdrop: 'init',
            },
            airdrop_page: 1,
            airdrop_size: 30,
            airdrop: [],
            bzh: 0,
            filters,
            dialog_show: false,
            dialog_message: '',
            account_state: 200,
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
            widthdraw: {},
            hh: [true, false],
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
            if (this.user_info.is_login) {
                this.init();
            }
        },
    },
    methods: {
        init() {
            this.airdrop_page = 1;
            this.getUserTokenTrans();
            this.getAirdropWallets();
            this.getConfigTokenWithdraws();
        },
        loadmore() {
            this.getMoreLogs();
        },
        refreshWallet() {
            this.airdrop_page = 1;
            this.getAirdropWallets();
        },
        DialogConfirm() {
            this.dialog_show = false;
        },
        digitize(num) {
            return (num + "").split("").map(Number);
        },
        getMoreLogs() {
            if (this.loading.airdrop !== 'loaded') {
                return;
            }
            this.airdrop_page++;

            this.getAirdropWallets();
        },
        getAccount(log) {
            let params = {};
            this.$fetch({
                name: 'getUserTokenState',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    if (resData.result.account_state === 400 && resData.result.enable === 0) {
                        this.dialog_message = resData.result.message;
                        this.dialog_show = true;
                    } else {
                        this.jumpExtract(log);
                    }
                }
            }).catch((e) => {});
        },
        jumpExtractBzh() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenState',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    if (resData.result.enable === 1) {
                        this.$router.open({ // 可提币
                            name: 'ExtractBzh',
                            params: {},
                        })
                    } else {
                        this.dialog_show = true;
                        this.dialog_message = resData.result.message;
                        this.account_state = resData.result.account_state;
                        return;
                    }
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        jumpExtract(log) {
            //测试领取的时候手机号码验证
            if (log.count <= 0) {
                this.dialog_message = '可提币数量不足~';
                this.dialog_show = true;
                return;
            }
            if (log.withdraw_state !== 0) {
                this.dialog_message = log.withdraw_enable_cause;
                this.dialog_show = true;
                return;
            } else {
                this.$router.open({
                    name: 'ExtractBzh',
                    params: {
                        airdrop_id: log.airdrop_id
                    },
                })
            }
        },
        jumpAirdropDetail(log) {
            if (log.no_detail) { //不能点击跳转

            } else { // 可以点击进入详情
                this.$router.open({
                    name: 'AirdropDetail',
                    statusBarStyle: 'LightContent',
                    params: {
                        airdrop_id: log.airdrop_id
                    }
                })
            }
        },
        goWalletDetailList() {
            this.$router.open({
                name: 'WalletDetailList',
                params: {},
            })
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        getAirdropWallets() {
            let params = {};
            params.page = this.airdrop_page;
            params.size = this.airdrop_size;
            this.loading.airdrop = 'loading';
            this.$fetch({
                name: 'getAirdropWallets',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.airdrop = 'loaded';
                    for(let airdrop_item of resData.items) {
                        airdrop_item.bt_class = 'bgcolor' + airdrop_item.withdraw_state;
                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.airdrop = 'nomore';
                        }
                        this.airdrop.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.airdrop = 'empty';
                        }
                        this.airdrop = resData.items;
                    }
                    this.$refs.balance_dom.resetLoadmore(); // 强制触发loadmore
                } else {
                    this.$notice.toast({ message: resData.message });
                    if (resData.error === 1) {
                        this.loading.airdrop = 'need_login';
                    } else {
                        this.loading.airdrop = 'error';
                    }
                }

            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserTokenTrans() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenTrans',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.bzh = resData.result.total;
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {

            });
        },
        getConfigTokenWithdraws() {
            let params = {
                type: 'app_config',
                key: 'token_withdraw',
            };
            this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.widthdraw = resData.result || {};
                    if (resData.result.withdraw_enable) {
                        let now_timestamp = Date.now() / 1000;
                    }
                }
            }).catch((e) => {
                console.log(e.message);
            });
        }
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        hideModule() {
            return this.$storage.getSync('hideModule')
        },
        user_info() {
            return this.$storage.getSync('user_info') || {};
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {}

.icon {
    font-family: iconfont2;
}

.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
    background-color: #fff;
}

.head {
    width: 750px;
}

.cont {
    width: 750px;
}

.bzh_box {
    padding-top: 40px;
    width: 700px;
    flex-direction: row;
    align-items: center;
    margin: 25px;
    border-radius: 20px;
    background-image: linear-gradient(to left, #faa935, #ffd74b);
}

.eth_box {
    padding-top: 40px;
    width: 700px;
    flex-direction: row;
    align-items: center;
    margin: 25px;
    border-width: 0;
    border-color: yellow;
    border-radius: 20px;
    background-image: linear-gradient(to left, #5a6bce, #4841cf);
}

.colorbzh {
    color: @main_color;
}

.coloreth {
    color: #5054cf;
}

.bzh_balance {
    padding-left: @padding_size;
    flex: 1;
    flex-direction: row;
    align-items: center;
}

.bzh_value {
    font-size: 70px;
    font-weight: bold;
    color: #fff;
    padding: 30px 0;
    text-align: left;
}

.bzh_unit {
    padding-left: 30px;
    padding-top: 15px;
    color: #fff;
    font-size: 50px;
    font-weight: bold;
}

.bzh_hint_text {
    font-size: 24px;
    color: #be7e23;
    position: absolute;
    right: 25px;
    top: 25px;
}

.eth_hint_text {
    font-size: 24px;
    color: #858fda;
    position: absolute;
    right: 25px;
    top: 25px;
}

.btn_pick {
    margin-right: @padding_size;
    width: 165px;
    height: 70px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 35px;
}

.btn_icon {
    color: @main_color;
    font-size: 45px;
}

.icon_list {
    font-size: 34px;
}

.btn_text {
    padding-left: 10px;
    color: @main_color;
    font-size: 32px;
    border-radius: 30px;
}

.eth_icon {
    color: #858fda;
    font-size: 45px;
}

.eth_text {
    padding-left: 10px;
    color: #858fda;
    font-size: 32px;
    border-radius: 30px;
}

.btn_text_disable {
    color: #bbbdc3;
}

.bi_bg {
    position: absolute;
    width: 250px;
    height: 50px;
    left: 0;
    top: 0;
}

.b_list {
    padding: 8px 25px;
    color: #fff;
}

.body {
    padding: 10px @padding_size;
    justify-content: center;
    align-items: center;
    background-color: #FFF9EE;
}

.tips_text {
    font-size: 22px;
    color: #DDB46C;
    line-height: 37px;
    text-align: center;
}

.foot {
    padding: 0 30px;
}

.list {
    background-color: #fff;
    margin: 25px;
    border-style: solid;
    border-width: 1px;
    border-color: rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    padding-bottom: 40px;
}

.item {
    flex-direction: row;
    justify-content: space-between;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: rgba(0, 0, 0, 0.1);
    padding: 30px 0;
    align-items: center;
}

.left {
    padding-right: 10px;
    align-items: center;
    flex: 3;
}

.right {
    align-items: center;
}

.btn_box {
    border-radius: 30px;
    width: 140px;
    height: 60px;
    text-align: center;
    line-height: 60px;
}

.btn_box_disable {
    border-color: #bbbdc3;
}

.value_box {
    align-items: center;
}

.air_logo {
    width: 90px;
    height: 90px;
    border-radius: 100%;
}

.air_name {
    flex: 1;
    padding-left: 20px;
}

.air_name_text {
    margin-bottom: 10px;
    font-size: 30px;
    lines: 1;


    text-overflow: ellipsis;
}

.value_text {
    color: @main_color;
    font-size: 28px;
    font-weight: bold;
}

.value_text_unit {
    padding-left: 10px;
    font-size: 28px;
}

.air_tips_box {
    margin: 44px 0;
}

.air_tips_text {
    text-align: center;
    font-size: 30px;
    color: @main_color;
}



.bgcolor0 {
    background-image: linear-gradient(to left, #ffb516, #ffd74b);
    color: #fff;
}

.bgcolor1 {
    background-image: linear-gradient(to left, #a6a6a6, #e1e3e5);
    color: #fff;
}

.bgcolor2 {
    background-image: linear-gradient(to left, #ff3254, #fb7f48);
    color: #fff;
}

.bgcolor3 {
    background-image: linear-gradient(to left, #ff3254, #fb7f48);
    color: #fff;
}

</style>
