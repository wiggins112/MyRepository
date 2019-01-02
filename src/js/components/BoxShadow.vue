<template>
    <div class="box_shadow">
        <slot class="solt_box">
        </slot>
        <image class="shadow_image_top" resize="stretch" :src="shadow_image"></image>
        <image class="shadow_image_bottom" resize="stretch" :src="shadow_image"></image>
        <image class="shadow_image_right" resize="stretch" :src="box_shadow_vertical"></image>
        <image class="shadow_image_left" resize="stretch" :src="box_shadow_vertical"></image>
    </div>
</template>
<script>
export default {
    data() {
        return {
            shadow_image: `bmlocal://assets/images/common/box_shadow.png`,
            box_shadow_vertical: `bmlocal://assets/images/common/box_shadow_vertical.png`,
        }
    },
    props: {
        // 分值
        value: {
            type: Number,
            default: 0
        },
    },
    created() {
    },
    methods: {
        
    },
    computed: {
        
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}
.box_shadow {
    position: relative;
    flex-direction: column;
}
.shadow_image_left {
    margin-top: 22px;
    margin-bottom: 22px;
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 22px;
    transform: rotate(180deg);
}
.shadow_image_right {
    margin-top: 22px;
    margin-bottom: 22px;
    flex: 1;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 22px;
}
.shadow_image_bottom {
    flex: 1;
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    height: 22px;
}
.shadow_image_top {
    flex: 1;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    height: 22px;
    transform: rotate(180deg);
}
.solt_box {
    flex: 1;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}
</style>
