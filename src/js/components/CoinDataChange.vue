<template>
    <div class="contains">
        <list class="list_box" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="300" :style="{ height: page_height + 'px' }">
            <Refresher @refresh="refresh"></Refresher>
            <cell class="box_hd">
                <div class="hd_image">
                    <bmchart class="cahrt_box" :options="$format(gauge_option)" :style="{ height: 270}" v-if="loading.changeIndex === 'loaded'"></bmchart>
                    <div class="label_box" v-if="loading.changeIndex === 'loaded'">
                        <text class="label_text label_text_left">{{ $t('冷淡') }}</text>
                        <text class="label_text label_text_right">{{ $t('活跃') }}</text>
                    </div>
                </div>
                <div class="hd_right">
                    <text class="hd_right_text">{{changeIndex.text}}</text>
                </div>
            </cell>
            <cell class="box_bd">
                <div class="bd_list" v-for="(mess,mess_i) in messages" :key="mess_i">
                    <CellItem class="cellitem" :has-arrow="false" @wxcCellClicked="showList(mess_i)" :has-top-border="false" title="" :hasVerticalIndent="false" titleIconSize="40" extraContent="" titlecolor="red">
                        <div slot="title" class="less_row">
                            <text :class="['icon',(mess.open)?'cell_left_downicon':'cell_left_upicon']">&#xe925</text>
                            <text class="cell_left_text" :style="{fontSize: language === 'zh-CN' ? '30px' : '28px'}">{{mess.cn}}</text>
                            <text class="icon cell_icon" @click="goCoinExplain(mess.name)">&#xe936</text>
                        </div>
                        <div slot="value" class="less_row">
                            <text class="cell_time">{{mess.update_time_str}}</text>
                            <text class="cell_num">{{mess.length}}</text>
                        </div>
                    </CellItem>
                    <div class="cell_box" v-if="mess.open && mess.changes.length>0">
                        <div class="item tb_hd">
                            <div class="tb_td name">
                                <text class="tb_th">{{mess.menus[0].cn}}</text>
                            </div>
                            <div class="tb_td price">
                                <text class="tb_th txt_r">{{mess.menus[1].cn}}</text>
                            </div>
                            <div class="tb_td change">
                                <text class="tb_th txt_r">{{mess.menus[2].cn}}</text>
                            </div>
                        </div>
                    </div>
                    <div class="cell_item" v-for="(coin, index)  in mess.changes" :key="index" v-if="mess.open">
                        <CoinItemRank :coin="coin"> </CoinItemRank>
                    </div>
                    <Loadmore v-if="mess.open && !mess.changes.length"  blankpagetype="changetext" loading="no" bgcolor="white"></Loadmore>
                </div>
            </cell>
             <cell class="tabbar_height"></cell>
        </list>
    </div>
</template>
<script>
import { Utils } from 'weex-ui'
import CoinItemRank from './CoinItemRank.vue'
import CellItem from './CellItem.vue'
import EchartLine from './EchartLine.vue'
import Loadmore from './Loadmore.vue'
import Refresher from './Refresher.vue'
import common from '../config/common';
export default {
    components: {
        CoinItemRank,
        CellItem,
        EchartLine,
        Loadmore,
        Refresher
    },
    data() {
        return {
            messages: [],
            gauge_option: {},
            loading: {
                sentiments_data: 'loaded',
                changeIndex: 'loading',
            },
            changeIndex: {},
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
    created() {},
    methods: {
        init() {
            if (!this.changeIndex.index) {
                this.getCoinChangeIndex();
            }
            if (!this.messages.length) {
                this.getCoinChangeEvents();
            }
        },
        showList(click_i) {
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(this.messages[click_i].event_name || '');
            this.messages[click_i].open = !this.messages[click_i].open;
            let cache_open = common.storageGetData('cache_datachange', true) || [];
            for(let x=0; x< cache_open.length; x++) {
                if(cache_open[x].name === this.messages[click_i].name) {
                    cache_open.splice(x,1);
                }
            }
            cache_open.push({name: this.messages[click_i].name, open: this.messages[click_i].open})
            common.storageSetData('cache_datachange',cache_open);
        },
        refresh() {
            this.getCoinChangeEvents();
            this.getCoinChangeIndex();
        },
        getEchartOption(coin) {
            let options = {
                color: '#20cba8',
                name: this.$t('价格趋势'),
                show_tooltip: false,
                show_xAxis: false,
                yAxis: false,
                show_legend: false,
                xAxis_axisPointer: false,
                yAxis_axisPointer: false,
                height: 60,
                width: 200,
                grid: [{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }],
            };
            if (coin.percent_change_8am > 0) {
                options.color = '#48d4b8'
            } else {
                options.color = '#f7826e'
            }
            return options;
        },
        getCoinChangeEvents() {
            let params = {};
            this.$fetch({
                name: 'getCoinChangeEvents',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    this.messages = resData.items;
                    for(const x of this.messages) { //数据替换为缓存的
                        for(const y of common.storageGetData('cache_datachange', true)) {
                            if(x.name === y.name) {
                                x.open = y.open;
                            }
                        }
                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        initGaugeEchart() {
            // 移动指数值
            let index_value = this.changeIndex.index;
            let linear_bottom_to_top = {
                type: 'linear',
                x: 1,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [{
                    offset: 0,
                    color: '#5c61eb' // 0% 处的颜色
                }, {
                    offset: 1,
                    color: '#2fbbd0' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
            };
            let linear_left_to_right = {
                type: 'linear',
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                colorStops: [{
                    offset: 0,
                    color: '#5c61eb' // 0% 处的颜色
                }, {
                    offset: 1,
                    color: '#2fbbd0' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
            };
            let option = {
                backgroundColor: "#fff",
                grid: [{
                    left: 0,
                    right: 0,
                    top: 20,
                    bottom: 0,
                }],
                series: [{
                        name: this.$t('刻度'),
                        type: 'gauge',
                        radius: '90%',
                        center: ['50%', '56%'],
                        min: 0,
                        max: 100,
                        splitNumber: 5, //刻度数量
                        startAngle: 210,
                        endAngle: -31,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                width: 1,
                                color: [
                                    [1, 'rgba(0,0,0,0)']
                                ]
                            }
                        }, //仪表盘轴线
                        axisLabel: {
                            show: true,
                            color: '#c2cad6',
                            distance: -21,
                            fontSize: 10,
                        }, //刻度标签。
                        axisTick: {
                            show: false,
                            lineStyle: {
                                color: '#c2cad6',
                                width: 0
                            },
                            length: -4
                        }, //刻度样式
                        splitLine: {
                            show: true,
                            length: 4,
                            lineStyle: {
                                color: '#c2cad6'
                            }
                        }, //分隔线样式
                        detail: {
                            show: false
                        },
                        pointer: {
                            show: false
                        }
                    },
                    {
                        type: 'gauge',
                        radius: '80%',
                        center: ['50%', '56%'],
                        splitNumber: 0, //刻度数量
                        startAngle: 210,
                        endAngle: -31,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                // 表盘进度条宽度
                                width: 9,
                                color: [
                                    [
                                        // 取值百分比处的颜色
                                        index_value / 100, index_value >= 60 ? linear_left_to_right : linear_bottom_to_top
                                    ],
                                    [
                                        1, '#e2e9f4'
                                    ]
                                ]
                            }
                        },
                        //分隔线样式。
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        pointer: {
                            show: false
                        },
                        title: {
                            show: true,
                            offsetCenter: [0, '85%'], // x, y，单位px
                            textStyle: {
                                color: '#434343',
                                fontSize: 12
                            }
                        },
                        //仪表盘详情，用于显示数据。
                        detail: {
                            show: true,
                            offsetCenter: [0, '-10%'],
                            color: '#5a64ea',
                            formatter: function(params) {
                                return params
                            },
                            textStyle: {
                                fontSize: 30,
                                fontWeight: 'bold',
                            }
                        },
                        data: [{
                            name: this.$t('异动指数'),
                            value: index_value
                        }]
                    }
                ]
            };
            this.gauge_option = option;
        },
        goCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                    pagename: 'Change'
                }
            })
        },
        getCoinChangeIndex() {
            let params = {};
            this.loading.changeIndex = 'loading';
            this.$fetch({
                name: 'getCoinChangeIndex',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    this.loading.changeIndex = 'loaded';
                    this.changeIndex = resData.result || {};
                    this.$storage.setSync('coin_change_changeIndex', this.changeIndex);
                    this.initGaugeEchart();
                } else {
                    this.getlocalCoinChangeIndex();
                }
            }).catch((err) => {
                this.getlocalCoinChangeIndex();
            });
        },
        getlocalCoinChangeIndex() {
            let coin_coin_change_changeIndex = this.$storage.getSync('coin_change_changeIndex');
            if (coin_coin_change_changeIndex && !coin_coin_change_changeIndex) {
                this.loading.changeIndex = 'error';
            } else {
                this.loading.changeIndex = 'loaded';
                this.changeIndex = coin_coin_change_changeIndex || {};
                this.initGaugeEchart();
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        language() {
            return this.$storage.getSync('language');
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.contains {
    width: 750px;
}
.list_box {
}
.icon {
    font-family: iconfont2;
    font-size: 15px;
}

.box_hd {
    flex-direction: row;
    align-items: center;
    min-height: 300px;
    background-color: #fff;
}
.box_bd {
    padding-bottom: 20px;
}
.hd_image {
    position: relative;
    padding: 25px 0;
    flex: 1;
    flex-direction: column;
}

.cahrt_box {
    flex: 1.5;
}

.label_box {
    position: absolute;
    bottom: 30;
    left: 0;
    right: 0;
    flex-direction: row;
    justify-content: center;
}

.label_text {
    flex: 1;
    font-size: 18px;
    color: #bfc7d4;
}

.label_text_left {
    position: relative;
    right: 20px;
    text-align: center;
}

.label_text_right {
    position: relative;
    left: 17px;
    text-align: center;
}

.hd_right {
    flex: 1;
    flex-direction: column;
    justify-content: center;
}

.hd_right_text {
    font-size: 26px;
    color: #434343;
    line-height: 40px;
    padding: 20px 15px;
}

.index_image {
    width: 750px;
}

.icon {
    font-family: iconfont2;
    font-size: 15px;
    margin: 20px 0;
}

.less_row {
    align-items: center;
    height: 80px;
}

.bd_list {
    margin-top: 25px;
}

.cell_item {
    width: 750px;
    background-color: #fff;
}



.cell_left {
    padding: 25px;
    flex: 4;
    flex-direction: row;
}

.cell_left_text {
    color: #333333;
    font-size: 30px;
    padding: 0 8px 0 12px;
}

.cell_left_upicon {
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(-90deg);
}

.cell_left_downicon {
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(0deg);
}

.cell_icon {
    color: #777777;
    font-size: 35px;
    margin: 1px;
}

.coin_change {
    width: 150px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
    text-align: center;
    font-size: 28px;
}



.cell_time {
    color: #9b9da4;
    font-size: 24px;
    padding-right: 20px;
}

.cell_num {
    color: #f7b237;
    font-size: 28px;
}

.cny {
    margin-left: 20px;
    font-size: 32px;
    color: #434343;
}

// 列表的表头
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
    padding-left: 25px;
    padding-right: 25px;
    padding-top: 15px;
    padding-bottom: 15px;
}


.rank {
    width: 120px;
}

.price {
    width: 230px;
}
.change{
    flex: 1;
}
.name {
    width: 220px;
}

.text {
    font-size: 28px;
}

.tb_th {
    font-size: 24px;
    color: #9B9DA4;
}

</style>
