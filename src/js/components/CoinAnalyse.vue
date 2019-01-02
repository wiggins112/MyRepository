<template>
    <div class="coin_analyse_box">
        <div class="list">
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('相关概念') }}</text>
                        <text class="icon title_text icon_mark" v-if="0">&#xe936;</text>
                    </div>
                    <div class="info_items">
                        <text class="table_name">{{ $t('标签') }}</text>
                        <div class="table_text table_text_tags">
                            <text class="text_tags" v-for="tag in coin_info.labels" :key="tag">{{tag}}</text>
                            <text class="text_tags" v-for="tag in coin_info.scopes_cn" :key="tag">{{tag}}</text>
                            <text class="text_tags" v-if="coin_info.platform">{{coin_info.platform}} Token</text>
                        </div>
                    </div>
                    <div class="info_items">
                        <text class="table_name">{{ $t('所属板块') }}</text>
                        <div class="github_box">
                            <text class="github_num">{{coin_info.concept || '--'}}</text>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cell"  v-if="!this.hideModule['CoinDetailNodeMap']">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('知识图谱') }}</text>
                        <text class="icon title_text icon_mark" v-if="0">&#xe936;</text>
                    </div>
                    <div class="item_info_map" v-if="nodemap_url">
                        <web :src="nodemap_url" style="width: 750px;height: 505px;" v-if="is_ios"></web>
                        <!-- 自定义原生组件 关闭了硬件加速，为了截图canvas-->
                        <bzhWeb :src="nodemap_url" style="width: 750px;height: 505px;" v-if="!is_ios"></bzhWeb>
                        <div class="fullscreen_box">
                            <text class="icon icon_fullscreen">&#xe940;</text>
                            <text class="fullscreen_text" @click="openMapFullscreen">{{ $t('全屏预览') }}</text>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title" @click="jumpCoinExplain('zhibiao')">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('指标') }}</text>
                        <text class="icon title_text icon_mark">&#xe936;</text>
                    </div>
                    <!-- <div class="info_items">
                        <text class="table_name">{{ $t('社交媒体') }}</text>
                        <div class="links_box">
                            <text class="links">Facebook</text>
                            <text class="links">Twitter</text>
                            <text class="links">Reddit</text>
                        </div>
                    </div> -->
                    <div class="info_items">
                        <text class="table_name">{{ $t('GitHub代码最后提交时间') }}</text>
                        <div class="github_box">
                            <text class="github_num">{{coin_social.github.update_time || '--'}}</text>
                        </div>
                    </div>
                    <div class="item_info_table">
                        <div class="info_table_hd">
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub贡献者') }}</text>
                                <text class="table_text">{{coin_social.github.contributor || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub提交数') }}</text>
                                <text class="table_text">{{coin_social.github.commits || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub粉丝数') }}</text>
                                <text class="table_text">{{coin_social.github.stars || '--'}}</text>
                            </div>
                        </div>
                        <div class="info_table_bd">
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub版本数') }}</text>
                                <text class="table_text">{{coin_social.github.releases || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub关注者') }}</text>
                                <text class="table_text">{{coin_social.github.subscribers || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('GitHub复制数') }}</text>
                                <text class="table_text">{{coin_social.github.forks || '--'}}</text>
                            </div>
                        </div>
                    </div>
                    <div class="item_info_items">
                        <div class="info_items">
                            <text class="table_name">{{ $t('Reddit订阅') }}({{coin_social.social.update_time}})</text>
                            <div class="github_box">
                                <text class="github_num">{{coin_social.social.reddit.subscribers || '--'}}</text>
                                <text class="github_num" v-if="getWeekTotal(coin_social.social.reddit.subscribers, coin_social.week.reddit.subscribers)">{{ $t('，较七天') }}{{getWeekTotal(coin_social.social.reddit.subscribers, coin_social.week.reddit.subscribers)}}</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_name">{{ $t('Twitter关注') }}({{coin_social.social.update_time}})</text>
                            <div class="github_box">
                                <text class="github_num">{{coin_social.social.twitter.followers || '--'}}</text>
                                <text class="github_num" v-if="getWeekTotal(coin_social.social.twitter.followers, coin_social.week.twitter.followers)">{{ $t('，较七天') }}{{getWeekTotal(coin_social.social.twitter.followers, coin_social.week.twitter.followers)}}</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_name">{{ $t('Facebook点赞') }}({{coin_social.social.update_time}})</text>
                            <div class="github_box">
                                <text class="github_num">{{coin_social.social.facebook.likes || '--'}}</text>
                                <text class="github_num" v-if="getWeekTotal(coin_social.social.facebook.likes, coin_social.week.facebook.likes)">{{ $t('，较七天') }}{{getWeekTotal(coin_social.social.facebook.likes, coin_social.week.facebook.likes)}}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title" @click="jumpCoinExplain('shequnguimo')">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('社群规模') }}</text>
                        <text class="icon title_text icon_mark">&#xe936;</text>
                    </div>
                    <div class="item_info_echart" v-if="tab_items.length">
                        <div class="line_hd">
                            <div class="tabs">
                                <text :class="['social_tab', tab.active && 'social_active']" @click="tabChart(tab)" v-for="(tab, index) in tab_items" :key="index">{{tab.name}}</text>
                            </div>
                        </div>
                        <EchartLine :lazyloaded="false" :data_x="echartline_data.socials_data_x" :data_y="echartline_data.socials_data_y" :loading="loading.socials_data" :echart_option="{color: '#73d1d2', name: `${current_socials.name}`, height: 300}"></EchartLine>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <!-- 持币分析 -->
                    <CoinHoldLine></CoinHoldLine>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <div class="item_title_left">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('开发进度') }}</text>
                            <text class="icon title_text icon_mark" v-if="0">&#xe936;</text>
                        </div>
                        <div class="item_title_right">
                            <text class="title_intro">{{ $t('数据来源') }}：GitHub</text>
                        </div>
                    </div>
                    <div class="item_info_echart">
                        <div class="github_data_tips">
                            <text class="tips_text" v-if="githubs_mod_commits">{{ $t('最近一个月代码提交') }}{{githubs_total_commits - githubs_mod_commits}}&nbsp;{{ $t('次') }}&nbsp;</text>
                            <!-- <text class="tips_text">{{ $t('累计提交') }}{{githubs_total_commits}}{{ $t('次') }}</text> -->
                        </div>
                        <EchartLine :lazyloaded="true" :data_x="echartline_data.github_data_x" :data_y="echartline_data.github_data_y" :loading="loading.githubs_data" :echart_option="{color: '#f57aaa', name: $t('代码提交数量'), height: 300}"></EchartLine>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title" @click="jumpCoinExplain('qingxuzhishu')">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('情绪指数') }}</text>
                        <text class="icon title_text icon_mark">&#xe936;</text>
                    </div>
                    <div class="item_info_echart">
                        <EchartLine :lazyloaded="true" :data_x="echartline_data.sentiments_data_x" :data_y="echartline_data.sentiments_data_y" :loading="loading.sentiments_data" :echart_option="{color: '#b4ea3d', name: $t('情绪指数'), height: 300}"></EchartLine>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <div class="item_title_left">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('事件日历') }}</text>
                            <text class="icon title_text icon_mark" v-if="0">&#xe936;</text>
                        </div>
                        <div class="less_row" @click="handleTranslate" v-if="!this.hideModule['TransToEng']">
                            <text class="yi_icon">{{ $t('译') }}</text>
                            <text class="yi_text">{{show_trans?$t('收起'):$t('查看')}}{{ $t('翻译') }}</text>
                            <wxc-part-loading :show="loading.trans==='loading'"></wxc-part-loading>
                        </div>
                    </div>
                    <div class="item_info_timeline">
                        <SimpleFlow v-if="coin_events.length" :list="coin_events" :listCn='coin_events_cn' :themeColor="themeColor1" @clickSimpleFlowItem="clickSimpleFlowItem">
                        </SimpleFlow>
                        <Loadmore v-else  blankpagetype="text" loading="no"></Loadmore>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import SimpleFlow from './SimpleFlow.vue';
import EchartLine from './EchartLine.vue';
import CoinHoldLine from './CoinHoldLine.vue';
import CoinNodeMap from './CoinNodeMap.vue';
import { API_BaseUrl, Bizhihui_Url, PUBLISH_COUNTRY } from '../config/config.js'
import filters from '../config/filters.js'
import { WxcPartLoading } from 'weex-ui'
import common from '../config/common'
import Loadmore from './Loadmore.vue'
export default {
    components: { SimpleFlow, EchartLine, CoinHoldLine, CoinNodeMap, WxcPartLoading, Loadmore },
    data() {
        return {
            filters,
            is_ios: String(weex.config.env.platform).toLowerCase() === 'ios' ? true : false,
            router_params: {},
            themeColor1: {
                lineColor: '#F7B237',
                pointInnerColor: '#fff',
                pointBorderColor: '#F7B237',
                highlightTitleColor: '#F7B237',
                highlightPointInnerColor: '#F7B237',
                highlightPointBorderColor: '#F7DCA5'
            },
            loading: {
                graphs: 'loading',
                coin_info: 'loading',
                coin_social: 'loading',
                socials_data: 'loading',
                githubs_data: 'loading',
                coin_events: 'loading',
                sentiments_data: 'loading',
                trans: 'init',
            },
            socials_data: [],
            coin_events: [],
            coin_events_cn: [],
            show_trans: false,
            trans_en: '',
            graphs: {},
            echartline_data: {
                socials_data_x: [],
                socials_data_y: [],
                github_data_x: [],
                github_data_y: [],
                sentiments_data_x: [],
                sentiments_data_y: [],
            },
            coin_info: {},
            coin_social: {
                github: {},
                social: {
                    reddit: {},
                    twitter: {},
                    facebook: {},
                },
                week: {
                    reddit: {},
                    twitter: {},
                    facebook: {},

                },
            },
            tab_items: [{
                name: this.$t('Reddit订阅'),
                value: 'reddit',
                active: true
            }, {
                name: this.$t('Twitter关注'),
                value: 'twitter',
                active: false
            }, {
                name: this.$t('Facebook点赞'),
                value: 'facebook',
                active: false
            }],
            current_socials: {},
            githubs_total_commits: 0,
            coin_sentiments: [],
            coin_githubs: [],
        }
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
    },
    created() {
        this.init();
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                this.$emit('Loadmoreing');
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getRouterParams();
            this.current_socials = this.tab_items[0];
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                let coin_info = common.storageGetData("my_coin_info_"+ this.router_params.symbol);
                let coin_social = common.storageGetData("my_coin_social_"+ this.router_params.symbol);
                let socials_data = common.storageGetData("my_socials_data_"+ this.router_params.symbol);
                let coin_events = common.storageGetData("my_coin_events_"+ this.router_params.symbol);

                let coin_sentiments = common.storageGetData("my_coin_sentiments_"+ this.router_params.symbol);//缓存数据 
                let coin_githubs = common.storageGetData("my_coin_githubs_"+ this.router_params.symbol);//缓存数据 
                
                if (coin_info) {
                    this.coin_info = coin_info;
                    this.loading.coin_info = 'loaded';
                } else {
                    this.getCoinInfo();
                }

                if (coin_social) {
                    this.coin_social = coin_social;
                    this.loading.coin_social = 'loaded';
                } else {
                    this.getCoinSocial();
                }

                if (socials_data) {
                    this.socials_data = socials_data;
                    this.fixSocialsdData();
                } else {
                    this.getCoinSocials();
                }

                if (coin_events) {
                    this.coin_events = coin_events;
                    this.loading.coin_events = 'loaded';
                } else {
                    this.getCoinEvents();
                }

                if (coin_sentiments) {
                    this.coin_sentiments = coin_sentiments;
                    this.loading.sentiments_data = 'loaded';
                    this.fixSentimentsdData(this.coin_sentiments); //情绪指数折线图
                } else {
                    this.getCoinSentiments(); //情绪指数折线图请求
                }

                if (coin_githubs) {
                    this.coin_githubs = coin_githubs;
                    this.loading.githubs_data = 'loaded';
                    this.fixGithubsdData(this.coin_githubs); //开发进度折线图
                } else {
                    this.getCoinGithubs(); //开发进度折线图请求
                }
            })
        },
        openMapFullscreen() {
            this.$router.open({
                name: 'CoinNodeMap',
                params: {
                    symbol: this.router_params.symbol
                }
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_map_click');
        },
        jumpCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                    pagename: 'CoinAnalyse'
                }
            })
        },
        clickSimpleFlowItem(result) {
            this.$router.openBrowser(result.item.eventUrl);
        },
        tabChart(tab) {
            for (let item of this.tab_items) {
                item.active = false;
            }
            tab.active = true;
            this.current_socials = tab;
            this.fixSocialsdData();
        },
        getCoinInfo() {
            let params = {};
            this.loading.coin_info = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/info`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_info = 'loaded';
                    this.coin_info = resData.result;
                } else {
                    this.loading.coin_info = 'error';
                    this.$notice.toast({ message: resData.message });
                }
                common.storageSetData("my_coin_info_"+ this.router_params.symbol, this.coin_info);//缓存数据 
            }).catch((e) => {
                this.loading.coin_info = 'error';
                console.log(e.message);
            });
        },
        getCoinSocial() {
            let params = {};
            this.loading.coin_social = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/social`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_social = 'loaded';
                    let contributor = 0;
                    let commits = 0;
                    let stars = 0;
                    let releases = 0;
                    let subscribers = 0;
                    let forks = 0;

                    for (let git of resData.result.github.github) {
                        contributor += git.contributor;
                        commits += git.commits;
                        stars += git.stars;
                        releases += git.releases;
                        subscribers += git.subscribers;
                        forks += git.forks;
                    }
                    resData.result.github.contributor = contributor;
                    resData.result.github.commits = commits;
                    resData.result.github.stars = stars;
                    resData.result.github.releases = releases;
                    resData.result.github.subscribers = subscribers;
                    resData.result.github.forks = forks;
                    resData.result.social.update_time = this.filters.dateFormat(resData.result.social.update_time, 'MM-dd hh:mm')
                    resData.result.github.update_time = this.filters.dateFormat(resData.result.github.update_time / 1000, 'yyyy-MM-dd hh:mm')
                    this.coin_social = resData.result;
                    common.storageSetData("my_coin_social_"+ this.router_params.symbol, this.coin_social);//缓存数据 
                } else {
                    this.loading.coin_social = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.coin_social = 'error';
                console.log(e.message);
            });
        },
        getCoinEvents() {
            let params = {};
            this.loading.coin_events = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/events`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_events = 'loaded';
                    if (!resData.items.length) {
                        this.loading.coin_events = 'empty';
                    }
                    for (let item of resData.items) {
                        item.time = `${this.filters.dateFormat(item.startDateTimeUtc, 'yyyy-MM-dd')}：`;
                        // item.title = `${this.filters.dateFormat(item.startDateTimeUtc, 'yyyy-MM-dd')}：${item.title_cn || item.title}`;
                        this.trans_en = this.trans_en + item.title_cn + "★";
                    }
                    this.coin_events = resData.items;
                    common.storageSetData("my_coin_events_"+ this.router_params.symbol, this.coin_events);//缓存数据 
                } else {
                    this.loading.coin_events = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.coin_events = 'error';
                console.log(e.message);
            });
        },
        handleTranslate() {
            if (!this.show_trans) {
                let params = {};
                params.word = this.trans_en;
                this.loading.trans = 'loading';
                return this.$fetch({
                    name: 'postEnglishToChinese',
                    method: 'POST',
                    data: params,
                }).then(resData => {
                    if (resData.error === 0) {
                        this.loading.trans = 'loaded';
                        this.coin_events_cn = resData.result.split('★');
                        this.show_trans = true;
                    } else {
                        this.loading.trans = 'error';
                        this.$notice.toast({ message: resData.message });
                    }
                }).catch((e) => {
                    this.loading.trans = 'error';
                });
            } else {
                this.show_trans = false;
                this.coin_events_cn = [];
            }
        },
        getCoinSocials() {
            let params = {};
            this.loading.socials_data = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/socials`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    resData.items = resData.items.reverse();
                    this.loading.socials_data = 'loaded';
                    if (!resData.items.length) {
                        this.loading.socials_data = 'empty';
                    }
                    this.socials_data = resData.items;
                    this.fixSocialsdData();
                } else {
                    this.loading.socials_data = 'error';
                    this.$notice.toast({ message: resData.message });
                }
                common.storageSetData("my_socials_data_"+ this.router_params.symbol, this.socials_data);//缓存数据 
            }).catch((e) => {
                this.loading.socials_data = 'error';
                console.log(e.message);
            });
        },
        fixSocialsdData() {
            this.echartline_data.socials_data_x = [];
            this.echartline_data.socials_data_y = [];
            let type = this.current_socials.value;
            for (let item of this.socials_data) {
                if (type === 'twitter') {
                    if (item.twitter.followers) {
                        this.echartline_data.socials_data_x.push(this.filters.dateFormat(item.update_time, 'MM-dd'));
                        this.echartline_data.socials_data_y.push(item.twitter.followers || 0);
                    }
                }
                if (type === 'reddit') {
                    if (item.reddit.subscribers) {
                        this.echartline_data.socials_data_x.push(this.filters.dateFormat(item.update_time, 'MM-dd'));
                        this.echartline_data.socials_data_y.push(item.reddit.subscribers || 0);
                    }
                }
                if (type === 'facebook') {
                    if (item.facebook.likes) {
                        this.echartline_data.socials_data_x.push(this.filters.dateFormat(item.update_time, 'MM-dd'));
                        this.echartline_data.socials_data_y.push(item.facebook.likes || 0);
                    }
                }
            }
            if (!this.echartline_data.socials_data_x.length) {
                this.loading.socials_data = 'empty';
            } else {
                this.loading.socials_data = 'loaded';
            }
        },
        getCoinGithubs() {
            let params = {};
            this.loading.githubs_data = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/githubs`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.githubs_data = 'loaded';
                    this.coin_githubs = resData.items.reverse();
                    if (!this.coin_githubs.length) {
                        this.loading.githubs_data = 'empty';
                    } else {
                        // 最新的一个就是累计提交
                        let item_github = this.coin_githubs[this.coin_githubs.length - 1];
                        for (let g of item_github.github) {
                            this.githubs_total_commits += g.commits;
                        }
                    }
                    this.fixGithubsdData(this.coin_githubs);
                    this.githubs_mod_commits = resData.commits || 0;
                    common.storageSetData("my_coin_githubs_"+ this.router_params.symbol, this.coin_githubs);//缓存数据 
                } else {
                    this.loading.githubs_data = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.githubs_data = 'error';
                console.log(e.message);
            });
        },
        fixGithubsdData(items) {
            this.echartline_data.github_data_x = [];
            this.echartline_data.github_data_y = [];
            for (let item of items) {
                let count = 0;
                for (let k of item.github) {
                    count += k.commits || 0
                }
                if (count) {
                    this.echartline_data.github_data_x.push(this.filters.dateFormat(item.update_time / 1000, 'MM-dd'));
                    this.echartline_data.github_data_y.push(count);
                }
            }
            if (!this.echartline_data.github_data_x.length) {
                this.loading.githubs_data = 'empty';
            }
        },
        getCoinSentiments() {
            let params = {};
            this.loading.sentiments_data = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/sentiments`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.sentiments_data = 'loaded';
                    this.coin_sentiments = resData.items.reverse();
                    if (!resData.items.length) {
                        this.loading.sentiments_data = 'empty';
                    }
                    common.storageSetData("my_coin_sentiments_"+ this.router_params.symbol, this.coin_sentiments);//缓存数据 
                    this.fixSentimentsdData(this.coin_sentiments);
                } else {
                    this.loading.sentiments_data = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.sentiments_data = 'error';
                console.log(e.message);
            });
        },
        fixSentimentsdData(items) {
            this.echartline_data.sentiments_data_x = [];
            this.echartline_data.sentiments_data_y = [];
            for (let item of items) {
                if (item.sentiment) {
                    this.echartline_data.sentiments_data_x.push(this.filters.dateFormat(item.update_time / 1000, 'MM-dd'));
                    this.echartline_data.sentiments_data_y.push(this.filters.fixNumber(item.sentiment || 0));
                }
            }
        },
        getGraphs() {
            let params = {};
            params.word = this.router_params.symbol;
            params.size = 15;
            this.loading.graphs = 'loading';
            this.$fetch({
                name: 'getGraphs',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.graphs = 'loaded';
                    if (!res.graphs.length) {
                        this.loading.graphs = 'empty';
                    }
                    this.graphs = res.graphs;
                } else {
                    this.loading.graphs = 'loaded';
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.graphs = 'loaded';
                console.log(e.message)
            });
        },
        getWeekTotal(num1, num2) {
            num1 = num1 || 0;
            num2 = num2 || 0;
            if (!num2) {
                return 0;
            }
            let result = num1 - num2;
            if (result) {
                result > 0 ? result = `+${result}` : result;
            } else {
                result = 0;
            }
            return result;
        },
    },
    computed: {
        nodemap_url() {
            let uri = `${Bizhihui_Url}/nodemap?word=${this.router_params.symbol}&fullscreen=1&device=app&app_fullscreen=1&_locale=${this.$locale()}&_country=${PUBLISH_COUNTRY}`;

            return uri;
        },
        hideModule() {
            return this.$storage.getSync('hideModule')
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    font-family: iconfont2;
}

.coin_analyse_box {
    width: 750px;
    background-color: #fff;
}

.cell_item {}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
    background-color: @bgf4f5f6;
}

.item_title_left {
    flex-direction: row;
    flex: 1;
}

.item_title_right {
    flex: 1;
}

.title_intro {
    text-align: right;
    color: #B0B2B8;
    font-size: 20px;
}

.title_line {
    width: 6px;
    height: 26px;
    background-color: #434343;
}

.title_text {
    margin-left: 15px;
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.icon_mark {
    position: relative;
    top: -1px;
    font-size: 30px;
    color: #7B7B7B;
}

.item_info_table {
    flex-direction: row;
    border-top-width: 1px;
    border-color: #E7EAF1;
}

.info_table_hd {
    flex: 1;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.info_table_bd {
    flex: 1;
}

.table_item {
    padding-left: @padding_size;
    padding-right: @padding_size;
    height: 70px;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
    align-items: center;
}

.table_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 2;
}

.table_text_tags {
    flex-direction: row;
    justify-content: flex-end;
    flex: 4;
}

.text_tags {
    padding: 5px 15px;
    background-color: @main_color;
    color: #fff;
    font-size: 22px;
    border-radius: 20px;
    margin-left: 15px;
}

.table_text {
    color: #434343;
    font-size: 24px;
    text-align: right;
    flex: 1;
}

.logo_image_box {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-direction: row;
    justify-content: flex-end;
}

.logo_image {
    width: 40px;
    height: 40px;
}

.info_items {
    padding: @padding_size;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}

.links_box {
    flex-direction: row;
}

.links {
    margin-left: 25px;
    color: #4968D4;
    font-size: 24px;
    flex: 1;
}

.github_box {
    flex-direction: row;
}

.github_num {
    margin-left: 15px;
    color: #434343;
    font-size: 24px;
    flex: 1;
}

.item_info_map {
    position: relative;
}

.fullscreen_box {
    position: absolute;
    top: @padding_size;
    right: @padding_size;
    flex-direction: row;
}

.fullscreen_text {
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.icon_fullscreen {
    padding-right: 10px;
    color: #434343;
    font-size: 25px;
    font-weight: bold;
}

.line_hd {
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
}

.tabs {
    flex-direction: row;
    margin-left: 28px;
}

.social_tab {
    flex: 1;
    line-height: 60px;
    margin-right: 80px;
    text-align: center;
    color: #9C9EA5;
    font-size: 20px;
}

.social_tab:last-child {
    margin-right: 0;
}

.social_active {
    border-bottom-width: 3px;
    border-color: #00D4D6;
    color: #00D4D6;
}

.github_data_tips {
    padding-left: @padding_size;
    flex-direction: row;
}

.tips_text {
    line-height: 60px;
    color: #9C9EA5;
    font-size: 20px;
}

.yi_icon {
    width: 30px;
    line-height: 30px;
    color: white;
    height: 30px;
    font-size: 20px;
    text-align: center;
    background-color: #497ddb;
    border-radius: 50%;
}

.yi_text {
    color: #497ddb;
    font-size: 28px;
    margin-left: 10px;
}

</style>
