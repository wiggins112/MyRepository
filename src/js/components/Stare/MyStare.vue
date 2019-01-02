<template>
    <list class="scroller slider-item">
        <Refresher @refresh="handleRefresh" :loading="loading.messages" style="margin-bottom: -150px;"></Refresher>
        <cell style="width:750px;">
            <div class="items-total" v-if="userRules.length">
                <text class="fs-22 color-b6b7ba">{{ $t('共') }}{{ userRules.length }}个币，{{ rulesTotal }}{{ $t('条监控规则') }}</text>
                <text class="fs-22 color-257fee fw-bold">{{ $t('实时监控中') }}</text>
            </div>
            <bzhCell>
                <div class="item" v-for="(i, index) in userRules" :key="'userRules' + index">
                    <BzhCell height="90">
                        <template slot="l">
                            <image style="width: 32px;height: 32px;" :src="i.icon" />
                            <text class="big-name-text mx-10">{{ i.pair_symbol }}</text>
                            <text class="name-text fs-22 mx-10 py-5">{{ i.cn || i.name }}</text>
                        </template>
                        <template slot="r">
                            <div>
                                <text class="fw-bold fs-26 px-25" :style="{color: i.percent_change_8am > 0 ? '#00c39c' : '#f5593f'}">{{ i.price_local_str }}</text>
                                <text class="fs-22 px-25" :style="{color: i.percent_change_8am > 0 ? '#00c39c' : '#f5593f'}">= {{ i.price_usd_str }}</text>
                            </div>
                            <text class="fs-24 px-25" :style="{color: i.percent_change_8am > 0 ? '#00c39c' : '#f5593f'}">{{ i.percent_change_8am_str }}</text>
                            <button class="px-25" v-if="!i.edit" @click="i.edit = true">
                                <text class="fs-24 fw-bold color-6e6e6e">{{ $t('编辑') }}</text>
                            </button>
                            <button class="px-25" v-if="i.edit" @click="saveRules(i, userRulesBackup[index])">
                                <text class="fs-24 fw-bold color-6e6e6e">{{ $t('完成') }}</text>
                            </button>
                        </template>
                    </BzhCell>
                    <bzhCell height="90" class="cell-border" v-for="(j, jIndex) in i.signals" :key="'userRulesJ' + jIndex" v-if="j.remove !== 1">
                        <template slot="l">
                            <text class="fs-24" style="width: 135px" v-if="j.signal !== 'news_event' && j.signal !== 'notice_event'" >{{ j.pair_symbol }}/{{ j.pair_base }}</text>
                            <text class="fs-24" style="width: 135px" v-if="j.signal === 'news_event' || j.signal === 'notice_event'" >{{ j.pair_symbol }}</text>                            
                            <text class="fs-24">{{ signalTitleObj[j.signal] }}</text>
                            <input
                                type="number"
                                class="cell-input mx-15"
                                v-model="j.more_than"
                                v-if="i.edit && j.hasOwnProperty('more_than')"
                                @focus="getInputCoinPrice(j.platform, j.pair_symbol, i.symbol_id, j.pair_base, index, jIndex, j.more_than, j.signal, 'more_than')"
                                @blur="handleBlur(j.more_than, index, jIndex, 'more_than')" />
                            <input
                                type="number" 
                                class="cell-input mx-15"
                                v-model="j.less_than"
                                v-if="i.edit && j.hasOwnProperty('less_than')"
                                @focus="getInputCoinPrice(j.platform, j.pair_symbol, i.symbol_id, j.pair_base, index, jIndex, j.less_than, j.signal, 'less_than')"
                                @blur="handleBlur(j.less_than, index, jIndex, 'less_than')"/>
                            <text class="color-00c39c mx-15" v-if="!i.edit && j.hasOwnProperty('more_than')">{{ j.more_than }}</text>
                            <text class="color-f5593f mx-15" v-if="!i.edit && j.hasOwnProperty('less_than')">{{ j.less_than }}</text>
                            <text class="fs-24">{{ signalUnitObj[j.signal] || j.pair_base }}</text>
                            <text class="fs-24" v-if="j.signal !== 'news_event' && j.signal !== 'notice_event'"> ({{ j.platform }})</text>
                            <text class="fs-24 color-00c39c" v-if="j.send_app">{{ $t('已提醒') }}</text>
                        </template>
                        <template slot="r">
                            <button class="delete-button" v-if="i.edit" @click="deleteRule(index, jIndex)">
                                <text class="fs-24 color-ffffff">{{ $t('删除') }}</text>
                            </button>
                        </template>
                    </bzhCell>
                    <!-- 脱离文档流 -->
                    <!-- 提示 -->
                    <Tips :top="tips.top" left="200px" :title="tips.title" v-if="tips.show && tips.title && tips.symbol_id === i.symbol_id"/>
                </div>
            </bzhCell>
            <!-- <bzhCell v-if="!userRules.length">
                <div class="add-box my-25">
                    <text class="add-box-tips">{{ $t('您尚未添加盯盘规则') }}，</text>
                    <text class="add-box-tips">{{ $t('快来添加吧') }}！</text>
                    <div class="btn my-25" @click="goStatSingle" >
                        <text class="icon add-regular">&#xe916;</text>
                    </div>
                </div>
            </bzhCell> -->
            <Loadmore v-if="!refreshing" :loading="loading.messages"  empty="您尚未添加盯盘规则，快来添加吧！" blankpagetype="icontext" iconsrc="bmlocal://assets/images/blankpage/mystare.png" :hasarrow="pagearrow" ></Loadmore>
        </cell>
    </list>
</template>

<script>
import { BzhCell, BzhGridSelect, BzhSwitch, BzhRadio } from '../../../bzh-ui/index.js'
import { API_BaseUrl } from '../../config/config.js'
import Tips from './Tips'
import _ from 'lodash'
import Refresher from '../Refresher.vue'
import Loadmore from '../Loadmore.vue'
export default {
    name: '',
    data () {
        return {
            refreshing: false,
            loading: {
                messages: 'loading',
            },
            userRules: [],
            userRulesBackup: [],
            stat_menus: [],
            events_menus: [],
            getInputCoinPriceLoading: false,
            inputCoinInfo: {},
            input: {
                symbol_id: '',
                unit: '',
                index: 0,
                jIndex: 0,
                oldVal: '',
                signal: ''
            },
            inputValue: ''
        }
    },
    props: {
        pagearrow: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        // 对象 {signal: title}
        signalTitleObj () {
            const obj = {}
            this.stat_menus.map(x => {
                obj[x.signal] = x.title
            })
            this.events_menus.map(x => {
                obj[x.signal] = x.title
            })
            return obj
        },
        // 对象 {signal: unit}
        signalUnitObj () {
            const obj = {}
            this.stat_menus.map(x => {
                obj[x.signal] = x.unit || ''
            })
            this.events_menus.map(x => {
                obj[x.signal] = x.unit || ' '
            })
            return obj
        },
        // 规则总数
        rulesTotal () {
            return this.userRules.map(x => x.signals.length).reduce((sum, x) => sum + x)
        },
        inputCoin () {
            const coin = {}
            const unit = this.input.unit.toLowerCase()
            coin.price = this.inputCoinInfo['price_' + unit]
                        || this.inputCoinInfo.price_base
                        || this.inputCoinInfo['cur_price_' + unit]
                        || this.inputCoinInfo.cur_price_base
                        || null // 当前价格
            coin.percent_change_8am = this.inputCoinInfo.percent_change_8am
                                        || +(this.inputCoinInfo.price_change_8h_percent * 100).toFixed(2)
                                        || null // 当日涨跌幅
            return coin
        },
        // 提示气泡
        tips () {
            const index = this.input.index
            const jIndex = this.input.jIndex
            const key = this.input.key
            let haveRemove = 0
            for(let i = 0; i < jIndex; i++) {
                if (this.userRules[index].signals[i].remove === 1) haveRemove++
            }
            const tips = {
                show: true,
                title: this.getInputCoinPriceLoading ? this.$t('行情获取中') : '',
                err: 0,
                top: ((jIndex - haveRemove) || 0) * 91 + 75 + 'px',
                symbol_id: this.input.symbol_id || '',
                inputValue: +this.userRules[index].signals[jIndex][key]
            }
            function tipsListSet (title, err) {
                tips.title = title
                tips.err = err
            }
            const price = this.inputCoin.price || null
            const percent_change_8am = this.inputCoin.percent_change_8am
            const signal = this.input.signal || ''
            const value = tips.inputValue
            const unit = this.input.unit
            if (price) {
                switch (signal) {
                    case 'price_more':
                        price > value
                            ? tipsListSet(this.$t('低于当前价'), 1)
                            : tipsListSet(`当日涨幅${((value - price) / price * 100).toFixed(2)} %`, 0)
                        break
                    case 'price_less':
                        price < value
                            ? tipsListSet(this.$t('高于当前价'), 1)
                            : tipsListSet(`当日跌幅${((value - price) / price * 100).toFixed(2)} %`, 0)
                        break
                    case 'change_8am_more':
                        percent_change_8am > value
                            ? tipsListSet(this.$t('小于当前日涨幅'), 1)
                            : tipsListSet(`价格为 ${((1 + value / 100) * price).toFixed(2)} ` + unit, 0)
                        break
                    case 'change_8am_less':
                        if (value > 100) {
                            tipsListSet('跌幅不能大于 100 %', 1)
                        } else {
                            -percent_change_8am > value
                                ? tipsListSet(this.$t('小于当前日跌幅'), 1)
                                : tipsListSet(`价格为 ${((1 - value / 100) * price).toFixed(2)} ` + unit, 0)
                        }
                        break
                    case 'change_5m_more':
                        tipsListSet(`价格为 ${((1 + value / 100) * price).toFixed(2)} ` + unit, 0)
                        break
                    case 'change_5m_less':
                        value > 100
                            ? tipsListSet('跌幅不能大于 100 %', 1)
                            : tipsListSet(`价格为 ${((1 - value / 100) * price).toFixed(2)} ` + unit, 0)
                        break
                    case 'buy_price_more':
                        price > value 
                            ? tipsListSet(this.$t('低于当前价'), 1)
                            : tipsListSet(null, 0)
                        break
                    case 'sell_price_less':
                        price < value
                            ? tipsListSet(this.$t('高于当前价'), 1)
                            : tipsListSet(null, 0)
                        break
                }
            } else {
                switch (signal) {
                    case 'change_8am_less':
                        value > 100
                            ? tipsListSet('跌幅不能大于 100 %', 1)
                            : tipsListSet(null, 0)
                        break
                    case 'change_5m_less':
                        value > 100
                            ? tipsListSet('跌幅不能大于 100 %', 1)
                            : tipsListSet(null, 0)
                        break
                    default:
                        tipsListSet(null, 0)
                }
            }
            if (this.userRules[index].signals[jIndex].remove === 1) tipsListSet(null, 0)
            return tips
        }
    },
    watch: {
    },
    mounted () {
        this.init()
        this.getAddStatMenus()
    },
    eros: {
        beforeBackAppear(params, options) {
            this.init();
        },
    },
    methods: {
        init () {
            this.getV2UserRules()
            this.resetInputAndTips()
        },
        async handleRefresh() {
            this.refreshing = true
            await this.getV2UserRules()
            this.resetInputAndTips()
            this.refreshing = false
        },
        // 获取用户规则
        async getV2UserRules () {
            this.loading.messages = 'loading';
            const res = await this.$fetch({
                name: 'getV2UserRules',
                method: 'GET',
                data: { items: 1 }
            })
            if (res.error === 0) {
                this.userRules = _.cloneDeep(res.items).map(x => {
                    x.edit = false
                    x.signals.map(y => {
                        y.remove = 0
                        if (y.hasOwnProperty('more_than')) y.more_than = this.toStr(+y.more_than)
                        if (y.hasOwnProperty('less_than')) y.less_than = this.toStr(+y.less_than)
                        })
                    return x
                })
                this.userRulesBackup = _.cloneDeep(this.userRules)
                this.$emit('initData', this.userRules)
                this.loading.messages = 'loaded'
                if (!res.items.length) {
                    this.loading.messages = 'empty'
                }
            } else {
                this.loading.messages = 'error'
            }
            return this.userRulesBackup
        },
        // 获取盯盘规则列表
        async getAddStatMenus () {
            const res = await this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: {
                    type: 'app_config',
                    key: 'app_add_stat_menus'
                }
            })
            if (res.error === 0) {
                // 盯盘规则菜单
                this.stat_menus = _.cloneDeep(res.result.stat_menus)
                this.events_menus = _.cloneDeep(res.result.events_menus)
            }
        },
        // 跳转币种搜索页面
        goStatSingle () {
            this.$router.open({
                name: 'SearchCoin',
                params: {
                    from: 'stat'
                }
            })
        },
        // 删除规则
        deleteRule (index, jIndex) {
            if (this.userRules[index].signals[jIndex]) this.userRules[index].signals[jIndex].remove = 1
        },
        // 科学计数法转字符串
        toStr (x) {
            if (Math.abs(x) < 1.0) {
                var e = parseInt(x.toString().split('e-')[1])
                if (e) {
                    x *= Math.pow(10,e-1)
                    x = '0.' + (new Array(e)).join('0') + x.toString().substring(2)
                }
            } else {
                var e = parseInt(x.toString().split('+')[1])
                if (e > 20) {
                    e -= 20
                    x /= Math.pow(10,e)
                    x += (new Array(e+1)).join('0')
                }
            }
            return x + ''
        },
        /**
         * 保存修改
         * @param {array} a 某个币种修改后的规则
         * @param {array} b 某个币种修改前的规则
         */
        async saveRules (a, b) {
            const signals = a.signals.map(x => {
                if (x.remove === 1) return x
                if (!_.find(b.signals, x)) return x
            }).filter(n => n) // 去掉 null

            if (!signals.length) {
                a.edit = false
                this.$nextTick(() => {
                    this.resetInputAndTips()
                })
                return
            }

            const index = this.input.index
            const jIndex = this.input.jIndex
            const key = this.input.key
            const value = this.userRules[index].signals[jIndex][key]
            const oldVal = this.input.oldVal

            if (oldVal) {
                if(!+value || !/^[0-9]+(\.[0-9]{1,10})?$/.test(this.toStr(+value)) || this.tips.err) {
                    this.userRules[index].signals[jIndex][key] = oldVal
                    return
                }
            }

            if (this.tips.err) return

            this.$nextTick(() => {
                this.resetInputAndTips()
            })

            const res = await this.$fetch({
                name: 'putV2UserRule',
                method: 'put',
                data: {
                    symbol_id: a.symbol_id,
                    signals
                }
            })
            
            if (res.error === 0) {
                a.edit = false
                this.getV2UserRules()
                this.$notice.toast({ message: this.$t('保存成功') })
            } else {
                this.$notice.toast({ message: this.$t('保存失败') })
            }
        },
        /**
         * 输入框获得焦点时获取价格
         * @param {string} platform 交易所
         * @param {string} symbol
         * @param {string} symbol_id
         * @param {string} pair_base
         * @param {number} index 币种的索引
         * @param {number} jIndex 该币种下 规则的索引
         * @param {string} oldVal 输入框旧的值
         * @param {string} signal 该行的规则
         * @param {string} key more_than 或者 less_than
         */
        async getInputCoinPrice (platform, symbol, symbol_id, pair_base, index, jIndex, oldVal, signal, key) {
            this.input.symbol_id = symbol_id
            this.input.unit = pair_base
            this.input.index = index
            this.input.jIndex = jIndex
            this.input.oldVal = oldVal
            this.input.signal = signal
            this.input.key = key

            this.getInputCoinPriceLoading = true
            const data = {
                platform,
                symbol,
                symbol_id,
                pair_base,
                unit: pair_base
            }
            const res = await this.$fetch({
                url: `${API_BaseUrl}/api/coin/price`,
                method: 'GET',
                data
            })
            if (res.error === 0) this.inputCoinInfo = res.result

            this.getInputCoinPriceLoading = false
        },
        handleBlur (value, index, jIndex, key) {
            const oldVal = this.input.oldVal
            if (!value
                || !/^[0-9]+(\.[0-9]{1,10})?$/.test(this.toStr(+value))
                || this.tips.err) this.userRules[index].signals[jIndex][key] = oldVal
        },
        resetInputAndTips () {
            this.input = {
                symbol_id: '',
                unit: '',
                index: 0,
                jIndex: 0,
                oldVal: '',
                signal: ''
            }
            this.inputCoinInfo = {}
        }
    },
    filters: {
    },
    components: {
        BzhCell,
        BzhGridSelect,
        BzhSwitch,
        BzhRadio,
        Tips,
        Refresher,
        Loadmore
    }
}
</script>

<style scoped lang="less">
@import url('../../css/veriable.less');
@import url('../../css/base.scss');
@import url('./stare.less');

@cell_border_color: #E7EAF1;
.slider-item {
    width: 750px;
}

.scroller {
    position: relative;
}

.items-total {
    height: 75px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 25px;
}

.item {
    margin-bottom: 20px;
    padding-left: 35px;
    background-color: #fff;
}

.big-name-text {
    font-size: 30px;
    font-weight: bold;
    height: 30px;
}

.name-text {
    height: 30px;
    padding-top: 8px;
}

.cell-border {
    border-top-style: solid;
    border-top-width: 1px;
    border-color: @cell_border_color;
}

.cell-input {
	width: 130px;
    height: 50px;
    border-style: solid;
    border-width: 2px;
    border-color: #e9ebf2;
    text-align: center;
}

.delete-button {
    align-items: center;
    justify-content: center;
	width: 100px;
	height: 90px;
	background-color: #f5593f;
}

.add-box-tips {
    color: #434343;
    font-size: 26px;
}

.add-box {
    padding-top: 50px;
    padding-bottom: 3 * @tabbar_height;
    justify-content: center;
    align-items: center;
}

.icon {
    font-size: 45px;
    color: #333;
    font-family: iconfont2;
}

.btn {
    width: 88px;
    height: 88px;
    border-radius: 100%;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    position: relative;
}

.add-regular {
    font-size: 55px;
    color: #f7b237;
}
</style>
