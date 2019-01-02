<template>
    <div class="container">
        <div v-if="!config_news.disable">
            <div class="less_row" v-if="$locale() === 'zh-CN'">
                <bui-tabbar class="less_flex" style="background-color: #fff;" :tabItems="tabTitles" @change="onItemChange" v-model="currentTabIndex" background="transparent" selectedBackground="transparent" :titleSize="32" :showSelectedLine="tabTitles.length > 1"></bui-tabbar>
                <text class="icon icon_search" @click="goSearchNews" v-if="!hideModule['SearchNews']">&#xe915;</text>
            </div>
            <wxc-minibar v-if="$locale() !== 'zh-CN'" :title="$t('资讯')" :useDefaultReturn="false" left-button="" leftWidth="100px" rightWidth="100px">
                <div class="middle" slot="middle">
                    <bui-tabbar style="width: 520px;" :itemStyle="{paddingRight: '25px', paddingLeft: '25px'}" :tabItems="tabTitles" @change="onItemChange" v-model="currentTabIndex" background="transparent" selectedBackground="transparent" :titleSize="32" :showSelectedLine="tabTitles.length > 1"></bui-tabbar>
                </div>
            </wxc-minibar>
            <slider class="slider" @change="onSliderChange" :index="currentTabIndex" infinite="false">
                <!-- 快讯 -->
                <div class="slider-item">
                    <div class="isfixed" v-if="article_list.fast_article.length">
                        <div class="time">
                            <text class="icon time_icon">&#xe90d;</text>
                            <text class="day time_day">{{ filters.dateFormat(article_list.fast_article[timetag_i].publish_time / 1000, 'yyyy-MM-dd') }}</text>
                            <text class="day time_week">{{ filters.dateFormat(article_list.fast_article[timetag_i].publish_time / 1000, 'w')}}</text>
                            <text class="day time_today"> {{ filters.getDateNow(article_list.fast_article[timetag_i].publish_time) }}</text>
                        </div>
                    </div>
                    <list class="home_box" ref="fast_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreFastArticleList" :style="{ height: (tabPageHeight) + 'px' }" @scroll="handleScroll">
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
                                <FastNewItem :article="article" @shareClick="shareClick" shareName="fast"></FastNewItem>
                                <BetFloat type="betview" v-if="(index+1)%5==0 && !hideModule['BetMy']" :tabberindex="(index-4)/5"></BetFloat>
                            </div>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.fast_article" ></loadmore>
                        </cell>
                        <cell class="tabbar_height"></cell>
                    </list>
                </div>
                <div class="slider-item" v-if="!this.hideModule['NewsSuperior']">
                    <list class="home_box" ref="superior_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreSuperiorArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                        <Refresher @refresh="refreshSuperiorArticleList" @refreshEnd="refreshEnd" :loading="loading.superior_article"></Refresher>
                        <cell v-for="(article, index) in article_list.superior_article" :key="index">
                            <ArticleItem :article="article"></ArticleItem>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.superior_article" ></loadmore>
                        </cell>
                        <cell class="tabbar_height"></cell>
                    </list>
                </div>
                <!-- 最新tab3 -->
                <!-- <div class="slider-item" v-if="!this.hideModule['NewsNew']">
                    <list class="home_box" ref="new_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreNewArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                        <Refresher @refresh="refreshNewArticleList" @refreshEnd="refreshEnd" :loading="loading.new_article"></Refresher>
                        <cell v-for="(article, index) in article_list.new_article" :key="index" :index="index">
                            <ArticleItem :article="article" :type="'newest'"></ArticleItem>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.new_article" ></loadmore>
                        </cell>
                        <cell class="tabbar_height"></cell>
                    </list>
                </div> -->
                <!-- 研报tab3 替换了最新 -->
                <div class="slider-item" v-if="!this.hideModule['NewsResearch']">
                    <list class="home_box" ref="research_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreArticleDeepList" :style="{ height: (tabPageHeight) + 'px' }">
                        <Refresher @refresh="refreshArticleDeepList" @refreshEnd="refreshEnd" :loading="loading.research_article"></Refresher>
                        <cell v-for="(article, index) in article_list.research_article" :key="index" :index="index">
                            <ArticleItem :article="article" :type="'newest'"></ArticleItem>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.research_article" ></loadmore>
                        </cell>
                        <cell class="tabbar_height"></cell>
                    </list>
                </div>
                <!-- 印尼版的文章 tab2 -->
                <div class="slider-item" v-if="this.$locale() !== 'zh-CN'">
                    <list class="home_box" ref="hot_article" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="550" @loadmore="loadmoreHotArticleList" :style="{ height: (tabPageHeight) + 'px' }">
                        <Refresher @refresh="refreshHotArticleList" @refreshEnd="refreshEnd" :loading="loading.hot_article"></Refresher>
                        <cell v-for="(article, index) in article_list.hot_article" :key="index" :index="index">
                            <ArticleItem :article="article" :type="'newest'"></ArticleItem>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.hot_article" ></loadmore>
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
                    <list class="home_box" ref="notice_article" :show-scrollbar="true" offset-accuracy="50" loadmoreoffset="550" @loadmore="loadmoreNoticeArticleList" :style="{ height: (tabPageHeight) + 'px' }" @scroll="handleScrollNotice">
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
                                <FastNewItem :article="article" @shareClick="shareClick" shareName="notice"></FastNewItem>
                            </div>
                        </cell>
                        <cell>
                            <loadmore :loading="loading.notice_article"  ></loadmore>
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
                            <loadmore :loading="loading.weibo_article" ></loadmore>
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
                            <loadmore :loading="loading.primer_article" ></loadmore>
                        </cell>
                        <cell class="tabbar_height"></cell>
                    </list>
                </div>
            </slider>
            <ArticleCapture :article="share_article" @getBash64Data="getBash64Data" v-if="show_capture" />
            <ShareComponents :showShare="show_capture" :pageName="'bzh_'+ tabTitles[currentTabIndex].type + '_news_share'"  :shareConfigs="shareConfigs" @closeShare="closeShare" @ShareCallback="ShareCallback"/>
        </div>
        <div class="show_url" v-if="config_news.disable">
            <wxc-minibar :title="config_news.title" :useDefaultReturn="false">
                <div slot="left" @wxcMinibarLeftButtonClicked="wxcMinibarLeftButtonClicked"></div>
            </wxc-minibar>
            <web :src="config_news.data" :style="{ height: (tabPageHeight) + 'px' }" />
        </div>
    </div>
</template>
<script>
import BannerSlider from '../components/BannerSlider.vue'
import ArticleItem from '../components/ArticleItem.vue'
import FastNewItem from '../components/FastNewItem.vue'
import WeiboItem from '../components/WeiboItem.vue'
import Refresher from '../components/Refresher.vue'
import Loadmore from '../components/Loadmore.vue'
import BuiTabbar from '../components/BuiTabbar.vue'
import { Utils } from 'weex-ui'
import filters from '../config/filters.js'
import BetFloat from '../components/BetFloat.vue'
import common from '../config/common'
import WxcMinibar from '../components/WxcMinibar.vue'
import ArticleCapture from '../components/ArticleCapture.vue'
import ShareComponents from '../components/ShareComponents.vue'
import { API_BaseUrl } from '../config/config.js'
export default {
    components: { BuiTabbar, BannerSlider, ArticleItem, FastNewItem, WeiboItem, Refresher, Loadmore, BetFloat, WxcMinibar, ArticleCapture, ShareComponents },
    data() {
        return {
            filters,
            arr: [],
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
                research_article: 'loading',
                hot_article: 'loading',
            },
            article_list: {
                superior_article: [],
                new_article: [],
                fast_article: [],
                primer_article: [],
                notice_article: [],
                weibo_article: [],
                research_article: [],
                hot_article: [],
            },
            page: {
                superior_article: 1,
                new_article: 1,
                fast_article: 1,
                primer_article: 1,
                notice_article: 1,
                weibo_article: 1,
                research_article: 1,
                hot_article: 1,
            },
            size: {
                superior_article: 15,
                new_article: 15,
                fast_article: 15,
                primer_article: 15,
                notice_article: 15,
                weibo_article: 15,
                research_article: 15,
                hot_article: 15,
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
            show_search: false,
            share_article: {},
            show_capture: false,
            base64Data: {},
            tabStyles: {
                height: 90,
                background: 'transparent',
                selectedBackground: 'transparent',
                titleSize: 34,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#F7B237',
            },
            user_info: {},
        }
    },
    props: {
        tabbarActive: {
            type: Boolean,
            default: false
        },
        newsActiveNavTab: {
            type: Number,
            default: 0
        },
    },
    watch: {
        'tabbarActive': {
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
    mounted() {
        
    },
    methods: {
        init() {
            this.currentTabIndex = this.newsActiveNavTab || this.currentTabIndex || 0;
            this.currentTab = this.tabTitles[this.currentTabIndex];
            this.initTabPage();
            this.getArticleData();
            this.getConfig();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.currentTab.event_type);
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        initTabPage() {
            this.tabPageHeight = Utils.env.getPageHeight();
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
        getConfig() {
            let params = {};
            params.type = 'app_config';
            params.key = 'app_func_switch';
            this.$fetch({
                name: 'getConfig',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    resData.result = resData.result || {};
                    this.config_news = resData.result.news || {};
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        onItemChange(index) {

        },
        onSliderChange(e) {
            var index = e.index;
            this.currentTab = this.tabTitles[e.index];
            this.currentTabIndex = index;
            this.getArticleData();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.currentTab.event_type);
        },
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
        // 最新tab3   上拉加载更多
        loadmoreNewArticleList() { 
            if (this.loading.new_article !== 'loaded') {
                return;
            }
            this.page.new_article++;
                this.getNewArticleList();//获取最新的文章的请求
        },
        // 最新tab3   下拉刷新
        refreshNewArticleList() {
            this.page.new_article = 1;
                this.getNewArticleList();//获取最新的文章的请求
           
            this.$refs.new_article.resetLoadmore();
        },
        // 研报tab3   上拉加载更多
        loadmoreArticleDeepList() { 
            if (this.loading.research_article !== 'loaded') {
                return;
            }
            this.page.research_article++;
                this.getArticleDeep();//获取研报文章的请求
           
        },
        // 研报tab3   下拉刷新
        refreshArticleDeepList() {
            this.page.research_article = 1;
                this.getArticleDeep();//获取研报文章的请求
            this.$refs.research_article.resetLoadmore();
        },
        // 印尼版文章tab2   上拉加载更多
        loadmoreHotArticleList() { 
            if (this.loading.hot_article !== 'loaded') {
                return;
            }
            this.page.hot_article++;
            this.getHotArticleList(); // 印尼版的时候显示文章
        },
        // 印尼版文章tab2   下拉刷新
        refreshHotArticleList() {
            this.page.hot_article = 1;
            this.getHotArticleList();// 印尼版的时候显示文章
            this.$refs.hot_article.resetLoadmore();
        },
        loadmoreFastArticleList() {
            if (this.loading.fast_article !== 'loaded') {
                return;
            }
            this.page.fast_article++;
            if (this.$locale() === 'zh-CN') {
                this.getFastArticleList();
            } else {
                this.getDailyArticleList();
            }
        },
        refreshFastArticleList() {
            this.page.fast_article = 1;
            this.month_days = [];
            this.timetag_i = 0;
            if (this.$locale() === 'zh-CN') {
                this.getFastArticleList();
            } else {
                this.getDailyArticleList();
            }
            this.$refs.fast_article.resetLoadmore();
        },
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
        loadmoreNoticeArticleList() {
            if (this.loading.notice_article !== 'loaded') {
                return;
            }
            this.page.notice_article++;
            this.getNoticeArticleList();
        },
        refreshNoticeArticleList() {
            this.page.notice_article = 1;
            this.month_days = [];
            this.noticetag_i = 0;
            this.getNoticeArticleList();
            this.$refs.notice_article.resetLoadmore();
        },
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

        jumpErosDemo() {
            this.$router.open({
                name: 'demo'
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
                    this.getNewArticleList();//获取最新的文章的请求
                }
            }
            if (this.currentTab.type === 'research') {
                if (!this.article_list.research_article.length) {
                    this.getArticleDeep();//获取研报文章的请求
                }
            }
            if (this.currentTab.type === 'fast') {
                if (!this.article_list.fast_article.length) {
                    if (this.$locale() === 'zh-CN') {
                        this.getFastArticleList();
                    } else {
                        this.getDailyArticleList();
                    }
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
            if (this.currentTab.type === 'hot') {
                if (!this.article_list.hot_article.length) {
                   this.getHotArticleList();
                }
            }
        },
        refreshEnd() {

        },
        getSuperiorArticleList() {
            let params = {};
            params.type = 'hot';
            params.quality = 'superior';
            params.page = this.page.superior_article || 1;
            params.size = this.size.superior_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.superior_article[0].download_time;
            }
            this.loading.superior_article = 'loading';
            this.$fetch({
                name: 'getArticleList',
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
                console.log(e.message)
            });
        },
        // 得到最新文章tab3
        getNewArticleList() {
            let params = {};
            params.type = 'hot';
            params.quality = '';
            params.page = this.page.new_article || 1;
            params.size = this.size.new_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.new_article[0].download_time;
            }
            this.loading.new_article = 'loading';
            this.$fetch({
                name: 'getArticleList',
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
                console.log(e.message)
            });
        },
        // 研报tab3 得到研报请求
        getArticleDeep() {
            let params = {};
            params.page = this.page.research_article || 1;
            params.size = this.size.research_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.research_article[0].download_time;
            }
            this.loading.research_article = 'loading';
            this.$fetch({
                name: 'getArticleDeep',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.research_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.research_article = 'nomore';
                        }
                        this.article_list.research_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.research_article = 'empty';
                        }
                        this.article_list.research_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.research_article = 'error';
                console.log(e.message)
            });
        },
        getHotArticleList() {
            let params = {};
            params.category = 'hot';
            params.page = this.page.hot_article || 1;
            params.size = this.size.hot_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.hot_article[0].download_time;
            }
            this.loading.hot_article = 'loading';
            this.$fetch({
                name: 'getMessagesInd',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.hot_article = 'loaded';
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.hot_article = 'nomore';
                        }
                        this.article_list.hot_article.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.hot_article = 'empty';
                        }
                        this.article_list.hot_article = resData.items;
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.hot_article = 'error';
                console.log(e.message)
            });
        },
        getPrimerArticleList() {
            let params = {};
            params.type = 'hot';
            params.quality = 'primer';
            params.page = this.page.primer_article || 1;
            params.size = this.size.primer_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.primer_article[0].download_time;
            }
            this.loading.primer_article = 'loading';
            this.$fetch({
                name: 'getArticleList',
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
                console.log(e.message)
            });
        },
        //得到快讯的列表信息
        getFastArticleList() {
            let params = {};
            params.type = 'hot';
            params.quality = 'superior';
            params.page = this.page.fast_article || 1;
            params.size = this.size.fast_article || 15;
            params.event_type = 'fast_event';
            if (params.page > 1) {
                params.ts = this.article_list.fast_article[0].created_at;
            };
            this.loading.fast_article = 'loading';
            this.$fetch({
                name: 'getMessages',
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
                console.log(e.message)
            });
        },
        //得到印尼版的资讯
        getDailyArticleList() {
            let params = {};
            params.category = 'daily';
            params.page = this.page.fast_article || 1;
            params.size = this.size.fast_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.fast_article[0].download_time;
            }
            this.loading.fast_article = 'loading';
            this.$fetch({
                name: 'getMessagesInd',
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
                console.log(e.message)
            });
        },
        getWeiboArticleList() {
            let params = {};
            params.page = this.page.weibo_article || 1;
            params.size = this.size.weibo_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.weibo_article[0].created_at;
            };
            this.loading.weibo_article = 'loading';
            this.$fetch({
                name: 'getArticleWeibo',
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
                console.log(e.message)
            });
        },
        getNoticeArticleList() {
            let params = {};
            params.event_type = 'notice_event';
            params.page = this.page.notice_article || 1;
            params.size = this.size.notice_article || 15;
            if (params.page > 1) {
                params.ts = this.article_list.notice_article[0].created_at;
            };
            this.loading.notice_article = 'loading';
            this.$fetch({
                name: 'getMessages',
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
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                this.loading.notice_article = 'error';
                console.log(e.message)
            });
        },
        isShowTimeTag(article) {
            let month_day = filters.dateFormat(article.publish_time / 1000, 'yyyy-MM-dd');
            let exists = !!this.month_days.find(m_d => m_d === month_day);
            if (!exists) {
                this.month_days.push(month_day);
            }
            return !exists;
        },
        handleScroll(e) { //快讯
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
        onappear(char) { //快讯 的滑动时间变化
            if (this.tophidden !== "up") {
                if (this.timetag_i == 0) {
                    this.timetag_i = 0;
                } else {
                    this.timetag_i = char - 1;
                }
            }
        },
        ondisappear(char) { //快讯
            if (this.tophidden == "up") {
                this.timetag_i = char;
            }
        },
        handleScrollNotice(e) { //公告
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
        onappearNotice(char) { //公告 的滑动时间变化
            if (this.noticetophidden == "up") {} else {
                if (this.noticetag_i == 0) {
                    this.noticetag_i = 0;
                } else {
                    this.noticetag_i = char - 1;
                }
            }
        },
        ondisappearNotice(char) { //公告
            if (this.noticetophidden == "up") {
                this.noticetag_i = char;
            } else {}
        },
        goSearchNews() {
            this.$router.open({
                name: 'SearchNews',
                params: {}
            })
        },
    },
    computed: {
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
        tabTitles() {
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
                type: 'research',
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
            // 印尼版文章tab2 
            if (this.$locale() !== 'zh-CN') arr.push({
                title: this.$t('最新'),
                type: 'hot',
                event_type: 'bzh_news_notice',
            })
            return arr
        },
        hideModule() {
            return this.$storage.getSync('hideModule')
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {
    width: 750px;
}

.isfixed {
    height: 75px;
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



// 搜索的样式
.icon_search {
    width: 90px;
    height: 96px;
    line-height: 96px;
    font-size: 45px;
    padding-left: 20px;
    font-weight: normal;
    color: #434343;
    background-color: #fff;
    border-bottom-color: #ddd;
    border-bottom-width: 1px;
}

.icon_search_en {
    font-size: 45px;
}

</style>
