<template>
    <div class="EchartLine_box" :style="{width:750, height: echart_option.height}" @appear="appeared">
        <bmchart v-if="loading === 'loaded' && show_echart" :options="$format(line_option)" :style="{width:750, height: echart_option.height}"></bmchart>
        <div class="loading_box" :style="{width: 750, height: echart_option.height}" v-if="loading !== 'loaded'">
            <Loadmore :loading="loading" class="loading"></Loadmore>
        </div>
    </div>
</template>
<script>
import Loadmore from './Loadmore.vue'
export default {
    components: { Loadmore },
    data() {
        return {
            line_option: {},
            show_echart: false,
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
        show_legend: {
            type: Boolean,
            default: false
        },
        echart_option: {
            type: Object,
            default: {
                color: '#47E0E1',
                name: '指数',
                height: 300,
            },
        },
        lazyloaded: {
            type: Boolean,
            default: true
        }
    },
    created() {
        this.show_echart = this.lazyloaded ? false : true;
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
        appeared() {
            this.show_echart = true;
        },
        initEchartLine() {
            let axis_x = this.data_x;
            let series_y = [];
            for (let y of this.data_y) {
                series_y.push({
                    value: (y/1000000).toFixed(2),
                    label: {
                        normal: {
                            color: '#434343',
                            show: true,
                            position: y > 0 ? 'bottom' : 'top',
                        }
                    },
                    itemStyle: {
                        normal: {
                            origin: 'end',
                            barBorderRadius: y > 0 ? [3, 3, 0, 0] : [0, 0, 3, 3],
                            color: {
                                type: 'linear',
                                x: 1,
                                y: 0,
                                x2: 1,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: y > 0 ? '#4AE2A7' : '#FE3F66' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: y > 0 ? '#23C7AE' : '#FB754C' // 100% 处的颜色
                                }],
                                globalCoord: false // 缺省为 false
                            }
                        }
                    }
                })
            }
            let option = {
                backgroundColor: '#ffffff',
                legend: {
                    show: this.show_legend,
                    data: [this.echart_option.name],
                    top: 4,
                    itemWidth: 20,
                    itemHeight: 7,
                    textStyle: {
                        fontSize: 10,
                    }
                },
                grid: [{
                    left: 70,
                    right: 70,
                    top: 40,
                    bottom: 45,
                }],
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: axis_x,
                    axisTick: {
                        show: false,
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisLabel: {
                        margin: 25,
                        color: '#9B9DA4',
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
                    show: true,
                    name: `${this.$t('单位')}：${this.$t('百万')}`,
                    nameTextStyle: {
                        color: '#9B9DA4',
                        padding: [15,0,10,0],
                    },
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
                    name: this.$t(this.echart_option.name),
                    type: 'bar',
                    data: series_y
                }]
            };
            this.line_option = option;
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
    width: 750px;
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
