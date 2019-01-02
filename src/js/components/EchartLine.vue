<template>
    <div class="EchartLine_box" :style="{width:ecahrt_options.width, height: ecahrt_options.height}" @appear="appeared">
        <bmchart v-if="loading === 'loaded' && show_echart" ref="chart" :options="$format(line_option)" :style="{width:ecahrt_options.width, height: ecahrt_options.height}" @finish='finish'></bmchart>
        <div class="loading_box" :style="{width: ecahrt_options.width, height: ecahrt_options.height}" v-if="loading !== 'loaded'">
            <Loadmore :loading="loading" class="loading"></Loadmore>
        </div>
    </div>
</template>
<script>
import Loadmore from './Loadmore.vue'
import filters from '../config/filters.js'
export default {
    components: { Loadmore },
    data() {
        return {
            filters,
            line_option: {},
            show_echart: false,
            default_options: {
                color: '#47E0E1',
                name: this.$t('指数'),
                height: 300,
                width: 750,
                show_tooltip: true,
                show_xAxis: true,
                show_legend: true,
                xAxis_axisPointer: true,
                yAxis_axisPointer: true,
                show_yAxis: true,
                grid: [{
                    left: 0,
                    right: 0,
                    top: 25,
                    bottom: 30,
                }],
            }
        }
    },
    props: {
        loading: {
            type: String,
            default: 'loading',
        },
        data_x: {
            type: Array,
            required: true
        },
        data_y: {
            type: Array,
            required: true
        },
        has_min: {
            type:  Boolean,
            default: true
        },
        echart_option: {
            type: Object,
        },
        lazyloaded: {
            type: Boolean,
            default: false
        }
    },
    created() {
        this.initEchartLine();
    },
    watch: {
        data_x(newVal, oldVal) {
            if (newVal.length) {
                this.initEchartLine();
            }
        }
    },
    methods: {
        finish() {
            this.$emit('finish');
        },
        appeared() {
            this.show_echart = true;
        },
        initEchartLine() {
            this.show_echart = this.lazyloaded ? false : true;
            let date_x = this.data_x;
            let data_y = this.data_y;
            let option = {
                backgroundColor: '#ffffff',
                tooltip: {
                    show: this.ecahrt_options.show_tooltip,
                    trigger: 'axis',
                    transitionDuration: 0,
                    textStyle: {
                        fontSize: 10,
                        color: '#fff'
                    },
                    backgroundColor: 'rgba(0,0,0, 0.7)',
                    formatter: this.$t('时间') + '：{b}<br />{a}: {c}',
                    position: function(pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = { top: 5 };
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    }
                },
                legend: {
                    show: this.ecahrt_options.show_legend,
                    data: [this.ecahrt_options.name],
                    top: 4,
                    itemWidth: 20,
                    itemHeight: 7,
                    textStyle: {
                        fontSize: 10,
                    }
                },
                grid: this.ecahrt_options.grid,
                xAxis: {
                    show: this.ecahrt_options.show_xAxis,
                    type: 'category',
                    boundaryGap: false,
                    data: date_x,
                    axisTick: {
                        show: false,
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    },
                    axisLabel: {
                        color: '#434343',
                        align: 'right'
                    },
                    axisPointer: {
                        show: this.ecahrt_options.xAxis_axisPointer,
                        label: { show: false },
                        lineStyle: {
                            color: '#999',
                            type: 'dashed',
                        }
                    },
                },
                yAxis: {
                    show: this.ecahrt_options.show_yAxis,
                    type: 'value',
                    position: 'right',
                    minInterval: 1,
                    min: function(value) {
                        let min = value.min;
                        let max = value.max;
                        let vol = max - min;
                        return parseInt(min - vol);
                    },
                    axisLabel: {
                        color: '#333',
                        fontSize: '10',
                        inside: true,
                    },
                    axisPointer: {
                        show: this.ecahrt_options.yAxis_axisPointer,
                        label: { show: false },
                        lineStyle: {
                            color: '#999',
                            type: 'dashed',
                        }
                    },
                    axisLine: {
                        lineStyle: {

                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f3f3f3',
                            type: 'dashed',
                        }
                    }
                },
                series: [{
                    name: this.ecahrt_options.name,
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    itemStyle: {
                        normal: {
                            color: this.ecahrt_options.color
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 1.5,
                        }
                    },
                    areaStyle: {
                        normal: {
                            origin: 'end',
                            color: {
                                type: 'linear',
                                x: 1,
                                y: 0,
                                x2: 1,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: this.filters.colorRgb(this.ecahrt_options.color, 0.5) // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: '#fff' // 100% 处的颜色
                                }],
                                globalCoord: false // 缺省为 false
                            }
                        }
                    },
                    data: data_y
                }]
            };
            this.line_option = option;
        },
    },
    computed: {
      ecahrt_options () {
        return {
            ...this.default_options,
            ...this.echart_option,
        }
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
