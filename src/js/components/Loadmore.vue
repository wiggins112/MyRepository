<template>
    <div class="loadmore_wrap" :style="{backgroundColor:bgcolor}">
        <div class="loading_box" v-if="loading === 'loading' && gif">
            <image class="loading_gif" resize="contain" :src="loading_gif"/>
        </div>
        <div class="box nomore_box" v-if="loading === 'nomore'"><text class="text">{{$t(nomore)}}</text></div>
        <div class="box empty_box" v-if="loading === 'empty' && (!blankpagetype)"><text class="text">{{$t(empty)}}</text></div>
        <div class="box error_box" v-if="loading === 'neterror'"><text class="text">{{ $t('加载失败') }}，{{ $t('请刷新重试') }}</text></div>
        <div class="box error_box" v-if="loading === 'error'"><text class="text">{{ $t('加载出错了') }}</text></div>
        <div class="box error_box" v-if="loading === 'need_login' && (!blankpagetype)"><text class="text">{{ $t('登录获取数据') }}</text></div>
        <div class="box noloadmore" v-if="loading === 'noloadmore'"></div>
        <!-- 处理空白页类型 -->
        <div class="box padding40" v-if="blankpagetype === 'text'" > <text class="text">{{$t('暂未收录')}}</text></div>
        <div class="box padding80" v-if="blankpagetype === 'changetext'" > <text class="text">{{$t('暂无该异动数据')}}</text></div>
        <!-- 没有登录 提示词 -->
        <div class="box padding80" v-if="loading === 'need_login' &&  blankpagetype === 'icontext'" > 
            <image class="blankiconw200" :src="iconsrc"/>
            <text class="text blanktextw200">{{ $t('登录获取数据') }}</text>
        </div>
        <!-- 登录了但是没有数据 提示词 -->
        <div :class="['box', bigicon ? 'padding120' : 'padding80']" v-if="loading === 'empty' &&  blankpagetype === 'icontext'" > 
            <image class="arrow" v-if="hasarrow" :src="arrow" />
            <image :class="[bigicon ? 'blankiconw270' : 'blankiconw200']" :src="iconsrc"/>
            <text :class="['text', bigicon ? 'blanktextw270' : 'blanktextw200']" >{{$t(empty)}}</text>
        </div>
    </div>
</template>
<style scoped lang="less">
@import url('../css/veriable.less');
.loadmore_wrap {
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.box {
    padding-top: 20px;
    padding-bottom: 20px;
    align-items: center;
    justify-content: center;
}
.indicator {
    margin-top: 16px;
    height: 40px;
    width: 40px;
    color: @main_color;
}
.text {
    font-size: 24px;
    color: #666;
}
.loading_gif {
    width: 120px;
    height: 120px;
}
.padding80 {
    padding-top: 20 * 4px;
    padding-bottom: 20 * 4px;
}
.padding40 {
    padding-top: 20 * 2px;
    padding-bottom: 20 * 2px;
}
.padding120 {
    padding-top: 20 * 6px;
    padding-bottom: 20 * 6px;
}
.blankiconw200 {
    width: 200px;
    height: 200px;
}
.blanktextw200 {
    width: 200px;
    text-align: center;
}
.blankiconw270 {
    width: 270px;
    height: 270px;
}
.blanktextw270 {
    width: 650px;
    text-align: center;
    margin-top: 20px;
}
.arrow {
    position: absolute;
    right: 0;
    top: 22px;
    width: 200px;
    height: 217px;
}
</style>
<script>
export default {
    props: {
        loading: {
            type: String,
            default: 'loading',
        },
        empty: {
            type: String,
            default: '暂未收录',
        },
        nomore: {
            type: String,
            default: '没有更多了',
        },
        gif: {
            type: Boolean,
            default: true
        },
        blankpagetype: {
            type: String,
            default: ''
        },
        bgcolor: {
            type: String,
            default: 'transparent'
        },
        iconsrc: {
            type: String,
            default: 'bmlocal://assets/images/blankpage/icontext.png'
        },
        hasarrow: {
            type: Boolean,
            default: false
        },
        bigicon: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loading_gif: `bmlocal://assets/images/loading/loading_v2.gif`,
            arrow: 'bmlocal://assets/images/blankpage/arrow.png',
        }
    },
    methods: {
        
    }
}

</script>
