<template>
    <div class="user_coin_box">
        <div class="cell_box" v-if="user_coins.length">
            <div class="item tb_hd">
                <div class="tb_td name">
                    <text class="tb_th">{{ $t('币种') }}</text>
                </div>
                <div class="tb_td price">
                    <text class="tb_th txt_r">{{ $t('价格') }}</text>
                </div>
                <div class="tb_td change">
                    <text class="tb_th txt_r">{{ $t('当日涨跌') }}</text>
                </div>
            </div>
        </div>
        <div class="marketcap_box">
            <list ref="user_coins" :show-scrollbar="true" offset-accuracy="20" loadmoreoffset="550" @loadmore="loadmoreUserCoins" :style="{ height: (page_height) + 'px' }">
                <Refresher :handrefresh="handrefresh" @refresh="refreshUserCoins"  :loading="loading.user_coins"></Refresher>
                <cell class="cell_box" v-for="(coin, index) in user_coins" :key="index">
                    <CoinItem :coin="coin"></CoinItem>
                </cell>
                 <cell>
                    <Loadmore :loading="loading.user_coins" :gif="false" :empty="$t('您暂未添加自选哦~快去添加吧')" blankpagetype="icontext" iconsrc="bmlocal://assets/images/blankpage/stat.png"></Loadmore>
                </cell>
                <cell>
                    <!-- 尚未添加显示插图 和按钮  -->
                    <div v-if="loading.user_coins === 'empty'" class="add_box_empty" @click="SetTabbarActive">
                        <text class="add_box_empty_text">{{ $t('添加自选') }}</text>
                    </div>
                    <!-- 已有数据的情况下显示添加的 按钮 -->
                    <div class="add_box_bt" v-if="user_coins.length"  @click="SetTabbarActive">
                        <text class="icon add_regular">&#xe916;</text>
                        <text class="text add_box_text">{{ $t('添加自选') }}</text>
                    </div>
                </cell>
                <cell class="fill_box"></cell>
            </list>
        </div>
        <Dialog title="" :content="$t('添加自选需要先登录哦，是否跳转至登录？')" :show="dialog_show" :single="false" @wxcDialogCancelBtnClicked="DialogCancelClicked" @wxcDialogConfirmBtnClicked="DialogConfirmClicked">
        </Dialog>
    </div>
</template>
<script>
import { Utils } from 'weex-ui'
import Refresher from './Refresher.vue'
import Dialog from './Dialog.vue'
import Loadmore from './Loadmore.vue'
import CoinItem from './CoinItem.vue'
import common from '../config/common';

export default {
    components: {
        Refresher,
        Dialog,
        Loadmore,
        CoinItem,
    },
    data() {
        return {
            loading: {
                coins: 'init',
                user_coins: 'empty',
            },
            coins: [],
            user_coins: [],
            coins_page: 1,
            user_coins_page: 1,
            coins_size: 20,
            user_coins_size: 5,
            user_info: {},
            dialog_show: false,
            handrefresh: false,
        }
    },
    props: {
        Active: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'Active': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                }
            },
            deep: true,
        },
    },
    eros: {
        beforeBackAppear(params, options) {
            if (this.Active) {
                this.init();
            }
        },
    },
    created() {

    },
    methods: {
        init() {
            this.getUserInfo();
            if (this.user_info.is_login) {
                this.user_coins = common.storageGetData("my_user_coins") || [];
                this.getUserCoins();
            }else {
                if (this.user_coins.length) {
                    this.loading.user_coins = 'empty';
                    this.user_coins = [];
                }
                
            }
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        loadmoreUserCoins() {
            return;
            if (this.loading.user_coins !== 'loaded') {
                return;
            }
            this.user_coins_page++;
            this.getUserCoins();
            this.$refs.user_coins.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
        },
        refreshUserCoins() {
            this.user_coins_page = 1;
            this.getUserCoins();
        },
        getUserCoins() {
            let params = {};
            params.page = this.user_coins_page;
            params.size = this.user_coins_size;
            this.loading.user_coins = 'loading';
            this.$fetch({
                name: 'getUserCoins',
                methods: 'GET',
                data: params,
            }).then((res) => {
                if (res.error === 0) {
                    this.loading.user_coins = 'loaded';
                    if (params.page === 1) {
                        this.user_coins = res.items;
                        if (!res.items.length) {
                            this.loading.user_coins = 'empty';
                        }
                    } else {
                        if (!res.items.length) {
                            this.loading.user_coins = 'nomore';
                        } else {
                            this.user_coins.push(...res.items);
                        }
                    }
                    common.storageSetData("my_user_coins" , this.user_coins);//全部的缓存数据 包括下拉刷新的
                } else {
                    if (res.error === 1) {
                        this.loading.user_coins = 'need_login';
                    } else {
                        this.loading.user_coins = 'error';
                    }
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        SetTabbarActive() {
            if (!this.user_info.is_login) {
                this.dialog_show = true;
                return;
            }
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_chosen_market_add_click');
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            });
        },
        DialogConfirmClicked() {
            this.$router.open({
                name: 'Login',
            })
            this.dialog_show = false;
        },
        DialogCancelClicked() {
            this.dialog_show = false;
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

.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 26px;
}

.user_coin_box {
    width: 750px;
}

.cell_box {
    width: 750px;
    background-color: #fff;
}

.item {
    padding: @padding_size;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}

.tb_hd {
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-top: 15px;
    padding-bottom: 15px;
    background-color: @bgf4f5f6;
}

.tb_td {
}

.rank {
    width: 120px;
}

.price {
    width: 240px;
}

.name {
    width: 220px;
}
.change {
    flex: 1;
}
.text {
    font-size: 28px;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

.coin_name {
    font-size: 22px;
    color: #9B9DA4;
}

.coin_usd {
    font-size: 22px;
    color: #9B9DA4;
}

.coin_change {
    width: 150px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    font-size: 28px;
}


.fill_box {
    height: 250px;
}
.pair_symbol {
    flex-direction: row;
}

.pair_base {
    font-size: 22px;
    color: #9B9DA4;
}

.add_box_bt {
    margin-bottom: @tabbar_height + 90px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    padding-top: 25px;
    padding-bottom: 25px;
}

.add_box_text {
    font-size: 26px;
    text-align: center;
    color: #babcc3;
    padding-left: 15px;
    font-weight: bold;
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
    font-size: 32px;
    color: #d0d0d0;
    font-weight: bold;
}
.add_box_empty {
    padding-top: 50px;
    padding-bottom: @tabbar_height + 90px;
    justify-content: center;
    align-items: center;
}
.add_box_empty_text {
    font-size: 30px;
    width: 500px;
    height: 88px;
    line-height: 88px;
    text-align: center;
    background-image: linear-gradient(to left, #ffd74b, #fab235);
    border-radius: 44px;
    color: #fff;
}

</style>
