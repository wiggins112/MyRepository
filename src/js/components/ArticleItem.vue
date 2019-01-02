<template>
    <div class="article_box" @click.stop="jumpArticleDetail(article.article_id || article._id)">
        <div class="box_hd">
            <div class="title_box">
                <!-- <text class="badge" v-if="show_quality && article.quality && type==='newest'">{{filters.getQuality(article.quality)}}</text> -->
                <text class="title">{{article.title}}</text>
            </div>
            <div class="info_box">
                <div class="info_1">
                    <text class="time">{{filters.getFormatMoment(article.publish_time)}}</text>
                    <text class="main_site" v-if="article.site">{{article.site}}</text>
                    <text v-if="article.repeat_articles_length > 1" @click="showMoreSite" class="more">{{ $t('其它') }}{{ article.repeat_articles_length }}{{ $t('个相似资讯') }}</text>
                </div>
                <div class="info_2" v-if="expand">
                    <div class="other_site" v-for="(site,index) in article.repeat_articles" :key="index">
                        <text class="other_site_item" @click="jumpArticleDetail(site.link[0])">{{ site.site }}</text>
                    </div>
                </div>
            </div>
        </div>
        <div class="box_bd" v-if="article.image">
            <image class="image" resize="cover" :src="article.image"></image>
        </div>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import common from '../config/common';
export default {
    data() {
        return {
            filters,
            expand: false,
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
        show_quality: {
            type: Boolean,
            default: true
        },
    },
    created() {

    },
    methods: {
        jumpArticleDetail(article_id) {
            this.$router.open({
                name: 'ArticleDetail',
                params: { article_id }
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_news_more');
        },
        showMoreSite() {
            this.expand = !this.expand;
        },
    },
    computed: {
        
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 26px;
}

.article_box {
    padding-top: 30px;
    padding-bottom: 30px;
    padding-left: 25px;
    padding-right: 25px;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
    position: relative;
}

.box_hd {
    flex: 1;
}

.title_box {
    // flex-direction: row;
    // align-items: center;
    // align-items: flex-start;
    height: 90px;
}

.badge {
    margin-right: 10px;
    background-color: #304A9E;
    color: #fff;
    font-size: 22px;
    font-weight: normal;
    border-radius: 3px;
    padding: 2px 6px;
}

.title {
    font-size: 32px;
    color: #333;
    font-weight: 400;
    line-height: 50px;
    lines: 2;
    text-overflow: ellipsis;
}

.more {
    color: #9FA0A7;
    font-size: 26px;
}
.time {
    color: #9FA0A7;
    font-size: 26px;
    margin-right: 10px;
}
.other_site_item {
    margin-right: 10px;
    color: #9FA0A7;
    font-size: 26px;
    text-overflow: ellipsis;
}
.main_site {
    color: #9FA0A7;
    font-size: 26px;
    text-overflow: ellipsis;
}

.info_box {
    padding-top: 30px;
}

.info_1 {
    flex-direction: row;

}

.info_2 {
    flex-direction: row;
    flex-wrap: wrap;
}

.box_bd {
    margin-left: 15px;
    border-radius: 4px;
}

.image {
    width: 200px;
    height: 140px;
    border-width: 1px;
    border-color: #eee;
    border-radius: 4px;
}

.more {
    margin-left: 10px;
}

.other_site {
    flex-direction: row;
}

</style>
