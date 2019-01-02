<template>
    <div class="fliters_selecoin_box">
        <StatusBar></StatusBar>
        <wxc-minibar :title="$t('组合选币')">
            <div slot="right" @click="goSearchCoin" v-if="!hideModule['SearchCoin']">
                <text class="icon">&#xe915;</text>
            </div>
        </wxc-minibar>
        <list class="home_box" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="300" :style="{ height: (tabPageHeight) + 'px' }">
            <Refresher @refresh="refresh" @refreshEnd="refreshEnd" :loading="loading.coin_list"></Refresher>
            <cell class="content">
                <div class="mark_box">
                    <text class="mark_title">{{hot_tag.name}}</text>
                    <div class="list">
                        <div v-for="(item, i) in hot_tag.items" v-bind="item" :key="i" :class="['item', item.is_selected && 'active_tab']">
                            <div class="picker" v-if="!item.is_selected"  @click="SelectedH(item)">
                                <text :class="['name', item.is_selected && 'active_tab_text']" >{{item.name}}</text>
                            </div>
                            <div class="picker active_picker" v-if="item.is_selected" @click="cancelSelectedH(item)">
                                <text :class="['name', item.is_selected && 'active_tab_text']" >{{item.name}}</text>
                                <text :class="['value', item.is_selected && 'active_tab_text']"  v-if="item.is_selected && item.value[item.value_index].value !== '是'">{{item.value[item.value_index].label}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mark_box">
                    <text class="mark_title">{{market_tag.name}}</text>
                    <div class="list">
                        <div v-for="item in market_tag.items" :class="['item', item.is_selected && 'active_tab']">
                            <div class="picker" v-if="!item.is_selected"  @click="SelectedM(item)">
                                <text :class="['name', item.is_selected && 'active_tab_text']" >{{item.name}}</text>
                            </div>
                            <div class="picker active_picker" v-if="item.is_selected" @click="cancelSelectedM(item)">
                                <text :class="['name', item.is_selected && 'active_tab_text']" >{{item.name}}</text>
                                <text :class="['value', item.is_selected && 'active_tab_text']"  v-if="item.is_selected && item.value[item.value_index].value !== '是'">{{item.value[item.value_index].label}}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </cell>
        </list>
        <Picker :showPicker="showHotPicker" @closePicker="closeHotPicker" :title="pick_hot_data.name" :pick_data="pick_hot_data.value" @confirm="confirmPickHotTag"></Picker>
        <Picker :showPicker="showMarketPicker" @closePicker="closeMarketPicker" :title="pick_market_data.name" :pick_data="pick_market_data.value" @confirm="confirmPickMarketTag"></Picker>
        <div :class="['result_box', is_phonex && 'is_phonex']">
            <div class="result">
                <text style="padding-left: 20px;font-size: 24px;color: #999;" v-if="loading.coin_list === 'loading'">{{ $t('加载中') }}...</text>
                <div class="bmrichtext" v-if="loading.coin_list !== 'loading'">
                    <text class="res_text" :value="$t('已筛选出')">{{ $t('已筛选出') }}</text>
                    <text class="count" :value="coin_list_total"> {{coin_list_total}} </text>
                    <text class="res_text" :value="$t('个结果')">{{ $t('个结果') }}</text>
                </div>
            </div>
            <div :class="[coin_list_total  ? 'btn' : 'btn_gray']">
                <text class="btn_text" @click="goFilterResult">{{ $t('查看结果') }}</text>
            </div>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import Refresher from '../components/Refresher.vue'
import Picker from '../components/Picker.vue'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import {Iconfont} from '../config/config.js'

export default {
    components: { Refresher, Picker, WxcMinibar, StatusBar },
    data() {
        return {
            coin_list_total: 0,
            tabPageHeight: 1334,
            hot_tag: {
                items: []
            },
            market_tag: {
                items: []
            },
            loading: {
                coin_picker: 'loading',
                coin_list: 'loading'
            },
            showHotPicker: false,
            showMarketPicker: false,
            pick_hot_data: {},
            pick_market_data: {},
            is_phonex: false,
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
    methods: {
        init() {
            this.initTabPage();
            this.getCoinPickers();
            this.getCoins();
        },
        initTabPage() {
            this.is_phonex = weex.config.env.touchBarHeight ? true : false;
            this.tabPageHeight = Utils.env.getPageHeight();
        },
        SelectedH(item) {
            if (item.type === 'single') {
                item.is_selected = !item.is_selected;
                item.value_index = 0;
                this.getCoins();
            } else {
                this.showHotPicker = true;
                this.pick_hot_data = item;
            }
        },
        closeHotPicker() {
            this.showHotPicker = false;
        },
        SelectedM(item) {
            if (item.type === 'single') {
                item.is_selected = !item.is_selected;
                item.value_index = 0;
                this.getCoins();
            } else {
                this.showMarketPicker = true;
                this.pick_market_data = item;
            }
        },
        cancelSelectedH(item) {
            for (let tag of this.hot_tag.items) {
                if (tag.name === item.name) {
                    tag.is_selected = false;
                }
            }
            this.getCoins();
        },
        cancelSelectedM(item) {
            for (let tag of this.market_tag.items) {
                if (tag.name === item.name) {
                    tag.is_selected = false;
                }
            }
            this.getCoins();
        },
        closeMarketPicker() {
            this.showMarketPicker = false;
        },
        goFilterResult() {
            let params = {
                data: {},
                query: []
            };
            let items = this.getSelectedTag();
            for (let tag of items) {
                params.data[tag.order] = tag.value[tag.value_index].value;
                let query_obj = {
                    key: tag.order,
                    name: tag.name,
                    value: tag.value[tag.value_index].label
                }
                query_obj.order_value = tag.value[tag.value_index].value
                params.query.push(query_obj)
            };
            
            this.$router.open({
                name: 'FiltersCoinResult',
                params: params
            })
        },
        confirmPickHotTag(val) {
            if (!val.hasOwnProperty('index')) return
            for (let tag of this.hot_tag.items) {
                if (tag.name === this.pick_hot_data.name) {
                    tag.value_index = val.index;
                    tag.is_selected = true;
                }
            }
            this.getCoins();
        },
        confirmPickMarketTag(val) {
            if (!val.hasOwnProperty('index')) return
            for (let tag of this.market_tag.items) {
                if (tag.name === this.pick_market_data.name) {
                    tag.value_index = val.index;
                    tag.is_selected = true;
                }
            }
            this.getCoins();
        },
        refresh() {
            this.getCoins();
        },
        refreshEnd() {
        },
        getCoinPickers() {
            let params = {};
            this.loading.coin_picker = 'loading';
            this.$fetch({
                // url: `https://xcx.ganlan.io/api/coin/pickers`,
                name: 'getCoinPickers',
                method: 'GET',
                data: params

            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_picker = 'loaded';
                    this.hot_tag = resData.result.picker1;
                    this.hot_tag.items = this.initCoinPick(this.hot_tag.items);
                    this.market_tag = resData.result.picker2;
                    this.market_tag.items = this.initCoinPick(this.market_tag.items);
                } else {
                    this.loading.coin_picker = 'error';
                    this.$notice.toast({ message: resData.message })
                }
                
            }).catch((e) => {
                this.loading.coin_picker = 'error';
                console.log(e.message)
            });
        },
        initCoinPick(items) {
            let items_res = [];
            for(let item of items) {
                let data = [];
                for(let val of item.value) {
                    if  (typeof val === 'object') {
                        data.push({
                            label: val[Object.keys(val)[0]] || Object.keys(val)[0],
                            value: Object.keys(val)[0],
                            is_selected: false
                        }) 
                    } else {
                        data.push({
                            label: val,
                            value: val,
                            is_selected: false
                        })
                    }
                }
                item.value = data;
                items_res.push(item)
            }
            return items_res;
        },
        getCoins() {
            let params = {};
            let items = this.getSelectedTag();
            for (let tag of items) {
                params[tag.order] = tag.value[tag.value_index].value;
            };
            this.loading.coin_list = 'loading';
            this.$fetch({
                name: 'getCoins',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin_list = 'loaded';
                    this.coin_list_total = resData.total;
                } else {
                    this.loading.coin_list = 'error';
                    this.$notice.toast({ message: resData.message })
                }
                
            }).catch((e) => {
                this.loading.coin_list = 'error';
                console.log(e.message)
            });
        },
        getSelectedTag() {
            let selected_hot_tag = this.hot_tag.items.filter((item) => {
                return item.is_selected === true;
            });
            let selected_market_tag = this.market_tag.items.filter((item) => {
                return item.is_selected === true;
            });
            let items = selected_hot_tag.concat(selected_market_tag);
            return items;
        },
        goSearchCoin() {
            this.$router.open({
                name: 'SearchCoin',
                params: {}
            })
        }
    },
    computed: {
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #434343;
    font-family: iconfont2;
    font-size: 45px;
}

.fliters_selecoin_box {
    position: relative;
}

.home_box {
    position: relative;
    width: 750px;
}

.content {
    
}

.mark_title {
    padding-bottom: 20px;
    font-size: 30px;
}

.list {
    width: 750px;
    margin-top: 10px;
    flex-direction: row;
    flex-wrap: wrap;
}

.item {
    margin-bottom: 10px;
    width: 228px;
    height: 95px;
    flex-direction: row;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    background-color: @bgf4f5f6;
    border-radius: 6px;
    margin-right: 10px;
    padding-left: 10px;
    padding-right: 10px;
    box-sizing: border-box;
    text-align: center;
}

.active_tab {
    border-width: 3px;
    border-color: @main_color;
    box-sizing: border-box;
    color: @main_color;
    background-color: #fff;
}
.active_tab_text {
    color: @main_color;
}
.picker {
    width: 228px;
    height: 95px;
    flex-direction: row;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
}
.active_picker {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.name {
    width: 228px;
    flex-direction: row;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    font-size: 26px;
    text-align: center;
    lines: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

.value {
    width: 228px;
    overflow: hidden;
    text-overflow: ellipsis;
    line: 1;
    white-space: nowrap;
    word-wrap: normal;
    box-sizing: border-box;
    font-size: 26px;
    text-align: center;
}

.mark_box {
    padding: 25px;
    background-color: #fff;
    margin-bottom: 20px;
}

.result_box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 750px;
    height: 80px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    line-height: 80px;
    background-color: #fff;
    border-bottom-width: 1px;
    border-color: #eee;
}
.is_phonex {
    bottom: 0;
}
.bmrichtext {
    flex-direction: row;
    padding-left: @padding_size;
}
.result {
    background: #1d1e2b;
}

.btn {
    height: 80px;
    line-height: 80px;
    width: 270px;
    background-color: @main_color;
    color: #fff;
    font-size: 28px;
    text-align: center;
}
.btn_gray {
    background-color: #dbdbdb;
    height: 80px;
    line-height: 80px;
    width: 270px;
    color: #fff;
    font-size: 28px;
    text-align: center;
}
.btn_text {
    text-align: center;
    color: #fff;
    line-height: 80px;
}
.res_text {
    font-size: 26px;
}
.count {
    font-size: 26px;
    color: @main_color;
}

</style>
