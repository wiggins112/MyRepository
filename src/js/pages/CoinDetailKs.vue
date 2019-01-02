<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar>
            <div slot="middle" class="middle">
                <text class="middle_title" v-if="router_params.symbol">{{`${router_params.symbol || ''}/${router_params.pair_base || ''}`}}</text>
                <text class="middle_title_second">({{router_params.platform || ''}})</text>
            </div>
            <div slot="right" class="right" @click="minibarRightButtonClick" v-if="!is_ios">
                <text class="icon right_icon">&#xe90b;</text>
            </div>
        </wxc-minibar>
        <wxc-tab-page ref="wxc-tab-page" :tab-titles="tabTitles" :tab-styles="tabStyles" :tab-page-height="3000" :need-slider="false">
            <wxc-pan-item class="slider-item">
                <div class="box_hd">
                    <div class="price_box_hd">
                        <div class="price_box_hd_l">
                            <text :class="['hd_l_big', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{handicap.cur_price_base_str || '--'}}</text>
                            <text :class="['hd_l_txt', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{String(handicap.price_unit_change_8h_str || '').replace('¥', '')}}</text>
                            <text :class="['hd_l_txt', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{String(handicap.price_change_8h_percent_str || '')}}</text>
                        </div>
                        <div class="price_box_hd_bt" @click="jumpCoinExplain('zhenfu')">
                            <text class="icon icon_mark">&#xe936;</text>
                        </div>
                    </div>
                    <div class="price_box_bd">
                        <div class="price_box_bd_l">
                            <div class="less_row">
                                <div class="price_box_bd_item" >
                                    <text class="price_box_bd_txt">24h {{ $t('最高') }}</text>
                                    <text class="price_box_bd_num">{{handicap.max_price_unit_24h_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item" >
                                    <text class="price_box_bd_txt">{{ $t('买一价') }}</text>
                                    <text class="price_box_bd_num">{{handicap.buy_price_unit_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item per_item" >
                                    <text class="price_box_bd_txt">{{ $t('振幅') }}</text>
                                    <text class="price_box_bd_num">{{handicap.amplitude_percent_str || ''}}</text>
                                </div>
                            </div>
                            <div class="less_row">
                                <div class="price_box_bd_item" >
                                    <text class="price_box_bd_txt">24h {{ $t('最低') }}</text>
                                    <text class="price_box_bd_num">{{handicap.min_price_unit_24h_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item" >
                                    <text class="price_box_bd_txt">{{ $t('卖一价') }}</text>
                                    <text class="price_box_bd_num">{{handicap.sale_price_unit_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item per_item" >
                                    <text class="price_box_bd_txt">{{ $t('量比') }}</text>
                                    <text class="price_box_bd_num">{{handicap.quantity_ratio_percent_str || '--'}}</text>
                                </div>
                            </div>
                        </div>
                        <div class="price_box_bd_bt" @click="showDialog">
                            <text class="icon icon_mark">&#xe937;</text>
                        </div>
                    </div>
                </div>
                <div class="box_bd">
                    <!-- 币 k线图 -->
                    <Ks @unitChange="unitChange" :height="ksHeight"></Ks>
                </div>
            </wxc-pan-item>
            <wxc-pan-item class="slider-item" :style="{height: 3000}">
                <list class="wrapper_scroller" ref="ks_list" loadmoreoffset="50" @loadmore="loadmore" :style="{height: height_bar - 90}">
                    <cell class="box_hd" ref="top_dom">
                        <div class="price_box_hd">
                            <div class="price_box_hd_l">
                                <text :class="['hd_l_big', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{handicap.cur_price_base_str  || '--'}}</text>
                                <text :class="['hd_l_txt', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{String(handicap.price_unit_change_8h_str || '').replace('¥', '')}}</text>
                                <text :class="['hd_l_txt', handicap.price_change_8h_percent > 0 ? 'safe' : 'warn']">{{String(handicap.price_change_8h_percent_str || '')}}</text>
                            </div>
                            <div class="price_box_hd_bt" @click="jumpCoinExplain('zhenfu')">
                                <text class="icon icon_mark">&#xe936;</text>
                            </div>
                        </div>
                        <div class="price_box_bd">
                            <div class="price_box_bd_l">
                                <div class="less_row">
                                    <div class="price_box_bd_item" >
                                        <text class="price_box_bd_txt">24h {{ $t('最高') }}</text>
                                        <text class="price_box_bd_num">{{handicap.max_price_unit_24h_str || '--'}}</text>
                                    </div>
                                    <div class="price_box_bd_item" >
                                        <text class="price_box_bd_txt">{{ $t('买一价') }}</text>
                                        <text class="price_box_bd_num">{{handicap.buy_price_unit_str || '--'}}</text>
                                    </div>
                                    <div class="price_box_bd_item per_item" >
                                        <text class="price_box_bd_txt">{{ $t('振幅') }}</text>
                                        <text class="price_box_bd_num">{{handicap.amplitude_percent_str || ''}}</text>
                                    </div>
                                </div>
                                <div class="less_row">
                                    <div class="price_box_bd_item" >
                                        <text class="price_box_bd_txt">24h {{ $t('最低') }}</text>
                                        <text class="price_box_bd_num">{{handicap.min_price_unit_24h_str || '--'}}</text>
                                    </div>
                                    <div class="price_box_bd_item" >
                                        <text class="price_box_bd_txt">{{ $t('卖一价') }}</text>
                                        <text class="price_box_bd_num">{{handicap.sale_price_unit_str || '--'}}</text>
                                    </div>
                                    <div class="price_box_bd_item per_item" >
                                        <text class="price_box_bd_txt">{{ $t('量比') }}</text>
                                        <text class="price_box_bd_num">{{handicap.quantity_ratio_percent_str || '--'}}</text>
                                    </div>
                                </div>
                            </div>
                            <div class="price_box_bd_bt" @click="showDialog">
                                <text class="icon icon_mark">&#xe937;</text>
                            </div>
                        </div>
                    </cell>
                    <!-- 资金流向 -->
                    <cell class="coin_flow" :style="{paddingBottom: touchBarHeight + 20}">
                        <CoinCashFlow ref="CoinCashFlow" :is_loadmore="is_loadmore" @Loadmoreing="Loadmoreing" :active="currentTabIndex === 1"></CoinCashFlow>
                    </cell>
                </list>
            </wxc-pan-item>
        </wxc-tab-page>
        <div class="btn_wrap">
            <div class="btn_box" v-if="!is_shoting">
                <div class="btn_item btn_F10" @click="jumpCoinDetail">
                    <div class="logo_image">
                        <image class="logo_image" resize="cover" :src="coin.icon || default_coin_icon"></image>
                    </div>
                    <text class="symbol_text">{{router_params.symbol}}{{ $t('详情') }}</text>
                </div>
                <div class="btn_item" @click="jumpToWeb" v-if="config_platform.enable">
                    <text class="icon icon_btn">&#xe939;</text>
                    <text class="symbol_text">{{ $t('交易所') }}</text>
                </div>
                <div class="btn_item" @click="addUserCoin">
                    <text class="icon icon_btn" v-if="selected.is_star">&#xe90a;</text>
                    <text class="icon icon_btn" v-if="!selected.is_star">&#xe93a;</text>
                    <text class="symbol_text">{{ $t('自选') }}</text>
                </div>
                <div class="btn_item" @click="toggleShow">
                    <text class="icon icon_btn" v-if="currentTabIndex === 0">&#xe943;</text>
                    <text class="icon icon_btn" v-if="currentTabIndex === 1">&#xe944;</text>
                    <text class="symbol_text">{{ $t(currentTabIndex === 0 ? $t('分析') : $t('k线')) }}</text>
                </div>
                <div class="btn_item" @click="jumpCoinStare" v-if="!hideModule['Stare']">
                    <text class="icon icon_btn">&#xe93c;</text>
                    <text class="symbol_text">{{ $t('盯盘') }}</text>
                </div>
            </div>
            <div :style="{width: 750, height: touchBarHeight, backgroundColor: '#fff'}"></div>
        </div>
        <Dialog title="" dialogWidth="650" left="50" :show="true" dialogBoxBgColor="transparent" top="300" v-if="is_show_dialog">
            <div slot class="dialog_box">
                <div class="dialog_hd">
                    <div class="dialog_title" @click="jumpCoinExplain('pankoushuju')">
                        <text class="dialog_title_text">{{ $t('盘口数据') }}</text>
                        <text class="icon icon_mark icon_mark_pankou">&#xe936;</text>
                    </div>
                    <div class="dialog_close" @click="closeDialog">
                        <text class="icon icon_close">&#xe91a;</text>
                    </div>
                </div>
                <div class="dialog_bd">
                    <div class="dialog_list">
                        <div class="dialog_item">
                            <div class="item_info_table">
                                <div class="info_table_hd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('成交量') }}</text>
                                        <text class="table_text">{{handicap.today_volume_count_str || '--'}}</text>
                                    </div>
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('成交额') }}</text>
                                        <text class="table_text">{{handicap.today_trade_count_price_unit_str || '--'}}</text>
                                    </div>
                                </div>
                                <div class="info_table_bd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('内盘') }}</text>
                                        <text class="table_text warn">{{handicap.is_sell_amount_str || '--'}}</text>
                                    </div>
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('外盘') }}</text>
                                        <text class="table_text safe">{{handicap.is_buy_amount_str || '--'}}</text>
                                    </div>
                                </div>
                            </div>
                            <div class="item_info_table">
                                <div class="info_table_hd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('委比') }}</text>
                                        <text :class="['table_text', handicap.delegate_ratio_percent > 0 ? 'safe' : 'warn']">{{handicap.delegate_ratio_percent_str || '--'}}</text>
                                    </div>
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('涨速') }}</text>
                                        <text :class="['table_text', handicap.rising_speed_5m_price_unit > 0 ? 'safe' : 'warn']">{{handicap.rising_speed_5m_str || '--'}}</text>
                                    </div>
                                </div>
                                <div class="info_table_bd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('换手率') }}</text>
                                        <text class="table_text">{{handicap.turnover_Rate_percent_str || '--'}}</text>
                                    </div>
                                    <div class="table_item">
                                        <text class="table_name">24h {{ $t('涨幅') }}</text>
                                        <text :class="['table_text', handicap.rising_speed_24_percent > 0 ? 'safe' : 'warn']">{{handicap.rising_speed_24_percent_str || '--'}}</text>
                                    </div>
                                </div>
                            </div>
                            <div class="item_info_table item_info_table_noborder">
                                <div class="info_table_hd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('实际价') }}</text>
                                        <text class="table_text">{{handicap.real_price_unit_str || '--'}}</text>
                                    </div>
                                </div>
                                <div class="info_table_bd">
                                    <div class="table_item">
                                        <text class="table_name">{{ $t('手续费') }}</text>
                                        <text class="table_text">{{handicap.platform_fee_price_unit_str || '--'}}</text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
        <ShareComponents :showShare="show_share" :shareConfigs="shareConfigs" @closeShare="closeShare" />
    </div>
</template>
<script>
import { Utils, WxcButton, WxcPanItem, WxcTabPage } from 'weex-ui';
import { buiTabbar } from 'bui-weex'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Ks from '../components/Ks.vue'
import CoinCashFlow from '../components/CoinCashFlow.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import ShareComponents from '../components/ShareComponents.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import utils from '../config/utils'
import common from '../config/common';
const dom = weex.requireModule('dom');
const ScreenShot = weex.requireModule('ScreenShot')
export default {
    components: {
        WxcMinibar,
        WxcButton,
        StatusBar,
        buiTabbar,
        Ks,
        Loadmore,
        Refresher,
        CoinCashFlow,
        Dialog,
        ShareComponents,
        WxcPanItem,
        WxcTabPage
    },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            touchBarHeight: weex.config.env.touchBarHeight || 0,
            title: '',
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
            router_params: {},
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            coin: {},
            coin_ks: [],
            symbol: '',
            selected: {
                pair_symbol: '',
                pair_base: '',
                platform: '',
                is_star: false,
            },
            loading: {
                coin_ks: 'loading',
            },
            is_loadmore: false,
            is_show_dialog: false,
            handicap_raw: {},
            timeout_ts: 5000,
            interval_timmer: null,
            price_unit: {
                key: this.$t('CNY')
            },
            config_platform: {
                enable: 0,
            },
            height_bar: 0,
            share_image: '',
            show_share: false,
            is_shoting: false,
            ScreenShot_flang: false,
            tabTitles: [{
                title: ''
            }, {
                title: ''
            }],
            tabStyles: {
                bgColor: '#FFFFFF',
                titleColor: '#666666',
                activeTitleColor: '#3D3D3D',
                activeBgColor: '#FFFFFF',
                isActiveTitleBold: false,
                iconWidth: 0,
                iconHeight: 0,
                width: 0,
                height: 0,
                fontSize: 24,
                hasActiveBottom: false,
                activeBottomColor: '#FFC900',
                activeBottomHeight: 6,
                activeBottomWidth: 0,
                textPaddingLeft: 10,
                textPaddingRight: 10
            },
            currentTabIndex: 0,
        };
    },
    eros: {
        beforeBackAppear(params, options) {
            // console.log('beforeBackAppear');
            this.setIntervalData();
        },
        appActive() {
            // 前台
            // console.log('appActive');
        },
        appDeactive() {
            // 后台
            // console.log('appDeactive');
            this.clearIntervalTimmer();
        },
        beforeDisappear(options) {
            // 离开页面
            // console.log('beforeDisappear');
            this.clearIntervalTimmer();
        },
        beforeAppear (params, options) {
            // console.log('beforeAppear');
        },
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
            this.height_bar = this.tabPageHeight;
            this.getConfig();
            this.getRouterParams();
        },
        toggleShow() {
            if (this.currentTabIndex === 0) {
                this.currentTabIndex = 1;
            } else {
                this.currentTabIndex = 0;
            }
            this.$refs['wxc-tab-page'].setPage(this.currentTabIndex, null, false);
        },
        addUserCoin() {
            if (this.selected.is_star) {
                this.deleteUserCoin();
            } else {
                this.postUserCoin();
            }
        },
        getConfig() {
            let params = {};
            params.type = 'app_config';
            params.key = 'app_func_switch';
            this.$fetch({
                name: 'getConfig',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    this.config_platform = resData.result.coin_detail_platform || {};
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                console.error('getConfig', err);
                console.log(e.message)
            });
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.symbol = resData.pair_symbol || resData.symbol;
                this.selected.pair_symbol = this.symbol;
                this.selected.pair_base = resData.pair_base;
                this.selected.platform = resData.platform;
                this.title = `${this.symbol}/${resData.pair_base}(${resData.platform})`;
                this.price_unit = this.$storage.getSync('tab_kl_unit') || { key: this.$t('CNY') };
                this.getCoin();
                this.getCoinPair(); // 5秒刷一次
                this.getCoinHandicap(); // 5秒刷一次
                this.postUserTokenDailyReadCoin();
                this.setIntervalData();
            })
        },
        unitChange(unit) {
            this.price_unit = unit;
        },
        fixUnit(data, unit = 'CNY') {
            unit = String(unit).toLowerCase();
            for (let k in data) {
                let price_unit = 'price_' + unit;
                if (k.includes(price_unit)) {
                    let k_unit = k.replace(price_unit, 'price_unit');
                    data[k_unit] = data[k];
                }
            }
            return data;
        },
        showDialog() {
            this.is_show_dialog = true;
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_cointrade_handicap_click');
        },
        closeDialog() {
            this.is_show_dialog = false;
        },
        closeShare() {
            this.show_share = false;
        },
        postUserTokenDailyReadCoin() {
            let params = {};
            params.symbol_id = this.router_params.symbol_id;
            params.block_cc_id = this.router_params.block_cc_id;
            params.quote = this.selected.pair_symbol;
            params.base = this.selected.pair_base;
            params.platform = this.selected.platform;
            this.$fetch({
                name: 'postUserTokenDailyReadCoin',
                method: 'POST',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {

                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        async minibarRightButtonClick() {
            let deviceWidth = weex.config.env.deviceWidth;
            dom.scrollToElement(this.$refs.top_dom, { offset: -300, animated: false });
            let base_height = 1400;
            let dom_info = await this.getDomInfo(this.$refs.CoinCashFlow);
            let dom_height = dom_info.result ? dom_info.size.height : 3000;
            let page_height = parseInt(base_height + dom_height);

            let real_height = parseInt((page_height / 750) * deviceWidth);
            if (deviceWidth <= 720) {
                real_height = real_height >= 3500 ? 3500 : real_height;
            } else {
                real_height = real_height >= 4500 ? 4500 : real_height;
            }
            if (this.currentTabIndex === 0) {
                // K线页截屏
                page_height = this.tabPageHeight + 30;
                real_height = parseInt((page_height / 750) * deviceWidth);
            }
            ScreenShot.resetHeight(real_height);
            this.$notice.loading.show();
            this.is_shoting = true;
            let images_t = await this.ScreenShotShare(page_height, real_height);
            let images_m = await this.ScreenShotShare(page_height, real_height);
            ScreenShot.resetHeight(weex.config.env.deviceHeight);
            this.$notice.loading.hide();
            this.height_bar = this.tabPageHeight;
            this.is_shoting = false;
            if (!images_m.error) {
                this.show_share = true;
            }
        },
        ScreenShotShare(page_height, real_height) {
            this.height_bar = page_height;
            return new Promise((resolve, reject) => {
                let fileName = new Date().getTime() + '_pic.jpg';
                let logo_name = `shot_logo_${this.$locale()}.png`;
                setTimeout(() => {
                    ScreenShot.getScreenShot(real_height, fileName, logo_name, 'bottom', (result) => {
                        this.share_image = 'file://' + result.path;
                        resolve(result);
                    })
                }, 200)
            })
        },
        getDomInfo(refs_dom) {
            return new Promise((resolve, reject) => {
                dom.getComponentRect(refs_dom, option => {
                    resolve(option);
                })
            })
        },
        loadmore() {
            this.is_loadmore = true;
        },
        Loadmoreing() {
            // this.$refs.ks_list.resetLoadmore();
            this.is_loadmore = false;
        },
        getCoin() {
            let params = {};
            params.symbol = this.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.coin = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getCoinPair() {
            let params = {};
            params.platform = this.selected.platform;
            params.pair_base = this.selected.pair_base;
            params.pair_symbol = this.selected.pair_symbol;
            this.$fetch({
                name: 'getCoinPair',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    resData.result.is_star ? resData.result.is_star = true : resData.result.is_star = false;
                    this.selected = resData.result;
                } else {
                    // this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getCoinHandicap() {
            let params = {};
            params.platform = this.selected.platform;
            params.pair_base = this.selected.pair_base;
            params.pair_symbol = this.selected.pair_symbol;
            params.unit = this.price_unit.key;
            this.$fetch({
                name: 'getCoinHandicap',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.handicap_raw = resData.result || {};
                } else {
                    // this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        postUserCoin() {
            let params = {
                platform: this.selected.platform,
                pair_symbol: this.selected.pair_symbol,
                pair_base: this.selected.pair_base,
                symbol_id: this.router_params.symbol_id,
            };
            if (this.selected.platform === '均价') {
                params.pair_symbol = this.selected.symbol || this.symbol;
                params.pair_base = '';
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUserCoin',
                method: 'POST',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.$notice.toast({ message: this.$t('已添加') })
                    this.selected.is_star = true;
                } else {
                    // this.$notice.toast({ message: resData.message });
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        deleteUserCoin() {
            let params = {
                platform: this.selected.platform,
                pair_symbol: this.selected.pair_symbol,
                pair_base: this.selected.pair_base,
                symbol_id: this.router_params.symbol_id,
            };
            if (this.selected.platform === '均价') {
                params.pair_symbol = this.selected.symbol || this.symbol;
                params.pair_base = '';
            }
            this.$notice.loading.show();
            let query_str = utils.getQueryStr(params);
            this.$fetch({
                url: `${API_BaseUrl}/api/user/coin?${encodeURI(query_str)}`,
                method: 'DELETE',
                data: {},
            }).then(resData => {
                if (resData.error === 0) {
                    this.$notice.toast({ message: this.$t('已取消') })
                    this.selected.is_star = false;
                } else {
                    // this.$notice.toast({ message: resData.message });
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        jumpCoinDetail() {
            let { symbol } = this.selected;
            let symbol_id = this.router_params.symbol_id;
            this.$router.open({
                name: 'CoinDetail',
                params: {
                    symbol,
                    symbol_id,
                }
            });
        },
        jumpCoinStare() {
            let { pair_base, pair_symbol, platform, symbol } = this.selected;
            let symbol_id = this.router_params.symbol_id;
            if (platform === '均价') {
                this.$router.open({
                    name: 'Stare',
                    params: {
                        symbol,
                        platform,
                        symbol_id,
                    }
                });
            } else {
                this.$router.open({
                    name: 'Stare',
                    params: {
                        symbol,
                        pair_base,
                        pair_symbol,
                        platform,
                        symbol_id,
                    }
                });
            }
        },
        jumpCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                    pagename: 'CoinDetailKs',
                }
            })
        },
        jumpToWeb() {
            let urls = this.selected.website || '';
            if (!urls) {
                return;
            }
            this.$router.openBrowser(urls);
        },
        setIntervalData() {
            this.clearIntervalTimmer();
            this.interval_timmer = setInterval(() => {
                this.getCoinHandicap();
                this.getCoinPair();
            }, this.timeout_ts)
        },
        clearIntervalTimmer() {
            this.interval_timmer && clearInterval(this.interval_timmer);
            this.interval_timmer = null;
        },
    },
    computed: {
        tabPageHeight() {
            return Utils.env.getPageHeight();
        },
        handicap() {
            return this.fixUnit(this.handicap_raw, this.price_unit.key);
        },
        hideModule() {
            return this.$storage.getSync('hideModule')
        },
        shareConfigs() {
            return {
                title: `${this.router_params.pair_symbol}`, // 分享的标题
                content: `${this.router_params.pair_symbol}`, // 分享的文字内容
                url: ``, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接 http://i.test.bizhihui.vip  Token_Website
                image: this.share_image || 'file:///storage/emulated/0/bizhihui/1541647330690_pic.jpg', // 分享的图片url,
                type: 'Image',
                imageType: 'local'
            }
        },
        ksHeight() {
            let price_info_height = this.$locale() === 'ind' ? 310 : 278;
            return this.tabPageHeight - 100 - price_info_height - this.touchBarHeight;
        },
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
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

.right {
    height: 90px;
    width: 100px;
    justify-content: center;
}

.right_icon {
    text-align: right;
    font-size: 40px;
    color: #444;
}

.middle {
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.middle_title {
    font-size: 36px;
    color: #434343;
    font-weight: bold;
    text-align: center;
    flex: 1;
}

.middle_title_second {
    font-size: 24px;
    color: #434343;
    text-align: center;
    flex: 1;
}

.wrapper_scroller {
    width: 750px;
}

.box_hd {
    width: 750px;
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 30px;
    padding-bottom: 15px;
    background-color: #fff;
    border-color: #f2f3f5;
    border-bottom-width: 4px;
}

.list {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.list_bottom {
    margin-top: 5px;
}

.item {
    flex: 2;
    flex-direction: column;
    margin-bottom: 7px;
}

.item_price {
    flex: 3.4;
}

.item_info {
    flex: 1;
}

.item_24price {
    flex: 2.5;
}

.top {
    color: #9b9da4;
    font-size: 20px;
}

.bottom {
    margin-top: 5px;
    color: #434343;
    font-size: 22px;
    font-weight: bold;
    flex-direction: row;
    align-items: center;
}

.icon_mark {
    text-align: left;
    font-size: 40px;
    color: #7A7A7A;
}

.icon_mark_pankou {
    padding-left: 15px;
}

.top_special {
    margin-top: 10px;
    font-size: 34px;
}

.bottom_special {
    margin-bottom: 10px;
    font-size: 22px;
}

.percent_change {
    padding-left: 15px;
}

.price_cny {
    text-align: left;
    font-weight: bold;
}

.price_usd {
    text-align: left;
}

.box_bd {
    background-color: #fff;
}
.btn_wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 750px;
}
.btn_box {
    height: 98px;
    flex-direction: row;
    border-top-width: 2px;
    border-color: #eee;
    align-items: center;
    justify-content: center;
    background-color: #fff;
}

.btn_item {
    flex: 1;
    height: 68px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-right-width: 1px;
    border-color: #eee;
}

.btn_item_free {
    background-color: #fff;
}

.btn_F10 {}

.btn_item_control {
    color: #fff;
    background-color: @main_color;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

.safe_bg {
    background-color: @safe_color;
}

.warn_bg {
    background-color: @warn_color;
}

.coin_flow {
    padding-bottom: 20px;
}

.logo_image {
    width: 35px;
    height: 35px;
}

.symbol_text {
    padding-top: 3px;
    padding-left: 10px;
    color: #434343;
    font-size: 28px;
}

.icon_btn {
    font-size: 35px;
    color: #b4b4b4;
}

.dialog_box {
    padding: 30px @padding_size;
    background-color: #fff;
    border-radius: 8px;
}

.dialog_hd {
    padding-bottom: 30px;
    flex-direction: row;
    align-items: center;
    border-bottom-width: 1px;
    border-color: #ddd;
}

.dialog_title {
    flex: 1;
    flex-direction: row;
    align-items: center;
}

.dialog_title_text {
    font-size: 26px;
    color: #434343;
}

.dialog_close {
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.icon_close {
    text-align: right;
    font-size: 40px;
    color: #434343;
}

.item_info_table {
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}

.item_info_table_noborder {
    padding-top: 20px;
    border-bottom-width: 0px;
}

.info_table_hd {
    padding-right: 33px;
    flex: 1;
}

.info_table_bd {
    padding-left: 33px;
    flex: 1;
}

.table_item {
    height: 70px;
    flex-direction: row;
    align-items: center;
}

.table_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 2;
}

.table_text {
    font-size: 24px;
    text-align: right;
    color: #434343;
}
.price_box_hd {
    flex-direction: row;
}
.price_box_hd_l {
    flex: 1;
    flex-direction: row;
    align-items: flex-end;
}
.hd_l_big {
    font-size: 48px;
    font-weight: bold;
}
.hd_l_txt {
    font-size: 32px;
    padding-left: 35px;
    font-weight: bold;
    padding-bottom: 5px;
}
.price_box_hd_bt {
    padding: 15px 0;
}
.price_box_bd {
    flex-direction: row;
}
.price_box_bd_l {
    flex: 1;
}
.per_item {
    flex: 1.5;
}
.price_box_bd_bt {
    padding: 20px 0;
}
.price_box_bd_item {
    flex: 2;
    flex-direction: row;
    margin-bottom: 13px;
}
.price_box_bd_txt {
    color: #9b9da4;
    font-size: 20px;
}
.price_box_bd_num {
    color: #434343;
    font-size: 22px;
    font-weight: bold;
    align-items: center;
    padding-left: 15px;
}
.hd_l_small {
     font-size: 36px;
     font-weight: bold;
     padding-bottom: 5px;
 }
</style>
