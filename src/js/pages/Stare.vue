<template>
    <div class="container">
        <StatusBar :statusBarStyle="{bgColor:'#fff'}"></StatusBar>
        <!-- 上方菜单 -->
        <Tab :tabTitles="tabTitles" :activeIndex="activeTabIndex" :paddingInner="100" @switch="tabSwitch"
            @barLeftButtonClick="destoryCoinTimer()" class="tab-border" />
        <!-- 轮播图 + 滚动容器 进行左右页面切换 -->
        <slider class="slider" :index="activeTabIndex" @change="tabChangeHandler" :style="{top: sliderTop}">
            <scroller class="scroller slider-item">
                <LoadMore :loading="loading"/>
                <div v-if="initFinish">
                    <!-- 实时价格 -->
                    <Price class="price"
                        :name1="`${route_param.symbol} (${platform.title})`" :name2="coin.cn"
                        :price1="basePriceShow" :price2="coin.price_local_str | toSymbol($t('CNY'))"
                        :rise1="coin.percent_change_8am_str" rise2="当日涨跌"/>

                    <!-- 价格行情规则设置 -->
                    <div class="switch-item py-15">
                        <div class="switch-item-inner px-25">
                            <text class="item-title">{{ $t('价格行情') }}</text>
                            <BzhSwitch v-model="priceQuote.active" />
                        </div>
                        <div style="margin-top: 15px;">
                            <BzhCell class="cell-border mx-25" height="90px">
                                <text slot="l" class="cell-l-text">{{ $t('市场') }}</text>
                                <template slot="r">
                                    <text :style="{color: priceQuote.active ? '#434343' : '#9b9da4'}"
                                        @click="toggleSelectList('exchangesListShow')">{{ platform.title }}</text>
                                    <wxc-icon name="more_unfold" ref="exchangesListShow" :style="{color: priceQuote.active ? '#434343' : '#9b9da4'}"
                                        @wxcIconClicked="toggleSelectList('exchangesListShow')"></wxc-icon>
                                </template>
                            </BzhCell>
                            
                            <BzhCell class="cell-border mx-25" height="90px">
                                <text slot="l" class="cell-l-text">{{ $t('交易对') }}</text>
                                <template slot="r">
                                    <text slot="r" :style="{color: priceQuote.active ? '#434343' : '#9b9da4'}"
                                        @click="toggleSelectList('pairListShow')">{{ pair.pair }}</text>
                                    <wxc-icon name="more_unfold" ref="pairListShow" :style="{color: priceQuote.active ? '#434343' : '#9b9da4'}"
                                        @wxcIconClicked="toggleSelectList('pairListShow')"></wxc-icon>
                                </template>
                            </BzhCell>
                            
                            <!-- 规则菜单 -->
                            <BzhCell class="cell-border mx-25" v-for="(i, index) in add_stat_menus" :key="'add_stat_menus' + index" height="90px" v-if="i.show">
                                <template slot="l">
                                    <bzh-radio v-model="i.active" :label="true" @clickTure="focusInput('add_stat_menus_input' + index)" cancel :disabled="!priceQuote.active"/>
                                    <div class="cell-radio-text" @click="focusInput('add_stat_menus_input' + index)">
                                        <text class="cell-l-text">{{ i.title }}</text>
                                    </div>
                                </template>
                                <input slot="m" type="number" class="cell-m-input" :ref="'add_stat_menus_input' + index"
                                    :placeholder="i.placeholder" :disabled="!priceQuote.active" :value="i.value"
                                    @focus="statMenusValueFocus(i.value, index, 'add_stat_menus_input' + index)"
                                    @blur="statMenusValueBlur(i.value, index, 'add_stat_menus_input' + index)"
                                    @input="statMenusValueInput(arguments[0], i.signal, i.unit, index, 'add_stat_menus_input' + index)"
                                    @change="statMenusValueChange(arguments[0], i.signal, i.unit, index, 'add_stat_menus_input' + index)" />
                                <text slot="r" class="cell-r-text" :style="{color: priceQuote.active ? i.colorR || '#434343' : '#9b9da4'}">{{ i.unit }}</text>
                            </BzhCell>

                            <!-- 提醒频率 -->
                            <BzhCell class="cell-border mx-25" height="60px">
                                <template slot="l">
                                    <text class="item-title fs-28 px-10">{{ push_frequency_menus.title }}</text>
                                    <div class="item-radio-outer" v-for="i in push_frequency_menus.list" :key="i.value" @click="push_frequency = i.value">
                                        <BzhRadio v-model="push_frequency" :label="i.value" />
                                        <text class="item-radio-span">{{ i.title }}</text>
                                    </div>
                                </template>
                                <text class="item-span px-10 mt-0">{{ push_frequency_menus.tips }}</text>            
                            </BzhCell>

                            <!-- 脱离文档流 -->
                            <!-- 提示 -->
                            <Tips v-for="(i, index) in tipsList" :key="'tips' + index" :top="i.top" left="185px"
                                v-if="!exchangesListShow && !pairListShow && i.show && i.title" :title="i.title" />
                            
                        </div>
                    </div>

                    <!-- 官方公告、事件异动、技术指标 -->
                    <div class="switch-item px-25 py-15" v-for="(i, index) in events_menus" :key="'events_menus' + index">
                        <div class="switch-item-inner">
                            <text class="item-title">{{ i.title }}</text>
                            <BzhSwitch v-model="i.active" />
                        </div>
                        <text class="item-span">{{ i.tips }}</text>
                    </div>

                    <!-- 保存按钮 -->
                    <div :class="['save', saveButton ? 'save-button-active' : 'save-button']" @click="save()">
                        <text class="save-span">{{ $t('保存') }}</text>
                    </div>

                    <!-- 市场列表 -->
                    <div class="platformList" v-if="exchangesListShow" style="top: 341px;">
                        <div class="px-25" style="background-color: #fff;">
                            <BzhCell class="cell-border" height="90px" v-for="(i, index) in exchangesList" @clickLine="selectPlatform(i)"
                                :key="'exchangesList' + index" style="background-color: #fff;">
                                <text slot="r" @click="selectPlatform(i)">{{ i.title }}</text>
                            </BzhCell>
                        </div>
                        <ListShadow />
                    </div>
                    <!-- 交易对列表 -->
                    <div class="pairList" v-if="pairListShow" style="top: 432px;">
                        <div class="px-25" style="background-color: #fff;">
                            <BzhCell class="cell-border" height="90px" v-for="(i, index) in pairList" @clickLine="selectPair(i)"
                                :key="'pairList' + index" style="background-color: #fff;">
                                <text slot="r">{{ i.pair }}</text>
                            </BzhCell>
                        </div>
                        <ListShadow />
                    </div>
                </div>
            
            </scroller>

            <!-- 我的盯盘页面 -->
            <MyStare ref="myStare" @initData="myStareInitData" :pagearrow="false"/>
        </slider>
    </div>
</template>

<script>
import { WxcCell, WxcIcon } from 'weex-ui'
import { buiIcon } from 'bui-weex'
import StatusBar from '../components/StatusBar.vue'
import Tab from '../components/Stare/Tab.vue'
import Tips from '../components/Stare/Tips.vue'
import Price from '../components/Stare/Price.vue'
import ListShadow from '../components/Stare/ListShadow.vue'
import MyStare from '../components/Stare/MyStare.vue'
import LoadMore from '../components/Loadmore.vue'
import { BzhSwitch, BzhRadio, BzhCell } from '../../bzh-ui/index.js'
import { API_BaseUrl } from '../config/config.js'
import _ from 'lodash'
const animation = weex.requireModule('animation')
export default {
    name: '',
    components: {
        WxcCell,
        WxcIcon,
        buiIcon,
        StatusBar,
        Tab,
        Price,
        MyStare,
        BzhSwitch,
        BzhRadio,
        BzhCell,
        ListShadow,
        Tips,
        LoadMore
    },
    data () {
        return {
            loading: 'loading',
            tabTitles: [this.$t('添加盯盘'), this.$t('我的盯盘')],
            activeTabIndex: 0,
            events_menus: [],           // 官方公告、事件异动、技术指标等菜单
            priceQuote: {               // 价格行情开关
                title: this.$t('价格行情'),
                active: true
            },
            pairChangeLoading: true,    // 交易对切换时，价格刷新状态
            route_param: {},            // 取出来的路由参数
            coin: {},                   // 币详情
            exchanges: [],              // 市场和交易对数据
            platform: {                 // 选择的市场
                title: ''
            },
            pair: {},                   // 选择的交易对
            add_stat_menus: [],         // 添加规则列表
            tipsList: [],               // 提示列表
            push_frequency_menus: {     // 提醒频率列表
                list: []
            },
            push_frequency: '',         // 选择的提醒频率
            exchangesListShow: false,   // 是否显示市场列表
            pairListShow: false,        // 是否显示交易对列表
            coinTimer: null,         // 价格刷新定时器
            myStareData: []
        }
    },
    computed: {
        initFinish () {
            return this.events_menus.length
                && this.exchangesList.length
                && this.add_stat_menus.length
                && this.push_frequency_menus.list.length
        },
        // 轮播组件绝对定位 top
        sliderTop () {
            const barHeight = weex.config.eros.statusBarHeight || 40
            const t = +barHeight + 90
            return `${t}px`
        },
        // 交易所列表
        exchangesList () {
            if (!this.exchanges[0]) return [{ title: this.$t('均价') }]
            let r = this.exchanges.map(x => {
                return x.platform
            })
            r = [this.$t('均价'), ...new Set(r)]
            return r.map(x => {
                return { title: x }
            })
        },
        // 交易对列表
        pairList () {
            if (this.platform.title === '均价') {
                return [{
                    pair: 'USD',
                    pair_symbol: this.route_param.symbol,
                    pair_base: 'USD'
                }, {
                    pair: this.$t('CNY'),
                    pair_symbol: this.route_param.symbol,
                    pair_base: this.$t('CNY')
                }]
            }
            return _.filter(this.exchanges, { platform: this.platform.title }).map(x => {
                return {
                    pair: x.pair,
                    pair_symbol: x.pair_symbol,
                    pair_base: x.pair_base
                }
            })
        },
        // 上次保存的规则
        myStareRules () {
            if (!this.myStareData.signals || !this.myStareData.signals.length) return []
            const rules = this.myStareData.signals.map(x =>{
                if (['news_event', 'notice_event'].includes(x.signal)) return x
                if (x.platform === this.platform.title && x.pair_symbol === this.pair.pair_symbol
                    && x.pair_base === this.pair.pair_base) return x
            }).filter(Boolean)
            return rules
        },
        // 保存按钮是否可以点击
        saveButton () {
            const events_menus_active = this.events_menus.some(x => {
                if (x.active) return true
            })
            // if (this.priceQuote.active) return true
            const priceQuote_active = this.add_stat_menus.some(x => {
                if (x.active) return true
            })
            return this.priceQuote.active && priceQuote_active || events_menus_active
            // return false
        },
        basePriceShow () {
            if (this.pairChangeLoading) return this.$t('价格获取中')
            const price = this.platform.title === '均价'
                ? this.$options.filters.toSymbol(this.coin.price_usd_str, 'USD')
                : (this.coin.price_base || this.coin.cur_price_base || '--').toString().slice(0, 8) + this.pair.pair_base // 当前价格
            return price
        }
    },
    watch: {
        platform: {
            handler: function (val) {
                // 均价时不显示买一买一
                this.add_stat_menus.map(x => {
                    if (x.signal === 'buy_price_more' || x.signal === 'sell_price_less') x.show = val.title !== '均价'
                })
            },
            deep: true
        },
        // 交易对列表改变时，默认选择第一个交易对
        pairList (val) {
            this.pair = val[0] || {}
        },
        initFinish (val) {
            if (val) this.loading = 'loaded'
        },
        // 交易对改变时，改变规则列表单位
        pair (val) {
            this.getCoin(true)
            this.add_stat_menus.map(x => {
                if (x.unit !== '%') x.unit = val.pair_base
                x.active = false
                x.value = ''
            })
            this.events_menus.map(x => {
                x.active = false
            })
            this.tipsList = [] // 清理提示
            this.$nextTick(() => {
                this.showMyRules()
            })
        },
        coin: {
            handler: function (obj) {
                obj.cn = obj.cn || '' // 有些可能没有中文名称，如果为 undefined 会触发 Price 组件 lazy过滤器
                obj.percent_change_8am = obj.percent_change_8am || obj.percent_change_8h
                obj.price_local_str = obj.price_local_str || obj.cur_price_cny_str || this.$t('暂无数据')
                obj.price_usd_str = obj.price_usd_str || obj.cur_price_usd_str || this.$t('暂无数据')
                obj.percent_change_8am_str = obj.percent_change_8am_str || obj.price_change_8h_percent_str || this.$t('暂无数据')
            },
            deep: true
        },
        priceQuote: {
            handler: function (val) {
                if (!val.active) this.add_stat_menus.map(x => {
                    x.active = false
                })
            },
            deep: true
        }
    },
    mounted () {
        this.init()
    },
    methods: {
        init () {
            this.getParams()
            this.getAddStatMenus()
        },
        // 我的盯盘规则(根据 symbol_id 筛选)
        async myStareInitData (items) {
            const routeParam = await this.$router.getParams()
            const item = items.map(x => {
                if (x.symbol_id === routeParam.symbol_id) return x
            }).filter(Boolean)
            this.myStareData = item.length ? item[0] : []
            this.$nextTick(() => {
                if (this.pair.pair) this.showMyRules()
            })
        },
        // 显示上次保存的项
        showMyRules () {
            if (!this.myStareRules.length) return
            this.myStareRules.map(x => {
                if (x.signal.includes('more')) {
                    const y = _.find(this.add_stat_menus, {signal: x.signal})
                    y.value = this.toStr(+x.more_than)
                    y.active = true
                }
                if (x.signal.includes('less')) {
                    const y = _.find(this.add_stat_menus, {signal: x.signal})
                    y.value = this.toStr(+x.less_than)
                    y.active = true
                }
                if (['notice_event','news_event','tech_event'].includes(x.signal)) {
                    _.find(this.events_menus, {signal: x.signal}).active = true
                }
                this.push_frequency = x.push_frequency
            })
        },
        // 销毁获取价格的定时器
        destoryCoinTimer () {
            this.coinTimer && clearInterval(this.coinTimer)
            this.coinTimer = null
        },
        // 获取路由参数
        async getParams () {
            this.route_param = await this.$router.getParams()
            this.route_param.pair_symbol = this.route_param.pair_symbol || this.route_param.symbol
            this.coinTimer = setInterval(() => { this.getCoin() }, 3000)
            this.getCoinExchanges() // 依赖 this.route_param.pair_symbol
        },
        // 获取盯盘规则列表
        async getAddStatMenus () {
            try {
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
                    this.add_stat_menus = res.result.stat_menus
                    // 提醒频率
                    this.push_frequency_menus = res.result.push_frequency_menus
                    this.push_frequency = res.result.push_frequency_menus.value
                    this.events_menus = res.result.events_menus
                    for (let i = this.add_stat_menus.length - 1; i >= 0; i--) {
                        this.add_stat_menus[i].show = true
                        if (i === 0) {
                            this.$nextTick(() => {
                                this.platform.title = this.route_param.platform
                            })
                        }
                    }
                } else {
                    this.loading = 'neterror'
                }
            } catch (e) {
                this.loading = 'neterror'
            }
        },
        /**
         * 获取币价格数据
         * @param {Boolean} pairChange 交易对切换
         */
        async getCoin (pairChange = false) {
            this.pairChangeLoading = pairChange
            const data = {
                platform: this.platform.title || this.route_param.platform,
                symbol: this.route_param.symbol,
                symbol_id: this.route_param.symbol_id
            }
            if (this.pair.pair_base || this.route_param.pair_base) {
                data.pair_base = this.pair.pair_base || this.route_param.pair_base
                data.unit = this.pair.pair_base || this.route_param.pair_base
            }
            const res = await this.$fetch({
                url: `${API_BaseUrl}/api/coin/price`,
                method: 'GET',
                data
            })
            if (res.error === 0) {
                this.coin = res.result
                this.$nextTick(() => {
                    this.pairChangeLoading = false
                })
            }
        },
        async getCoinExchanges () {
            try {
                const res = await this.$fetch({
                    url: `${API_BaseUrl}/api/coin/${this.route_param.pair_symbol}/exchanges`,
                    method: 'GET',
                    data: {}
                })
                if (res.error === 0) {
                    this.exchanges = res.items
                } else {
                    this.loading = 'neterror'
                }
            } catch (e) {
                this.loading = 'neterror'
            }
        },
        /**
         * 切换左右界面
         * @param {*} i 列表中被点击的项
         * @param {number} index 被点击项的索引
         */
        tabSwitch (i, index) {
            this.activeTabIndex = index
            if (index === 1) this.$refs.myStare.init()
            this.$tools.resignKeyboard().then(resData => {
                // 收起键盘
            }, error => {})
        },
        /**
         * 打开或关闭下拉列表
         * @param {Boolean} x 列表当前状态
         */
        toggleSelectList (x) {
            if (this.priceQuote.active === false) return
            this[x] = !this[x]
            const el = this.$refs[x]
            if (this[x]) {
                animation.transition(el, {
                    styles: { transform: 'rotate(180deg)' },
                    duration: 500, // ms
                    timingFunction: 'ease'
                })
            } else {
                animation.transition(el, {
                    styles: { transform: 'rotate(0deg)' },
                    duration: 500, // ms
                    timingFunction: 'ease'
                })
            }
            this.$nextTick(() => {
                if (this.exchangesListShow && this.pairListShow) {
                    x === 'exchangesListShow' ? this.toggleSelectList('pairListShow') : this.toggleSelectList('exchangesListShow')
                }
            })
        },

        /**
         * 轮播图组件进行页面切换时触发
         * @param {Object} e event 对象
         */
        tabChangeHandler (e) {
            this.activeTabIndex = e.index
        },
        // 选择交易所
        selectPlatform (x) {
            this.platform = x
            this.toggleSelectList('exchangesListShow')
        },
        // 选择交易对
        selectPair (x) {
            this.pair = x
            this.toggleSelectList('pairListShow')
        },
        // 添加规则列表，选择时输入框获得焦点
        focusInput (x) {
            if (this.priceQuote.active) this.$refs[x][0].focus()
        },
        /**
         * 设置提示气泡列表
         * @param {string} top 绝对定位高度
         * @param {string} title 提示文字
         * @param {number} err 错误
         */
        tipsListSet (top, title, err, show = true) {
            let obj = _.find(this.tipsList, { top })
            if (obj) {
                obj.title = title
                obj.err = err
                obj.show = title && show // 可以有 title 时不显示，不能无 title 时显示
            } else {
                this.tipsList.push({ top, title, err, show })
            }
        },
        /**
         * 计算高度函数
         * @param {number} index 列表索引
         */
        indexToTop (index) {
            return index * 91 + 175 + 'px' // 气泡高度
        },
        tipsClose (top, index) {
            top = top || this.indexToTop(index)
            let obj = _.find(this.tipsList, { top })
            if (obj) obj.show = false
        },
        tipsShow (top, index) {
            top = top || this.indexToTop(index)
            let obj = _.find(this.tipsList, { top })
            if (obj && obj.title) obj.show = true
        },
        /**
         * 判断规则列表输入框的值，弹出提示
         * @param {string} top 绝对定位高度
         * @param {number} value 该行的值
         * @param {number} index 该行的索引
         */
        handlerInputValue (top, value, index, uint = '') {
            top = top || this.indexToTop(index)
            value = +value
            if (!value) {
                this.tipsListSet(top, null, 1)
                return
            }
            if (this.pairChangeLoading) {
                this.tipsListSet(top, this.$t('行情获取中'), 1)
                return
            }
            const unit = this.pair.pair_base.toLowerCase() // 当前选择的单位
            const signal = this.add_stat_menus[index].signal // 当前行的标志
            const price = this.coin['price_' + unit] || this.coin.price_base || this.coin['cur_price_' + unit] || this.coin.cur_price_base // 当前价格
            const percent_change_8am = this.coin.percent_change_8am || +(this.coin.price_change_8h_percent * 100).toFixed(2)// 当日涨跌幅
            if (price) {
                switch (signal) {
                    case 'price_more':
                        price > value
                            ? this.tipsListSet(top, this.$t('低于当前价'), 1)
                            : this.tipsListSet(top, `当日涨幅${((value - price) / price * 100).toFixed(2)} %`, 0)
                        break
                    case 'price_less':
                        price < value
                            ? this.tipsListSet(top, this.$t('高于当前价'), 1)
                            : this.tipsListSet(top, `当日跌幅${((value - price) / price * 100).toFixed(2)} %`, 0)
                        break
                    case 'change_8am_more':
                        percent_change_8am > value
                            ? this.tipsListSet(top, this.$t('小于当前日涨幅'), 1)
                            : this.tipsListSet(top, `价格为 ${((1 + value / 100) * price).toFixed(2)}`, 0)
                        break
                    case 'change_8am_less':
                        if (value > 100) {
                            this.tipsListSet(top, '跌幅不能大于 100 %', 1)
                        } else {
                            -percent_change_8am > value
                                ? this.tipsListSet(top, this.$t('小于当前日跌幅'), 1)
                                : this.tipsListSet(top, `价格为 ${((1 - value / 100) * price).toFixed(2)}`, 0)
                        }
                        break
                    case 'change_5m_more':
                        this.tipsListSet(top, `价格为 ${((1 + value / 100) * price).toFixed(2)}`, 0)
                        break
                    case 'change_5m_less':
                        value > 100
                            ? this.tipsListSet(top, '跌幅不能大于 100 %', 1)
                            : this.tipsListSet(top, `价格为 ${((1 - value / 100) * price).toFixed(2)}`, 0)
                        break
                    case 'buy_price_more':
                        price > value 
                            ? this.tipsListSet(top, this.$t('低于当前价'), 1)
                            : this.tipsListSet(top, null, 0)
                        break
                    case 'sell_price_less':
                        price < value
                            ? this.tipsListSet(top, this.$t('高于当前价'), 1)
                            : this.tipsListSet(top, null, 0)
                        break
                }
            } else {
                switch (signal) {
                    case 'change_8am_less':
                        value > 100
                            ? this.tipsListSet(top, '跌幅不能大于 100 %', 1)
                            : this.tipsListSet(top, null, 0)
                        break
                    case 'change_5m_less':
                        value > 100
                            ? this.tipsListSet(top, '跌幅不能大于 100 %', 1)
                            : this.tipsListSet(top, null, 0)
                        break
                    default:
                        this.tipsListSet(top, null, 0)
                }
            }
        },
        /**
         * 输入时实时判断
         * @param {Object} e event 对象
         * @param {string} signal 该行的标题的signal，如: 价格涨到的'price_more' // 没用到
         * @param {string} unit 单位，如 '%' // 没用到
         * @param {number} index 该行的索引
         * @param {string} ref 该元素的 ref // 没用到
         */
        statMenusValueFocus (value, index, ref) {
            const e = {}
            e.value = +value
            this.statMenusValueInput(e, null, null, index, ref)
        },
        statMenusValueBlur (value, index, ref) {
            this.tipsClose(null, index)
            if (!value) this.add_stat_menus[index].active = false
        },
        statMenusValueInput (e, signal, unit, index, ref) {
            if (e.value.length && e.value.length <= 2) { // 解决 input 的 bug
                this.add_stat_menus[index].value = +e.value
                this.$nextTick(() => {
                    this.add_stat_menus[index].value = e.value
                })
            }
            const top = this.indexToTop(index)
            this.handlerInputValue(top, +e.value, index, unit)
        },
        statMenusValueChange (e, signal, unit, index, ref) {
            const inputErr = !e.value || !/^[0-9]+(\.[0-9]{1,10})?$/.test(this.toStr(+e.value))
            const top = this.indexToTop(index)
            const tips = _.find(this.tipsList, { top })
            const err = tips && tips.hasOwnProperty('err') ? tips.err : 0 // 提示错误
            if (inputErr || err) {
                this.$nextTick(() => {
                    this.add_stat_menus[index].value = ''
                    this.tipsListSet(top, null, 1)
                })
            } else {
                this.add_stat_menus[index].value = this.toStr(+e.value)
            }
            this.$nextTick(() => {
                this.add_stat_menus[index].active = !inputErr && !err
                const top = this.indexToTop(index)
                this.tipsClose(top)
            })
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
        // 保存提交
        async save () {
            if (!this.saveButton) return
            const platform = this.platform.title
            const type = this.platform.title === '均价' ? '均价_v2' : 'single_v2'
            let data = {
                type,
                platform,
                pair_symbol: this.route_param.pair_symbol,
                pair_base: this.pair.pair_base,
                signals: [],
                unit: this.pair.pair_base,
                symbol_id: this.route_param.symbol_id,
                push_frequency: this.push_frequency
            }
            this.add_stat_menus.map(x => {
                if (!+x.value) x.active = false
                data.signals.push({
                    signal: x.signal,
                    value: +x.value,
                    active: x.active
                })
            })
            this.events_menus.map(x => {
                data.signals.push({
                    signal: x.signal,
                    value: x.active,
                    active: x.active
                })
            })
            for (let i in data) {
                if (!data[i]) {
                    this.getParams() // 有概率获取失败
                    this.$notice.toast({ message: this.$t('保存失败') })
                    return
                }
            }
            const res = await this.$fetch({
                name: 'postV2UserRule',
                method: 'POST',
                data
            })
            res.error === 0
                ? this.$notice.toast({ message: this.$t('保存成功') })
                : this.$notice.toast({ message: this.$t('保存失败') })
            this.$refs.myStare.init()
        }
    },
    filters: {
        toSymbol (val='', symbol) {
            if (val === '暂无数据') return val
            const str = val.split(' ')[1] || val
            return str + symbol
        }
    }
}
</script>

<style scoped lang="less">
@import url('../css/veriable.less');
@import url('../css/base.scss');
@import url('../components/Stare/stare.less');

@cell_border_color: #E7EAF1;

.slider {
    width: 750px;
    position: fixed;
    bottom: 0;
    left: 0;
}
.slider-item {
    width: 750px;
}
.scroller {
    position: relative;
}
.scroller, .cell-border {
    border-top-style: solid;
    border-top-width: 1px;
    border-color: @cell_border_color;
}
.switch-item {
    width: 750px;
    background-color: #fff;
    margin-top: 20px;
}
.switch-item-inner {
    justify-content: space-between;
    flex-direction: row;
}
.item-title {
    line-height: 60px;
    font-size: 32px;
}
.item-span {
    margin-top: 15px;
    font-size: 24px;
	line-height: 40px;
	color: #9b9da4;
}
.item-radio-outer {
    flex-direction: row;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 5px;
    padding-right: 5px;
}
.item-radio-span {
    font-size: 24px;
	color: #434343;
}
.save {
    margin-top: 100px;
    align-items: center;
    justify-content: center;
    width: 750px;
    height: 100px;
}
.save-button-active {
    background-color: @main_color;
}
.save-button {
    background-color: #d1d1d4;
}
.save-span {
    font-size: 36px;
    color: #fff; 
}
.cell-l-text {
    width: 160px;
    color: #9b9da4;
    font-size: 28px;
}
.cell-m-input {
    width: 250px;
    font-size: 24px;
    color: #434343;
    text-align: left;
    line-height: 36px;
}
.cell-r-text {
    width: 103px;
    text-align: left;
}
.platformList, .pairList {
    position: absolute;
    width: 750px;
    color: #434343;
}
.cell-radio-text {
    height: 90px;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
</style>
