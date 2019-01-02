<template>
    <div class="picker_box" v-if="!hideModule['TaskCenter']">
        <Dialog title="" :show="is_show_dialog" :showCloseBtn="true" dialogBoxBgColor="transparent" top="300" @wxcDialogCancelBtnClicked="closeSuperDialog">
            <div slot class="supe_redpack supe_redpackopen">
                <image class="supe_redpack_image supe_redpackopen_image" resize="cover" src="bmlocal://assets/images/tasks/task_done.png" @click="jumpTaskCenter"></image>
                <div class="pack_value">
                    <text class="pack_value_text">{{bzh}}</text>
                    <text class="pack_value_unit">BZH</text>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import Dialog from './Dialog.vue'
import common from '../config/common.js'
import filters from '../config/filters.js'
export default {
    components: { Dialog },
    data() {
        return {
            is_show_dialog: false,
            show_redpacket: false,
        }
    },
    props: {
        isJumpTaskCenter: {
            type: Boolean,
            default: true,
        },
        task: {
            type: String,
            require: true,
        }
    },
    watch: {
        task() {
            this.getUserTokenDailyStat();
        }
    },
    created() {
        this.init();
    },
    methods: {
        init(){
            this.getUserTokenDailyStat();
        },
        //非状态组件，需要在这里关闭
        closeDialog(e) {
            this.$emit('closeDialog', e)
        },
        closeSuperDialog() {
            this.closeDialog();
            this.is_show_dialog = false;
        },
        jumpTaskCenter() {
            if (this.isJumpTaskCenter) {
                this.closeSuperDialog();
                this.$router.open({
                    name: 'TaskCenter',
                    statusBarStyle: 'LightContent',
                    type: 'PUSH',
                    params: {}
                })
            } else {
                this.closeSuperDialog();
            }
        },
        getUserTokenDailyStat() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenDailyStat',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    // 可以领取红包，且没有领取过
                    if (resData.result[this.task]) {
                        let task_dialogs = this.$storage.getSync(common.StorageKey.task_dialogs) || {};
                        let today_date = filters.dateFormat(Date.now()/1000, 'yyyy-MM-dd');
                        if (!task_dialogs[today_date] || !task_dialogs[today_date][this.task]) {
                            task_dialogs[today_date] = task_dialogs[today_date] || {};
                            task_dialogs[today_date][this.task] = true;
                            this.$storage.setSync(common.StorageKey.task_dialogs, task_dialogs);
                            this.is_show_dialog = true;
                        }
                        
                    }
                }
            }).catch((e) => {
                this.$notice.toast({ message: e.message, duration: 500 })
            });
        },
    },
    computed: {
        bzh() {
            return {
                done_daily_coin: '50',
                done_daily_vote: '20',
                done_daily_read: '20',
                done_daily_invite: '600',
                done_daily_share: '50',
            }[this.task]
        },
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
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
    height: 1.116*592px;
}

.supe_redpackopen_image {
    height: 1.116*592px;
}

.pack_value {
    position: absolute;
    top: 340px;
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
    color: #434343;
    font-weight: bold;
}

.pack_value_unit {
    padding-top: 15px;
    padding-left: 15px;
    text-align: center;
    font-size: 50px;
    color: #434343;
    font-weight: bold;
}

</style>
