<template>
    <div class="contains">
        <list class="home_box" :show-scrollbar="true" offset-accuracy="100" loadmoreoffset="300" :style="{ height: (page_height) + 'px' }">
            <Refresher @refresh="refresh"></Refresher>
            <cell class="box_hd">
                <div class="hd_today">
                    <div class="today_right">
                        <EchartLine :data_x="echartline_data.sentiments_data_x" :data_y="echartline_data.sentiments_data_y" :loading="loading.sentiments_data" :echart_option="bzh_echart_option"></EchartLine>
                        <text class="today_right_text">{{ $t('24h') }} {{ $t('行情') }}</text>
                    </div>
                    <div class="today_left">
                        <div class="today_box">
                            <div class="left_hd" @click="goCoinExplain('bzhzhishu')">
                                <text class="left_hd_text">{{ $t('币智慧') }} 300 {{ $t('指数') }}</text>
                                <text class="icon cell_icon">&#xe936</text>
                            </div>
                            <text class="left_bd">{{messagebzh.bzh300}}</text>
                            <div class="left_ft">
                                 <text :class="['left_ft_l', messagebzh.bzh300_sum_change >= 0 ? 'safe' : 'warn']">{{messagebzh.bzh300_change_str}}</text>
                                <text :class="['left_ft_r', messagebzh.bzh300_sum_change >= 0 ? 'safe' : 'warn']">{{messagebzh.bzh300_change_percent_str}}</text>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hd_change">
                    <div class="change_data" v-if="loading.change_distribution === 'loaded'">
                        <CellItem :has-top-border="false" title="" titleIconSize="36">
                            <div slot="title" class="less_row" @click="goCoinExplain('zhangdiefenbu')">
                                <text class="cell_left_text">{{ $t('涨跌分布') }}</text>
                                <text class="icon cell_icon">&#xe936</text>
                            </div>
                        </CellItem>
                        <div class="change_num">
                            <div class="num_down">
                                <text class="icon icon_down">&#xe90f;</text>
                                <text class="down_big">{{change_distribution.total_under}}</text>
                                <text class="down_little">({{change_distribution.total_under_str}})</text>
                            </div>
                            <text class="num_split"></text>
                            <div class="num_up">
                                <text class="icon icon_up">&#xe90f;</text>
                                <text class="up_big">{{change_distribution.total_up}}</text>
                                <text class="up_little">({{change_distribution.total_up_str}})</text>
                            </div>
                        </div>
                        <div class="echart_box">
                            <bmchart :options="$format(line_option)" :style="{width:750, height: 300}"></bmchart>
                        </div>
                    </div>
                    <div class="loading_box" v-if="loading.change_distribution !== 'loaded'">
                        <Loadmore :loading="loading.change_distribution" class="loading" ></Loadmore>
                    </div>
                </div>
            </cell>
            <cell class="box_bd">
                <MarketItem :refresh="refreshing" @refreshEnd="onRefreshEnd"></MarketItem>
            </cell>
        </list>
    </div>
</template>
<script>
import { Utils } from 'weex-ui'
import CellItem from './CellItem.vue'
import CoinItemInfo from './CoinItemInfo.vue'
import MarketItem from './MarketItem.vue'
import EchartLine from './EchartLine.vue'
import Loadmore from './Loadmore.vue'
import Refresher from './Refresher.vue'
export default {
    components: {
        CellItem,
        CoinItemInfo,
        MarketItem,
        EchartLine,
        Loadmore,
        Refresher
    },
    data() {
        return {
            line_option: {},
            bzh_echart_option: {
                color: '#0078f5',
                name: this.$t('情绪指数'),
                show_tooltip: false,
                show_legend: false,
                xAxis_axisPointer: false,
                yAxis_axisPointer: false,
                show_yAxis: false,
                show_xAxis: false,
                height: 250,
                width: 400,
                grid: [{
                    left: 0,
                    right: 15,
                    top: 25,
                    bottom: 15,
                }],
            },
            echartline_data: {
                sentiments_data_x: [],
                sentiments_data_y: []
            },
            loading: {
                sentiments_data: 'loading',
                change_distribution: 'loading'
            },
            change_distribution: {},
            refreshing: false,
            messagebzh: {},
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
            if (!this.echartline_data.sentiments_data_x.length) {
                this.getCoinMarketBzh();
            }
            if (!this.change_distribution.total_up || !this.change_distribution.total_under) {
                this.getCoinChangeDistribution();
            }
        },
        refresh() {
            this.getCoinMarketBzh();
            this.getCoinChangeDistribution();
            this.refreshing = true;
        },
        onRefreshEnd() {
            this.refreshing = false;
        },
        initEchartDistribution() {
            let axis_x = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, ''];
            let change = this.change_distribution;
            let data_y = [];
            data_y.push(change.under_ten || 0);
            data_y.push(change.under_eight || 0);
            data_y.push(change.under_six || 0);
            data_y.push(change.under_four || 0);
            data_y.push(change.under_two || 0);
            data_y.push(change.under_zero || 0);
            data_y.push(change.up_zero || 0);
            data_y.push(change.up_two || 0);
            data_y.push(change.up_four || 0);
            data_y.push(change.up_six || 0);
            data_y.push(change.up_eight || 0);
            data_y.push(change.up_ten || 0);

            let linear_warn = {
                type: 'linear',
                x: 1,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [{
                    offset: 0,
                    color: '#FE3F66' // 0% 处的颜色
                }, {
                    offset: 1,
                    color: '#FB754C' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
            };
            let linear_safe = {
                type: 'linear',
                x: 1,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [{
                    offset: 0,
                    color: '#4AE2A7' // 0% 处的颜色
                }, {
                    offset: 1,
                    color: '#23C7AE' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
            };
            let series_y = [];
            for (let [index, y] of data_y.entries()) {
                series_y.push({
                    value: y,
                    label: {
                        normal: {
                            color: '#7c7e84',
                            show: true,
                            fontSize: 10,
                            position: 'top',
                        }
                    },
                    itemStyle: {
                        normal: {
                            origin: 'end',
                            barBorderRadius: [3, 3, 0, 0],
                            color: (axis_x[index] <= 0 && axis_x[index] !== '') ? linear_warn : linear_safe
                        }
                    }
                })
            }
            let option = {
                backgroundColor: '#ffffff',
                legend: {
                    show: false,
                    data: [this.$t('涨跌分布')],
                    top: 4,
                    itemWidth: 20,
                    itemHeight: 7,
                    textStyle: {
                        fontSize: 10,
                    }
                },
                grid: [{
                    left: 15,
                    right: 15,
                    top: 15,
                    bottom: 25,
                }],
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    scale: true,
                    data: axis_x,
                    axisTick: {
                        interval: 0,
                        inside: true,
                        length: 3,
                        lineStyle: {
                            color: '#f0f1f6'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#f0f1f6'
                        }
                    },
                    axisLabel: {
                        margin: 7,
                        color: '#7c7e84',
                        fontSize: 9,
                        align: 'left',
                        padding: [0, 0, 0, 7],
                        formatter: function(value) {
                            if (value == 0 || value == '') {
                                return '  ' + value
                            } else {
                                return value + '%';
                            }
                        }
                    },
                    axisPointer: {
                        show: false,
                        label: { show: false },
                        lineStyle: {
                            color: '#999',
                            type: 'dashed',
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    position: 'right',
                    show: false,
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#434343',
                        },
                    },
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                },
                series: [{
                    name: this.$t('涨跌分布'),
                    type: 'bar',
                    barWidth: '65%',
                    data: series_y
                }]
            };
            this.line_option = option;
        },
        goCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                    pagename: 'Market'
                }
            })
        },
        getCoinMarketBzh() {
            let params = {};
            params.size = 30;
            this.loading.sentiments_data = 'loading';
            this.$fetch({
                name: 'getCoinMarketBzh300',
                methods: 'GET',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.loading.sentiments_data = 'loaded';
                    this.messagebzh = resData.bzh300;
                    this.$storage.setSync('coin_data_market_bzh300', resData || {});
                    this.fixBzh300Index(resData.items);
                } else {
                    this.$notice.toast({ message: resData.message })
                    this.getlocalBzh300IndexData();
                }
            }).catch((e) => {
                this.getlocalBzh300IndexData();
            });
        },
        getlocalBzh300IndexData() {
            let coin_data_market_bzh300 = this.$storage.getSync('coin_data_market_bzh300') || {};
            if (coin_data_market_bzh300 && !coin_data_market_bzh300.items) {
                this.loading.sentiments_data = 'error';
            } else {
                this.loading.sentiments_data = 'loaded';
                this.messagebzh = coin_data_market_bzh300.bzh300;
                this.fixBzh300Index(coin_data_market_bzh300.items);
            }
        },
        fixBzh300Index(items) {
            this.echartline_data.sentiments_data_x = [];
            this.echartline_data.sentiments_data_y = [];
            for (let item of items) {
                this.echartline_data.sentiments_data_x.push(item.update_time);
                this.echartline_data.sentiments_data_y.push(item.bzh300);
            }
            if (!this.echartline_data.sentiments_data_x.length) {
                this.loading.sentiments_data = 'empty';
            }
        },
        getCoinChangeDistribution() {
            let params = {};
            this.loading.change_distribution = 'loading';
            this.$fetch({
                name: 'getCoinChangeDistribution',
                methods: 'GET',
                data: params,
            }).then((resData) => {
                if (resData.error === 0) {
                    this.loading.change_distribution = 'loaded';
                    this.change_distribution = resData.result || {};
                    this.$storage.setSync('coin_change_distribution', this.change_distribution);
                    this.initEchartDistribution();
                } else {
                    this.getlocalCoinChangeDistribution();
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((err) => {
                this.getlocalCoinChangeDistribution();
                console.error(err);
            });
        },
        getlocalCoinChangeDistribution() {
            let coin_change_distribution = this.$storage.getSync('coin_change_distribution');
            if (coin_change_distribution && !coin_change_distribution.total_under) {
                this.loading.change_distribution = 'error';
            } else {
                this.loading.change_distribution = 'loaded';
                this.change_distribution = coin_change_distribution || {};
                this.initEchartDistribution();
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        get_currency_symbol() {
            return this.$storage.getSync("currency").currency_symbol;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
    font-size: 15px;
    margin: 20px 0;
}

.contains {
    width: 750px;
}

// 今日行情
.hd_today {
    height: 250px;
    position: relative;
    background-color: #fff;
    flex-direction: row;
}

.today_left {
    position: absolute;
    top: 0;
    left: 0;
    width: 750px;
    background-image: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
}

.today_box {
    padding: 40px;
    background-image: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
    width: 500px;
}

.left_hd {
    align-items: center;
    flex-direction: row;
}

.left_hd_text {
    font-size: 30px;
    color: #434343;
}

.left_bd {
    color: #4c7be2;
    font-size: 56px;
    padding: 20px 0;
    font-weight: bold;
}

.left_ft {
    flex-direction: row;
}

.left_ft_l {
    flex: 1;
    color: #00c39c;
    font-size: 28px;
}

.left_ft_r {
    padding-right: 25px;
    flex: 2;
    color: #00c39c;
    font-size: 28px;
}

.today_right {
    position: absolute;
    top: 0;
    right: 0;
}

.today_right_text {
    color: #afbbd6;
    font-size: 30px;
    position: absolute;
    top: 38px;
    right: 30px;
}

// 涨跌分布
.hd_change {
    width: 750px;
    height: 510px;
    position: relative;
    background-color: #fff;
    margin: 25px 0;
}

.change_num {
    flex-direction: row;
    margin-top: 28px;
}

.cell_left_text {
    color: #333333;
    font-size: 30px;
    padding: 0 8px 0 12px;
}

.cell_icon {
    color: #777777;
    font-size: 35px;
    margin: 1px;
}

.num_down {
    flex: 1;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.icon_down {
    position: relative;
    top: 5px;
    color: #f5593f;
    transform: rotate(180deg);
    margin: 15px 0;
}

.down_big {
    font-size: 50px;
    color: #f5593f;
    line-height: 48px;
    margin: 0 15px;
    font-weight: bold;
}

.down_little {
    font-size: 30px;
    color: #f5593f;
    margin-top: 10px;
}

.num_split {
    background-color: #c3c5c9;
    height: 60px;
    width: 2px;
    transform: rotate(15deg);
}

.num_up {
    flex: 1;
    flex-direction: row;
    justify-content: center;
}

.icon_up {
    position: relative;
    top: 5px;
    color: #00c39c;
    margin: 15px 0;
}

.up_big {
    font-size: 50px;
    color: #00c39c;
    line-height: 48px;
    margin: 0 15px;
    font-weight: bold;
}

.up_little {
    font-size: 30px;
    color: #00c39c;
    margin-top: 10px;
}

.echart_box {
    margin: 20px 0;
}

.bmchart {}

.loading_box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.loading {
    margin-top: 100px;
}

.change_image {
    height: 280;
    width: 750;
}

.box_bd {
    padding-bottom: 100px;
}

.less_row {
    align-items: center;
}

</style>
