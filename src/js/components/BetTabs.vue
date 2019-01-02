<template>
    <div class="container">
        <div class="header">
            <div class="header_tab" v-for="(tab, index) in tabItems" @click="onItemChange(index)">
                <div :class="['tab_line', `tab_line_index${index}`]" v-if="currentTabIndex === index"></div>
                <text class="tab_title">{{tab}}</text>
            </div>
        </div>
        <slider class="slider" :scrollable="!is_ios" @change="onSliderChange" :index="currentTabIndex" infinite="false">
            <div class="slider-item">
                <BetMessageBoard v-if="currentTabIndex === 0" :is_loadmore="is_loadmore" @Loadmored="Loadmored" />
            </div>
            <div class="slider-item">
                <BetGuessList v-if="currentTabIndex === 1" :is_loadmore="is_loadmore" @Loadmored="Loadmored" />
            </div>
        </slider>
    </div>
</template>
<script>
import BetMessageBoard from './BetMessageBoard.vue'
import BetGuessList from './BetGuessList.vue'
export default {
    components: {
        BetMessageBoard,
        BetGuessList
    },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            tabStyles: {
                height: 96,
                background: '#ffffff',
                selectedBackground: '#ffffff',
                titleSize: 28,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#F7B237',
            },
            currentTabIndex: 0,
            currentTab: {},
            tabItems: [this.$t('留言'),this.$t('更多竞猜')],
            unread_count: 0,
            timeout_ts: 1000 * 6,
            notice_timmer: null,
        }
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
    },
    created() {

    },
    methods: {
        init() {

        },
        onItemChange(index) {
            this.currentTab = this.tabItems[index];
            this.currentTabIndex = index;
        },
        onSliderChange(e) {
            var index = e.index;
            this.currentTab = this.tabItems[e.index];
            this.currentTabIndex = index;
        },
        Loadmored() {
            this.$emit('Loadmored');
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
@expired_color: #9B9DA4;
.container {
    background-color: @bgf4f5f6;
}
.slider-item {
    width: 750px;
    min-height: 300px;
    padding-bottom: 170px;
}
.icon {
    font-size: 45px;
    color: #333;
    font-family: iconfont2;
}

.header {
    position: relative;
    padding-right: 40px;
    width: 750px;
    height: @header_tabbar_height;
    background-color: #ffffff;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
    margin:20px 0;
}

.header_tab {
    position: relative;
    flex: 2;
    height: @header_tabbar_height;
    justify-content: center;
}

.tab_line {
    position: absolute;
    bottom: 0;
    left: 139%;
    width: 80px;
    height: 7px;
    background-color: #F7B237;
}
.tab_title {
    text-align: center;
    font-size:32px;
    color: #434343;
    font-weight: bold;
}
</style>
