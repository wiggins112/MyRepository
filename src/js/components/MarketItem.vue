<template>
    <div class="slider-item">
        <div class="bd_list" v-for="(mess,mess_i) in messages" :key="mess_i">
            <CellItem class="cellitem" :has-arrow="true" @wxcCellClicked="goMore(mess)" :has-top-border="false" title="" :hasVerticalIndent="false" titleIconSize="40" :extraContent="$t('更多')" titlecolor="red">
                <div slot="title" class="less_row" @click="showList(mess_i)">
                    <text :class="['icon',(mess.open)?'cell_left_downicon':'cell_left_upicon']">&#xe925</text>
                    <text class="cell_left_text">{{mess.cn}}</text>
                </div>
            </CellItem>
            <div class="cell_box" v-if="mess.open && mess.items.length>0">
                <div class="item tb_hd">
                    <div class="tb_td name">
                        <text class="tb_th">{{mess.menus[0].cn}}</text>
                    </div>
                    <div class="tb_td price">
                        <text class="tb_th tb_th_price">{{mess.menus[1].cn}}</text>
                    </div>
                    <div class="tb_td change">
                        <text class="tb_th txt_r">{{mess.menus[2].cn}}</text>
                    </div>
                </div>
            </div>
            <div class="cell_item" v-for="(coin, index)  in mess.items" :key="index" v-if="mess.open">
                <CoinItemRank :coin="coin">
                    <div slot="price_slot">
                        <text class="txt_r price_local">{{coin.price_local_str}}</text>
                    </div>
                    <div slot="change_bt">
                        <text v-if="mess.field === 'percent_change_24h_str'" :class="['coin_change', coin.percent_change_24h > 0 ? 'safe_bg' : 'warn_bg']">{{coin[mess.field]}}</text>
                        <text v-else class="coin_change coin_price safe">{{coin[mess.field]}}</text>
                    </div>
                </CoinItemRank>
            </div>
        </div>
    </div>
</template>
<script>
import CoinItemRank from '../components/CoinItemRank.vue'
import CellItem from '../components/CellItem.vue'
import common from '../config/common';
export default {
    components: {
        CoinItemRank,
        CellItem,
    },
    data() {
        return {
            messages: [],
            user_coins: [],
        }
    },
    props: {
        refresh: {
            type: Boolean,
            default: false,
        }
    },
    watch: {
        async refresh(value) {
            if (value) {
                await this.getCoinsByRanks();
                this.$emit('refreshEnd');
            }
        }
    },
    eros: {
        beforeBackAppear(params, options) {
            this.init();
        },
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getCoinsByRanks();
        },
        showList(click_i) {
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_market_list');
            this.messages[click_i].open = !this.messages[click_i].open;
            let cache_open = common.storageGetData('cache_marketitem', true) || [];
            for(let x=0; x< cache_open.length; x++) {
                if(cache_open[x].name === this.messages[click_i].name) {
                    cache_open.splice(x,1);
                }
            }
            cache_open.push({name: this.messages[click_i].name, open: this.messages[click_i].open})
            common.storageSetData('cache_marketitem',cache_open);
        },
        goMore({name_v2,time,sort_type}) {
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_market_list');
            this.$router.open({
                name: 'TopSeleCoin',
                params: {
                    tab_type: name_v2,
                    time,
                    sort_type: sort_type || '',
                }
            })
        },
        getCoinsByRanks(type) {
            let params = {};
            params.size = 6;
            let rank_sort = this.$storage.getSync('tab_rank_sort') || {}; 
            params.market_cap_usd_rank = rank_sort.value || '';
            return this.$fetch({
                name: 'getCoinsByRanks',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    this.messages = resData.items;
                     for(const x of this.messages) { //数据替换为缓存的
                        for(const y of common.storageGetData('cache_marketitem', true)) {
                            if(x.name === y.name) {
                                x.open = y.open;
                            }
                        }
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                console.error(err);
            });
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
    font-size: 15px;
    margin: 20px 0;
}

.less_row {
    padding: 25px 0;
}

.bd_list {
    margin-bottom: 25px;
}

.cell_item {
    width: 750px;
    background-color: #fff;
}

.cell_left {
    padding: 25px;
    flex: 4;
    flex-direction: row;
}

.cell_left_text {
    color: #333333;
    font-size: 30px;
    padding-left: 15px;
}

.cell_left_upicon {
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(-90deg);
}

.cell_left_downicon {
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(0deg);
}


// 列表的表头
.cell_box {
    width: 750px;
    background-color: #fff;
}

.item {
    padding: @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}


.rank {
    width: 120px;
}

.price {
    padding: 0 10px;
    width: 240px;
}
.change {
    padding: 0 10px;
    flex: 1;
}
.name {
    width: 220px;
}

.text {
    font-size: 28px;
    font-weight: bold;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}
.tb_th_price {
    text-align: right;
}
.coin_change {
    width: 170px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    font-size: 30px;
}
.coin_price {
    font-size: 28px;
    color: #434343;
    font-weight: bold;
}
.coin_usd {
    font-size: 22px;
    color: #9B9DA4;
}
.safe {
    text-align: right;
    width: 200px;
}
.coin_name {
    padding-right: 15px;
    padding-left: 15px;
    flex: 1;
    lines: 1;
    text-overflow: ellipsis;
    font-size: 22px;
    color: #9B9DA4;
    padding-bottom: 2px;
    font-weight: bold;
}
.price_local {
    font-weight: bold;
    font-size: 32px;
    color: #434343;
}
</style>
