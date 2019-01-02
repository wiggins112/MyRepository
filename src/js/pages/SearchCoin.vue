<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <div class="wrapper">
            <div class="box_hd">
                <div class="search_box">
                    <text class="icon icon_search">&#xe915;</text>
                    <input class="input" type="text" :placeholder="$t('搜索币种')" @input="doSearchCoin"  @change="doSearchCoin" return-key-type="search" />
                </div>
                <text :class="[language === 'zh-CN'?'cancel' : 'cancel_en']" @click="GoBack">{{ $t('取消') }}</text>
            </div>
            <!-- 搜索历史和热门搜索 -->
            <div class="history-box" v-if="!keyword.length">
                <div v-if="searchHistory.length">
                    <div class="cont_hd less_between">
                        <text class="cont_title">{{ $t('历史浏览') }}</text>
                        <div class="less_row" @click="clearHistory">
                            <text class="icon icon_clear">&#xe91b;</text>
                            <text class="clear_text">{{ $t('清空') }}</text>
                        </div>
                    </div>
                    <div class="cont_bd">
                        <text class="cont_text" v-for="(item, index) in searchHistory" :key="'searchHistory' + index" @click="tapSymbol(item)">{{ item.symbol }}</text>
                    </div>
                </div>
                <div class="cont_hd less_row">
                    <text class="cont_title">{{ $t('热门推荐') }}</text>
                    <text class="icon icon_hot">&#xe927;</text>
                </div>
                <div class="cont_bd">
                    <text class="cont_text" v-for="(item, index) in hotSearch" @click="tapSymbol(item)" :key="'hotSearch' + index">{{ item.symbol }}</text>
                </div>
            </div>
            <div v-if="keyword.length">
                <div class="content">
                    <list ref="betlist_dom" class="list" :style="{height: page_height}" loadmoreoffset="550" @loadmore="loadmoreSymbols">
                        <cell v-for="(symbol,i) in symbols" :index="i" :key="i" class="row">
                            <div class="item" @click="tapSymbol(symbol)">
                                <text class="name">{{symbol.symbol}}</text>
                                <text class="desc">{{symbol.name}}</text>
                                <text class="cn">{{symbol.cn}}</text>
                            </div>
                        </cell>
                        <cell v-if="keyword">
                            <Loadmore :loading="loading.symbols" :empty="$t('空空如也')"></Loadmore>
                        </cell>
                        <cell style="height: 100px;"></cell>
                    </list>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { Utils, WxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue';
import StatusBar from '../components/StatusBar.vue';
import Loadmore from '../components/Loadmore.vue';
import { API_BaseUrl, Iconfont } from '../config/config.js';
export default {
    components: {
        WxcButton,
        WxcMinibar,
        StatusBar,
        Loadmore
    },
    data() {
        return {
            router_params: {},
            PageHeight: 1334,
            keyword: '',
            symbols: [],
            is_show: false,
            statusBarStyle: {
                bgColor: '#ffffff'
            },
            symbols_page: 1,
            symbols_size: 20,
            loading: {
                symbols: 'loading'
            },
            searchHistory: [],
            hotSearch: []
        };
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            fontFamily: 'iconfont2',
            src: `url('${Iconfont}')`
        });
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getRouterParams();
            this.initTabPage();
            this.searchHistory = this.$storage.getSync('coinsSearchHistory') || []
            this.getHotSearch()
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            });
        },

        initTabPage() {
            this.PageHeight = Utils.env.getPageHeight();
        },
        GoBack() {
            this.$router.back({
                type: 'PUSH',
                callback() {
                    // 返回成功回调
                }
            });
        },
        inputHot() {
            this.getCoinSymbols();
            if (this.keyword.length === 0) {
                this.is_show = false;
            } else {
                this.is_show = true;
            }
        },
        loadmoreSymbols() {
            //list滑动加载更多
            if (this.loading.symbols !== 'loaded') {
                return;
            }
            this.symbols_page++;
            this.getCoinSymbols();
        },
        doSearchCoin(e) {
            this.keyword = e.value;
            this.symbols_page = 1;
            this.symbols = [];
            this.getCoinSymbols();
        },
        getCoinSymbols() {
            let params = {};
            params.page = this.symbols_page;
            params.size = this.symbols_size;
            params.word = this.keyword;
            this.loading.symbols = 'loading';
            return this.$fetch({
                    name: 'getCoinSymbols',
                    method: 'GET',
                    data: params
                })
                .then(resData => {
                    if (resData.error === 0) {
                        //加载成功
                        this.loading.symbols = 'loaded';
                        if (params.page === 1) {
                            this.symbols = resData.items;
                            if (!resData.items.length) {
                                this.loading.symbols = 'empty';
                            }
                        } else {
                            if (!resData.items.length) {
                                this.loading.symbols = 'nomore';
                            } else {
                                this.symbols.push(...resData.items);
                            }
                        }
                    } else {
                        if (resData.error === 1) {
                            this.loading.symbols = 'need_login';
                        } else {
                            this.loading.symbols = 'error';
                        }
                    }
                    this.$refs.betlist_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
                })
                .catch(e => {
                    console.log(e.message);
                });
        },
        tapSymbol(symbol) {
            this.onStorage(symbol)
            // if (this.router_params.from === 'stat') {
            //     this.$router.open({
            //         name: 'State',
            //         params: {
            //             symbol: symbol.symbol,
            //             symbol_id: symbol._id,
            //             platform: '均价'
            //         }
            //     });
            // } else {
            this.$router.open({
                name: 'CoinDetail',
                params: {
                    symbol: symbol.symbol,
                    symbol_id: symbol.id,
                    block_cc_id: symbol.block_cc_id,
                }
            });
            // }
        },
        clearHistory() {
            this.$storage.setSync('coinsSearchHistory', [])
            this.searchHistory = this.$storage.getSync('coinsSearchHistory')
        },
        onStorage(value) {
            this.searchHistory.unshift(value)
            const res = new Map()
            this.searchHistory = this.searchHistory.filter(x => !res.has(x.symbol) && res.set(x.symbol, 1)).slice(0, 10)
            this.$nextTick(() => {
                this.$storage.setSync('coinsSearchHistory', this.searchHistory)
                this.searchHistory = this.$storage.getSync('coinsSearchHistory')
            })
        },
        async getHotSearch() {
            const params = {
                rank: this.$t('前10'),
                size: 10,
                page: 1,
                items: true
            }
            const res = await this.$fetch({
                name: 'getCoins',
                method: 'GET',
                data: params
            })
            if (res.error === 0) {
                this.hotSearch = res.items
            }
        }
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        language() {
            return this.$storage.getSync('language');
        },
    }
};

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {
    background-color: #ffffff;
}

.wrapper {
    background-color: #fff;
}

.box_hd {
    padding: 16px @padding_size;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #e7eaf1;
}

.search_box {
    flex-direction: row;
}

.input {
    width: 538px;
    height: 74px;
    font-size: 34px;
    background-color: #eef1f6;
    color: #9b9da4;
    padding-left: 14px;
}

.icon_search {
    width: 60px;
    height: 74px;
    font-size: 45px;
    padding-left: 14px;
    font-weight: normal;
    color: #9b9da4;
    line-height: 74px;
    background-color: #eef1f6;
}

.cancel {
    color: #434343;
    font-weight: bold;
    font-size: 36px;
}
.cancel_en {
    color: #434343;
    font-weight: bold;
    font-size: 30px;
}
.icon {
    font-family: iconfont2;
}

.box_bd {
    background-color: #fff;
}

.title {
    font-size: 28px;
    color: #f7b237;
    padding: 36px 0;
    font-weight: bold;
}

.hots {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
}

.hot {
    width: 233.3px;
    padding-bottom: 36px;
    font-size: 32px;
}

.item {
    flex-direction: row;
    margin: 0 @padding_size;
    padding: @padding_size 0;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #e7eaf1;
}

.name {
    font-size: 34px;
    margin-right: 20px;
}

.desc {
    font-size: 30px;
    color: #9b9da4;
    margin-right: 20px;
}

.cn {
    font-size: 30px;
    color: #9b9da4;
}

.history-box {
    padding: @padding_size;
    height: 1200px;
}

.cont_title {
    font-size: 30px;
    color: #434343;
    font-weight: 500;
}

.clear_text {
    font-size: 30px;
    color: #434343;
}

.icon_clear {
    font-size: 32px;
    padding: 0 14px;
    font-weight: normal;
    color: #434343;
}

.icon_hot {
    font-size: 30px;
    padding: 0 14px;
    font-weight: normal;
    color: #f85e40;
}

.cont_text {
    height: 54px;
    line-height: 54px;
    border-radius: 5px;
    border-width: 2px;
    border-color: #fff3de;
    font-size: 30px;
    color: #d1a962;
    padding: 0 28px;
    margin: 20px 20px 0 0;
}

.cont_bd {
    padding-bottom: 85px;
    flex-direction: row;
    flex-wrap: wrap;
}

</style>
