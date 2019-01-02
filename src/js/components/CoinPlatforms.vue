<template>
    <div class="coin_platforms_box">
        <div class="cell_box" v-if="platforms.length">
            <div class="item_title tb_hd">
                <div class="tb_td name">
                    <text class="tb_th">{{ $t('交易所') }}</text>
                </div>
                <div class="tb_td price">
                    <text class="tb_th txt_r">{{ $t('最新价格') }}</text>
                </div>
                <div class="tb_td change">
                    <text class="tb_th txt_r">{{ $t('当日涨跌') }}</text>
                </div>
            </div>
        </div>
        <div class="coins_box" v-for="plf in platforms" :key="plf.id">
            <CoinItem :coin="plf" logoType="platform"></CoinItem>
        </div>
        <Loadmore :loading="loading.platforms" blankpagetype="icontext"  :bigicon="false"></Loadmore>
    </div>
</template>
<script>
import { API_BaseUrl } from '../config/config.js'
import Loadmore from './Loadmore.vue'
import CoinItem from './CoinItem.vue'
import common from '../config/common'
export default {
    components: { Loadmore, CoinItem },
    data() {
        return {
            loading: {
                platforms: 'loading',
                coin_ks: 'loading',
            },
            page: {
                platforms: 1,
            },
            size: {
                platforms: 15,
            },
            platforms: [],
            router_params: {}
        }
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
        is_refresh: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                if (newValue) {
                    this.$emit('Loadmoreing');
                    if (this.loading.platforms !== 'loaded') {
                        return;
                    }
                    this.page.platforms++;
                    this.getCoinPairs();
                }
            },
            deep: true,
        },
        'is_refresh': {
            handler(newValue) {
                if (newValue) {
                    this.page.platforms = 1;
                    this.getCoinPairs();
                }
            },
            deep: true,
        },
    },
    created() {
        this.getRouterParams();
    },
    methods: {
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.platforms =  common.storageGetData("my_platforms_"+ this.router_params.symbol_id) || [];//初始化列表数据
                this.getCoinPairs();
            })
        },
        getCoinPairs() {
            let params = {};
            params.symbol = this.router_params.symbol;
            params.symbol_id = this.router_params.symbol_id;
            params.page = this.page.platforms || 1;
            params.size = this.size.platforms || 30;
            this.loading.platforms = 'loading';
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/pairs`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.platforms = 'loaded';
                    if (params.page === 1) {
                        this.platforms = resData.items;
                        if (!resData.items.length) {
                            this.loading.platforms = 'empty';
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.platforms = 'nomore';
                        } else {
                            this.platforms.push(...resData.items);
                        }
                    }
                    common.storageSetData("my_platforms_"+ this.router_params.symbol_id, this.platforms);//全部的缓存数据 
                }
            }).catch((e) => {

            });
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}
.coin_platforms_box {
    width: 750px;
}
.item_title {
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

.price {
    width: 240px;
}

.name {
    width: 220px;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}
.marketcap_box {}

.coins_box {}

.coin_hd {
    flex-direction: row;
}
.item_title {
    background-color: #fff;
}
.change {
    color: #fff;
    flex: 1;
    flex-direction: row;
    justify-content: flex-end;
}


</style>
