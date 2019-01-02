<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('手机收不到验证码')">
            </wxc-minibar>
            <div class="box_hd">
                <div class="title">
                    <text class="text">{{ $t('可能原因') }}：</text>
                </div>
                <div class="qa_box">
                    <text class="text qa_text">{{ $t('1. 请检查您的手机号是否处于欠费或停机状态') }}；</text>
                    <text class="text qa_text">{{ $t('2. 请检查您的手机是否设置拦截验证信息') }}；</text>
                    <text class="text qa_text">{{ $t('3. 请检查您的手机短信息存储空间是否满了。') }}</text>
                </div>
                <div class="qa_box">
                    <div class="login">
                        <text class="text qa_text">{{ $t('若不属于以上原因') }}，</text>
                        <div class="less_row">
                            <text class="text qa_text">{{ $t('您可使用') }}</text>
                            <text class="text colorf7b qa_text line_text" @click="jumpLogin">{{ $t('密码登录') }}。</text>
                        </div>
                    </div>
                    <div class="login">
                        <text class="text text_center">{{ $t('若您忘记密码，或之前未设置过登录密码，') }}</text>
                        <div class="less_center">
                            <text class="text qa_text">{{ $t('则可前往') }}</text>
                            <text class="text colorf7b qa_text line_text" @click="jumpForgetPassword">{{ $t('重设密码') }}。</text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'

export default {
    components: {
        StatusBar,
        WxcMinibar,
    },
    data() {
        return {
            statusBarStyle: {
                bgColor: '#ffffff',
            },
        };
    },
    created() {
        this.init();
    },
    eros: {
        beforeDisappear() {}
    },
    methods: {
        init() {

        },
        jumpForgetPassword() {
            this.$router.open({
                name: 'ForgetPassword',
            })
        },
        jumpLogin() {
            // 设置返回传参数
            this.$router.setBackParams({
                name: 'login_qa'
            });
            this.$router.back();
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
}

.box_hd {
    padding: 2 * @padding_size;
}

.title {
    padding-bottom: 15px;
}

.qa_text {
    line-height: 50px;
}

.text_center {
    text-align: center;
}

.line_text {
    text-decoration: underline
}

.login {
    padding-top: 45px;
}

</style>
