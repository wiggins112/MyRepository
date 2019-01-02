<template>
    <div class="container">
        <wxc-minibar :title="$t('行情')" :useDefaultReturn="false" left-button="" leftWidth="100px" rightWidth="100px">
            <div slot="left" @click="goSearchCoin" v-if="currentTabIndex === 0 && !hideModule['SearchCoin']">
                <text class="icon icon_search">&#xe915;</text>
            </div>
            <div class="middle" slot="middle">
                <bui-tabbar style="width: 440px;" :tabItems="tabItems" @change="onItemChange" v-model="currentTabIndex" :background="tabStyles.background" :selectedBackground="tabStyles.selectedBackground"  :height="tabStyles.height" :showSelectedLine="tabItems.length > 1"></bui-tabbar>
            </div>
            <div slot="right" @click="goStareMsg" v-if="currentTabIndex === 1 && !hideModule['Stare']">
                <text class="icon icon_message">&#xe91c;</text>
            </div>
        </wxc-minibar>
        <slider class="slider" @change="onSliderChange" :index="currentTabIndex" infinite="false">
            <div class="slider-item">
                <UserCoins :Active="tabbarActive" @SetTabbarActive="SetTabbarActive" />
            </div>
            <div class="slider-item" v-if="!this.hideModule['Stare']" >
                <UserNoticeMessage :Active="tabbarActive" />
            </div>
        </slider>
        <BetFloat v-if="tabbarActive && !hideModule['BetMy'] && showBetFloat">
        </BetFloat>
    </div>
</template>
<script>
import UserCoins from '../components/UserCoins.vue'
import UserStat from '../components/UserStat.vue'
import UserNoticeMessage from '../components/UserNoticeMessage.vue'
import BetFloat from '../components/BetFloat.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import BuiTabbar from '../components/BuiTabbar.vue'
import common from '../config/common';
export default {
    components: {
        UserCoins, 
        UserStat,
        UserNoticeMessage,
        BetFloat,
        BuiTabbar,
        WxcMinibar
    },
    data() {
        return {
            tabStyles: {
                height: 90,
                background: 'transparent',
                selectedBackground: 'transparent',
                titleSize: 34,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#F7B237',
            },
            currentTabIndex: 0,
            currentTab: {},
            unread_count: 0,
            timeout_ts: 1000 * 6,
            notice_timmer: null,
        }
    },
    created() {

    },
    eros: {
        beforeBackAppear(params, options) {
            if (this.tabbarActive) {
                this.init();
            }
        },
        // app 前后台相关 start 
        appActive() {
            // 前台
        },
        appDeactive() {
            // 后台
            // this.clearNoticeTimmer();
        },
        // app 前后台相关 end 
        beforeDisappear (options) {
            // 离开页面
            // this.clearNoticeTimmer();
        }
    },
    props: {
        tabbarActive: {
            type: Boolean,
            default: false,
        },
        showBetFloat: {
            type: Boolean,
            default: true,
        },
        statActiveNavTab: {
            type: Number,
            default: 0
        },
    },
    watch: {
        'tabbarActive': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                } else {
                    // 离开tab
                    // this.clearNoticeTimmer();
                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.currentTabIndex = this.statActiveNavTab || this.currentTabIndex || 0;
            this.currentTab = this.tabItems[this.currentTabIndex];
            this.getUserInfo();
            if (this.user_info.is_login) {
                // this.getMessagesPushUnread();
                // this.setNoticeIcon();
            }
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.tabItems[0].event_name);
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        onItemChange(index) {
            this.currentTab = this.tabItems[index];
            this.currentTabIndex = index;
        },
        onSliderChange(e) {
            var index = e.index;
            this.currentTab = this.tabItems[e.index];
            this.currentTabIndex = index;
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.tabItems[index].event_name);
        },
        SetTabbarActive(val) {
            this.$emit('SetTabbarActive', val)
        },
        goStareMsg(e) {
            this.$router.open({
                name: 'StareMsg',
                params: {}
            })
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        putMessagesPushRead() {
            let params = {};
            this.$fetch({
                name: 'putMessagesPushRead',
                method: 'PUT',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    
                } else {
                   this.$notice.toast({ message: resData.message });
                }

            }).catch((e) => {
                console.log(e.message);
            });
        },
        setNoticeIcon() {
            if (this.notice_timmer) {
                return;
            }
            this.notice_timmer = setInterval(() => {
                this.getMessagesPushUnread();
            }, this.timeout_ts)
        },
        clearNoticeTimmer() {
            if (this.notice_timmer) {
                clearInterval(this.notice_timmer);
                this.notice_timmer = null;
            }
        },
        getMessagesPushUnread() {
            let params = {};
            this.$fetch({
                name: 'getMessagesPushUnread',
                method: 'GET',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.unread_count = resData.unread_count;
                }
            }).catch((e) => {

            });
        },
    },
    computed: {
        tabItems () {
            let arr = []
            arr.push({
                title: this.$t('自选'),
                type: 'marketcap_coins',
                event_name: 'bzh_chosen_market_click',
            })
            if (!this.hideModule['Stare']) arr.push({
                title: this.$t('盯盘'),
                type: 'favor_coins',
                event_name: 'bzh_chosen_monitor_click',
            })
            return arr
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
@expired_color: #9B9DA4;
.container {
    background-color: @bgf4f5f6;
}

.icon {
    font-size: 45px;
    color: #333;
    font-family: iconfont2;
}

.search_box {
    flex: 1;
    justify-content: center;
}

.icon_search {
    font-size: 45px;
    font-weight: normal;
    color: #434343;
}
.notice_box {
    position: relative;
}
.circle {
    font-size: 18px;
    color: #fb6a60;
    position: absolute;
    top: -2px;
    right: -2px;
}
.icon_message{
    font-size:45px;
    color: #434343;
}
</style>
