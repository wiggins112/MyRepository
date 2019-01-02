<template>
    <div :class="['coin_info_box', box_width]">
        <div class="coin_logo">
            <image class="logo_image" resize="cover" :src="coin.icon || default_coin_icon"/>
        </div>
        <div class="coin_text">
            <text class="text coin_symbol" :style="{fontSize: symbol_size}">{{coin.symbol}}</text>
            <text class="text coin_name" :style="{fontSize: name_size}">{{$locale() === 'zh-CN' ? (coin.cn || coin.name) : coin.name}}</text>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
        }
    },
    props: {
        coin: {
            type: Object,
            required: true,
        },
        box_width: {
            type: String,
            default: ''
        },
        symbol_size: {
            type: Number,
            default: 32
        },
        name_size: {
            type: Number,
            default: 22
        },
    },
    created() {

    },
    methods: {
        
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}
.text {
}
.coin_info_box {
    flex-direction: row;
    align-items: center;
}
.coin_logo {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border-width: 1px;
    border-color: #eee;
}
.coin_text {
    flex: 1;
    padding-left: 20px;
    padding-right: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.logo_image {
    width: 34px;
    height: 34px;
}
.coin_symbol {
    font-weight: bold;
    padding-bottom: 5px;
}
.coin_name {
    color: #9B9DA4;
    text-overflow: ellipsis;
    flex: 1;
    lines: 1;
    font-weight: bold;
}
.w200 {
    width: 200px;
}
.w260 {
    width: 260px;
}
</style>
