<template>
    <div class="container">
        <StatusBar></StatusBar>
        <wxc-minibar :title="$t('监控规则')">
        </wxc-minibar>
        <list class="items" :style="{height: page_height + 'px'}">
            <Refresher class="refresh" @refresh="refreshUserRules" :loading="loading.rule_list"></Refresher>
            <cell v-for="rule in rule_list" @click="handleClickRule(rule)">
                <div class="item" v-if="rule.type === 'single' || rule.type === '均价'">
                    <div class="head">
                        <div class="title">
                            <text :class="['tag', `status_tag_${rule.class_name}`]">{{ $t('行情') }}</text>
                            <text :class="['desc', `text_${rule.class_name}`]" v-if="rule.type === 'single'">{{rule.pair_symbol}}:{{rule.pair_base}}（{{rule.platform}}）</text>
                            <text :class="['desc', `text_${rule.class_name}`]" v-if="rule.type === '均价'">{{rule.pair_symbol}}（{{rule.platform}}）</text>
                        </div>
                        <div class="edit">
                            <text class="icon edit_icon" v-if="rule.state !== 'local'" @click="editRule(rule)">&#xe91e;</text>
                            <text class="icon delete_icon" @click="deleteRule(rule)">&#xe91b;</text>
                        </div>
                    </div>
                    <div class="body">
                        <text :class="['desc_sort', `text_${rule.class_name}`]">{{rule.signal}} </text>
                        <text :class="['body_text', `text_${rule.class_name}`]" v-if="rule.less_than">{{char_lt}} {{rule.less_than}} {{rule.units}}</text>
                        <text :class="['body_text', `text_${rule.class_name}`]" v-if="rule.less_than && rule.more_than"> {{ $t('或') }} </text>
                        <text :class="['body_text', `text_${rule.class_name}`]" v-if="rule.more_than">{{char_gte}} {{rule.more_than}} {{rule.units}}</text>
                    </div>
                    <div class="foot">
                        <text class="time">{{rule.updated_at_str}}</text>
                        <text :class="['status', `status_text_${rule.class_name}`]">{{rule.state_text}}</text>
                    </div>
                    <image class="overdue_image" resize="cover" :src="overdue" v-if="rule.state === 'sended' || rule.state === 'expired'"></image>
                </div>
                <div class="item" v-if="rule.type === 'compare'">
                    <div class="head">
                        <div class="title">
                            <text :class="['tag', `status_tag_${rule.class_name}`]">{{ $t('行情') }}</text>
                            <text :class="['desc', `status_text_${rule.class_name}`]">{{ $t('当') }} {{rule.pair1.platform}} {{rule.pair1.pair_symbol}}:{{rule.pair1.pair_base}}</text>
                        </div>
                        <div class="edit">
                            <text class="icon edit_icon">&#xe91e;</text>
                            <text class="icon delete_icon" @click="deleteRule(rule)">&#xe91b;</text>
                        </div>
                    </div>
                    <div class="body">
                        <text :class="['desc_sort', `status_text_${rule.class_name}`]"> {{rule.signal1}}</text>
                        <text :class="['body_text', `status_text_${rule.class_name}`]">{{ $t('比') }} </text>
                        <text :class="['body_text', `status_text_${rule.class_name}`]">{{rule.pair2.platform}} {{rule.pair2.pair_symbol}}:{{rule.pair2.pair_base}} - {{rule.signal2}} {{rule.condition}} {{rule.value}} {{rule.unit}}</text>
                    </div>
                    <div class="foot">
                        <text class="time">{{rule.updated_at_str}}</text>
                        <text :class="['status', `status_text_${rule.class_name}`]">{{rule.state_text}}</text>
                    </div>
                    <image class="overdue_image" resize="cover" :src="overdue" v-if="rule.state === 'sended' || rule.state === 'expired'"></image>
                </div>
                <div class="item" v-if="rule.type === 'event' && rule.notice">
                    <div class="head">
                        <div class="title">
                            <text :class="['tag', `status_tag_${rule.class_name}`, 'notice_event']">{{ $t('公告') }}</text>
                            <text :class="['desc', `text_${rule.class_name}`]"> {{rule.pair_symbol}} {{ $t('公告监控') }}</text>
                        </div>
                        <div class="edit">
                            <text class="icon delete_icon" @click="deleteRule(rule, 'notice')">&#xe91b;</text>
                        </div>
                    </div>
                    <div class="foot">
                        <text class="time">{{rule.updated_at_str}}</text>
                        <text :class="['status', `status_text_${rule.class_name}`]">{{rule.state_text}}</text>
                    </div>
                    <image class="overdue_image" resize="cover" :src="overdue" v-if="rule.state === 'sended' || rule.state === 'expired'"></image>
                </div>
                <div class="item" v-if="rule.type === 'event' && rule.event">
                    <div class="head">
                        <div class="title">
                            <text :class="['tag', `status_tag_${rule.class_name}`, 'event_event']">{{ $t('事件') }}</text>
                            <text :class="['desc', `text_${rule.class_name}`]"> {{rule.pair_symbol}} {{ $t('事件监控') }}</text>
                        </div>
                        <div class="edit">
                            <text class="icon delete_icon" @click="deleteRule(rule, 'event')">&#xe91b;</text>
                        </div>
                    </div>
                    <div class="foot">
                        <text class="time">{{rule.updated_at_str}}</text>
                        <text :class="['status', `status_text_${rule.class_name}`]">{{rule.state_text}}</text>
                    </div>
                    <image class="overdue_image" resize="cover" :src="overdue" v-if="rule.state === 'sended' || rule.state === 'expired'"></image>
                </div>
            </cell>
            <cell>
                <Loadmore :loading="loading.rule_list" :empty="`空空如也`" ></Loadmore>
            </cell>
            <cell>
                <div class="add_box" @click="goStatSingle">
                    <div class="btn">
                        <text class="icon add_regular">&#xe916;</text>
                    </div>
                    <text class="add_text">{{ $t('添加监控规则') }}</text>
                </div>
            </cell>
        </list>
        <Dialog title="" :content="$t('确定删除此条监控？')" :show="dialog_show" :single="false" @wxcDialogCancelBtnClicked="DialogCancelClicked" @wxcDialogConfirmBtnClicked="DialogConfirmClicked">
        </Dialog>
        <Dialog title="" :content="$t('添加监控规则需要先登录哦，是否跳转至登录？')" :show="dialog_add_rlue_show" :single="false" @wxcDialogCancelBtnClicked="DialogCancelRlueClicked" @wxcDialogConfirmBtnClicked="DialogConfirmRlueClicked">
        </Dialog>
    </div>
</template>
<script>
import { Utils, WxcCell, WxcButton } from 'weex-ui'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Refresher from '../components/Refresher.vue'
import Dialog from '../components/Dialog.vue'
import Loadmore from '../components/Loadmore.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import filters from '../config/filters.js'

export default {
    components: { WxcCell, WxcButton, StatusBar, WxcMinibar, Refresher, Dialog, Loadmore },
    data() {
        return {
            filters,
            overdue: `bmlocal://assets/images/overdue.png`,
            char_lt: '<',
            char_gte: '>',
            rule_list: [],
            dialog_show: false,
            loading: {
                rule_list: 'init'
            },
            page: {
                rule_list: 1
            },
            size: {
                rule_list: 30
            },
            current_rule: {},
            user_info: {},
            dialog_add_rlue_show: false,
        }
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created() {
        this.init();
    },
    eros: {
        beforeBackAppear(params, options) {
            this.init();
        },
    },
    methods: {
        init() {
            this.getUserInfo();
            this.getUserRules();
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        goSetting(e) {
            this.$emit('SetTabbarActive', 4)
        },
        goStatSingle(e) {
            this.$router.open({
                name: 'SearchCoin',
                params: {
                    from: 'stat',
                }
            })
        },
        DialogConfirmRlueClicked() {
            this.$router.open({
                name: 'Login',
            })
            this.dialog_add_rlue_show = false;
        },
        DialogCancelRlueClicked() {
            this.dialog_add_rlue_show = false;

        },
        refreshUserRules() {
            this.page.rule_list = 1;
            this.getUserRules();
        },
        deleteRule(rule, rule_type) {
            this.current_rule = rule;
            this.current_rule.rule_type = rule_type;
            this.dialog_show = true;
        },
        editRule(rule) {
            let { pair_base, pair_symbol, platform, symbol, _id, symbol_id, unit } = rule;
            if (platform === '均价') {
                this.$router.open({
                    name: 'StatSingle',
                    params: {
                        pair_base: '',
                        symbol: pair_symbol,
                        platform,
                        symbol_id,
                        unit,
                        rule_id: _id,
                    }
                });
            } else {
                this.$router.open({
                    name: 'StatSingle',
                    params: {
                        pair_base,
                        pair_symbol,
                        symbol: pair_symbol,
                        platform,
                        symbol_id,
                        unit,
                        rule_id: _id,
                    }
                });
            }

        },
        DialogCancelClicked() {
            this.dialog_show = false;
        },
        DialogConfirmClicked() {
            this.dialog_show = false;
            this.deleteUserRule();
        },
        wxcDialogNoPromptClicked(e) {
            // must setting,control by yourself
            this.isChecked = e.isChecked;
        },
        getUserRulesLocal() {
            let user_rules = this.$storage.getSync('user_rules') || [];
            console.log('user_rules', JSON.stringify(user_rules));
            this.rule_list = this.handleUserRules(user_rules);
        },
        goLogin() {
            this.$router.open({
                name: 'Login',
                params: {}
            })
        },
        goPlan() {
            this.$router.open({
                name: 'Plan',
            })
        },
        handleClickRule(rule) {
            if (rule.state === 'local') {
                this.goLogin();
            }
            if (rule.state === 'expired' || rule.state === 'saved') {
                this.goPlan();
            }
        },
        handleUserRules(user_rules) {
            for (let item of user_rules) {
                if (item.signal === this.$t('1小时涨跌幅') || item.signal === this.$t('24小时涨跌幅')) {
                    item.units = '%';
                } else {
                    item.units = item.unit
                }
                item.class_name = filters.getruleState(item.state).class_name;
                item.state_text = filters.getruleState(item.state).text;
                item.updated_at_str = filters.dateFormat(item.updated_at / 1000, 'yyyy-MM-dd hh:mm');
            }
            return user_rules;
        },
        getUserRules() {
            if (!this.user_info.is_login) {
                this.getUserRulesLocal();
                return;
            }
            let params = {};
            params.items = true;
            params.page = this.page.rule_list || 1;
            // params.size = this.size.rule_list || 30;
            this.loading.rule_list = 'loading';
            this.$fetch({
                name: 'getUserRules',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.rule_list = 'loaded';
                    resData.items = this.handleUserRules(resData.items);
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.rule_list = 'nomore';
                        }
                        this.rule_list.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.rule_list = 'empty';
                        }
                        this.rule_list = resData.items;
                    }
                } else {
                    if (resData.error === 1) {
                        this.loading.rule_list = 'need_login';
                    } else {
                        this.loading.rule_list = 'error';
                    }
                }
            }).catch((e) => {

            });
        },
        deleteUserRuleLocal() {
            let rule_type = this.current_rule.rule_type;
            let user_rules = this.$storage.getSync('user_rules') || [];
            if (rule_type === 'notice' || rule_type === 'event') {
                for (let user_rule of user_rules) {
                    if (user_rule._id === this.current_rule._id) {
                        user_rule[rule_type] = false;
                    }
                }
            } else {
                user_rules = user_rules.filter(item => item._id !== this.current_rule._id);
            }
            this.$storage.setSync('user_rules', user_rules);
            this.getUserRules();
        },
        deleteUserRule() {
            if (!this.user_info.is_login) {
                this.deleteUserRuleLocal();
                return;
            }
            this.$fetch({
                url: `${API_BaseUrl}/api/user/rule/${this.current_rule._id}?rule_type=${this.current_rule.rule_type}`,
                method: 'DELETE',
                data: {},
            }).then(resData => {
                if (resData.error === 0) {
                    this.getUserRules();
                    this.$notice.toast({ message: this.$t('删除成功！') });
                } else {
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                console.log(e.message);
            });
        }

    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
@expired_color: #9B9DA4;
.container {
    width: 750px;
    background-color: @bgf4f5f6;
}

.icon {
    font-size: 45px;
    color: #333;
    font-family: iconfont2;
}

.circle {
    font-size: 18px;
    color: #fb6a60;
    position: absolute;
    top: -2px;
    right: -1px;
}

.message {}

.add {
    margin-right: 30px;
}

.right {
    flex-direction: row;
    position: relative;
}

.items {}

.item {
    position: relative;
    background-color: #fff;
    padding: @padding_size;
    margin-bottom: @padding_size;
}

.overdue_image {
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 80px;
}

.head {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 20px;
}


.title {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.tag {
    font-size: 18px;
    color: #fff;
    background-color: #4B5E95;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin-right: 20px;
    border-radius: 4px;
}

.desc {
    font-weight: bold;
    color: #434343;
    font-size: 32px;
}

.desc_sort {
    color: #434343;
    font-size: 30px;
}

.body {
    flex-direction: row;
    margin-bottom: 30px;
}

.body_text {
    font-size: 30px;
    color: #434343;
    font-weight: bold;
}

.edit {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.edit_icon {
    font-size: 38px;
    height: 50px;
    width: 80px;
    text-align: right;
    margin-right: 30px;
}

.delete_icon {
    font-size: 40px;
    height: 50px;
    width: 80px;
    text-align: right;
}

.time {
    color: #9b9da4;
    font-size: 22px;
}

.status {
    font-size: 22px;
    color: #00c39c;
}

.foot {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.add_box {
    padding-top: 50px;
    padding-bottom: 3 * @tabbar_height;
    justify-content: center;
    align-items: center;
}

.btn {
    width: 88px;
    height: 88px;
    border-radius: 100%;
    background-color: #fff;
    justify-content: center;
    align-items: center;
}

.add_regular {
    font-size: 55px;
    color: #f7b237;
}

.add_text {
    font-size: 28px;
    margin-top: 20px;
}

.status_text_saved {
    color: #ff9732;
}

.text_expired {
    color: @expired_color;
}

.status_text_expired {
    color: @expired_color;
}

.status_tag_expired {
    background-color: @expired_color;
}

.status_text_sended {
    color: @expired_color;
}

.status_tag_sended {
    background-color: @expired_color;
}

.notice_event {
    background-color: #b74c7c;
}

.event_event {
    background-color: #d67415;
}

</style>