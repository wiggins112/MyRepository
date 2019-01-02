<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar title="">
            <div class="bar_middle" slot="middle" @click="filterClick">
                <text class="bar_title">{{current_header.text || $t('榜单选币')}}</text>
                <text :class="['icon', 'bar_icon_arrow', bar_active && 'bar_icon_active']">&#xe945;</text>
            </div>
            <div slot="right" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">
                <text class="icon">&#xe915;</text>
            </div>
        </wxc-minibar>
        <wxc-popover ref="wxc-popover" coverColor="transparent" :hasArrow="false" :activeIndex="current_header.active_index" :buttons="popo_btns" :position="popoverPosition" @wxcPopoverButtonClicked="popoverButtonClicked" @wxcPopoverClosed="wxcPopoverClosed"></wxc-popover>
        <wxc-popover ref="rank_model_popover" coverColor="transparent" :hasArrow="false" :position="popoverPosition" @wxcPopoverClosed="wxcPopoverClosed">
            <div slot :class="['kl_model']">
                <div class="model_box">
                    <div :class="['model_item', tab.active && 'model_item_active']" v-for="(tab, i) in rank_tab_items" :key="i" @click="tabRankSort(tab)">
                        <text :class="['item_text', tab.active && 'item_text_active']">{{tab.name}}</text>
                    </div>
                </div>
            </div>
        </wxc-popover>
        <list class="list" ref="coins_dom" :style="{height: page_height}" loadmoreoffset="100" @loadmore="loadmoreCoin">
            <Refresher @refresh="refreshCoins" :loading="loading.coin_list"></Refresher>
            <cell>
                <wxc-tab-page ref="wxc-tab-page" :hasPageWrap="false" title-type="text" :tab-titles="tabTitles" :tab-styles="tabStyles" :tab-page-height="tabPageHeight" @wxcTabPageCurrentTabSelected="wxcTabPageCurrentTabSelected">
                </wxc-tab-page>
            </cell>
            <header class="table_box">
                <div :class="['table_left', $locale() !== 'zh-CN' && 'table_left_long']">
                    <div class="table_bd">
                        <div class="table_th header">
                            <div  :class="['table_td_left', 'fixed_td', 'fixed_td_left', $locale() !== 'zh-CN' && 'table_td_left_long']" @click="filterRankClick">
                                <div class="filter_box">
                                    <text class="text head_text">{{`${$t('流通市值')} ${current_rank_tab.value ? $t('前') : ''}${current_rank_tab.name || $t('全部')}`}}</text>
                                    <text class="icon icon_sort">&#xe945;</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <scroller ref="scroller_right_head" :scrollable="false" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th header">
                            <div :class="['table_td_right', 'fixed_td', 'fixed_td_right', (table_head_list.length-1 === i) && 'table_td_last']" v-for="(header, i) in table_head_list" :key="i" @click="sorTable(header, i)">
                                <div class="filter_box">
                                    <text class="text head_text">{{header.name}}</text>
                                    <text class="icon icon_sort icon_sort_arrow" :style="{transform: header.sort_type === 'down' ? 'rotate(0deg)' : 'rotate(180deg)'}" v-if="header.sort_type">&#xe946;</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </scroller>
            </header>
            <cell class="table_box">
                <!-- 左边 -->
                <div  :class="['table_left', $locale() !== 'zh-CN' && 'table_left_long']">
                    <div class="table_bd">
                        <div class="table_th" v-for="(coin, index) in coin_list" :key="index" @click="jumpCoinsDetail(coin)">
                            <div :class="['table_td_left', $locale() !== 'zh-CN' && 'table_td_left_long']">
                                <div class="coin_name" :style="{width: $locale() !== 'zh-CN' ? 210 : 180}">
                                    <text class="text coin_symbol">{{coin.symbol}}</text>
                                    <text class="text coin_cn">{{$locale() === 'zh-CN' ? (coin.cn || coin.name) : coin.name}}</text>
                                </div>
                                <div class="sell_tips">
                                    <text class="text tips_text" v-if="coin.comment">{{coin.comment}}</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 右边 -->
                <scroller ref="scroller_right" class="table_right" scroll-direction="horizontal">
                    <div class="table_bd">
                        <div class="table_th" v-for="(coin, index) in coin_list" :key="index" @click="jumpCoinsDetail(coin)">
                            <div :class="['table_td_right', (table_head_list.length-1 === i) && 'table_td_last']" v-for="(table, i) in table_head_list" :key="i">
                                <text :class="['coin_change', coin[`percent_change_${current_header.key}`] > 0 ? 'safe_bg' : 'warn_bg']" v-if="table.name === $t('涨跌幅')">{{Number(coin[`percent_change_${current_header.key}`]).toFixed(2)}}%</text>
                                <text :class="['coin_text', coin[table.type] > 0 ? 'safe' : 'warn', table.class_name]" v-else>{{String(coin[table.key_str] || '--').replace('¥', '')}}</text>
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
import common from '../config/common'
let _self;
export default {
    components: { WxcTabPage, Refresher, WxcMinibar, StatusBar, Loadmore, CoinItemInfo, WxcPopover },
    data() {
        return {
            bindingx_token: null,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            loading: {
                coin_list: 'loading',
            },
            bar_active: false,
            coin_list: [],
            table_height: 0,
            popoverPosition: { x: 200, y: 520 },
            popoverArrowPosition: { pos: 'top', x: 160 },
            popo_btns: [{
                    text: this.$t('1小时'),
                    active_index: 0,
                    key: '1h'
                },
                {
                    text: this.$t('24小时'),
                    active_index: 1,
                    key: '24h'
                },
                {
                    text: this.$t('7天'),
                    active_index: 2,
                    key: '7d'
                }
            ],
            current_header: {},
            current_tab: {},
            rank_tab_items: [{
                name: this.$t('50'),
                value: '50',
                active: false
            }, {
                name: this.$t('100'),
                value: '100',
                active: false
            }, {
                name: this.$t('300'),
                value: '300',
                active: false
            }, {
                name: this.$t('500'),
                value: '500',
                active: false
            }, {
                name: this.$t('1000'),
                value: '1000',
                active: false
            }, {
                name: this.$t('全部'),
                value: '',
                active: true
            }],
            current_rank_tab: {},
            current_sortable: {sort_type: ''},
            table_head_list: [],
            tabTitles: [],
            tabStyles: {
                bgColor: '#FFFFFF',
                titleColor: '#7b7b7b',
                activeTitleColor: '#434343',
                activeBgColor: '#FFFFFF',
                isActiveTitleBold: true,
                height: 80,
                fontSize: 28,
                hasActiveBottom: true,
                activeBottomColor: '#F7B237',
                activeBottomHeight: 5,
                activeBottomWidth: 60,
                fontWeight: 'bold',
            },
            tabPageHeight: 80,
            coin_list_page: 1,
            coin_list_size: 12,
            router_params: {},
        }
    },
    created() {
        _self = this;
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
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    methods: {
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
        init() {
            this.getRouterParams();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                console.log('router_params', resData)
                if (this.router_params.time) {
                    let btn = this.popo_btns.find(item => item.key === this.router_params.time);
                    btn = btn || this.popo_btns[0];
                    this.current_header = btn;
                } else {
                   this.current_header = this.$storage.getSync('top_seleCoin_bar_filters') || this.popo_btns[0] || {}; 
                }
                this.current_header.active_index = this.current_header.active_index || 0;
                this.resetHeaderlist();
                this.resetTabTitles();
                this.initRankSort();
                this.initTabitems();
                this.initCurrentTab();
                this.current_sortable.sort_type = this.router_params.sort_type;
                this.coin_list = common.storageGetData("my_topselecoin") || [];//缓存数据 
                this.resetgetCoinsByRank();
            })
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        filterClick(e) {
            this.bar_active = !this.bar_active;
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 55;
            this.$refs['wxc-popover'].wxcPopoverShow();
        },
        filterRankClick(e) {
            this.popoverPosition.x = e.position.x;
            this.popoverPosition.y = e.position.y + 70;
            this.$refs['rank_model_popover'].wxcPopoverShow();
        },
        tabRankSort(tab) {
            this.current_rank_tab = tab;
            for (let item of this.rank_tab_items) {
                item.active = false;
            }
            tab.active = true;
            this.$storage.setSync('tab_rank_sort', this.current_rank_tab); // 本地存储选择的过滤条件
            this.$refs['rank_model_popover'].hideAction();
            this.resetgetCoinsByRank();
        },
        sorTable(item, index) {
            if (!item.has_sortable) {
                return;
            }
            for (let k of this.table_head_list) {
                if (item.name === this.current_sortable.name) {
                    item.sort_type = {
                        '': 'down',
                        down: 'up',
                        up: 'down',
                    }[item.sort_type];
                    break;
                } else {
                    k.sort_type = '';
                    item.sort_type = 'down';
                }
            }
            this.current_sortable = item;
            this.current_tab = item;
            this.resetgetCoinsByRank();
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
        resetTabTitles() {
            let Titlesitems = [{
                    title: this.$t('涨跌榜'),
                    key: 'percent_change',  // key 用于排序
                    type: 'percent_change', // type 用于与下面的头部表格匹配 和 匹配颜色
                    width: this.$locale() === 'zh-CN'? 135 : this.$t('涨跌榜').length * 17,
                },
                {
                    title: this.$t('换手率榜'),
                    key: 'turnover_rate',
                    type: 'turnover_rate',
                    width: this.$locale() === 'zh-CN'? 170 : this.$t('换手率榜').length * 17,
                },
                {
                    title: this.$t('成交额榜'),
                    key: 'volume_cny',
                    type: 'volume_cny',
                    width: this.$locale() === 'zh-CN'? 170 : this.$t('成交额榜').length * 17,
                },
                {
                    title: this.$t('资金净流入榜'),
                    key: 'coin_trade',
                    type: 'coin_trade_local',
                    width: this.$locale() === 'zh-CN'? 200 : this.$t('资金净流入榜').length * 17,
                },
                {
                    title: this.$t('流通市值榜'),
                    key: 'available_supply',
                    type: 'available_supply',
                    width: this.$locale() === 'zh-CN'? 190 : this.$t('流通市值榜').length * 17,
                },
            ]
            this.tabTitles = Titlesitems;
        },
        resetHeaderlist() {
            let Headerlist = [{
                name: this.$t('最新价') + this.get_currency_symbol,
                class_name: 'coin_price',
                key: 'price_usd', // key 用于排序
                key_str: 'price_local_str', // type 用于显示的字段
                type: `percent_change_${this.current_header.key}`, // type 用于与上面的头部匹配 和 匹配颜色
                has_sortable: true,
                sort_type: ''
            }, {
                name: this.$t('涨跌幅'),
                class_name: 'coin_price',
                key: 'percent_change',
                key_str: `percent_change_${this.current_header.key || '24h'}_str`,
                type: 'percent_change',
                has_sortable: true,
                sort_type: 'down'
            }, {
                name: this.$t('换手率'),
                class_name: 'coin_price_default',
                key: 'turnover_rate',
                key_str: 'day_turn_over_rate_str',
                type: 'turnover_rate',
                has_sortable: true,
                sort_type: ''
            }, {
                name: this.$t('成交额') + this.get_currency_symbol,
                class_name: 'coin_price_default',
                key: 'volume_cny',
                key_str: 'volume_local_24h_str',
                type: 'volume_cny',
                has_sortable: true,
                sort_type: ''
            }, {
                name: this.$t('资金净流入') + this.get_currency_symbol,
                class_name: 'coin_price',
                key: 'coin_trade',
                key_str: 'coin_trade_local_str',
                type: 'coin_trade_local',
                has_sortable: true,
                sort_type: ''
            }, {
                name: this.$t('流通市值') + this.get_currency_symbol,
                class_name: 'coin_price_default',
                key: 'available_supply',
                key_str: 'available_market_cap_local_str',
                type: 'available_supply',
                has_sortable: true,
                sort_type: ''
            }]
            this.table_head_list = Headerlist;
        },
        initTabitems() {
            if (this.current_header.key === '1h' || this.current_header.key === '7d') {
                this.tabTitles = this.tabTitles.filter((item) => {
                    return (item.type !== 'volume_cny' && item.type !== 'turnover_rate')
                })
                this.table_head_list = this.table_head_list.filter((item) => {
                    return (item.type !== 'volume_cny' && item.type !== 'turnover_rate')
                })
            } else {
                this.resetTabTitles();
                this.resetHeaderlist();
            }
        },
        initRankSort() {
            this.current_rank_tab = this.$storage.getSync('tab_rank_sort') || {}; 
            for(let rank of this.rank_tab_items) {
                if (rank.value === this.current_rank_tab.value) {
                    rank.active = true;
                } else {
                    rank.active = false;
                }
            }
        },
        popoverButtonClicked(obj) {
            let index = obj.index;
            this.current_header = this.popo_btns[index];
            this.current_header.active_index = index;
            this.initTabitems();
            this.current_tab = this.tabTitles[0];
            this.$refs['wxc-tab-page'].setPage(0,null,false);
            this.resetgetCoinsByRank();
            this.$storage.setSync('top_seleCoin_bar_filters', this.current_header); // 本地存储选择的过滤条件
        },
        wxcPopoverClosed() {
            this.bar_active = false;
        },
        refreshCoins() {
            this.resetgetCoinsByRank();
        },
        loadmoreCoin() {
            if (this.loading.coin_list !== 'loaded') {
                return;
            }
            this.coin_list_page++;
            this.getCoinsByRank();
        },
        wxcTabPageCurrentTabSelected(e) {
            let index = e.page;
            this.current_tab = this.tabTitles[index];
            this.setTableHeadList();
            this.resetgetCoinsByRank();
        },
        initCurrentTab() {
            for(let [index, tab] of this.tabTitles.entries()) {
                if (tab.key === this.router_params.tab_type) {
                    this.current_tab = this.tabTitles[index];
                    this.$nextTick(() => {
                        this.$refs['wxc-tab-page'].setPage(index,null,false);
                    })
                }
            }
        },
        setTableHeadList() {
            this.resetHeaderlist();
            this.initTabitems();
            for (let item of this.table_head_list) {
                if (item.type === this.current_tab.type) {
                    this.table_head_list = this.table_head_list.filter((tab) => {
                        return item.type !== tab.type;
                    })
                    item.sort_type = this.router_params.sort_type || 'down';
                    this.table_head_list.splice(1, 0, item);
                    this.current_sortable = item;
                } else {
                    item.sort_type = '';
                }
            }
        },
        resetgetCoinsByRank() {
            this.coin_list_page = 1;
            this.getCoinsByRank();
        },
        getCoinsByRank() {
            let params = {};
            let order = '';
            let sort_type = this.current_sortable.sort_type;
            if (sort_type === 'down') {
                order = '-1';
            } else if (sort_type === 'up') {
                order = '1';
            } else {
                order = '';
            }
            params.market_cap_usd_rank = this.current_rank_tab.value || '';
            params.page = this.coin_list_page || 1;
            params.size = this.coin_list_size || 20;
            params.items = 1;
            params.time = this.current_header.key || '';
            params.order = order;
            params.rank = this.current_tab.key || 'percent_change';
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoinsByRank',
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
                    common.storageSetData("my_topselecoin", this.coin_list);//缓存数据 
                    this.$refs.coins_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: res.message })
                }
            }).catch((err) => {
                console.error(err);
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
        hideModule() {
            return this.$storage.getSync('hideModule')
        },
        get_currency_symbol() {
            return '(' + this.$storage.getSync("currency").currency_symbol + ')';
        },   
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}

.list {
    width: 750px;
}

.table_box {
    width: 750px;
    flex-direction: row;
}

.table_left {
    width: 210px;
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
.table_td_left {
    padding-left: @padding_size;
    padding-right: 7px;
    height: 120px;
    width: 210px;
    align-items: flex-start;
    justify-content: center;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
}
.table_td_right {
    padding: 0 15px;
    height: 120px;
    width: 240px;
    align-items: flex-end;
    justify-content: center;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
}
.table_td_left_long {
    width: 250px;
}
.table_left_long {
    width: 250px;
}
.table_td_last {
    padding-right: @padding_size;
    // align-items: center;
}
.fixed_td {
    height: 70px;
    background-color: #f4f5f6;
}
.fixed_td_right {
    padding: 0 7px;
}
.filter_box {
    flex-direction: row;
}
.icon {
    color: #434343;
    font-family: iconfont2;
    font-size: 45px;
}

.bar_middle {
    flex-direction: row;
    align-items: center;
}

.bar_icon_arrow {
    margin-top: 10px;
    margin-left: 10px;
    font-size: 20px;
    color: #a1a1a1;
}

.bar_icon_active {
}

.bar_title {
    font-size: 36px;
    font-weight: bold;
    color: #434343;
}

.header_title {
    padding-left: @padding_size;
    align-items: center;
    flex-direction: row;
}

.header_refs {
    justify-content: flex-end;
}

.title_text {
    font-size: 24px;
    color: #9B9DA4;
}

.icon_arrow {
    padding-left: 10px;
    font-size: 15px;
}

.icon_refs {
    padding-right: 10px;
    font-size: 24px;
}

.filter_scroller {
    flex-direction: row;
    flex: 1;
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

.warn_bg {
    background-color: @warn_color;
}

.safe_bg {
    background-color: @safe_color;
}
.coin_text {
    font-weight: bold;
}
.head_text {
    text-align: right;
    font-size: 22px;
    color: #afb0b6;
}
.coin_name {
    width: 180px;
    flex-direction: row;
    text-overflow: ellipsis;
    overflow: hidden;
}
.coin_symbol {
    font-size: 30px;
    font-weight: bold;
}
.coin_cn {
    flex: 1;
    padding-left: 10px;
    margin-top: 10px;
    font-size: 20px;
    color: #9b9da4;
    text-overflow: ellipsis;
    lines: 1;
}
.sell_tips {
    margin-top: 15px;
    flex-direction: row;
}
.tips_text {
    padding: 2px 10px;
    color: #497ddb;
    font-size: 20px;
    border-radius: 4px;
    background-color: #ecf2fb;
}
.model_box {
    padding-top: @padding_size;
    padding-left: @padding_size;
    padding-right: @padding_size;
    width: 750px;
    flex-direction: row;
    flex-wrap: wrap;
    background-color: #fff;
    border-bottom-width: 1px;
    border-color: #ddd;
}

.model_item {
    margin-bottom: 25px;
    margin-right: 5px;
    width: 135px;
    height: 50px;
    align-items: center;
    justify-content: center;
}

.model_item_active {
    background-color: #FAD187;
    color: #fff;
    border-radius: 6px;
}

.item_text_active {
    color: #fff;
}

.item_text {
    font-size: 28px;
    color: #434343;
    text-align: center;
}
.icon_sort {
    padding-left: 8px;
    margin-top: 8px;
    font-size: 18px;
    color: #9d9e9e;
}
.icon_sort_arrow {
    margin-top: 1px;
    font-size: 25px;
}
.coin_price_default {
    color: #434343;
}
</style>
