<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('我的竞猜')">
        </wxc-minibar>
        <div class="content">
            <list class="list" ref="betlist_dom" @loadmore="loadmoreMessages" :style="{height: page_height }" loadmoreoffset="550">
                <Refresher @refresh="refreshCoins" :loading="loading.messages"></Refresher>
                <cell v-for='item in messages'>
                    <div class="guess_item" @click="goBetDetail(item)">
                        <div class="item_hd">
                            <text class="hd_title">{{item.bet_activity.title}}</text>
                            <text v-if="item.status === 0" class="hd_status">{{ $t('待开奖') }}</text>
                            <text v-if="item.status === -1" class="hd_status_false">{{ $t('未中奖') }}</text>
                            <text v-if="item.status === 2" class="hd_status_false">{{ $t('平局') }}</text>
                            <text v-if="item.status === 1" class="hd_status_true">{{ $t('已中奖') }}</text>
                        </div>
                        <div class="item_bd">
                            <text class="bd_title">{{filters.dateFormat(item.bet_activity.result_ts,'MM.dd hh:mm')}}{{ $t('开奖') }}</text>
                        </div>
                        <div class="item_ft">
                            <div class="ft_cont">
                                <text class="ft_text">{{ $t('已下注') }}：</text>
                                <text class="ft_bzh">{{item.amount}} BZH</text>
                            </div>
                        </div>
                        <div class="item_ft">
                            <div class="ft_cont">
                                <text class="ft_text left_text">{{ $t('回 报：') }}{{item.odds_value_str}} {{ $t('倍') }}</text>
                            </div>
                            <div class="ft_cont">
                                <text class="ft_text right_text">{{filters.dateFormat(item.join_ts,"yyyy.MM.dd hh:mm:ss")}}</text>
                            </div>
                        </div>
                    </div>
                </cell>
                <cell>
                    <Loadmore :loading="loading.messages" :empty="$t('您还没有参与过竞猜，马上去参加吧！')" blankpagetype="icontext" iconsrc="bmlocal://assets/images/blankpage/mybet.png"></Loadmore>
                    <div v-if="loading.messages === 'empty'" class="add_box" @click="goBetList">
                        <text class="add_text">{{ $t('去竞猜广场看看 >') }}</text>
                    </div>
                </cell>
                <cell>
                    <BetFloat />
                </cell>
            </list>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import filters from '../config/filters.js'
import common from '../config/common';
import BetFloat from '../components/BetFloat.vue'

export default {
    components: {
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        BetFloat
    },
    data() {
        return {
            filters,
            messages: [],
            messages_page: 1,
            messages_size: 30,
            loading: {
                messages: 'init',
            },
        };
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.putmyBetview();
            this.getMyBetList();
        },
        putmyBetview() {
            this.$fetch({
                name: 'putUserBetView',
                method: 'PUT',
            }).then(async resData => {

            }).catch((e) => {

            });
        },
        getMyBetList() {
            let params = {};
            params.page = this.messages_page;
            params.size = this.messages_size;
            this.loading.messages = 'loading';
            return this.$fetch({
                name: 'getUserBets',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.messages = 'loaded';
                    // 数据显示
                    for (let item of resData.items) {
                        if (item.bet_result == 'wait') {
                            item.status = 0;
                        } else if (item.bet_result == "neu") {
                            item.status = 2;
                        } else {
                            if (item.bet_type == item.bet_result) {
                                item.status = 1;
                            } else {
                                item.status = -1;
                            }
                        }
                    }

                    if (params.page === 1) {
                        this.messages = resData.items;
                        if (!resData.items.length) {
                            this.loading.messages = 'empty';
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.messages = 'nomore';
                        } else {
                            this.messages.push(...resData.items);
                        }
                    }
                } else {
                    if (resData.error === 1) {
                        this.loading.messages = 'need_login';
                    } else {
                        this.loading.messages = 'error';
                    }
                }
                this.$refs.betlist_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
            }).catch((e) => {
                // this.$notice.toast({ title: this.$t('提示'), message: e });
            });
        },
        goBetDetail(item) {
            this.$router.open({
                name: 'BetDetail',
                params: {
                    bet_id: item.bet_id
                }
            })
        },
        refreshCoins() {
            this.messages_page = 1;
            this.getMyBetList();
        },
        loadmoreMessages() { //list滑动加载更多 
            if (this.loading.messages !== 'loaded') {
                return;
            }
            this.messages_page++;
            this.getMyBetList();
        },
        goBetList() {
            this.$router.open({
                name: 'BetList',
            })
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_gamble_enter_market');
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {}

.content {
    width: 750px;

}

.list {
    padding: 0 @padding_size;
}

.guess_item {
    margin-top: 20px; // border-bottom-width: 20px;border-color: #f5f5f5;
    padding: @padding_size;
    background-color: #fff;
    border-radius: 6px;
}

.item_hd {
    flex-direction: row;
    justify-content: space-between;
}

.hd_title {
    font-size: 32px;
    color: #333;
    font-weight: bold;
}

.hd_status {
    font-size: 30px;
    color: #36cc80;
}

.hd_status_false {
    color: #848484;
    font-size: 30px;
}

.hd_status_true {
    color: #ff6c6c;
    font-size: 30px;
}


.item_bd {
    padding: @padding_size 0;
}

.bd_title {
    font-size: 28px;
    color: #434343;
}

.item_ft {
    padding-top: 12px;
    flex-direction: row;
    justify-content: space-between;
}

.ft_cont {
    flex-direction: row;
}

.ft_text {
    color: #9b9da4;
    font-size: 24px;
}
.left_text {
    flex: 1;
    text-align: left;
}
.right_text {
    flex: 1;
    text-align: right;
    margin-top: 3px;
}
.ft_bzh {
    color: #f7b237;
    font-size: 24px;
}


.time_star {
    flex-direction: row;
    justify-content: flex-start;
}

.time_end {
    flex-direction: row;
    justify-content: flex-end;
}

.time_text {
    font-size: 24px;
    color: #9B9DA4;
}

.add_box {
    justify-content: center;
    align-items: center;
}

.add_text {
    font-size: 30px;
    color: #f7b237;
}

</style>
