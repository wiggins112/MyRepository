<template>
    <div class="guess_box">
        <div class="guess_list">
            <div class="guess_item" v-for="(item, i) in messages" :key="i" @click="goBetDetail(item)">
                <div class="item_hd">
                    <text class="hd_title">{{item.title}}</text>
                </div>
                <div class="item_bd">
                           <text class="bet_ing" v-if="item.bet_state=='now'">{{ $t('竞猜中') }}</text>
                            <text class="bet_start" v-if="item.bet_state=='wait'">{{ $t('即将开始') }}</text>
                            <text class="bet_start" v-if="item.bet_state=='toopen'">{{ $t('待开奖') }}</text>
                            <text class="bet_end" v-if="item.bet_state=='opened'">{{ $t('已结束') }}</text>
                </div>
                <div class="item_ft">
                    <div class="ft_time time_star">
                        <text class="time_text">{{ $t('参与截止') }}：{{filters.dateFormat(item.join_stop_ts, 'MM.dd hh:mm')}}</text>
                    </div>
                    <div class="ft_time time_end">
                        <text class="time_text">{{ $t('开奖时间') }}：{{filters.dateFormat(item.result_ts, 'MM.dd hh:mm')}}</text>
                    </div>
                </div>
            </div>
            <Loadmore :loading="loading.messages" :empty="$t('空空如也~')" :nomore="$t('暂无更多活动了~')"></Loadmore>
        </div>
    </div>
</template>
<script>
import Loadmore from './Loadmore.vue'
import filters from '../config/filters.js'
export default {
    components: {
        Loadmore,
    },
    data() {
        return {
            filters,
            loading: {
                messages: 'init',
            },
            messages: [],
            messages_page: 1,
            messages_size: 10,
        }
    },
    created() {
        this.init();
    },
    props: {
        Active: {
            type: Boolean,
            default: false,
        },
        is_loadmore: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                if (newValue) {
                    // 触发滚到底部加载更多
                    this.$emit('Loadmored');
                    this.loadmoreBetlist();
                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getBetList();
        },
        goBetDetail(item) {
            this.$router.open({
                name: 'BetDetail',
                params: {
                    bet_id: item._id
                }
            })
        },
        loadmoreBetlist() { //list滑动加载更多 
            if (this.loading.messages !== 'loaded') {
                return;
            }
            this.messages_page++;
            this.getBetList();
        },
        getBetList() { //list 加载数据
            let params = {};
            params.page = this.messages_page;
            params.size = this.messages_size;
            this.loading.messages = 'loading';
            return this.$fetch({
                name: 'getBetActivities',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) { //加载成功
                    this.loading.messages = 'loaded';
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
            }).catch((e) => {
                console.log(e.message);
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
.guess_box {
    width: 750px;
}
.guess_list {
    padding: @padding_size;
}
.guess_item {
    margin-bottom: 20px;
    padding: @padding_size;
    background-color: #fff;
    border-radius: 6px;
}
.item_hd {
    align-items: center;
    justify-content: center;
}
.hd_title {
    font-size: 30px;
    color: #434343;
    font-weight: bold;
}
.item_bd {
    padding: @padding_size 0;
    align-items: center;
    justify-content: center;
}
.bd_title {
    font-size: 28px;
    color: #FC724A;
}
.bet_ing {
    color: #36cc80;
    font-size: 28px;
}

.bet_start {
    color: @main_color;
    font-size: 28px;
}

.bet_end {
    color: #9b9da4;
    font-size: 28px;
}
.item_ft {
    flex-direction: row;
}
.ft_time {
    flex: 1;
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
</style>
