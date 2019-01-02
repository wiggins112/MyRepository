<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="{bgColor:'#fff'}"></StatusBar>
            <wxc-minibar :title="`设置监控规则(${route_param.pair_symbol || route_param.symbol})`" background-color="#fff" text-color="#434343">
            </wxc-minibar>
            <div class="wrapper">
                <div class="group">
                    <text v-for="tab in tabs" @click="toggleTab(tab)" :class="['button', tab.active && 'active']">{{ tab.name }}</text>
                </div>
                <scroller class="scroller" :style="{ height: (PageHeight) + 'px' }">
                    <div class="content">
                        <div class="box market_box" ref="market">
                            <text class="title market_title">{{ $t('行情监控') }}</text>
                            <div class="list market_list">
                                <div class="item">
                                    <div class="panel" @click="toggleSelectList('platform')">
                                        <text class="option">{{ $t('市场') }}</text>
                                        <div class="selected">
                                            <text class="" v-if="!is_avg">{{ selected.platform }}</text>
                                            <text class="" v-if="is_avg">{{ selected.platform }}{{ $t('(来源：CoinMarketCap)') }}</text>
                                            <wxc-icon class="icon" name="more_unfold" @wxcIconClicked="toggleSelectList('platform')"></wxc-icon>
                                        </div>
                                    </div>
                                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="select_list.platform">
                                        <wxc-radio :list="platforms" @wxcRadioListChecked="selectSingle({type:'platform', item: $event.title})"></wxc-radio>
                                    </scroller>
                                </div>
                                <div class="item" v-if="!is_avg">
                                    <div class="panel" @click="toggleSelectList('pair')">
                                        <text class="option">{{ $t('交易对') }}</text>
                                        <div class="selected">
                                            <text class=" ">{{ selected.pair_symbol }}:{{selected.pair_base}}</text>
                                            <wxc-icon name="more_unfold" @wxcIconClicked="toggleSelectList('pair')"></wxc-icon>
                                        </div>
                                    </div>
                                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="select_list.pair">
                                        <wxc-radio :list="pairs" check @wxcRadioListChecked="selectSingle({type:'pair', item: $event.title})"></wxc-radio>
                                    </scroller>
                                </div>
                                <div class="item">
                                    <div class="panel" @click="toggleSelectList('signal')">
                                        <text class="option">{{ $t('指标') }}</text>
                                        <div class="selected">
                                            <text class=" ">{{selected.signal}}</text>
                                            <wxc-icon name="more_unfold" @wxcIconClicked="toggleSelectList('signal')"></wxc-icon>
                                        </div>
                                    </div>
                                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="select_list.signal">
                                        <wxc-radio :list="signals" @wxcRadioListChecked="selectSingle({type:'signal', item: $event.title})"></wxc-radio>
                                    </scroller>
                                </div>
                                <div class="item" v-if="single_show_unit">
                                    <div class="panel" @click="toggleSelectList('unit')">
                                        <text class="option">{{ $t('单位') }}</text>
                                        <div class="selected">
                                            <text class=" ">{{ selected.unit }}</text>
                                            <wxc-icon name="more_unfold" @wxcIconClicked="toggleSelectList('unit')"></wxc-icon>
                                        </div>
                                    </div>
                                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="select_list.unit">
                                        <wxc-radio :list="units" @wxcRadioListChecked="selectSingle({type:'unit', item: $event.title})"></wxc-radio>
                                    </scroller>
                                </div>
                            </div>
                            <div class="list last_list" ref="dom_input_show" v-if="single_show_price_input">
                                <div class="item">
                                    <div class="panel">
                                        <text class="option">{{ $t('当前的') }}{{signal_text}}</text>
                                        <div class="current_value">
                                            <wxc-part-loading :show="loading.coin_pair==='loading'"></wxc-part-loading>
                                            <text class="per" v-if="loading.coin_pair!=='loading'">{{platform_pair_price_str}}{{ single_show_unit?selected.unit:'' }}</text>
                                        </div>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="panel">
                                        <text class="option">{{ $t('超过') }}</text>
                                        <input type="text" :value="selected.more_than" :placeholder="$t('请输入')" class="input" @focus="onfocus" @change="oninputMoreThan" @input="oninputMoreThan" />
                                        <text class="per">{{single_show_unit ? selected.unit : '%'}}</text>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="panel">
                                        <text class="option">{{ $t('低于') }}</text>
                                        <input type="text" :value="selected.less_than" :placeholder="$t('请输入')" class="input" @focus="onfocus" @change="oninputLessThan" @input="oninputLessThan" />
                                        <text class="selected">{{single_show_unit ? selected.unit : '%'}}</text>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="box event_box" ref="event">
                            <text class="title">{{ $t('事件监控') }}</text>
                            <div class="list">
                                <div class="report">
                                    <text>{{ $t('公告提醒') }}</text>
                                    <switch :checked="selected.notice" @change="onSwitchNotice"></switch>
                                </div>
                                <text class="desc">{{ $t('开通后，系统会监控主流交易所关于该币种的所有公告，有相关公告实时推送。') }}</text>
                            </div>
                            <div class="list">
                                <div class="report">
                                    <text>{{ $t('事件提醒') }}</text>
                                    <switch :checked="selected.event" @change="onSwitchEvent"></switch>
                                </div>
                                <text class="desc">{{ $t('开通后，系统会实时监控关于该币的人员变动、产品变动、政府监管、市场情绪、媒体关注等变化情况。') }}</text>
                            </div>
                            <!-- <div class="gomarket" @click="goStatCompare">
                                <text class="compare">{{ $t('前往对比市场监控') }}</text>
                            </div> -->
                        </div>
                    </div>
                </scroller>
            </div>
        </div>
        <div class="btn_box" @click="confirmSingle">
            <text class="btn_box_text">{{route_param.rule_id ? $t('保存修改') :$t('确定添加')}}</text>
        </div>
        <Dialog :title="$t('提示')" :content="$t('规则已保存，但套餐已过期请重新购买')" :show="dialog_show" :single="true" @wxcDialogConfirmBtnClicked="DialogConfirmClicked">
        </Dialog>
        <Dialog title="" :content="$t('添加监控规则需要先登录哦，是否跳转至登录？不登录只能保存到当前设备')" :cancelText="$t('本地保存')" :confirmText="$t('去登录')" :show="show_dialog_save_rule" :single="false" @wxcDialogCancelBtnClicked="cancelDialog" @wxcDialogConfirmBtnClicked="confirmDialog">
        </Dialog>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton, WxcIcon, WxcRadio, WxcLoading, WxcPartLoading } from 'weex-ui';
import StatusBar from '../components/StatusBar.vue'
import Dialog from '../components/Dialog.vue'
import { buiTabbar } from 'bui-weex'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import { API_BaseUrl } from '../config/config.js'
import WxcMinibar from '../components/WxcMinibar.vue'
import _ from 'lodash'
export default {
    components: {
        WxcTabBar,
        WxcButton,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        buiTabbar,
        Loadmore,
        Refresher,
        WxcRadio,
        WxcLoading,
        WxcPartLoading,
        Dialog,
    },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            active: true,
            PageHeight: 1334,
            signal_text: this.$t('最新成交价'),
            tabs: [{
                name: this.$t('行情监控'),
                active: true
            }, {
                name: this.$t('事件监控'),
                active: false
            }],
            select_list: {
                platform: false,
                pair: false,
                signal: false,
                unit: false
            },
            signal_list: [{
                title: this.$t('最新成交价'),
                avg: true,
            }, {
                title: this.$t('买一价'),
                avg: false,
            }, {
                title: this.$t('卖一价'),
                avg: false,
            }, {
                title: this.$t('24小时最高价'),
                avg: true,
            }, {
                title: this.$t('24小时最低价'),
                avg: true,
            }, {
                title: this.$t('1小时涨跌幅'),
                avg: true,
            }, {
                title: this.$t('24小时涨跌幅'),
                avg: true,
            }, {
                title: this.$t('重大利空'),
                avg: true,
            }, {
                title: this.$t('重大利好'),
                avg: true,
            }, {
                title: this.$t('MACD金叉'),
                avg: false,
            }, {
                title: this.$t('MACD死叉'),
                avg: false,
            }],
            rules_total: 0,
            route_param: {},
            exchanges: [],
            current_pair: {},
            user_rule: {},
            symbol: 'BTC',
            selected: {
                type: 'single',
                platform: '',
                pair_symbol: '',
                pair_base: '',
                signal: '',
                unit: '',
                more_than: '',
                less_than: '',
                notice: true,
                event: true,
            },
            single_show_price_input: true,
            single_show_unit: true,
            platform_pair_price_str: '',
            platform_pair_price: '',
            price_key: {
                base_str: 'price_base_str',
                usd_str: 'price_usd_str',
                cny_str: 'price_local_str',
            },
            coin_pair: {},
            user_plan: {},
            loading: {
                coin_pair: 'init',
                user_rule: 'init',
                put_user_rule: 'init',
                user_rules: 'init',
                exchanges: 'init',
                user_plan: 'init',
                user_config: 'init',
            },
            dialog_show: false,
            user_info: {},
            show_dialog_save_rule: false,
            rule_params: {},
        }
    },
    beforeCreate: function() {

    },
    eros: {
        beforeBackAppear(params, options) {
            this.getUserInfo();
        },
    },
    created() {
        this.init();
    },
    watch: {
        selected: {
            handler(newVal, oldVal) {
                if (newVal.platform !== oldVal.platform && oldVal.platform) {
                    this.selected.pair_base = this.pairs[0].pair_base;
                    this.selected.pair_symbol = this.pairs[0].pair_symbol;
                }
                if (newVal.unit === oldVal.unit && newVal.pair_base !== oldVal.pair_base && this.single_show_unit) {
                    this.selected.unit = this.selected.pair_base;
                    this.setCurrentPrice();
                } else {
                    this.setCurrentPrice();
                }
            },
            deep: true,
        }
    },
    methods: {
        init() {
            this.getUserInfo();
            this.$router.getParams().then(async resData => {
                this.route_param = resData;
                this.route_param.pair_symbol = this.route_param.pair_symbol || this.route_param.symbol; // 传过来的是symbol，这里字段转化一下
                if (this.user_info.is_login) {
                    this.getUserRules();
                    this.getUserPlan();
                    this.getUserRuleEvent();
                }
                if (this.route_param.rule_id) {
                    await this.getUserRule();
                }
                this.getCoinExchanges(); // 依赖 user_rule
            })
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        getUserRule() {
            this.loading.user_rule = 'loading';
            return this.$fetch({
                url: `${API_BaseUrl}/api/user/rule/${this.route_param.rule_id}`,
                method: 'GET',
            }).then(resData => {
                this.loading.user_rule = 'loaded';
                if (resData.error === 0) {
                    this.user_rule = resData.result;
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserPlan() {
            this.loading.user_plan = 'loading';
            let params = {};
            this.$fetch({
                url: `${API_BaseUrl}/api/user/plan`,
                name: 'getUserPlan',
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.user_plan = 'loaded';
                if (resData.error === 0) {
                    this.user_plan = resData.result;
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserRuleEvent() {
            this.loading.user_config = 'loading';
            let params = {};
            params.symbol_id = this.route_param.symbol_id;
            params.pair_symbol = this.route_param.pair_symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/user/rule/event`,
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.user_config = 'loaded';
                if (resData.error === 0) {
                    this.selected.notice = resData.result.notice ? true : false;
                    this.selected.event = resData.result.event ? true : false;
                    console.log(this.selected);
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserRules() {
            this.loading.user_rules = 'loading';
            let params = {};
            this.$fetch({
                name: 'getUserRules',
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.user_rules = 'loaded';
                if (resData.error === 0) {
                    this.rules_total = resData.total || resData.items.length;
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getCoinExchanges() {
            this.loading.exchanges = 'loading';
            let params = {};
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${this.route_param.pair_symbol}/exchanges`,
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.exchanges = 'loaded';
                if (resData.error === 0) {
                    this.exchanges = resData.items;
                    this.current_pair = this.exchanges[0];
                    this.selected.type = this.selected.platform === '均价' ? '均价' : 'single';
                    this.selected.platform = this.user_rule.platform || this.route_param.platform || this.current_pair.platform;
                    this.selected.pair_symbol = this.user_rule.pair_symbol || this.route_param.pair_symbol || this.current_pair.pair_symbol;
                    if (this.selected.platform !== '均价') {
                        this.selected.pair_base = this.user_rule.pair_base || this.route_param.pair_base || this.current_pair.pair_base;
                    }
                    this.selected.signal = this.user_rule.signal || this.signals[0].title;
                    this.selected.unit = this.user_rule.unit || this.route_param.unit || 'USD';
                    this.selected.more_than = this.user_rule.more_than || '';
                    this.selected.less_than = this.user_rule.less_than || '';

                    this.getCoinPair({
                        platform: this.selected.platform,
                        pair_base: this.selected.pair_base,
                        pair_symbol: this.selected.pair_symbol,
                    });
                }
            }).catch((e) => {
                this.$notice.toast({ message: 'getCoinExchanges: ' + e.message });
            });
        },
        restTab() {
            for (let tab of this.tabs) {
                tab.active = false;
            }
        },
        initTabPage() {
            this.PageHeight = Utils.env.getPageHeight();
        },
        toggleTab(tab) {
            this.restTab();
            if (tab.name === this.$t('行情监控')) {
                weex.requireModule('dom').scrollToElement(this.$refs.market, {})
                tab.active = true;
            }
            if (tab.name === this.$t('事件监控')) {
                weex.requireModule('dom').scrollToElement(this.$refs.event, { offset: 0 })
                tab.active = true;
            }
        },
        setSignal(singnal_type) {
            this.signal_text = singnal_type;
            this.single_show_price_input = true;
            this.single_show_unit = true;
            if (singnal_type === this.$t('买一价')) {
                this.price_key = {
                    base_str: 'price_base_buy_str',
                    usd_str: 'price_usd_buy_str',
                    cny_str: 'price_cny_buy_str',
                }
            } else if (singnal_type === this.$t('最新成交价')) {
                this.price_key = {
                    base_str: 'price_base_str',
                    usd_str: 'price_usd_str',
                    cny_str: 'price_local_str',
                }
            } else if (singnal_type === this.$t('卖一价')) {
                this.price_key = {
                    base_str: 'price_base_sell_str',
                    usd_str: 'price_usd_sell_str',
                    cny_str: 'price_cny_sell_str',
                }
            } else if (singnal_type === this.$t('24小时最高价')) {
                this.price_key = {
                    base_str: 'price_base_high_24h_str',
                    usd_str: 'price_usd_high_24h_str',
                    cny_str: 'price_cny_high_24h_str',
                }
            } else if (singnal_type === this.$t('24小时最低价')) {
                this.price_key = {
                    base_str: 'price_base_low_24h_str',
                    usd_str: 'price_usd_low_24h_str',
                    cny_str: 'price_cny_low_24h_str',
                }
            } else if (singnal_type === this.$t('24小时涨跌幅')) {
                this.single_show_unit = false;
                this.price_key = {
                    base_str: 'percent_change_24h_str',
                    usd_str: 'percent_change_24h_str',
                    cny_str: 'percent_change_24h_str',
                }
            } else if (singnal_type === this.$t('1小时涨跌幅')) {
                this.single_show_unit = false;
                this.price_key = {
                    base_str: 'percent_change_1h_str',
                    usd_str: 'percent_change_1h_str',
                    cny_str: 'percent_change_1h_str',
                }
            } else {
                this.price_key = {
                    base_str: 'price_base_str',
                    usd_str: 'price_usd_str',
                    cny_str: 'price_local_str',
                }
                this.single_show_unit = false;
                this.single_show_price_input = false;
                this.selected.more_than = '';
                this.selected.less_than = '';
            }
        },
        getCoinPair(params) {
            this.loading.coin_pair = 'loading';
            this.$fetch({
                name: 'getCoinPair',
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.coin_pair = 'loaded';
                if (resData.error === 0) {
                    this.coin_pair = resData.result;
                    this.setCurrentPrice();
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        setCurrentPrice() {
            if (this.selected.unit === 'USD') {
                this.platform_pair_price_str = `${this.coin_pair[this.price_key.usd_str] || ''}`;
                this.platform_pair_price = this.coin_pair[this.price_key.usd_str.slice(0, -4)] || '';
            } else if (this.selected.unit === 'CNY') {
                this.platform_pair_price_str = `${this.coin_pair[this.price_key.cny_str] || ''}`;
                this.platform_pair_price = this.coin_pair[this.price_key.cny_str.slice(0, -4)] || '';
            } else {
                this.platform_pair_price_str = `${this.coin_pair[this.price_key.base_str] || ''}`;
                this.platform_pair_price = this.coin_pair[this.price_key.base_str.slice(0, -4)] || '';
            }
        },
        selectSingle({ type, item }) {
            if (type === 'signal') {
                this.setSignal(item);
            }
            if (type === 'pair') {
                let pairs = item.split(':');
                let pair = {
                    pair_symbol: pairs[0],
                    pair_base: pairs[1],
                }
                this.current_pair = pair;
                this.selected.pair_base = pair.pair_base;
                this.selected.pair_symbol = pair.pair_symbol;
            } else {
                this.selected[type] = item;
            }
            this.toggleSelectList(type);
            this.getCoinPair({
                platform: this.selected.platform,
                pair_base: this.selected.pair_base,
                pair_symbol: this.selected.pair_symbol,
            });
        },
        toggleSelectList(key) {
            this.select_list[key] = !this.select_list[key];
        },
        DialogConfirmClicked() {
            this.$router.back();
        },
        toggleDialog() {
            this.dialog_show = !this.dialog_show;
        },
        postUserRule(params) {
            if (this.loading.post_user_rule === 'loading') {
                return;
            }
            this.loading.post_user_rule = 'loading';
            this.$notice.loading.show(this.$t('提交数据中...'));
            this.$fetch({
                name: 'putUserRule',
                method: 'POST',
                data: params,
            }).then(data => {
                this.$notice.loading.hide();
                this.loading.post_user_rule = 'loaded';
                if (data.error === 0) {
                    if (data.is_expired) {
                        this.toggleDialog();
                    } else {
                        this.$notice.toast({ message: this.$t('添加成功') });
                        this.$router.back();
                    }
                } else {
                    this.$notice.toast({ message: data.message });
                }
            });
        },
        putUserRule(params) {
            if (this.loading.put_user_rule === 'loading') {
                return;
            }
            this.loading.put_user_rule = 'loading';
            this.$notice.loading.show(this.$t('提交数据中...'));
            this.$fetch({
                name: 'putUserRule',
                method: 'PUT',
                data: params,
            }).then(data => {
                this.$notice.loading.hide();
                this.loading.put_user_rule = 'loaded';
                if (data.error === 0) {
                    if (data.is_expired) {
                        this.$notice.toast({ message: this.$t('规则已保存，但套餐已过期请重新购买') });
                    } else {
                        this.$notice.toast({ message: this.$t('修改完成') });
                    }
                    this.$router.back();
                } else {
                    this.$notice.toast({ message: data.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        confirmSingle() {
            if (this.inputLimit) {
                let more_than = this.selected.more_than;
                let less_than = this.selected.less_than;
                let price = this.platform_pair_price;
                if ((more_than && more_than <= price) || (less_than && less_than >= price)) {
                    this.$notice.toast({ message: this.$t('请重新设置阈值') });
                    return;
                }
                // 老板要求：可以不设置行情就确定添加，所以注释下面这段
                // if (!more_than && !less_than) {
                //     this.$notice.toast({ message: this.$t('请先设置阈值') });
                //     return;
                // }
            }
            let params = this.selected;
            params.symbol_id = this.route_param.symbol_id;
            params.type = this.selected.platform === '均价' ? '均价' : 'single';
            params.more_than = Number(params.more_than);
            params.less_than = Number(params.less_than);
            console.log('confirmSingle', JSON.stringify(params));
            if (this.route_param.rule_id) {
                params.rule_id = this.route_param.rule_id;
                this.putUserRule(params);
            } else {
                if (this.showLimitMessage()) {
                    return;
                }
                if (this.user_info.is_login) {
                    this.postUserRule(params);
                } else {
                    this.show_dialog_save_rule = true;
                    this.rule_params = params;
                }

            }
        },
        showLimitMessage() {
            if (this.user_plan.rule && this.user_plan.rule.limit && this.rules_total >= this.user_plan.rule.limit) {
                this.$notice.toast({ message: `当前套餐最多只能添加${this.user_plan.rule.limit}条监控规则，需要升级套餐` });
                this.$router.open({
                    name: 'Plan',
                });
                return true;
            }
        },
        goStatCompare() {
            this.$router.open({
                name: 'StatCompare',
            })
        },
        oninputMoreThan(event) {
            this.selected.more_than = event.value;
        },
        onfocus(event) {
            weex.requireModule('dom').scrollToElement(this.$refs.dom_input_show, { offset: 0 })
        },
        oninputLessThan(event) {
            this.selected.less_than = event.value;
        },
        onSwitchNotice(event) {
            this.selected.notice = event.value;
        },
        onSwitchEvent(event) {
            this.selected.event = event.value;
        },
        cancelDialog() {
            this.saveRuleLocal();
            this.$router.back();
        },
        saveEventRule(route_param) {
            let { pair_symbol, notice, event, symbol_id } = route_param;

            let user_rules = this.$storage.getSync('user_rules') || [];
            let old_rule = false;
            for (let r of user_rules) {
                let exists = r.pair_symbol === pair_symbol && r.type === 'event';
                if (symbol_id) {
                    exists = r.symbol_id === symbol_id && exists;
                }
                if (exists) {
                    r.notice = notice;
                    r.event = event;
                    old_rule = true;
                }
            }
            if (!old_rule) {
                let rule = {
                    type: 'event',
                    pair_symbol,
                    notice,
                    event,
                    state: 'local',
                    symbol_id,
                    _id: 'local_event_rule_' + Date.now(),
                }
                user_rules.push(rule);
            }
            this.$storage.setSync('user_rules', user_rules);
        },
        saveRuleLocal() {
            this.saveEventRule(this.rule_params);
            
            let user_rules = this.$storage.getSync('user_rules') || [];
            this.rule_params.state = 'local';
            this.rule_params._id = 'local_rule_' + Date.now();

            let is_save_rule = true;
            if (this.inputLimit) {
                if (!this.selected.more_than && !this.selected.less_than) {
                    is_save_rule = false; // 没填就不保存
                }
            }
            if (is_save_rule) {
                user_rules.push(this.rule_params);
            }
            this.$storage.setSync('user_rules', user_rules);
            this.$notice.toast({ message: this.$t('添加成功') });
        },
        confirmDialog() {
            this.show_dialog_save_rule = false;
            this.$router.open({
                name: 'Login',
            });
        }
    },
    computed: {
        signals() {
            if (this.is_avg) {
                return this.signal_list.filter(s => s.avg);
            } else {
                return this.signal_list;
            }
        },
        is_avg() {
            return this.selected.platform === '均价';
        },
        tabPageHeight() {
            return Utils.env.getPageHeight();
        },
        platforms() {
            let platforms = [];
            platforms = this.exchanges.map(e => {
                return { title: e.platform };
            });
            platforms = _.uniqBy(platforms, 'title');
            platforms.unshift({ title: this.$t('均价') });
            return platforms;
        },
        pairs() {
            let pairs = [];
            pairs = this.exchanges.filter(e => {
                return this.selected.platform === e.platform;
            });
            if (!pairs.length) {
                pairs = [{ pair_symbol: this.route_param.pair_symbol, pair_base: '' }];
            }
            pairs = pairs.map(item => {
                let { pair_symbol, pair_base } = item;
                let title = pair_symbol + ':' + pair_base;
                return { title, pair_symbol, pair_base };
            });
            return pairs;
        },
        units() {
            let pair_base = this.selected.pair_base;
            let units = [{ title: pair_base }, { title: 'USD' }, { title: 'CNY' }];
            units = _.uniqBy(units, 'title');
            return units;
        },
        inputLimit() {
            if (this.selected.signal === this.$t('买一价') || this.selected.signal === this.$t('卖一价') || this.selected.signal === this.$t('最新成交价') || this.selected.signal === this.$t('24小时最高价') || this.selected.signal === this.$t('24小时最低价')) {
                return true
            }
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.market_content {
    color: red;
}

.scroller {}

.scroller_ios {
    height: 340px;
}

.row {
    height: 100px;
    flex-direction: column;
    justify-content: center;
    padding-left: 30px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    border-bottom-color: #DDDDDD;
}

.group {
    flex-direction: row;
    justify-content: space-between;
    border-width: 1px;
    border-color: rgba(0, 0, 0, .1);
    background-color: #fff;
}

.button {
    flex: 1;
    font-size: 30px;
    text-align: center;
    padding: 25px 0;
}

.active {
    color: #f7b237;
    border-bottom-width: 2px;
    border-bottom-color: #f7b237;
    border-bottom-style: solid;
}

.box {}

.market_box {
    background-color: @bgf4f5f6;
}

.event_box {
    background-color: @bgf4f5f6;
    margin-bottom: 20px;
    height: 1400px;
}

.title {
    color: #9b9da4;
    font-size: 28px;
    background-color: @bgf4f5f6;
    padding: 30px 25px;
}

.panel {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    border-bottom-style: solid;
    border-bottom-color: #eee;
    border-bottom-width: 1px;
    height: 100px;
}

.input {
    width: 260px;
    height: 100%;
    font-size: 28px;
    padding-right: 10px;
    text-align: right;
}

.option {
    flex: 1;
    color: #9b9da4;
    font-size: 30px;
}

.selected {
    flex-direction: row;
    align-items: center;
}

.icon {}

.list {
    padding: 0 25px;
    margin-bottom: 25px;
    background-color: #fff;
}

.last_list {
    margin-bottom: 0px;
}

.wxc-demo {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: #ffffff;
}

.scroller {
    flex: 1;
}

.radio-text {
    font-size: 30px;
    color: #333333;
    margin-top: 30px;
    margin-bottom: 30px;
    margin-left: 24px;
}

.report {
    flex-direction: row;
    justify-content: space-between;
    padding: 25px 0;
}

.desc {
    font-size: 26px;
    color: #9b9da4;
    line-height: 40px;
    padding-bottom: 20px;
}

.compare {
    color: #f7b237;
    font-size: 32px;
    text-align: center;
    text-decoration: underline;
}

.btn_box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 96px;
    background-color: #f7b237;
    text-align: center;
    align-items: center;
    box-shadow: 0px -3px 6px rgba(0, 0, 0, 0.2);
}

.btn_box_text {
    font-size: 36px;
    color: #fff;
    line-height: 88px;
}

</style>
