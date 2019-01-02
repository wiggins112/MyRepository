<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar>
            <div slot="middle" class="middle">
                <text
                    class="middle_title"
                >{{symbol}}{{(coin.cn || coin.name) ? '-': ''}}{{`${$locale() === 'zh-CN' ? (coin.cn || coin.name || '') : coin.name}`}}</text>
                <text class="middle_title_second">({{coin.name}} {{$t('均价')}})</text>
            </div>
            <div slot="right" class="right" @click="minibarRightButtonClick" v-if="!is_ios">
                <text class="icon right_icon">&#xe90b;</text>
            </div>
        </wxc-minibar>
        <list
            class="wrapper_list"
            ref="coindetail_dom"
            loadmoreoffset="30"
            @loadmore="loadmorePlatforms"
            :style="{height: height_bar}"
        >
            <Refresher @refresh="refreshCoins" @refreshEnd="refreshEnd"></Refresher>
            <cell ref="top_dom">
                <div class="box_hd">
                    <div class="price_box_hd">
                        <div class="price_box_hd_l">
                            <text  :class="['hd_l_small', selected.percent_change_8am > 0 ? 'safe' : 'warn']" v-if="selected.price_local_str" >{{get_currency_symbol}}</text>
                            <text  :class="['hd_l_big', selected.percent_change_8am > 0 ? 'safe' : 'warn']" >{{selected.price_local_str || '--'}}</text>
                            <text :class="['hd_l_txt', selected.percent_change_8am > 0 ? 'safe' : 'warn']" >{{selected.percent_change_8am_str}}</text>
                        </div>
                    </div>
                    <div class="price_box_bd">
                        <div class="price_box_bd_l">
                            <div class="less_row">
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">24h{{ $t('最高') }}</text>
                                    <text class="price_box_bd_num">{{selected.price_local_high_24h_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">{{ $t('流通市值') }}</text>
                                    <text class="price_box_bd_num">{{coin.market_cap_usd_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">24h {{ $t('成交量') }}</text>
                                    <text class="price_box_bd_num">{{selected.volume_24h_str || '--'}}</text>
                                </div>
                            </div>
                            <div class="less_row">
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">24h{{ $t('最低') }}</text>
                                    <text class="price_box_bd_num">{{selected.price_local_low_24h_str || '--'}}</text>
                                </div>
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">{{ $t('排名') }}</text>
                                    <text class="price_box_bd_num">#{{coin.rank }}</text>
                                </div>
                                <div class="price_box_bd_item">
                                    <text class="price_box_bd_txt">{{ $t('流通量') }}({{coin.symbol}})</text>
                                    <text class="price_box_bd_num">{{coin.available_supply_str || '--'}}</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </cell>
            <cell ref="CoinPriceLine">
                <div class="box_bd">
                    <CoinPriceLine :refresh="is_refresh"></CoinPriceLine>
                </div>
            </cell>
            <cell>
                <div class="box_ft">
                    <div class="tabbar">
                        <bui-tabbar
                            :containerStyle="{width: 750}"
                            :tabItems="tabTitles"
                            showSelectedLine="true"
                            @change="onItemChange"
                            v-model="currentTabIndex"
                            :height="tabStyles.height"
                            :background="tabStyles.background"
                            :selectedBackground="tabStyles.selectedBackground"
                            :titleSize="tabStyles.titleSize"
                        ></bui-tabbar>
                    </div>
                    <slider
                        class="slider"
                        :scrollable="!is_ios"
                        @change="onSliderChange"
                        :index="currentTabIndex"
                        infinite="false"
                    >
                        <div class="slider-item">
                            <CoinPlatforms
                                :ref="currentTab.type"
                                v-if="currentTabIndex === 0"
                                :is_loadmore="is_loadmore"
                                :is_refresh="is_refresh"
                                @Loadmoreing="Loadmoreing"
                            ></CoinPlatforms>
                        </div>
                        <div class="slider-item">
                            <CoinArticle
                                :ref="currentTab.type"
                                v-if="currentTabIndex === 1"
                                :is_loadmore="is_loadmore"
                                :is_refresh="is_refresh"
                                @Loadmoreing="Loadmoreing"
                            ></CoinArticle>
                        </div>
                        <div class="slider-item">
                            <CoinDiagnose
                                :ref="currentTab.type"
                                v-if="currentTabIndex === 2"
                                :is_loadmore="is_loadmore"
                                :is_refresh="is_refresh"
                                @Loadmoreing="Loadmoreing"
                            ></CoinDiagnose>
                        </div>
                        <div class="slider-item">
                            <CoinInfo
                                :ref="currentTab.type"
                                v-if="currentTabIndex === 3"
                                :is_loadmore="is_loadmore"
                                :is_refresh="is_refresh"
                                @Loadmoreing="Loadmoreing"
                            ></CoinInfo>
                        </div>
                        <div class="slider-item">
                            <CoinAnalyse
                                :ref="currentTab.type"
                                v-if="currentTabIndex === 4"
                                :is_loadmore="is_loadmore"
                                :is_refresh="is_refresh"
                                @Loadmoreing="Loadmoreing"
                            ></CoinAnalyse>
                        </div>
                    </slider>
                </div>
            </cell>
            <cell style="height: 150px;"></cell>
        </list>
        <div class="btn_wrap">
            <div class="btn_box" v-if="!is_shoting">
                <div class="btn_item" @click="addUserCoin">
                    <text class="icon icon_btn" v-if="selected.is_star">&#xe90a;</text>
                    <text class="icon icon_btn" v-if="!selected.is_star">&#xe93a;</text>
                    <text class="symbol_text">{{ $t('自选') }}</text>
                </div>
                <div class="btn_item" @click="jumpCoinStat" v-if="!hideModule['Stare']">
                    <text class="icon icon_btn">&#xe93c;</text>
                    <text class="symbol_text">{{ $t('盯盘') }}</text>
                </div>
            </div>
            <div :style="{width: 750, height: touchBarHeight, backgroundColor: '#fff'}"></div>
        </div>
        <DialogTaskDone
            v-if="show_dialog_task_done"
            task="done_daily_coin"
            @closeDialog="closeDialog"
        ></DialogTaskDone>
        <ShareComponents
            :showShare="show_share"
            :shareConfigs="shareConfigs"
            @closeShare="closeShare"
        />
    </div>
</template>
<script>
import { Utils, WxcButton } from "weex-ui";
import WxcMinibar from "../components/WxcMinibar.vue";
import StatusBar from "../components/StatusBar.vue";
import Loadmore from "../components/Loadmore.vue";
import Refresher from "../components/Refresher.vue";
import CoinItem from "../components/CoinItem.vue";
import CoinInfo from "../components/CoinInfo.vue";
import CoinArticle from "../components/CoinArticle.vue";
import CoinAnalyse from "../components/CoinAnalyse.vue";
import CoinPriceLine from "../components/CoinPriceLine.vue";
import CoinPlatforms from "../components/CoinPlatforms.vue";
import CoinDiagnose from "../components/CoinDiagnose.vue";
import { API_BaseUrl, Iconfont } from "../config/config.js";
import BuiTabbar from "../components/BuiTabbar.vue";
import DialogTaskDone from "../components/DialogTaskDone.vue";
import ShareComponents from "../components/ShareComponents.vue";
import utils from "../config/utils";
import common from "../config/common";
const dom = weex.requireModule("dom");
const ScreenShot = weex.requireModule("ScreenShot");

export default {
    components: {
        WxcMinibar,
        WxcButton,
        StatusBar,
        BuiTabbar,
        Loadmore,
        Refresher,
        CoinItem,
        CoinInfo,
        CoinAnalyse,
        CoinDiagnose,
        CoinArticle,
        CoinPriceLine,
        CoinPlatforms,
        DialogTaskDone,
        ShareComponents
    },
    data() {
        return {
            screen_height: weex.config.env.realDeviceHeight,
            is_ios: weex.config.env.platform === "iOS" ? true : false,
            touchBarHeight: weex.config.env.touchBarHeight || 0,
            show_dialog_task_done: false,
            title: "",
            router_params: {},
            statusBarStyle: {
                bgColor: "#ffffff"
            },
            currentTabIndex: 0,
            currentTab: {},
            tabStyles: {
                height: 90,
                background: "#ffffff",
                selectedBackground: "#ffffff",
                titleSize: 34,
                normalColor: "#434343",
                selectedColor: "#F7B237",
                borderBottomColor: "#F7B237"
            },
            is_loadmore: false,
            is_refresh: false,
            tabTitles: [
                {
                    title: this.$t("行情"),
                    type: "CoinPlatforms",
                    shot_height: 1000,
                    active: true
                },
                {
                    title: this.$t("资讯"),
                    type: "CoinArticle",
                    shot_height: 1000,
                    active: false
                },
                {
                    title: this.$t("诊币"),
                    type: "CoinDiagnose",
                    shot_height: 2000,
                    active: false
                },
                {
                    title: this.$t("概述"),
                    type: "CoinInfo",
                    shot_height: 2500,
                    active: false
                },
                {
                    title: this.$t("分析"),
                    type: "CoinAnalyse",
                    shot_height: 2500,
                    active: false
                }
            ],
            currentTitle: "",
            default_price: "",
            coin: {
                name: ""
            },
            symbol: "",
            selected: {
                pair_symbol: "",
                pair_base: "",
                platform: ""
            },
            loading: {
                coin_ks: "loading"
            },
            height_bar: 0,
            share_image: "",
            show_share: false,
            is_shoting: false,
            ScreenShot_flang: false
        };
    },
    beforeCreate() {
        var domModule = weex.requireModule("dom");
        domModule.addRule("fontFace", {
            fontFamily: "iconfont2",
            src: `url('${Iconfont}')`
        });
    },
    created() {
        this.init();
    },
    eros: {
        beforeBackAppear(params, options) {
            this.getCoin();
        },
        // app 前后台相关 start
        appActive() {
            // 前台
        },
        appDeactive() {
            // 后台
        },
        // app 前后台相关 end
        beforeDisappear(options) {
            // 离开页面
        }
    },
    methods: {
        init() {
            this.height_bar = this.page_height;
            this.getRouterParams();
        },
        addUserCoin() {
            if (this.selected.is_star) {
                this.deleteUserCoin();
            } else {
                this.postUserCoin();
            }
        },
        closeDialog() {
            this.show_dialog_task_done = false;
        },
        closeShare() {
            this.show_share = false;
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.currentTabIndex = this.router_params.tabIndex || 0;
                this.currentTab = this.tabTitles[this.currentTabIndex];
                this.symbol = resData.pair_symbol || resData.symbol;
                this.selected.pair_symbol = this.symbol;
                this.selected.pair_base = resData.pair_base || "";
                this.selected.platform = resData.platform || "均价";

                this.getCoin();
                this.postUserTokenDailyReadCoin();
            });
        },
        refreshCoins() {
            this.is_refresh = true;
            this.getCoin();
        },
        refreshEnd() {
            this.is_refresh = false;
        },
        postUserTokenDailyReadCoin() {
            let params = {};
            params.symbol_id = this.router_params.symbol_id;
            params.block_cc_id = this.router_params.block_cc_id;
            params.quote = this.selected.pair_symbol;
            params.base = this.selected.pair_base;
            params.platform = this.selected.platform;
            console.log(params);
            this.$fetch({
                name: "postUserTokenDailyReadCoin",
                method: "POST",
                data: params
            })
                .then(resData => {
                    if (resData.error === 0) {
                        this.show_dialog_task_done = true; // 组件里面会检查任务是否完成，完成就显示弹框
                    } else {
                        this.$notice.toast({ message: resData.message });
                    }
                })
                .catch(e => {
                    console.log(e.message);
                });
        },
        onItemChange(index) {
            this.currentTab = this.tabTitles[index];
            this.currentTabIndex = index;
        },
        onSliderChange(e) {
            if (this.is_ios) {
                return;
            }
            var index = e.index;
            this.currentTab = this.tabTitles[e.index];
            this.currentTabIndex = index;
        },
        async minibarRightButtonClick() {
            let deviceWidth = weex.config.env.deviceWidth;
            console.log("deviceWidth", deviceWidth);
            // 头部导航栏高度
            let tabbar_height = 100;
            dom.scrollToElement(this.$refs.top_dom, {
                offset: -300,
                animated: false
            });
            // tab页面的高度
            let dom_info = await this.getDomInfo(
                this.$refs[this.currentTab.type]
            );
            let dom_height = dom_info.result ? dom_info.size.height : 2000;
            // 币价格高度
            let top_dom_height = await this.getDomInfo(this.$refs.top_dom);
            top_dom_height = top_dom_height.size.height;
            // 价格曲线高度
            let CoinPriceLine_height = await this.getDomInfo(
                this.$refs.CoinPriceLine
            );
            CoinPriceLine_height = CoinPriceLine_height.size.height;
            // 页面总高度
            let tab_page_height = parseInt(
                dom_height +
                    top_dom_height +
                    CoinPriceLine_height +
                    tabbar_height
            );
            // 页面真实像素高度
            let real_height = parseInt((tab_page_height / 750) * deviceWidth);
            if (deviceWidth <= 720) {
                real_height = real_height >= 3500 ? 3500 : real_height;
            } else {
                real_height = real_height >= 6000 ? 6000 : real_height;
            }

            this.$notice.loading.show();
            this.is_shoting = true;
            // 执行两次截图，防止截图出问题
            let ttt = await this.ScreenShotShare(tab_page_height, real_height);
            let images_m = await this.ScreenShotShare(
                tab_page_height,
                real_height
            );
            ScreenShot.resetHeight(weex.config.env.deviceHeight);
            this.height_bar = this.page_height;
            this.$notice.loading.hide();
            this.is_shoting = false;
            if (!images_m.error) {
                this.show_share = true;
            }
        },
        ScreenShotShare(tab_page_height, real_height) {
            this.height_bar = tab_page_height + 1200;
            return new Promise((resolve, reject) => {
                let fileName = new Date().getTime() + "_pic.jpg";
                let logo_name = `shot_logo_${this.$locale()}.png`;
                setTimeout(() => {
                    ScreenShot.getScreenShot(
                        real_height,
                        fileName,
                        logo_name,
                        "bottom",
                        result => {
                            this.share_image = "file://" + result.path;
                            resolve(result);
                        }
                    );
                }, 200);
            });
        },
        getDomInfo(refs_dom) {
            return new Promise((resolve, reject) => {
                dom.getComponentRect(refs_dom, option => {
                    resolve(option);
                });
            });
        },
        getCoin() {
            let params = {};
            params.symbol = this.symbol;
            params.symbol_id = this.router_params.symbol_id;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}`,
                method: "GET",
                data: params
            })
                .then(resData => {
                    if (resData.error === 0) {
                        this.coin = resData.result;
                        resData.result.is_star
                            ? (resData.result.is_star = true)
                            : (resData.result.is_star = false);
                        if (this.selected.platform === "均价") {
                            this.selected = resData.result;
                        }
                    } else {
                        // this.$notice.toast({ message: resData.message });
                    }
                })
                .catch(e => {
                    console.log(e.message);
                });
        },
        postUserCoin() {
            let params = {
                platform: this.selected.platform,
                pair_symbol: this.selected.pair_symbol,
                pair_base: this.selected.pair_base,
                symbol_id: this.router_params.symbol_id
            };
            if (this.selected.platform === "均价") {
                params.pair_symbol = this.selected.symbol || this.symbol;
                params.pair_base = "";
            }
            this.$notice.loading.show();
            this.$fetch({
                name: "postUserCoin",
                method: "POST",
                data: params
            })
                .then(resData => {
                    if (resData.error === 0) {
                        this.$notice.toast({ message: this.$t("已添加") });
                        this.selected.is_star = true;
                        // 友盟统计-自定义事件计数
                        common.addUmengClickEvent("bzh_cointrade_add_click");
                    } else {
                        this.$notice.toast({ message: resData.message });
                    }
                    this.$notice.loading.hide();
                })
                .catch(e => {
                    console.log(e.message);
                    this.$notice.loading.hide();
                });
        },
        deleteUserCoin() {
            let params = {
                platform: this.selected.platform,
                pair_symbol: this.selected.pair_symbol,
                pair_base: this.selected.pair_base,
                symbol_id: this.router_params.symbol_id
            };
            if (this.selected.platform === "均价") {
                params.pair_symbol = this.selected.symbol || this.symbol;
                params.pair_base = "";
            }
            let query_str = utils.getQueryStr(params);
            this.$notice.loading.show();
            this.$fetch({
                url: `${API_BaseUrl}/api/user/coin?${encodeURI(query_str)}`,
                method: "DELETE",
                data: {}
            })
                .then(resData => {
                    if (resData.error === 0) {
                        this.$notice.toast({ message: this.$t("已取消") });
                        this.selected.is_star = false;
                    } else {
                        this.$notice.toast({ message: resData.message });
                    }
                    this.$notice.loading.hide();
                })
                .catch(e => {
                    console.log(e.message);
                    this.$notice.loading.hide();
                });
        },
        loadmorePlatforms() {
            this.is_loadmore = true;
        },
        Loadmoreing() {
            this.is_loadmore = false;
            this.$refs.coindetail_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
        },
        jumpCoinStat() {
            let { pair_base, pair_symbol, platform, symbol } = this.selected;
            let symbol_id = this.router_params.symbol_id;
            if (platform === "均价") {
                this.$router.open({
                    name: "Stare",
                    params: {
                        symbol,
                        platform,
                        symbol_id
                    }
                });
            } else {
                this.$router.open({
                    name: "Stare",
                    params: {
                        pair_base,
                        pair_symbol,
                        platform,
                        symbol_id
                    }
                });
            }
        }
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        language() {
            return this.$storage.getSync("language");
        },
        hideModule() {
            return this.$storage.getSync("hideModule");
        },
        shareConfigs() {
            return {
                title: `${this.router_params.pair_symbol}`, // 分享的标题
                content: `${this.router_params.pair_symbol}`, // 分享的文字内容
                url: ``, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接 http://i.test.bizhihui.vip  Token_Website
                image:
                    this.share_image ||
                    "file:///storage/emulated/0/bizhihui/1541647330690_pic.jpg", // 分享的图片url,
                type: "Image",
                imageType: "local"
            };
        },
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
        },
    }
};
</script>
<style scoped lang="less">
@import url("../css/veriable.less");
.container {
}

.icon {
    font-family: iconfont2;
}
.right {
    height: 90px;
    width: 100px;
    justify-content: center;
}
.right_icon {
    text-align: right;
    font-size: 40px;
    color: #444;
}
.middle {
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.middle_title {
    font-size: 36px;
    color: #434343;
    font-weight: bold;
    text-align: center;
    flex: 1;
}
.middle_title_second {
    font-size: 24px;
    color: #434343;
    text-align: center;
    flex: 1;
}
.box_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 30px;
    padding-bottom: 15px;
    background-color: #fff;
    border-color: #eee;
    border-bottom-width: 1px;
}

.list {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.list_bottom {
    margin-top: 5px;
}

.item {
    flex: 1;
    flex-direction: column;
}

.item_price {
    flex: 1.3;
}

.top {
    color: #9b9da4;
    font-size: 20px;
}

.bottom {
    color: #434343;
    font-size: 22px;
    margin-top: 6px;
    font-weight: bold;
}

.top_special {
    font-size: 34px;
    font-weight: bold;
}

.bottom_special {
    font-size: 22px;
}

.percent_change {
    position: relative;
    top: 5px;
}

.price_cny {
    text-align: left;
}

.price_usd {
    text-align: left;
}

.box_bd {
    background-color: #eff3f4;
    margin-bottom: 15px;
}

.box_ft {
    width: 750px;
    min-height: 900px;
}
.tabbar {
    width: 750px;
    flex-direction: row;
    background-color: #fff;
}
.slider-item {
    width: 750px;
}

.slider {
    width: 750px;
}

.tabs {
    flex-direction: row;
    justify-content: space-between;
    border-width: 1px;
    border-color: rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.button {
    flex: 1;
    font-size: 30px;
    text-align: center;
    padding: 25px 0;
}

.active {
    color: #f7b237;
    border-bottom-width: 2px;
    border-bottom-color: #f7b237;
    border-bottom-style: solid;
}

.warn {
    color: @warn_color;
}

.safe {
    color: @safe_color;
}

.safe_bg {
    background-color: @safe_color;
}

.warn_bg {
    background-color: @warn_color;
}

.k_wrap_list {
}

.k_wrap_item {
    padding: @padding_size;
    flex-direction: row;
    align-items: center;
}

.k_wrap_item_1n {
    background-color: #f4f6f9;
}

.k_wrap_item_2n {
    background-color: #ffffff;
}

.k_wrap_tips {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 10px;
    font-size: 23px;
    color: #999;
    background-color: #eff3f4;
}

.k_wrap_name {
    flex-direction: row;
    color: #434343;
    flex: 1;
    text-align: left;
}

.k_wrap_value {
    font-size: 28px;
    color: #777;
    flex: 3;
    text-align: right;
}

.k_wrap_image_icon {
    position: relative;
    color: #666;
    font-size: 35px;
}

.k_wrap_text {
    font-size: 28px;
    padding-left: 25px;
    color: #666;
}
.btn_wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 750px;
}
.btn_box {
    height: 98px;
    flex-direction: row;
    border-top-width: 2px;
    border-color: #eee;
    align-items: center;
    justify-content: center;
    background-color: #fff;
}
.btn_item {
    flex: 1;
    height: 68px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-right-width: 1px;
    border-color: #eee;
}

.symbol_text {
    padding-top: 3px;
    padding-left: 10px;
    color: #434343;
    font-size: 28px;
}
.icon_btn {
    font-size: 35px;
    color: #b4b4b4;
}

 .price_box_hd {
     flex-direction: row;
     padding-bottom: 22px;
 }
 .price_box_hd_l {
     flex: 1;
     flex-direction: row;
     align-items: flex-end;
 }
 .hd_l_big {
     font-size: 48px;
     font-weight: bold;
 }
 .hd_l_txt {
     font-size: 32px;
     padding-left: 35px;
     font-weight: bold;
     padding-bottom: 5px;
 }
 .price_box_bd {
     flex-direction: row;
 }
 .price_box_bd_l {
     flex: 1;
 }
 .per_item {
     flex: 1.5;
 }
 .price_box_bd_item {
     flex: 2;
     flex-direction: row;
     margin-bottom: 13px;
 }
 .price_box_bd_txt {
     color: #9b9da4;
     font-size: 20px;
 }
 .price_box_bd_num {
     color: #434343;
     font-size: 22px;
     font-weight: bold;
     align-items: center;
     padding-left: 10px;
 }
 .hd_l_small {
     font-size: 36px;
     font-weight: bold;
     padding-bottom: 5px;
 }
</style>