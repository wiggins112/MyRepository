<template>
    <div class="container">
        <div class="wrapper" :style="{visibility: (!showPoster && loade_page) || (!show_ad_splash && loade_page) ? 'visible' : 'hidden' }">
            <wxc-tab-bar ref="wxc-tab-bar" :tab-titles="tabTitles" :tab-styles="tabStyles" duration="0" title-type="icon" @wxcTabBarCurrentTabSelected="wxcTabBarCurrentTabSelected">
                <div class="item_container" :style="contentStyle">
                    <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
                    <Stat :tabbarActive="curentActiveTabbar.title === $t('自选') ? true : false" :statActiveNavTab="statActiveNavTab" @SetTabbarActive="SetTabbarActive" :showBetFloat="!showPoster"></Stat>
                </div>
                <div class="item_container" :style="contentStyle">
                    <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
                    <Coins :tabbarActive="curentActiveTabbar.title === $t('行情') ? true : false" :coinActiveNavTab="coinActiveNavTab" @SetTabbarActive="SetTabbarActive"></Coins>
                </div>
                <div class="item_container" :style="contentStyle">
                    <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
                    <SelectCoin :tabbarActive="curentActiveTabbar.title === $t('选币') ? true : false" @SetTabbarActive="SetTabbarActive"></SelectCoin>
                </div>
                <div class="item_container" :style="contentStyle">
                    <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
                    <News :tabbarActive="curentActiveTabbar.title === $t('资讯') ? true : false" :newsActiveNavTab="newsActiveNavTab"></News>
                </div>
                <div class="item_container" :style="contentStyle">
                    <Settings :tabbarActive="curentActiveTabbar.title === $t('我的') ? true : false" @SetTabbarActive="SetTabbarActive"></Settings>
                </div>
            </wxc-tab-bar>
        </div>
        <DialogSoftUpdate :show="dialog_update_show" :update_info="update_info" @closeDialog="DialogCancelUpdate" @ConfirmBtnClicked="DialogConfirmUpdate">
        </DialogSoftUpdate>
        <BzhPoster v-if="!show_lang_splash" :showPoster="showPoster && loade_page && !show_lang_splash" @closePoster="closePoster" />
        <LangSplashActivity v-if="loade_page && show_lang_splash" />
        <DialogRedPacket v-if="show_packet" @closePacket="closePacket"></DialogRedPacket>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton } from 'weex-ui';
import News from './News.vue';
import Coins from './Coins.vue';
import Stat from './Stat.vue';
import Settings from './Settings.vue';
import SelectCoin from './SelectCoin.vue';
import StatusBar from '../components/StatusBar.vue'
import common from '../config/common';
import Dialog from '../components/Dialog.vue'
import BzhPoster from '../components/BzhPoster.vue'
import DialogRedPacket from '../components/DialogRedPacket.vue'
import DialogSoftUpdate from '../components/DialogSoftUpdate.vue'
import LangSplashActivity from '../components/LangSplashActivity.vue'
import { Iconfont, language, PUBLISH_COUNTRY, CURRENCY, OPEN } from '../config/config.js'
import { hide } from '../config/language.js'
const storage = weex.requireModule('bmStorage');


export default {
    components: {
        WxcTabBar,
        WxcButton,
        Stat,
        News,
        StatusBar,
        SelectCoin,
        Coins,
        Dialog,
        BzhPoster,
        Settings,
        DialogRedPacket,
        DialogSoftUpdate,
        LangSplashActivity,
    },
    data() {
        return {
            show_packet: false,
            dialog_update_show: false,
            showPoster: true,
            show_lang_splash: false,
            update_info: {},
            loade_page: false,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            touchBarHeight: weex.config.eros.touchBarHeight ? weex.config.eros.touchBarHeight : 20,
            curentActiveTabbar: {},
            contentStyle: '',
            tabStyles: {
                bgColor: '#FFFFFF',
                titleColor: '#434343',
                activeTitleColor: '#F7B237',
                activeBgColor: '#FFFFFF',
                isActiveTitleBold: true,
                iconWidth: 50,
                iconHeight: 50,
                width: 150,
                height: 100,
                fontSize: 22,
                textPaddingLeft: 10,
                textPaddingRight: 10
            },
            user_info: {},
            unview_num: 0,
            coinActiveNavTab: 0,
            statActiveNavTab: 0,
            newsActiveNavTab: 0,
            betRedDot: this.$storage.getSync('betRedDot') || false,
            airdropRedDot: this.$storage.getSync('airdropRedDot') || false
        };
    },
    eros: {
        beforeBackAppear(params, options) {
            this.getUserInfo();
        },
        appActive() {
            // 前台
            common.initPush();
        },
    },
    beforeCreate() {
        this.$notice.loading.show();
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created() {
        this.$navigator.setNavigationInfo({
            statusBarStyle: 'Default'
        });
        this.init();
        this.getEventOn()
    },
    watch: {
        'showPoster': {
            handler(newValue) {
                if (!newValue) {
                    this.jupmSchemePage();
                    this.getToolsAppVersion();
                    this.getUserTokenDailyStat();
                    // common.initHotUpdate();
                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getUserInfo();
            this.initTabBar();
            common.initUM();
            common.initUMAppStat();
            common.initPush();
            this.getHide();
            this.getCurrency();
            this.getOpen(); //获取开盘时间设置
            this.getRouterParams();
            // common.initGoalKeeperPermission();
            common.getApiStatPerNum();
            this.postUserLog();
            this.getBetList();
            this.getAirdropList()
        },
        getEventOn () {
            this.$event.on('changeBetRedDot', flag => {
                this.betRedDot = flag
            })
            this.$event.on('changeAirdropRedDot', flag => {
                this.airdropRedDot = flag
            })
        },
       async getBetList() { //list 加载数据
            try {
                let params = {}
                params.page = 1
                params.size = 10
                const resData = await this.$fetch({
                    name: 'getBetActivities',
                    method: 'GET',
                    data: params,
                })
                if (resData.error === 0) { //加载成功
                    if (resData.items.length) {
                        this.betRedDot = resData.items[0]._id
                            && (this.$storage.getSync('betHaveReadID') !== resData.items[0]._id) 
                            && resData.items[0].bet_state !== 'opened'
                        this.$storage.setSync('betRedDot', this.betRedDot)
                        this.$event.emit('changeBetRedDot', this.betRedDot)
                    } else {
                        this.$storage.setSync('betRedDot', false)
                        this.$event.emit('changeBetRedDot', false)
                    }
                }
            } catch (err) {}
        },
        async getAirdropList() {
            try {
                let params = {}
                params.page = 1
                params.size = 1
                const resData = await this.$fetch({
                    name: 'getAirdropList',
                    method: 'GET',
                    data: params
                })
                if (resData.error === 0) {
                    if (resData.items.length) {
                        this.airdropRedDot = resData.items[0]._id
                            && (this.$storage.getSync('airdropHaveReadID') !== resData.items[0]._id)
                        this.$storage.setSync('airdropRedDot', this.airdropRedDot)
                        this.$event.emit('changeAirdropRedDot', this.airdropRedDot)
                    } else {
                        this.$storage.setSync('airdropRedDot', false)
                        this.$event.emit('changeAirdropRedDot', false)
                    }
                }
            } catch (err) {}
        },
        postUserLog() {
            let params = {}
            params.device_id = weex.config.eros.deviceId;
            params.device_name = weex.config.eros.sysModel;
            this.$fetch({
                name: 'postUserLog',
                method: 'POST',
                data: params
            }).then(resData => {

            }).catch((e) => {

            });
        },
        getHide() {
            if (!this.$storage.getSync('language')) this.$storage.setSync('language', language)
            let lang = this.$storage.getSync('language') || language
            let obj = {}
            if (hide[lang] && hide[lang].length) {
                hide[lang].map(x => {
                    obj[x] = true
                })
            }
            this.$storage.setSync('hideModule', obj)
        },
        getCurrency() { // 进入页面设置价格单位的数据
            if(this.$storage.getSync('currency')) { //缓存有数据的情况下 
            }else {      
                this.$storage.setSync('currency', CURRENCY);  // currency在config里初始默认值为$ 
            }
        },
        getOpen() {  // 开盘设置 8am 24h
            if(this.$storage.getSync('open')) {
            }else {      
                this.$storage.setSync('open', OPEN);  //没缓存的情况下 open在config里初始默认值为8am
            }
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                resData = resData || {};
                this.$notice.loading.hide();
                this.loade_page = true;
                this.show_lang_splash = !this.$storage.getSync('is_set_locale_language') && PUBLISH_COUNTRY !== 'CHN';
                this.showPoster = resData.hide_poster ? false : true;
                this.coinActiveNavTab = resData.coin_active_tab || 0;
                this.statActiveNavTab = resData.stat_active_tab || 0;
                this.newsActiveNavTab = resData.news_active_tab || 0;

                let tab = resData.tab || 0;
                if (!this.user_info.is_login && !tab) {
                    this.SetTabbarActive(2);
                } else {
                    this.SetTabbarActive(tab);
                }
                // 安卓自定义退出 app
                common.initDbBackExit(resData.unback_exit, this.$t('再按一次退出程序'));
            })
        },
        closePacket() {
            this.show_packet = false;
        },
        getUserTokenDailyStat() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenDailyStat',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
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
        initTabBar() {
            // const tabPageHeight = Utils.env.getPageHeight();
            // If the page doesn't have a navigation bar
            let tabPageHeight = Utils.env.deviceHeight / Utils.env.deviceWidth * 750;
            this.contentStyle = { height: (tabPageHeight - this.tabStyles.height) + 'px' };
            if (weex.config.env.platform === 'iOS') {
                this.contentStyle = '';
            }
        },
        closePoster() {
            setTimeout(() => {
                this.showPoster = false;
            }, 100)
        },
        DialogCancelUpdate() {
            this.dialog_update_show = false;
        },
        DialogConfirmUpdate() {
            if (!this.update_info.force) {
                this.dialog_update_show = false;
            }
        },
        getToolsAppVersion() {
            let params = {};
            params.versioncode = weex.config.env.appVersion;
            params.platform = weex.config.env.platform;
            params.app_name = weex.config.env.appName;
            this.$fetch({
                name: 'getToolsAppVersion',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.update_info = resData.result;
                    if (resData.result.update) {
                        this.dialog_update_show = true;
                    }
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        wxcTabBarCurrentTabSelected(e) {
            this.coinActiveNavTab = 0;
            this.statActiveNavTab = 0;
            this.newsActiveNavTab = 0;
            const index = e.page;
            this.curentActiveTabbar = this.tabTitles[index];
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.curentActiveTabbar.clickType || 'bzh_bottomnav');
        },
        SetTabbarActive(index, tab) {
            setTimeout(() => {
                this.$refs['wxc-tab-bar'].setPage(index)
                this.coinActiveNavTab = tab || this.coinActiveNavTab || 0;
            }, 50)
        },
        jupmSchemePage() {
            const scheme = storage.getDataSync('scheme').data;
            let page_config = scheme ? JSON.parse(scheme) : {};
            let page = page_config.page || '';
            let query = page ? JSON.parse(decodeURI(page_config.query || '')) : {};
            if (page && page !== 'null') {
                this.$router.open({
                    name: page,
                    params: query
                })
                var resData = storage.deleteData('scheme');
            }
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
    },
    computed: {
        show_ad_splash() {
            let splash_config = this.$storage.getSync('splash_config') || {};
            return !!splash_config.poster_image;
        },

        tabTitles () {
            let arr = [] 
            arr = [{
                    title: this.$t('自选'),
                    icon: `bmlocal://assets/images/stat.png`,
                    activeIcon: `bmlocal://assets/images/stat_active.png`,
                    dot: this.betRedDot, // 是否显示小红点
                    clickType: 'bzh_bottomnavi_chosen_click'
                }, {
                    title: this.$t('行情'),
                    icon: `bmlocal://assets/images/market.png`,
                    activeIcon: `bmlocal://assets/images/market_active.png`,
                    dot: false,
                    clickType: 'bzh_bottomnavi_market_click'
                }, {
                    title: this.$t('选币'),
                    icon: `bmlocal://assets/images/guide.png`,
                    activeIcon: `bmlocal://assets/images/guide_active.png`,
                    dot: false,
                    clickType: 'bzh_bottomnavi_choose_click'
                }, {
                    title: this.$t('资讯'),
                    icon: `bmlocal://assets/images/news.png`,
                    activeIcon: `bmlocal://assets/images/news_active.png`,
                    dot: false,
                    clickType: 'bzh_bottomnavi_news_click'
                }, {
                    title: this.$t('我的'),
                    icon: `bmlocal://assets/images/mine.png`,
                    activeIcon: `bmlocal://assets/images/mine_active.png`,
                    dot: this.betRedDot || this.airdropRedDot,
                    clickType: 'bzh_bottomnavi_mine_click'
                }]
            return arr
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.status_bar {
    height: 40;
    background-color: @base_color;
}

.item_container {
    width: 750px;
    background-color: @bgf4f5f6;
    overflow: auto;
}

.icon {
    font-family: iconfont2;
}

</style>
