<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="`${router_params.symbol}-${$t('知识图谱')}`" >
        </wxc-minibar>
        <div class="wrapper">
            <scroller :style="{height: tabPageHeight}">
                <web class="web_box" :style="{height: tabPageHeight}" :src="nodemap_url"></web>
            </scroller>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { Bizhihui_Url, PUBLISH_COUNTRY } from '../config/config.js'
export default {
    components: {WxcMinibar, StatusBar},
    data() {
        return {
            router_params: {},
            statusBarStyle: {
                bgColor: '#ffffff',
            },
        };
    },
    created() {

        this.init();
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            })
        },
        
    },
    computed: {
        tabPageHeight() {
            return Utils.env.getPageHeight();
        },
        nodemap_url() {
            let uri = `${Bizhihui_Url}/nodemap?word=${this.router_params.symbol}&fullscreen=1&device=app&_locale=${this.$locale()}&_country=${PUBLISH_COUNTRY}`;
            return uri;
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

</style>
