<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar title="">
            <div class="bar_middle" slot="middle">
                <text class="bar_title">{{ $t('交易所选币') }}</text>
                <div class="bar_title_time">
                    <wxc-countdown tpl="{s}s" v-if="show_countdown" :timeBoxStyle="{ backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '29px', color: '#434343'}" :dotTextStyle="{color: '#434343', fontSize: '29px', fontWeight: 'normal'}"  :time="countdown_time_ts" @wxcOnComplete="onCompletedTwo">
                            </wxc-countdown>
                </div>
            </div>
            <div slot="right" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">
                <text class="icon">&#xe915;</text>
            </div>
        </wxc-minibar>
        <div class="content">
            <div class="header" v-if="loading.coin_list !== 'empty'">
                <div class="header_list">
                    <div :class="['header_item', header.class_name]" v-for="(header, i) in header_list" :key="i" @click="filterClick(header, $event)">
                        <div class="header_title">
                            <text class="title_text">{{header.name}}</text>
                            <text :class="['icon', 'title_text', 'icon_arrow', header.active && 'icon_arrow_active']" v-if="header.key !== 'platform_price'">&#xe90f;</text>
                        </div>
                    </div>
                </div>
                <wxc-popover ref="wxc-popover" coverColor="transparent" :hasArrow="false" :activeIndex="current_header.active_index" :buttons="popo_btns" :position="popoverPosition" @wxcPopoverButtonClicked="popoverButtonClicked" @wxcPopoverClosed="wxcPopoverClosed"></wxc-popover>
            </div>
            <scroller ref="scroller_dom" class="wrapper_scroller" loadmoreoffset="600" @loadmore="loadmoreCoin" offset-accuracy="100" @scroll="scrollHandler" :style="{ height: page_height}" v-if="coin_list.length">
                <div :class="[!is_ios && 'fixed_box', is_ios && 'fixed_box_ios']" :style="{height: is_ios ? (table_height || page_height) : 'auto'}">
                    <div :class="[is_ios && 'fixed_box']" :style="{bottom: is_ios ? 0 : 'auto'}">
                        <div class="list" ref="table_box">
                            <div class="cell_box" v-for="(coin, idnex) in coin_list" :key="idnex">
                                <div class="item" @click="jumpCoinsDetail(coin)">
                                    <div class="tb_td coin_info">
                                        <CoinItemInfo :coin="coin"></CoinItemInfo>
                                    </div>
                                    <div class="tb_td market_cap">
                                        <text class="text">{{current_pair_base}}</text>
                                    </div>
                                </div>
                            </div>
                            <div style="height: 40px;"></div>
                        </div>
                    </div>
                </div>
                <div :class="[!is_ios && 'scroller_box', is_ios && 'scroller_box_ios']" :style="{height: is_ios ? (table_height || page_height) : 'auto'}">
                    <div :class="[is_ios && 'scroller_box']" :style="{bottom: is_ios ? 0 : 'auto',marginTop: is_ios ? -(table_height || page_height) : 'auto'}">
                        <scroller class="filter_scroller" scroll-direction="horizontal">
                            <div class="table_box">
                                <div class="list" ref="table_box">
                                    <div class="cell_box" v-for="(coin, idnex) in coin_list" :key="idnex">
                                        <div class="item">
                                            <div class="tb_td coin_price" v-for="(plat, i) in coin.platforms" :key="i" @click="openWebUrl(plat)">
                                                <div class="cny_price_text" v-if="plat.price_local_str">
                                                    <text :class="['text', 'cny_price_text', plat.percent_change_8am > 0 ? 'safe' : 'warn']">{{plat.price_local_str || ''}}</text>
                                                    <text :class="['icon', 'icon_arrow', plat.percent_change_8am > 0 ? 'icon_safe' : 'icon_warn']">&#xe90f;</text>
                                                </div>
                                                <text :class="['text', 'coin_platform']" v-if="plat.platform">{{plat.platform}}</text>
                                                <text :class="['text', 'us_price_text']" v-if="!plat.price_usd_str">--</text>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="height: 40px;">
                                        <text class="nomore_text" v-if="loading.coin_list === 'nomore'">{{ $t('没有更多了') }}</text>
                                    </div>
                                </div>
                            </div>
                        </scroller>
                    </div>
                </div>
            </scroller>
            <Loadmore :loading="loading.coin_list" blankpagetype="icontext"></Loadmore>
        </div>
        <wxc-overlay v-if="show_mask_guide" opacity="0.3" :show="true" duration="50" :hasAnimation="false" @wxcOverlayBodyClicking="iKownIt"></wxc-overlay>
        <div class="mask_box" v-if="show_mask_guide">
            <image class="mask_guide_image" :src="`bmlocal://assets/images/seletctcoin/overlay_selecoin_${language}.png`"></image>
            <wxc-button class="mask_guide_btn" :text="$t('我知道了')" @wxcButtonClicked="iKownIt"></wxc-button>
        </div>
    </div>
</template>
<script>
import { Utils, WxcCountdown, wxcButton, WxcOverlay } from 'weex-ui';
import Refresher from '../components/Refresher.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import CoinItemInfo from '../components/CoinItemInfo.vue'
import WxcPopover from '../components/WxcPopover.vue'
import {Iconfont} from '../config/config.js'
const dom = weex.requireModule('dom')
export default {
    components: {WxcCountdown, wxcButton, WxcOverlay, Refresher, WxcMinibar, StatusBar, Loadmore, CoinItemInfo, WxcPopover },
    data() {
        return {
            show_countdown: true,
            show_mask_guide: false,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            loading: {
                coin_list: 'loading',
            },
            coin_list: [],
            coin_list_page: 1,
            coin_list_size: 10,
            countdown_time_ts: new Date().getTime() + 6000 * 10,
            table_height: 0,
            popoverPosition: { x: 200, y: 520 },
            popoverArrowPosition: { pos: 'top', x: 160 },
            popo_btns: [],
            current_header: {},
            current_pair_base: '',
            header_list: [{
                name: this.$t('币种'),
                active: false,
                class_name: 'coin_info',
                active_index: '',
                key: 'sort',
                popo_btns: [{
                        text: this.$t('按市值降序'),
                        key: 'rank'
                    },
                    {
                        text: this.$t('按交易量降序'),
                        key: 'volume_usd_24h_rank'
                    },
                    {
                        text: this.$t('最新发行'),
                        key: 'publish_time'
                    }
                ],
            }, {
                name: this.$t('货币对'),
                active: false,
                class_name: 'market_cap',
                active_index: 0,
                key: 'pair_base',
                popo_btns: [{
                        text: 'USDT',
                        key: 'USDT'
                    },
                    {
                        text: 'BTC',
                        key: 'BTC'
                    },
                    {
                        text: 'ETH',
                        key: 'ETH'
                    }
                ],
            }, {
                name: this.$t('交易所价格') +'('+ this.$storage.getSync("currency").currency_symbol + ')',
                active: false,
                class_name: 'coin_price',
                active_index: '',
                key: 'platform_price',
                popo_btns: [{
                        text: this.$t('价格从高到低'),
                        key: 'key-scan'
                    },
                    {
                        text: this.$t('交易量从高到低'),
                        key: 'key-qrcode'
                    }
                ],
            }],
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
    },
    methods: {
        init() {
            this.initGuide();
            this.getCoinsAndPlatforms();
        },
        initGuide() {
            let platform_mask_guide = this.$storage.getSync('platform_mask_guide') || '';
            this.show_mask_guide = platform_mask_guide ? false : true; 
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        onCompletedTwo() {
            this.show_countdown = false;
            setTimeout(() => {
                this.show_countdown = true;
                this.countdown_time_ts = new Date().getTime() + 6000 * 10;
            }, 100)
            this.coin_list_page = 1;
            this.coin_list = [];
            this.getCoinsAndPlatforms();
        },
        filterClick(header, e) {
            if (header.key === 'platform_price') {
                return;
            }
            for(let head of this.header_list) {
                head.active = false;
            }
            header.active = !header.active;
            this.popoverPosition.x = e.position.x + 20;
            this.popoverPosition.y = e.position.y + 75;
            this.popo_btns = header.popo_btns;
            this.current_header = header;
            this.$refs['wxc-popover'].wxcPopoverShow();
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
        popoverButtonClicked(obj) {
            let index = obj.index;
            for (let item of this.header_list) {
                if (item.name === this.current_header.name) {
                    item.active_index = index;
                }
            }
            this.coin_list_page = 1;
            this.coin_list = [];
            this.getCoinsAndPlatforms();
        },
        wxcPopoverClosed() {
            for(let head of this.header_list) {
                head.active = false;
            }
        },
        scrollHandler(e) {
            if (!this.is_ios) {
                return;
            }
            dom.getComponentRect(this.$refs.table_box, option => {
                this.table_height = option.size.height/2 + 200;
            })
        },
        loadmoreCoin() {
            if (this.loading.coin_list !== 'loaded') {
                return;
            }
            this.coin_list_page++;
            this.getCoinsAndPlatforms();

        },
        getCoinsAndPlatforms() {
            let params = {};
            for(let head of this.header_list) {
                if (head.active_index !== '') {
                    params[head.key] = head.popo_btns[head.active_index].key;
                }
            };
            params.page = this.coin_list_page || 1;
            params.size =  this.coin_list_size || 20;
            params.items = 1;
            this.current_pair_base = params.pair_base;
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoinsAndPlatforms',
                methods: 'GET',
                data: params,
            }).then((res) => {
                if (res.error === 0) {
                    this.loading.coin_list = 'loaded';
                    res.items = this.fixPlatformsData(res.items);
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
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: resData.message })
                }
                this.$refs.scroller_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
            }).catch((err) => {
                console.error(err);
            });
        },
        fixPlatformsData(items) {
            let result_items = items;
            let items_length = [];
            for(let item of result_items) {
                items_length.push(item.platforms.length)
            }
            let max = parseInt(Math.max(...items_length));
            for(let item of result_items) {
                let lengths = item.platforms.length;
                let cha = max - lengths;
                if (cha != 0) {
                    for(let m = 0; m < cha; m++) {
                        item.platforms.push([]);
                    }
                }
            }
            return result_items;
        },
        openWebUrl(plat) {
            if (!plat.website) {
                return;
            }
            this.$router.openBrowser(plat.website);
        },
        iKownIt() {
            this.$storage.setSync('platform_mask_guide', true);
            this.show_mask_guide = false;
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        language() {
            return this.$storage.getSync('language');
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
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
.bar_middle {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-items: center;
}
.bar_title {
    font-size: 36px;
    font-weight: bold;
    color: #434343;
    text-align: center;
}
.bar_title_time {
    width: 130px;
    font-size: 32px;
}
.header_list {
    flex-direction: row;
}

.header_item {
    padding: 28px 0;
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
    margin-left: 10px;
    font-size: 15px;
    transform: rotate(180deg);
}
.icon_arrow_active {
    transform: rotate(0);
}
.icon_refs {
    padding-right: 10px;
    font-size: 24px;
}

.filter_scroller {
    flex-direction: row;
    flex: 1;
}

.cell_box {
    height: 120px;
    background-color: #fff;
}
.list {
    padding-bottom: 120px;
}
.item {
    height: 120px;
    padding: @padding_size;
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

.coin_refs {
    width: 100px;
}

.market_cap {
    width: 130px;
}

.coin_info {
    width: 210px;
}

.coin_price {
    width: 280px;
}

.text {
    font-size: 28px;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

.icon_safe {
    color: @safe_color;
    transform: rotate(0);
}

.icon_warn {
    margin-left: 10px;
    transform: rotate(180deg);
    color: @warn_color;
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

.cny_price_text {
    flex-direction: row;
    align-items: center;
}

.us_price_text {
    padding: 8px 0;
    font-size: 22px;
    color: #9B9DA4;
}

.coin_platform {
    font-size: 22px;
    color: #4883EE;
}

.coin_num {
    width: 200px;
}

.wrapper_scroller {
    width: 750px;
    position: relative;
    background-color: #fff;
}

.scroller_box {
    width: 750px - 350px;
    position: absolute;
    left: 350px;
    top: 0;
}

.fixed_box {
    width: 350px;
    left: 0;
    top: 0;
    position: absolute;
}
.fixed_box_ios {
    position: relative;
}
.scroller_box_ios {
    position: relative;
}
.mask_box {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
}
.mask_guide_image {
    width: 750px;
    height: 1334px;
}
.mask_guide_btn {
    position: absolute;
    left: 85%;
    width: 586px;
    bottom: 120px;
    background-color: @main_color;
    border-radius: 6px;
}
.nomore_text {
    padding: 10px;
    font-size: 24px;
    color: #666;
}
</style>
