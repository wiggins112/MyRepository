<template>
    <div class="fast_article_box">
        <div class="box_hd" @click="showall">
                <text :class="['time', article.important && 'important_color']">{{article_time}}</text>
                <text :class="['title', article.important && 'important_color']" :value="` `" v-if="!article.title"></text>
                <text :class="['title', article.important && 'important_color']"  :value="article.title" v-if="article.title"></text>
                <text :class="['box_text', article.important && 'important_color']" :style="{lines:(isalltext ? 0 : 3)}">{{article.text}}</text>
        </div>
        <div class="box_translate">
            <div class="trans_hd">
                <div class="hd_detail_box" @click="jumpArticleDetail" v-if="!article.no_detail">
                    <text class="hd_detail">{{ $t('详情') }}</text>
                </div>
                <div class="trans_hd_l" @click="handleTranslate" v-if="!filters.isChinese(article.text) && !hideModule['TransToEng']">
                    <text class="yi_icon">{{ $t('译') }}</text>
                    <text class="yi_text">{{show_trans?$t('收起'):$t('查看')}}{{ $t('翻译') }}</text>
                    <wxc-part-loading :show="loading.trans==='loading'"></wxc-part-loading>
                </div>
            </div>
            <div class="trans_bd" v-if="show_trans">
                <div class="less_end">
                    <text class="icon icon_trans">&#xe90f;</text>
                </div>
                <div class="trans_bd_text">
                    <text class="trans_hd_r">{{ $t('以下内容由') }}Baidu{{ $t('翻译') }}</text>
                     <div class="trans_cont">
                        <text class="title">{{ chine[0] }}</text>
                        <text class="intro">{{ chine[1] }}</text>
                    </div>
                </div>
            </div>
        </div>
        <div class="box_bd">
            <div class="info_box">
                <text class="info_com site">{{article.site}}</text>
                <div class="sentiment_box">
                    <ArticleSentiment from="fast" :article="article"></ArticleSentiment>
                </div>
                <div :class="['share_icon_box', shareName === 'fast' ? '' : 'handle']" @click="shareClick" v-if="!hideModule['Share']">
                    <text class="icon share" >&#xe90b;</text><text class="site" v-if="shareName === 'fast'">{{$t('分享赚BZH')}}</text>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import { API_BaseUrl } from '../config/config.js'
import ArticleSentiment from './ArticleSentiment.vue'
import { WxcPartLoading, WxcRichText, WxcSpecialRichText } from 'weex-ui'
import common from '../config/common';
export default {
    data() {
        return {
            filters,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            chine: [],
            show_trans: false,
            loading: {
                trans: 'init'
            },
            isalltext: false,
        }
    },
    props: {
        article: {
            type: Object,
            required: true,
        },
        type: {
            type: String,
            default: 'article'
        },
        shareName: {
            type: String,
            default: 'fast'
        }
    },
    created() {
        this.init();

    },
    methods: {
        init() {

        },
        jumpArticleDetail() {
            if (this.article.event_type === 'coin_event') {
                this.$router.open({
                    name: 'CoinDetail',
                    params: {
                        symbol: this.article.coin.symbol,
                        symbol_id: this.article.coin.id
                    }
                })
            } else {
                this.$router.open({
                    name: 'ArticleDetail',
                    params: { article_id: this.article.article_id || this.article._id }
                })
            }
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_news_more');

        },
        handleLike() {

        },
        handleTranslate() {
            if (this.show_trans) {
                this.show_trans = false;
            } else {
                let params = {};
                params.word = this.article.title + "★" + this.article.text;
                this.loading.trans = 'loading';
                return this.$fetch({
                    name: 'postEnglishToChinese',
                    method: 'POST',
                    data: params,
                }).then(resData => {
                    if (resData.error === 0) {
                        this.loading.trans = 'loaded';
                        this.chine[0] = resData.result.split("★")[0];
                        this.chine[1] = resData.result.split("★")[1];
                        this.show_trans = true;
                    } else {
                        this.loading.trans = 'error';
                        this.$notice.toast({ message: resData.message })
                    }
                }).catch((e) => {
                    this.loading.trans = 'error';
                    console.log(e.message);
                });
            }
        },
        showall() {
            this.isalltext = !this.isalltext;
        },
        shareClick() {
            let umengName = 'bzh_'+ this.shareName + '_news_share';
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(umengName);
            this.$emit('shareClick', this.article);
        },
    },
    components: {
        ArticleSentiment,
        WxcPartLoading,
        WxcRichText,
        WxcSpecialRichText,
    },
    computed: {
        has_detail() {
            if (this.article.event_type === 'xiaocong_event') {
                return false;
            } else {
                return true;
            }
        },
        article_time() {
            if (this.type === 'coin_article') {
                return this.filters.dateFormat(this.article.publish_time / 1000, 'MM-dd hh:mm');
            } else {
                return this.filters.dateFormat(this.article.publish_time / 1000, 'hh:mm');
            }
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
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.fast_article_box {
    padding-top: @padding_size;
    padding-left: @padding_size;
    padding-right: @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
}

.box_hd {}



.trans_cont {
    line-height: 50px;
}

.hide_more {
    lines: 4;
    text-overflow: ellipsis;
}

.show_more {
    lines: 0;
    text-overflow: auto;
    transition-property: height;
    transition-duration: 1.5s;
    transition-timing-function: linear;
}

.title {
    font-size: 32px;
    color: #434343;
    font-weight: bold;
    line-height: 50px;
    padding: 5px 0;
    word-break: break-all;
}

.intro {
    font-size: 30px;
    font-weight: normal;
    color: #434343;
    line-height: 50px;
}
.box_text {
    display: block;
    font-size: 28px;
    font-weight: normal;
    color: #434343;
    line-height: 45px;
    text-overflow: ellipsis;
}
.info_box {
    height: 90px;
    flex-direction: row;
    align-items: center;
}

.time {
    color: #fe353e;
    font-size: 24px;
    vertical-align: center;
}

.site {
    color: #9FA0A7;
    font-size: 26px;
    text-align: left;
    lines: 1;
    text-overflow: ellipsis;
    line-height: 50px;
}

.info_com {
    flex: 4;
    flex-direction: row;
    align-items: center;
}
.sentiment_box {
}
.share_icon_box {
    justify-content: flex-end;
    flex-direction: row;
    align-items: center;
    // height: 90px;
    // align-items: center;
}
.handle {
    flex: 1;
    flex-direction: row;
    justify-content: flex-end;
}

.like {
    text-align: right;
}

.share {
    padding-top: 0px;
    font-size: 35px;
    padding-left: 20px;
    padding-right: 5px;
    text-align: right;
}

.box_bd {
    border-radius: 4px;
}

.image {
    width: 220px;
    height: 140px;
    border-width: 1px;
    border-color: #eee;
}

.box_translate {
    padding-bottom: 15px;
}

.trans_hd {
    flex-direction: row;
    justify-content: space-between;
}

.hd_detail_box {
    padding-top: @padding_size;
    flex: 1;
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

.hd_detail {
    color: #35548d;
    font-size: 28px;
    padding-right: 50px;
}

.yi_text {
    color: #497ddb;
    font-size: 28px;
    margin-left: 10px;
}

.trans_hd_l {
    padding-top: @padding_size;
    flex-direction: row;
    align-items: center;
}

.trans_hd_r {
    font-size: 26px;
    color: #9b9da4;
    padding-bottom: 10px;
}

.trans_bd {}

.trans_bd_text {
    margin-top: -6px;
    font-size: 28px;
    line-height: 44px;
    padding: 16px;
    border-radius: 3px;
    background-color: @bgf4f5f6;
}

.icon_trans {
    color: #f3f6f9;
    margin-right: 50px;
}

.type-container {
    margin-bottom: 70px;
    margin-top: 20px;
}

.type-text {
    font-size: 28px;
}

.special-rich {
    margin-top: 14px;
}

.important_color {
    color: #f5593f;
}

</style>
