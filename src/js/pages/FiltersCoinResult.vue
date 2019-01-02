<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('选币结果')">
        </wxc-minibar>
        <list class="list" ref="coins_dom" :style="{height: page_height}" loadmoreoffset="200" @loadmore="loadmoreCoin">
            <cell class="filter_hd">
                <text class="filter_title" v-if="route_query && route_query.length > 0">{{ $t('已选条件') }}:</text>
                <scroller class="filter_scroller" scroll-direction="horizontal" style="height: 80px;" v-if="route_query && route_query.length > 0">
                    <div class="box_hd">
                        <div v-for="item in route_query" :key="item.name">
                            <text class="option" v-if="item.name">{{item.name}}{{item.order_value === '是' ? '' : `：${$t(item.value)}`}}</text>
                        </div>
                    </div>
                </scroller>
            </cell>
            <header class="table_box">
                <div class="table_left">
                    <div class="table_bd">
                        <div class="table_th_header">
                            <div class="table_td_left fixed_td">
                                <text class="table_l_td">{{ $t('币种') }}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <scroller ref="scroller_right_head" :scrollable="false" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th_header">
                            <div class="table_r_td fixed_td">
                                <text class="tb_th txt_r">{{ $t('流通市值') }}({{get_currency_symbol}})</text>
                            </div>
                            <div class="table_r_td fixed_td">
                                <text class="tb_th txt_r">{{ `${$t('价格')}`}}({{get_currency_symbol}})</text>
                                <text class="tb_th txt_r">/{{ $t('当日涨跌') }}</text>
                            </div>
                            <div :class="['table_r_td', 'fixed_td', `${item.key}`, (route_query.length -1 === i) && 'table_r_td_last']" v-for="(item, i) in route_query" v-if="item.name" :key="i">
                                <text class="tb_th txt_r">{{$t(getTableName(item.name))}}</text>
                            </div>
                        </div>
                    </div>
                </scroller>
            </header>
            <cell class="table_box">
                <div class="table_left">
                    <div class="table_bd">
                        <div class="table_th_l" v-for="(coin, index) in coin_list" :key="index" @click="jumpCoinsDetail(coin)">
                            <div class="table_td_left ">
                                <CoinItemInfo :coin="coin" ></CoinItemInfo>
                            </div>
                        </div>
                    </div>
                </div>
                <scroller ref="scroller_right" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th" v-for="(coin, index) in coin_list" :key="index" @click="jumpCoinsDetail(coin)">
                            <div class="table_r_td">
                                <text class="table_r_first txt_r">{{coin.market_cap_local_str || '--'}}</text>
                            </div>
                            <div class="table_r_td">
                                <text :class="['text','coin_price', coin.percent_change_8am > 0 ? 'safe' : 'warn', 'txt_r']">{{coin.price_local_str}}</text>
                                <text :class="['text','coin_percent', coin.percent_change_8am > 0 ? 'safe' : 'warn', 'txt_r']">{{coin.percent_change_8am_str}}</text>
                            </div>
                            <div :class="['table_r_td', `${order.key}`, (route_query.length -1 === i) && 'table_r_td_last']" v-for="(order, i) in route_query" v-if="order.name" :key="i">
                                <text class="text txt_r">{{coin[order.key]}}</text>
                            </div>
                        </div>
                    </div>
                </scroller>
            </cell>
            <cell>
                <Loadmore :loading="loading.coin_list"></Loadmore>
            </cell>
            <cell class="tabbar_height">
            </cell>
        </list>
    </div>
</template>
<script>
import { Utils, WxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Refresher from '../components/Refresher.vue'
import Loadmore from '../components/Loadmore.vue'
import CoinItemInfo from '../components/CoinItemInfo.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import filters from '../config/filters.js'
const dom = weex.requireModule('dom')
export default {
    components: {
        WxcButton,
        WxcMinibar,
        StatusBar,
        Refresher,
        Loadmore,
        CoinItemInfo
    },
    data() {
        return {
            filters,
            router_params: {},
            loading: {
                coin_list: 'loading',
            },
            page: {
                coin_list: 1,
            },
            size: {
                coin_list: 30,
            },
            coin_list: [],
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            route_query: [],
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            bindingx_token: null,
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
        setTimeout(() => {
            this.bindingXscroll();
        }, 1000)
        this.init();
    },
    eros: {
        beforeBackAppear(params, options) {
            this.bindingXscroll();
        },
        beforeDisappear(options) {
            // 离开页面
            this.unbindXscroll();
        },
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        initRouteQuery(route) {
            // for (let key in route) {
            //     this.route_query.push({
            //         key: key,
            //         value: route[key],
            //         name: this.filters.getOrderName(key, route[key])
            //     })
            // };
            route.map(x => {
                this.route_query.push(x)
            })
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData.data;
                this.initRouteQuery(resData.query);
                this.getCoins();
            })
        },

        jumpCoinsDetail(coin) {
            this.$router.open({
                name: 'CoinDetail',
                type: 'PUSH',
                params: {
                    symbol: coin.symbol,
                    symbol_id: coin.id,
                }
            })
        },
        bindingXscroll() {
            let scroller_right = this.$refs.scroller_right.ref;
            let scroller_right_head = this.$refs.scroller_right_head.ref;
            this.$bindingx.bind({
                eventType: 'scroll',
                anchor: scroller_right,
                props: [{
                    element: scroller_right_head,
                    property: 'scroll.contentOffsetX',
                    expression: 'x+0'
                }]
            }, (e) => {
                this.bindingx_token = e.token;
                // console.log('bindingx', e);
            });
        },
        unbindXscroll() {
            if (this.bindingx_token) {
                this.$bindingx.unbind({
                    token: this.bindingx_token,
                    eventType: 'scroll'
                });
            }
        },
        refresh() {
            this.page.coin_list = 1;
            this.getCoins();
        },
        loadmoreCoin() {
            if (this.loading.coin_list !== 'loaded') {
                return;
            }
            this.page.coin_list++;
            this.getCoins();
        },
        getTableName(name) {
            if (name === '发行时长') {
                return '发行日期'
            }
            if (name === '上线前10交易所') {
                return '交易所数量'
            }
            return name
        },
        getCoins() {
            let params = {};
            for (let key in this.router_params) {
                params[key] = this.router_params[key];
            };
            params.items = true;
            params.page = this.page.coin_list;
            params.size = this.size.coin_list;
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoins',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_list = 'loaded';
                    for (let item of resData.items) {
                        if (params.price_max === '价格创近7天新高') {
                            item.price_max = `${this.filters.fixNumber(item.max_7day)}`;
                        }
                        if (params.price_max === '价格创近30天新高') {
                            item.price_max = `${this.filters.fixNumber(item.max_30day)}`;
                        }
                        item.is_hot_concept = item.hot_concept;
                        item.is_star_team = this.filters.getTrueAndFalse(item.is_star_team);
                        item.is_fallthenrise = this.filters.getTrueAndFalse(item.is_fallthenrise);
                        item.is_pricerisewithvolume = this.filters.getTrueAndFalse(item.is_pricerisewithvolume);
                        item.average_price_precent_rank = `${this.filters.fixNumber(item.price_local)}/${this.filters.fixNumber(item.average_price)}`;
                        item.percent_change_24h_rank = item.percent_change_24h_str;
                        item.polocy_profitable = this.filters.getPosAndNeg(item.polocy_profitable);

                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.coin_list = 'nomore';
                        }
                        this.coin_list.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.coin_list = 'empty';
                        }
                        this.coin_list = resData.items;
                    }
                    this.$refs.coins_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.coin_list = 'error';
                console.log(e.message)
            });
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
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

.wrapper {
    flex-direction: column;
}

.box_bd {
    height: 800px;
}

.box_ft {}

.icon {
    font-family: iconfont2;
}

.filter_hd {
    flex-direction: row;
    align-items: center;
}

.filter_scroller {
    flex-direction: row;
    flex: 1;
}

.filter_title {
    padding-left: @padding_size;
    color: #333;
    margin-right: 20px;
    font-size: 24px;
}

.option {
    font-size: 22px;
    background-color: #C2C8D0;
    padding: 10px 15px;
    margin-right: 20px;
    border-radius: 3px;
    margin-bottom: 10px;
    color: #fff;
}

.box_hd {
    flex-direction: row;
    align-items: center;
    padding-top: 25px;
    padding-bottom: 25px;
    font-size: 22px;
}

.list {
    width: 750px;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_percent {
    font-size: 22px;
}

.list {
    width: 750px;
}

.table_box {
    width: 750px;
    flex-direction: row;
}

.table_left {
    width: 250px;
    background-color: #fff;
}

.table_right {
    flex: 1;
    background-color: #fff;
    flex-direction: row;
}

.table_th {
    height: 150px;
    flex-direction: row;
}
.table_r_td {
    width: 230px;
    height: 150px;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
    justify-content: center;                         
}
.table_td_left {
    padding-left: @padding_size;
    padding-right: 15px;
    width: 250px;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;
}
.table_th_header {
    height: 80px;
    flex-direction: row;
}
.fixed_td {
    height: 80px;
    background-color: @bgf4f5f6;
}
.table_l_td {
    padding-left: @padding_size;
    font-size: 24px;
    color: #9B9DA4;
}
.table_r_td_last {
    padding-right: @padding_size;
}
.text {
    font-weight: bold;
}
.table_r_first {
    font-weight: bold;
    font-size: 32px;
}
.coin_price {
    font-size: 32px;
    padding-bottom: 5px;
}
.table_th_l {
    height: 150px;
    flex-direction: row;
}
</style>
