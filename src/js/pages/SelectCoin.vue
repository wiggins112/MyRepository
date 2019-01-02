<template>
    <div class="container">
        <wxc-minibar :title="$t('选币')" :useDefaultReturn="false" left-button="">
            <div slot="right" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">
                <text class="icon">&#xe915;</text>
            </div>
        </wxc-minibar>
        <div class="slider-item">
            <FastSeleCoin :Active="tabbarActive" @SetTabbarActive="SetTabbarActive" />
        </div>
    </div>
</template>
<script>

import FastSeleCoin from '../components/FastSeleCoin.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
export default {
    components: {FastSeleCoin, WxcMinibar },
    data() {
        return {
            arr: [],
            currentTabIndex: 0,
            currentTab: {},
        }
    },
    props: {
        tabbarActive: {
            type: Boolean,
            default: false,
        },
    },
    created() {
        this.init();
    },
    methods: {
        init() {
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
        SetTabbarActive(val, tab) {
            this.$emit('SetTabbarActive', val, tab)
        },
    },
    computed: {
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-size: 45px;
    color: #434343;
    font-family: iconfont2;
}
.container {}
</style>
