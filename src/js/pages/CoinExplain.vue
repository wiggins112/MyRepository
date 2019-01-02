<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('数据说明')"></wxc-minibar>
        <div class="content">
            <list class="list" :style="{height: tabPageHeight}" v-if="router_params.pagename === 'CoinDetailKs'">
                <cell>
                    <div class="cell_item" ref="zhenfu">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('当日数据说明') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('当日数据指从早上 8AM 到当前时间点的数据') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('交易对数据说明') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{explain_text.zhenfu}}</text>
                        </div>
                    </div>
                </cell>
                <!-- <cell>
                    <div class="cell_item" ref="kongpanzhi">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('控盘值') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{explain_text.kongpanzhi}}</text>
                        </div>
                    </div>
                </cell> -->
                <cell>
                    <div class="cell_item" ref="pankoushuju">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('盘口数据') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{explain_text.pankoushuju}}</text>
                        </div>
                    </div>
                </cell>
                <cell :style="{height: tabPageHeight - tabPageHeight/4}"></cell>
            </list>
            <list class="list" :style="{height: tabPageHeight}" v-if="router_params.pagename === 'CoinAnalyse'">
                <cell>
                    <div class="cell_item" ref="zhibiao">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('指标') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('通过GitHub代码提交数可以看到开发者的活跃程度，判断项目团队是不是在做事，通过粉丝数、复制数、关注数等可以衡量该项目的关注数和影响力，不过此指标仅适用于已经发链的项目，对代币和分叉币意义不大。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="shequnguimo">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('社群规模') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('通过项目的Reddit订阅、Twitter关注、Facebook点赞的数据，可以判断该项目的社区参与者活跃程度，一般来说，得到社区广泛支持的项目更具价值。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="chibifenxi">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('持币分析') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('项目的持币地址数越多，代表群众基础越好，同时通过前十地址持币占比，可以判断是否大量筹码集中在少数庄家手里，存在高度控盘的风险。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="qingxuzhishu">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('情绪指数') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('通过对近期提到该币的资讯、评论进行情感分析，衡量该项目在网络上的形象是好是坏，分数代表正面评价占总体评价的百分比。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell :style="{height: tabPageHeight - tabPageHeight/4}"></cell>
            </list>
            <list class="list" :style="{height: tabPageHeight}" v-if="router_params.pagename === 'Change'">
                <cell>
                    <div class="cell_item" ref="volume">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('成交额异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('成交额异动可指示该币种的成交额异常变化，使用每小时成交额增量数据分析成交额异动。异常上升意为市场活跃度突然上升，整体市场热度较该时段均值高；反之异常下降则代表市场较该时段均值低，易出现较大涨跌幅。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="change">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('涨跌异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('涨跌异动可指示该币5分钟内价格发生大幅度变化，需注意后续动向。该异动使用5分钟涨跌幅作为数据集，根据统计学方法计算异动。因市场目前币种质量差别较大，因此目前计算涨跌异动范围仅限市值前300币种。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="address_big">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('大额地址异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('大额地址异动可指示当日大户异常持仓变动，可视为大股东减持/增持；反映了大户信心变动。该异动使用每日仓位变动为数据集，根据统计学方法计算异动，可有效反映偏离历史均值的持仓变动。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="long_short">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('多空异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('当多空异动指示币种当前价格正负10%区间内委托单的多空单数比值，又称多空力量变化。预示着市场整体情绪发生转变，一般来说是整体市场变盘的预告。该异动使用5分钟周期委比数据来分析，突然上涨则代表多方单数大幅上升，反之突然下跌则代表空方单数大幅上升。该异动优先于市场变化，可指引市场方向。') }}</text>
                        </div>
                    </div>
                </cell>
                 <cell>
                    <div class="cell_item" ref="media_hot">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('媒体热度异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('媒体热度异动可指示一周内币种媒体热度异常变化，代表该币种短期媒体热度大幅上升或下降，但需判断利好或利空消息。该仓位使用7日媒体热度为数据集，每日滚动检测变化，显示急速变动的媒体热度。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="tech_hot">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('技术异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('技术异动使用GitHub及其他技术平台公开的币种代码数据，通过监控数据每日增量的突然上升来发现币种在技术开发上的突破或突然下降来显示技术开发进度缓慢，此指标仅对开源的公链有效。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="address_close">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('地址集中度异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('地址集中度异动通过统计每日地址拥有量，以基尼指数计算方法来计算该币种TOP1000地址所代表的集中度，通过每日基尼指数增量来分析出地址集中度异动。该异动如有异常正增量，可能代表大户进场或散户离场；异常负增量则代表散户进场或大户离场。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="plate">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('概念板块异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('概念板块异动指示该板块走势异常变动，代表该板块整体趋势产生大幅变动，会对该板块内币种未来趋势产生影响。该异动使用板块指数5分钟涨跌幅作为数据集，根据统计学方法计算异动。该异动能很好的显示出目前市场环境对于板块的异常影响。') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="platform_capital">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('交易所资金异动') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('交易所资金异动可指示交易所资金异常的流入流出，实时反映了各个交易所每日资金异常流动。该异动使用交易所每日资金净流入额作为数据集，根据统计学方法计算异动。该异动能够较好的反映出交易所整体发展势头。当交易所连报流入异动时，该交易所预计将大幅增加手续费收入，而当连报流出异动时，则意为交易资金正在离开该交易所，该交易所或有变动产生') }}</text>
                        </div>
                    </div>
                </cell>
                <cell :style="{height: tabPageHeight - tabPageHeight/4}"></cell>
            </list>
            <list class="list" :style="{height: tabPageHeight}" v-if="router_params.pagename === 'Market'">
                <cell>
                    <div class="cell_item" ref="bzhzhishu">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('币智慧') }}300{{ $t('指数') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('币智慧300指数是币智慧独家推出的大盘指数，该指数主要考虑到目前加密数字货币市场的结构以及较不成熟的现状，通过算法筛选出目前市场代表性较好的300个币种，以流通总额加权平均的方法计算出来；') }}</text>
                        </div>
                    </div>
                </cell>
                <cell>
                    <div class="cell_item" ref="zhangdiefenbu">
                        <div class="item_title">
                            <text class="title_line"></text>
                            <text class="title_text">{{ $t('涨跌分布') }}</text>
                        </div>
                        <div class="item_intro">
                            <text class="intro_text">{{ $t('根据算法选取最具市场代表性的300个币种，统计当日涨跌分布，从而展示市场情绪；') }}</text>
                        </div>
                    </div>
                </cell>
                <cell :style="{height: tabPageHeight - tabPageHeight/4}"></cell> 
            </list>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
const dom = weex.requireModule('dom')

export default {
    components: {
        StatusBar,
        WxcMinibar,
    },
    data() {
        return {
            router_params: {},
            explain_text: {
                zhenfu: `${this.$t('24h最高：从现时间点到24小时前这段时间内成交的最高价；')} 

${this.$t('24h最低：从现时间点到24小时前这段时间内成交的最低价； ')} 

${this.$t('买一价：当前盘口未成交的价格最高的买入价格； ')} 

${this.$t('卖一价：当前盘口未成交的价格最低的卖出价格； ')} 

${this.$t('振幅：反应当天的市场波动幅度，公式为(当日最高价-当日最低价)/当日8:00am价格*100%；')} 

${this.$t('量比：衡量相对成交量的指标，公式为(当日成交量/8:00am至现时间分钟数)/过去7日每分钟平均成交量；')} `,
                pankoushuju: `${this.$t('成交量：数字货币当日的成交个数；')} 

${this.$t('成交额：数字货币当日的成交金额（万元）；')} 

${this.$t('内盘/外盘：外盘为主动性买盘，内盘为主动性卖盘。分别指在当前交易日中愿意以大于等于卖一价成交的累积成交量以及小于等于买一价成交的累积成交量。外盘反应主动买的意愿，卖盘反应主动卖的意愿；')} 

${this.$t('委比：衡量市场上买卖盘相对力量的指标，正则买方强，负则卖方强，公式为（委托买入币数-委托卖出币数）/（委托买入币数+委托卖出币数）；')} 

${this.$t('涨速：反应了当前市场交易者的信息有效度，公式为(最新价-5分钟之前的价格)/5；')} 

${this.$t('换手率：(当日的成交量)/(总币数)* 1000‰')} 

${this.$t('涨幅（24h）：反应当前市场交易者的信息有效度，公式为(最新价-24小时之前的价格)/24小时前的价格*100%；')} 

${this.$t('实际价：最新价-手续费需要按照不同交易所规则灵活决定；')} 

${this.$t('手续费：手续费/最新价*100%')} `,
                kongpanzhi: this.$t('控盘值越小，庄家操作可能性越高，0-20为较高，20-50是一般，50-100是较低') ,
            }
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
                this.$nextTick(() => {
                    this.setScrollTo();
                })
            })
        },
        setScrollTo() {
            let name = this.router_params.name;
            const el = this.$refs[name];
            if (!el) {
                return;
            }
            dom.scrollToElement(el, { animated: false, offset: 0 })
        }
    },
    computed: {
        tabPageHeight() {
            return Utils.env.getPageHeight();
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.content {}

.list {
    background-color: #fff;
}

.cell_item {
    margin-top: 25px;
    margin-bottom: 30ppx;
}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
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
    width: 10px;
    height: 34px;
    background-color: @main_color;
}

.title_text {
    margin-left: 15px;
    font-size: 34px;
    color: #434343;
    font-weight: bold;
}

.item_intro {
    padding: 0 @padding_size;
    line-height: 60px;
}

.intro_text {
    font-size: 32px;
    color: #434343;
    line-height: 60px;
}

</style>
