<template>
    <div class="fast_selecion_box">
        <list class="home_box" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="300" @loadmore="loadmoreSuperiorArticleList" :style="{ height: (page_height) + 'px' }">
            <Refresher @refresh="refresh" @refreshEnd="refreshEnd"></Refresher>
            <cell class="banner">
                <div style="margin-top: 22px;margin-left: 25px;margin-right: 25px; border-radius: 10px;">
                    <BannerSlider :span="20" :banner_list="select_coin_banner" :imageWidth="700" :imageHeight="200" imageRadius="10"></BannerSlider>
                </div>
            </cell>
            <cell>
                <div class="box_hd">
                    <div class="selecoin" v-if="select_coin.length">
                        <div class="seleitem" v-for="(select, i) in select_coin" :key="i" @click="selectCoin(select)">
                            <image class="seleimage" :src="select.icon"></image>
                            <text class="seletext">{{select.title}}</text>
                        </div>
                    </div>
                    <div class="notice" v-if="notice_list.length && !hideModule['FastSeleCoinNotice']">
                        <div class="notice_box">
                            <slider class="slider" infinite="true" interval="5000" auto-play="true">
                                <div class="slider_box" v-for="(notice, i) in notice_list" :key="i" @click="jumpNotice(notice)">
                                    <image class="notice_image" resize="cover" :src="notice.image"></image>
                                    <text class="notice_text">{{notice.title}}</text>
                                </div>
                            </slider>
                        </div>
                    </div>
                </div>
            </cell>
            <cell>
                <div class="recommend">
                    <CellItem :has-arrow="true" @wxcCellClicked="jumpCoinDiagnose" :has-top-border="false" :has-bottom-border="false" :extraContent="$t('更多')" :cellStyle="{backgroundColor: 'transparent'}" :extraSize="22">
                        <div class="cellitem_title" slot="title_text">
                            <text class="cellitem_first">{{ $t('今日推荐') }}</text>
                            <text class="cellitem_second cellitem_second_tips"> {{ $t('*来自币智慧AI实验室') }}</text>
                        </div>
                    </CellItem>
                    <div class="recommend_coin" @click="jumpCoinDetailByRecommend">
                        <div class="less_row coin_info">
                            <image class="coin_logo" resize="contain" :src="recommend_coin.icon || default_coin_icon"></image>
                            <text class="text coin_name_en">{{recommend_coin.symbol}}</text>
                            <text class="text coin_name_cn" v-if="$locale() === 'zh-CN'">{{recommend_coin.cn}}</text>
                            <div style="flex: 1;"></div>
                            <text :class="['coin_info_price', recommend_coin.percent_change_8am > 0 ? 'safe' : 'warn']">{{recommend_coin.price_local_str}}</text>
                            <text :class="['coin_info_percent', recommend_coin.percent_change_8am > 0 ? 'safe' : 'warn']">{{recommend_coin.percent_change_8am_str}}</text>
                        </div>
                        <div class="less_row bzh_score">
                            <div class="score_left" >
                                <text class="text score_text bzh_name">{{ $t('币智慧总分') }}</text>
                                <div class="score_value_box">
                                    <text class="text score_value">{{recommend_coin.total_score}}</text>
                                </div>
                            </div>
                            <div class="score_right">
                                <div class="less_row rate_box">
                                    <text class="text score_text">{{ $t('长线评分') }}</text>
                                    <Rate :value="recommend_coin.long_score/2"></Rate>
                                </div>
                                <div class="less_row rate_box">
                                    <text class="text score_text">{{ $t('短线评分') }}</text>
                                    <Rate :value="recommend_coin.short_score/2"></Rate>
                                </div>
                            </div>
                        </div>
                        <div class="less_center guide_box" v-if="recommend_coin.comment">
                            <div class="guide">
                                <image class="guide_bg" src="bmlocal://assets/images/coin/guide_bg.png"></image>
                                <text class="text guide_text">{{recommend_coin.comment}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="recommend" v-if="media_hot_coin.length">
                    <CellItem :has-arrow="true" @wxcCellClicked="MediaHotMore" :has-top-border="false" :has-bottom-border="false" :extraContent="$t('更多')" :cellStyle="{backgroundColor: 'transparent'}" :extraSize="22">
                        <div class="cellitem_title" slot="title_text">
                            <text class="cellitem_first">{{ $t('今日热门') }}</text>
                            <text class="cellitem_second"> - {{ $t('媒体热度') }}</text>
                        </div>
                    </CellItem>
                    <div class="recommend_hot_coin">
                        <div class="card_item" v-for="(media, i) in media_hot_coin" :key="i" @click="goCoinsDetail(media, 'bzh_choose_hot_click')">
                            <div class="less_center hot_coin_logo_box">
                                <div class="hot_coin_logo hot_coin_logo_div">
                                    <image class="hot_coin_logo" resize="cover" :src="media.icon || default_coin_icon"></image>
                                </div>
                                <image class="hot_coin_crown" resize="cover" src="bmlocal://assets/images/tasks/first.png" v-if="i === 0"></image>
                                <image class="hot_coin_crown" resize="cover" src="bmlocal://assets/images/tasks/second.png" v-if="i === 1"></image>
                                <image class="hot_coin_crown" resize="cover" src="bmlocal://assets/images/tasks/third.png" v-if="i === 2"></image>
                            </div>
                            <div class="less_center hot_coin_info">
                                <text class="text coin_name_en recommend_coin_name_en">{{media.symbol}}</text>
                                <text class="text coin_name_cn recommend_coin_name_cn" v-if="$locale() === 'zh-CN'">{{media.cn || media.name || ''}}</text>
                            </div>
                            <div class="hot_coin_price">
                                <text :class="['coin_info_price', media.percent_change_8am > 0 ? 'safe' : 'warn']">{{media.price_local_str}}</text>
                                <text :class="['coin_info_percent', 'change_cion_percent', media.percent_change_8am > 0 ? 'safe' : 'warn']">{{media.percent_change_8am_str}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="recommend" v-if="!hideModule['Fund']">
                    <CellItem
                        :has-arrow="true"
                        @wxcCellClicked="FundMore"
                        :has-top-border="false"
                        :has-bottom-border="false"
                        :extraContent="$t('更多')"
                        :cellStyle="{backgroundColor: 'transparent'}"
                        :extraSize="22">
                        <div class="cellitem_title" slot="title_text">
                            <text class="cellitem_first">{{ $t('策略基金') }}</text>
                        </div>
                    </CellItem>
                    <FundIndex ref="fundIndex" />
                </div>
                <div class="recommend" v-if="coin_changeEvents.length">
                    <CellItem :has-arrow="true" @wxcCellClicked="jumpChangeTab" :has-top-border="false" :has-bottom-border="false" :extraContent="$t('更多')" :cellStyle="{backgroundColor: 'transparent'}" :extraSize="22">
                        <div class="cellitem_title" slot="title_text">
                            <text class="cellitem_first">{{ $t('今日异动') }}</text>
                        </div>
                    </CellItem>
                    <div class="recommend_hot_coin">
                        <div class="card_item card_item_change" v-for="(change_event, i) in coin_changeEvents" :key="i" @click="goCoinsDetail(change_event, 'bzh_choose_hot_click')">
                            <div class="less_row hot_coin_info">
                                <text class="text coin_name_en recommend_coin_name_en">{{change_event.symbol}}</text>
                                <text class="text coin_name_cn recommend_coin_name_cn" v-if="$locale() === 'zh-CN'">{{change_event.cn}}</text>
                            </div>
                            <div class="change_type">
                                <text class="text change_type_text">{{change_event.name_cn}}</text>
                            </div>
                            <div class="hot_coin_price change_cion_price">
                                <text :class="['coin_info_price', change_event.percent_change_8am > 0 ? 'safe' : 'warn']">{{change_event.price_local_str}}</text>
                                <text :class="['coin_info_percent', 'change_cion_percent', change_event.percent_change_8am > 0 ? 'safe' : 'warn']">{{change_event.percent_change_8am_str}}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </cell>
            <cell>
                <div class="investment_box">
                    <text class="bzh_intro">{{ $t('币智慧') }} {{ $t('已获得千万人民币投资') }}</text>
                    <div class="investment_list">
                        <div class="investment_item" v-for="(investment, i) in investment_list" :key="i">
                            <image class="investment_image" :src="investment.icon"></image>
                        </div>
                    </div>
                </div>
            </cell>
        </list>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import { Utils } from 'weex-ui';
import CellItem from './CellItem.vue'
import Refresher from './Refresher.vue'
import BannerSlider from './BannerSlider.vue'
import Rate from './Rate.vue'
import common from '../config/common';
import FundIndex from './Fund/FundIndex.vue'
export default {
    components: { CellItem, Refresher, BannerSlider, Rate, FundIndex },
    data() {
        return {
            filters,
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
            select_coin_banner: [],
            loading: {
                site_banner: 'loading',
                media_hot_coin: 'loading',
                recommend_coin: 'loading',
                coin_changeEvents: 'loading'
            },
            notice_image: `bmlocal://assets/images/seletctcoin/notice.png`,
            mark_image: `bmlocal://assets/images/seletctcoin/tuijun.png`,
            notice_list: [],
            select_coin: [],
            investment_list: [{
                icon: `bmlocal://assets/images/seletctcoin/okcoin.png`,
            }, {
                icon: `bmlocal://assets/images/seletctcoin/shubeiziben.png`,
            }, {
                icon: `bmlocal://assets/images/seletctcoin/liudongziben.png`,
            }, {
                icon: `bmlocal://assets/images/seletctcoin/innomub.png`,
            }],
            recommend_coin: {},
            media_hot_coin: [],
            coin_changeEvents: [],
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
            this.getConfig();
            this.getMediaHotCoins();
            this.getConfigBanners();
            this.getCoinDiagnosisRecommend();
            this.getCoinChangeEventsRankings();
            if (!this.hideModule['Fund']) this.$refs.fundIndex.init()
        },
        jumpArticleDetail() {
            this.$router.open({
                name: 'ArticleDetail',
                params: {}
            })
        },
        jumpCoinDiagnose() {
            this.$router.open({
                name: 'CoinDiagnoseRank',
                params: {}
            });
        },
        MediaHotMore() {
            this.$router.open({
                name: 'CoinTopList',
                params: {
                    title: this.$t('媒体热度 top10'),
                    media_attention_sum_count_rank: '前10'
                }
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_choose_media_click');
        },
        FundMore () {
            this.$router.open({
                name: 'FundPlaza',
                params: {
                }
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_choose_fundPlaza_click');
        },
        jumpNotice(notice) {
            if (!notice.link) {
                return;
            }
            if (notice.type === 'app_page') {
                this.$router.open({
                    name: notice.link,
                    type: 'PUSH',
                    params: notice.link_params || {},
                })
            } else if (notice.type === 'link' && notice.link_type === 'outlink') {
                this.$router.openBrowser(notice.link);
            } else {
                this.$router.toWebView({
                    url: notice.link, // 页面 url
                    title: notice.title || '', // 页面 title
                    navShow: true // 是否显示native端导航栏，默认是true
                })
            }
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_choose_link_click');
        },
        jumpChangeTab() {
            // 设置跳转的底部tabbar为1，头部tab为第二个
            this.$emit('SetTabbarActive', 1, 2)
        },
        selectCoin(select) {
            if (!select.link) {
                return;
            }
            this.$router.open({
                name: select.link,
                type: 'PUSH',
                params: select.link_params || {},
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(select.event_name || 'bzh_choose');
        },
        goCoinsDetail(hot, event_name) {
            this.$router.open({
                name: 'CoinDetail',
                type: 'PUSH',
                params: {
                    symbol: hot.symbol,
                    symbol_id: hot.symbol_id,
                }
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(event_name || 'bzh_choose');
        },
        jumpCoinDetailByRecommend() {
            this.$router.open({
                name: 'CoinDetail',
                type: 'PUSH',
                params: {
                    symbol: this.recommend_coin.symbol,
                    symbol_id: this.recommend_coin.symbol_id,
                    tabIndex: 2
                }
            })
        },
        wxcCellClicked(top, i) {
            let params = {};
            for (let key in top.value) {
                params[key] = top.value[key];
            }
            params.title = top.title;
            this.$router.open({
                name: 'CoinTopList',
                params: params
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(top[i].event_name);
        },
        refresh() {
            this.init();
        },
        refreshEnd() {},
        getConfigBanners() {
            let params = {};
            this.loading.site_banner = 'loading';
            this.$fetch({
                name: 'getConfigBanners',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.site_banner = 'loaded';
                    this.select_coin_banner = resData.select_coin_banners || [];
                    this.notice_list = resData.text_banners || [];
                } else {
                    this.loading.site_banner = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.site_banner = 'error';
                console.log(e.message)
            });
        },
        getMediaHotCoins() {
            let params = {};
            params.size = 3;
            params.page = 1;
            params.items = true;
            params.media_attention_sum_count_rank = '前10'
            this.loading.media_hot_coin = 'loading';
            this.$fetch({
                name: 'getCoins',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.media_hot_coin = 'loaded';
                    this.media_hot_coin = resData.items;
                } else {
                    this.loading.media_hot_coin = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.media_hot_coin = 'error';
                console.log(e.message)
            });
        },
        getCoinDiagnosisRecommend() {
            let params = {};
            params.size = 1;
            params.page = 1;
            params.items = true;
            params.show_price = 1;
            this.loading.recommend_coin = 'loading';
            this.$fetch({
                name: 'getCoinDiagnosisRecommend',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.recommend_coin = 'loaded';
                    this.recommend_coin = resData.result;
                } else {
                    this.loading.recommend_coin = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.recommend_coin = 'error';
                console.log(e.message)
            });
        },
        getCoinChangeEventsRankings() {
            let params = {};
            params.size = 3;
            params.page = 1;
            this.loading.coin_changeEvents = 'loading';
            this.$fetch({
                name: 'getCoinChangeEventsRankings',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_changeEvents = 'loaded';
                    this.coin_changeEvents = resData.items;
                } else {
                    this.loading.coin_changeEvents = 'error';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.coin_changeEvents = 'error';
                console.log(e.message)
            });
        },
        getConfig() {
            let params = {};
            params.type = 'app_config';
            params.key = 'app_select_coin_menus';
            this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.select_coin = resData.result.menus;
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                console.log(e.message)
            });
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
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.home_box {
    position: relative;
    padding-bottom: @tabbar_height;
    width: 750px;
}

.banner {
    background-color: #fff;
}

.selecoin {
    padding: 40px @padding_size;
    flex-direction: row;
    flex-wrap: wrap;
    background-color: #fff;
    border-bottom-width: 1px;
    border-bottom-color: #eee;
}

.seleitem {
    width: 175px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.seleimage {
    width: 80px;
    height: 80px;
}

.seletext {
    padding-top: 25px;
    font-size: 24px;
    color: #434343;
    text-align: center;
}

.notice {
    margin-bottom: 20px;
}

.notice_box {
    width: 750px;
    height: 70px;
    flex-direction: row;
    align-items: center;
    background-color: #fff;
    border-radius: 6px;
}

.slider {
    width: 750px;
    height: 70px;
    align-items: center;
}

.slider_box {
    padding: 0 @padding_size;
    flex-direction: row;
    width: 750px;
    height: 70px;
    align-items: center;
}

.notice_image {
    width: 40px;
    height: 40px;
}

.notice_text {
    padding-left: 10px;
    font-size: 24px;
    color: #828281;
    text-overflow: ellipsis;
    lines: 1;
    flex: 1;
}

.box_bd {}

.fast_selecion_box {}

.coin_box {
    background-color: #fff;
    margin-bottom: 20px;
}

.title {
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: @padding_size;
    padding-right: @padding_size;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
    background-color: #fff;
}

.coin_list {
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.coin_item {
    position: relative;
    padding: @padding_size;
    width: 250px;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.mark_image {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 80px;
    height: 80px;
}

.coin_item_noline {
    border-right-width: 0px;
}

.coin_name {
    padding-bottom: 15px;
    flex-direction: row;
}

.symbol {
    flex: 1;
}

.hot {
    flex-direction: row;
    justify-content: flex-end;
    flex: 2;
}

.icon_hot {
    padding-right: 5px;
    color: @warn_color;
}

.hot_value {
    font-size: 26px;
    color: #9B9DA4;
}

.price_cny {
    padding-bottom: 15px;
}

.price {
    font-size: 32px;
}

.percent {
    font-size: 24px;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

.investment_box {
    padding: 70px 0;
}

.bzh_intro {
    text-align: center;
    color: #9B9DA4;
    font-size: 20px;
}

.investment_list {
    padding-top: 40px;
    margin-bottom: 20px;
    padding: @padding_size;
    flex-direction: row;
    flex-wrap: wrap;
}

.investment_item {
    width: 175px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.investment_image {
    width: 142px;
    height: 96px;
}

.recommend {
    margin-bottom: @padding_size;
}

.cellitem_title {
    position: relative;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.cellitem_first {
    color: #434343;
    font-size: 26px;
    font-weight: bold;
}

.cellitem_second {
    padding-left: 10px;
    color: #434343;
    font-size: 20px;
}

.cellitem_second_tips {
    color: #b3b6bf;
}

.recommend_coin {
    margin-left: @padding_size;
    margin-right: @padding_size;
    background-color: #fff;
    border-radius: 6px;
    border-width: 1px;
    border-color: #eee;
    overflow: hidden;
}

.coin_info {
    padding-top: 40px;
    padding-bottom: 15px;
    padding-left: @padding_size;
    padding-right: @padding_size;
    align-items: flex-end;
}

.coin_logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-width: 1px;
    border-color: #eee;
}
.hot_coin_info {
    padding: 0 15px;
    text-overflow: ellipsis;
    lines: 1;
    overflow: hidden;
}
.coin_name_en {
    position: relative;
    top: 2px;
    font-weight: bold;
    font-size: 40px;
    height: 40px;
    padding-left: 10px;
}

.coin_name_cn {
    flex: 1;
    font-size: 22px;
    padding-left: 10px;
    text-overflow: ellipsis;
    lines: 1;
}

.recommend_coin_name_en {
    font-size: 30px;
}

.recommend_coin_name_cn {
    margin-top: 5px;
    font-size: 22px;
}

.coin_info_left {
    align-items: flex-end;
    flex: 1;
    justify-content: flex-start;
}

.coin_info_right {
    position: relative;
    top: 10px;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
}

.coin_info_price {
    position: relative;
    top: 1px;
    height: 32px;
    font-size: 32px;
    font-weight: bold;
}

.coin_info_percent {
    padding-left: 25px;
    height: 24px;
    font-size: 24px;
    font-weight: bold;
}

.change_cion_percent {
    padding-left: 0;
    margin-top: 10px;
}

.bzh_score {}

.score_left {
    flex: 1;
    justify-content: center;
    align-items: center;
    border-right-width: 1px;
    border-right-color: #e7eaf1;
}
.score_left_en {
    flex: 0.9;
    border-right-width: 1px;
    border-right-color: #e7eaf1;
    flex-direction: column;
}
.score_right {
    padding-top: 25px;
    padding-left: 35px;
    padding-right: 35px;
    align-items: center;
    justify-content: center;
}
.score_right_en {
    flex: 2;
    padding-top: 25px;
    padding-left: 25px;
}
.rate_box {
    padding-bottom: 25px;
}

.score_text {
    position: relative;
    top: 2px;
    font-size: 22px;
    color: #9b9da4;
}

.bzh_name {
    padding-top: 15px;
    text-align: center;
}

.score_value_box {
    flex: 1;
    position: relative;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.score_value {
    padding-top: 10px;
    padding-bottom: 12px;
    font-weight: bold;
    font-size: 60px;
    color: #6d98f0;
    text-align: center;
}

.score_value_iamge {
    position: relative;
    top: -15px;
    left: 10px;
    font-size: 20px;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    padding-right: 10px;
    padding-left: 10px;
    color: #fff;
    background-color: #f5593f;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 16px;
    opacity: 0.8;
    background-image: linear-gradient(to right, #ff1630, #fc734a);
}

.score_rank {
    font-size: 20px;
    color: #6d98f0;
}

.guide {
    margin-top: 25px;
    position: relative;
    width: 430px;
    height: 43px;
    justify-content: center;
    align-items: center;
}

.guide_bg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.guide_text {
    color: #fff;
    font-size: 24px;
}

.recommend_hot_coin {
    padding-left: @padding_size;
    width: 750px;
    flex-direction: row;
    flex-wrap: wrap;
}

.card_item {
    width: 222px;
    height: 270px;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    border-width: 1px;
    border-color: #eee;
    margin-right: 15px;
    flex-direction: column;
}

.card_item_change {
    padding-top: @padding_size;
    justify-content: flex-start;
    align-items: stretch;
}

.hot_coin_logo_box {
    position: relative;
    width: 90px;
    height: 90px;
    margin-bottom: 10px;
    align-items: flex-start;
    justify-content: center;
}

.hot_coin_logo_div {
    position: relative;
    top: 23px;
}

.hot_coin_logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #eee;
}

.hot_coin_crown {
    position: absolute;
    top: 0px;
    left: 2px;
    width: 42px;
    height: 38px;
}

.hot_coin_price {
    padding-top: 10px;
    justify-content: center;
    align-items: center;
}

.change_type {
    padding: 5px;
    margin-top: 30px;
    margin-bottom: 10px;
    margin-left: @padding_size;
    margin-right: @padding_size;
    background-color: #ffeeeb;
    align-items: center;
    justify-content: center;
}

.change_type_text {
    font-size: 20px;
    color: #f78673;
}

.change_cion_price {
    padding-left: @padding_size;
    align-items: stretch;
}

</style>
