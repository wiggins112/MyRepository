<template>
    <div class="picker_box">
        <Dialog title="" :show="is_show_superpack_dialog" :showCloseBtn="true" dialogBoxBgColor="transparent" top="300" @wxcDialogCancelBtnClicked="closeSuperpackDialog">
            <div slot class="supe_redpack">
                <image class="supe_redpack_image" resize="cover" src="bmlocal://assets/images/tasks/super_pack_unopen.png" @click="openSuperPack"></image>
            </div>
        </Dialog>
        <Dialog title="" :show="is_show_superpackopen_dialog" :showCloseBtn="true" dialogBoxBgColor="transparent" top="200" @wxcDialogCancelBtnClicked="closeSuperpackopenDialog">
            <div slot class="supe_redpack supe_redpackopen">
                <image class="supe_redpack_image supe_redpackopen_image" resize="cover" src="bmlocal://assets/images/tasks/super_pack_open.png" @click="jumpTaskCenter"></image>
                <div class="pack_value">
                    <text class="pack_value_text">{{supe_redpack.count}}</text>
                    <text class="pack_value_unit">BZH</text>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import Dialog from './Dialog.vue'
export default {
    components: { Dialog },
    data() {
        return {
            is_show_superpack_dialog: true,
            is_show_superpackopen_dialog: false,
            supe_redpack: {},
        }
    },
    props: {
        isJumpTaskCenter: {
            type: Boolean,
            default: true,
        },
    },
    created() {
    },
    methods: {
        //非状态组件，需要在这里关闭
        closePacket(e) {
            this.$emit('closePacket', e)
        },
        confirm(type) {
            this.closePacket();
            this.$emit('packetClick', type)
        },
        closeSuperpackDialog() { //点击红包，又不领取，然后关闭，这种情况下关闭也相当静默领取
            this.is_show_superpack_dialog = false;
            // this.closePacket();
            this.postUserTokenFalseDialog();
        },
        closeSuperpackopenDialog() {
            this.closePacket();
            this.is_show_superpackopen_dialog = false;
        },
        openSuperPack() {
            this.postUserTokenDailyRedpacket();
        },
        jumpTaskCenter() {
            if (this.isJumpTaskCenter) {
                this.closeSuperpackopenDialog();
                this.$router.open({
                    name: 'TaskCenter',
                    statusBarStyle: 'LightContent',
                    type: 'PUSH',
                    params: {}
                })
            } else {
                this.closeSuperpackopenDialog();
            }
        },
        postUserTokenDailyRedpacket() {
            let params = {};
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUserTokenDailyRedpacket',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    if (resData.result.result) {
                        this.supe_redpack = resData.result;
                        this.is_show_superpackopen_dialog = true;
                        this.is_show_superpack_dialog = false;
                    } else {
                        this.$notice.alert({
                            title: this.$t('提示'),
                            message: resData.result.message,
                            okTitle: this.$t('确认'),
                            callback: () => {
                                this.closeSuperpackDialog();
                            }
                        })
                    }
                } else {
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback: () => {
                            this.closeSuperpackDialog();
                        }
                    })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
        postUserTokenFalseDialog() {
            let params = {};
            this.$fetch({
                name: 'postUserTokenDailyRedpacket',
                method: 'POST',
                data: params
            }).then(async resData => {
            }).catch((e) => {
            });
        },
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

.supe_redpack {
    position: relative;
    flex-direction: column;
    height: 740px;
    border-radius: 12px;
}

.supe_redpack_image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    flex: 1;
    height: 740px;
}

.supe_redpackopen {
    height: 1.116*773px;
}

.supe_redpackopen_image {
    height: 1.116*773px;
}

.pack_value {
    position: absolute;
    top: 440px;
    left: 0;
    right: 0;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.pack_value_text {
    text-align: center;
    font-size: 80px;
    color: #fff;
    font-weight: bold;
}

.pack_value_unit {
    padding-top: 15px;
    padding-left: 15px;
    text-align: center;
    font-size: 50px;
    color: #fff;
    font-weight: bold;
}

</style>
