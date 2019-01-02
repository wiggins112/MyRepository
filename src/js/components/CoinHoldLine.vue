<template>
    <div class="EchartLine_box">
        <div class="line_hd">
            <div class="item_title" @click="jumpCoinExplain('chibifenxi')">
                <text class="title_line"></text>
                <text class="title_text">{{$t('持币分析')}}</text>
                <text class="icon title_text icon_mark">&#xe936;</text>
            </div>
            <div class="info_items">
                <text class="table_name">{{$t('持币地址数')}}</text>
                <div class="github_box">
                    <text class="github_num" v-if="coin_addrs[0]">{{coin_addrs[0].total_count || '--'}}</text>
                    <text class="github_num" v-if="coin_addrs[0] && coin_addrs[0].has_lastweek_totalcount">，{{$t('较上周')}}{{getLastWeekDelta}}</text>
                </div>
            </div>
            <div class="item_info_table">
                <div class="info_table_hd">
                    <div class="table_item">
                        <text class="table_name">{{$t('前十地址持币占比')}}</text>
                        <text calss="table_text" v-if="coin_addrs[0] && coin_addrs[0].top10">{{coin_addrs[0].top10.toFixed(2)}}</text>
                        <text calss="table_text" v-if="!coin_addrs[0] || !coin_addrs[0].top10">--</text>
                    </div>
                </div>
                <div class="info_table_bd">
                    <div class="table_item">
                        <text class="table_name">{{$t('当前持币集中程度')}}</text>
                        <text :class="[language === 'zh-CN'? 'table_text':'table_text_en']">{{coin_addrs[0]?(coin_addrs[0].gini_level || '--'):'--'}}</text>
                    </div>
                </div>
            </div>
        </div>
        <div class="line_bd" :style="{width:750, height: line_height}">
            <bmchart ref="chart" :options="$format(line_option)" :style="{width:750, height: line_height}" @finish='finish'></bmchart>
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
import common from '../config/common' 
export default {
    components: { Loadmore },
    data() {
        return {
            filters,
            line_option: {},
            line_height: 500,
            router_params: {},
            loading: {
                coin: 'loading'
            },
            coin_addrs: [],
            loading_echart: true,
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                let coin_addrs = common.storageGetData("my_coin_addrs_" + this.router_params.symbol);
                if (coin_addrs) {
                    this.coin_addrs = coin_addrs;
                    this.loading.coin = 'loaded';
                    this.initEchartLine(this.coin_addrs); //持币分析 折线图
                } else {
                    this.getCoinAddrs();
                }
            })
        },
        finish() {
            this.loading_echart = false;
        },
        jumpCoinExplain(name) {
            this.$router.open({
                name: 'CoinExplain',
                params: {
                    name: name,
                    pagename: 'CoinAnalyse'
                }
            })
        },
        initEchartLine(_items) {
            let items = _items.map(i => i); // 复制数组，避免reverse操作对原来数据的影响
            items.reverse();
            this.loading_echart = true;
            let xAis_time = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            let data_series_line = [154, 1244, 2124, 412, 124, 214, 412, 3414, 624, 541, 351, 214];
            let data_series_line2 = [45, 44, 747, 41, 1424, 174, 432, 2434, 147, 1111, 351, 214];
            let data_series_bar = [10, 52, 200, 334, 390, 330, 412, 124, 214, 412, 3414, 624];
            xAis_time = [];
            data_series_line = [];
            data_series_line2 = [];
            data_series_bar = [];
            let volume_unit = '';
            for (let k of items) {
                xAis_time.push(this.filters.dateFormat(k.update_time / 1000, 'yyyy-MM-dd hh:mm'));
                data_series_line.push((k.top10 / 100).toFixed(2));
                data_series_line2.push((k.gini * 100).toFixed(2));
                data_series_bar.push(k.total_count);
            }
            let max_volume_usd = Math.max(...data_series_bar);
            if (this.$locale() === 'en' || this.$locale() === 'ind') {
                if (max_volume_usd > 1000000000) {
                    volume_unit = this.$t('十亿');
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 1000000000
                    })
                }
                if (max_volume_usd < 1000000000 && max_volume_usd >= 1000000) {
                    volume_unit = this.$t('百万');
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 1000000
                    })
                }
                if (max_volume_usd < 1000000 && max_volume_usd >= 1000) {
                    volume_unit = this.$t('千');
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 1000
                    })
                }
            } else {
                if (max_volume_usd > 100000000) {
                    volume_unit = '亿';
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 100000000
                    })
                }
                if (max_volume_usd < 100000000 && max_volume_usd >= 10000) {
                    volume_unit = '万';
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 10000
                    })
                }
                if (max_volume_usd < 10000 && max_volume_usd >= 1000) {
                    volume_unit = 'k';
                    data_series_bar = [];
                    data_series_bar = items.map((item) => {
                        return item.total_count / 1000
                    })
                }
            }
            let option = {
                backgroundColor: '#ffffff',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0, 0.7)',
                    textStyle: {
                        fontSize: 10,
                        color: '#fff'
                    },
                    padding: 5,
                    axisPointer: {
                        animation: false
                    },
                    formatter: function(params, ticket, callback) {
                        let str = '';
                        let time_str = '';
                        let items = params.sort(function(a, b) {
                            return (a.axisIndex - b.axisIndex)
                        });
                        for (let item of items) {
                            time_str = `${item.axisValue}<br />`;
                            str += `<span style="display: inline-block;margin-right: 5px;width: 7px;height: 7px;border-radius: 50%;background-color: ${item.color};"></span>${item.seriesName}：${item.value} <br />`
                        }
                        return time_str + str;
                    },
                    position: function(pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = { top: 25 };
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    }
                },
                legend: {
                    data: [this.$t('持币集中程度指数'), this.$t('持币地址数')],
                    top: 4,
                    right: 0,
                    itemWidth: 20,
                    itemHeight: 7,
                    textStyle: {
                        fontSize: 10,
                    }
                },
                axisPointer: {
                    link: { xAxisIndex: 'all', animation: false }
                },
                grid: [{
                    left: 0,
                    right: 0,
                    height: '41%',
                    top: 25,
                }, {
                    left: 0,
                    right: 0,
                    height: '41%',
                    top: '50%',
                }, {
                    left: 0,
                    right: 0,
                    top: '58%',
                    height: '30%'
                }],
                xAxis: [{
                        show: false,
                        // boundaryGap: false,
                        type: 'category',
                        data: xAis_time,
                    },
                    {
                        show: false,
                        // boundaryGap: false,
                        gridIndex: 1,
                        type: 'category',
                        axisLine: { onZero: true },
                        data: xAis_time
                    },
                    {
                        gridIndex: 2,
                        type: 'category',
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
                            align: 'right',
                            formatter: function(value) {
                                return echarts.format.formatTime('MM-dd', value);
                            }
                        },
                    }
                ],
                yAxis: [{
                        type: 'value',
                        position: 'right',
                        scale: true,
                        zlevel: 1, // 使坐标数值最上层
                        minInterval: 1,
                        min: function(value) {
                            return parseInt(value.min)
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff',
                            },
                        },
                        axisLabel: {
                            color: '#CC9A41',
                            fontSize: '10',
                            inside: true,
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(249, 198, 121, 0.2)',
                                type: 'dashed',
                            }
                        }
                    },
                    {
                        type: 'value',
                        show: false,
                        position: 'right',
                        scale: true,
                        gridIndex: 1,
                        zlevel: 1, // 使坐标数值最上层
                        min: function(value) {
                            return value.min
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff',
                            },
                        },
                        axisLabel: {
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
                    },
                    {
                        scale: true,
                        gridIndex: 2,
                        zlevel: 1, // 使坐标数值最上层
                        min: function(value) {
                            let min = value.min;
                            let max = value.max;
                            let vol = max - min;
                            return min - vol;
                        },
                        axisLabel: {
                            show: true,
                            fontSize: '10',
                            inside: true,
                            color: '#999',
                            formatter: '{value} ' + volume_unit,
                        },
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: {
                            show: false,
                            lineStyle: {
                                color: '#f7f7f7',
                                type: 'dashed',
                            }
                        }
                    }
                ],
                series: [{
                        name: this.$t('持币集中程度指数'),
                        type: 'line',
                        smooth: false,
                        symbolSize: false,
                        itemStyle: {
                            normal: {
                                color: '#707DF2',
                            },
                        },
                        lineStyle: {
                            normal: {
                                width: 1.5,
                            }
                        },
                        data: data_series_line2
                    },
                    {
                        name: `${this.$t('持币地址数')}(${volume_unit})`,
                        type: 'bar',
                        xAxisIndex: 2,
                        yAxisIndex: 2,
                        hoverAnimation: false,
                        itemStyle: {
                            normal: {
                                color: '#FFABAB',
                            },
                        },
                        data: data_series_bar
                    }
                ]
            };
            this.line_option = option;
        },
        getCoinAddrs() {
            let params = {};
            this.loading.coin = 'loading';
            params.symbol = this.router_params.symbol;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/addrs`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin = 'loaded';
                    if (!resData.items.length) {
                        this.loading.coin = 'empty';
                    } else {
                        this.coin_addrs = resData.items || [{}];
                        this.initEchartLine(this.coin_addrs);
                        common.storageSetData("my_coin_addrs_" + this.router_params.symbol, this.coin_addrs); //缓存数据 
                    }
                } else {
                    this.loading.coin = 'error';
                    this.$notice.toast({ message: resData.message });
                }
            }).catch((e) => {
                this.loading.coin = 'error';
                console.log(e.message);
            });
        },
    },
    computed: {
        getLastWeekDelta() {
            if (!this.coin_addrs[0]) {
                return '--'
            }
            let delta = this.coin_addrs[0].total_count - this.coin_addrs[0].lastweek_totalcount;
            delta = delta > 0 ? '+' + delta : delta;
            return delta || '--';
        },
        language() {
            return this.$storage.getSync("language");
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

.info_items {
    padding: @padding_size;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
    background-color: @bgf4f5f6;
}

.item_title_left {
    flex-direction: row;
    flex: 1;
}

.item_title_right {
    flex: 1;
}

.title_intro {
    text-align: right;
    color: #B0B2B8;
    font-size: 20px;
}

.title_line {
    width: 6px;
    height: 26px;
    background-color: #434343;
}

.title_text {
    margin-left: 15px;
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.icon_mark {
    position: relative;
    top: -1px;
    font-size: 30px;
    color: #7B7B7B;
}

.item_info_table {
    flex-direction: row;
    border-top-width: 1px;
    border-color: #E7EAF1;
}

.info_table_hd {
    flex: 1;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.info_table_bd {
    flex: 1;
}

.table_item {
    padding-left: @padding_size;
    padding-right: @padding_size;
    height: 70px;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
    align-items: center;
}

.table_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 2;
}

.table_text {
    color: #434343;
    font-size: 24px;
    text-align: right;
    flex: 1;
}

.table_text_en {
    color: #434343;
    font-size: 20px;
    text-align: right;
    flex: 1.2;
}

.github_box {
    flex-direction: row;
}

.github_num {
    margin-left: 15px;
    color: #434343;
    font-size: 24px;
    flex: 1;
}

.loading_box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 750px;
    margin: auto;
}

.loading {
    margin-top: 40px;
}

</style>
