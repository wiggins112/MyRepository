<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar v-if="is_phonex" :backgroundImage="`linear-gradient(to right, #f7be4e, #f4cd52)`"></StatusBar>
            <list class="list" :style="{height: page_height + 50}">
                <Refresher @refresh="refresh"></Refresher>
                <header>
                    <StatusBar v-if="!is_phonex" :backgroundImage="`linear-gradient(to right, #f7be4e, #f4cd52)`"></StatusBar>
                    <wxc-minibar :title="$t('我的')" backgroundColor="transparent" :useDefaultReturn="false" :borderBottomWidth="0" borderBottomColor="#f7be4e" :background-image="`linear-gradient(to right, #f7be4e, #f4cd52)`" text-color="#fff" borderBottomWidth="0px">
                        <div slot="left" @wxcMinibarLeftButtonClicked="wxcMinibarLeftButtonClicked"></div>
                    </wxc-minibar>
                </header>
                <cell>
                    <div class="box_hd">
                        <div class="head" @click="goUpdateSetting">
                            <div class="user_image_box">
                                <image class="user_image" resize="cover" :src="user_info.headimgurl || default_header">
                            </div>
                            <text class="name">{{user_info.nickname || user_info.phone}}</text>
                            <div class="edit_box" v-if="user_info.is_login">
                                <text class="icon icon_edit">&#xe91e;</text>
                            </div>
                        </div>
                        <div class="body">
                            <div class="login_box" v-if="!user_info.is_login">
                                <text class="login" @click="goLogin">{{ $t('登录') }} / </text>
                                <text class="register" @click="goRegister">{{ $t('注册') }}</text>
                            </div>
                            <div class="login_box" v-if="user_info.is_login">
                                <text class="text login" @click="getAuthLogoutApp">{{ $t('退出') }}</text>
                            </div>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="box_bd" v-if="!hideModule['TaskCenter']">
                        <CellItem :has-arrow="true" @wxcCellClicked="jumpTaskCenter" :has-top-border="false" :has-bottom-border="false" :title="$t('任务中心')" hasVerticalIndent="" :titleImage="taskcenter" titleIconSize="36" :extraContent="$t('更多')">
                            <div class="invite_title" slot="title_text">
                                <text class="invite_name">{{ $t('任务中心') }}</text>
                                <text class="invite_tag">+BZH</text>
                            </div>
                        </CellItem>
                        <div class="list_box">
                            <TaskItem :task="task" v-for="(task, i) in task_list" :key="i" @taskClick="taskClick"></TaskItem>
                        </div>
                        <image class="settings_radius_left" src="bmlocal://assets/images/settings/settings_radius_left.png" />
                        <image class="settings_radius_right" src="bmlocal://assets/images/settings/settings_radius_right.png" />
                    </div>
                </cell>
                <cell>
                    <div class="box_ft">
                        <CellItem :has-arrow="true" @wxcCellClicked="goWallet" :has-top-border="false" :title="$t('我的钱包')" hasVerticalIndent="" :titleImage="settings_wallet" titleIconSize="36" :extraContent="`${bzh} BZH`">
                        </CellItem>
                        <CellItem :has-arrow="true" @wxcCellClicked="goBetList" :has-top-border="false" :title="$t('我的竞猜')" hasVerticalIndent="" :titleImage="settings_my_bet" titleIconSize="36" extraContent="" v-if="!hideModule['BetMy']">
                            <div class="invite_title mine_bet_title" slot="title_text">
                                <text class="invite_name">{{ $t('我的竞猜') }}</text>
                                <!-- <image class="new_image" src="bmlocal://assets/images/bets/new.png" /> -->
                            </div>
                            <div slot="value" v-if="betRedDot">
                                <text class="dot_text"></text>
                            </div>
                        </CellItem>
                        <CellItem v-if="!hideModule['AirdropList']" :has-arrow="true" @wxcCellClicked="goAirdropList" :has-top-border="false" :title="$t('空投广场')" hasVerticalIndent="" :titleImage="settings_airdrop" titleIconSize="36" extraContent="">
                            <div class="invite_title mine_bet_title" slot="title_text">
                                <text class="invite_name">{{ $t('空投广场') }}</text>
                                <!-- <image class="new_image" src="bmlocal://assets/images/bets/new.png" /> -->
                            </div>
                            <div slot="value" v-if="airdropRedDot">
                                <text class="dot_text"></text>
                            </div>
                        </CellItem>
                    </div>
                    <div class="box_ft">
                        <!-- <CellItem :has-arrow="true" @wxcCellClicked="goChange" :has-top-border="false" :title="$t('异动')" hasVerticalIndent="" :titleImage="settings_ask" titleIconSize="36" extraContent="">
                        </CellItem>
                        <CellItem :has-arrow="true" @wxcCellClicked="goMarket" :has-top-border="false" :title="$t('大盘')" hasVerticalIndent="" :titleImage="settings_ask" titleIconSize="36" extraContent="">
                        </CellItem> -->
                        <CellItem :has-arrow="true" @wxcCellClicked="jumpInvite" :has-top-border="false" :title="$t('邀请好友')" hasVerticalIndent="" :titleImage="invite_share" titleIconSize="36" :extraContent="$t('获得1000BZH')">
                            <div class="invite_title" slot="title_text">
                                <text class="invite_name">{{ $t('邀请好友') }}</text>
                                <text class="invite_tag">+BZH</text>
                            </div>
                        </CellItem>
                        <CellItem :has-arrow="true" @wxcCellClicked="goSetCurrency" :has-top-border="false" :title="$t('行情设置')" hasVerticalIndent="" :titleImage="settings_currency" titleIconSize="36" :extraContent="get_currency">
                        </CellItem>
                        <CellItem :has-arrow="true" @wxcCellClicked="goNotice" :has-top-border="false" :title="$t('通知设置')" hasVerticalIndent="" :titleImage="settings_ask" titleIconSize="36" extraContent="">
                        </CellItem>
                        <!-- <CellItem :has-arrow="true" @wxcCellClicked="goPlan" :has-top-border="false" :title="$t('监控套餐')" hasVerticalIndent="" :titleImage="settings_buy" titleIconSize="36" :extraContent="user_plan.title" v-if="!hideModule['Stare']">
                        </CellItem> -->
                        <CellItem :has-arrow="true" @wxcCellClicked="goFeedback" :has-top-border="false" :title="$t('反馈建议')" hasVerticalIndent="" :titleImage="feedback_image" titleIconSize="36" extraContent="">
                        </CellItem>
                        <CellItem v-if="PUBLISH_COUNTRY !== 'CHN'" :has-arrow="true" @wxcCellClicked="goSetLanguage" :has-top-border="false" :title="$t('语言设置')" hasVerticalIndent="" :titleImage="settings_language" titleIconSize="36" :extraContent="get_lang.full_name">
                        </CellItem>
                        <CellItem v-if="platform_android" :has-arrow="true" @wxcCellClicked="getToolsAppVersion" :has-top-border="false" :title="$t('版本更新')" hasVerticalIndent="" :titleImage="settings_update" titleIconSize="36" :extraContent="app_version + version_text">
                        </CellItem>
                        <CellItem v-if="debug || test" :has-arrow="true" @wxcCellClicked="clearData" :has-top-border="false" :title="$t('清除缓存')" hasVerticalIndent="" :titleImage="settings_update" titleIconSize="36" :extraContent="$t('正式版自动隐藏该功能')">
                        </CellItem>
                        <!-- <CellItem :has-arrow="false" :has-top-border="false" :title="$t('20121203 1522')" hasVerticalIndent="" :titleImage="settings_update" titleIconSize="36" extraContent="热更新测试">
                        </CellItem> -->
                        <div class="app_version" v-if="!platform_android">
                            <text class="app_version_text">{{ $t('当前版本') }}{{app_version}}{{version_text}}</text>
                        </div>
                    </div>
                </cell>
                <cell style="height: 220px;"></cell>
            </list>
        </div>
        <DialogTask :top="current_task.top || 350" :title="current_task.name" align="left" :single="true" :show="is_show_dialog" :iconImage="current_task.icon_image" :introContentImage="current_task.intro_content_image" :content="current_task.intro_content" :confirmText="current_task.confirmText" @wxcDialogCancelBtnClicked="closeDialog" @wxcDialogConfirmBtnClicked="confirm">
        </DialogTask>
        <DialogRedPacket v-if="show_packet" @closePacket="closePacket"></DialogRedPacket>
        <DialogSoftUpdate :show="dialog_update_show" :update_info="update_info" @closeDialog="DialogCancelUpdate" @ConfirmBtnClicked="DialogConfirmUpdate">
        </DialogSoftUpdate>
    </div>
</template>
<script>
import { Utils, WxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import CellItem from '../components/CellItem.vue'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import DialogTask from '../components/DialogTask.vue'
import TaskItem from '../components/TaskItem.vue'
import DialogRedPacket from '../components/DialogRedPacket.vue'
import { test, debug, prerelease, PUBLISH_COUNTRY } from '../config/config.js'
import DialogSoftUpdate from '../components/DialogSoftUpdate.vue'
import common from '../config/common';
import { language, currency } from '../config/language.js'
const bmPush = weex.requireModule('bmPush')

export default {
    components: {
        WxcButton,
        CellItem,
        WxcMinibar,
        StatusBar,
        Refresher,
        Dialog,
        DialogTask,
        TaskItem,
        DialogRedPacket,
        DialogSoftUpdate,
    },
    data() {
        return {
            setLanguage: "English",
            show_packet: false,
            taskcenter: `bmlocal://assets/images/settings/taskcenter.png`,
            settings_wallet: `bmlocal://assets/images/settings/wallet.png`,
            settings_ask: `bmlocal://assets/images/settings/ask.png`,
            settings_airdrop: `bmlocal://assets/images/settings/airdrop.png`,
            settings_my_bet: `bmlocal://assets/images/settings/my_bet.png`,
            settings_buy: `bmlocal://assets/images/settings/buy.png`,
            settings_currency: `bmlocal://assets/images/settings/currency.png`,
            settings_language: `bmlocal://assets/images/settings/lang.png`,
            settings_update: `bmlocal://assets/images/settings/update.png`,
            invite_share: `bmlocal://assets/images/settings/invite_share.png`,
            feedback_image: `bmlocal://assets/images/feedback/feedback.png`,
            default_header: `bmlocal://assets/images/default_header.jpg`,
            loading: {
                logs: 'init',
            },
            bzh: 0,
            user_info: {},
            user_plan: {},
            update_info: {},
            dialog_update_show: false,
            is_ios: String(weex.config.env.platform).toLowerCase() === 'ios' ? true : false,
            is_phonex: weex.config.env.touchBarHeight ? true : false,
            test,
            debug,
            PUBLISH_COUNTRY,
            version_text: prerelease ? '预发布版' : test ? '-测试版' : (debug ? '-开发版' : ''),
            task_list: [{
                    name: this.$t('阅读'),
                    type: 'done_daily_read', //任务中心的类型 对应接口的result字段
                    icon_image: `bmlocal://assets/images/tasks/read.png`,
                    intro: this.$t('阅读5篇精选文章'),
                    btn_text: '+20 BZH',
                    active: false,
                    btn_active_text: this.$t('今天已经领取'),
                    intro_content: '阅读币智慧5篇以上精选文章（需有效浏览），可领取20BZH奖励，每天都可领取哦！',
                    intro_content_image: '',
                    confirmText: this.$t('马上去阅读'),
                    router_link: 'Index',
                    router_link_params: {
                        tab: 3,
                        news_active_tab: 1,
                        hide_poster: true
                    },
                },
                //  {
                //     name: this.$t('分享'),   // 分享的文章被5人阅读
                //     type: 'done_daily_share',
                //     icon_image: `bmlocal://assets/images/tasks/share.png`,
                //     intro: this.$t('分享文章被5人阅读'),
                //     btn_text: '+50 BZH',
                //     active: false,
                //     btn_active_text: this.$t('今天已经领取'),
                //     intro_content: this.$t('分享的文章被5人阅读，可以获得50BZH。'),
                //     intro_content_image: `bmlocal://assets/images/tasks/share_guide.jpg`,
                //     confirmText: this.$t('我知道了'),
                //     top: 200,
                // },
                {
                    name: this.$t('分享'), // 分享快讯的功能
                    type: 'done_daily_share_msg',
                    icon_image: `bmlocal://assets/images/tasks/share.png`,
                    intro: this.$t('分享快讯'),
                    btn_text: '+10 BZH',
                    active: false,
                    btn_active_text: this.$t('今天已经领取'),
                    intro_content: this.$t('分享快讯成功1次，可以获得10BZH。'),
                    intro_content_image: `bmlocal://assets/images/tasks/fastshare_guide.png`,
                    confirmText: this.$t('我知道了'),
                    top: 200,
                },
                {
                    name: this.$t('投票'),
                    type: 'done_daily_vote',
                    icon_image: `bmlocal://assets/images/tasks/vote.png`,
                    intro: this.$t('5次利好利空投票'),
                    btn_text: '+ 20 BZH',
                    active: false,
                    btn_active_text: this.$t('今天已经领取'),
                    intro_content: this.$t('每天参与文章投票5次，奖励20BZH'),
                    intro_content_image: `bmlocal://assets/images/tasks/vote_guide.jpg`,
                    confirmText: this.$t('我知道了'),
                    top: 200,
                }
            ],
            current_task: {},
            is_show_dialog: false,
            unview_num: 0,
            unview_Airdrop: 0,
            upload_desc: {
                version: '1.3.0',
                detail: [
                    "1:优化币详情", "2:fdfhsdfhs", "3:fdfhsdfhs"
                ]
            },
            betRedDot: this.$storage.getSync('betRedDot') || false,
            airdropRedDot: this.$storage.getSync('airdropRedDot') || false
        };
    },
    props: {
        tabbarActive: {
            type: Boolean,
            default: false,
        },
    },
    beforeCreate: function() {

    },
    created() {
        console.log('sssssss', this.$t(this.$t('组织')))
        this.getEventOn()
    },
    eros: {
        beforeBackAppear(params, options) {
            if (params.change_lang || params.change_currency || params.change_open) {
                this.$router.refresh();
            }
            this.init();
        },
    },
    watch: {
        'tabbarActive': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getUserInfo();
            // getUserInfo 执行完后才获得 this.user_info，也就是登录了才获取下面的信息
            if (this.user_info.is_login) {
                this.getUserTokenTrans();
                this.getUserPlan();
                this.getUserTokenDailyStat();
                this.getUserBets();
            }
        },
        getEventOn() {
            this.$event.on('changeBetRedDot', flag => {
                this.betRedDot = flag
            })
            this.$event.on('changeAirdropRedDot', flag => {
                this.airdropRedDot = flag
            })
        },
        wxcMinibarLeftButtonClicked() {
            return;
        },
        resetDataTaskList() {
            for (let item of this.task_list) {
                item.active = false;
            }
        },
        closeDialog() {
            this.is_show_dialog = false;
        },
        closePacket() {
            this.show_packet = false;
        },
        confirm() {
            this.is_show_dialog = false;
            if (!this.current_task.router_link) {
                return;
            }
            if (this.current_task.router_link === 'Index') {
                this.$emit('SetTabbarActive', this.current_task.router_link_params.tab);
            } else {
                this.$router.open({
                    name: this.current_task.router_link,
                    type: 'PUSH',
                    params: this.current_task.router_link_params || {}
                })
            }
        },
        jumpInvite() {
            this.$router.open({
                name: 'Invite',
                type: 'PUSH',
                params: {
                    from: 'settings'
                }
            })
        },
        gomarket() {
            this.$router.open({
                name: 'Market',
            })
        },
        jumpTaskCenter() {
            this.$router.open({
                name: 'TaskCenter',
                statusBarStyle: 'LightContent',
                type: 'PUSH',
                params: {}
            })
        },
        getToolsAppVersion() {
            let params = {};
            params.versioncode = weex.config.env.appVersion;
            params.platform = weex.config.env.platform;
            params.app_name = weex.config.env.appName;
            params.type = 'version';
            this.$fetch({
                name: 'getToolsAppVersion',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.update_info = resData.result;
                    this.dialog_update_show = true;
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        DialogCancelUpdate() {
            this.dialog_update_show = false;
        },
        DialogConfirmUpdate() {
            this.dialog_update_show = false;
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        goWallet() {
            this.$router.open({
                name: 'Wallet',
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_purse_enter');
        },
        goRegister() {
            this.$router.open({
                name: 'ReceiveBzh',
                type: 'PUSH',
                params: {
                    name: 'register'
                },
                canBack: false,
                gesBack: false,
            })
        },
        goPlan() {
            this.$router.open({
                name: 'Plan',
            })
        },
        goNotice() {
            this.$router.open({
                name: 'Notice',
            })
        },
        goFeedback() {
            this.$router.open({
                name: 'Feedback',
            })
        },
        goSetLanguage() {
            this.$router.open({
                name: 'SetLanguage',
            })
        },
        goSetCurrency() {
            this.$router.open({
                name: 'SetCurrency',
            })
        },
        goMarket() {
            this.$router.open({
                name: 'Market',
            })
        },
        goChange() {
            this.$router.open({
                name: 'Change',
            })
        },
        goBetList() {
            this.$router.open({
                name: 'BetMy',
            });
            this.putUserBetView();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_gamble_mine');
        },
        goAirdropList() {
            this.$router.open({
                name: 'AirdropList',
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_airdrop_enter');
        },
        goLogin() {
            this.$router.open({
                name: 'Login',
                params: {}
            })
        },
        LoginOutClearStorage() {
            const storageOpen = this.$storage.getSync('open');
            const storageCurrency = this.$storage.getSync('currency')
            const storageLanguage = this.$storage.getSync('language')
            const storageHideModule = this.$storage.getSync('hideModule')
            const storageIsSetLanguage = this.$storage.getSync('is_set_locale_language')
            const permission = this.$storage.getSync('goalKeeper_permission');
            this.$storage.removeAll().then(res => {
                this.$storage.setSync('open', storageOpen);
                this.$storage.setSync('currency', storageCurrency);
                this.$storage.setSync('language', storageLanguage)
                this.$storage.setSync('hideModule', storageHideModule)
                this.$storage.setSync('is_set_locale_language', storageIsSetLanguage)
                this.$storage.setSync('goalKeeper_permission', permission);
                this.resetData();
                this.init();
                console.log(this.$t('本地所有持久化存储的数据都已被清空。'))
            })
        },
        async getAuthLogoutApp() {
            this.$notice.loading.show();
            let params = {};
            let push_cid = await common.getPushCid() || {};
            params.cid = push_cid.data && push_cid.data.cid ? push_cid.data.cid : '';
            console.log('login_out_cid', params);
            this.$fetch({
                name: 'deleteAuthLogoutApp',
                method: 'DELETE',
                data: params
            }).then(resData => {
                this.$notice.loading.hide();
                if (resData.error === 0) {
                    this.LoginOutClearStorage();
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                this.$notice.loading.hide();
                console.log(e.message);
            });
        },
        clearData() {
            this.$storage.removeAll().then(res => {
                this.$notice.toast({ message: '清除成功~' });
                this.$router.refresh();
            });
        },
        resetData() {
            this.bzh = 0;
            this.user_info = {};
            this.user_plan = {};
            this.update_info = {};
            this.resetDataTaskList();
        },
        refresh() {
            this.getUserInfo();

            // 这里不用判断是否登录，用户主动刷新的时候，如果没有登录就跳到登录页面
            if (this.user_info.is_login) {
                this.getUserTokenTrans();
                this.getUserPlan();
            }
        },
        getUserTokenTrans() {

            let params = {};
            this.$fetch({
                name: 'getUserTokenTrans',
                method: 'GET',
                data: params
            }).then(resData => {
                this.bzh = resData.result.total;
            }).catch((e) => {

            });
        },
        getUserPlan() {
            let params = {};
            this.$fetch({
                name: 'getUserPlan',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.user_plan = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        goUpdateSetting() {
            if (!this.user_info.is_login) {
                return;
            }
            this.$router.open({
                name: 'UpdateSetting',
                params: {}
            })
        },
        getUserTokenDailyStat() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenDailyStat',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    for (let item of this.task_list) {
                        for (let k in resData.result) {
                            if (item.type === k && resData.result[k] === true) {
                                item.active = true; //若是某项任务为true 则改变状态
                            }
                        }
                    };
                    // 可以领取红包，且没有领取过
                    if (resData.result.can_get_redpacket && !resData.result.done_daily_redpacket) {
                        this.show_packet = true;
                    }

                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserBets() {
            let params = {};
            params.items = 0;
            this.$fetch({
                name: 'getUserBets',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.unview_num = resData.unview || 0;
                }
            }).catch((e) => {

            });
        },
        putUserBetView() {
            if (!this.user_info.is_login) {
                return;
            }
            let params = {};
            this.$fetch({
                name: 'putUserBetView',
                method: 'PUT',
                data: params
            }).then(resData => {
                if (resData.error === 0) {

                }
            }).catch((e) => {

            });
        },
        taskClick(task) {
            this.is_show_dialog = true;
            this.current_task = task;
        },
    },
    computed: {
        app_version() {
            return `v${weex.config.env.appVersion}`;
        },
        platform_android() {
            return String(weex.config.env.platform).toLowerCase() === 'android';
        },
        page_height() {
            return Utils.env.getPageHeight();
        },
        get_lang() {
            const storageLanguage = this.$storage.getSync('language');
            let lang = language.language_list.filter((item) => {
                return item.simple_name === storageLanguage
            })
            if (lang.length) {
                return lang[0]
            } else {
                return {}
            }
        },
        get_currency() {
            return `${this.$storage.getSync('currency').currency_txt}-${this.$storage.getSync('open').open_txt}`;
        },
        hideModule() {
            return this.$storage.getSync('hideModule')
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {}

.icon {
    color: #434343;
    font-family: iconfont2;
    font-size: 30px;
}
.StatusBar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
}
.colorgray {
    color: #9b9da4;
}

.wrapper {
    width: 750px;
    position: relative;
}

.box_bd {
    position: relative;
}
.settings_radius_left {
    position: absolute;
    top: 0;
    left: 0;
    width: 15px;
    height: 15px;
}
.settings_radius_right {
    position: absolute;
    top: 0;
    right: 0;
    width: 15px;
    height: 15px;
}
.back {
    position: absolute;
    font-size: 67px;
    bottom: 10px;
}

.seting {
    font-weight: bold;
}

.box_hd {
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    height: 190px;
    background-image: linear-gradient(to right, #f7be4e, #f4cd52);
}

.list_box {
    width: 750px;
    flex-direction: row;
    flex-wrap: wrap;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
}

.head {
    margin-top: 15px;
    flex-direction: row;
    align-items: center;
    margin-left: 30px;
}

.body {
    margin-top: 25px;
    margin-right: 30px;
}

.login_box {
    flex-direction: row;
}

.edit_box {
    padding-left: 15px;
}

.login {
    color: #fff;
}

.register {
    color: #fff;
}
.user_image_box {
    width: 102px;
    height: 102px;
    border-radius: 50%;
    border-width: 3px;
    border-color: #fff;
    justify-content: center;
    align-items: center;
}
.user_image {
    width: 98px;
    height: 98px;
    border-radius: 50%;
}

.name {
    color: #fff;
    margin-left: 20px;
}
.icon_edit {
    color: #fff;
}
.box_ft {
    margin-bottom: 20px;
}

.icon {
    font-family: iconfont2;
}

.invite_title {
    position: relative;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.mine_bet_title {
    height: 55px;
}

.dot_text {
    width: 15px;
    height: 15px;
    border-radius: 100%;
    background-color: #fd5b4e;
}

.invite_name {
    color: #333333;
    font-size: 30px;
}

.invite_tag {
    margin-left: 20px;
    padding: 3px 15px;
    border-width: 2px;
    border-color: @main_color;
    border-radius: 20px;
    font-size: 22px;
    color: @main_color;
}

.new_image {
    margin-left: 10px;
    position: relative;
    top: -15px;
    width: 60px;
    height: 26px;
}

.app_version_text {
    padding-top: 15px;
    text-align: center;
    font-size: 20px;
    color: #999;
}

</style>
