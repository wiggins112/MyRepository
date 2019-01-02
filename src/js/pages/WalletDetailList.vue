<template>
    <div class="container">
        <div class="wrapper">
            <div class="head">
                <StatusBar></StatusBar>
                <wxc-minibar :title="$t('收支明细')">
                </wxc-minibar>
            </div>
            <list ref="balance_dom" class="list" index="0" infinite="false" loadmoreoffset="550" :style="{ height: (tabPageHeight) + 'px' }" @loadmore="loadmore">
                <Refresher @refresh="refreshTokenList" @refreshEnd="refreshEnd" :loading="loading.logs"></Refresher>
                <cell class="cell" v-for="log in logs">
                    <div class="item">
                        <div class="left">
                            <text class="desc" v-if="log.log_type === 1">{{$t('邀请用户') + ' ' + log.phone + ' ' + $t('注册奖励') }}</text>
                            <text class="desc" v-if="log.log_type !== 1">{{ log.remark }}</text>
                            <text class="time">{{ filters.getFormatMoment(log.timestamp) }}</text>
                        </div>
                        <div class="right">
                            <text class="price">{{log.count }}</text>
                            <text class="per">BZH</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <Loadmore :loading="loading.logs" :empty="$t('暂无明细')" blankpagetype="icontext" iconsrc="bmlocal://assets/images/blankpage/wallet.png"></Loadmore>
                </cell>
                <cell style="height: 300px;"></cell>
            </list>
        </div>
    </div>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import filters from '../config/filters.js'
import Refresher from '../components/Refresher.vue'
import {Iconfont} from '../config/config.js'

export default {
    components: {
        WxcTabBar,
        WxcButton,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher
    },
    data() {
        return {
            loading: {
                logs: 'init',
            },
            logs_page: 1,
            logs_size: 30,
            logs: [],
            bzhs: [],
            bzh: 0,
            filters,
            tabPageHeight: 1334,
            show_extract_bzh: false,
        };
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
            this.refreshTokenList();
        },
    },
    methods: {
        init() {
            this.initTabPage();
            this.getUserTokenTrans();
            this.getConfigTokenWithdraws();
        },
        loadmore() {
            this.getMoreLogs();
        },
        refreshTokenList() {
            this.logs_page = 1;
            this.getUserTokenTrans();
        },
        initTabPage() {
            this.tabPageHeight = Utils.env.getPageHeight();
        },
        digitize(num) {
            return (num + "").split("").map(Number);
        },
        getMoreLogs() {
            if (this.loading.logs !== 'loaded') {
                return;
            }
            this.logs_page++;

            this.getUserTokenTrans();
        },
        jumpExtractBzh() {
            this.$router.open({
                name: 'ExtractBzh',
                params: {},
            })
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        getUserTokenTrans() {
            let params = {};
            params.page = this.logs_page;
            params.size = this.logs_size;
            this.loading.logs = 'loading';

            this.$fetch({
                name: 'getUserTokenTrans',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.logs = 'loaded';
                    if (params.page > 1) {
                        if (!resData.result.logs.length) {
                            this.loading.logs = 'nomore';
                        }
                        this.logs.push(...resData.result.logs);
                    } else {
                        if (!resData.result.logs.length) {
                            this.loading.logs = 'empty';
                        }
                        this.logs = resData.result.logs;
                    }
                    this.bzh = resData.result.total;
                    this.bzhs = this.digitize(this.bzh);
                    this.$refs.balance_dom.resetLoadmore(); // 强制触发loadmore
                } else {
                    this.$notice.toast({ message: resData.message });
                    if (resData.error === 1) {
                        this.loading.logs = 'need_login';
                    } else {
                        this.loading.logs = 'error';
                    }
                }

            }).catch((e) => {
                console.log(e.message);
            });
        },
        getConfigTokenWithdraws() {
            let params = {
                type: 'app_config',
                key: 'token_withdraw',
            };
            this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    if (resData.result.withdraw_enable) {
                        let now_timestamp = Date.now()/1000;
                        if (now_timestamp >= resData.result.start_timestamp) {
                            if (now_timestamp <= resData.result.end_timestamp) {
                                this.show_extract_bzh = true;
                            }
                        }
                    }
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

.icon {
    font-family: iconfont2;
}

.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.head {
    width: 750px;
}
.list {
    background-color: #fff;
}
.cell {
    padding: 0 30px;
}

.item {
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: rgba(0, 0, 0, 0.1);
    padding: 30px 0;
}

.left {
    margin-right: 180px;
}

.desc {
    font-size: 30px;
    color: #434343;
}

.time {
    font-size: 24px;
    color: #9b9da4;
    margin-top: 15px;
}

.right {
    position: absolute;
    right: 0;
    top: 30px;
    flex-direction: row;
}

.price {
    color: #f7b237;
    font-size: 30px;
    font-weight: bold;
    margin-right: 15px;
}

.per {
    color: #434343;
    font-size: 30px;
    font-weight: bold;
}

</style>
