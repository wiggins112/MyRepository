<template>
    <div class="poster_wrap">
        <wxc-overlay v-if="isBottomShow" :show="true" duration="50" :hasAnimation="false" @wxcOverlayBodyClicking="wxcOverlayBodyClicking"></wxc-overlay>
        <div class="poster_content" v-if="isBottomShow">
            <StatusBar></StatusBar>
            <div class="lang_box">
                <div class="bzh_logo_box">
                    <image class="bzh_logo" ref="image" src="bmlocal://assets/images/splash_activitylogo.png" />
                </div>
                <div class="language">
                    <text class="text lang_tips">Please choose your language.</text>
                    <div class="select_box">
                        <div class="select_option" @click="toggleSeletedLang">
                            <text class="text option_text">{{current_option.full_name}}</text>
                            <text :class="['text', 'icon', 'icon_trigon', show_option_items && 'icon_active']">&#xe90f;</text>
                        </div>
                    </div>
                    <div class="btn_box">
                        <wxc-button class="confirm" text="ok" @wxcButtonClicked="confirmLangSplashActivity"></wxc-button>
                    </div>
                </div>
            </div>
            <div class="select_wrap" :style="{top: pos.y, left: pos.x}" v-if="show_option_items">
                <div class="trigon_box">
                    <text class="text icon icon_active icon_active_border">&#xe90f;</text>
                    <text class="text icon icon_active_none">&#xe90f;</text>
                </div>
                <scroller class="select_items">
                    <div :class="['select_item', language.length === index + 1 && 'none_border']" v-for="(item, index) in language" :key="index" @click="languageSeleted(item)">
                        <text :class="['text', 'option_text', item.active && 'option_text_active']">{{item.full_name }}</text>
                    </div>
                </scroller>
            </div>
            <text class="text icon icon_active icon_active_none" :style="{top: pos.y + 13, left: pos.x + 45, position: 'absolute'}" v-if="show_option_items">&#xe90f;</text>
        </div>
    </div>
</template>
<script>
import { wxcButton, WxcOverlay, Utils } from 'weex-ui';
import StatusBar from './StatusBar.vue'
import { language } from '../config/language.js'
export default {
    components: { wxcButton, WxcOverlay, StatusBar },
    data() {
        return {
            isBottomShow: false,
            language: language.language_list,
            show_option_items: false,
            current_option: {},
            pos: {
                x: 0,
                y: 0
            },
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.isBottomShow = !this.$storage.getSync('is_set_locale_language');
            this.current_option = this.language[0];
        },
        //非状态组件，需要在这里关闭
        confirmLangSplashActivity(e) {
            this.isBottomShow = false;
            this.$storage.setSync('is_set_locale_language', 'true');
            this.$storage.setSync('language', this.current_option.simple_name);
            this.$emit('closeLangSplashActivity', e);
            this.$router.refresh();
        },
        toggleSeletedLang(e) {
            this.pos.x = e.position.x;
            this.pos.y = e.position.y + 80;
            this.show_option_items = !this.show_option_items;
        },
        languageSeleted(item) {
            for (let lang of this.language) {
                lang.active = false;
            }
            item.active = !item.active;
            this.current_option = item;
            this.show_option_items = false;
        },
        wxcOverlayBodyClicking() {
            this.show_option_items = false;
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    font-family: iconfont2;
}

.poster_wrap {}

.poster_content {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
    background-color: #fff;
}

.bzh_logo_box {
    margin-top: 230px;
    justify-content: center;
    align-items: center;
}

.bzh_logo {
    width: 421px;
    height: 163px;
}

.language {
    margin-top: 300px;
    justify-content: center;
    align-items: center;
}

.lang_tips {
    padding-bottom: 25px;
    color: #bfbfbf;
    font-size: 24px;
}

.select_box {
    position: relative;
}

.select_option {
    padding: 23px @padding_size;
    width: 488px;
    flex-direction: row;
    border-width: 2px;
    border-color: @main_color;
    border-radius: 80px;
    align-items: center;
}

.option_text {
    flex: 1;
}

.icon_trigon {
    font-size: 20px;
    color: @main_color;
    transform: rotate(180deg);
}

.icon_active {
    transform: rotate(0deg);
}
.select_wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 488px;
}
.select_items {
    padding: 0 @padding_size;
    border-width: 2px;
    border-color: @main_color;
    border-radius: 12px;
    background-color: #fff;
}

.select_item {
    padding: @padding_size 0;
    border-bottom-width: 1px;
    border-bottom-color: #ebedf3;
}
.none_border {
    border-bottom-width: 0;
    border-color: transparent;
}
.option_text_active {
    color: @main_color;
}
.trigon_box {
    position: relative;
    left: 45px;
    top: 9px;
}
.icon_active_border {
    color: @main_color;
}
.icon_active_none {
    position: absolute;
    top: 4px;
    color: #fff;
}
.confirm {
    margin-top: 30px;
    width: 488px;
    background-color: @main_color;
    border-radius: 80px;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}

</style>
