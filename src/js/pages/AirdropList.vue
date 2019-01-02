<template>
    <div class="container">
        <div class="wrapper">
            <div class="status_bar" v-if="onpulling_down" :style="{height: onpulling_down_y}"></div>
                <div :class="['fixed_bar', fixed_bar && 'fixed_bar_active']">
                    <StatusBar></StatusBar>
                    <wxc-minibar :title="$t('空投广场')">
                        <text :class="['fixed_nav_bar_tight_text',language === 'zh-CN'? 'nav_bar_tight_text':'nav_bar_tight_text_en']" slot="right" @click="jumpWallet">{{ $t('钱包') }}</text>
                    </wxc-minibar>
                </div>
            <list ref="balance_dom" class="slider" index="0" infinite="false" loadmoreoffset="700" :style="{ height: page_height + 200 }" @loadmore="loadmoreMessages" @scroll="onscrollList">
                <Refresher @refresh="refreshCoins" @onpullingdown="onpullingdown" @refreshEnd="refreshEnd" :loading="loading.messages"></Refresher>
                <cell>
                    <div class="head" :style="{height: banner_image_height}">
                        <image class="banner_image" resize="cover" :style="{height: banner_image_height}" :src="banner.image" @click="openUrl(banner)" />
                        <StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
                        <wxc-minibar :title="$t('空投广场')" backgroundColor="transparent" text-color="#fff" borderBottomWidth="0px">
                            <wxc-icon slot="left" name="back" style="color: #fff;font-weight: bold;font-size:60px;position: relative;margin-left:-20px;" @wxcIconClicked="minibarLeftClicked"></wxc-icon>
                            <text :class="['unfixed_nav_bar_tight_text', language === 'zh-CN'? 'nav_bar_tight_text':'nav_bar_tight_text_en']" slot="right" @click="jumpWallet">{{ $t('钱包') }}</text>
                        </wxc-minibar>
                    </div>
                </cell>
                <cell><text class="hint">{{ $t('拥有的BZH越多，越有机会获得更多空投') }}</text></cell>
                <cell v-for="item in messages">
                    <div class="airdropitem" @click="goAirdropDetail(item._id)">
                        <image :src="item.icon" class="item_logo" />
                        <div class="list_item">
                            <div class="item_hd">
                                <text class="color434 item_title">{{item.title}}</text>
                                <image class="new_image" v-if="item.is_new" src="bmlocal://assets/images/bets/new.png" />
                            </div>
                            <text class="item_bd"  v-if="language === 'zh-CN'">{{ $t('共') }} {{item.total}} {{item.symbol}}{{ $t('，约￥')}} {{item.cur_price?item.cur_price:item.default_cny}}</text>
                            <text class="item_bd" v-else>{{ $t('共') }} {{item.total}} {{item.symbol}}{{ $t('，约') }}{{item.cur_price?item.cur_price:item.default_cny}}</text>
                            <div class="item_ft">
                                  <text  :class="['status_text', item.list_item_state ? 'colorff6' : 'color9b9']" >{{item.list_item_desc}}</text>
                                  <!-- <text v-if="item.state=== 2" ></text> -->
                                <div class="hd_timedown" v-if="item.state == 0 && !filters.lessnowTime(item.end_ts*1000)">
                                    <text class=" time_ing">{{ $t('剩余') }}</text>
                                    <!-- 中文版=zh-CN  英文版=en 印尼版=ind -->
                                    <TimeDown :tpl="`{d}${$t('天')}{h}:{m}:{s}`" :time="item.end_ts*1000"></TimeDown>
                                    
                                </div>
                                <div class="hd_time" v-if="item.state == 1">
                                    <text class=" time_start">{{filters.dateFormat(item.start_ts,'MM-dd hh:mm:ss')}}</text>
                                    <text class=" time_start">{{ $t('开抢') }}</text>
                                </div>
                                <text v-if="item.state ==2" class="hd_time time_end">{{ $t('已结束') }}</text>
                            </div>
                        </div>
                    </div>
                </cell>
                <cell>
                    <Loadmore :loading="loading.messages" :empty="$t('空空如也')"></Loadmore>
                </cell>
                <cell style="height: 200px;"></cell>
            </list>
        </div>
    </div>
</template>
<script>
import { Utils, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import filters from '../config/filters.js'
import Refresher from '../components/Refresher.vue'
import TimeDown from '../components/TimeDown.vue'
import common from '../config/common';
export default {
    components: {
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        TimeDown,
    },
    data: function() {
        return {
            filters,
            statusBarHeight: weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40,
            tabStyles: {
                height: 96,
                background: '#ffffff',
                selectedBackground: '#ffffff',
                titleSize: 34,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#F7B237',
            },
            onpulling_down: false,
            onpulling_down_y: 0,
            fixed_bar: false,
            banner_image_height: 385,
            showShare: false,
            bet_activity: {},
            is_loadmore: false,
            loading: {
                messages: 'init',
            },
            messages: [],
            banner: {},
            messages_page: 1,
            messages_size: 15,
            user_info: {},
        }
    },
    eros: {
        beforeDisappear (options) {
            // 离开页面
            this.$navigator.setNavigationInfo({
                statusBarStyle: 'Default'
            });
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.$event.emit('changeAirdropRedDot', false)
            this.getAirdropList();
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        refreshCoins() { //下拉刷新的时候 目的清空数据+重新加载页面
            this.messages_page = 1;
            this.getAirdropList();
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        loadmoreMessages() { //list滑动加载更多 
            if (this.loading.messages !== 'loaded') {
                return;
            }
            this.messages_page++;
            this.getAirdropList();
        },
        goAirdropDetail(obj) {
            this.getUserInfo();
            if(!this.user_info.token) {  //没有登录的情况
                this.$router.open({
                     name: 'Login'
                })
            }else { //有登录的情况
                this.$router.open({
                    name: 'AirdropDetail',
                    statusBarStyle: 'LightContent',
                    params: {
                        airdrop_id: obj
                    }
                })
            }
        },
        getAirdropList() { //list 加载数据
            let params = {};
            params.page = this.messages_page;
            params.size = this.messages_size;
            this.loading.messages = 'loading';
            return this.$fetch({
                name: 'getAirdropList',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) { //加载成功
                    this.loading.messages = 'loaded';

                    if (params.page === 1) {
                        this.messages = resData.items;
                        this.banner = resData.banner_info;
                        if (resData.items.length) this.$storage.setSync('airdropHaveReadID', resData.items[0]._id)
                        if (!resData.items.length) {
                            this.loading.messages = 'empty';
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.messages = 'nomore';
                        } else {
                            this.messages.push(...resData.items);
                        }
                    }
                } else {
                    if (resData.error === 1) {
                        this.loading.messages = 'need_login';
                    } else {
                        this.loading.messages = 'error';
                    }
                }
                this.$refs.balance_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore

            }).catch((e) => {
                console.log(e.message);
            });
        },
        openUrl(banner) {
            if (banner.type === 'origin') {
                return;
            } else if (banner.type === 'link') {
                this.$router.open({
                    name: banner.link,
                    type: 'PUSH',
                    params: banner.link_params || {},
                })
            } else if (banner.type === 'h5') {
                this.$router.toWebView({
                    url: banner.link, // 页面 url
                    title: '', // 页面 title
                    navShow: true // 是否显示native端导航栏，默认是true
                })
            }
        },
        onpullingdown(e) {
            this.onpulling_down_y = e.pullingDistance;
            if (this.onpulling_down_y >= this.statusBarHeight) {
                this.onpulling_down_y = this.statusBarHeight
            }
        },
        refreshEnd() {
            this.onpulling_down_y = 0;
            this.onpulling_down = false;
        },
        onscrollList(e) {
            let contentOffset_y = Math.abs(e.contentOffset.y);
            if (contentOffset_y >= this.banner_image_height + 40) {
                this.fixed_bar = true;
            } else {
                this.fixed_bar = false;
            }
        },
        jumpWallet() {
            this.$router.open({
                name: 'Wallet',
                statusBarStyle: 'LightContent',
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_purse_enter');
        },

    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        language() {
            return this.$storage.getSync('language');
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-size: 44px;
    font-family: iconfont2;
    color: #434343;
}

.icon-text {
    font-size: 34px;
    color: #434343;
}

.right_icon {
    color: #fff;
}
.status_bar {
    width: 750px;
}

.fixed_bar {
    position: fixed;
    top: -300px;
    left: 0;
    right: 0;
    opacity: 0;
    transition-property: opacity, top;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
}

.fixed_bar_active {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    opacity: 1;
    transition-property: opacity;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
}
.nav_bar_tight_text {
    font-size: 34px;
}
.nav_bar_tight_text_en {
    font-size: 28px;
}
.fixed_nav_bar_tight_text {
    color: #434343;
}
.unfixed_nav_bar_tight_text {
    color: #fff;
}
.wrapper {
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    bottom: 0;
}

.head {
    position: relative;
    width: 750px;
    background-color: #f7bf4e;
    background-image: linear-gradient(to right, #4ba0eb, #5f72e1);
}

.banner_image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 750px;
}

.time_ing {
    font-size: 23px;
    color: #9b9da4;
}
.time_end {
    font-size: 23px;
    color: #9b9da4;
}
.time_start {
    font-size: 23px;
    color: @main_color;
}

.airdropitem {
    margin: @padding_size @padding_size 0;
    padding: 0 @padding_size;
    background-color: #FFF;
    border-radius: 5px;
    flex-direction: row;
}

.list_item {
    flex: 1;
    margin: 20px 0 25px 0;
}

.item_bd {
    margin-top: 20px;
    font-size: 24px;
    color: #9b9da4;
}

.item_ft {
    flex-direction: row;
    justify-content: space-between;
    margin-top:20px;
}

.item_hd {
    flex-direction: row;
    
}

.item_hd {
    flex-direction: row;
}

.hd_time {
    flex-direction: row;
}

.hd_timedown {
    flex-direction: row;
    justify-content: flex-end;
}

.item_title {
    padding-top: 15px;
}

.new_image {
    margin-left: 10px;
    position: relative;
    top: 5px;
    width: 60px;
    height: 26px;
}

.item_logo {
    width: 90px;
    height: 90px;
    margin-top: 40px;
    border-radius: 50%;
    margin-right: 25px;
}

.color434 {
    font-size: 30px;
    font-weight: 600;
}
.status_text {
    font-size: 24px;
    color: #9b9da4;
}
.hint {
    text-align: center;
    font-size: 28px;
    color: #9b9da4;
    margin-top: 20px;
}

</style>
