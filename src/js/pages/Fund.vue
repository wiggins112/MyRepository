<template>
    <div>
        <web ref="webview" :src="url" class="html-web" :style="{top: sliderTop}" @pagefinish="onPageFinish"></web>
        <div class="header">
            <StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
            <wxc-minibar
                v-if="minibarShow"
                title="" 
                backgroundColor="transparent" 
                text-color="#fff"
                borderBottomWidth="0px"
            >
                <wxc-icon
                    slot="left"
                    name="back"
                    style="color: #fff;font-weight: bold;font-size: 60px;position: relative;left: -14px;"
                    @wxcIconClicked="minibarLeftClicked"></wxc-icon>
                <text
                    slot="right"
                    class="icon_list"
                    @click="shareButtonClick"></text>
            </wxc-minibar>
        </div>
        <msg-q-q umengEvent="bzh_fund_service"></msg-q-q>
        <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="closeShare"></ShareComponents>
    </div>
</template>

<script>
import StatusBar from '../components/StatusBar.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import ShareComponents from '../components/ShareComponents.vue'
import msgQQ from '../components/msgQQ.vue'
import { PUBLISH_COUNTRY, API_BaseUrl } from '../config/config.js'
import common from '../config/common.js'

import { WxcIcon } from 'weex-ui';
export default {
    name: '',
    components: {
        StatusBar,
        WxcMinibar,
        WxcIcon,
        ShareComponents,
        msgQQ
    },
    data () {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            pageTitle: '',
            routerParams: {},
            minibarShow: true,
            screenshotBase64: '',
            showShare: false,
            shareType: 'Url'
        }
    },
    computed: {
        language() {
            return this.$storage.getSync('language') || ''
        },
        url () {
            let str = ''
            if (this.routerParams._id) {
                // str = 'http://10.0.0.185:8080/?inApp=1'
                // str = 'bmlocal://assets/html/Fund/index.html?inApp=1'
                str = API_BaseUrl + '/static/fund/index.html?inApp=1'
                str += '&_id=' + this.routerParams._id
                if (PUBLISH_COUNTRY) str += '&_country=' + PUBLISH_COUNTRY
                if (this.language) str += '&_locale=' + this.language
            }
            return str
        },
        // web组件绝对定位 top
        sliderTop () {
            const barHeight = weex.config.eros.statusBarHeight || 40
            const i = this.minibarShow ? 1 : 0
            const t = +barHeight + 90* i
            return `${t}px`
        },
        shareConfigs() {
            let obj = {
                title: this.routerParams.title || ' ', // 分享的标题
                content: this.routerParams.description || ' ', // 分享的文字内容
                url: this.url.replace('inApp=1&', ''), // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
            }
            if (this.shareType === 'Image') obj = {
                title: this.routerParams.title || '', // 分享的标题
                content: '', // 分享的文字内容
                url: '', // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: this.screenshotBase64, // 'this.share_article.image', // 分享的图片url
                type: 'Image',
                imageInfo: {
                    width: 375
                },
                imageType: 'base64'
            }
            return obj
        },
    },
    watch: {
    },
    created () {
        this.getRouterParams()
        this.$event.on('hideMinibar', params => { this.minibarShow = false })
    },
    mounted () {
        this.eventListenr()
        this.umeng()
    },
    methods: {
        umeng () {
            common.addUmengClickEvent('bzh_fund_enter')
        },
        eventListenr () {
            this.$event.on('screenshot', base64 => {
                this.screenshotBase64 = base64
            })
            this.$event.on('share', type => {
                this.shareType = type
                this.$nextTick(() => {
                    this.shareButtonClick()
                })
            })
            // this.$event.on('pageHash', hash => {
            //     this.page = hash
            // })
        },
        async getRouterParams () {
            if (this.is_ios) {
                this.$notice.loading.show();
            }
            const res = await this.$router.getParams()
            this.routerParams = res
        },
        minibarLeftClicked() {
            // const webview = weex.requireModule('webview')
            // this.page === '#/'
            //     ? this.$router.back()
            //     : this.page = '#/'
            // this.$notice.toast({message: this.page})
            this.$router.back()
        },
        shareButtonClick(message) {
            // var webElement = this.$refs.webview
            // var webview = weex.requireModule('webview')
            // webview.postMessage(webElement, {screenshot: ''})
            // this.nextTick(() => {
                this.showShare = true
            // })
            // this.$notice.alert({message: this.screenshotBase64})
        },
        closeShare (e) {
            this.screenshotBase64 = ''
            this.showShare = false
        },
        onPageFinish() {
            this.$notice.loading.hide()
        },
    },
    filters: {
    }
}
</script>

<style scoped>
.header {
    position: fixed;
    top: 0;
    width: 750px;
    background-image: linear-gradient(to right, #f8ba4d, #f4d052);
}
.html-web {
    /* margin-top: -90px; */
    width: 750px;
    position: fixed;
    bottom: 0;
    left: 0;
}
</style>
