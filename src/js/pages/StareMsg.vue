<template>
    <div class="container">
        <StatusBar :statusBarStyle="{bgColor:'#fff'}"></StatusBar>
        <wxc-minibar :title="$t('我的盯盘')">
            <text style="color: #434343;font-size: 34px;" slot="right" @click="goSearchCoin()">{{ $t('添加') }}</text>
        </wxc-minibar>
        <!-- 我的盯盘页面 -->
        <MyStare ref="myStare" />
    </div>
</template>

<script>
import StatusBar from '../components/StatusBar.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import MyStare from '../components/Stare/MyStare.vue'
import { BzhCell } from '../../bzh-ui/index.js'
export default {
    name: '',
    components: {
        StatusBar,
        WxcMinibar,
        MyStare,
        BzhCell
    },
    data () {
        return {
        }
    },
    computed: {
    },
    mounted () {
    },
    methods: {
        goSearchCoin () {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        },
    },
    filters: {
    }
}
</script>

<style scoped lang="less">

@cell_border_color: #E7EAF1;
.scroller {
    position: relative;
}

.scroller, .cell-border {
    border-top-style: solid;
    border-top-width: 1px;
    border-color: @cell_border_color;
}
</style>
