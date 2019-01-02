<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar :title="$t('近24H成交大单监控')">
        </wxc-minibar>
        <list class="cell_box" ref="ks_list" @loadmore="loadMoreCoinTradeBig" :style="{height: page_height }" loadmoreoffset="550">
            <Refresher @refresh="refreshCoins" :loading="loading.coin_trade_big"></Refresher>
            <header>
                <div class="table_title tb_hd table_head">
                    <div class="tb_tr name">
                        <text class="tb_th_l">{{ $t('时间') }}</text>
                    </div>
                    <div class="tb_tr price">
                        <text class="tb_th">{{ $t('金额') }}({{get_currency_symbol}})</text>
                    </div>
                    <div class="tb_tr num_flow">
                        <text class="tb_th">{{ $t('数量') }}({{router_params.symbol}})</text>
                    </div>
                    <div class="tb_tr num_flow">
                        <text class="tb_th">{{ $t('价格') }}({{get_currency_symbol}})</text>
                    </div>
                </div>
            </header>
            <cell class="table_title tb_bd" v-for="(big, index) in coin_trade_big" :key="index">
                <div class="tb_tr name">
                    <text :class="['tb_td_l', (big.type === 'buy') ? 'safe' : 'warn']">{{big.trade_time_str}}</text>
                </div>
                <div class="tb_tr price">
                    <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn']">{{big.price_amount_local_str}}</text>
                </div>
                <div class="tb_tr num_flow">
                    <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn']">{{big.amount_str}}</text>
                </div>
                <div class="tb_tr num_flow">
                    <text :class="['tb_td', (big.type === 'buy') ? 'safe' : 'warn', 'txt_r']">{{big.price_base_str}}</text>
                    <text class="gray_text txt_r"> {{get_currency_symbol}}{{big.price_local_str}}</text>  <!-- $ ￥-->
                </div>
            </cell>
            <cell>
                <Loadmore :loading="loading.coin_trade_big"></Loadmore>
            </cell>
        </list>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import filters from '../config/filters.js'

export default {
    components: {
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
    },
    data() {
        return {
            filters,
            coin_trade_big: [],
            loading: {
                coin_trade_big: 'init',
            },
            page: {
                coin_trade_big: 1,
            },
            size: {
                coin_trade_big: 20,
            },
            router_params: {},
            coin_trade_big_tips: {}
        };
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
                this.getCoinTradeBig();
            })
        },
        refreshCoins() {
            this.page.coin_trade_big = 1;
            this.getCoinTradeBig();
        },
        loadMoreCoinTradeBig() {
            if (this.loading.coin_trade_big !== 'loaded') {
                return;
            }
            this.page.coin_trade_big++;
            this.getCoinTradeBig();
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
                    this.$refs.ks_list.resetLoadmore();
                } else {
                    this.clearIntervalTimmer();
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.clearIntervalTimmer();
                console.log(e.message);
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
.table_title {
    padding: @padding_size;
    flex-direction: row;
    align-items: center;
    border-top-width: 1px;
    border-color: #eee;
    background-color: #fff;
}
.table_head {
    background-color: @bgf4f5f6;
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
    width: 210px;
}
.tb_th_l {
    font-size: 24px;
    color: #9B9DA4;
}
.tb_th {
    font-size: 24px;
    color: #9B9DA4;
    text-align: right;
}
.tb_td_l {
    font-size: 26px;
    font-weight: bold;
}
.tb_td {
    font-size: 26px;
    font-weight: bold;
    text-align: right;
}

.coin_hd {
    flex-direction: row;
}

.gray_text {
    color: #9B9DA4;
    font-size: 20px;
}

</style>
