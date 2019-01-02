<template>
    <div class="container">
        <div class="wrapper">
            <div class="status_bar" v-if="onpulling_down" :style="{height: onpulling_down_y}"></div>
                <div :class="['fixed_bar', fixed_bar && 'fixed_bar_active']">
                    <StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
                    <wxc-minibar :title="$t('竞猜详情')">
                        <text slot="right" v-if="bet_activity.type === 'fact' && (!hideModule['Share'])" class="icon" @click="showShareComponents">&#xe90b;</text>
                        <text slot="right" v-if="bet_activity.type === 'vote' && (!hideModule['Share'])" class="icon-text" @click="showShareComponents">{{ $t('拉票') }}</text>
                    </wxc-minibar>
                </div>
            <list ref="balance_dom" class="slider" index="0" infinite="false" loadmoreoffset="700" :style="{ height: page_height + 200 }" @loadmore="loadmore" @scroll="onscrollList">
                <!-- <Refresher @refresh="refreshCoins" @onpullingdown="onpullingdown" @refreshEnd="refreshEnd" :loading="loading.bet_activity"></Refresher> -->
                <cell>
                    <div class="head" :style="{height: banner_image_height}">
                        <image class="banner_image" resize="cover" :style="{height: banner_image_height}" :src="bet_activity.banner" />
                        <StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
                        <wxc-minibar :title="$t('竞猜详情')" backgroundColor="transparent" text-color="#fff" borderBottomWidth="0px">
                            <wxc-icon slot="left" name="back" style="color: #fff;font-weight: bold;font-size:60px;position: relative;margin-left:-20px;" @wxcIconClicked="minibarLeftClicked"></wxc-icon>
                            <text slot="right" v-if="bet_activity.type === 'fact' && (!hideModule['Share'])" class="icon right_icon" @click="showShareComponents">&#xe90b;</text>
                            <text slot="right" v-if="bet_activity.type === 'vote' && (!hideModule['Share'])" class="icon-text right_icon" @click="showShareComponents">{{ $t('拉票') }}</text>
                        </wxc-minibar>
                        <text class="banner_num">{{getJoinPersonNum}}{{ $t('人参加') }}</text>
                    </div>
                </cell>
                <cell>
                    <div class="cont">
                        <div class="cont_top ">
                            <div class="row_flex row_flex_mine">
                                <text class="endtime">{{filters.dateFormat(bet_activity.result_ts, 'MM.dd hh:mm')}}</text>
                                <text class="end"> {{ $t('开奖') }}</text>
                            </div>
                            <div class="row_flex row_flex_mine">
                                <text class="cont_middle" @click="toBetMy">{{ $t('我的竞猜') }}</text>
                                <text class="mybetnum" v-if="unview_num > 0">{{unview_num}}</text>
                                <text class="cont_middle" @click="toBetConfig">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{{ $t('规则') }}</text>
                            </div>
                        </div>
                        <text class="cont_middle_title">{{bet_activity.title}}</text>
                        <text class="cont_middle">{{bet_activity.desc}}</text>
                        <!-- 等待开始 -->
                        <div v-if="bet_activity.bet_state === 'wait'">
                            <div class="cont_foot">
                                <div class="row_flex ">
                                    <text class="end">{{ $t('距离竞猜开始还剩') }}</text>
                                    <div class="endtime">
                                        <TimeDown tpl="{d}天{h}:{m}:{s}" :timeBoxStyle="{width: is_ios ? '50px' : 'auto', backgroundColor: '#fff'}" :timeTextStyle="{fontSize: '28px',color: '#F7B237'}" :dotTextStyle="{color: '#F7B237', fontSize: '28px'}" :time="bet_activity.join_start_ts*1000" @wxcOnComplete="onCompletedTwo">
                                        </TimeDown>
                                    </div>
                                </div>
                            </div>
                            <div class="bet_button">
                                <div class="flex1">
                                    <text class="vote_text_title vote_text_pos">{{bet_activity.bet_text_pos || $t('支持')}}</text>
                                    <text class="supporttext">{{ $t('赔率') }}{{bet_activity.odds_value_pos_str}}</text>
                                </div>
                                <div class="flex1">
                                    <text class="vote_text_title vote_text_neg">{{bet_activity.bet_text_neg || $t('反对')}}</text>
                                    <text class="opposttext">{{ $t('赔率') }}{{bet_activity.odds_value_neg_str}}</text>
                                </div>
                            </div>
                        </div>
                        <!-- 竞猜中 且 未投注 -->
                        <div v-if="bet_activity.bet_state === 'now' && !bet_activity.user_bet.bet_type">
                            <div class="cont_foot">
                                <div class="row_flex" >
                                    <text class="end">{{ $t('距离竞猜结束还剩') }}</text>
                                    <div class="endtime">
                                        <TimeDown tpl="{d}天{h}:{m}:{s}" timeBoxStyle="{width: is_ios ? '50px' : 'auto', backgroundColor: '#fff'}" :timeTextStyle="{fontSize: '28px',color: '#F7B237'}" :dotTextStyle="{color: '#F7B237', fontSize: '28px'}" :time="bet_activity.join_stop_ts*1000" @wxcOnComplete="onCompletedTwo">
                                        </TimeDown>
                                    </div>
                                </div>
                                <text class="endhint">{{ $t('仅有一次投注机会') }}，{{ $t('投注后可见投注人数比例') }}</text>
                            </div>
                            <div class="bet_button">
                                <div class="flex1" @click="betPosClick">
                                    <text class="Bt supportBt">{{bet_activity.bet_text_pos || $t('支持')}}</text>
                                    <text class="supporttext">{{ $t('赔率') }}{{bet_activity.odds_value_pos_str}}</text>
                                </div>
                                <div class="flex1" @click="betNegClick">
                                    <text class="Bt oppostBt">{{bet_activity.bet_text_neg || $t('反对')}}</text>
                                    <text class="opposttext">{{ $t('赔率') }}{{bet_activity.odds_value_neg_str}}</text>
                                </div>
                            </div>
                        </div>
                        <!-- 竞猜中，已投注 || 待开奖 -->
                        <div v-if="((bet_activity.bet_state === 'now' && bet_activity.user_bet.bet_type) || bet_activity.bet_state === 'toopen')">
                            <div class="cont_foot">
                                <div class="row_flex " v-if="!filters.lessnowTime(bet_activity.join_stop_ts*1000 )">
                                    <text class="end">{{ $t('距离竞猜结束还剩') }}</text>
                                    <div class="endtime">
                                        <TimeDown tpl="{d}天{h}:{m}:{s}" :timeBoxStyle="{width: is_ios ? '50px' : 'auto', backgroundColor: '#fff'}" :timeTextStyle="{fontSize: '28px',color: '#F7B237'}" :dotTextStyle="{color: '#F7B237', fontSize: '28px'}" :time="bet_activity.join_stop_ts*1000" @wxcOnComplete="onCompletedTwo">
                                        </TimeDown>
                                    </div>
                                </div>
                                <div class="row_flex" v-if="filters.lessnowTime(bet_activity.join_stop_ts*1000 )">
                                    <text class="end">{{ $t('投注已截止') }}，{{ $t('等待开奖') }}</text>
                                </div>
                            </div>
                            <div class="vote_box">
                                <text :class="['vote_title', bet_activity.user_bet.bet_type === 'pos' ? 'vote_text_pos' : 'vote_text_neg']" v-if="bet_activity.user_bet && bet_activity.user_bet.bet_type">{{getUserBetActivity.text}}</text>
                                <div class="vote_percenter">
                                    <div class="vote_hd">
                                        <text class="vote_text vote_text_pos">{{bet_activity.bet_text_pos || $t('支持')}}</text>
                                        <text class="vote_per_text vote_text_pos">{{ $t('赔率') }}{{bet_activity.odds_value_pos_str}}</text>
                                    </div>
                                    <div class="vote_bd">
                                        <div class="vote_line_box vote_line_box_center">
                                            <image class="vote_line_box_image" src="bmlocal://assets/images/bets/blue_line_box.png" />
                                        </div>
                                        <div class="vote_line_box vote_line_box_pos" :style="{width: 50 + (400 - 60 - 30) * (bet_activity.user_bet_pos_percent)}">
                                            <text class="vote_line_text vote_line_text_pos">{{bet_activity.user_bet_pos_percent_str}}</text>
                                        </div>
                                        <div class="vote_line_box vote_line_box_center">
                                            <image class="vote_line_box_image" src="bmlocal://assets/images/bets/line_image.png" />
                                        </div>
                                        <div class="vote_line_box vote_line_box_neg" :style="{width: 50 + (400 - 60 - 30) * (bet_activity.user_bet_neg_percent)}">
                                            <text class="vote_line_text vote_line_text_neg">{{bet_activity.user_bet_neg_percent_str}}</text>
                                        </div>
                                        <div class="vote_line_box vote_line_box_center">
                                            <image class="vote_line_box_image" src="bmlocal://assets/images/bets/red_line_box.png" />
                                        </div>
                                    </div>
                                    <div class="vote_ft">
                                        <text class="vote_text vote_text_neg">{{bet_activity.bet_text_neg || $t('反对')}}</text>
                                        <text class="vote_per_text vote_text_neg">{{ $t('赔率') }}{{bet_activity.odds_value_neg_str}}</text>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 已开奖 -->
                        <div v-if="bet_activity.bet_state === 'opened'">
                            <div class="cont_foot cont_foot_opened">
                                <div class="row_flex ">
                                    <text class="end">{{ $t('竞猜已结束') }}</text>
                                </div>
                            </div>
                            <div class="price_box">
                                <image class="price_icon" src="bmlocal://assets/images/bets/price.png" v-if="getBetResult.type !== 'neu'" />
                                <text :class="['text_h1', getBetResult.class_name]">{{getBetResult.title_text}}</text>
                                <text :class="['text_h6', getBetResult.class_name]">{{getBetResult.result_text}}</text>
                            </div>
                        </div>
                    </div>
                    <!-- 是否中奖盖章 -->
                     <div class="price_image" v-if="bet_activity.bet_state === 'opened' && bet_activity.user_bet.bet_type" @click="viewPicture">
                        <image class="price_image" :src="`bmlocal://assets/images/bets/${bet_result_image}`" />
                    </div>
                </cell>
                <cell>
                    <BetTabs :is_loadmore="is_loadmore" @Loadmored="Loadmored"></BetTabs>
                </cell>
            </list>
            <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="closeShare" @ShareCallback="ShareCallback" />
        </div>
        <wxc-popup popup-color="#ffffff" :show="is_showpick" @wxcPopupOverlayClicked="closePicker" pos="bottom" :height="pick_height">
            <div class="">
                <div class="bet_alert">
                    <text class="alert_hb ">{{bet_activity.title}} - {{current_odds.text}}</text>
                    <div class="alert_bd ">
                        <div class="alert_bt_box less_center">
                            <text class="bt_left" @click="minStepper">—</text>
                            <div class="bt_center less_row" @click="toggleInput">
                                <text class="center_text">{{ $t('投') }} </text>
                                <text class="center_num" v-if="!show_input"> {{stepper.value}} </text>
                                <input class="center_num" type="number" v-model="stepper.value" autofocus="true" v-if="show_input" @focus="inputOnfocus" @blur="inputOnblur">
                                <text class="center_text"> {{bet_activity.symbol}}</text>
                            </div>
                            <text class="bt_right" @click="maxStepper">+</text>
                        </div>
                        <div class="alert_bt_hint less_center">
                            <text class="colorf7b alert_bt_hint_text">1</text>
                            <text class="color9b9 alert_bt_hint_text">{{ $t('注') }}，</text>
                            <text class="color9b9 alert_bt_hint_text">{{ $t('共') }}</text>
                            <text class="colorf7b alert_bt_hint_text">{{stepper.value}}</text>
                            <text class="color9b9 alert_bt_hint_text">BZH，{{ $t('回报') }}</text>
                            <text class="colorf7b alert_bt_hint_text">{{filters.fixNumber(current_odds.value)}}</text>
                            <text class="color9b9 alert_bt_hint_text">{{ $t('倍') }} * </text>
                            <text class="colorf7b alert_bt_hint_text">{{stepper.value}}</text>
                            <text class="color9b9 alert_bt_hint_text">{{bet_activity.symbol}}</text>
                            <text class="color9b9 alert_bt_hint_text"> ≈ </text>
                            <text class="colorf7b alert_bt_hint_text">{{parseInt(current_odds.value * stepper.value)}}</text>
                            <text class="color9b9 alert_bt_hint_text">{{bet_activity.symbol}}</text>
                        </div>
                    </div>
                    <div class="alert_pay less_between">
                        <text class="pay_num">{{ $t('可下注') }}：{{bzh_total}} BZH</text>
                        <text class="pay_bt" @click="goTaskCenter">{{ $t('获取') }} ></text>
                    </div>
                    <div class="alert_ft ">
                        <text class="ft_false ft_bt" @click="closePicker">{{ $t('取消') }}</text>
                        <text class="ft_true ft_bt" @click="confirmPostUserBet">{{ $t('确认') }}</text>
                    </div>
                </div>
            </div>
        </wxc-popup>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton, WxcIcon, WxcPopup } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import filters from '../config/filters.js'
import Refresher from '../components/Refresher.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import BetTabs from '../components/BetTabs.vue'
import ShareComponents from '../components/ShareComponents.vue'
import TimeDown from '../components/TimeDown.vue'
import common from '../config/common';
export default {
    components: {
        WxcTabBar,
        WxcButton,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        BetTabs,
        ShareComponents,
        WxcPopup,
        TimeDown
    },
    data: function() {
        return {
            filters,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            statusBarHeight: weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40,
            tabStyles: {
                height: 96,
                background: '#ffffff',
                selectedBackground: '#ffffff',
                titleSize: 34,
                normalColor: '#434343',
                selectedColor: '#F7B237',
                borderBottomColor: '#F7B237',
            },
            activeName: 'first',
            tabItems: ["留言", "更多竞猜"],
            currentTabIndex: 0,
            win: 0,
            onpulling_down: false,
            onpulling_down_y: 0,
            fixed_bar: false,
            banner_image_height: 385,
            pick_height: 505,
            showShare: false,
            bet_activity: {},
            router_params: {},
            loading: {
                bet_activity: 'loading'
            },
            is_loadmore: false,
            is_showpick: false,
            show_input: false,
            stepper: {
                min: 1,
                max: 10,
                value: 1,
            },
            current_odds: {},
            bzh_total: 0,
            unview_num: 0,
            is_check: true,
            nobet: true,
        }
    },
    watch: {
        'stepper': {
            handler(newValue) {
                // this.inputOnchange();
            },
            deep: true,
        },
    },
    eros: {
        beforeBackAppear() {
            this.getUserBets();
        },
        beforeDisappear (options) {
            // 离开页面
            this.$navigator.setNavigationInfo({
                statusBarStyle: 'Default'
            });
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
                this.getBetActivity();
                this.getUserBets();
            })
        },
        getUserBets() {
            let params = {};
            params.items = 0;
            this.$fetch({
                name: 'getUserBets',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.unview_num = resData.unview;
                }
            }).catch((e) => {

            });
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        closePicker() {
            this.is_showpick = false;
        },
        betPosClick() {
            this.is_showpick = true;
            this.current_odds = {
                text: this.bet_activity.bet_text_pos,
                value: this.bet_activity.odds_value_pos,
                bet_type: 'pos'
            }
        },
        betNegClick() {
            this.is_showpick = true;
            this.current_odds = {
                text: this.bet_activity.bet_text_neg,
                value: this.bet_activity.odds_value_neg,
                bet_type: 'neg'
            }
        },
        handleClick(tab, event) {
            console.log(tab, event);
        },
        onItemChange(index) {
            this.currentTab = this.tabItems[index];
            this.currentTabIndex = index;
            this.getTabDatas();
        },
        onSliderChange(e) {
            var index = e.index;
            this.currentTab = this.tabItems[e.index];
            this.currentTabIndex = index;
            this.getTabDatas();
        },
        loadmore() {
            this.is_loadmore = true;
        },
        Loadmored() {
            this.is_loadmore = false;
            this.$refs.balance_dom.resetLoadmore(); // 滚动到列表末尾时将强制触发loadmore
        },
        refreshCoins() {
            this.onpulling_down = true;
            this.init();
        },
        onpullingdown(e) {
            this.onpulling_down_y = e.pullingDistance;
            if (this.onpulling_down_y >= this.statusBarHeight) {
                this.onpulling_down_y = this.statusBarHeight
            }
        },
        refreshEnd() {
            this.onpulling_down_y = 0;
            this.onpulling_down = false;
        },
        onscrollList(e) {
            let contentOffset_y = Math.abs(e.contentOffset.y);
            if (contentOffset_y >= this.banner_image_height + 40) {
                this.fixed_bar = true;
            } else {
                this.fixed_bar = false;
            }
        },
        showShareComponents() {
            this.showShare = true;
        },
        closeShare() {
            this.showShare = false;
        },
        ShareCallback(res) {
            if (res === 'succeed') {
                // 友盟统计-自定义事件计数
                common.addUmengClickEvent('bzh_gamble_share');
            }
        },
        onCompletedTwo() {
            this.getBetActivity();
        },
        getBetActivity() {
            let params = {};
            params.bet_id = this.router_params.bet_id;
            this.loading.bet_activity = 'loading';
            this.$notice.loading.show();
            this.$fetch({
                name: 'getBetActivity',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.bet_activity = 'loaded';
                    // resData.result.bet_state = 'now';
                    resData.result.user_bet = resData.result.user_bet || {};
                    resData.result.symbol_per_multiple = resData.result.symbol_per_multiple || 10;
                    resData.result.symbol = resData.result.symbol || 'BZH';
                    this.bet_activity = resData.result;

                    this.stepper.min = this.bet_activity.multiple_min;
                    this.stepper.value = this.bet_activity.multiple_min;
                    this.stepper.max = this.bet_activity.multiple_max;
                    this.getUserTokenTrans();
                } else {
                    this.loading.bet_activity = 'error';
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message);
            });
        },
        postUserBet() {
            this.inputOnchange();
            if (this.is_check) {
                let params = {};
                params.bet_id = this.router_params.bet_id;
                params.bet_type = this.current_odds.bet_type;
                params.bet_multiple = this.stepper.value;
                params.odds_value = this.current_odds.value;
                this.closePicker();
                this.$notice.loading.show();
                this.$fetch({
                    name: 'postUserBet',
                    method: 'POST',
                    data: params
                }).then(async resData => {
                    if (resData.error === 0) {
                        this.$notice.toast({ message: this.$t('投注成功！') });
                        this.getBetActivity();
                    } else {
                        this.$notice.toast({ message: resData.message });
                    }
                    this.$notice.loading.hide()
                }).catch((e) => {
                    console.log(e.message);
                    this.$notice.loading.hide();
                });
            }
        },
        getUserTokenTrans() {
            let params = {};
            this.$fetch({
                name: 'getUserTokenTrans',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.bzh_total = resData.result.total || 0;
                    let max = this.bzh_total;
                    this.stepper.max > max ? this.stepper.max = max : this.stepper.max = this.stepper.max;
                }
            }).catch((e) => {

            });
        },

        putUserBetView() {
            let params = {};
            this.$fetch({
                name: 'putUserBetView',
                method: 'PUT',
                data: params
            }).then(resData => {
                if (resData.error === 0) {

                }
            }).catch((e) => {

            });
        },
        maxStepper() {
            if (this.stepper.value >= this.stepper.max) {
                this.$notice.toast({ message: this.$t('不能超过余额或最大限制值') })
                this.is_check = false;
                return;
            }
            this.stepper.value =this.stepper.value - 0 + this.bet_activity.symbol_per_multiple;
        },
        minStepper() {
            if (this.stepper.value <= this.stepper.min) {
                this.$notice.toast({ message: `最少输入${this.bet_activity.multiple_min}${this.bet_activity.symbol}` })
                this.is_check = false;
                return;
            }
            this.stepper.value =this.stepper.value - 0 - this.bet_activity.symbol_per_multiple;
        },
        toggleInput() {
            this.show_input = !this.show_input;
        },
        inputOnfocus() {
            this.show_input = true;
            if (this.is_ios) {
                return;
            }
            this.pick_height = 1.8 * 505;
        },
        inputOnblur() {
            this.show_input = false;
            this.inputOnchange();
            if (this.is_ios) {
                return;
            }
            this.pick_height = 505;
        },
        inputOnchange() {
            if (this.stepper.value > this.stepper.max) {
                this.$notice.toast({ message: this.$t('不能超过余额或最大限制值') })
                this.is_check = false;
            } else if (this.stepper.value < this.stepper.min) {
                this.$notice.toast({ message: `最少输入${this.bet_activity.multiple_min}${this.bet_activity.symbol}` })
                this.is_check = false;
            } else {
                this.is_check = true;
            }
        },
        confirmPostUserBet() {
            this.postUserBet();
        },
        viewPicture() {
            if (!this.bet_activity.bet_result_image) {
                this.$notice.toast({ message: this.$t('暂无证明！') })
                return
            }
            this.$image.preview({
                index: 0, // 所点击图片下标
                images: [this.bet_activity.bet_result_image], // 图片的网络地址
            })
        },
        goTaskCenter() {
            this.$router.open({
                name: 'TaskCenter',
                statusBarStyle: 'LightContent',
                type: 'PUSH',
                params: {}
            })
        },
        toBetMy() {
            this.$router.open({
                name: 'BetMy',
            });
            // 设置消息为已读
            this.putUserBetView();
        },
        toBetConfig() {
            this.$router.open({
                name: 'BetConfig',
            })
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        shareConfigs() {
            return {
                title: `竞猜 | ${this.bet_activity.title}`, // 分享的标题
                content: `${this.bet_activity.desc}`, // 分享的文字内容
                url: `${API_BaseUrl}/api/bet/activity?bet_id=${this.router_params.bet_id}&html=1`, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: `${this.bet_activity.banner}`, // 分享的图片url
            }
        },
        getBetResult() {
            let result = this.bet_activity.bet_result;
            if (result === 'pos') {
                return {
                    title_text: this.bet_activity.bet_text_pos,
                    class_name: 'vote_text_pos',
                    type: result,
                    result_text: `票数占比${this.bet_activity.user_bet_pos_percent_str}！`
                }
            }
            if (result === 'neg') {
                return {
                    title_text: this.bet_activity.bet_text_neg,
                    class_name: 'vote_text_pos',
                    type: result,
                    result_text: `票数占比${this.bet_activity.user_bet_neg_percent_str}！`
                }
            }
            if (result === 'neu') {
                return {
                    title_text: this.$t('平局'),
                    class_name: 'vote_text_tie',
                    type: result,
                    result_text: `${this.bet_activity.bet_text_pos}与${this.bet_activity.bet_text_neg}票数均等`
                }
            }
        },
        getUserBetActivity() {
            let user_bet = this.bet_activity.user_bet || {};
            let bet_type = user_bet.bet_type;
            let symbol = user_bet.amount || 0;
            let bet_text_pos = this.bet_activity.bet_text_pos;
            let bet_text_neg = this.bet_activity.bet_text_neg;
            if (bet_type === 'pos') {
                return { text: `${bet_text_pos}-已投注${symbol}${this.bet_activity.symbol || 'BZH'}` }
            } else {
                return { text: `${bet_text_neg}-已投注${symbol}${this.bet_activity.symbol || 'BZH'}` }
            }
        },
        getJoinPersonNum() {
            return (this.bet_activity.bet_state != 'wait' ?(this.bet_activity.user_bet_total || 0) : 0);
        },
        share_icon() {
            return this.bet_activity.type === 'fact' ? `&#xe90b;` : this.$t('拉票');
        },
        bet_result_image() {
            let image_name;
            if (!this.bet_activity.user_bet.is_win) {
                // 中奖
                if (this.bet_activity.bet_result_image) {
                    image_name = 'bet_win_view.png'
                } else {
                    image_name = 'bet_win.png'
                }
            } else {
                // 未中奖
                if (this.bet_activity.bet_result_image) {
                    image_name = 'bet_failure_view.png'
                } else {
                    image_name = 'bet_failure.png'
                }
            }
            console.log('image_name', image_name);
            return image_name;
        },
        hideModule() {
            return this.$storage.getSync('hideModule');
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-size: 43px;
    font-family: iconfont2;
    color: #434343;
}

.icon-text {
    font-size: 34px;
    color: #434343;
}

.right_icon {
    color: #fff;
}

.wrapper {
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    bottom: 0;
}

.head {
    position: relative;
    width: 750px;
    background-color: #f7bf4e;
    background-image: linear-gradient(to right, #4ba0eb, #5f72e1);
}

.cont {
    color: #434343;
    font-size: 28px;
    line-height: 24px;
    padding: 0 20px 40px;
    background-color: white;
}

.cont_top {
    height: 99px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.row_flex_mine {
    height: 99px;
    align-items: center;
}

.cont_middle_title {
    padding-top: 15px;
    padding-bottom: 20px;
    font-size: 32px;
    font-weight: bold;
    color: #434343;
    text-align: center;
    lines: 2;
    text-overflow: ellipsis;
}

.cont_middle {
    font-size: 30px;
    line-height: 55px;
    color: #434343;
}

.cont_foot {
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.cont_foot_opened {
    padding-bottom: 0;
}

.end {
    color: #9b9da4;
    font-size: 28px;
}

.endtime {
    flex: 1;
    color: #f7b237;
}

.endhint {
    font-size: 25px;
    margin-top: 15px;
    color: #bcbcbd;
}

.flex1 {
    flex: 1;
    align-items: center;
}


.cont_bd {
    font-size: 30px;
    line-height: 50px;
}

.between_flex {
    flex-direction: row;
    justify-content: space-between;
}

.row_flex {
    position: relative;
    flex-direction: row;
}

.column_flex {
    flex-direction: column;
}

.bet_button {
    flex-direction: row;
}

.Bt {
    display: inline-block;
    color: white;
    font-size: 32px;
    text-align: center;
    line-height: 105px;
    margin-bottom: 10px;
    width: 111px;
    height: 110px;
    border-radius: 100%;
    background-image: linear-gradient(to right, #48a9ed, #7e78ef);
    background-blend-mode: normal, normal;
    border-width: 4px;
    border-color: #fff;
}

.vote_text_title {
    padding-bottom: 15px;
    font-size: 45px;
    font-weight: bold;
}

.supportBt {
    background-image: linear-gradient(to right, #48a9ed, #7e78ef);
    box-shadow: 2px 3px 6px 0px rgba(91, 123, 227, 0.2);
}

.oppostBt {
    background-image: linear-gradient(254deg, #ff6d85, #fb7f48);
    box-shadow: 2px 3px 6px 0px rgba(248, 67, 98, 0.2);
}

.opposttext {
    color: #e94b61;
    font-size: 24px;
}

.supporttext {
    color: #5565bf;
    font-size: 24px;
}




.eltabs {
    margin: 20px 0;
}

.header {
    position: relative;
    padding-right: 40px;
    width: 750px;
    height: @header_tabbar_height;
    background-color: #ffffff;
    border-bottom-width: 1px;
    border-color: #eee;
    flex-direction: row;
    align-items: center;
}

.header_tab {
    position: relative;
    flex: 2;
    height: @header_tabbar_height;
    justify-content: center;
}

.tab_line {
    position: absolute;
    bottom: 0;
    left: 105%;
    width: 80px;
    height: 4px;
    background-color: #F7B237;
}

.tab_line_index1 {
    left: 97%;
}

.tab_title {
    text-align: center;
    font-size: @tab_size;
    font-weight: bold;
    color: #434343;
}

.mybetnum {
    position: relative;
    top: -20px;
    width: 25px;
    color: white;
    height: 25px;
    line-height: 25px;
    border-radius: 100%;
    background-color: #fd5b4e;
    text-align: center;
    vertical-align: sub;
    font-size: 18px;
    margin-left: -8px;
}

.banner_image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 750px;
    background-image: linear-gradient(to right, #4ba0eb, #5f72e1);
}

.banner_num {
    background-color: rgba(0, 0, 0, 0.2);
    color: #fff;
    padding: 10px 15px;
    border-radius: 30px;
    position: absolute;
    bottom: 30px;
    right: 30px;
    font-size: 22px;
}

.hint_brand {
    background-color: #fcab3c;
    color: #fff;
    align-items: center;
    transform: rotate(45deg);
    top: 0;
    left: 0;
}

.h1_hint {
    font-size: 60px;
}

.h6_hint {
    font-size: 22px;
}

.price_image {
    width: 220px;
    height: 220px;
    position: absolute;
    top: 0;
}

.price_box {
    justify-content: center;
    align-items: center;
    padding: 25px 0;
}

.price_icon {
    width: 95px;
    height: 70px;
}

.text_h1 {
    font-size: 48px;
    padding: 30px 0;
}

.text_h6 {
    font-size: 24px;
    line-height: 24px;
}

.input {
    font-size: 60px;
    height: 80px;
    width: 750px;
    flex-direction: row;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

.status_bar {
    width: 750px;
}

.fixed_bar {
    position: fixed;
    top: -300px;
    left: 0;
    right: 0;
    opacity: 0;
    transition-property: opacity, top;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: linear;
}

.fixed_bar_active {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    opacity: 1;
    transition-property: opacity;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: linear;
}

.vote_box {
    padding-top: 20px;
    width: 750px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.vote_title {
    font-size: 24px;
}

.vote_title_pos {
    color: #5A6AC1;
}

.vote_title_neg {
    color: #E94D63;
}

.vote_percenter {
    width: 750px;
    flex-direction: row;
    align-items: center;
}

.vote_hd {
    width: 110px;
    align-items: center;
    justify-content: center;
}

.vote_ft {
    width: 110px;
    align-items: center;
    justify-content: center;
}

.vote_bd {
    width: 500px;
    flex-direction: row;
    align-items: center;
}

.vote_line_box {
    height: 30px;
    justify-content: center;
}

.vote_line_box_center {
    width: 30px;
    height: 30px;
}

.vote_line_box_image {
    width: 30px;
    height: 30px;
}

.vote_line_box_pos {
    // border-top-left-radius: 30px;
    // border-bottom-left-radius: 30px;
    background-image: linear-gradient(to right, #7E78EF, #48A9ED);
}

.vote_line_box_neg {
    // border-top-right-radius: 30px;
    // border-bottom-right-radius: 30px;
    background-image: linear-gradient(to right, #FB7F48, #FF6D85);
}

.vote_line_text {
    font-size: 18px;
    color: #fff;
}

.vote_line_text_pos {
    padding-left: 5px;
}

.vote_line_text_neg {
    padding-right: 5px;
    text-align: right;
}

.vote_text {
    padding-bottom: 10px;
    font-size: 30px;
}

.vote_per_text {
    font-size: 24px;
}

.vote_text_pos {
    color: #5A6AC1;
}

.vote_text_neg {
    color: #E94D63;
}

.vote_text_tie {
    color: #17C79B;
}

.alert_bt_box {}

.bt_left {
    width: 88px;
    height: 88px;
    font-size: 50px;
    line-height: 88px;
    color: #9b9da4;
    border-width: 1px;
    border-color: #d6dae3;
    border-bottom-left-radius: 10px;
    text-align: center;
    border-top-left-radius: 10px;
}

.bt_right {
    width: 88px;
    height: 88px;
    font-size: 50px;
    line-height: 88px;
    color: #9b9da4;
    border-width: 1px;
    border-color: #d6dae3;
    border-top-right-radius: 10px;
    text-align: center;
    border-bottom-right-radius: 10px;
}

.bt_center {
    width: 350px;
    height: 88px;
    border-width: 1px;
    border-color: #ccc;
}

.center_num {
    line-height: 88px;
    flex: 1.8;
    text-align: center;
    font-size: 33px;
    font-weight: 600;
}

.center_text {
    line-height: 88px;
    flex: 1;
    text-align: center;
    color: #9b9da4;
}

.alert_hb {
    padding: @padding_size;
    color: #434343;
    text-align: center;
    font-size: 34px;
    font-weight: 700;
}

.alert_bt_hint {
    padding: @padding_size;
}

.bet_alert {
    background-color: #fff;
    padding-top: @padding_size;
}

.alert_bd {
    padding: @padding_size;
}

.alert_pay {
    padding: @padding_size;
}

.pay_num {
    color: #9b9da4;
    font-size: 24px;
}

.pay_bt {
    color: #4883ee;
    font-size: 30px;
}

.alert_ft {
    flex-direction: row;
}

.ft_bt {
    flex: 1;
    line-height: 88px;
    height: 88px;
    font-size: 36px;
    border-width: 1px;
    border-color: #d6dae3;
    text-align: center;
    font-weight: 600;
}

.ft_false {
    color: #333;
}

.ft_true {
    color: @main_color;
}
.alert_bt_hint_text {
    font-size: 25px;
}
</style>
