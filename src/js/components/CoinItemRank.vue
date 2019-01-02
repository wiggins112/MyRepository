<template>
    <div class="coin_box" @click="jumpCoinDetail(coin)">
        <div class="item">
            <div class="tb_td name">
                <div class="coin_name_box">
                    <div class="coin_info">
                        <text class="text coin_symbol">{{coin.symbol}}</text>
                        <slot name="slot_coin_name">
                            <text class="text coin_name">{{$locale() === 'zh-CN' ? (coin.cn || coin.name) : coin.name}}</text>
                        </slot>
                    </div>
                </div>
            </div>
            <div class="tb_td price">
                <slot name="price_slot">
                    <text class="text coin_cny txt_r">{{coin.value_fmt}}</text>
                    <text :class="['text', coin.value_fmt ? 'coin_usd' : '' , coin.change > 0 ? 'safe' : 'warn', 'txt_r']">{{coin.change_fmt}}</text>
                </slot>
            </div>
            <div class="tb_td change">
                <slot name="change_bt">
                    <div class="change_charts">
                        <!--  <text class="loop safe">50%</text>  交易所资金异动的情况 -->
                        <image class="change_image" resize="cover" :src="coin.price_line"/>
                        <text :class="['text','percent_str', coin.percent_change_8am > 0 ? 'safe' : 'warn']">{{coin.percent_change_8am_str}}</text>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {

        }
    },
    props: {
        coin: {
            type: Object,
            required: true,
        },
    },
    created() {

    },
    methods: {
        jumpCoinDetail(coin) {
            let params = {
                symbol: coin.symbol || '',
                pair_symbol: coin.symbol || '',
                symbol_id: coin.symbol_id || '',
            }
            this.$router.open({
                name: 'CoinDetail',
                params: params
            })
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


.coin_info {
    flex-direction: row;
    flex: 1;
    lines: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    align-items: flex-end;
}




.price {
    text-align: right;
    width: 230px;
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
    // font-size: 28px;
    font-weight: bold;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_name {
    padding-right: 5px;
    padding-left: 15px;
    flex: 1;
    lines: 1;
    text-overflow: ellipsis;
    font-size: 22px;
    color: #9B9DA4;
    padding-bottom: 2px;
}

.coin_usd {
    font-size: 22px;
}

.coin_change {
    width: 160px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    font-size: 28px;
}

.fill_box {
    height: 250px;
}

.pair_symbol {
    flex-direction: row;
}

.loop {
    font-size: 28px;
    text-align: right;
}

.percent_str {
    text-align: center;
    font-size: 25px;
}

.change_charts {
    width: 200px;
    background-color: #fff;
}

.change_image {
    width: 200px;
    height: 54px;
}
.coin_cny {
    font-size: 32px;
    font-weight: bold;
}
.coin_symbol {
    font-size: 32px;
    font-weight: bold;
}
</style>
