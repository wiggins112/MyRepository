<template>
    <div style="position: relative;padding-left: 10px;padding-right: 10px;">
        <div style="position: relative;">
            <!-- 方框阴影图片 -->
            <image
                class="box-bg"
                :src="bgSrc"
            />
            <!-- 内容 -->
            <div class="box-inner" @click="jumpFund()">
                <!-- 第一行 -->
                <div class="bzh-cell"
                    height="40px"
                    style="width: 550px;"
            >
                    <text class="title">{{ info.title }}</text>
                    <div class="flex-row-align-center">
                        <div
                            class="dot"
                            :style="{backgroundColor: dotColor}"
                        >
                        </div>
                        <text
                            class="symbol"
                            :style="{color: symbolColor}"
                        >{{ info.symbol }}</text>
                    </div>
                </div>
                <!-- 百分比 -->

                <div class="bzh-cell"
                    style="width: 550px; margin-top: 35px;height: 40px;"
                >
                    <text
                        class="seven-day-rate"
                        :style="{color: sdrStrColor}"
                    >{{ info.yes_rate_str }} </text>
                    <div class="flex-row-align-center">
                        <text
                            class="label"
                            v-for="i in info.label"
                            :key="i"
                        >{{ i }}</text>
                    </div>
                </div>
                
                <!-- 底部那一行 -->
                <div class="bzh-cell"
                    style="width: 550px; margin-top: 5px;height: 40px;"
                >
                    <text class="seven-day-rate-text">{{ info.yes_rate_text }}</text>
                    <div class="flex-row-align-center">
                        <text
                            class="lp-sa-str"
                            :style="{color: lockPeriodColor}"
                        >{{ info.lock_period_str }}</text>
                        <text
                            class="lp-sa-str"
                            :style="{color: LpSaColor}"
                            v-if="info.lock_period_str && info.start_amount_str"
                        >  ·  </text>
                        <text
                            class="lp-sa-str"
                            :style="{color: startAmountColor}"
                        >{{ info.start_amount_str }}</text>
                    </div>
                </div>
                <!-- HOT -->
                <image
                    v-if="info.is_hot"
                    class="hot"
                    src="bmlocal://assets/images/fund/HOT.png"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { BzhCell } from '../../../bzh-ui/index.js'
export default {
    name: '',
    components: {
        BzhCell
    },
    props: {
        item: {
            type: Object,
            default: {}
        },
        pageIndex: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
        }
    },
    computed: {
        bgSrc () {
            if (this.pageIndex > 0) return `bmlocal://assets/images/fund/fund-bg${this.pageIndex % 6 + 1}.png`
            return 'bmlocal://assets/images/fund/FundPlazaList-box.png'
        },
        info () {
            const obj = {}
            const item = this.item
            obj._id = item._id
            obj.title = item.title || ''
            obj.label = item.label.slice(0, 2) || []
            obj.symbol = item.symbol || ''
            obj.description = item.description || ''
            if (!item.hasOwnProperty('yes_rate') || item.status !== 1 ) {
                obj.yes_rate_str = '--'
            } else {
                const sdr = +item.yes_rate * 100
                if (isNaN(sdr)) {
                    obj.yes_rate_str = ''
                } else {
                    sdr >= 0
                        ? obj.yes_rate_str = '+' + sdr.toFixed(2) + '%'
                        : obj.yes_rate_str = sdr.toFixed(2) + '%'
                }
            }

            obj.yes_rate_text = +item.yes_rate_text || this.$t('日涨跌幅')
            if (!item.lock_period_str) {
                obj.lock_period_str = item.lock_period > 0
                    ? this.$t('锁定期') + item.lock_period + this.$t('天')
                    : '开放买卖'
            } else {
                obj.lock_period_str = item.lock_period_str
            }

            if (!item.start_amount_str) {
                obj.start_amount_str = item.start_amount > 0
                    ? item.start_amount + item.symbol + this.$t('起投')
                    : '不限起投'
            } else {
                obj.start_amount_str = item.start_amount_str
            }
            obj.is_hot = item.is_hot || false
            return obj
        },
        dotColor () {
            return this.item.dot_color || '#ffcd40'
        },
        symbolColor () {
            return this.item.symbol_color || '#fff'
        },
        sdrStrColor () {
            return this.item.yes_rate < 0 ? '#fff' : '#fff'
        },
        lockPeriodColor () {
            return this.item.lock_period_color || '#fff'
        },
        LpSaColor () {
            return this.item.lp_sa_color || '#fff'
        },
        startAmountColor () {
            return this.item.start_amount_color || '#fff'
        },
    },
    watch: {
    },
    mounted () {
    },
    methods: {
        jumpFund () {
            if (!this.info._id) return
            this.$router.open({
                name: 'Fund',
                type: 'PUSH',
                params: this.info
            })
        }
    },
    filters: {
    }
}
</script>

<style scoped>

.box-inner {
    position: relative;
    padding: 30px;
    width: 600px;
    height: 230px;
}

.title, .symbol {
    font-size: 28px;
    color: #fff;
    font-weight: bold;
    lines: 1;
}

.label {
    lines: 1;
    color: #fff;
	height: 32px;
    line-height: 28px;
    padding-left: 10px;
    padding-right: 10px;
    margin-left: 10px;
    font-size: 20px;
    text-align: center;
	border-radius: 16px;
    border-style: solid;
    border-width: 2px;
	border-color: #fff;
}

.dot {
    width: 20px;
	height: 20px;
    border-radius: 10px;
    margin-right: 10px;
}

.seven-day-rate {
    line-height: 40px;
    font-size: 40px;
    font-weight: bold;
    lines: 1;
}

.seven-day-rate-text {
    font-size: 22px;
	line-height: 40px;
    color: rgba(255,255,255,.6);
}

.lp-sa-str {
    font-size: 22px;
	line-height: 40px;
}

.hot {
    position: absolute;
    height: 70px;
    width: 70px;
    top: 0;
    left: 0;
}

.box-bg {
    width: 600px;
    height: 230px;
    position: absolute;
    top: 0;
    left: 0;
}
.bzh-cell {
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
.flex-row-align-center {
    flex-direction: row;
    align-items: center;
}
</style>
