<template>
    <div class="wrapper_diagnose" :style="{backgroundColor: diagnosis.items ? 'white' : 'transparent' }">
        <BoxShadow class="box_hd" v-if="diagnosis.items">
            <div class="box">
                <div class="less_row bzh_score">
                    <div class="score_left">
                        <text class="text score_text">{{ $t('币智慧总分') }}</text>
                        <text class="text score_value">{{diagnosis.total_score}}</text>
                        <text class="text score_rank">{{ $t('当前排名') }} {{diagnosis.total_score_ranking}}</text>
                    </div>
                    <div class="score_right">
                        <div class="less_row rate_box">
                            <text class="text score_text">{{ $t('长线评分') }}</text>
                            <Rate :value="diagnosis.long_score/2"></Rate>
                        </div>
                        <div class="less_row rate_box">
                            <text class="text score_text">{{ $t('短线评分') }}</text>
                            <Rate :value="diagnosis.short_score/2"></Rate>
                        </div>
                    </div>
                </div>
                <text class="text more_text" @click="jumpCoinDiagnose">{{ $t('查看完整榜单') }}></text>
                <div class="bzh_intro">
                    <text class="text intro_text">{{ $fixSymbol(diagnosis.total_comment) }}</text>
                </div>
                <div class="bzh_echarts">
                    <div class="echarts_radar">
                        <bmchart :options="$format(radar_option)" :style="{width:750, height: 515}" v-if="loading.diagnosis === 'loaded'"></bmchart>
                    </div>
                </div>
            </div>
            <div class="less_center guide_box" v-if="diagnosis.comment">
                <div class="guide">
                    <image class="guide_bg" src="bmlocal://assets/images/coin/guide_bg.png"></image>
                    <text class="text guide_text">{{diagnosis.comment}}</text>
                </div>
            </div>
        </BoxShadow>
        <div class="box_bd" v-if="diagnosis.items">
            <div class="bd_item" v-for="(item_tag, index) in diagnosis.items" :key="index">
                <div class="item_title">
                    <text class="title_line"></text>
                    <text class="text title_text">{{item_tag.title}} {{item_tag.score_str}}</text>
                </div>
                <div class="item_tagbox" v-for="(block, block_index) in item_tag.block_tag" :key="block_index" v-if="item_tag.block_tag.length">
                    <div class="tag_box">
                        <div v-for="(tag, i) in block" :key="i">
                            <text class="text tag" :style="{borderColor: tag.active ? tag.color : filters.colorRgb(tag.color || '#aaacad', 0.5), backgroundColor: tag.active ? tag.color || '#848688' : 'transparent', color: tag.active ? '#fff' : '#434343'}" @click="clickTag(block_index, block, tag, item_tag, $event)">{{tag.name}}</text>
                        </div>
                    </div>
                    <CoinPopover style="margin-bottom: 25px;" :popData="item_tag.current_tag" :type="item_tag.current_tag.popover_type" :hasTitle="item_tag.current_tag.show_popover_title" :position="item_tag.position" v-if="showPopover(item_tag, block_index)"></CoinPopover>
                </div>
                <div class="empty" v-if="!item_tag.block_tag.length">
                    <text class="text score_text">{{ $t('暂无相关标签') }}~</text>
                </div>
            </div>
        </div>
        <Loadmore  blankpagetype="icontext" :loading="loading.diagnosis" :bigicon="false"></Loadmore>
    </div>
</template>
<script>
let _self;
import { API_BaseUrl } from '../config/config.js'
import { Utils } from 'weex-ui'
import Rate from './Rate.vue'
import CoinPopover from './CoinPopover.vue'
import BoxShadow from './BoxShadow.vue'
import filters from '../config/filters.js'
import common from '../config/common';
import Loadmore from './Loadmore.vue'
export default {
    components: {
        Rate,
        CoinPopover,
        BoxShadow,
        Loadmore
    },
    data() {
        return {
            filters,
            radar_option: {},
            diagnosis: {},
            loading: {
                diagnosis: 'loading',
            },
            coin: {},
            router_params: {},
        }
    },
    created() {
        _self = this;
        this.init();
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
        is_refresh: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                this.$emit('Loadmoreing');
            },
            deep: true,
        },
        'is_refresh': {
            handler(newValue) {
                if (newValue) {

                }
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getRouterParams();
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent('bzh_diagnose_view');
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                let coin =  common.storageGetData("my_coin_"+ this.router_params.symbol_id);
                let diagnosis =  common.storageGetData("my_diagnosis_"+ this.router_params.symbol_id);
                if (coin) {
                    this.coin = coin;
                } else {
                    this.getCoin();
                }

                if (diagnosis) {
                    this.diagnosis = diagnosis;
                    this.loading.diagnosis = 'loaded';
                    this.initEchartLine();
                } else {
                    this.getCoinDiagnosis();
                }

            })
        },
        jumpCoinDiagnose() {
            this.$router.open({
                name: 'CoinDiagnoseRank',
                params: {}
            });
        },
        clickTag(block_index, block, tag, all_tags, $event) {
            if (all_tags.current_tag.name !== tag.name) {
                for (let item of all_tags.block_tag) {
                    for(let tags of item) {
                        tags.active = false;
                    }
                }
                tag.active = true;
                all_tags.show_popover = true;
            } else {
                tag.active = !tag.active;
                all_tags.show_popover = !all_tags.show_popover;
            }

            all_tags.position.x = $event.position.x + (tag.name && tag.name.length >= 4 ? 40 : 10);
            all_tags.position.y = $event.position.y + 75;
            all_tags.current_tag = {};
            all_tags.current_tag = tag;
            all_tags.current_tag.index = block_index;
        },
        clickTechnologyTag(tag, e) {

        },
        initEchartLine() {
            let indicator_data = [];
            let series_value = [];

            for (let val of this.diagnosis.items) {
                indicator_data.push({
                    name: val.title.replace(this.$t('分析'), ''),
                    value: val.score,
                    max: 10,
                    label: this.$t('分')
                });
                series_value.push(val.score)
            }
            let option = {
                backgroundColor: "#FFF",
                radar: {
                    center: ['50%', '58%'],
                    nameGap: 6, // 指示器名称和指示器轴的距离。
                    name: {
                        textStyle: {
                            color: '#999',
                        },
                        formatter: function(name, indicator) {
                            return [
                                name.replace(/\s/g, '\n'),
                                `(${indicator.value}${indicator.label})`,
                            ].join('\n')

                        },
                        rich: {
                            title: {
                                color: '#9b9da4',
                                align: 'center',
                                fontSize: '12',
                            },
                            value: {
                                color: '#6082f2',
                                fontSize: '12',
                                padding: [0, 0, 5, 0],
                                textAlign: 'center',
                                align: 'center',
                                fontWeight: 'bolder',
                            },
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: ['#fff', '#fff', '#fff', '#fff'],
                            shadowColor: 'rgba(0, 100, 0, 0.3)'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#d9dadc'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#d9dadc',
                        }
                    },
                    indicator: indicator_data || [
                        { name: this.$t('基本面'), max: 6500, value: 500 },
                        { name: 'B', max: 6500, value: 3400 },
                        { name: 'C', max: 3800, value: 2800 },
                        { name: 'D', max: 3800, value: 3100 },
                        { name: 'E', max: 5200, value: 4200 }
                    ]
                },
                series: [{
                    type: 'radar',
                    data: [{
                        value: series_value,
                        name: 'DATA',
                        itemStyle: {
                            normal: {
                                color: '#729ff0'
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: '1.3'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: 'rgba(114, 159, 240, 0.5)'
                            }
                        }
                    }]
                }]
            }
            this.radar_option = option;
        },
        getCoin() {
            let params = {};
            params.symbol = this.router_params.symbol;
            params.symbol_id = this.router_params.symbol_id;
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/info`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    resData.result.ico_info = resData.result.ico_info || {};
                    for (let item of resData.result.people) {
                        item.tram_limit = true;
                    }
                    this.coin = resData.result;
                    common.storageSetData("my_coin_"+ this.router_params.symbol_id, this.coin);//全部的缓存数据 
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        getCoinDiagnosis() {
            let params = {};
            params.symbol = this.router_params.symbol;
            params.symbol_id = this.router_params.symbol_id;
            this.loading.diagnosis = 'loading';
            this.$fetch({
                name: 'getCoinDiagnosis',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    if (resData.result && resData.result.items && resData.result.items.length) {
                        this.loading.diagnosis = 'loaded';
                        for (let item of resData.result.items) {
                            item.block_tag = this.sliceArray(item.tags);
                            item.tags = [];
                        }
                        this.diagnosis = resData.result;
                        common.storageSetData("my_diagnosis_"+ this.router_params.symbol_id, this.diagnosis);//全部的缓存数据 
                        this.initEchartLine();
                    } else {
                        this.loading.diagnosis = 'empty';
                    }
                } else {
                    this.loading.diagnosis = 'error';
                }
                console.log(this.loading.diagnosis);
                
            }).catch((e) => {
                this.loading.diagnosis = 'error';
                console.log(e.message)
            });
        },
        // 切割数组，返回按多少个为一组，并组成新的数组
        sliceArray(data, num = 4) {
            let items = [];
            for (let i = 0, len = data.length; i < len; i += num) {
                items.push(data.slice(i, i + num));
            }
            return items;
        },
        showPopover(item_tag, block_index) {
            return item_tag.show_popover && item_tag.current_tag.index === block_index;
        },
    },
    computed: {
        language() {
            return this.$storage.getSync('language');
        },
    }

}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.wrapper_diagnose {
    width: 750px;
}

.icon {
    font-family: iconfont2;
    font-size: 24px;
}

.box_hd {
    flex: 1;
    margin-top: 33px;
    padding-bottom: 11px;
    padding-left: @padding_size;
    padding-right: @padding_size;
    border-radius: 12px;
}

.box {
    padding: @padding_size;
}

.bzh_score {
    margin-left: -@padding_size;
    margin-right: -@padding_size;
    padding: 15px 0;
}

.echarts_radar {
    height: 530px;
    justify-content: center;
    align-items: center;
}

.score_left {
    flex: 1;
    justify-content: center;
    align-items: center;
    border-right-width: 1px;
    border-right-color: #e7eaf1;
}
.score_left_en {
    flex: 0.9;
    justify-content: center;
    align-items: center;
    border-right-width: 1px;
    border-right-color: #e7eaf1;
}

.score_right {
    padding-top: 25px;
    padding-left: 35px;
    padding-right: 35px;
    align-items: center;
    justify-content: center;
}
.score_right_en {
    flex: 2;
    padding-top: 25px;
}
.rate_box {
    padding-bottom: 25px;
}

.score_text {
    position: relative;
    top: 2px;
    font-size: 22px;
    color: #9b9da4;
}

.score_value {
    padding-top: 10px;
    padding-bottom: 10px;
    font-weight: bold;
    font-size: 60px;
    color: #6d98f0;
}

.score_rank {
    font-size: 20px;
    color: #6d98f0;
}

.more_text {
    padding: 20px;
    font-size: 22px;
    text-align: center;
}
.bzh_intro {
    padding-top: 15px;
}
.intro_text {
    line-height: 45px;
}

.guide {
    position: relative;
    width: 430px;
    height: 43px;
    justify-content: center;
    align-items: center;
}

.guide_bg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.guide_text {
    color: #fff;
    font-size: 24px;
}

.box_bd {
    padding: @padding_size;
}

.bd_item {
    margin-bottom: 45px;
}

.item_title {
    padding: 20px 0;
    position: relative;
    flex-direction: row;
}

.title_line {
    width: 6px;
    height: 26px;
    background-color: @main_color;
}

.title_text {
    margin-left: 15px;
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.tag_box {
    width: 750px;
    margin-top: 10px;
    flex-direction: row;
    flex-wrap: wrap;
}

.tag {
    margin-right: 16px;
    margin-bottom: 15px;
    padding: 15px 25px;
    border-width: 2px;
    border-radius: 6px;
    border-color: #eaecee;
    font-size: 24px;
}

</style>
