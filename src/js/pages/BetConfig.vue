<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('活动规则')">
        </wxc-minibar>

        <scroller class="config_bd" :style="{height:page_height}">
            <web :style="{height:page_height}" class="w100" :src="`${API_BaseUrl}/api/config?type=app_config&key=bet_rule`"></web>
        </scroller>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { API_BaseUrl } from '../config/config.js'
export default {
    components: {
        WxcMinibar,
        StatusBar,
    },
    data() {
        return {
            API_BaseUrl,
            messages: '',
        };
    },
    created() {
    },
    methods: {
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.config_bd {
    width: 750px;
}
.w100 {
    width: 750px;
}
</style>
