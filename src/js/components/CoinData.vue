<template>
    <div class="coin_data_box">
        <div class="cell_box">
            <div class="item tb_hd">
                <div class="tb_td rank">
                    <text class="tb_th">{{ $t('市值') }}</text>
                </div>
                <div class="tb_td name">
                    <text class="tb_th name_text">{{ $t('币种') }}</text>
                </div>
                <div class="tb_td price">
                    <text class="tb_th txt_r">{{ $t('价格') }}({{get_currency_symbol}})</text>
                </div>
                <div class="tb_td change">
                    <text class="tb_th txt_r">{{ $t('当日涨跌') }}</text>
                </div>
            </div>
        </div> 
        <div class="marketcap_box">
            <list ref="coins_dom" :show-scrollbar="true" offset-accuracy="20" loadmoreoffset="50" @loadmore="loadmoreCoins" :style="{ height: (page_height) + 'px' }">
                <Refresher @refresh="refreshCoins" :loading="loading.coins"></Refresher>
                <cell class="cell_box" v-for="(coin, index) in coins" :key="index">
                    <div class="item" @click="jumpCoinsDetail(coin)">
                        <div class="tb_td rank">
                            <text class="text">{{index+1}}</text>
                        </div>
                        <div class="tb_td name">
                            <CoinItemInfo :coin="coin" :symbol_size="32" :coin_name="22"></CoinItemInfo>
                        </div>
                        <div class="tb_td price">
                            <text class="coin_cny txt_r">{{coin.price_local_str || "--"}}</text>
                        </div>
                        <div class="tb_td change">
                            <text v-if="!coin.percent_change_8am" class="no_text_c">--</text>
                            <text v-else :class="['coin_change', coin.percent_change_8am > 0 ? 'safe_bg' : 'warn_bg']">{{coin.percent_change_8am_str}}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <loadmore :loading="loading.coins" ></loadmore>
                </cell>
                <cell class="tabbar_height"></cell>
            </list>
        </div>
    </div>
</template>
<script>
import Loadmore from './Loadmore.vue'
import Refresher from './Refresher.vue'
import CoinItem from './CoinItem.vue'
import CoinItemInfo from './CoinItemInfo.vue'
import Dialog from './Dialog.vue'
import { Utils } from 'weex-ui'
import common from '../config/common'
export default {
    components: {
        Loadmore,
        Refresher,
        CoinItem,
        CoinItemInfo,
        Dialog,
    },
    data() {
        return {
            loading: {
                coins: 'loading',
            },
            coins: [],
            coins_page: 1,
            coins_size: 15,
            user_info: {},
        }
    },
    props: {
        Active: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'Active': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                }
            },
            deep: true,
        },
    },
    created() {

    },
    methods: {
        init() {
            this.getUserInfo();
            if (!this.coins.length || this.coins_page === 1) {
                this.coins =  common.storageGetData("my_coins") || [];
                this.getCoins();
            }
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
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
        getCoins() {
            let params = {};
            params.page = this.coins_page;
            params.size = this.coins_size;
            params.items = 1;
            this.loading.coins = 'loading';
            this.$fetch({
                name: 'getCoins',
                methods: 'GET',
                data: params,
            }).then((res) => {
                if (res.error === 0) {
                    this.loading.coins = 'loaded';
                    if (params.page === 1) {
                        this.coins = res.items;
                        if (!res.items.length) {
                            this.loading.coins = 'empty';
                        }
                    } else {
                        if (!res.items.length) {
                            this.loading.coins = 'nomore';
                        } else {
                            this.coins.push(...res.items);
                        }
                    }
                    common.storageSetData("my_coins", this.coins);//全部的缓存数据 包括下拉刷新的
                    this.$refs.coins_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                } else {
                    this.loading.coins = 'error';
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                this.loading.coins = 'error';
                console.error(err);
            });
        },
        loadmoreCoins() {
            if (this.loading.coins !== 'loaded') {
                return;
            }
            this.$nextTick(() => {
                this.coins_page++;
                this.getCoins();
            })

        },
        refreshCoins() {
            this.coins_page = 1;
            this.getCoins();
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
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
.icon {
    color: #434343;
    font-family: iconfont2;
}

.marketcap_box {
    padding-bottom: @tabbar_height;
}

.refresh {
    width: 750px;
    margin-top: -70px;
}

.loading_box {
    width: 750;
    align-items: center;
    margin-bottom: -70px;
}

.indicator {
    margin-top: 16px;
    height: 40px;
    width: 40px;
    color: blue;
}

.coins_box {
    padding-bottom: @tabbar_height;
    background-color: pink;
}

.coin_hd {
    flex-direction: row;
}

.coin_bd {}

.hd_item {}

.hd_rank {}

.cell_box {
    width: 750px;
    background-color: #fff;
}

.item {
    padding: 30px @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}

.tb_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 15px;
    padding-bottom: 15px;
    background-color: @bgf4f5f6;
}

.tb_td {}

.rank {
    width: 70px;
}

.price {
    width: 230px;
}
.change {
    flex: 1;
    flex-direction: row;
    justify-content: flex-end;
}
.name {
    width: 200px;
}
.text {
    font-size: 28px;
}
.name_text {
    padding-left: 60px;
}
.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_name {
    font-size: 22px;
    color: #9B9DA4;
}

.coin_usd {
    font-size: 22px;
    color: #9B9DA4;
}

.coin_change {
    width: 150px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    font-size: 32px;
}
.pair_symbol {
    flex-direction: row;
}

.pair_base {
    font-size: 22px;
    color: #9B9DA4;
}

.add_box {
    padding-top: 50px;
    padding-bottom: @tabbar_height + 90px;
    justify-content: center;
    align-items: center;
}

.btn {
    width: 88px;
    height: 88px;
    border-radius: 100%;
    background-color: #fff;
    justify-content: center;
    align-items: center;
}

.add_regular {
    font-size: 55px;
    margin-left: 4px;
    color: #f7b237;
}

.add_text {
    font-size: 28px;
    margin-top: 20px;
}
.coin_cny {
    font-weight: bold;
    color: #434343;
    font-size: 32px;
}
.no_text_c {
    text-align: center;
    width: 150px;
}
</style>
