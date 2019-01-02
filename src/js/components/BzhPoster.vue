<template>
    <div class="poster_wrap">
        <div class="poster_box" :style="{backgroundColor: splash.bgcolor}" @click="jumpReceiveBzh" v-if="isBottomShow && is_show">
            <image class="poster_image" :src="splash.poster_image" @load="onImageLoad"></image>
            <div class="poster_content">
                <div class="content" :style="{height: page_height}">
                    <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
                    <div class="time_out">
                        <div class="time_empty"></div>
                        <div class="time_text" @click="jumpSkip">
                            <wxc-countdown tpl="{s}s" :timeBoxStyle="{backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '27px', color: '#fff'}" :dotTextStyle="{color: '#fff', fontSize: '27px', fontWeight: 'normal'}" :time="splash.countdown_time_ts" @wxcOnComplete="onCompletedTwo">
                            </wxc-countdown>
                            <text class="tips">{{ $t('跳过') }}</text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { WxcCountdown, Utils } from 'weex-ui';
import StatusBar from './StatusBar.vue'
export default {
    components: { WxcCountdown, StatusBar },
    data() {
        return {
            isBottomShow: true,
            show_countdown: true,
            is_show: false,
            statusBarStyle: {
                bgColor: 'transparent',
            },
            splash: {
                poster_image: `bmlocal://assets/images/poster/poster_bg1.jpg`,
                countdown_time_ts: new Date().getTime() + 500 * 10,
                bgcolor: '#21cbcc',
                link: '',
                link_params: {},
                type: '',
            },
            loading: {
                splash: 'loading'
            },
        }
    },
    props: {
        showPoster: {
            type: Boolean,
            default: true,
        },
        height: {
            type: String,
            default: '400'
        },
        shareConfigs: {
            type: Object,
            require: true,
        }
    },
    watch: {
        'showPoster': {
            handler() {
                this.isBottomShow = this.showPoster;
            },
            deep: true,
        },
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.isBottomShow = this.showPoster;
            this.getLocationSplash();
            this.getConfigSplash();
            
        },
        openBottomPopup() {
            this.isBottomShow = true;
        },
        wxcOverlayBodyClicked() {

        },
        //非状态组件，需要在这里关闭
        closePoster(e) {
            this.is_show = false;
            this.isBottomShow = false;
            this.$notice.loading.hide()
            this.$emit('closePoster', e)
        },
        jumpSkip() {
            this.closePoster();
        },
        onImageLoad(event) {
            if (!event.success) {
                this.closePoster();
            }
            this.$notice.loading.hide()
        },
        confirm() {
            this.closePoster();
            this.$emit('confirm', this.currt_selected)
        },
        onCompletedTwo() {
            this.closePoster();
        },
        jumpReceiveBzh() {
            if (!this.splash.link) {
                return;
            }
            this.closePoster();
            if (this.splash.type === 'app_page') {
                this.$router.open({
                    name: this.splash.link,
                    params: this.splash.link_params
                })
            } else if (this.splash.type === 'link' && this.splash.link_type === 'outlink') {
                this.$router.openBrowser(this.splash.link);
            } else {
                this.$router.toWebView({
                    url: this.splash.link, // 页面 url
                    title: '', // 页面 title
                    navShow: true // 是否显示native端导航栏，默认是true
                })
            }

        },
        getLocationSplash() {
            let splash_config = this.$storage.getSync('splash_config') || {};
            if (splash_config.poster_image) {
                this.is_show = true;
                splash_config.countdown_time_ts = new Date().getTime() + splash_config.countdown_time;
                this.splash = splash_config;
            } else {
                this.is_show = false;
                this.closePoster();
            }
        },
        getConfigSplash() {
            let params = {};
            this.loading.splash = 'loading';
            this.$fetch({
                name: 'getConfigSplash',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.splash = 'loaded';
                    this.$storage.setSync('splash_config', resData.result);
                } else {
                    this.loading.splash = 'error';
                    console.log(resData)
                }
            }).catch((e) => {
                this.loading.splash = 'error';
                console.log(e)
            });
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        has_location() {
            let splash_config = this.$storage.getSync('splash_config') || {};
            return !!splash_config.poster_image;
        },
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

.poster_box {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
    background-color: #21cbcc;
}

.poster_content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
}

.poster_image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1334px;
    width: 750px;
}

.content {
    position: relative;
}

.btn_box {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.confirm {
    width: 602px;
    background-color: @main_color;
    border-radius: 90px;
}

.time_out {
    padding: @padding_size;
    flex-direction: row;
    justify-content: flex-end;
}

.time_text {
    width: 170px;
    height: 60px;
    line-height: 70px;
    text-align: center;
    border-radius: 50%;
    flex-direction: row;
    border-width: 1px;
    border-color: rgba(255, 255, 255, 0.3);
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
}

.tips {
    color: #fff;
    font-size: 27px;
}

</style>
