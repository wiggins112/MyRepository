<template>
    <div class="status_bar" :style="{'height': statusBarHeight, backgroundColor: realStatusBarStyle.bgColor, backgroundImage: backgroundImage}"></div>
</template>
<style scoped lang="less">
@import url('../css/veriable.less');

.status_bar {
    background-color: #ffffff;
}

</style>
<script>
export default {
    data() {
        return {
            statusBarHeight: weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40,
            defaultStyle: {
                bgColor: '#ffffff',
            }
        }
    },
    props: {
        statusBarStyle: {
            type: Object,
            default: () => ({})
        },
        backgroundImage: {
            type: String,
            default: ''
        },
    },
    methods: {

    },
    computed: {
        realStatusBarStyle() {
            let Style = Object.assign(this.defaultStyle, this.statusBarStyle);
            return Style;
        },
    }
}

</script>
