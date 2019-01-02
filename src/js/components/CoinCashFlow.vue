<template>
    <div class="coin_analyse_box">
        <div class="list" v-if="show_coin_flow">
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <div class="item_title_left">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('当日资金流向') }}({{get_currency_symbol}})</text>
                            <text class="title_text_info">{{coin_trade_today.tips || ''}}</text>
                        </div>
                        <div class="item_title_right">
                            <!-- <text class="title_intro">{{ $t('更新时间') }}：15:15</text> -->
                        </div>
                    </div>
                    <div class="item_info_table">
                        <div class="info_table_hd">
                            <div class="table_item">
                                <text class="table_name">{{ $t('当日买入') }}</text>
                                <text class="table_text safe" v-if="coin_trade_today.sum.buy_local">{{coin_trade_today.sum.buy_local_str || '--'}}</text>
                                <text class="table_text safe" v-if="!coin_trade_today.sum.buy_local">--</text>
                            </div>
                        </div>
                        <div class="info_table_bd">
                            <div class="table_item">
                                <text class="table_name">{{ $t('当日卖出') }}</text>
                                <text class="table_text warn" v-if="coin_trade_today.sum.sell_local">{{coin_trade_today.sum.sell_local_str || '--'}}</text>
                                <text class="table_text warn" v-if="!coin_trade_today.sum.sell_local">--</text>
                            </div>
                        </div>
                    </div>
                    <div class="info_items">
                        <text class="table_name">{{ $t('当日净流入') }}</text>
                        <div class="github_box">
                            <text class="github_num safe" v-if="coin_trade_today.sum.delta_local">{{coin_trade_today.sum.delta_local_str || '--'}}</text>
                            <text class="github_num safe" v-if="!coin_trade_today.sum.delta_local">--</text>
                        </div>
                    </div>
                    <div class="item_info_echart">
                        <EchartLine :lazyloaded="false" :show_legend="true" :data_x="echartline_data.trade_today_data_x" :data_y="echartline_data.trade_today_data_y" :loading="loading.trade_today_data" :echart_option="{color: '#69D4F7', name: $t('净流入'), height: 300}"></EchartLine>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="item_title">
                    <div class="item_title_left">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('多日资金流向') }}({{get_currency_symbol}})</text>
                    </div>
                    <div class="item_title_right">
                        <!-- <text class="title_intro">{{ $t('更新时间') }}：15:15</text> -->
                    </div>
                </div>
                <div class="echart_bar">
                    <EchartBar :lazyloaded="false" :data_x="echartline_data.trade_more_data_x" :data_y="echartline_data.trade_more_data_y" :loading="loading.trade_more_data" :echart_option="{name: $t('净流入'), height: 300}"></EchartBar>
                </div>
            </div>
            <div class="cell">
                <div class="item_title">
                    <div class="item_title_left">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('大单动向') }}</text>
                        <text class="title_text_info">{{coin_trade_big_tips || ''}}</text>
                    </div>
                    <div class="item_title_right">
                        <text class="title_intro">{{ $t('绿色表示买入') }}，{{ $t('红色表示卖出') }}</text>
                    </div>
                </div>
                <div class="item_table">
                    <div class="table_title tb_hd">
                        <div class="tb_tr name">
                            <text class="tb_th">{{ $t('时间') }}</text>
                        </div>
                        <div class="tb_tr price">
                            <text class="tb_th txt_r">{{ $t('金额') }}({{get_currency_symbol}})</text>
                        </div>
                        <div class="tb_tr num_flow">
                            <text class="tb_th txt_r">{{ $t('数量') }}({{router_params.symbol}})</text>
                        </div>
                        <div class="tb_tr num_flow">
                            <text class="tb_th txt_r">{{ $t('价格') }}</text>
                        </div>
                    </div>
                    <div class="table_title tb_bd" v-for="(big, index) in coin_trade_big" :key="index">
                        <div class="tb_tr name">
                            <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn']">{{big.trade_time_str}}</text>
                        </div>
                        <div class="tb_tr price">
                            <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn', 'txt_r']">{{big.price_amount_local_str}}</text> <!-- $ ￥-->
                        </div>
                        <div class="tb_tr num_flow">
                            <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn', 'txt_r']">{{big.amount_str}}</text>
                        </div>
                        <div class="tb_tr num_flow">
                            <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn', 'txt_r']">{{big.price_base_str}}</text>
                            <text class="gray_text txt_r"> {{get_currency_symbol}}{{big.price_local_str}}</text>  <!-- $ ￥-->
                        </div>
                    </div>
                    <div class="show_more" @click="jumpCoinBigSingleTrend" v-if="coin_trade_big.length">
                        <text class="text more_text">{{$t('查看更多')}} ></text>
                    </div>
                    <Loadmore :loading="loading.coin_trade_big"></Loadmore>
                </div>
            </div>
        </div>
        <div class="list" v-if="!show_coin_flow">
            <text class="empty">{{ $t('暂未收录该交易对相关资金流向数据') }}</text>
        </div>
    </div>
</template>
<script>
import EchartLine from './EchartLine.vue';
import EchartBar from './EchartBar.vue';
import Loadmore from './Loadmore.vue'
import { API_BaseUrl } from '../config/config.js'
import filters from '../config/filters.js'
import common from '../config/common' 
export default {
    components: { EchartLine, EchartBar, Loadmore },
    data() {
        return {
            filters,
            router_params: {},
            loading: {
                trade_today_data: 'loading',
                coin_trade_big: 'loading',
                trade_more_data: 'loading',
            },
            coin_trade_today: {
                sum: {},
                deltas: [],
                tips: '',
            },
            coin_trade_big: [],
            coin_trade_big_tips: '',
            echartline_data: {
                trade_today_data_x: [],
                trade_today_data_y: [],
                trade_more_data_x: [],
                trade_more_data_y: [],
            },
            page: {
                coin_trade_big: 1,
            },
            size: {
                coin_trade_big: 25,
            },
            coin_trade_more: [],
            timeout_ts: 5000,
            interval_timmer: null,
        }
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                if (newValue) {
                    // this.getMoreCoinTradeBig();
                }
            },
            deep: true,
        },
        'active': {
            handler(newValue) {
                if (newValue) {
                    this.setIntervalData();
                } else {
                    this.clearIntervalTimmer();
                }
            },
            deep: true,
        },
    },
    eros: {
        beforeBackAppear(params, options) {
            if (this.active) {
                this.setIntervalData();
            } else {
                this.clearIntervalTimmer();
            }
        },
        appDeactive() {
            // 后台
            this.clearIntervalTimmer();
        },
        // app 前后台相关 end 
        beforeDisappear(options) {
            // 离开页面
            this.clearIntervalTimmer();
        }
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
                this.coin_trade_today = common.storageGetData("my_coin_trade_today_" + this.router_params.symbol + this.router_params.platform + this.router_params.pair_base) || {}; //缓存数据
                if (JSON.stringify(this.coin_trade_today) !== '{}') {
                    this.loading.trade_today_data = 'loaded';
                    this.fixCoinTradeToday(this.coin_trade_today.deltas || '[]'); //当日资金流向 折线图
                } else {
                    this.getCoinTradeToday();
                }

                this.coin_trade_more = common.storageGetData("my_coin_trade_more_" + this.router_params.symbol + this.router_params.platform + this.router_params.pair_base) || [];
                if (JSON.stringify(this.coin_trade_more) !== '[]') {
                    this.loading.trade_more_data = 'loaded';
                    this.fixCoinTradeMore(this.coin_trade_more); //当日资金流向 折线图
                } else {
                    this.getCoinTradeRecent();
                }

                this.getCoinTradeBig();
            })
        },
        getMoreCoinTradeBig() {
            if (this.loading.coin_trade_big !== 'loaded') {
                return;
            }
            this.page.coin_trade_big++;
            this.$emit('Loadmoreing');
            this.getCoinTradeBig();
        },
        getCoinTradeToday() {
            let params = {};
            params.pair_symbol = this.router_params.symbol;
            params.platform = this.router_params.platform;
            params.pair_base = this.router_params.pair_base;
            this.loading.trade_today_data = 'loading';
            this.$fetch({
                name: 'getCoinTradeToday',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.trade_today_data = 'loaded';
                    if (!resData.deltas.length) {
                        this.loading.trade_today_data = 'empty';
                    }
                    this.coin_trade_today.sum = resData.sum;
                    this.coin_trade_today.tips = resData.tips;
                    this.coin_trade_today.deltas = resData.deltas;
                    this.fixCoinTradeToday(this.coin_trade_today.deltas);
                    common.storageSetData("my_coin_trade_today_" + this.router_params.symbol + this.router_params.platform + this.router_params.pair_base, this.coin_trade_today);
                } else {
                    this.loading.trade_today_data = 'error';
                }
            }).catch((e) => {
                this.loading.trade_today_data = 'error';
                console.log(e.message)
            });
        },
        fixCoinTradeToday(items) {
            this.echartline_data.trade_today_data_x = [];
            this.echartline_data.trade_today_data_y = [];
            for (let item of items) {
                if (item.delta_local) {
                    this.echartline_data.trade_today_data_x.push(this.filters.dateFormat(item.update_time, 'hh:mm'));
                    this.echartline_data.trade_today_data_y.push(this.filters.fixNumber(item.delta_local || 0));
                }
            }
            this.echartline_data.trade_today_data_x.reverse();
            this.echartline_data.trade_today_data_y.reverse();
        },
        getCoinTradeRecent() {
            let params = {};
            params.pair_symbol = this.router_params.symbol;
            params.platform = this.router_params.platform;
            params.pair_base = this.router_params.pair_base;
            this.loading.trade_more_data = 'loading';
            this.$fetch({
                name: 'getCoinTradeRecent',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.coin_trade_more = resData.items;
                    this.loading.trade_more_data = 'loaded';
                    this.fixCoinTradeMore(this.coin_trade_more);
                    common.storageSetData("my_coin_trade_more_" + this.router_params.symbol + this.router_params.platform + this.router_params.pair_base, this.coin_trade_more);
                } else {
                    this.loading.trade_more_data = 'error';
                }
            }).catch((e) => {
                this.loading.trade_more_data = 'error';
                console.log(e.message)
            });
        },
        fixCoinTradeMore(items) {
            this.echartline_data.trade_more_data_x = [];
            this.echartline_data.trade_more_data_y = [];
            for (let item of items) {
                if (item.delta_local) {
                    this.echartline_data.trade_more_data_x.push(item.name || '');
                    this.echartline_data.trade_more_data_y.push(this.filters.fixNumber(item.delta_local || 0));
                }
            }
            if (!this.echartline_data.trade_more_data_x.length) {
                this.loading.trade_more_data = 'empty';
            }
        },
        getCoinTradeBig() {
            let params = {};
            params.pair_symbol = this.router_params.symbol;
            params.platform = this.router_params.platform;
            params.pair_base = this.router_params.pair_base;

            params.page = this.page.coin_trade_big || 1;
            params.size = this.size.coin_trade_big || 30;
            this.loading.coin_trade_big = 'loading';
            this.$fetch({
                name: 'getCoinTradeBig',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_trade_big = 'loaded';
                    for (let item of resData.items) {
                        item.trade_time_str = this.filters.dateFormat(item.trade_time / 1000, 'MM-dd hh:mm');
                    }
                    if (params.page === 1) {
                        this.coin_trade_big = resData.items;
                        if (!resData.items.length) {
                            this.loading.coin_trade_big = 'empty';
                            this.clearIntervalTimmer();
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.coin_trade_big = 'nomore';
                        } else {
                            this.coin_trade_big.push(...resData.items);
                        }
                    }
                    this.coin_trade_big_tips = resData.tips;

                } else {
                    this.clearIntervalTimmer();
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.clearIntervalTimmer();
                console.log(e.message);
            });
        },
        setIntervalData() {
            this.clearIntervalTimmer();
            this.interval_timmer = setInterval(() => {
                this.getCoinTradeBig();  //每5秒刷  大单动向 一次
            }, this.timeout_ts)
        },
        clearIntervalTimmer() {
            if (this.interval_timmer) {
                clearInterval(this.interval_timmer);
                this.interval_timmer = null;
            }
        },
        jumpCoinBigSingleTrend() {
            let params = {
                symbol: this.router_params.pair_symbol || '',
                pair_symbol: this.router_params.pair_symbol || '',
                platform: this.router_params.platform || '',
                pair_base: this.router_params.pair_base || '',
                symbol_id: this.router_params.symbol_id || '',
            }
            this.$router.open({
                name: 'CoinBigSingleTrend',
                params: params
            })
        },
    },
    computed: {
        show_coin_flow() {
            if (this.loading.trade_today_data === 'empty' && this.loading.trade_more_data === 'empty' && this.loading.coin_trade_big === 'empty') {
                return false;
            } else {
                return true;
            }
        },
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    font-family: iconfont2;
}

.coin_analyse_box {
    width: 750px;
    background-color: #fff;
}

.cell_item {}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
    background-color: #f2f3f5;
}

.item_title_left {
    flex-direction: row;
    flex: 1;
}

.item_title_right {
    // flex: 1;
}

.title_intro {
    margin-top: 3px;
    text-align: right;
    color: #B0B2B8;
    font-size: 20px;
}

.title_line {
    width: 6px;
    height: 26px;
    background-color: #434343;
}

.title_text {
    margin-left: 15px;
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.title_text_info {
    margin-top: 3px;
    margin-left: 15px;
    font-size: 20px;
    color: #999;
}

.item_info_table {
    flex-direction: row;
    border-top-width: 1px;
    border-color: #E7EAF1;
}

.info_table_hd {
    flex: 1;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.info_table_bd {
    flex: 1;
}

.table_item {
    padding-left: @padding_size;
    padding-right: @padding_size;
    height: 70px;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
    align-items: center;
}

.table_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 1;
}

.table_text {
    color: #434343;
    font-size: 24px;
    text-align: right;
    flex: 1;
}


.info_items {
    padding: @padding_size;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}

.github_box {
    flex-direction: row;
}

.github_num {
    margin-left: 15px;
    color: #434343;
    font-size: 24px;
    flex: 1;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}


.table_title {
    padding: @padding_size;
    flex-direction: row;
    align-items: center;
    border-top-width: 1px;
    border-color: #eee;
}

.tb_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 15px;
    padding-bottom: 15px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: rgba(0, 0, 0, .1);
}
.tb_bd {
    padding: @padding_size;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: rgba(0, 0, 0, .1);
}
.price {
    flex: 1;
}

.num_flow {
    flex: 1;
}

.name {
    width: 160px;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.tb_td {
    font-size: 26px;
    font-weight: bold;
}

.coin_hd {
    flex-direction: row;
}

.gray_text {
    color: #9B9DA4;
    font-size: 20px;
}

.empty {
    padding: @padding_size;
    text-align: center;
    color: #666;
    font-size: 26px;
    margin-top: 100px;
}
.show_more {
    padding: 15px 0;
    justify-content: center;
    align-items: center;
}
</style>
