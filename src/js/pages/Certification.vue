<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('实名认证')" >
            </wxc-minibar>
            <div class="box_bd">
                <div class="input_box">
                    <text class="label_text">{{ $t('姓名') }}</text>
                    <input type="text" class="input password" :placeholder="$t('请输入您的真实姓名')" :autofocus="true" v-model="form.name" />
                </div>
                <div class="input_box">
                    <text class="label_text">{{ $t('身份证号码') }}</text>
                    <input type="text" class="input password" :placeholder="$t('请输入您的身份证号码')" v-model="form.idcard" />
                </div>
                <wxc-button class="confirm" :text="$t('认证')" @wxcButtonClicked="confirm"></wxc-button>
            </div>
            <div class="box_ft">
            </div>
            <Dialog :title="$t('实名认证失败！')" titleColor="#F75B37" :content="error_msg" :show="erro_dialog_show" @wxcDialogConfirmBtnClicked="erroDialogConfirmClicked" :single="true">
            </Dialog>
            <Dialog :title="$t('实名认证成功！')" titleColor="#F7B237" :content="`请点击确认返回继续操作。`" :show="succeed_dialog_show" @wxcDialogConfirmBtnClicked="succeedDialogConfirmClicked" :single="true">
            </Dialog>
        </div>
    </div>
</template>
<script>
import { wxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Dialog from '../components/Dialog.vue'

export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        Dialog
    },
    data() {
        return {
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            form: {
                name: '',
                idcard: ''
            },
            erro_dialog_show: false,
            succeed_dialog_show: false,
            error_msg: '',
        };
    },
    beforeCreate() {

    },
    created() {
        this.init();
    },
    methods: {
        init() {
        },
        confirm() {
            this.putUserIdcard();
        },
        erroDialogConfirmClicked() {
            this.erro_dialog_show = false;
        },
        succeedDialogConfirmClicked() {
            this.$router.back();
        },
        putUserIdcard() {
            let params = {};
            params.name = this.form.name;
            params.idcard = this.form.idcard;
            if (!params.name) {
                this.$notice.toast({ message: this.$t('请输入您的姓名') });
                return;
            }
            if (!params.idcard) {
                this.$notice.toast({ message: this.$t('请输入您的身份证号码') });
                return;
            }
            this.$notice.loading.show();
            this.$fetch({
                name: 'putUserIdcard',
                method: 'PUT',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.succeed_dialog_show = true;
                } else {
                    this.erro_dialog_show = true;
                    this.error_msg = resData.message;
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
    },
    computed: {
        
    },
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

.box_bd {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 50px;
}
.input_box {
    margin-bottom: 60px;
}
.input {
    width: 650px;
    height: 90px;
    border-bottom-color: rgba(0, 0, 0, .1);
    border-bottom-style: solid;
    border-bottom-width: 1px;
}

.phone {}

.password {}

.confirm {
    margin-top: 40px;
    width: 650px;
    background-color: @main_color;
    border-radius: 80px;
    background-image: linear-gradient(to right, #fab235, #ffd74b);
}
.body {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.succeed_icon {
    width: 176px;
    height: 176px;
    border-radius: 12px;
}
.succeed_text {
    padding-top: 22px;
    padding-bottom: 30px;
    font-size: 36px;
    color: #2F83E5;
}
.tips_text {
    line-height: 60px;
    font-size: 30px;
}
</style>
