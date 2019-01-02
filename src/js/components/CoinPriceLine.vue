<template>
    <div class="EchartLine_box">
        <div class="line_hd">
            <div class="tabs">
                <text :class="['tab', tab.active && 'active']" @click="tabChart(tab)" v-for="tab in tab_items" :key="tab.name">{{tab.name}}</text>
            </div>
        </div>
        <div class="line_bd" :style="{width:750, height: line_height}">
            <bmchart ref="chart" :options="$format(line_option)" :style="{width:750, height: line_height}" @finish='finish' v-if="loading.coin === 'loaded'"></bmchart>
            <div class="loading_box" :style="{width: 750, height: line_height}" v-if="loading.coin !== 'loaded' || loading_echart">
                <Loadmore :loading="loading.coin" class="loading"></Loadmore>
            </div>
        </div>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import { API_BaseUrl } from '../config/config.js'
import Loadmore from './Loadmore.vue'
export default {
    components: { Loadmore },
    data() {
        return {
            filters,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            line_option: {},
            tab_items: [{
                name: this.$t('1天'),
                keyword: '1d',
                value: '',
                format: 'MM-dd hh:mm',
                active: true
            }, {
                name: this.$t('7天'),
                keyword: '7d',
                value: '',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('1个月'),
                keyword: '1m',
                value: '',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('1年'),
                keyword: '1y',
                value: '',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('今年'),
                keyword: 'YTD',
                value: '',
                format: 'yyyy-MM-dd',
                active: false
            }, {
                name: this.$t('所有'),
                keyword: 'ALL',
                value: '',
                format: 'yyyy-MM-dd',
                active: false
            }],
            line_height: 350,
            current_tab: {
                format: 'MM-dd hh:mm',
            },
            router_params: {},
            loading: {
                coin: 'loading'
            },
            loading_echart: true,
        }
    },
    created() {
        this.init();
    },
    props: {
        refresh: {
            type: Boolean,
            default: false,
        }
    },
    watch: {
        refresh(newValue) {
            if (newValue) {
                this.getCoinHistory();
            }
        }
    },
    methods: {
        init() {
            this.getRouterParams();
            this.current_tab = this.tab_items[0];
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.fetchCoinPriceHistory();
            })
        },
        tabChart(tab) {
            for (let item of this.tab_items) {
                item.active = false;
            }
            tab.active = true;
            this.current_tab = tab;
            this.fetchCoinPriceHistory();
            this.$emit('tabChart', tab)
        },
        finish() {
            this.loading_echart = false;
        },
        initEchartLine(result) {
            this.loading_echart = true;
            let xAis_time = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            let data_series_line = [154, 1244, 2124, 412, 124, 214, 412, 3414, 624, 541, 351, 214];
            let data_series_bar = [10, 52, 200, 334, 390, 330, 412, 124, 214, 412, 3414, 624];
            xAis_time = [];
            data_series_line = [];
            data_series_bar = [];
            for (let item of result.price_usd) {
                xAis_time.push(this.filters.dateFormat(item[0] / 1000, (this.current_tab.format || 'MM-dd hh:mm')));
                data_series_line.push(item[1]);
            }
            for (let item of result.volume_usd) {
                data_series_bar.push(item[1])
            }
            let max = parseInt(Math.max(...data_series_line));
            let min = parseInt(Math.min(...data_series_line));
            let max_volume_usd = Math.max(...data_series_bar);
            let volume_usd_unit = '';
            if (this.$locale() === 'en' || this.$locale() === 'ind') {
                if (max_volume_usd > 1000000000) {
                    volume_usd_unit = this.$t('十亿');
                    data_series_bar = [];
                    data_series_bar = result.volume_usd.map((item) => {
                        return item[1] / 1000000000
                    })
                }
                if (max_volume_usd < 1000000000 && max_volume_usd >= 1000000) {
                    volume_usd_unit = this.$t('百万');
                    data_series_bar = [];
                    data_series_bar = result.volume_usd.map((item) => {
                        return item[1] / 1000000
                    })
                }
            } else {
                if (max_volume_usd > 100000000) {
                    volume_usd_unit = this.$t('亿');
                    data_series_bar = [];
                    data_series_bar = result.volume_usd.map((item) => {
                        return item[1] / 100000000
                    })
                }
                if (max_volume_usd < 100000000 && max_volume_usd >= 10000) {
                    volume_usd_unit = this.$t('万');
                    data_series_bar = [];
                    data_series_bar = result.volume_usd.map((item) => {
                        return item[1] / 10000
                    })
                }
            }
            let option = {
                backgroundColor: '#ffffff',
                renderer: this.is_ios ? 'canvas' : 'svg',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#aaa',
                            type: 'solid'
                        }
                    },
                    backgroundColor: 'rgba(0,0,0, 0.7)',
                    textStyle: {
                        fontSize: 10,
                        color: '#fff'
                    },
                    padding: 5,
                    position: function(pos, params, el, elRect, size) {
                        var obj = { top: 10 };
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 10;
                        return obj;
                    },
                    formatter: function(params, ticket, callback) {
                        let str = '';
                        let time_str = '';
                        let items = params.sort(function(a, b) {
                            return (a.axisIndex - b.axisIndex)
                        });
                        for (let item of items) {
                            let xname = item.axisId.replace('1', '');
                            xname = xname.replace('0', '');
                            let yvalue = new Number(item.value);
                            if (yvalue > 1) {
                                yvalue = (yvalue.toFixed(2))
                            } else if (yvalue < 1 && yvalue >= 0.01) {
                                yvalue = (yvalue.toFixed(3))
                            } else if (yvalue < 0.01 && yvalue >= 0.001) {
                                yvalue = (yvalue.toFixed(4))
                            } else if (yvalue < 0.001 && yvalue >= 0.0001) {
                                yvalue = (yvalue.toFixed(5))
                            } else if (yvalue < 0.0001 && yvalue >= 0.00001) {
                                yvalue = (yvalue.toFixed(6))
                            } else {
                                yvalue = yvalue;
                            }
                            time_str = `<div style="display: flex;"><span style="flex: 1;padding-right: 10px;">${xname}：</span><span style="flex: 1;text-align: right;">${item.axisValue}</span></div>`;
                            str += `<div style="display: flex;"><span style="flex: 1;padding-right: 10px;">${item.seriesName}：</span><span style="flex: 1;text-align: right;">${yvalue} USD</span></div>`
                        }
                        return time_str + str;
                    },
                },
                axisPointer: {
                    link: { xAxisIndex: 'all' },
                    label: {
                        backgroundColor: '#777'
                    }
                },
                legend: {
                    data: [this.$t('价格'), `${this.$t('24H成交额')}（${volume_usd_unit}）`],
                    top: 4,
                    right: 0,
                    itemWidth: 20,
                    itemHeight: 7,
                    textStyle: {
                        fontSize: 10,
                    }
                },

                dataZoom: [{
                        type: 'inside',
                        show: true,
                        realtime: true,
                        start: 0,
                        // end: 100,
                        xAxisIndex: [0, 1],
                        bottom: '5%'
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 0,
                        // end: 100,
                        xAxisIndex: [0, 1],
                    }
                ],
                grid: [{
                    left: 0,
                    right: 0,
                    height: '40%',
                    top: 25,
                }, {
                    left: 0,
                    right: 0,
                    top: '53.7%',
                    height: '30%'
                }],
                xAxis: [{
                        name: this.$t('时间'),
                        show: false,
                        type: 'category',
                        axisLine: { onZero: true },
                        data: xAis_time,
                        axisPointer: {
                            label: {
                                show: false,
                            }
                        }
                    },
                    {
                        name: this.$t('时间'),
                        gridIndex: 1,
                        type: 'category',
                        axisLine: { onZero: true },
                        data: xAis_time,
                        position: 'bottom',
                        axisTick: {
                            show: false,
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            color: '#434343',
                            align: 'right'
                        },
                        axisPointer: {
                            label: {
                                fontSize: 10,
                                backgroundColor: '#434343',
                                padding: [3, 5, 3, 5],
                            }
                        }
                    }
                ],
                yAxis: [{
                        position: 'right',
                        scale: true,
                        zlevel: 0, // 使坐标数值最上层
                        axisLine: {
                            lineStyle: {
                                color: '#fff',
                            },
                        },
                        axisLabel: {
                            formatter: '{value}',
                            color: '#CC9A41',
                            fontSize: '10',
                            inside: true,
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(249, 198, 121, 0.2)',
                                type: 'dashed',
                            }
                        },
                        axisPointer: {
                            label: {
                                fontSize: 10,
                                backgroundColor: '#434343',
                                padding: [3, 5, 3, 5],
                            },
                            z: 100
                        }
                    },
                    {
                        scale: true,
                        gridIndex: 1,
                        splitNumber: 2,
                        zlevel: 1, // 使坐标数值最上层
                        axisLabel: {
                            show: true,
                            formatter: '{value} ' + volume_usd_unit,
                            fontSize: '10',
                            inside: true,
                        },
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: {
                            show: false,
                            lineStyle: {
                                color: '#f7f7f7',
                                type: 'dashed',
                            }
                        },
                        axisPointer: {
                            label: {
                                fontSize: 10,
                                backgroundColor: '#434343',
                                padding: [3, 5, 3, 5],
                            },
                            z: 100
                        }
                    }
                ],
                series: [{
                        name: this.$t('价格'),
                        type: 'line',
                        smooth: false,
                        symbolSize: false,
                        itemStyle: {
                            normal: {
                                color: '#F7B642',
                            },
                        },
                        lineStyle: {
                            normal: {
                                width: 1.5,
                            }
                        },
                        data: data_series_line
                    },
                    {
                        name: `${this.$t('24H成交额')}（${volume_usd_unit}）`,
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        symbolSize: 8,
                        hoverAnimation: false,
                        itemStyle: {
                            normal: {
                                color: '#6ea0f9',
                            },
                        },
                        data: data_series_bar
                    }
                ]
            };
            this.line_option = option;
        },
        storageSetCoinPriceHistory({ price_usd, volume_usd }) {
            this.$storage.setSync('coin_price_line_' + this.router_params.symbol_id, {
                data: {
                    price_usd,
                    volume_usd
                },
                expired: Date.now() + 5 * 60 * 1000
            });
        },
        getCoinPriceHistoryFromLocalStorage() {
            let data = this.$storage.getSync('coin_price_line_' + this.router_params.symbol_id);
            if (Date.now() < data.expired) {
                this.initEchartLine(data.data);
            } else {
                console.log('getCoinPriceHistoryFromLocalStorage', 'expired');
            }
        },
        fetchCoinPriceHistory() {
            this.getCoinPriceHistoryFromLocalStorage();
            this.getCoinHistory();
        },
        getCoinHistory() {
            let params = {};
            params.date = this.current_tab.keyword;
            this.loading.coin = 'loading';
            params.symbol = this.router_params.symbol;
            params.symbol_id = this.router_params.symbol_id;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/price_history`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin = 'loaded';
                    if (!resData.result.price_usd || !resData.result.price_usd.length) {
                        this.loading.coin = 'empty';
                    } else {
                        this.storageSetCoinPriceHistory(resData.result);
                        this.initEchartLine(resData.result);
                    }
                } else {
                    this.loading.coin = 'error';
                    // this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.coin = 'error';
                console.log(e.message);
            });
        },
        fixNumber(number, num = 2) {
            if (Math.abs(number) < 1) {
                return number;
            }
            number = number || 0;
            let result = new Number(number).toFixed(num);
            result % 1 === 0 ? result = parseFloat(result) : result = result;
            return result;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.EchartLine_box {
    position: relative;
}

.line_bd {
    position: relative;
}

.line_hd {
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
    border-bottom-width: 1px;
    border-color: #eee;
    background-color: #fff;
}

.tabs {
    flex-direction: row;
    margin-left: 28px;
}

.tab {
    flex: 1;
    line-height: 60px;
    margin-right: 60px;
    text-align: center;
    color: #333;
    font-size: 20px;
}

.tab:last-child {
    margin-right: 0;
}

.active {
    border-bottom-width: 3px;
    border-color: @main_color;
}

.loading_box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
    margin: auto;
    background-color: #fff;
}

.loading {
    margin-top: 40px;
}

</style>
