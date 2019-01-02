<template>
    <div class="EchartLine_box" :style="{width:750, height: map_height}">
        <bmchart ref="chart" :options="$format(map_option)" :style="{width:750, height: map_height}"></bmchart>
        <div class="loading_box" :style="{width: 750, height: map_height}" v-if="loading === 'loading'">
            <Loadmore :loading="loading" class="loading"></Loadmore>
        </div>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import Loadmore from './Loadmore.vue'
export default {
    components: { Loadmore },
    data() {
        return {
            filters,
            map_option: {},
            map_height: 605,
        }
    },
    props: {
        loading: {
            type: String,
            default: 'loading',
        },
        graphs: {
            type: Array,
            required: false
        },
    },
    created() {
        this.initEchartMap();
    },
    watch: {
        graphs(newVal, oldVal) {
            if (newVal.length) {
                this.initEchartMap();
            }
        }
    },
    methods: {
        initEchartMap() {
            let graphs = this.graphs;
            let datas = [];
            let links = [];
            datas = [{
                name: 'ETH',
                draggable: false,
                category: 0,
                type: 'coin',
            }, {
                name: 'ddd',
                draggable: false,
                category: 1,
                type: 'coin',
            }, {
                name: 'sxzsx',
                draggable: false,
                category: 1,
                type: 'coin',
            }]
            links = [{
                source: 0,
                target: 1,
                category: 1,
                relation: 'xxxxxxxx',
                type: 'coin',
                name: 'ddd',
                symbolSize: 100,
            }, {
                source: 0,
                target: 2,
                category: 1,
                relation: 'xxxxxxxx',
                type: 'coin',
                name: 'sxzsx',
                symbolSize: 100,
            }]
            let option = {
                tooltip: {

                },
                animationDurationUpdate: 50,
                animationDuration: 50,
                animationEasingUpdate: 'linear',
                animationEasing: 'linear',
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 12
                        },
                    }
                },
                legend: {
                    x: "left",
                    orient: 'vertical',
                    right: '50%',
                    show: true,
                    padding: [10, 5, 0, 15],
                    itemWidth: 14,
                    itemHeight: 14,
                    data: ["币种", "人物"]
                },
                series: [{
                    type: 'graph',
                    layout: 'force',
                    symbol: "circle",
                    symbolSize: this.is_full ? 45 + 10 : 35,
                    focusNodeAdjacency: false,
                    roam: true,
                    animation: false,
                    draggable: false,
                    cursor: 'pointer',
                    categories: [{
                        name: this.$t('币种'),
                        itemStyle: {
                            normal: {
                                color: "#FD9835",
                            }
                        }
                    }, {
                        name: this.$t('人物'),
                        itemStyle: {
                            normal: {
                                color: "#1CC2C2",
                            }
                        }
                    }],
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 12
                            },
                        }
                    },
                    force: {
                        repulsion: 200,
                        layoutAnimation: true,
                        edgeLength: [50,100],
                        gravity: 0.05,
                    },
                    edgeSymbolSize: [4, 50],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 10
                            },
                            formatter: (params) => {
                                return params.data.relation
                            }
                        }
                    },
                    nodes: datas,
                    links: links,
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: 1,
                            curveness: 0 //线的弯曲度
                        }
                    }
                }]
            };
            this.map_option = option;
        },
    },
    computed: {
        is_full() {
            return false;
        },
    },
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
    background-color: #fff;
}

.loading {
    margin-top: 40px;
}

</style>
