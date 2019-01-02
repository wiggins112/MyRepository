<template>
    <slider class="slider_box" :style="{width: imageWidth + span + 'px', height: imageHeight + 'px'}" auto-play="true" interval="5000" @change="onchange" infinite="true">
        <div class="banner_item" v-for="img in banner_list" :style="{width: imageWidth + 'px', height: imageHeight + 'px' }">
            <image class="image" :resize="imageResize" :src="img.image" :style="{width: imageWidth + 'px', height: imageHeight + 'px', borderRadius: imageRadius}" @click="openUrl(img)"></image>
            <text class="banner_text" v-if="img.text" :style="{color: img.textColor || '#fff', lines: img.lines || 2}" >{{ img.text }}</text>
        </div>
        <indicator class="indicator" :style="{width: imageWidth + 'px'}" v-if="showIndicator && banner_list.length >= 2"></indicator>
    </slider>
</template>
<style scoped>
.iconfont {
    font-family: iconfont;
}

.image {
    width: 750px;
    height: 280px;
}
.banner_text {
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: 26px;
    padding-left: 36px;
    padding-right: 36px;
    padding-top: 15px;
    padding-bottom: 10px;
    line-height: 40px;
    text-overflow: ellipsis;
}
.slider_box {
    position: relative;
    width: 750px;
    height: 280px;
}

.banner_item {
    width: 750px;
    height: 280px;
}

.indicator {
    width: 750px;
    height: 40px;
    item-color: rgba(255, 255, 255, 0.5);
    item-selected-color: #ffffff;
    item-size: 10px;
    position: absolute;
    bottom: 8px;
    right: 0px;
}

</style>
<script>
import common from '../config/common';
export default {
    props: {
        banner_list: {
            type: Array,
            required: true,
        },
        bannerItemStyle: {
            type: String,
            default: ''
        },
        showIndicator: {
            type: Boolean,
            default: true
        },
        imageResize: {
            type: String,
            default: 'cover'
        },
        imageWidth: {
            type: Number,
            default: 750
        },
        imageHeight: {
            type: Number,
            default: '280'
        },
        imageRadius: {
            type: String,
            default: '0'
        },
        span: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            user_info: {},
        }
    },
    create() {
        this.init();
    },
    methods: {
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        onchange(event) {
            this.$emit('onchange', event);
        },
        openUrl(banner) {
            this.getUserInfo();
            if (!banner.link) {
                return;
            }
            if (banner.type === 'app_page') {
                if (banner.who === "user" && !this.user_info.token) { //若是h5且没有登录的话  跳去登录页   
                    this.$router.open({
                        name: 'Login',
                    }) 
                } else {
                    this.$router.open({
                        name: banner.link,
                        type: 'PUSH',
                        params: banner.link_params || {},
                    })
                }
            } else if (banner.type === 'link' && banner.link_type === 'outlink') {
                this.$router.openBrowser(banner.link);
            } else {
                this.$router.toWebView({
                    url: banner.link, // 页面 url
                    title: this.$t('币智慧'), // 页面 title
                    navShow: true // 是否显示native端导航栏，默认是true
                })
            }
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(banner.event_name || 'bzh_choose_banner');
        },
    }
}

</script>
