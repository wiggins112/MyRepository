<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="router_params.title" >
        </wxc-minibar>
        <div class="wrapper">
            <list class="list" :style="{ height: (PageHeight) + 'px' }">
                <Refresher @refresh="refresh" :loading="loading.coin_list"></Refresher>
                <header class="cell_box">
                    <div class="item tb_hd">
                        <div class="tb_td rank">
                            <text class="tb_th">{{ $t('排名') }}</text>
                        </div>
                        <div class="tb_td name">
                            <text class="tb_th">{{ $t('币种') }}</text>
                        </div>
                        <div class="tb_td price">
                            <text class="tb_th txt_r">{{ $t('流通市值') }}({{get_currency_symbol}})</text>
                        </div>
                        <div class="tb_td num" v-if="getTableValue.name">
                            <text class="tb_th txt_r">{{getTableValue.name}}</text>
                        </div>
                    </div>
                </header>
                <cell class="cell_box"  v-for="(coin, index) in coin_list" :key="index">
                    <div class="item" @click="jumpCoinsDetail(coin)">
                        <div class="tb_td rank">
                            <text class="text">{{index+1}}</text>
                        </div>
                        <div class="tb_td name">
                            <CoinItemInfo :coin="coin" box-width="w260"></CoinItemInfo>
                        </div>
                        <div class="tb_td price">
                            <text class="text txt_r font_bold">{{coin.market_cap_local_str}}</text>
                        </div>
                        <div class="tb_td num" v-if="getTableValue.name">
                            <text class="text txt_r font_bold">{{coin[getTableValue.key]}}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <Loadmore :loading="loading.coin_list" ></Loadmore>
                </cell>
            </list>
            
        </div>
    </div>
</template>
<script>

import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Refresher from '../components/Refresher.vue'
import Loadmore from '../components/Loadmore.vue'
import CoinItemInfo from '../components/CoinItemInfo.vue'
import {Iconfont} from '../config/config.js'
export default {
    components: {
        WxcMinibar,
        StatusBar,
        Refresher,
        Loadmore,
        CoinItemInfo
    },
    data() {
        return {
            router_params: {},
            show: false,
            PageHeight: 1334,
            loading: {
                coin_list: 'loading',
            },
            coin_list: [],
            statusBarStyle: {
                bgColor: '#ffffff',
            },
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
    methods: {
        init() {
            this.getRouterParams();
            this.initTabPage();
        },
        initTabPage() {
            this.PageHeight = Utils.env.getPageHeight();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
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
        
        refresh() {
            this.getCoins();
        },
        getCoins() {
            let params = {};
            params.size = 10;
            params.page = 1;
            params.items = true;
            for (let key in this.router_params) {
                if (key !== 'title') {
                    params[key] = this.router_params[key];
                }
            }
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoins',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_list = 'loaded';
                    this.coin_list = resData.items;
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
        getTableValue() {
            let result = {};
            let title = this.router_params.title;
            if (title === this.$t('媒体热度 top10')) {
                result = {
                    name: this.$t('热度值'),
                    key: 'media_attention_sum_count',
                }
            }
            if (title === this.$t('上线交易所数量 top10')) {
                result = {
                    name: this.$t('交易所数'),
                    key: 'publish_count',
                }
            }
            if (title === this.$t('技术热度 top10')) {
                result = {
                    name: this.$t('热度值'),
                    key: 'github_stars_sum_count',
                }
            }
            if (title === this.$t('发行时长 top10')) {
                result = {
                    name: this.$t('发布日期'),
                    key: 'publish_date',
                }
            }
            return result;
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

.box_hd {}

.box_bd {}

.box_ft {}

.icon {
    font-family: iconfont2;
}

.wrapper {}
.list {
    
}
.cell_box {
}
.item {
    padding: @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
    background-color: #fff;
}
.tb_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 15px;
    padding-bottom: 15px;
    background-color: @bgf4f5f6;
}
.tb_td {
}
.rank {
    width: 100px;
}
.price {
    flex: 1;
}
.name {
    width: 260px;
}
.num {
    width: 170px;
    flex-direction: row;
    justify-content: flex-end;
}
.text {
    font-size: 28px;
}
.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}
.coin_name {
    font-size: 22px;
    color: #9B9DA4;
}
</style>
