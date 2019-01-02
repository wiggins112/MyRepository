<template>
    <div class="weibo_box">
        <div class="head">
            <div class="headimgurl">
                <image class="headimgurl" resize="cover" :src="article.headimgurl"></image>
            </div>
            <div class="weibo_name">
                <div class="name_box">
                    <text class="name">{{ article.nickname }}</text>
                    <text class="tag" v-if="article.is_official">{{ $t('官方') }}</text>
                </div>
                <text class="time">{{filters.getFormatTime(article.publish_time/1000)}}</text>
            </div>
        </div>
        <div class="body">
            <div class="content">
                <text class="text" @click="openWeibo()">{{article.comment_txt}}</text>
            </div>
            <div class="img_box" v-if="article.imgs && article.imgs.length">
                <image class="image" resize="cover" v-for="(item, index) in article.imgs" :src="item" @click="previewImg(index)"></image>
            </div>
        </div>
        <div class="foot">
            <text class="forward">{{ $t('转发数') }}（{{ article.forward }}）</text>
            <text class="comment">{{ $t('评论数') }}（{{ article.comment }}）</text>
        </div>
    </div>
</template>
<script>
import filters from '../config/filters.js'
export default {
    data() {
        return {
            filters,
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
        tag: {
            type: Boolean,
            default: false
        }
    },
    created() {

    },
    methods: {
        openWeibo () {
            this.$router.openBrowser(this.article.detail_url)
        },
        previewImg(index) {
            this.$image.preview({
                index: index, // 所点击图片下标
                images: this.article.images, // 图片的网络地址
            })
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.weibo_box {
    padding-top: @padding_size;
    padding-bottom: @padding_size;
    padding-left: @padding_size;
    padding-right: @padding_size;
    background-color: #fff;
    margin-bottom: 25px;
    border-bottom-width: 1px;
    border-color: #eee;
}
.name_box {
    flex-direction: row;
    align-items: center;
}
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.head {
    flex-direction: row;
}

.headimgurl {
    width: 60px;
    height: 60px;
    overflow: hidden;
    border-radius: 50%;
}

.weibo_name {
    padding-left: 20px;
}

.name {
    font-weight: bold;
}

.time {
    color: #848EA5;
    font-size: 24px;
    margin-top: 6px;
}

.tag {
    border-width: 1px;
    border-style: solid;
    border-color: #f7b237;
    font-size: 22px;
    color: #f7b237;
    padding: 2px 9px;
    border-radius: 15px;
    margin-left: 20px;
    font-weight: bold;
}

.body {
    padding-top: 20px;
    padding-bottom: 20px;
}

.text {
    color: #666;
    font-size: 30px;
    line-height: 50px;
}

.foot {
    flex-direction: row;
    justify-content: flex-end;
}

.forward {
    color: #9f9f9f;
    font-size: 22px;
}

.comment {
    color: #9f9f9f;
    font-size: 22px;
}

.img_box {
    margin-top: 10px;
    width: 750px;
    flex-direction: row;
    flex-wrap: wrap;
}

.image {
    margin-right: 5px;
    margin-bottom: 10px;
    width: 170px;
    height: 170px;
}

</style>
