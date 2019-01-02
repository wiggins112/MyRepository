<template>
    <div class="wrapper_article">
        <div class="header_box">
            <div class="header_tab" v-for="(tab, index) in tabsTitles" @click="onItemChange(index)" :key="index">
                <div class="tab_line" v-if="currentTabIndex === index"></div>
                <text class="tab_title" :style="{color: currentTabIndex === index ? tabStyles.selectedColor : tabStyles.normalColor}">{{tab.title}}</text>
            </div>
        </div>
        
        <slider class="slider" @change="onSliderChange" :index="currentTabIndex" infinite="false">
            <div class="slider-item" v-if="currentTab.type ===  'article'">
                <div>
                    <div v-for="(article, index) in article_list" :key="index">
                        <ArticleItem :article="article"></ArticleItem>
                    </div>
                    <loadmore :loading="loading.article_list" blankpagetype="icontext" :bigicon="false"></loadmore>
                </div>
            </div>
            <div class="slider-item" v-if="currentTab.type === 'notice'">
                <div>
                    <div v-for="(article, index) in notice_list" :key="index" :index="index">
                        <div class="fast_new_box">
                            <FastNewItem :article="article" type="coin_article" @shareClick="shareClick"></FastNewItem>
                            <ArticleCapture :article="share_article" @getBash64Data="getBash64Data" v-if="show_capture && share_article._id === article._id" />
                        </div>
                    </div>
                    <loadmore :loading="loading.notice_list" blankpagetype="icontext" :bigicon="false"></loadmore>
                </div>
            </div>
            <div class="slider-item" v-if="currentTab.type === 'twitter'">
                <div>
                    <div class="group">
                        <text v-for="tab in tabs" @click="toggleTab(tab)" :class="['tab_button', tab.active && 'active']" :key="tab.name">{{ tab.name }}</text>
                    </div>
                    <div class="office_box">
                        <div v-for="(article, index) in twitter_list" :key="index" :index="index">
                            <WeiboItem :article="article"></WeiboItem>
                        </div>
                        <loadmore :loading="loading.twitter_list" blankpagetype="icontext" :bigicon="false"></loadmore>
                    </div>
                </div>
            </div>
            <div class="slider-item" v-if="currentTab.type === 'weibo'">
                <div>
                    <div v-for="(article, index) in weibo_list" :key="index" :index="index">
                        <WeiboItem :article="article"></WeiboItem>
                    </div>
                    <loadmore :loading="loading.weibo_list" blankpagetype="icontext" :bigicon="false"></loadmore>
                </div>
            </div>
        </slider>
        <ShareComponents :showShare="show_capture" pos="top" :shareConfigs="shareConfigs" @closeShare="closeShare" />
    </div>
</template>
<script>
let _self;
import { buiTabbar } from 'bui-weex'
import { API_BaseUrl } from '../config/config.js'
import ArticleItem from '../components/ArticleItem.vue'
import WeiboItem from '../components/WeiboItem.vue'
import { Utils } from 'weex-ui'
import Refresher from '../components/Refresher.vue'
import FastNewItem from '../components/FastNewItem.vue'
import loadmore from '../components/loadmore.vue'
import ArticleCapture from '../components/ArticleCapture.vue'
import ShareComponents from '../components/ShareComponents.vue'
import common from '../config/common' 
export default {
    components: {
        buiTabbar,
        ArticleItem,
        WeiboItem,
        FastNewItem,
        loadmore,
        ArticleCapture,
        ShareComponents
    },
    data() {
        return {
            currentTabIndex: 0,
            currentTab: {},
            tabPageHeight: 1334,
            tabStyles: {
                height: 90,
                background: '#ffffff',
                selectedBackground: '#ffffff',
                titleSize: 34,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#fff',
            },
            tabs: [{
                name: this.$t('官方'),
                active: true
            }, {
                name: this.$t('讨论'),
                active: false
            }],
            type: '',
            article_list: [],
            article_list_page: 1,
            article_list_size: 30,
            notice_list: [],
            notice_list_page: 1,
            notice_list_size: 30,
            weibo_list: [],
            weibo_list_page: 1,
            weibo_list_size: 30,
            twitter_list: [],
            twitter_list_page: 1,
            twitter_list_size: 30,
            loading: {
                article_list: 'init',
                notice_list: 'init',
                weibo_list: 'init',
                twitter_list: 'init',
            },
            share_article: {},
            show_capture: false,
            base64Data: {},
        }
    },
    created() {
        _self = this;
        this.init();
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
        is_refresh: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                this.getLoadmoreArticle();
                this.$emit('Loadmoreing');
            },
            deep: true,
        },
        'is_refresh': {
            handler(newValue) {
                if (newValue) {
                    this.resetArticleParams();
                    this.getDatas();
                }
            },
            deep: true,
        },
        is_official() {
            this.twitter_list_page = 1;
            this.getArticleTwitter();
        }
    },
    methods: {
        init() {
            this.currentTab = this.tabsTitles[this.currentTabIndex];
            this.initTabPage();
            this.getRouterParams();
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
        getBash64Data(data) {
            this.base64Data = data;
        },
        getLoadmoreArticle() {
            if (this.currentTabIndex === 0) {
                if (this.loading.article_list !== 'loaded') {
                    return;
                }
                this.article_list_page++;
                this.getArticleRelevance();
            }
            if (this.currentTabIndex === 1) {

                if (this.loading.notice_list !== 'loaded') {
                    return;
                }
                this.notice_list_page++;
                this.getArticleNotice();
            }
            if (this.currentTabIndex === 2) {
                if (this.loading.twitter_list !== 'loaded') {
                    return;
                }
                this.twitter_list_page++;
                this.getArticleTwitter();
            }
            if (this.currentTabIndex === 3) {
                if (this.loading.weibo_list !== 'loaded') {
                    return;
                }
                this.weibo_list_page++;
                this.getArticleWeibo();
            }
        },
        restTab() {
            for (let tab of this.tabs) {
                tab.active = false;
            }
        },
        resetArticleParams() {
            this.article_list_page = 1;
            this.article_list_size = 30;
            this.notice_list = [];
            this.notice_list_page = 1;
            this.notice_list_size = 30;
            this.weibo_list = [];
            this.weibo_list_page = 1;
            this.weibo_list_size = 30;
            this.twitter_list = [];
            this.twitter_list_page = 1;
            this.twitter_list_size = 30;
        },
        toggleTab(tab) {
            this.restTab();
            tab.active = !tab.active;
            if (tab.active) {
                this.type = tab.name;
            }
        },
        loadmoreTwitterList() {
            if (this.loading.twitter_list !== 'loaded') {
                return;
            }
            this.twitter_list_page++;
            this.getArticleTwitter();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                console.log('coin—Article', resData);
                this.router_params = resData;
                this.getDatas();
            })
        },
        onItemChange(index) {
            this.currentTab = this.tabsTitles[index];
            this.currentTabIndex = index;
            this.getDatas();
        },
        onSliderChange(e) {
        },
        getDatas() {
            this.resetArticleParams();
            if (this.currentTab.type === 'article') {
                this.article_list = common.storageGetData("my_article_list_" + this.router_params.symbol_id) || [];//全部的缓存数据 
                if (!this.article_list.length) {
                    this.getArticleRelevance();
                }
            }
            if (this.currentTab.type === 'notice') {
                this.notice_list = common.storageGetData("my_notice_list_" + this.router_params.symbol_id) || [];
                if (!this.notice_list.length) {
                    this.getArticleNotice();
                }
            }
            if (this.currentTab.type === 'weibo') {
                this.weibo_list = common.storageGetData("my_weibo_list_" + this.router_params.symbol_id) || [];//全部的缓存数据 
                if (!this.weibo_list.length) {
                    this.getArticleWeibo();
                }
            }
            if (this.currentTab.type === 'twitter') {
                this.twitter_list = common.storageGetData("my_twitter_list_" + this.router_params.symbol_id) || [];
                if (!this.twitter_list.length) {
                    this.getArticleTwitter();
                }
            }
        },
        getArticleRelevance() {
            let params = {};
            params.symbol_id = this.router_params.symbol_id;
            params.word = this.router_params.symbol;
            params.page = this.article_list_page;
            params.size = this.article_list_size;
            if (params.page > 1) {
                params.ts = this.article_list[0].download_time;
            };
            this.loading.article_list = 'loading';
            this.$fetch({
                url: `${API_BaseUrl}/api/article/relevance`,
                method: 'GET',
                data: params,
            }).then(resData => {
                this.loading.article_list = 'loaded';
                if (params.page === 1) {
                    this.article_list = resData.items;
                    if (!resData.items.length) {
                        this.loading.article_list = 'empty';
                    }
                    common.storageSetData("my_article_list_" + this.router_params.symbol_id, this.article_list);//全部的缓存数据 

                } else {
                    if (!resData.items.length) {
                        this.loading.article_list = 'nomore';
                    } else {
                        this.article_list.push(...resData.items);
                    }
                }
            }).catch((e) => {
                this.loading.article_list = 'error';
                console.log(e.message)
            });
        },
        getArticleNotice() {
            let params = {};
            params.symbol_id = this.router_params.symbol_id;
            params.page = this.notice_list_page;
            params.size = this.notice_list_size;
            if (params.page > 1) {
                params.ts = this.notice_list[0].created_at;
            };
            this.loading.notice_list = 'loading';
            this.$fetch({
                name: 'getMessages',
                method: 'GET',
                data: params
            }).then(resData => {
                this.loading.notice_list = 'loaded';
                if (params.page === 1) {
                    this.notice_list = resData.items;
                    if (!resData.items.length) {
                        this.loading.notice_list = 'empty';
                    }
                    common.storageSetData("my_notice_list_" + this.router_params.symbol_id, this.notice_list);

                } else {
                    if (!resData.items.length) {
                        this.loading.notice_list = 'nomore';
                    } else {
                        this.notice_list.push(...resData.items);
                    }
                }
            }).catch((e) => {
                this.loading.notice_list = 'error';
                console.log(e.message)
            });
        },
        getArticleWeibo() {
            let params = {};
            params.event_word = this.router_params.symbol;
            params.page = this.weibo_list_page;
            params.size = this.weibo_list_size;
            if (params.page > 1) {
                params.ts = this.weibo_list[0].download_time;
            };
            this.loading.weibo_list = 'loading';
            this.$fetch({
                url: `${API_BaseUrl}/api/article/weibo`,
                method: 'GET',
                data: params
            }).then(resData => {
                this.loading.weibo_list = 'loaded';
                if (params.page === 1) {
                    this.weibo_list = resData.items;

                    if (!resData.items.length) {
                        this.loading.weibo_list = 'empty';
                    }
                    common.storageSetData("my_weibo_list_" + this.router_params.symbol_id, this.weibo_list);//全部的缓存数据 
                } else {
                    if (!resData.items.length) {
                        this.loading.weibo_list = 'nomore';
                    } else {
                        this.weibo_list.push(...resData.items);
                    }
                }
            }).catch((e) => {
                this.loading.weibo_list = 'error';
                console.log(e.message)
            });
        },
        getArticleTwitter() {
            let params = {};
            params.symbol_id = this.router_params.symbol_id;
            params.symbol = this.router_params.symbol;
            params.page = this.twitter_list_page;
            params.size = this.twitter_list_size;
            params.is_official = this.is_official;
            if (params.page > 1) {
                params.ts = this.twitter_list[0].download_time;
            };
            this.loading.twitter_list = 'loading';
            this.$fetch({
                name: 'getArticleTwitter',
                method: 'GET',
                data: params
            }).then(resData => {
                this.loading.twitter_list = 'loaded';
                if (params.page === 1) {
                    this.twitter_list = resData.items;
                    if (!resData.items.length) {
                        this.loading.twitter_list = 'empty';
                    }
                    common.storageSetData("my_twitter_list_" + this.router_params.symbol_id, this.twitter_list);//全部的缓存数据 

                } else {
                    if (!resData.items.length) {
                        this.loading.twitter_list = 'nomore';
                    } else {
                        this.twitter_list.push(...resData.items);
                    }
                }
            }).catch((e) => {
                this.loading.twitter_list = 'error';
                console.log(e.message)
            });
        },
    },
    computed: {
        is_official() {
            let tab = this.tabs.find(t => t.active);
            return tab.name === this.$t('官方');
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
        tabsTitles () {
            let arr = []
            if (!this.hideModule['CoinArticle']) arr.push({
                title: this.$t('要闻'),
                type: 'article',
                active: true
            })
            if (!this.hideModule['CoinNews']) arr.push({
                title: this.$t('快讯'),
                type: 'notice',
                active: false
            })
            arr.push({
                title: this.$t('推特'),
                type: 'twitter',
                active: false
            })
            if (!this.hideModule['CoinWeibo']) arr.push({
                title: this.$t('微博'),
                type: 'weibo',
                active: false
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
.wrapper_article {
    width: 750px;
}
.header_box {
    width: 750px;
    height: @header_tabbar_height;
    background-color: #ffffff;
    border-top-width: 1px;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}
.header_tab {
    position: relative;
    height: @header_tabbar_height;
    justify-content: center;
    width: 170px;
}

.tab_line {
    position: absolute;
    bottom: 0;
    margin:0 30px;
    width: 90px;
    height: 4px;
    background-color: #F7B237;
}

.tab_title {
    width: 150px;
    text-align: center;
    // font-weight: bold;
}

.tab_active {
    color: #F7B237;
}
.slider-item {
    width: 750px;
}
.group {
    flex-direction: row;
    padding: 20px 50px;
    border-top-color: rgba(0, 0, 0, .1);
    border-top-width: 1px;
    border-top-style: solid;
}

.article_box {
    padding-bottom: @tabbar_height;
}

.tab_button {
    min-width: 100px;
    height: 46px;
    padding-left: 12px;
    padding-right: 12px;
    font-size: 28px;
    text-align: center;
    line-height: 46px;
    color: #f7b237;
    margin-right: 30px;
}

.active {
    color: #fff;
    background-color: #f7b237;
    border-radius: 25px;
}

.slider {
    background-color: #fff;
}

</style>
