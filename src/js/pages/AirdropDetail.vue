<template>
    <div class="container">
        <div class="box_hd">
            <StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
            <wxc-minibar :title="$t('空投详情')" backgroundColor="transparent" text-color="#fff" borderBottomWidth="0px">
                <wxc-icon slot="left" name="back" class="minibar_l" @wxcIconClicked="minibarLeftClicked"></wxc-icon>
            </wxc-minibar>
        </div>
        <div class="box_bd" :style="{top: 88 + statusBarHeight}">
            <scroller  :show-scrollbar="false" :style="{height: page_height}">
                <div class="bd_bzh_linear_bg">
                    <div class="bd_bzh_bg"></div>
                    <div class="bd_cont">
                        <div class="bd_cont_start">
                            <div class="less_star air_name_box">
                                <div class="air_logo">
                                    <image class="air_logo" resize="cover" :src="message.icon"></image>
                                </div>
                                <div class="air_name">
                                    <text class="text air_name_text">{{message.title}}</text>
                                    <text :class="['air_name_status' , theStatus.class[message.state] ]">{{theStatus.text[message.state]}}</text>
                                </div>
                            </div>
                            <div class="air_btn_box" v-if="message.symbol">
                                <div class="btn_box" v-if="message.state !== 1">
                                    <!-- 国内版 有分享的功能-->
                                    <text v-if="message.button_state && country == 'CHN'" class="air_btn_text" @click="showShare = true">{{message.button_text}}</text> 
                                    <!-- 国外版 印尼版 无分享功能-->
                                    <text v-if="message.button_state && country === 'IDN'" class="air_btn_text" @click="postAirdropWallet()">{{message.button_text}}</text>
                                    <text v-if="message.button_state && language == 'CHN'" class="air_btn_hint" >{{ $t('分享后即可领取空投') }}</text>
                                    <text v-if="!message.button_state" class="air_btn_text_disable" @click="showToast">{{message.button_text}}</text>
                                </div>
                                <div class="time_down" v-if="message.state === 1">
                                    <TimeDown  class=" time_ing" :tpl="`{d}${$t('天')}{h}:{m}:{s}`" :time="message.start_ts*1000" :timeTextStyle="{color: '#fff'}" :dotTextStyle="{color: '#fff'}" @wxcOnComplete="OnComplete"></TimeDown>
                                    <text class="text time_text">{{ $t('后开抢') }}</text>
                                </div>
                            </div>
                        </div>
                        <div class="bd_cont_end">
                            <div class="air_item">
                                <text class="text item_name">{{ $t('总量') }}</text>
                                <div class="less_row air_value_box">
                                    <text class="value_text">{{message.total_str}}</text>
                                    <text class="value_text_unit">{{message.symbol}}</text>
                                </div>
                            </div>
                            <div class="air_item">
                                <text class="text item_name">{{ $t('已领取') }}</text>
                                <div class="less_row air_value_box">
                                    <text class="value_text">{{message.has_drop_str}}</text>
                                    <text class="value_text_unit">{{message.symbol}}</text>
                                </div>
                            </div>
                            <div class="air_item air_item_noline">
                                <text class="text item_name">{{ $t('剩余') }}</text>
                                <div class="less_row air_value_box">
                                    <text class="value_text">{{message.left_str}}</text>
                                    <text class="value_text_unit">{{message.symbol}}</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="air_intro">
                    <div class="intro_item">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('项目介绍') }}</text>
                        </div>
                        <div class="" v-if="show_web">
                            <web ref="webview_dom" :style="{height:html_h}" class="less_bg_fff" :src="`${API_BaseUrl}/api/airdrop/html?airdrop_id=${router_params.airdrop_id}&_locale=${$locale()}&_country=${PUBLISH_COUNTRY}`" @pagefinish="onPageFinish" @pagestart="onPageStart"></web>
                        </div>
                    </div>
                    <div class="intro_item">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('领取规则') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{message.rule}}</text>
                        </div>
                    </div>
                </div>
            </scroller>
        </div>
        <!-- 国内版 有分享的功能 -->
        <div class="box_ft" v-if="message.symbol && message.state !== 2  && country === 'CHN'">
            <div class="share_box" @click="showShare = true">
                <text class="share_text">{{ $t('分享好友，额外领取') }}{{message.share_symbol_award}}{{message.symbol}}</text>
            </div>
            <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="showShare = false" @ShareCallback="ShareCallback" />
        </div>
    </div>
</template>
<script>
import { Utils, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import ShareComponents from '../components/ShareComponents.vue'
import TimeDown from '../components/TimeDown.vue'
import filters from '../config/filters.js'
import { Iconfont, API_BaseUrl, Token_Website, PUBLISH_COUNTRY } from '../config/config.js'
import common from '../config/common';
export default {
    components: {
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        Dialog,
        ShareComponents,
        TimeDown
    },
    data() {
        return {
            statusBarHeight: Number(weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40),
            API_BaseUrl,
            filters,
            showShare: false,
            router_params: {},
            bet_activity: {},
            message: {},
            html_h: 0,
            user_token: {},
            web_load: false,
            show_web: true,
            screenshot: '',
            theStatus: {
                text : [this.$t('进行中') , this.$t('预热中') , this.$t('已结束')],
                class : ['status_statrt' , 'status_now' , 'status_stop'],
            }, 
        };
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
        // 第三方字体
        domModule.addRule('fontFace', {
            'fontFamily': "DINMedium",
            'src': `url('bmlocal://iconfont/fonts/DINMedium.ttf')`
        });
    },
    created() {
        this.init();
    },
    eros: {
        beforeBackAppear(params, options) {
            this.show_web = true;
            this.web_load = false;
            this.init();
        },
        appDeactive() {
            // 后台
        },
        disappeared(options) {
            // 离开页面，返回不触发该事件
            this.show_web = false;
        },
        beforeDisappear(options) {
            // 离开页面
            this.$navigator.setNavigationInfo({
                statusBarStyle: 'Default'
            });
        }
    },
    methods: {
        init() {
            this.getUserToken();
            this.getRouterParams();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_airdrop_details');
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.getAirdropDetail();
                this.getAirdropShareImage();
            })
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        ShareCallback(res) {
            if (res === 'succeed') {
                this.showShare = false;
                if (this.message.button_state) {
                    this.postAirdropWallet(); //分享成功之后返回 然后发送获取空投 重新刷新页面
                }
                // 友盟统计-自定义事件计数
                common.addUmengClickEvent('bzh_airdrop_share');
            }
        },
        getAirdropDetail() {
            let params = {};
            params.airdrop_id = this.router_params.airdrop_id;
            return this.$fetch({
                name: 'getAirdropDetail',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) { //加载成功
                    this.message = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getAirdropShareImage() {
            let params = {};
            params.airdrop_id = this.router_params.airdrop_id;
            return this.$fetch({
                name: 'getAirdropShareImage',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) { //加载成功
                    resData.result = resData.result || {};
                    this.screenshot = resData.result.screenshot || '';
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        postAirdropWallet() {
            let params = {};
            params.airdrop_id = this.router_params.airdrop_id;
            params.sharer_id = this.router_params.token || '';
            return this.$fetch({
                name: 'postAirdropWallet',
                method: 'POST',
                data: params,
            }).then(resData => {
                if (resData.error === 0) { //加载成功
                    this.getAirdropDetail();
                    // 友盟统计-自定义事件计数
                    common.addUmengClickEvent('bzh_airdrop_get');
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        showToast() {
            this.$notice.toast({ message: this.$t('拥有BZH越多，可获得空投越多哦~') })
        },
        onPageFinish(e) {
            if (e.url.indexOf('height=') != -1) {
                this.html_h = e.url.split("height=")[1] * 2 + 20;
                setTimeout(() => {
                    this.web_load = true;
                }, 400)
            }
        },
        onPageStart(e) {
            let uri = e.url;
            if (this.web_load && uri) {
                this.$router.toWebView({
                    url: uri, // 页面 url
                    title: this.$t('币智慧'), // 页面 title
                    navShow: true // 是否显示native端导航栏，默认是true
                })
            }
        },
        getUserToken() {
            let params = {};
            this.$fetch({
                name: 'getUserToken',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.user_token = resData.result.ic;
                } else {

                }
            }).catch((resData) => {
                this.$notice.toast({ message: resData })
            });
        },
        OnComplete() {
            this.getAirdropDetail();
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        shareConfigs() {
            return {
                title: `${this.message.share_title}`, // 分享的标题
                content: `${this.message.share_content}`, // 分享的文字内容
                url: `${Token_Website}/airdrop/${this.router_params.airdrop_id}?token=${this.user_token}`, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接 http://i.test.bizhihui.vip  Token_Website
                image: `${this.screenshot}`, // 分享的图片url,
                type: 'Image'
            }
        },
        language() {
              return this.$storage.getSync('language');
        },
        country() {
            return `${PUBLISH_COUNTRY}`;
        },

    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
}

.icon {
    font-family: iconfont2;
}

.DINMedium {
    font-family: DINMedium;
}

.box_hd {
    width: 750px;
    background-color: #f7bf4e;
    background-image: linear-gradient(to left, #F4CE52, #F8BD4E);
}
.minibar_l {
    color: #fff;font-weight: bold;font-size: 60px;position: relative;left: -14px;
}
.box_bd {
    position: absolute;
    top: 128px;
    left: 0;
    right: 0;
}


.bd_bzh_linear_bg {
    position: relative;
    height: 355px;
    background-image: linear-gradient(to left, #F4CE52, #F8BD4E);
}
.bd_bzh_bg {
    background-color: #fff;
    width: 750px;
    height: 120px;
    position: absolute;
    bottom: 0;
}
.bd_cont {
    margin-left: @padding_size;
    margin-right: @padding_size;
    position: absolute;
    top: 50;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 12px;
    height: 300px;
    box-shadow: 0px 0px 8px rgba(250, 181, 55, 0.4);
}



.bd_cont_start {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 30px;
    padding-bottom: 30px;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
}

.air_name_box {
    padding-right: 10px;
    flex: 1;
    align-items: center;
}

.air_logo {
    width: 90px;
    height: 90px;
    border-radius: 100%;
}

.air_btn_box {
    justify-content: flex-end;
}

.air_name {
    flex: 1;
    padding-left: 20px;
}

.air_name_text {
    margin-bottom: 10px;
    font-size: 30px;
    lines: 2;
    text-overflow: ellipsis;
}

.air_name_status {
    width: 150px;
    height: 34px;
    line-height: 34px;
    font-size: 20px;
    border-width: 1px;
    border-color: #A0A2A9;
    color: #A0A2A9;
    border-radius: 20px;
    text-align: center;
}

.status_now {
    border-color: #36CC80;
    color: #36CC80;
}

.status_statrt {
    border-color: #FE7070;
    color: #FE7070;
}

.status_stop {
    border-color: #A0A2A9;
    color: #A0A2A9;
}

.air_btn_hint {
    font-size: 22px;
    color: @main_color;
    text-align: center;
    padding-top: 20px;
}

.air_btn_text {
    width: 230px;
    height: 80px;
    text-align: center;
    line-height: 80px;
    background-image: linear-gradient(to bottom, #F7C837, #F9B257);
    border-radius: 80px;
    color: #fff;
    box-shadow: 0px 3px 4px 0px rgba(247, 169, 55, 0.5);
    align-items: center;
    justify-content: center;
}

.air_btn_text_disable {
    width: 230px;
    height: 80px;
    text-align: center;
    line-height: 80px;
    color: #fff;
    border-radius: 80px;
    background-image: linear-gradient(to bottom, #BDBFC6, #BBBDC4);
    box-shadow: none;
    align-items: center;
    justify-content: center;
}

.time_down {
    flex-direction: column;
    width: 230px;
    height: 80px;
    text-align: center;
    color: #fff;
    border-radius: 80px;
    background-image: linear-gradient(to bottom, #BDBFC6, #BBBDC4);
    box-shadow: 0;
    align-items: center;
    justify-content: center;
}

.time_text {
    font-size: 22px;
    color: #fff;
}

.bd_cont_end {
    flex-direction: row;
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
}

.air_item {
    flex: 1;
    border-right-width: 1px;
    border-right-color: #E7EAF1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.air_item_noline {
    border-right-width: 0;
}

.item_name {
    padding-bottom: 20px;
    font-size: 24px;
    color: #9B9DA4;
}

.value_text {
    font-size: 40px;
    font-weight: bold;
    color: @main_color;
}

.value_text_unit {
    padding-left: 10px;
    position: relative;
    top: 20px;
    font-size: 18px;
    color: @main_color;
}

.air_intro {
    padding-bottom: 120px;
    background-color: #fff;
}

.intro_item {
    margin-top: 25px;
    margin-bottom: 30ppx;
}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
}

.item_title_left {
    flex-direction: row;
    flex: 1;
}

.item_title_right {
    flex: 1;
}

.title_intro {
    text-align: right;
    color: #B0B2B8;
    font-size: 20px;
}

.title_line {
    width: 10px;
    height: 34px;
    background-color: @main_color;
}

.title_text {
    margin-left: 15px;
    font-size: 34px;
    color: #434343;
    font-weight: bold;
}

.item_intro {
    padding: 0 @padding_size;
    line-height: 60px;
}

.intro_text {
    font-size: 32px;
    color: #434343;
    line-height: 60px;
    padding: 0 25px;
}

.share_box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 750px;
    height: 98px;
    background-color: @main_color;
    align-items: center;
    justify-content: center;
}

.share_text {
    font-size: 34px;
    color: #fff;
}

</style>
