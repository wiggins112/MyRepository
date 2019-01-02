<template>
    <div class="coin_box" @click="jumpCoinDetail(coin)">
        <div class="item">
            <div class="tb_td name">
                <slot name="name_slot">
                    <div class="coin_name_box">
                        <div class="coin_logo" v-if="showlogo">
                            <image class="logo_image" resize="cover" v-if="logoType === 'coin'" :src="coin.icon || default_coin_icon"/>
                            <image class="logo_image" resize="cover" v-if="logoType === 'platform'" :src="coin.logo"/>
                        </div>
                        <div class="coin_info">
                            <div class="pair_symbol">
                                <text class="text font_bold" :style="{fontSize: l_size}">{{coin.pair_symbol}}</text>
                                <text class="text pair_base"  v-if="coin.platform !== '均价'"> / {{coin.pair_base}}</text>
                            </div>
                            <text class="text coin_name" :style="{fontSize: s_size}">{{ $t(coin.platform) }}</text>
                        </div>
                    </div>
                </slot>
            </div>
            <div class="tb_td price">
                <slot name="price_slot" v-if="coin.platform !== '均价'">
                    <text class="text coin_cny txt_r" :style="{fontSize: l_size}">{{coin.price_base_str || '--'}}</text>
                    <text class="text coin_usd txt_r" :style="{fontSize: s_size}">{{get_currency_symbol}}{{coin.price_local_str}}</text>
                </slot>
                <slot name="price_slot" v-else>
                    <text class="text coin_cny txt_r" :style="{fontSize: l_size}">{{get_currency_symbol}}{{coin.price_local_str}}</text>
                </slot>
            </div>
            <div class="tb_td change">
                <slot name="change_bt">
                    <text v-if="coin.platform === '均价'" :class="['coin_change', coin.percent_change_8am > 0 ? 'safe_bg' : 'warn_bg']">{{coin.percent_change_8am_str}}</text>
                    <text v-if="coin.platform !== '均价'" :class="['coin_change', coin.percent_change_8h > 0 ? 'safe_bg' : 'warn_bg']">{{coin.percent_change_8h_str}}</text>
                </slot>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
        }
    },
    props: {
        coin: {
            type: Object,
            required: true,
        },
        logoType: {
            type: String,
            default: 'coin'
        },
        showlogo: {
            type: Boolean,
            default: true
        },
        l_size: {
            type: Number,
            default: 32
        },
        s_size: {
            type: Number,
            default: 22
        },
    },
    created() {

    },
    methods: {
        jumpCoinDetail(coin) {
            let params = {
                symbol: coin.pair_symbol || '',
                pair_symbol: coin.pair_symbol || '',
                platform: coin.platform || '',
                pair_base: coin.pair_base || '',
                symbol_id: coin.id || '',
            }
            if (params.platform === '均价') {
                this.$router.open({
                    name: 'CoinDetail',
                    params: params
                })
            } else {
                this.$router.open({
                    name: 'CoinDetailKs',
                    params: params
                })
            }

        },
    },
    computed: {
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.coin_box {
    background-color: #fff;
}

.item {
    padding: @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}

.coin_name_box {
    flex-direction: row;
}

.coin_logo {
    width: 35px;
    height: 35px;
    border-radius: 50%;
}

.logo_image {
    width: 35px;
    height: 35px;
    border-radius: 50%;
}

.coin_info {
    padding-left: 15px;
}

.tb_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 15px;
    padding-bottom: 15px;
    background-color: @bgf4f5f6;
}

.rank {
    width: 120px;
}

.price {
    width: 240px;
}
.change {
    flex: 1;
    flex-direction: row;
    justify-content: flex-end;
}
.name {
    width: 220px;
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
    font-weight: bold;
}

.coin_usd {
    font-size: 22px;
    color: #9B9DA4;
}

.coin_change {
    width: 160px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    font-size: 30px;
    color: #fff;
}

.fill_box {
    height: 250px;
}

.pair_symbol {
    flex-direction: row;
    align-items: flex-end;
}

.pair_base {
    font-size: 24px;
    color: #9B9DA4;
    font-weight: bold;
}
.txt_r {
    font-weight: bold;
}
</style>
