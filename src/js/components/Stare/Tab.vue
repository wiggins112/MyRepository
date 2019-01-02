<template>
    <wxc-minibar background-color="#fff" @wxcMinibarLeftButtonClicked="minibarLeftButtonClick">
        <div slot="middle" class="box">
            <div v-for="(i, index) in tabTitles" :key="i" class="tabTitle"
            :style="{paddingLeft: index === 0 ? '0': paddingInner + 'px'}"
            @click="toggle(i, index)">
                <text class="tabTitle-span">{{i}}</text>
                <div :class="[index === activeIndex ? 'active-bar' : 'bar']"></div>
            </div>
        </div>
    </wxc-minibar>
</template>

<script>
import { WxcMinibar } from 'weex-ui';
export default {
    name: '',
    components: {
        WxcMinibar
    },
    data () {
        return {
        }
    },
    props: ['tabTitles', 'activeIndex', 'paddingInner'],
    methods: {
        toggle (i, index) {
            this.$emit('switch', i, index)
        },
        minibarLeftButtonClick () {
            this.$emit('barLeftButtonClick')
        }
    }
}
</script>

<style scoped lang="less">
@import url('../../css/veriable.less');
@import url('../../css/base.scss');

.box {
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    height: 90px;
}
.tabTitle {
    flex: 1; 
    justify-content: space-around;
    align-items: center;
    margin-bottom: -10px;
}
.tabTitle-span {
    font-size: 34px;
    font-weight: bold;
    color: #434343;
}
.bar, .active-bar {
    margin-top: 10px;
    width: 40px;
    height: 4px;
    border-radius: 2px;
}
.bar {
    background-color: transparent;
}
.active-bar {
    background-color: @main_color;
}
</style>
