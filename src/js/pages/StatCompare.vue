<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="{bgColor:'#fff'}"></StatusBar>
            <wxc-minibar :title="$t('对比市场')" background-color="#fff" text-color="#434343">
            </wxc-minibar>
            <div class="box_hd">
                <div class="item">
                    <div class="pane" @click="toggleSelect('is_market')">
                        <text class="option">{{ $t('当') }}</text>
                        <div class="selected">
                            <text class="">{{ market }}</text>
                            <wxc-icon class="icon" name="more_unfold"></wxc-icon>
                        </div>
                    </div>
                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="is_market">
                        <wxc-radio :list="list" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                        <text class="radio-text">checkedItem: {{checkedInfo}}</text>
                    </scroller>
                </div>
                <div class="item">
                    <div class="pane" @click="toggleSelect('is_market')">
                        <text class="option">{{ $t('当') }}</text>
                        <div class="selected">
                            <text class="">{{ market }}</text>
                            <wxc-icon class="icon" name="more_unfold"></wxc-icon>
                        </div>
                    </div>
                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="is_market">
                        <wxc-radio :list="list" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                        <text class="radio-text">checkedItem: {{checkedInfo}}</text>
                    </scroller>
                </div>
                <div class="item">
                    <div class="pane" @click="toggleSelect('is_market')">
                        <text class="option">{{ $t('比') }}</text>
                        <div class="selected">
                            <text class="">{{ market }}</text>
                            <wxc-icon class="icon" name="more_unfold"></wxc-icon>
                        </div>
                    </div>
                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="is_market">
                        <wxc-radio :list="list" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                        <text class="radio-text">checkedItem: {{checkedInfo}}</text>
                    </scroller>
                </div>
                <div class="item">
                    <div class="pane" @click="toggleSelect('is_market')">
                        <text class="option"></text>
                        <div class="selected">
                            <text class="">{{ market }}</text>
                            <wxc-icon class="icon" name="more_unfold"></wxc-icon>
                        </div>
                    </div>
                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="is_market">
                        <wxc-radio :list="list" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                        <text class="radio-text">checkedItem: {{checkedInfo}}</text>
                    </scroller>
                </div>
                <div class="item">
                    <div class="pane">
                        <text class="option"></text>
                        <input type="text" :placeholder="$t('请输入单价')" placeholder-color="r" class="input" @change="onchange" @input="oninput" />
                    </div>
                </div>
                <div class="item">
                    <div class="pane" @click="toggleSelect('is_market')">
                        <text class="option"></text>
                        <div class="selected">
                            <text class="">{{ market }}</text>
                            <wxc-icon class="icon" name="more_unfold"></wxc-icon>
                        </div>
                    </div>
                    <scroller :class="['scroller', is_ios && 'scroller_ios']" v-if="is_market">
                        <wxc-radio :list="list" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                        <text class="radio-text">checkedItem: {{checkedInfo}}</text>
                    </scroller>
                </div>
            </div>
        </div>
        <wxc-button class="confirm" type="" :btnStyle="{backgroundColor: '#f7b237',borderRadius: 0 }" :text="$t('确定添加')" @wxcButtonClicked="wxcButtonClicked"></wxc-button>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcIcon, WxcRadio, WxcButton } from 'weex-ui';
import StatusBar from '../components/StatusBar.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
export default {
    components: {
        WxcTabBar,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        WxcRadio,
        WxcButton
    },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            PageHeight: 1334,
            list: [
                { title: this.$t('选项1'), value: 1 },
                { title: this.$t('选项2'), value: 2 },
                { title: this.$t('选项3'), value: 3 },
                { title: this.$t('选项4'), value: 4 },
            ],
            checkedInfo: { title: this.$t('选项2'), value: 2 },
            market: 'Bitfinex BTC:USDT',
            is_market: false,
        }
    },
    beforeCreate: function() {

    },
    created() {
        this.init();

    },
    methods: {
        init() {},
        wxcRadioListChecked(e) {
            this.checkedInfo = e;
            this.market = e.title;
            this.toggleSelect('is_market');
        },
        toggleSelect(is_select) {
            if (is_select === 'is_market') {
                this.is_market = !this.is_market;
            }
        },

    },
    computed: {
        tabPageHeight() {
            return Utils.env.getPageHeight();
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.box_hd {
    background-color: #fff;
    padding: 0 @padding_size;
}

.scroller {
    background-color: #ddd;
}

.pane {
    flex-direction: row;
    justify-content: space-between;
    padding: 30px 0;
    border-bottom-style: solid;
    border-bottom-color: rgba(0, 0, 0, .1);
    border-bottom-width: 1px;
}

.input {
    margin-left: 420px;
    flex: 1;
    height: 40px;
    font-size: 28px;
}

.option {
    width: 120px;
    color: #9b9da4;
    font-size: 30px;
}

.selected {
    flex-direction: row;
    align-items: center;
}

.confirm {
    width: 750px;
    position: fixed;
    bottom: 0;
}

</style>
