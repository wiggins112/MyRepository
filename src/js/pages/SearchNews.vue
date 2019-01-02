<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <div class="wrapper">
            <div class="box_hd">
                <div class="box_hd_left">
                    <text class="icon icon_search">&#xe915;</text>
                    <input class="input" type="text" :autofocus="true" :placeholder="$t('搜索资讯、媒体、项目')" v-model="search" @return="onReturn" @change="onChange" @input="onInput" return-key-type="search"/>
                </div>
                <text class="cancel" @click="goBack">{{ $t('取消') }}</text>
            </div>
            <scroller v-if="!hasInput" class="box_bd" :style="{height: page_height }">
                <div v-if="searchHistory.length">
                    <div class="cont_hd less_between">
                        <text class="cont_title">{{ $t('历史浏览') }}</text>
                        <div class="less_row" @click="clearHistory">
                            <text class="icon icon_clear">&#xe91b;</text>
                            <text class="clear_text">{{ $t('清空') }}</text>
                        </div>
                    </div>
                    <div class="cont_bd">
                        <text class="cont_text" v-for="item in searchHistory" :key="item" @click="handleHistory(item)">{{filters.cutString(item , 30)}}</text>
                    </div>
                </div>
                <div>
                    <div class="cont_hd less_row">
                        <text class="cont_title">{{ $t('热门推荐') }}</text>
                        <text class="icon icon_hot">&#xe927;</text>
                    </div>
                    <div class="cont_bd">
                        <text class="cont_text" v-for="item in hot_arr" @click="handleHistory(item)">{{item}}</text>
                    </div>
                </div>
            </scroller>
            <div v-else>
                <bui-tabbar class="less_flex" style="background-color: #fff" :tabItems="tabTitles" v-model="currentTabIndex" background="transparent" selectedBackground="transparent" :titleSize="32" :showSelectedLine="tabTitles.length > 1"></bui-tabbar>
                <slider class="slider" @change="onSliderChange" :index="currentTabIndex" infinite="false">
                    <!-- 快讯 -->
                    <div class="slider-item">
                        <div class="isfixed" v-if="article_list.fast_article.length">
                            <div class="time">
                                <text class="icon time_icon">&#xe90d;</text>
                                <text class="day time_day">{{ filters.dateFormat(article_list.fast_article[timetag_i].publish_time / 1000, 'yyyy-MM-dd') }}</text>
                                <text class="day time_week">{{ filters.dateFormat(article_list.fast_article[timetag_i].publish_time / 1000, 'w') }}</text>
                                <text class="day time_today"> {{ filters.getDateNow(article_list.fast_article[timetag_i].publish_time) }}</text>
                            </div>
                        </div>
                        <list class="home_box" ref="fast_article" :show-scrollbar="true" offset-accuracy="50" loadmoreoffset="250" @loadmore="loadmoreFastArticleList" :style="{ height: (tabPageHeight) + 'px' }" @scroll="handleScroll">
                            <Refresher @refresh="refreshFastArticleList" @refreshEnd="refreshEnd" :loading="loading.fast_article"></Refresher>
                            <cell v-for="(article, index) in article_list.fast_article" :key="index" :index="index">
                                <div class="fast_new_box">
                                    <!-- 头部的 时间格式显示 -->
                                    <div class="time_tag" v-if="article.show_time_tag && index!=0" @appear="onappear(index)" @disappear="ondisappear(index)">
                                        <div class="time">
                                            <text class="icon time_icon">&#xe90d;</text>
                                            <text class="day time_day">{{ filters.dateFormat(article.publish_time / 1000, 'yyyy-MM-dd') }}</text>
                                            <text class="day time_week">{{ filters.dateFormat(article.publish_time / 1000, 'w') }}</text>
                                            <text class="day time_today"> {{ filters.getDateNow(article.publish_time) }}</text>
                                        </div>
                                    </div>
                                    <!-- 快讯 文章详情 -->
                                    <FastNewItem :article="article"  @shareClick="shareClick" shareName="fast"></FastNewItem>
                                </div>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.fast_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                    <div class="slider-item" v-if="!this.hideModule['NewsSuperior']">
                        <list class="home_box" ref="superior_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreSuperiorArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                            <Refresher @refresh="refreshSuperiorArticleList" @refreshEnd="refreshEnd" :loading="loading.superior_article"></Refresher>
                            <cell v-for="(article, index) in article_list.superior_article">
                                <ArticleItem :article="article"></ArticleItem>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.superior_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                    <!-- <div class="slider-item" v-if="!this.hideModule['NewsNew']">
                        <list class="home_box" ref="new_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreNewArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                            <Refresher @refresh="refreshNewArticleList" @refreshEnd="refreshEnd" :loading="loading.new_article"></Refresher>
                            <cell v-for="(article, index) in article_list.new_article" :key="index" :index="index">
                                <ArticleItem :article="article" :type="'newest'"></ArticleItem>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.new_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div> -->
                    <div class="slider-item" v-if="!this.hideModule['NewsResearch']">
                        <list class="home_box" ref="new_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreArticleDeepList" :style="{ height: (tabPageHeight) + 'px' }">
                            <Refresher @refresh="refreshArticleDeepList" @refreshEnd="refreshEnd" :loading="loading.new_article"></Refresher>
                            <cell v-for="(article, index) in article_list.new_article" :key="index" :index="index">
                                <ArticleItem :article="article" :type="'newest'"></ArticleItem>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.new_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                    <div class="slider-item" v-if="!this.hideModule['NewsNotice']">
                        <div class="isfixed" v-if="article_list.notice_article.length">
                            <div class="time">
                                <text class="icon time_icon">&#xe90d;</text>
                                <text class="day time_day">{{ filters.dateFormat(article_list.notice_article[noticetag_i].publish_time / 1000, 'yyyy-MM-dd') }}</text>
                                <text class="day time_week">{{ filters.dateFormat(article_list.notice_article[noticetag_i].publish_time / 1000, 'w') }}</text>
                                <text class="day time_today"> {{ filters.getDateNow(article_list.notice_article[noticetag_i].publish_time) }}</text>
                            </div>
                        </div>
                        <list class="home_box" ref="notice_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreNoticeArticleList" :style="{ height: (tabPageHeight) + 'px' }" @scroll="handleScrollNotice">
                            <Refresher @refresh="refreshNoticeArticleList" @refreshEnd="refreshEnd" :loading="loading.notice_article"></Refresher>
                            <cell v-for="(article, index) in article_list.notice_article" :key="index" :index="index">
                                <div class="fast_new_box">
                                    <div class="time_tag" v-if="article.show_time_tag && index!=0" @appear="onappearNotice(index)" @disappear="ondisappearNotice(index)">
                                        <div class="time">
                                            <text class="icon time_icon">&#xe90d;</text>
                                            <text class="day time_day">{{ filters.dateFormat(article.publish_time / 1000, 'yyyy-MM-dd') }}</text>
                                            <text class="day time_week">{{ filters.dateFormat(article.publish_time / 1000, 'w') }}</text>
                                            <text class="day time_today"> {{ filters.getDateNow(article.publish_time) }}</text>
                                        </div>
                                    </div>
                                    <FastNewItem :article="article" v-if="hackResetNotice" @shareClick="shareClick" shareName="notice"></FastNewItem>
                                </div>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.notice_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                    <div class="slider-item" v-if="!this.hideModule['NewsWeibo']">
                        <list class="home_box" ref="weibo_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreWeiboArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                            <Refresher @refresh="refreshWeiboArticleList" @refreshEnd="refreshEnd" :loading="loading.weibo_article"></Refresher>
                            <cell v-for="(article, index) in article_list.weibo_article" :key="index" :index="index">
                                <div class="fast_new_box">
                                    <WeiboItem :article="article"></WeiboItem>
                                </div>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.weibo_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                    <div class="slider-item" v-if="!this.hideModule['NewsPrimer']">
                        <list class="home_box" ref="primer_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmorePrimerArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                            <Refresher @refresh="refreshPrimerArticleList" @refreshEnd="refreshEnd" :loading="loading.primer_article"></Refresher>
                            <cell v-for="(article, index) in article_list.primer_article" :key="index" :index="index">
                                <ArticleItem :article="article"></ArticleItem>
                            </cell>
                            <cell>
                                <loadmore :loading="loading.primer_article" blankpagetype="icontext"></loadmore>
                            </cell>
                            <cell class="tabbar_height"></cell>
                        </list>
                    </div>
                </slider>
                <ArticleCapture :article="share_article" @getBash64Data="getBash64Data" v-if="show_capture" />
                <ShareComponents :showShare="show_capture" :shareConfigs="shareConfigs" @closeShare="closeShare" @ShareCallback="ShareCallback"/>
            </div>
        </div>
    </div>
</template>
<script>
import { Utils, } from 'weex-ui';
import StatusBar from '../components/StatusBar.vue'
import filters from '../config/filters.js'
import News from './News.vue'
import BuiTabbar from '../components/BuiTabbar.vue'
import ArticleItem from '../components/ArticleItem.vue'
import FastNewItem from '../components/FastNewItem.vue'
import WeiboItem from '../components/WeiboItem.vue'
import Refresher from '../components/Refresher.vue'
import Loadmore from '../components/Loadmore.vue'
import common from '../config/common'
import WxcMinibar from '../components/WxcMinibar.vue'
import ArticleCapture from '../components/ArticleCapture.vue'
import ShareComponents from '../components/ShareComponents.vue'
import { API_BaseUrl } from '../config/config.js'
export default {
    components: {
        StatusBar,
        News,
        BuiTabbar,
        ArticleItem,
        FastNewItem,
        WeiboItem,
        Refresher,
        Loadmore,
        WxcMinibar,
        ArticleCapture,
        ShareComponents
    },
    data() {
        return {
            filters,
            search: '',
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            hot_arr: [],
            hasInput: false,
            searchHistory: this.$storage.getSync('newsSearchHistory') || [],
            currentTabIndex: 0,
            currentTab: {},
            tabPageHeight: 1334,
            loading: {
                superior_article: 'loading',
                new_article: 'loading',
                fast_article: 'loading',
                primer_article: 'loading',
                notice_article: 'loading',
                weibo_article: 'loading',
            },
            article_list: {
                superior_article: [],
                new_article: [],
                fast_article: [],
                primer_article: [],
                notice_article: [],
                weibo_article: [],
            },
            page: {
                superior_article: 1,
                new_article: 1,
                fast_article: 1,
                primer_article: 1,
                notice_article: 1,
                weibo_article: 1,
            },
            size: {
                superior_article: 15,
                new_article: 15,
                fast_article: 15,
                primer_article: 15,
                notice_article: 15,
                weibo_article: 15,
            },
            month_days: [],
            timetag_i: 0,
            tophidden: 'up',
            scrollnum: 0,
            noticetag_i: 0,
            noticetophidden: 'up',
            noticescrollnum: 0,
            config_news: {
                disable: 0,
            },
            hackResetNotice: true,
            show_search: false,
            share_article: {},
            show_capture: false,
            base64Data: {},
            user_info: {},
        };
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getArticleSearchHots();//获得搜索的热词
            this.currentTab = this.tabTitles[this.currentTabIndex];
            this.tabPageHeight = Utils.env.getPageHeight();
            this.getArticleData();
        },
        getUserInfo() {
             this.user_info = this.$storage.getSync('user_info') || {};
         },
        shareClick(article) {
            this.show_capture = !this.show_capture;
            this.share_article = article;
        },
        closeShare() {
            this.base64Data = {};
            this.show_capture = false;
        },
        ShareCallback(res) {
             this.getUserInfo();
             this.show_capture = false;
             if (!this.user_info.is_login) {
                 return;
             }
             if(this.currentTab.type === 'fast') {
                 this.postArticleBehavior();
             }
         },
         postArticleBehavior() {
 			let params = {};
 			params.behavior = 'share_msg';
 			params.user_id = this.user_info._id;
 			params.article_id = this.share_article._id;
 			this.$fetch({
 				url: `${API_BaseUrl}/api/article/${params.article_id}/behavior`,
 				method: 'POST',
 				data: params
 			}).then(resData => {
 			}).catch((e) => {
 				console.log(e.message)
 			});
 		},
        getBash64Data(data) {
            this.base64Data = data;
        },
        clearHistory() {
            this.$storage.setSync('newsSearchHistory', [])
            this.searchHistory = this.$storage.getSync('newsSearchHistory')
        },
        handleHistory(value) { //点击历史数据 重新加载数据
            this.search = value;
            let history = {};
            history.value = value;
            this.onChange(history);
        },
        goBack() {
            this.$router.back({
                type: 'PUSH',
            });
        },
        onChange(e) { //点击回车 触发保存搜索事件 
            if (e.value) {
                this.onStorage(e.value)
                this.article_list = {
                    superior_article: [],
                    new_article: [],
                    fast_article: [],
                    primer_article: [],
                    notice_article: [],
                    weibo_article: [],
                };
                this.getArticleData();
                this.hasInput = true;
            }
        },
        onInput(e) {
            if (!e.value) {
                this.hasInput = false;
            }
        },
        onStorage(value) {
            this.searchHistory.unshift(value)
            this.searchHistory = [...new Set(this.searchHistory)]
            this.$nextTick(() => {
                this.$storage.setSync('newsSearchHistory', this.searchHistory)
                this.searchHistory = this.$storage.getSync('newsSearchHistory')
            })
        },
        getArticleData() {
            if (this.currentTab.type === 'superior') {
                if (!this.article_list.superior_article.length) {
                    this.getSuperiorArticleList();
                }
            }
            if (this.currentTab.type === 'new') {
                if (!this.article_list.new_article.length) {
                    this.getNewArticleList();
                }
            }
            if (this.currentTab.type === 'deep') {
                if (!this.article_list.new_article.length) {
                    this.getArticleDeepList();
                }
            }
            if (this.currentTab.type === 'fast') {
                if (!this.article_list.fast_article.length) {
                    this.getFastArticleList();
                }
            }
            if (this.currentTab.type === 'primer') {
                if (!this.article_list.primer_article.length) {
                    this.getPrimerArticleList();
                }
            }
            if (this.currentTab.type === 'notice') {
                if (!this.article_list.notice_article.length) {
                    this.getNoticeArticleList();
                }
            }
            if (this.currentTab.type === 'weibo') {
                if (!this.article_list.weibo_article.length) {
                    this.getWeiboArticleList();
                }
            }
        },
        onSliderChange(e) {
            this.currentTab = this.tabTitles[e.index];
            this.currentTabIndex = e.index;
            this.getArticleData();
        },
        // 加载和刷新Superior
        loadmoreSuperiorArticleList() {
            if (this.loading.superior_article !== 'loaded') {
                return;
            }
            this.page.superior_article++;
            this.getSuperiorArticleList();
        },
        refreshSuperiorArticleList() {
            this.page.superior_article = 1;
            this.getSuperiorArticleList();
            this.$refs.superior_article.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
        },
        getSuperiorArticleList() {
            let params = {};
            params.type = 'superior';
            params.keyword = this.search;
            params.page = this.page.superior_article || 1;
            params.size = this.size.superior_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.superior_article[0].download_time;
            }
            this.loading.superior_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.superior_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.superior_article = 'nomore';
                        }
                        this.article_list.superior_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.superior_article = 'empty';
                        }
                        this.article_list.superior_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.superior_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 new
        loadmoreNewArticleList() {
            if (this.loading.new_article !== 'loaded') {
                return;
            }
            this.page.new_article++;
            this.getNewArticleList();
        },
        refreshNewArticleList() {
            this.page.new_article = 1;
            this.getNewArticleList();
            this.$refs.new_article.resetLoadmore();
        },
        getNewArticleList() {
            let params = {};
            params.type = 'new';
            params.keyword = this.search;
            params.page = this.page.new_article || 1;
            params.size = this.size.new_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.new_article[0].download_time;
            }
            this.loading.new_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.new_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.new_article = 'nomore';
                        }
                        this.article_list.new_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.new_article = 'empty';
                        }
                        this.article_list.new_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.new_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 研报deep
        loadmoreArticleDeepList() {
            if (this.loading.new_article !== 'loaded') {
                return;
            }
            this.page.new_article++;
            this.getArticleDeepList();
        },
        refreshArticleDeepList() {
            this.page.new_article = 1;
            this.getArticleDeepList();
            this.$refs.new_article.resetLoadmore();
        },
        getArticleDeepList() {
            let params = {};
            params.type = 'deep';
            params.keyword = this.search;
            params.page = this.page.new_article || 1;
            params.size = this.size.new_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.new_article[0].download_time;
            }
            this.loading.new_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.new_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.new_article = 'nomore';
                        }
                        this.article_list.new_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.new_article = 'empty';
                        }
                        this.article_list.new_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.new_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 快讯
        loadmoreFastArticleList() {
            if (this.loading.fast_article !== 'loaded') {
                return;
            }
            this.page.fast_article++;
            this.getFastArticleList();
        },
        refreshFastArticleList() {
            this.page.fast_article = 1;
            this.month_days = [];
            this.timetag_i = 0;
            this.getFastArticleList();
            this.$refs.fast_article.resetLoadmore();

        },
        getFastArticleList() {
            let params = {};
            params.type = 'fast';
            params.keyword = this.search;
            params.page = this.page.fast_article || 1;
            params.size = 5;
            params.event_type = 'fast_event';
            if (params.page > 1) {
                params.ts = this.article_list.fast_article[0].created_at;
            };
            this.loading.fast_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.fast_article = 'loaded';
                    for (let item of resData.items) {
                        item.show_time_tag = this.isShowTimeTag(item);
                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.fast_article = 'nomore';
                        }
                        this.article_list.fast_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.fast_article = 'empty';
                        }
                        this.article_list.fast_article = resData.items;
                    
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.fast_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 primer
        loadmorePrimerArticleList() {
            if (this.loading.primer_article !== 'loaded') {
                return;
            }
            this.page.primer_article++;
            this.getPrimerArticleList();
        },
        refreshPrimerArticleList() {
            this.page.primer_article = 1;
            this.getPrimerArticleList();
            this.$refs.primer_article.resetLoadmore();
        },
        getPrimerArticleList() {
            let params = {};
            params.type = 'primer';
            params.keyword = this.search;
            params.page = this.page.primer_article || 1;
            params.size = this.size.primer_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.primer_article[0].download_time;
            }
            this.loading.primer_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.primer_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.primer_article = 'nomore';
                        }
                        this.article_list.primer_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.primer_article = 'empty';
                        }
                        this.article_list.primer_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.primer_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 公告
        loadmoreNoticeArticleList() {
            if (this.loading.notice_article !== 'loaded') {
                return;
            }
            this.page.notice_article++;
            this.getNoticeArticleList();
        },
        refreshNoticeArticleList() {
            this.page.notice_article = 1;
            this.getNoticeArticleList();
            this.$refs.notice_article.resetLoadmore();
        },
        getNoticeArticleList() {
            let params = {};
            params.type = 'notice';
            params.keyword = this.search;
            params.page = this.page.notice_article || 1;
            params.size = this.size.notice_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.notice_article[0].created_at;
            };
            this.loading.notice_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.notice_article = 'loaded';
                    for (let item of resData.items) {
                        item.show_time_tag = this.isShowTimeTag(item);
                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.notice_article = 'nomore';
                        }
                        this.article_list.notice_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.notice_article = 'empty';
                        }
                        this.article_list.notice_article = resData.items;
                        this.hackResetNotice = false;
                        this.$nextTick(() => {
                            this.hackResetNotice = true;
                        })
                    }
                    
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.notice_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        // 加载和刷新 微博
        loadmoreWeiboArticleList() {
            if (this.loading.weibo_article !== 'loaded') {
                return;
            }
            this.page.weibo_article++;
            this.getWeiboArticleList();
        },
        refreshWeiboArticleList() {
            this.page.weibo_article = 1;
            this.getWeiboArticleList();
            this.$refs.weibo_article.resetLoadmore();
        },
        getWeiboArticleList() {
            let params = {};
            params.type = 'weibo';
            params.keyword = this.search;
            params.page = this.page.weibo_article || 1;
            params.size = this.size.weibo_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.weibo_article[0].created_at;
            };
            this.loading.weibo_article = 'loading';
            this.$fetch({
                name: 'getArticleSearchAll',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.weibo_article = 'loaded';
                    for (let item of resData.items) {
                        item.show_time_tag = this.isShowTimeTag(item);
                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.weibo_article = 'nomore';
                        }
                        this.article_list.weibo_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.weibo_article = 'empty';
                        }
                        this.article_list.weibo_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.weibo_article = 'error';
                this.$notice.toast({ message: e })
            });
        },
        //判断是否显示头部固定的时间tab
        isShowTimeTag(article) {
            let month_day = filters.dateFormat(article.publish_time / 1000, 'yyyy-MM-dd');
            let exists = !!this.month_days.find(m_d => m_d === month_day);
            if (!exists) {
                this.month_days.push(month_day);
            }
            return !exists;
        },
        //快讯滑动事件
        handleScroll(e) {
            let contentOffset = e.contentOffset;
            let contentSize = e.contentSize;
            if (contentOffset.y < this.scrollnum) {
                this.tophidden = "up";
                this.scrollnum = contentOffset.y;
            } else {
                this.tophidden = "down";
                this.scrollnum = contentOffset.y;
            }
        },
        onappear(char) {
            if (this.tophidden == "up") {} else {
                if (this.timetag_i == 0) {
                    this.timetag_i = 0;
                } else {
                    this.timetag_i = char - 1;
                }
            }
        },
        ondisappear(char) {
            if (this.tophidden == "up") {
                this.timetag_i = char;
            } else {}
        },
        //公告滑动事件
        handleScrollNotice(e) {
            let contentOffset = e.contentOffset;
            let contentSize = e.contentSize;
            if (contentOffset.y < this.noticescrollnum) {
                this.noticetophidden = "up";
                this.noticescrollnum = contentOffset.y;
            } else {
                this.noticetophidden = "down";
                this.noticescrollnum = contentOffset.y;
            }
        },
        onappearNotice(char) {
            if (this.noticetophidden == "up") {} else {
                if (this.noticetag_i == 0) {
                    this.noticetag_i = 0;
                } else {
                    this.noticetag_i = char - 1;
                }
            }
        },
        ondisappearNotice(char) {
            if (this.noticetophidden == "up") {
                this.noticetag_i = char;
            } else {}
        },
        getArticleSearchHots() { // 得到搜索的热词
            let params = {};
            this.$fetch({
                name: 'getArticleSearchHots',
                method: 'GET',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.hot_arr=resData.items;
                }
            }).catch((e) => {
                this.$notice.toast({ message: e })
            });
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        shareConfigs() {
            return {
                title: `${this.share_article.title}`, // 分享的标题
                content: `${this.share_article.text}`, // 分享的文字内容
                url: ``, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接 http://i.test.bizhihui.vip  Token_Website
                image: `${this.base64Data.base64}`, // 分享的图片url,
                type: 'Image',
                imageInfo: this.base64Data.imageInfo || {},
                imageType: 'base64'
            }
        },
        tabTitles () {
            let arr = []
            arr.push({
                title: this.$t('快讯'),
                type: 'fast',
                event_type: 'bzh_news_quick',
            })
            if (!this.hideModule['NewsSuperior']) arr.push({
                title: this.$t('精选'),
                type: 'superior',
                event_type: 'bzh_news_chosen',
            })
            // if (!this.hideModule['NewsNew']) arr.push({
            //     title: this.$t('最新'),
            //     type: 'new',
            //     event_type: 'bzh_news_new',
            // })
            if (!this.hideModule['NewsResearch']) arr.push({
                title: this.$t('研报'),
                type: 'deep',
                event_type: 'bzh_news_research',
            })
            if (!this.hideModule['NewsNotice']) arr.push({
                title: this.$t('公告'),
                type: 'notice',
                event_type: 'bzh_news_notice',
            })
            if (!this.hideModule['NewsWeibo']) arr.push({
                title: this.$t('微博'),
                type: 'weibo',
                event_type: 'bzh_news_weibo',
            })
            if (!this.hideModule['NewsPrimer']) arr.push({
                title: this.$t('入门'),
                type: 'primer',
                event_type: 'bzh_news_teach',
            })
            return arr
        },
        hideModule () {
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

.container {
    background-color: #fff;
}

.wrapper {
    background-color: #fff;
}

.box_hd {
    padding: 16px @padding_size;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #e7eaf1;
}
.box_hd_left {
    flex-direction: row;
    border-radius: 10px;
    background-color: #eef1f6;
}
.input {
    width: 550px;
    height: 74px;
    font-size: 30px;
    placeholder-color: #9b9da4;
    color: #9b9da4;
    padding-left: 14px;

}

.icon_search {
    font-size: 40px;
    padding-left: 14px;
    color: #9b9da4;
    line-height: 74px;
}

.cancel {
    width: 100px;
    height: 74px;
    line-height: 74px;
    color: #434343;
    font-size: 34px;
    text-align: right;
}

.box_bd {
    padding: @padding_size;
}

.cont_title {
    font-size: 30px;
    color: #434343;
    font-weight: 500;
}

.clear_text {
    font-size: 30px;
    color: #434343;
}

.icon_clear {
    font-size: 32px;
    padding: 0 14px;
    font-weight: normal;
    color: #434343;
}

.icon_hot {
    font-size: 30px;
    padding: 0 14px;
    font-weight: normal;
    color: #f85e40;
}

.cont_text {
    height: 54px;
    line-height: 54px;
    border-radius: 5px;
    border-width: 2px;
    border-color: #fff3de;
    font-size: 30px;
    color: #d1a962;
    padding: 0 28px;
    margin: 20px 20px 0 0;
}

.cont_bd {
    padding-bottom: 85px;
    flex-direction: row;
    flex-wrap: wrap;
}


.isfixed {
    font-size: 28px;
    color: #8b919c;
    padding-top: 22px;
    padding-left: @padding_size;
    padding-bottom: 22px;
    background-color: @bgf4f5f6;
    border-width: 1px;
    border-color: #eee;
}

.home_box {
    position: relative;
    padding-bottom: @tabbar_height;
    width: 750px;
}

.content {
    position: relative;
    top: -70px;
}

.superior {
    top: -60px;
}

.border-cell {
    width: 750px;
    height: 24px;
    align-items: center;
    justify-content: center;
    border-bottom-width: 1px;
    border-style: solid;
    border-color: #eee;
}

.cell {
    background-color: #ffffff;
}

.icon {
    color: #333;
    font-family: iconfont2;
}

.time_tag {
    padding-top: 20px;
    padding-left: @padding_size;
    padding-bottom: 20px;
    background-color: @bgf4f5f6;
    border-width: 1px;
    border-color: #eee;
}

.time {
    flex-direction: row;
}

.time_icon {
    font-size: 24px;
    padding-right: 15px;
    color: #434343;
}

.day {
    font-size: 24px;
    padding-right: 15px;
    color: #434343;
}

text {
    display: inline;
}

.yi_text {
    color: #497ddb;
    font-size: 26px;
    margin-left: 10px;
}

</style>
