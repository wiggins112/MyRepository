<template>
    <div class="container">
        <wxc-minibar :title="$t('行情')" :useDefaultReturn="false" left-button="" leftWidth="100px" rightWidth="100px">
            <div slot="right" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">
                <text class="icon">&#xe915;</text>
            </div>
            <div class="middle" slot="middle">
                <bui-tabbar style="width: 520px;" :itemStyle="{paddingRight: '25px', paddingLeft: '25px'}" :tabItems="tabItems" @change="onItemChange" v-model="currentTabIndex" :background="tabStyles.background" :selectedBackground="tabStyles.selectedBackground"  :height="tabStyles.height"></bui-tabbar>
            </div>
        </wxc-minibar>
        <slider class="slider" @change="onSliderChange" :index="currentTabIndex" infinite="false">
            <div class="slider-item">
                <CoinData :Active="tabbarActive && currentTabIndex === 0" />
            </div>
            <div class="slider-item">
                <CoinDataMarket :Active="tabbarActive && currentTabIndex === 1" />
            </div>
            <div class="slider-item">
                <CoinDataChange :Active="tabbarActive && currentTabIndex === 2" />
            </div>
        </slider>
    </div>
</template>
<script>
import { Utils } from 'weex-ui'
import WxcMinibar from '../components/WxcMinibar.vue'
import CoinData from '../components/CoinData.vue'
import CoinDataChange from '../components/CoinDataChange.vue'
import CoinDataMarket from '../components/CoinDataMarket.vue'
import BuiTabbar from '../components/BuiTabbar.vue'
import common from '../config/common';
export default {
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
            tabItems: [{
                title: this.$t('行情'),
                type: 'marketcap_coins'
            }, {
                title: this.$t('大盘'),
                type: 'marketcap_coins'
            }, {
                title: this.$t('异动'),
                type: 'marketcap_coins'
            }],
            user_info: {},
        }
    },
    created() {

    },
    eros: {
        beforeBackAppear(params, options) {
            this.getUserInfo();
        },
    },
    props: {
        tabbarActive: {
            type: Boolean,
            default: false,
        },
        coinActiveNavTab: {
            type: Number,
            default: 0
        },
    },
    watch: {
        'tabbarActive': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.currentTabIndex = this.coinActiveNavTab || this.currentTabIndex;
            this.currentTab = this.tabItems[this.currentTabIndex];
            this.getUserInfo();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_market_click');
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
            this.addUmengCount(index);
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        addUmengCount(index) {
            if(index === 0 ){
                // 友盟统计-自定义事件计数
                common.addUmengClickEvent('bzh_market_click');
            }
            if(index === 1 ){
                // 友盟统计-自定义事件计数
                common.addUmengClickEvent('bzh_market_all');
            }
            if(index === 2 ){
                // 友盟统计-自定义事件计数
                common.addUmengClickEvent('bzh_market_diff');
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
    },
    components: {
        WxcMinibar,
        CoinData,
        CoinDataChange,
        CoinDataMarket,
        BuiTabbar
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {
    width: 750px;
}

.icon {
    font-size: 45px;
    color: #434343;
    font-family: iconfont2;
}

.icon_search {
    padding-left: @padding_size;
    font-size: 45px;
    font-weight: normal;
    color: #434343;
}
.middle {
    flex-direction: row;
    align-items: center;
}
</style>
