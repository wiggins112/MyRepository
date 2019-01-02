<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar :title="$t('诊币排名')">
        </wxc-minibar>
        <div class="wrapper">
            <list class="list" ref="coin_list_dom" loadmoreoffset="50" :style="{ height: (page_height) + 'px' }" @loadmore="loadmoreCoins">
                <Refresher @refresh="refreshCoin" :loading="loading.coin_list"></Refresher>
                <header class="cell_box">
                    <div class="item tb_hd">
                        <div :class="['tb_th', item.type]" v-for="(item, index) in table_head_list" :key="index" @click="sorTable(index, item)">
                            <div class="tb_title">
                                <text :class="['tb_text', item.type === 'rank' && 'rank_title']" :style="{color: item.sort_type ? '#F7B237' : '#cdcfd2'}">{{item.name.replace(' ', '\n')}}</text>
                            </div>
                            <div class="filter_box" v-if="item.has_sortable">
                                <text class="icon icon_trigon" :style="{color: item.sort_type === 'up' ? '#F7B237' : '#cdcfd2'}">&#xe90f;</text>
                                <text class="icon icon_trigon rotate" :style="{color: item.sort_type === 'down' ? '#F7B237' : '#cdcfd2'}">&#xe90f;</text>
                            </div>
                        </div>
                    </div>
                </header>
                <cell class="cell_box" v-for="(coin, index) in coin_list" :key="index">
                    <div class="item" @click="jumpCoinsDetail(coin)">
                        <div class="tb_td rank rank_box">
                                <!-- <text :class="['icon', 'icon_arrow', coin.total_score_ranking_change < 0 ? 'warn' : 'safe']" v-if="coin.total_score_ranking_change">{{coin.total_score_ranking_change < 0 ? `\ue942` : `\ue941`}}</text>
                                <text :class="['icon', 'icon_arrow']" v-if="!coin.total_score_ranking_change"></text> -->
                                <text :class="['rank_text', getRankClass(coin.total_score_ranking)]">{{coin.total_score_ranking}}</text>
                        </div>
                        <div class="tb_td name">
                            <CoinItemInfo :coin="coin" box_width="w200"></CoinItemInfo>
                        </div>
                        <div class="tb_td score_value">
                            <text class="txt_r">{{coin.total_score}}</text>
                        </div>
                        <div class="tb_td score_value">
                            <text class="txt_r">{{coin.long_score}}</text>
                        </div>
                        <div class="tb_td score_value">
                            <text class="txt_r">{{coin.short_score}}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <Loadmore :loading="loading.coin_list" ></Loadmore>
                </cell>
                <cell class="tabbar_height"></cell>
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
import { Iconfont } from '../config/config.js'
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
            loading: {
                coin_list: 'loading',
            },
            coin_list: [],
            coin_list_size: 15,
            coin_list_page: 1,
            table_head_list: [{
                name: this.$t('排名'),
                has_sortable: false,
                type: 'rank',
                key: 'rank',
                sort_type: ''
            }, {
                name: this.$t('币种'),
                has_sortable: false,
                type: 'name',
                key: 'name',
                sort_type: ''
            }, {
                name: this.$t('币智慧总分'),
                has_sortable: true,
                type: 'bzh',
                key: 'total_score',
                sort_type: ''
            }, {
                name: this.$t('长线评分'),
                has_sortable: true,
                type: 'score_value',
                key: 'long_score',
                sort_type: ''
            }, {
                name: this.$t('短线评分'),
                has_sortable: true,
                type: 'score_value',
                key: 'short_score',
                sort_type: ''
            }],
            current_sortable: {},
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
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.getCoinDiagnosisRankings();
            })
        },
        sorTable(index, item) {
            if (!item.has_sortable) {
                return;
            }
            for (let k of this.table_head_list) {
                if (item.name === this.current_sortable.name) {
                    item.sort_type = {
                        '': 'down',
                        down: 'up',
                        up: '',
                    }[item.sort_type];
                    break;
                } else {
                    k.sort_type = '';
                    item.sort_type = 'down';
                }
            }
            this.current_sortable = item;
            this.coin_list = [];
            this.refreshCoin();
        },
        jumpCoinsDetail(coin) {
            this.$router.open({
                name: 'CoinDetail',
                type: 'PUSH',
                params: {
                    symbol: coin.symbol,
                    symbol_id: coin.symbol_id,
                    tabIndex: 2,
                }
            })
        },
        refreshCoin() {
            this.coin_list_page = 1;
            this.getCoinDiagnosisRankings();
        },
        loadmoreCoins() {
            if (this.loading.coin_list !== 'loaded') {
                return;
            }
            this.coin_list_page++;
            this.getCoinDiagnosisRankings();
        },
        getCoinDiagnosisRankings() {
            let params = {};
            let sort_type = this.current_sortable.sort_type;
            params.size = this.coin_list_size;
            params.page = this.coin_list_page;
            params.items = true;
            params.sort = this.current_sortable.key;
            if (sort_type) {
                params.order = sort_type === 'up' ? 1 : -1;
            }
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoinDiagnosisRankings',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_list = 'loaded';
                    if (params.page === 1) {
                        this.coin_list = resData.items;
                        if (!resData.items.length) {
                            this.loading.coin_list = 'empty';
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.coin_list = 'nomore';
                        } else {
                            this.coin_list.push(...resData.items);
                        }
                    }
                    this.$refs.coin_list_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.coin_list = 'error';
                console.log(e.message)
            });
        },
        getRankClass(rank) {
            if (rank === 1) {
                return 'rank_one'
            } else if (rank === 2) {
                return 'rank_two'
            } else if (rank === 3) {
                return 'rank_three'
            } else {
                return ''
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
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

.list {}

.cell_box {}

.item {
    padding: 0 @padding_size;
    background-color: #fff;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}

.tb_hd {
    padding-left: @padding_size;
    background-color: @bgf4f5f6;
}
.tb_th {
    padding-top: 20px;
    padding-bottom: 20px;
    align-items: center;
    flex-direction: row;
}
.tb_td {
    padding-top: @padding_size;
    padding-bottom: @padding_size;
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
}

.rank {
    width: 100px;
}

.rank_title {
    padding-right: 10px;
    flex-direction: column;
    justify-content: flex-end;
}


.score_value {
    flex: 1;
    padding-right: 10px;
    text-align: right;
    justify-content: flex-end;
}

.name {
    width: 200px;
}
.tb_title {
    
}
.tb_text {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_name {
    font-size: 22px;
    color: #9B9DA4;
}

.rank_box {
    flex-direction: row;
    justify-content: flex-start;
}

.rank_text {
    width: 40px;
    height: 40px;
    line-height: 40px;
    background-color: #D6D6D6;
    border-radius: 6px;
    text-align: center;
    font-size: 20px;
    color: #fff;
}

.rank_one {
    background-color: #F9C76D;
}

.rank_two {
    background-color: #B5B5B5;
}

.rank_three {
    background-color: #CE8F66;
}

.icon_arrow {
    width: 35px;
    height: 40px;
    line-height: 40px;
    font-size: 28px;
}

.icon_trigon {
    color: #cdcfd2;
    font-size: 10px;
}

.filter_box {
    padding-left: 5px;
    align-items: center;
}

.rotate {
    transform: rotate(180deg);
}
.txt_r {
    font-weight: bold;
}
</style>
