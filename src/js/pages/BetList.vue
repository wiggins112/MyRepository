<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('话题竞猜')">
        </wxc-minibar>
        <div class="content">
            <list ref="betlist_dom" class="list" :style="{height: page_height }" loadmoreoffset="550" @loadmore="loadmoreMessages">
                <Refresher @refresh="refreshCoins" :loading="loading.messages"></Refresher>
                <cell class="listcell" v-for="item in messages">
                    <image class="banner_image" resize="cover" :src="item.banner" @click="goBetDetail(item)" />
                    <CellItem class="cellitem" :has-arrow="true" @wxcCellClicked="goBetDetail(item)" :has-top-border="false" title="" hasVerticalIndent="" titleIconSize="40" extraContent="" titlecolor="red">
                        <div slot="title" class="less_row">
                            <text class="bet_ing" v-if="item.bet_state=='now'">{{ $t('竞猜中') }}</text>
                            <text class="bet_start" v-if="item.bet_state=='wait'">{{ $t('即将开始') }}</text>
                            <text class="bet_start" v-if="item.bet_state=='toopen'">{{ $t('待开奖') }}</text>
                            <text class="bet_end" v-if="item.bet_state=='opened'">{{ $t('已结束') }}</text>
                            <text class="cell_title">{{item.title}}</text>
                        </div>
                    </CellItem>
                    <text class="banner_num" v-if="item.bet_state != 'wait'">{{getJoinPersonNum(item)}}{{ $t('人参加') }}</text>
                </cell>
                <cell>
                    <Loadmore :loading="loading.messages"  :empty="$t('空空如也')"></Loadmore>
                </cell>
            </list>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import CellItem from '../components/CellItem.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
export default {
    components: {
        StatusBar,
        WxcMinibar,
        CellItem,
        Loadmore,
        Refresher,
    },
    data() {
        return {
            loading: {
                messages: 'init',
            },
            messages: [],
            messages_page: 1,
            messages_size: 10,
        };
    },
    created() {
        this.init();
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
        refreshCoins() { //下拉刷新的时候 目的清空数据+重新加载页面
            this.messages_page = 1;
            this.getBetList();
        },
        loadmoreMessages() { //list滑动加载更多 
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
                        if (resData.items.length) this.$storage.setSync('betHaveReadID', resData.items[0]._id)
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
                console.log(e.message);
            });
        },
        getJoinPersonNum(bet_activity) {
            return (bet_activity.bet_state != 'wait' ? (bet_activity.user_bet_total || 0) : 0);
            // return (bet_activity.bet_state != 'wait' ? (bet_activity.join_count_base || 0) + (bet_activity.user_bet_total || 0) : 0);
        },
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
.container {
    width: 750px;
}

.list {
    width: 750px;
}

.banner_image {
    height: 300px;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
}

.listcell {
    border-radius: 50px;
    padding: @padding_size @padding_size 0;
}

.banner_num {
    background-color: rgba(0, 0, 0, 0.2);
    color: #fff;
    padding: 10px 15px;
    border-radius: 30px;
    position: absolute;
    top: 40px;
    right: 40px;
    font-size: 18px;
}

.cell-content {
    flex-direction: row;
    justify-content: space-between;
    height: 80px;
    line-height: 80px;
}

.cellitem {
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
}

.cell-arrow-icon {
    width: 22px;
    height: 22px;
}

.cell_title {
    color: #333;
    font-weight: 600;
}

.bet_ing {
    border-radius: 30px;
    font-size: 22px;
    padding: 2px 12px;
    border-width: 2px;
    border-color: #36cc80;
    color: #36cc80;
    margin-right: @padding_size;
    font-weight: 500;
}

.bet_start {
    border-radius: 30px;
    font-size: 22px;
    padding: 2px 12px;
    border-width: 2px;
    border-color: @main_color;
    color: @main_color;
    margin-right: @padding_size;
    font-weight: 500;
}

.bet_end {
    border-radius: 30px;
    font-size: 22px;
    padding: 2px 12px;
    border-width: 2px;
    border-color: #9b9da4;
    color: #9b9da4;
    margin-right: @padding_size;
    font-weight: 500;
}

</style>
