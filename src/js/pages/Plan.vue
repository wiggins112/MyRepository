<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
            <wxc-minibar :title="$t('监控套餐')" >
            </wxc-minibar>
            <list>
                <Refresher @refresh="refresh" :loading="loading.plans_list"></Refresher>
                <cell>
                    <div class="box_bd">
                        <div class="head" v-if="user_plan.title">
                            <div class="top">
                                <text>{{ $t('当前使用套餐') }}：</text>
                                <text class="desc">{{user_plan.title}}</text>
                            </div>
                            <text class="time">{{ $t('该套餐将于') }}{{user_plan.expire_at_str}}{{ $t('过期') }}</text>
                        </div>
                        <div class="body">
                            <div class="items">
                                <div :class="['item', plans.active && 'item_active' ]" v-for="plans in plans_list" @click="selectedPlan(plans)">
                                    <image v-if="plans.active" src="bmlocal://assets/images/bt_choose.png" class="img_choose"></image>
                                    <text :class="['line_title', plans.active && 'text_active' ]">{{plans.title}}</text>
                                    <text :class="[`line${index+1}`,  plans.active && 'text_active']" v-for="(des, index) in plans.descs">{{des}}</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </cell>
            </list>
            <Dialog title="" :content="message_text" :show="dialog_show" :single="false" @wxcDialogCancelBtnClicked="DialogCancelClicked" @wxcDialogConfirmBtnClicked="DialogConfirmClicked">
            </Dialog>
        </div>
    </div>
</template>
<script>

import { WxcTabBar, Utils, WxcButton, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import filters from '../config/filters.js'

export default {
    components: {
        WxcTabBar,
        WxcButton,
        StatusBar,
        WxcIcon,
        WxcMinibar,
        Refresher,
        Dialog

    },
    data() {
        return {
            filters,
            plans_list: [],
            user_plan: {},
            selected_plan: {},
            message_text: '',
            dialog_show: false,
            loading: {
                plans_list: 'loading'
            }
        };
    },
    beforeCreate: function() {

    },
    created() {
        
        this.init();
    },
    methods: {
        init() {
            this.getUserPlansList();
        },
        refresh() {
            this.getUserPlans();
        },
        getUserPlansList() {
            this.getUserPlan().then((response) => {
                this.getUserPlans();
            })
        },
        selectedPlan(plans) {
            for (let item of this.plans_list) {
                item.active = false;
            }
            plans.active = true;
            this.selected_plan = plans;
            if (this.user_plan.plan_id && this.user_plan.plan_id !== this.selected_plan._id) {
                this.message_text = `更换套餐将扣取${this.selected_plan.amount}${this.selected_plan.currency}`;
            } else {
                this.message_text = `该套餐将扣取${this.selected_plan.amount}${this.selected_plan.currency}`;
            }
            this.showConfirm();
        },
        DialogCancelClicked() {
            this.dialog_show = false;
        },
        DialogConfirmClicked() {
            this.dialog_show = false;
            this.postUserPlan();
        },
        showConfirm() {
            this.dialog_show = true;
        },
        getUserPlans() {
            let params = {};
            this.loading.plans_list = 'loading';
            this.$fetch({
                name: 'getUserPlans',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.plans_list = 'loaded';
                    for (let item of resData.items) {
                        if (item._id === this.user_plan.plan_id) {
                            item.active = true;
                        } else {
                            item.active = false;
                        }
                    }
                    this.plans_list = resData.items;
                } else {
                    this.loading.plans_list = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.plans_list = 'error';
                console.log(e.message);
            });
        },
        getUserPlan() {
            let params = {};
            return this.$fetch({
                name: 'getUserPlan',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    resData.result.expire_at_str = this.filters.dateFormat(resData.result.expire_at, 'yyyy-MM-dd hh:mm');
                    this.selected_plan = this.user_plan;
                    this.selected_plan._id = this.user_plan.plan_id;
                    this.user_plan = resData.result;

                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        postUserPlan() {
            let id = this.selected_plan._id;
            if (!id) {
                this.$notice.toast({ message: this.$t('请先选一个套餐') });
                return;
            }
            let params = {};
            params.plan_id = id;
            this.$fetch({
                name: 'postUserPlan',
                method: 'POST',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.getUserPlan();
                    this.$notice.toast({ message: this.$t('设置成功') });
                    this.$router.back();
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        }
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
    height: 90px;
    font-size: 34px;
    justify-content: center;
    align-items: center;
    border-style: solid;
    border-width: 1px;
    border-color: rgba(0, 0, 0, .1);
}

.back {
    position: absolute;
    font-size: 67px;
    bottom: 15px;
}

.box_bd {
    background-color: #fff;
    margin-top: 40px;
}

.head {
    justify-content: center;
    align-items: center;
}

.top {
    flex-direction: row;
    margin: 20px 0;
}

.desc {
    color: @main_color;
    font-weight: bold;
}

.time {
    color: #aaa;
}

.body {
    align-items: center;
    margin-top: 40px;
}

.items {
    width: 750px;
    margin-top: 10px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
}

.item {
    width: 320px;
    height: 220px;
    margin: 20px;
    border-radius: 13px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: @bgf4f5f6;
}

.item_active {
    border-style: solid;
    border-width: 2px;
    border-color: @main_color;
    background-color: #fff;
}

.line_title {
    font-size: 32px;
}

.line1 {
    padding-top: 10px;
    font-size: 28px;
}

.line2 {
    padding-top: 10px;
    font-size: 24px;
}
.line3 {
    padding-top: 5px;
    font-size: 24px;
}
.text_active {
    color: @main_color;
}
.img_choose {
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    height: 30px;
}
</style>
