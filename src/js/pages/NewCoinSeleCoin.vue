<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar :title="$t('新币发行')" rightWidth="180px">
            <div class="bar_right" slot="right">
                <text class="icon bar_text" @click="openUrl" v-if="!hideModule['NewCoinApplication']">{{ $t('申请') }}</text>
                <text class="icon" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">&#xe915;</text>
            </div>
        </wxc-minibar>
        <list class="list" ref="coins_dom" :style="{height: page_height}" loadmoreoffset="200" @loadmore="loadmoreCoin">
            <Refresher @refresh="refreshCoins" :loading="loading.coin_list"></Refresher>
            <header class="table_box">
                 <!-- 标题左侧 -->
                <div class="table_left">
                    <div class="table_bd">
                        <div class="table_th header">
                            <div class="table_td_left fixed_td">
                                <text class="tb_th">{{ $t('币种') }}</text>
                                <text class="tb_th">/24h{{ $t('成交额') }}({{get_currency_symbol}})</text>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 标题尾部 -->
                <scroller ref="scroller_right_head" :scrollable="false" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th header">
                            <div class="table_td_right fixed_td" v-for="(header, i) in table_head_list" :key="i">
                                <text class="title_text">{{header.name}}</text>
                            </div>
                        </div>
                    </div>
                </scroller>
            </header>
            <cell class="table_box">
                 <!-- 内容左侧 -->
                <div class="table_left">
                    <div class="table_bd">
                        <div class="table_th" v-for="(coin, idnex) in coin_list" :key="idnex" @click="jumpCoinsDetail(coin)">
                            <div class="table_td_left">
                                <div class="coin_name">
                                    <text class="text coin_cny">{{coin.symbol || coin.name}}</text>
                                    <!-- <text class="text coin_time">{{getTime(coin.publish_time)}}</text> -->
                                    <text class="text coin_tag" v-if="coin.recommend">{{ $t('推荐') }}</text>
                                </div>
                                <text class="text coin_usd">{{String(coin.volume_usd_24h_str || '').replace('¥', '')}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 内容尾部 -->
                <scroller ref="scroller_right" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th" v-for="(coin, idnex) in coin_list" :key="idnex" @click="jumpCoinsDetail(coin)">
                            <div class="table_td_right" v-for="(table, i) in table_head_list" :key="i">
                                <!-- <text :class="['text', table.key === 'percent_change_24h' && 'coin_change' , getColorClass(coin, table.key), table.class_name]">{{String(coin[table.key_str] || '--').replace('¥', '')}}</text> -->
                                <text v-if="table.key === 'percent_change_24h'" :class="['coin_change', getColorClass(coin, table.key), table.class_name ]">{{String(coin[table.key_str] || '--').replace('¥', '')}}</text>
                                <text v-else :class="['text',  getColorClass(coin, table.key), table.class_name]">{{String(coin[table.key_str] || '--').replace('¥', '')}}</text>
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
import { Utils } from 'weex-ui';
import Refresher from '../components/Refresher.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import CoinItemInfo from '../components/CoinItemInfo.vue'
import WxcPopover from '../components/WxcPopover.vue'
import WxcTabPage from '../components/WxcTabPage.vue'
import { Iconfont } from '../config/config.js'
const dom = weex.requireModule('dom')
export default {
    components: { WxcTabPage, Refresher, WxcMinibar, StatusBar, Loadmore, CoinItemInfo, WxcPopover },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            loading: {
                coin_list: 'loading',
            },
            coin_list: [],
            coin_list_page: 1,
            coin_list_size: 20,
            router_params: {},
        }
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
        setTimeout(() => {
            this.bindingXscroll();
        }, 1000)
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
            this.getV2CoinsByNew();
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
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        jumpCoinsDetail(coin) {
            this.$router.open({
                name: 'CoinDetail',
                type: 'PUSH',
                params: {
                    symbol: coin.symbol,
                    symbol_id: coin.id,
                    block_cc_id: coin.block_cc_id // 新币需要传这个
                }
            })
        },
        refreshCoins() {
            this.coin_list_page = 1;
            this.getV2CoinsByNew();
        },
        loadmoreCoin() {
            if (this.loading.coin_list !== 'loaded') {
                return;
            }
            this.coin_list_page++;
            this.getV2CoinsByNew();
        },
        getV2CoinsByNew() {
            let params = {};
            params.page = this.coin_list_page;
            params.size = this.coin_list_size;
            params.items = 1;
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getV2CoinsByNew',
                methods: 'GET',
                data: params,
            }).then((res) => {
                if (res.error === 0) {
                    this.loading.coin_list = 'loaded';
                    if (params.page === 1) {
                        this.coin_list = res.items;
                        if (!res.items.length) {
                            this.loading.coin_list = 'empty';
                        }
                    } else {
                        if (!res.items.length) {
                            this.loading.coin_list = 'nomore';
                        } else {
                            this.coin_list.push(...res.items);
                        }
                    }
                    this.$refs.coins_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        // getTime(ts) {
        //     if (ts) {
        //         return moment.unix(ts).startOf('hour').fromNow();
        //     } else {
        //         return '';
        //     }
        // },
        openUrl() {
            this.$router.toWebView({
                url: 'http://cn.mikecrm.com/JaBK26n', // 页面 url
                title: this.$t('币智慧'), // 页面 title
                navShow: true // 是否显示native端导航栏，默认是true
            })
        },
        getColorClass(coin, key) {
            if (key === 'percent_change_24h') {
                let name = '';
                name = coin[key] > 0 ? 'safe_bg' : 'warn_bg';
                return name;
            }
            if (key) {
                let name = '';
                name = coin[key] > 0 ? 'safe' : 'warn';
                return name;
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
        },
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
        },
        table_head_list() { 
            let items = [{
                name: this.$t('价格') + '(' + this.get_currency_symbol + ')',
                class_name: 'default_price',
                key: 'price_local',
                key_str: 'price_local_str',
            }, {
                name: this.$t('24h涨跌'),
                class_name: 'coin_price',
                key: 'percent_change_24h',
                key_str: 'percent_change_24h_str',
            }, {
                name: this.$t('发行时间'),
                class_name: 'coin_price',
                key: '',
                key_str: 'publish_time_str',
            }, {
                name: this.$t('现价/众筹价'),
                class_name: 'coin_price',
                key: 'average_price_percent',
                key_str: 'average_price_percent_str',
            }, {
                name: this.$t('技术热度'),
                class_name: 'coin_price',
                key: '',
                key_str: 'github_sum_count',
            }, {
                name: this.$t('媒体热度'),
                class_name: 'coin_price',
                key: '',
                key_str: 'media_sum_count',
            }, {
                name: this.$t('上线交易所数量'),
                class_name: 'coin_price',
                key: '',
                key_str: 'publish_count',
            }];
            return items;
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #434343;
    font-family: iconfont2;
    font-size: 45px;
}

.bar_right {
    flex-direction: row;
}

.bar_text {
    padding-top: 2px;
    font-size: 37px;
    padding-right: 30px;
}


.title_text {
    font-size: 24px;
    color: #9B9DA4;
}

.icon_arrow {
    padding-left: 10px;
    font-size: 15px;
}

.coin_name {
    flex-direction: row;
    align-items: center;
}

.coin_time {
    margin-left: 10px;
    font-size: 20px;
    color: #A2A4AB;
}

.coin_tag {
    margin-left: 10px;
    padding: 2px 5px;
    font-size: 20px;
    background-color: #358DFA;
    color: #fff;
    border-radius: 4px;
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
    font-size: 28px;
}

.text {
    font-size: 32px;
    font-weight: bold;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_box {
    flex-direction: row;
    align-items: center;
}

.coin_logo {
    width: 35px;
    height: 35px;
    border-radius: 50%;
}

.coin_text {
    padding-left: 15px;
}

.logo_image {
    width: 35px;
    height: 35px;
}

.coin_name {
    font-size: 22px;
    color: #9B9DA4;
    text-overflow: ellipsis;
    line: 1;
}

.coin_platform {
    font-size: 22px;
    color: #4883EE;
}

.coin_num {
    width: 200px;
}

.list {
    width: 750px;
}

.table_box {
    width: 750px;
    flex-direction: row;
}

.table_left {
    width: 220px;
    background-color: #fff;
}

.table_right {
    flex: 1;
    background-color: #fff;
    flex-direction: row;
}

.table_th {
    flex-direction: row;
}

.fixed_td {
    background-color: @bgf4f5f6;
}
.table_td_left {
    padding-left: @padding_size;
    padding-right: 10px;
    height: 110px;
    width: 220px;
    align-items: flex-start;
    justify-content: center;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
}
.table_td_right {
    padding: 0 @padding_size;
    height: 110px;
    width: 260px;
    align-items: flex-end;
    justify-content: center;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
}
.fixed_td {
    height: 90px;
}
.default_price {
    color: #434343;
}
</style>