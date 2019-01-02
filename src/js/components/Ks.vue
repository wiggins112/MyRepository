<template>
    <div class="kl_box">
        <div :class="['wrap_box', is_fullscreen && 'wrap_box_is_fullscreen']">
            <div :class="['ks_box', is_fullscreen && 'ks_box_is_fullscreen']">
                <div class="kl_nav_bar" :style="getKlNavbarStyle" v-if="is_fullscreen">
                    <div class="bar_back" @click="goback">
                        <text class="icon icon_back">&#xe93b;</text>
                        <div class="bar_title">
                            <div class="text1_box">
                                <text class="bar_title_text1">{{router_params.pair_symbol}}/</text>
                                <text class="bar_title_text1">{{router_params.pair_base}}</text>
                            </div>
                            <text class="bar_title_text2">{{coin_pair.id}}</text>
                        </div>
                    </div>
                    <div class="bar_list">
                        <div class="bar_item">
                            <div class="bar_item_top coin_price_top">
                                <text :class="['bar_text', 'coin_price', coin_pair.percent_change_8am > 0 ? 'safe' : 'warn']">{{coin_pair.price_local_str}}</text>
                            </div>
                            <div class="bar_item_bottom">
                                <text :class="['bar_text', 'float_data', coin_pair.percent_change_8am > 0 ? 'safe' : 'warn']">{{String(coin_pair.price_local_change_8am_str || '').replace('¥', '')}}</text>
                                <text :class="['bar_text', 'float_data', 'percent_change', coin_pair.percent_change_8am > 0 ? 'safe' : 'warn']">{{String(coin_pair.percent_change_8am_str || '')}}</text>
                            </div>
                        </div>
                        <div class="bar_item">
                            <div class="bar_item_top">
                                <text class="bar_text value_name">24h{{ $t('最高') }}</text>
                                <text class="bar_text value_data">{{coin_pair.price_local_high_24h_str || '--'}}</text>
                            </div>
                            <div class="bar_item_bottom">
                                <text class="bar_text value_name">24h{{ $t('最低') }}</text>
                                <text class="bar_text value_data">{{coin_pair.price_local_low_24h_str || '--'}}</text>
                            </div>
                        </div>
                        <div class="bar_item bar_item_flex">
                            <div class="bar_item_top">
                                <text class="bar_text value_name">{{ $t('振幅') }}</text>
                                <text class="bar_text value_data">{{handicap.amplitude_percent_str || ''}}</text>
                            </div>
                            <div class="bar_item_bottom">
                                <text class="bar_text value_name">{{ $t('量比') }}</text>
                                <text class="bar_text value_data">{{handicap.quantity_ratio_percent_str || '--'}}</text>
                            </div>
                        </div>
                        <div class="bar_item bar_item_flex">
                            <div class="bar_item_top">
                                <text class="bar_text value_name">{{ $t('成交量') }}</text>
                                <text class="bar_text value_data">{{handicap.today_volume_count_str || '--'}}</text>
                            </div>
                            <div class="bar_item_bottom">
                                <text class="bar_text value_name">{{ $t('涨跌速') }}</text>
                                <text :class="['bar_text', 'value_data', coin_pair.rising_speed_5m > 0 ? 'safe' : 'warn']">{{handicap.rising_speed_5m_str || '--'}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="['kl_head', is_fullscreen && 'kl_head_is_fullscreen']" :style="getKlHeadStyle">
                    <div class="tabs_head">
                        <div :class="['tab_head']" @click="toggleTabKl">
                            <text class="tab_text">{{current_kl_tab.name || $t('分时')}}</text>
                            <text :class="['icon', 'tab_icon', show_klmodel && 'tab_icon_active']">&#xe945;</text>
                        </div>
                        <div :class="['tab_head']" @click="toggleTabUnit">
                            <text :class="['tab_text']">{{current_unit_tab.seletcedtext || $t('CNY')}}</text>
                            <text :class="['icon', 'tab_icon', show_unitmodel && 'tab_icon_active']">&#xe945;</text>
                        </div>
                        <div :class="['tab_head']" @click="toggleTabMainindex" v-if="!is_ios">
                            <text :class="['tab_text']">{{current_mainindex_tab.seletcedtext || $t('主指标')}}</text>
                            <text :class="['icon', 'tab_icon', show_mainindexmodel && 'tab_icon_active']">&#xe945;</text>
                        </div>
                        <div :class="['tab_head']" @click="toggleTabChildindex" v-if="!is_ios">
                            <text :class="['tab_text']">{{current_childindex_tab.seletcedtext || $t('副指标')}}</text>
                            <text :class="['icon', 'tab_icon', show_childindexmodel && 'tab_icon_active']">&#xe945;</text>
                        </div>
                    </div>
                    <!-- <div class="kongpan" @click="jumpCoinExplain('kongpanzhi')">
                        <text class="kongpan_text value_name">{{ $t('控盘值') }}：{{handicap.amount_info_percent_str || '--'}}</text>
                        <text class="icon icon_mark">&#xe936;</text>
                    </div> -->
                    <!-- 因为这个控盘值显示不出来，所以暂时隐藏 -->
                    <div class="macd" v-if="is_ios">
                        <text class="ma_text ma5">MA5</text>
                        <text class="ma_text ma10">MA10</text>
                        <text class="ma_text ma20">MA20</text>
                    </div>
                </div>
                <div :class="['kl_body', is_fullscreen && 'kl_body_is_fullscreen']" v-if="router_loaded">
                    <div :style="getKlStyle">
                        <bmchart :style="getKlStyle" ref="charts" :options="$format(ChartOptions)" @finish='finish' v-if="loading.coin_ks === 'loaded' && is_ios"></bmchart>
                        <BzhKline ref="bzhkline_dom" :lang="$locale()" :style="getKlStyle" @loadData="loadData" v-if="!first_loade && !is_ios"></BzhKline>
                    </div>
                    <div class="loading_box" :style="getKlStyle" v-if="loading.coin_ks === 'loading' || loading.coin_ks === 'empty' || loading.coin_ks === 'error' || loading_echart">
                        <Loadmore :loading="loading.coin_ks" class="loading"></Loadmore>
                    </div>
                    <div class="btn_fullscreen" @click="toggleFullscreen" v-if="!is_fullscreen && this.loading.coin_ks !== 'empty'">
                        <text class="icon icon_fullscreen">&#xe938;</text>
                    </div>
                </div>
                <div class="un_fullscreen" v-if="!is_fullscreen">
                    <wxc-popover ref="kl_model_popover" coverColor="transparent" :hasArrow="false" :position="popoverPosition" @wxcPopoverClosed="wxcPopoverClosed">
                        <div slot :class="['kl_model', is_fullscreen && 'kl_model_is_fullscreen']">
                            <div class="model_box">
                                <div :class="['model_item', tab.active && 'model_item_active']" v-for="(tab, i) in tab_items" @click="tabChart(tab)">
                                    <text :class="['item_text', tab.active && 'item_text_active']">{{tab.name}}</text>
                                </div>
                            </div>
                        </div>
                    </wxc-popover>
                    <wxc-popover ref="kl_unit_popover" coverColor="transparent" :hasArrow="false" :position="popoverPosition" @wxcPopoverClosed="wxcPopoverClosed">
                        <div slot :class="['kl_model']">
                            <div :class="['model_box', 'unit_model_box', 'unfullscreen_unit_model_box']">
                                <div :class="['model_item', (current_unit_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_btns" @click="popoverButtonClicked({index: i})">
                                    <text :class="['item_text', (current_unit_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                                </div>
                            </div>
                        </div>
                    </wxc-popover>
                    <wxc-popover ref="kl_mainindex_popover" coverColor="transparent" :hasArrow="false" :position="popoverPosition" @wxcPopoverClosed="wxcPopoverClosed">
                        <div slot :class="['kl_model']">
                            <div :class="['model_box', 'unit_model_box', 'unfullscreen_unit_model_box']">
                                <div :class="['model_item', (current_mainindex_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_mainindex_btns" @click="popoverMainindexClicked({index: i})">
                                    <text :class="['item_text', (current_mainindex_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                                </div>
                            </div>
                        </div>
                    </wxc-popover>
                    <wxc-popover ref="kl_childindex_popover" coverColor="transparent" :hasArrow="false" :position="popoverPosition" @wxcPopoverClosed="wxcPopoverClosed">
                        <div slot :class="['kl_model']">
                            <div :class="['model_box', 'unit_model_box', 'unfullscreen_unit_model_box']">
                                <div :class="['model_item', (current_childindex_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_childindex_btns" @click="popoverChildindexClicked({index: i})">
                                    <text :class="['item_text', (current_childindex_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                                </div>
                            </div>
                        </div>
                    </wxc-popover>
                </div>
                <div slot :class="['kl_model', is_fullscreen && 'kl_model_is_fullscreen']" v-if="show_klmodel && is_fullscreen" @click="toggleTabKl">
                    <div :class="['model_box', is_fullscreen && 'model_box_is_fullscreen']">
                        <div :class="['model_item', tab.active && 'model_item_active']" v-for="(tab, i) in tab_items" @click="tabChart(tab)">
                            <text :class="['item_text', tab.active && 'item_text_active']">{{tab.name}}</text>
                        </div>
                    </div>
                </div>
                <div slot :class="['kl_model', is_fullscreen && 'kl_model_is_fullscreen']" v-if="show_unitmodel && is_fullscreen" @click="toggleTabUnit">
                    <div :class="['model_box', 'unit_model_box', is_fullscreen && 'model_box_is_fullscreen']">
                        <div :class="['model_item', (current_unit_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_btns" @click="popoverButtonClicked({index: i})">
                            <text :class="['item_text', (current_unit_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                        </div>
                    </div>
                </div>
                <div slot :class="['kl_model', is_fullscreen && 'kl_model_is_fullscreen']" v-if="show_mainindexmodel && is_fullscreen" @click="toggleTabMainindex">
                    <div :class="['model_box', 'unit_model_box', is_fullscreen && 'model_box_is_fullscreen']" :style="{left: popoverPosition.x + 60, top: 0}">
                        <div :class="['model_item', (current_mainindex_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_mainindex_btns" @click="popoverMainindexClicked({index: i})">
                            <text :class="['item_text', (current_mainindex_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                        </div>
                    </div>
                </div>
                <div slot :class="['kl_model', is_fullscreen && 'kl_model_is_fullscreen']" v-if="show_childindexmodel && is_fullscreen" @click="toggleTabChildindex">
                    <div :class="['model_box', 'unit_model_box', is_fullscreen && 'model_box_is_fullscreen']" :style="{left: popoverPosition.x + 200, top: 0}">
                        <div :class="['model_item', (current_childindex_tab.active_index === i) && 'model_item_active']" v-for="(tab, i) in popo_childindex_btns" @click="popoverChildindexClicked({index: i})">
                            <text :class="['item_text', (current_childindex_tab.active_index === i) && 'item_text_active']">{{tab.text}}</text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { Utils, WxcOverlay } from 'weex-ui';
import Loadmore from './Loadmore.vue'
import WxcPopover from './WxcPopover.vue'
import filters from '../config/filters.js'
import { Iconfont } from '../config/config.js'
const navigator = weex.requireModule('bmNavigator');
const color = {
    green: '#00C19A',
    red: '#F3583E',
}
export default {
    components: { Loadmore, WxcOverlay, WxcPopover },
    data() {
        return {
            filters,
            statusBarHeight: Number(weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40),
            is_phonex: weex.config.env.touchBarHeight ? true : false,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            ChartOptions: {},
            current_kl_tab: {
                format: 'MM-dd hh:mm',
            },
            current_unit_tab: {},
            current_mainindex_tab: {
                active_index: 0,
            },
            current_childindex_tab: {
                active_index: 0,
            },
            tab_items: [{
                name: this.$t('分时'),
                value: '1s',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('1分'),
                value: '1m',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('5分'),
                value: '5m',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('15分'),
                value: '15m',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('30分'),
                value: '30m',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('1小时'),
                value: '1h',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('4小时'),
                value: '4h',
                format: 'MM-dd hh:mm',
                active: false
            }, {
                name: this.$t('12小时'),
                value: '12h',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('1天'),
                value: '1d',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('3天'),
                value: '3d',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('1周'),
                value: '1w',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('1月'),
                value: '1mon',
                format: 'yyyy-MM-dd',
                active: false
            }],
            kline_times: [],
            loading_echart: true,
            tooltip_data: {},
            show_klmodel: false,
            show_unitmodel: false,
            show_mainindexmodel: false,
            show_childindexmodel: false,
            popoverPosition: { x: 200, y: 520 },
            popoverArrowPosition: { pos: 'top', x: 160 },
            popo_btns: [{
                    seletcedtext: this.$t('CNY'),
                    text: this.$t('CNY'),
                    key: this.$t('CNY')
                },
                {
                    seletcedtext: 'USD',
                    text: 'USD',
                    key: 'USD'
                }
            ],
            popo_mainindex_btns: [{
                    seletcedtext: 'MA',
                    text: this.$t('MA'),
                    key: 'ma'
                },
                {
                    seletcedtext: 'BOLL',
                    text: 'BOLL',
                    key: 'boll'
                },
                {
                    seletcedtext: this.$t('主指标'),
                    text: this.$t('关闭'),
                    key: ''
                }
            ],
            popo_childindex_btns: [{
                    seletcedtext: 'MACD',
                    text: 'MACD',
                    key: 'macd'
                },
                {
                    seletcedtext: 'KDJ',
                    text: 'KDJ',
                    key: 'kdj'
                },
                {
                    seletcedtext: 'RSI',
                    text: 'RSI',
                    key: 'rsi'
                },
                {
                    seletcedtext: 'WR',
                    text: 'WR',
                    key: 'wr'
                },
                {
                    seletcedtext: this.$t('副指标'),
                    text: this.$t('关闭'),
                    key: ''
                }
            ],
            coin_ks: [],
            router_params: {},
            loading: {
                coin_ks: 'loading'
            },
            coin_ks_page: 0,
            router_loaded: false,
            nav_bar_height: 130,
            coin_pair: {},
            handicap: {},
            timeout_ts: 5000,
            interval_timmer: null,
            first_loade: true,
        }
    },
    props: {
        height: {
            type: Number,
            default: 700,
        },
    },
    watch: {
        coin_ks(newVal, oldVal) {
            if (newVal.length) {
                this.initEchart();
            } else {

            }
        },
    },
    eros: {
        beforeBackAppear(params, options) {
            if (this.is_fullscreen) {
                // 隐藏状态栏
                if (navigator && navigator.statusBarHidden) {
                    navigator.statusBarHidden(true)
                }
                this.setIntervalData();
            }
        },
        // app 前后台相关 start 
        appActive() {
            // 前台
        },
        appDeactive() {
            // 后台
            this.clearIntervalTimmer();
        },
        // app 前后台相关 end 
        beforeDisappear(options) {
            // 离开页面
            this.clearIntervalTimmer();
            // 显示状态栏
            if (navigator && navigator.statusBarHidden) {
                navigator.statusBarHidden(false)
            }
        }
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
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_loaded = true;
                this.router_params = resData;
                this.getCoinInfoData();
                this.getCoinPair().then((response) => {
                    this.tab_items = this.kline_times;
                    this.initCurrentFilterTab();
                    this.getCoinKs();
                })
            })
        },
        loadData() {
            if (this.loading.coin_ks === 'nomore') {
                return;
            }
            this.coin_ks_page++;
            if (this.coin_ks_page > 1) {
                this.getCoinKs().then((response) => {
                    this.addAndroidData();
                })
            } else {
                this.addAndroidData();
            }
        },
        addAndroidData() {
            let ks_data = [];
            for (let kd of this.coin_ks) {
                ks_data.push({
                    "Close": kd.close,
                    "Date": this.filters.dateFormat(kd.ktime, 'MM/dd hh:mm'),
                    "High": kd.high,
                    "Low": kd.low,
                    "Open": kd.open,
                    "Volume": kd.vol,
                })
            }
            this.$refs.bzhkline_dom.addData(ks_data);
            if (this.coin_ks_page === 1) {
                this.$refs.bzhkline_dom.setChildDraw('macd');
            }
            this.loading_echart = false;
        },
        getCoinInfoData() {
            if (this.is_fullscreen) {
                this.getCoinHandicap();
                this.setIntervalData();
                if (navigator && navigator.statusBarHidden) {
                    navigator.statusBarHidden(true)
                }
            }
        },
        initCurrentFilterTab() {
            let active_tab = this.tab_items.find(i => i.active);
            // 当前选中的分时类型
            this.current_kl_tab = this.$storage.getSync('tab_kl_type') || active_tab || {};
            for (let type of this.tab_items) {
                if (type.value === this.current_kl_tab.value) {
                    type.active = true;
                } else {
                    type.active = false;
                }
            }
            // 当前选中的单位
            if (this.router_params.pair_base !== '均价') {
                this.popo_btns.push({ seletcedtext: this.router_params.pair_base, text: this.router_params.pair_base, key: this.router_params.pair_base });
            }
            let tab_kl_unit = this.$storage.getSync('tab_kl_unit') || {};
            let flang = false;
            if (tab_kl_unit.key) {
                for (let [index, unit] of this.popo_btns.entries()) {
                    if (unit.key === tab_kl_unit.key) {
                        flang = true;
                        this.current_unit_tab = tab_kl_unit;
                        this.current_unit_tab.active_index = index;
                    }
                }
                if (!flang) {
                    this.current_unit_tab = this.popo_btns[0] || {};
                    this.current_unit_tab.active_index = 0;
                }
            } else {
                this.current_unit_tab = this.popo_btns[0] || {};
                this.current_unit_tab.active_index = 0;
            }

        },
        goback() {
            this.$router.back();
            this.$navigator.setNavigationInfo({
                statusBarStyle: 'Default'
            });
        },
        openKsFullscreen() {
            let { pair_symbol, pair_base, platform } = this.router_params;
            let params = { pair_symbol, pair_base, platform }
            params.is_fullscreen = true;
            this.$router.open({
                name: 'Ks',
                params: params,
                statusBarStyle: 'LightContent',
                navShow: false,
                gesBack: false,
            })
        },
        jumpCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                }
            })
        },
        getCoinKs() {
            let { pair_symbol, pair_base, platform } = this.router_params;
            let params = { pair_symbol, pair_base, platform }
            params.type = this.current_kl_tab.value;
            params.unit = this.current_unit_tab.key;
            params.size = this.is_ios ? 500 : 200;
            params.page = this.coin_ks_page || 1;
            if (this.coin_ks.length && this.coin_ks.length >= 1) {
                let start_item = this.coin_ks[0];
                let end_item = this.coin_ks[this.coin_ks.length - 1];
                params.end_ktime = end_item.ktime;
                params.start_ktime = start_item.ktime;
            }
            this.loading.coin_ks = 'loading';
            return this.$fetch({
                name: 'getCoinKs',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.first_loade = false;
                    this.loading.coin_ks = 'loaded';
                    if (!resData.items.length) {
                        if (params.page === 1) {
                            this.loading.coin_ks = 'empty';
                        } else {
                            this.loading.coin_ks = 'nomore';
                        }
                    }
                    this.coin_ks = resData.items || [];
                } else {
                    this.loading.coin_ks = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getCoinPair() {
            let { pair_symbol, pair_base, platform } = this.router_params;
            let params = { pair_symbol, pair_base, platform }
            return this.$fetch({
                name: 'getCoinPair',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.coin_pair = resData.result || {};
                    this.kline_times = resData.result.kline_times || [];
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getCoinHandicap() {
            let { pair_symbol, pair_base, platform } = this.router_params;
            let params = { pair_symbol, pair_base, platform }
            this.$fetch({
                name: 'getCoinHandicap',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.handicap = resData.result || {};
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        wxcOverlayBodyClicking() {

        },
        finish() {
            this.loading_echart = false;
            // this.handleEchartMouseEvent();
        },
        toggleFullscreen() {
            this.openKsFullscreen();
        },
        toggleTabKl(e) {
            this.show_unitmodel = false;
            this.show_mainindexmodel = false;
            this.show_childindexmodel = false;
            this.show_klmodel = !this.show_klmodel;
            if (this.is_fullscreen) {
                return;
            }
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 65;
            this.$refs['kl_model_popover'].wxcPopoverShow();
        },
        toggleTabUnit(e) {
            this.show_klmodel = false;
            this.show_mainindexmodel = false;
            this.show_childindexmodel = false;
            this.show_unitmodel = !this.show_unitmodel;
            if (this.is_fullscreen) {
                return;
            }
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 60;
            this.$refs['kl_unit_popover'].wxcPopoverShow();
        },
        toggleTabMainindex(e) {
            this.show_unitmodel = false;
            this.show_klmodel = false;
            this.show_childindexmodel = false;
            this.show_mainindexmodel = !this.show_mainindexmodel;
            if (this.is_fullscreen) {
                return;
            }
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 60;
            this.$refs['kl_mainindex_popover'].wxcPopoverShow();
        },
        toggleTabChildindex(e) {
            this.show_unitmodel = false;
            this.show_klmodel = false;
            this.show_mainindexmodel = false;
            this.show_childindexmodel = !this.show_childindexmodel;
            if (this.is_fullscreen) {
                return;
            }
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 60;
            this.$refs['kl_childindex_popover'].wxcPopoverShow();
        },
        tabChart(tab) {
            this.current_kl_tab = tab;
            for (let item of this.tab_items) {
                item.active = false;
            }
            tab.active = true;
            this.show_klmodel = false;
            this.$storage.setSync('tab_kl_type', this.current_kl_tab); // 本地存储选择的过滤条件
            this.coin_ks = [];
            this.coin_ks_page = 0;
            this.first_loade = true;
            this.getCoinKs();
            if (!this.is_fullscreen) {
                this.$refs['kl_model_popover'].hideAction();
            }
        },
        tabUnitChart(tab) {
            this.current_kl_tab = tab;
            for (let item of this.tab_items) {
                item.active = false;
            }
            tab.active = true;
        },
        popoverButtonClicked(obj) {
            let index = obj.index;
            this.current_unit_tab = this.popo_btns[index];
            this.current_unit_tab.active_index = index;
            this.coin_ks = [];
            this.coin_ks_page = 0;
            this.first_loade = true;
            this.show_unitmodel = false;
            this.getCoinKs();
            this.$storage.setSync('tab_kl_unit', this.current_unit_tab); // 本地存储选择的过滤条件
            this.$emit('unitChange', this.current_unit_tab);
            if (!this.is_fullscreen) {
                this.$refs['kl_unit_popover'].hideAction();
            }
        },
        popoverMainindexClicked(obj) {
            let index = obj.index;
            this.current_mainindex_tab = this.popo_mainindex_btns[index];
            this.current_mainindex_tab.active_index = index;
            this.$refs.bzhkline_dom.setMainDraw(this.current_mainindex_tab.key || '');
            this.show_mainindexmodel = false;
            if (!this.is_fullscreen) {
                this.$refs['kl_mainindex_popover'].hideAction();
            }
        },
        popoverChildindexClicked(obj) {
            let index = obj.index;
            this.current_childindex_tab = this.popo_childindex_btns[index];
            this.current_childindex_tab.active_index = index;
            
            this.$refs.bzhkline_dom.setChildDraw(this.current_childindex_tab.key || '');
            this.show_childindexmodel = false;
            if (!this.is_fullscreen) {
                this.$refs['kl_childindex_popover'].hideAction();
            }
        },
        wxcPopoverClosed() {
            this.show_unitmodel = false;
            this.show_mainindexmodel = false;
            this.show_klmodel = false;
            this.show_childindexmodel = false;
        },
        initEchart() {
            this.loading_echart = true;
            let ktime = [];
            let vol = [];
            let ks_data = [];
            let mas = {
                '5': [],
                '10': [],
                '20': [],
            }
            let average = [5, 10, 20];
            let ks_unit = '';
            let max_open = Math.max.apply(Math, this.coin_ks.map(function(o) { return o.open }));
            for (let [index, k] of this.coin_ks.entries()) {
                ktime.push(this.filters.dateFormat(k.ktime, 'yyyy/MM/dd hh:mm'));
                vol.push({
                    value: this.filters.fixNumber(k.vol),
                    itemStyle: {
                        normal: {
                            color: k.open > k.close ? color.red : color.green
                        }
                    }
                });
                if (this.$locale() === 'zh-CN') {
                    if (max_open >= 10000) {
                        ks_unit = '万';
                        ks_data.push([k.open / 10000, k.close / 10000, k.low / 10000, k.high / 10000]);
                    } else {
                        ks_unit = '';
                        ks_data.push([k.open, k.close, k.low, k.high]);
                    }
                } else {
                    if (max_open >= 1000000) {
                        ks_unit = this.$t('百万');
                        ks_data.push([k.open / 1000000, k.close / 1000000, k.low / 1000000, k.high / 1000000]);
                    } else {
                        ks_unit = '';
                        ks_data.push([k.open, k.close, k.low, k.high]);
                    }
                }

            }
            for (let avg of average) {
                mas[avg] = this.calculateMA(avg, ks_data); // macd 约到2位小数
            }
            var colorList = ['#74bace', '#74bace', '#f7b237', '#ae58c4', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
            var labelFont = 'bold 12px Sans-serif';
            let option = {
                renderer: this.is_ios ? 'canvas' : 'svg',
                animation: false,
                color: colorList,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            type: 'dashed'
                        },
                        lineStyle: {
                            type: 'dashed'
                        },
                    },
                    transitionDuration: 0,
                    textStyle: {
                        fontSize: 10,
                        color: '#fff'
                    },
                    backgroundColor: 'rgba(0,0,0, 0.7)',
                    formatter: this.language === 'zh-CN' ? function(params, ticket, callback) {
                        let time_str = '';
                        let main_str = '';
                        for (let m of params) {
                            let num_strs = [];
                            // 小数位处理，小于1的保留小数位后10位，小于10的保留小数位后4位，其他保留2位，删掉末尾多余的0
                            for (var i = m.value.length - 1; i >= 0; i--) {
                                let fixed_num = m.value[i];
                                if (Math.abs(m.value[i]) < 1) {
                                    fixed_num = new Number(m.value[i]).toFixed(10).replace(/0+$/, '');
                                } else if (Math.abs(m.value[i]) < 10) {
                                    fixed_num = new Number(m.value[i]).toFixed(4).replace(/0+$/, '');
                                } else {
                                    fixed_num = new Number(m.value[i]).toFixed(2).replace(/0+$/, '');
                                }
                                num_strs[i] = fixed_num;
                            }
                            time_str = `${m.axisValue} <br>`;
                            if (m.seriesType === 'candlestick') {
                                main_str += `开：<span style="color: ${m.color}">${num_strs[1]}${m.seriesName}</span> <br>`
                                main_str += `收：<span style="color: ${m.color}">${num_strs[2]}${m.seriesName}</span> <br>`
                                main_str += `低：<span style="color: ${m.color}">${num_strs[3]}${m.seriesName}</span> <br>`
                                main_str += `高：<span style="color: ${m.color}">${num_strs[4]}${m.seriesName}</span> <br>`
                            } else {
                                main_str += `${m.seriesName}：<span style="color: ${m.color}">${m.value}</span> <br>`
                            }
                        }
                        return time_str + main_str;
                    } : function(params, ticket, callback) {
                        let time_str = '';
                        let main_str = '';
                        for (let m of params) {
                            let num_strs = [];
                            // 小数位处理，小于1的保留小数位后10位，小于10的保留小数位后4位，其他保留2位，删掉末尾多余的0
                            for (var i = m.value.length - 1; i >= 0; i--) {
                                let fixed_num = m.value[i];
                                if (Math.abs(m.value[i]) < 1) {
                                    fixed_num = new Number(m.value[i]).toFixed(10).replace(/0+$/, '');
                                } else if (Math.abs(m.value[i]) < 10) {
                                    fixed_num = new Number(m.value[i]).toFixed(4).replace(/0+$/, '');
                                } else {
                                    fixed_num = new Number(m.value[i]).toFixed(2).replace(/0+$/, '');
                                }
                                num_strs[i] = fixed_num;
                            }
                            time_str = `${m.axisValue} <br>`;
                            if (m.seriesType === 'candlestick') {
                                main_str += `open：<span style="color: ${m.color}">${num_strs[1]}${m.seriesName}</span> <br>`
                                main_str += `close：<span style="color: ${m.color}">${num_strs[2]}${m.seriesName}</span> <br>`
                                main_str += `lowest：<span style="color: ${m.color}">${num_strs[3]}${m.seriesName}</span> <br>`
                                main_str += `highest：<span style="color: ${m.color}">${num_strs[4]}${m.seriesName}</span> <br>`
                            } else {
                                main_str += `${m.seriesName}：<span style="color: ${m.color}">${m.value}</span> <br>`
                            }
                        }
                        return time_str + main_str;
                    },
                    position: (pos, params, el, elRect, size) => {
                        var obj = {
                            top: 5
                        };
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    }
                },
                axisPointer: {
                    link: [{
                        xAxisIndex: [0, 1]
                    }]
                },
                dataZoom: [{
                    type: 'inside',
                    show: true,
                    realtime: true,
                    start: this.is_fullscreen ? 75 : 85,
                    end: 100,
                    xAxisIndex: [0, 1],
                    bottom: '15%'
                }],
                xAxis: [{
                    type: 'category',
                    data: ktime,
                    boundaryGap: false,
                    splitLine: { show: false },
                    axisLine: { show: false },
                    axisLabel: {
                        show: false
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        show: true,
                        label: { show: false },
                    }
                }, {
                    type: 'category',
                    gridIndex: 1,
                    data: ktime,
                    boundaryGap: false,
                    splitLine: { show: false },
                    axisLabel: {
                        show: true,
                        formatter: function(value) {
                            return echarts.format.formatTime('MM/dd hh:mm', value);
                        }
                    },
                    axisTick: { show: false },
                    axisLine: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        show: true,
                        label: {
                            show: true,
                            formatter: function(params) {
                                return echarts.format.formatTime('MM/dd hh:mm', params.value);
                            }
                        },
                    }
                }],
                yAxis: [{
                    scale: true,
                    axisLine: { show: false },
                    splitLine: {
                        lineStyle: {
                            color: '#f3f3f3',
                            type: 'dashed',
                        }
                    },
                    axisTick: { show: false },
                    axisLabel: {
                        color: '#999',
                        fontSize: '10',
                        inside: true,
                        formatter: '{value}' + ks_unit
                    },
                    axisPointer: {
                        show: true,
                        label: { show: true },
                    }
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisPointer: {
                        show: true
                    }
                }],
                grid: [{
                    left: this.is_fullscreen ? 0 : 5,
                    right: this.is_fullscreen ? 0 : 5,
                    top: 20,
                    height: '51%'
                }, {
                    left: this.is_fullscreen ? 0 : 5,
                    right: this.is_fullscreen ? 0 : 5,
                    height: '30%',
                    top: '58%'
                }],
                graphic: [{
                    type: 'group',
                    left: 'center',
                    top: 70,
                    width: 300,
                    bounding: 'raw',
                    children: [{
                        id: 'MA5',
                        type: 'text',
                        style: { fill: colorList[1], font: labelFont },
                        left: 0
                    }, {
                        id: 'MA10',
                        type: 'text',
                        style: { fill: colorList[2], font: labelFont },
                        left: 'center'
                    }, {
                        id: 'MA20',
                        type: 'text',
                        style: { fill: colorList[3], font: labelFont },
                        right: 0
                    }]
                }],
                series: [{
                    name: this.$t('成交量'),
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: vol
                }, {
                    type: 'candlestick',
                    name: ks_unit,
                    data: ks_data,
                    itemStyle: {
                        normal: {
                            color: '#00C19A',
                            color0: '#F3583E',
                            borderColor: '#00C19A',
                            borderColor0: '#F3583E'
                        },

                    }
                }, {
                    name: 'MA5',
                    type: 'line',
                    data: mas['5'],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }, {
                    name: 'MA10',
                    type: 'line',
                    data: mas['10'],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }, {
                    name: 'MA20',
                    type: 'line',
                    data: mas['20'],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }]
            };
            this.ChartOptions = option;
        },
        handleEchartMouseEvent() {
            this.$refs.charts.on('click', (params) => {
                console.log(params)
            })
        },
        calculateMA(dayCount, data) {
            let result = [];
            for (let i = 0, len = data.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                let sum = 0;
                for (let j = 0; j < dayCount; j++) {
                    sum += data[i - j][1];
                }
                result.push((sum / dayCount).toFixed(4));
            }
            return result;
        },
        setIntervalData() {
            this.clearIntervalTimmer();
            this.interval_timmer = setInterval(() => {
                this.getCoinHandicap();
                this.getCoinPair();
            }, this.timeout_ts)
        },
        clearIntervalTimmer() {
            if (this.interval_timmer) {
                clearInterval(this.interval_timmer);
                this.interval_timmer = null;
            }
        },
    },
    computed: {
        PageHeight() {
            return Utils.env.getPageHeight();
        },
        kl_head_height() {
            return this.is_fullscreen ? 80 : 70
        },
        is_fullscreen() {
            return this.router_params.is_fullscreen;
        },
        getKlNavbarStyle() {
            return {
                width: this.is_phonex ? this.PageHeight : this.PageHeight + 2 * this.statusBarHeight,
                height: this.nav_bar_height,
            }
        },
        getKlStyle() {
            let style = {};
            if (this.is_fullscreen) {
                style = {
                    width: this.is_phonex ? this.PageHeight : this.PageHeight + 2 * this.statusBarHeight,
                    height: 750 - this.kl_head_height - this.nav_bar_height
                }
            } else {
                style = {
                    width: 750,
                    height: this.height
                }
            }
            return style;
        },
        getKlHeadStyle() {
            let style = {};
            if (this.is_fullscreen) {
                style = {
                    width: this.is_phonex ? this.PageHeight : this.PageHeight + 2 * this.statusBarHeight,
                    height: this.kl_head_height
                }
            } else {
                style = {
                    width: 750,
                    height: this.kl_head_height
                }
            }
            return style;
        },
        language() {
            return this.$storage.getSync('language');
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    font-family: iconfont2;
}

.icon_back {
    font-size: 45px;
    color: #434343;
}

.icon_fullscreen {
    font-size: 45px;
    color: #FAD187;
}

.kl_box {}

.wrap_box {}

.ks_box {
    position: relative;
}

.kl_head {
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
}

.kl_body {
    position: relative;
}

.loading_box {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    margin: auto;
    background-color: rgba(255, 255, 255, 0.5);
    align-items: center;
    justify-content: center;
}

.loading {
    margin-top: -210px;
}

.tabs_head {
    flex-direction: row;
}

.kongpan {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}

.macd {
    margin-right: 15px;
    flex-direction: row;
    align-items: center;
}

.ma_text {
    margin-right: 15px;
    line-height: 60px;
    font-size: 20px;
}

.tab_head {
    margin: 7px 0;
    width: 140px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.tab_head:last-child {
    margin-right: 0;
}

.tab_text,
.tab_icon {
    text-align: center;
    color: #434343;
    font-size: 20px;
}

.tab_icon {
    margin-top: 5px;
    margin-left: 15px;
    font-size: 14px;
    color: #a1a1a1;
}

.tab_icon_active {
}

.active {
    border-bottom-width: 3px;
    border-color: @main_color;
}

.ma5 {
    color: #74bace;
}

.ma10 {
    color: #f7b237;
}

.ma20 {
    color: #ae58c4;
}

.btn_fullscreen {
    position: absolute;
    right: 25px;
    bottom: 145px;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 100%;
    opacity: 0.7;
}

.model_box {
    padding-top: @padding_size;
    padding-left: @padding_size;
    padding-right: @padding_size;
    width: 750px;
    flex-direction: row;
    flex-wrap: wrap;
    background-color: #fff;
    border-bottom-width: 1px;
    border-color: #ddd;
}

.model_item {
    margin-bottom: 25px;
    margin-right: 5px;
    width: 135px;
    height: 50px;
    align-items: center;
    justify-content: center;
}

.model_item_active {
    background-color: #FAD187;
    color: #fff;
    border-radius: 6px;
}

.item_text_active {
    color: #fff;
}

.item_text {
    font-size: 28px;
    color: #434343;
    text-align: center;
}

.wrap_box_is_fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    align-items: center;
    justify-content: center;
}

.ks_box_is_fullscreen {
    transform: rotate(90deg);
    transition-property: transform;
    transition-duration: 0.3s;
    transition-delay: 0s;
    transition-timing-function: linear;
}

.kl_head_is_fullscreen {
    border-top-width: 1px;
    border-left-width: 1px;
    border-right-width: 1px;
    border-color: #eee;
}

.kl_body_is_fullscreen {
    border-left-width: 1px;
    border-right-width: 1px;
    border-color: #eee;
}

.kl_model_is_fullscreen {
    position: absolute;
    top: 60px + 150px;
    left: 0;
    right: 0;
    bottom: 0;
}

.unit_model_box {
    left: 120px;
    width: 190px;
    border-right-width: 1px;
    border-top-width: 1px;
    border-left-width: 1px;
    border-bottom-width: 1px;
    border-radius: 6px;
}

.unfullscreen_unit_model_box {
    left: 0px;
}

.model_box_is_fullscreen {
    border-right-width: 1px;
    border-top-width: 1px;
    border-left-width: 1px;
    border-bottom-width: 1px;
    border-radius: 6px;
}

.kl_nav_bar {
    background-color: #fff;
    border-bottom-width: 20px;
    border-color: #EEF1F5;
    flex-direction: row;
    align-items: center;
}

.bar_back {
    padding-left: 15px;
    flex-direction: row;
    align-items: center;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.bar_title {
    padding-right: 45px;
    padding-left: 45px;
    flex-direction: column;
    align-items: center;
}

.text1_box {
    flex-direction: row;
}

.bar_title_text1 {
    font-size: 36px;
    font-weight: bold;
    color: #434343;
}

.bar_title_text2 {
    padding-bottom: 10px;
    font-size: 25px;
    color: #434343;
    transform: rotate(360deg);
}

.bar_list {
    flex: 1;
    padding-left: 45px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.bar_item {
    flex: 2;
}

.bar_item_flex {
    flex: 1.7;
}

.bar_item_top {
    padding-bottom: 15px;
    flex-direction: row;
    align-items: center;
}

.coin_price_top {
    padding-bottom: 5px;
}

.bar_item_bottom {
    flex-direction: row;
    align-items: center;
}

.float_data {
    position: relative;
    top: -4px;
    font-size: 18px;
}

.percent_change {
    padding-left: 35px;
}

.coin_price {
    position: relative;
    top: -4px;
    font-size: 32px;
    font-weight: bold;
}

.bar_text {
    font-size: 20px;
    color: #434343;
}

.value_name {
    color: #B1B3BA
}

.value_data {
    padding-left: 20px;
    color: #434343;
}

.kongpan_text {
    padding-right: 15px;
    font-size: 20px;
}

.icon_mark {
    font-size: 36px;
    color: #B1B3BA
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

</style>
