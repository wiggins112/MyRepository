<template>
    <div class="container">
        <div class="box_hd">
            <StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
            <wxc-minibar :title="$t('任务中心')" backgroundColor="transparent" text-color="#fff" borderBottomWidth="0px">
                <wxc-icon slot="left" name="back" style="color: #fff;font-weight: bold;font-size: 60px;position: relative;left: -14px;" @wxcIconClicked="minibarLeftClicked"></wxc-icon>
            </wxc-minibar>
        </div>
        <div class="box_bd" :style="{top: 88 + statusBarHeight}">
            <scroller class="scroller" :show-scrollbar="false" :style="{height: page_height}">
                <div class="bzh_box">
                    <div class="bzh_bg_box"></div>
                    <div class="bzh_wrap">
                        <div class="bzh_tips_box">
                            <div class="bzh_tips">
                                <text class="bzh_tips_text">{{!today.is_today ? $t('签到可领取') : $t('明日签到可领')}}</text>
                                <text class="bzh_tips_text bzh_tips_value">{{today.canpickBzh}}</text>
                                <text class="bzh_tips_text">BZH</text>
                            </div>
                        </div>
                        <div class="bzh_list">
                            <div class="bzh_item" v-for="(item, i) in date_list" :key="i" v-if="item.name" @click="bzhItemClick(item)">
                                <image class="bzh_item_bg" resize="cover" src="bmlocal://assets/images/tasks/ring_box_shadow.png" v-if="!item.active"></image>
                                <image class="bzh_item_bg" resize="cover" src="bmlocal://assets/images/tasks/ring_box_shadow_active.png" v-if="item.active"></image>
                                <div class="bzh_item_wrap">
                                    <div :class="['item_hd', item.active && 'bzh_item_active']">
                                        <text class="item_hd_label" v-if="item.is_today || item.active">{{item.label}}</text>
                                        <image class="item_hd_image" resize="cover" src="bmlocal://assets/images/tasks/BZH.png" v-if="!item.is_today && !item.active"></image>
                                        <text class="item_hd_text">{{item.bzh}}</text>
                                    </div>
                                    <div class="item_bd">
                                        <text :class="['item_bd_text', item.active && 'item_bd_text_active']">{{item.name}}</text>
                                    </div>
                                </div>
                            </div>
                            <div class="pop_tips" :style="{left: today.bash_left + 90 * today.currentday}" v-if="!today.is_today">
                                <image class="pop_tips_textimage" resize="cover" src="bmlocal://assets/images/tasks/pick_text.png"></image>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="task_box">
                    <div class="title_box">
                        <text class="title_text">{{ $t('• 每日任务 •') }}</text>
                    </div>
                    <div class="list_box">
                        <TaskItem :task="task" v-for="(task, i) in task_list" :key="i" v-if="task.type !== 'done_daily_bonus'" @taskClick="taskClick"></TaskItem>
                        <TaskItem>
                            <div slot class="TaskItem" @click="superPackClick">
                                <image class="super_pack_image" resize="cover" src="bmlocal://assets/images/tasks/super_pack.png"/>
                                <text class="wait_more">{{ $t('完成') }}3{{ $t('个任务可获得') }}</text>
                            </div>
                        </TaskItem>
                    </div>
                </div>
                <div class="rank_box">
                    <div class="title_box">
                        <text class="title_text">{{ $t('• 排行榜 •') }}</text>
                    </div>
                    <div class="rank_tab_box">
                        <div :class="['tab_box', rank.active && 'tab_box_active']" v-for="(rank, i) in rank_tab" :key="i" @click="rankTabClick(rank)">
                            <text :class="['tab_text', rank.active && 'tab_text_active']">{{rank.name}}</text>
                        </div>
                    </div>
                    <div class="rank_result_box" v-if="current_rank_tab.type === 'now'">
                        <div class="tips_box">
                            <text class="tips_text">{{ $t('※停留在实时榜（前20）的用户，当前所有的邀请注册奖励都可以额外增加10%，更可冲击天榜获得双重激励（举例：你直接邀请一个注册用户，原来获得300BZH，现在可以获得330BZH') }}）</text>
                            <text class="tips_text tips_text_time">{{ $t('统计区间') }}：{{filters.dateFormat(real_ranks.start/1000, 'yyyy-MM-dd hh:mm')}} {{ $t('至') }} {{filters.dateFormat(real_ranks.end/1000, 'yyyy-MM-dd hh:mm')}}</text>
                            <div class="div_mine_rank">
                                <div class="mine_rank">
                                    <text class="mine_rank_text">{{ $t('我今天获得的BZH总额：') }}</text>
                                    <text class="mine_rank_text mine_rank_value">{{real_ranks.user_stat.count_all}}</text>
                                    <text class="mine_rank_text"> BZH，</text>
                                    <text class="mine_rank_text">{{ $t('排名') }}：</text>
                                    <text class="mine_rank_text">{{ $t('第') }}</text>
                                    <text class="mine_rank_text mine_rank_value">{{real_ranks.user_stat.rank_all}}</text>
                                    <text class="mine_rank_text">{{ $t('名') }}</text>
                                </div>
                            </div>
                        </div>
                        <div class="rank_table_box">
                            <div class="rank_list">
                                <div class="rank_item" v-for="(real, i) in real_ranks.list_all" :key="i">
                                    <div class="rank_index">
                                        <text class="table_text">{{real.rank}}</text>
                                    </div>
                                    <div class="rank_phone">
                                        <text class="table_text">{{real.phone}}</text>
                                    </div>
                                    <div class="rank_bzh">
                                        <text class="table_text mine_rank_value">{{real.total}}</text>
                                        <text class="table_text"> BZH</text>
                                    </div>
                                </div>
                                <div class="rank_item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="rank_result_box" v-if="current_rank_tab.type === 'day'">
                        <div class="tips_box">
                            <text class="tips_text">{{ $t('※ 进入天榜（前20名）的用户，第二天的所有邀请注册奖励将额外增加10%') }}</text>
                            <text class="tips_text tips_text_time">{{ $t('统计区间') }}：{{filters.dateFormat(ranks.start/1000, 'yyyy-MM-dd hh:mm')}} {{ $t('至') }} {{filters.dateFormat(ranks.end/1000, 'yyyy-MM-dd hh:mm')}}</text>
                            <div class="div_mine_rank">
                                <div class="mine_rank">
                                    <text class="mine_rank_text">{{ $t('我昨天获得的BZH总额：') }}</text>
                                    <text class="mine_rank_text mine_rank_value">{{ranks.user_stat.count_today}}</text>
                                    <text class="mine_rank_text"> BZH，</text>
                                    <text class="mine_rank_text">{{ $t('排名') }}</text>
                                    <text class="mine_rank_text">：</text>
                                    <text class="mine_rank_text">{{ $t('第') }}</text>
                                    <text class="mine_rank_text mine_rank_value">{{ranks.user_stat.rank_today}}</text>
                                    <text class="mine_rank_text">{{ $t('名') }}</text>
                                </div>
                            </div>
                        </div>
                        <div class="rank_table_box">
                            <div class="rank_list">
                                <div class="rank_item" v-for="(real, i) in ranks.list_today" :key="i">
                                    <div class="rank_index">
                                        <text class="table_text" v-if="real.rank > 3">{{real.rank}}</text>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 1" src="bmlocal://assets/images/tasks/first.png"></image>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 2" src="bmlocal://assets/images/tasks/second.png"></image>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 3" src="bmlocal://assets/images/tasks/third.png"></image>
                                    </div>
                                    <div class="rank_phone">
                                        <text class="table_text">{{real.phone}}</text>
                                    </div>
                                    <div class="rank_bzh">
                                        <text class="table_text mine_rank_value">{{real.total}}</text>
                                        <text class="table_text"> BZH</text>
                                    </div>
                                </div>
                                <div class="rank_item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="rank_result_box" v-if="current_rank_tab.type === 'all'">
                        <div class="tips_box">
                            <text class="tips_text tips_text_time">{{ $t('统计区间') }}：{{filters.dateFormat(ranks.start/1000, 'yyyy-MM-dd hh:mm')}} {{ $t('至') }} {{filters.dateFormat(ranks.end/1000, 'yyyy-MM-dd hh:mm')}}</text>
                            <div class="div_mine_rank">
                                <bmrichtext class="bm_mine_rank">
                                    <bmspan class="mine_rank_text" :value="$t('截止昨天获得的BZH总额（不含支出）：')"></bmspan>
                                    <bmspan class="mine_rank_text mine_rank_value" :value="ranks.user_stat.count_all"></bmspan>
                                    <bmspan class="mine_rank_text" :value="' ' + $t('BZH，排名')"></bmspan>
                                    <bmspan class="mine_rank_text" :value="$t(': 第')"></bmspan>
                                    <bmspan class="mine_rank_text mine_rank_value" :value="ranks.user_stat.rank_all"></bmspan>
                                    <bmspan class="mine_rank_text" :value="$t('名')"></bmspan>
                                </bmrichtext>
                            </div>
                        </div>
                        <div class="rank_table_box">
                            <div class="rank_list">
                                <div class="rank_item" v-for="(real, i) in ranks.list_all" :key="i">
                                    <div class="rank_index">
                                        <text class="table_text" v-if="real.rank > 3">{{real.rank}}</text>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 1" src="bmlocal://assets/images/tasks/first.png"></image>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 2" src="bmlocal://assets/images/tasks/second.png"></image>
                                        <image class="rank_index_image" resize="cover" v-if="real.rank === 3" src="bmlocal://assets/images/tasks/third.png"></image>
                                    </div>
                                    <div class="rank_phone">
                                        <text class="table_text">{{real.phone}}</text>
                                    </div>
                                    <div class="rank_bzh">
                                        <text class="table_text mine_rank_value">{{real.total}}</text>
                                        <text class="table_text"> BZH</text>
                                    </div>
                                </div>
                                <div class="rank_item"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </scroller>
        </div>
        <div class="box_ft">
            <DialogTask :top="current_task.top || 350" :title="current_task.name" align="left" :single="true" :show="is_show_dialog" :iconImage="current_task.icon_image" :introContentImage="current_task.intro_content_image" :content="current_task.intro_content" :confirmText="current_task.confirmText" @wxcDialogCancelBtnClicked="closeDialog" @wxcDialogConfirmBtnClicked="confirm">
            </DialogTask>
            <Dialog title="" :show="is_show_unsuperpack_dialog" :showCloseBtn="true" dialogBoxBgColor="transparent" top="300" @wxcDialogCancelBtnClicked="closeUnSuperpackDialog">
                <div slot class="supe_redpack">
                    <image class="supe_redpack_image" resize="cover" src="bmlocal://assets/images/tasks/super_pack_unactive.png"></image>
                    <div class="supe_redpack_tasks_box">
                        <text class="supe_redpack_title">{{ $t('我完成的任务') }}：</text>
                        <div class="supe_redpack_list">
                            <div class="supe_redpack_line">
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active1 && 'super_redpack_round_active']">•</text>
                            </div>
                            <div class="supe_redpack_line supe_redpack_line2">
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                                <text :class="['super_redpack_round', links_active2 && 'super_redpack_round_active']">•</text>
                            </div>
                            <div class="supe_redpack_item" v-for="(active_task, i) in active_task_list" :key="i">
                                <div class="redpack_item_active" v-if="active_task.active">
                                    <div class="redpack_item_image_box">
                                        <image class="item_image" resize="cover" :src="active_task.icon_image"></image>
                                    </div>
                                    <text class="icon done_icon">&#xe920;</text>
                                    <text class="redpack_text">{{active_task.name}}</text>
                                </div>
                                <div class="redpack_item_empty" v-if="!active_task.active">
                                    <div class="item_empty_box">
                                        <text class="empty_text">{{ $t('待完成') }}</text>
                                    </div>
                                    <text class="redpack_text">{{ $t('任务') }}{{i+1}}</text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
            <DialogRedPacket v-if="show_packet" :isJumpTaskCenter="false" @closePacket="closePacket"></DialogRedPacket>
        </div>
    </div>
</template>
<script>
import { WxcTabBar, Utils, WxcButton, WxcIcon } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import Loadmore from '../components/Loadmore.vue'
import Refresher from '../components/Refresher.vue'
import TaskItem from '../components/TaskItem.vue'
import DialogTask from '../components/DialogTask.vue'
import Dialog from '../components/Dialog.vue'
import DialogRedPacket from '../components/DialogRedPacket.vue'
import filters from '../config/filters.js'
import { Iconfont } from '../config/config.js'
export default {
    components: {
        WxcTabBar,
        WxcButton,
        WxcIcon,
        StatusBar,
        WxcMinibar,
        Loadmore,
        Refresher,
        TaskItem,
        DialogTask,
        Dialog,
        DialogRedPacket
    },
    data() {
        return {
            statusBarHeight: Number(weex.config.eros.statusBarHeight ? weex.config.eros.statusBarHeight : 40),
            filters,
            is_show_dialog: false,
            is_show_unsuperpack_dialog: false,
            show_packet: false,
            today: {
                is_today: false,
                bash_left: 75,
                currentday: 0,
                canpickBzh: 0,
            },
            date_list: [{
                name: this.$t('1天'),
                label: this.$t('签到'),
                bzh: '10',
                active: false,
                is_today: false
            }, {
                name: this.$t('2天'),
                label: this.$t('签到'),
                bzh: '20',
                active: false,
                is_today: false
            }, {
                name: this.$t('3天'),
                label: this.$t('签到'),
                bzh: '40',
                active: false,
                is_today: false
            }, {
                name: this.$t('4天'),
                label: this.$t('签到'),
                bzh: '80',
                active: false,
                is_today: false
            }, {
                name: this.$t('5天'),
                label: this.$t('签到'),
                bzh: '160',
                active: false,
                is_today: false
            }, {
                name: this.$t('6天'),
                label: this.$t('签到'),
                bzh: '320',
                active: false,
                is_today: false
            }, {
                name: this.$t('7天'),
                label: this.$t('签到'),
                bzh: '640',
                active: false,
                is_today: false
            }, {
                name: '',
                label: '',
                bzh: '',
                active: false,
                is_today: false
            }],
            task_list: [{
                name: this.$t('阅读'),
                type: 'done_daily_read',
                icon_image: `bmlocal://assets/images/tasks/read.png`,
                intro: this.$t('阅读5篇精选文章'),
                btn_text: '+20 BZH',
                active: false,
                btn_active_text: this.$t('今天已经领取'),
                intro_content: '阅读币智慧5篇以上精选文章（需有效浏览），可领取20BZH奖励，每天都可领取哦！',
                intro_content_image: '',
                confirmText: this.$t('马上去阅读'),
                router_link: 'Index',
                router_link_params: {
                    tab: 3,
                    hide_poster: true,
                    unback_exit: true
                },
            }, 
            // {
            //     name: this.$t('分享'), // 分享的文章被5人阅读
            //     type: 'done_daily_share',
            //     icon_image: `bmlocal://assets/images/tasks/share.png`,
            //     intro: this.$t('分享文章被5人阅读'),
            //     btn_text: '+50 BZH',
            //     active: false,
            //     btn_active_text: this.$t('今天已经领取'),
            //     intro_content: this.$t('分享的文章被5人以上阅读，可以获得50BZH。'),
            //     intro_content_image: `bmlocal://assets/images/tasks/share_guide.jpg`,
            //     confirmText: this.$t('我知道了'),
            //     top: 200,
            // }, 
            {
                name: this.$t('分享'), // 分享快讯的功能
                type: 'done_daily_share_msg',
                icon_image: `bmlocal://assets/images/tasks/share.png`,
                intro: this.$t('分享快讯'),
                btn_text: '+10 BZH',
                active: false,
                btn_active_text: this.$t('今天已经领取'),
                intro_content: this.$t('分享快讯成功1次，可以获得10BZH。'),
                intro_content_image: `bmlocal://assets/images/tasks/fastshare_guide.png`,
                confirmText: this.$t('我知道了'),
                top: 200,
            }, 
            {
                name: this.$t('投票'),
                type: 'done_daily_vote',
                icon_image: `bmlocal://assets/images/tasks/vote.png`,
                intro: this.$t('5次利好利空投票'),
                btn_text: '+ 20 BZH',
                active: false,
                btn_active_text: this.$t('今天已经领取'),
                intro_content: this.$t('每天参与文章投票5次，奖励20BZH'),
                intro_content_image: `bmlocal://assets/images/tasks/vote_guide.jpg`,
                confirmText: this.$t('我知道了'),
                top: 200,
            }, {
                name: this.$t('邀请'),
                type: 'done_daily_invite',
                icon_image: `bmlocal://assets/images/tasks/invite.png`,
                intro: this.$t('邀请好友下载注册'),
                btn_text: '+600BZH',
                active: false,
                btn_active_text: this.$t('今天已经领取'),
                intro_content: this.$t('每邀请一位好友下载注册成功币智慧APP可以获得600BZH奖励'),
                intro_content_image: '',
                router_link: 'Invite',
                router_link_params: {
                    from: 'settings',
                },
                confirmText: this.$t('马上去邀请')
            }, {
                name: this.$t('看币'),
                type: 'done_daily_coin',
                icon_image: `bmlocal://assets/images/tasks/seecoin.png`,
                intro: this.$t('阅读5个币详情'),
                btn_text: '+50 BZH',
                active: false,
                btn_active_text: this.$t('今天已经领取'),
                intro_content: this.$t('阅读币智慧5个以上币详情，可领取50BZH奖励，每天都可领取哦！'),
                intro_content_image: '',
                confirmText: this.$t('马上去看币'),
                router_link: 'Index',
                router_link_params: {
                    tab: 1,
                    hide_poster: true,
                    unback_exit: true
                },
            }, {
                name: this.$t('签到'),
                type: 'done_daily_bonus',
                icon_image: `bmlocal://assets/images/tasks/daily_bonus.png`,
                active: false,
            }],
            current_task: {},
            rank_tab: [{
                name: this.$t('实时榜'),
                type: 'now',
                active: true
            }, {
                name: this.$t('天榜'),
                type: 'day',
                active: false
            }, {
                name: this.$t('总榜'),
                type: 'all',
                active: false
            }],
            real_ranks: {
                user_stat: {},
            },
            ranks: {
                user_stat: {},
            },
            supe_redpack: {},
        };
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created() {
        this.init();
    },
    eros: {
        beforeBackAppear(params, options) {

        },
        beforeDisappear(options) {
            // 离开页面
            this.$navigator.setNavigationInfo({
                statusBarStyle: 'Default'
            });
        }
    },
    methods: {
        init() {
            this.current_rank_tab = this.rank_tab[0];
            this.getUserTokenDailyStat();
            this.getTokenRealRanks();
            this.getTokenRanks();
        },
        minibarLeftClicked() {
            this.$router.back();
        },
        rankTabClick(tab) {
            for (let item of this.rank_tab) {
                item.active = false;
            }
            tab.active = true;
            this.current_rank_tab = tab;
        },
        taskClick(task) {
            this.is_show_dialog = true;
            this.current_task = task;
        },
        bzhItemClick(item) {
            if (item.is_today) {
                this.postUserTokenDailyBonus();
            }
        },
        superPackClick() {
            // this.is_show_unsuperpack_dialog = true;
            if (this.user_token_daily.done_daily_redpacket) {
                this.$notice.toast({ message: this.$t('您今天已经领取过了！') })
                return;
            }
            // 可以领取红包，且没有领取过
            if (this.user_token_daily.can_get_redpacket && !this.user_token_daily.done_daily_redpacket) {
                this.show_packet = true;
            } else {
                this.is_show_unsuperpack_dialog = true;
            }
        },
        closeUnSuperpackDialog() {
            this.is_show_unsuperpack_dialog = false;
        },
        closePacket() {
            this.show_packet = false;
            this.getUserTokenDailyStat();
        },
        closeDialog() {
            this.is_show_dialog = false;
        },
        confirm() {
            this.is_show_dialog = false;
            if (!this.current_task.router_link) {
                return;
            }
            this.$router.open({
                name: this.current_task.router_link,
                type: 'PUSH',
                params: this.current_task.router_link_params || {}
            })
        },
        getTokenRealRanks() {
            let params = {};
            this.$fetch({
                name: 'getTokenRealRanks',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.real_ranks = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getTokenRanks() {
            let params = {};
            this.$fetch({
                name: 'getTokenRanks',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.ranks = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getUserTokenDailyStat() {
            let params = {};
            this.$notice.loading.show();
            this.$fetch({
                name: 'getUserTokenDailyStat',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    let done_daily = resData.result.done_daily_bonus_day || 0;
                    let done_daily_bonus = resData.result.done_daily_bonus;
                    // resData.result.done_daily_read = true;
                    // resData.result.done_daily_share = true;
                    this.user_token_daily = resData.result;
                    for (let i = 0; i < done_daily; i++) {
                        this.date_list[i].active = true;
                        this.date_list[i].is_today = false;
                        this.date_list[i].label = this.$t('已领');
                    }
                    if (!done_daily_bonus) {
                        this.date_list[done_daily].label = this.$t('签到');
                        this.date_list[done_daily].is_today = true;
                    }
                    this.today.canpickBzh = this.date_list[done_daily].bzh;
                    this.today.currentday = done_daily;
                    this.today.is_today = done_daily_bonus;

                    for (let item of this.task_list) {
                        for (let k in resData.result) {
                            if (item.type === k && resData.result[k] === true) {
                                item.active = true;
                            }
                        }
                    };

                } else {
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message);
            });
        },
        postUserTokenDailyBonus() {
            let params = {};
            this.$notice.loading.show();
            this.$fetch({
                name: 'postUserTokenDailyBonus',
                method: 'POST',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.$notice.toast({ message: '签到成功~' });
                    this.getUserTokenDailyStat();
                } else {
                    this.$notice.alert({
                        title: this.$t('提示'),
                        message: resData.message,
                        okTitle: this.$t('确认'),
                        callback() {}
                    })
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                console.log(e.message);
                this.$notice.loading.hide();
            });
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        active_task_list() {
            let items = this.task_list.filter((task) => {
                return task.active === true;
            });
            items.push({});
            items.push({});
            items.push({});
            items = items.slice(0, 3);
            return items;
        },
        links_active() {
            let items = this.active_task_list.filter((task) => {
                return task.active === true;
            });
            return items;
        },
        links_active1() {
            if (this.links_active.length >= 2) {
                return true;
            }
        },
        links_active2() {
            if (this.links_active.length >= 3) {
                return true;
            }
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
}

.icon {
    font-family: iconfont2;
}

.box_hd {
    width: 750px;
    background-color: #f7bf4e;
    background-image: linear-gradient(to left, #F4CE52, #F8BD4E);
}

.box_bd {
    position: absolute;
    top: 127px;
    left: 0;
    right: 0;
}

.scroller {}

.bzh_box {
    position: relative;
    height: 355px;
    background-image: linear-gradient(to left, #F4CE52, #F8BD4E);
}

.bzh_wrap {
    margin-left: @padding_size;
    margin-right: @padding_size;
    position: absolute;
    top: 50;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 12px;
    height: 252px;
    box-shadow: 0px 0px 8px rgba(250, 181, 55, 0.4);
}

.bzh_bg_box {
    background-color: #fff;
    width: 750px;
    height: 150px;
    position: absolute;
    bottom: 0;
}

.bzh_tips_box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

.bzh_tips {
    padding: 5px 40px;
    background-color: #FAEFC8;
    border-bottom-right-radius: 6px;
    border-bottom-left-radius: 6px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

.bzh_tips_text {
    color: #F7B948;
    font-size: 24px;
}

.bzh_tips_value {
    color: #FD5C4D;
}

.bzh_list {
    position: relative;
    padding: 0 30px;
    flex-direction: row;
    align-items: center;
    padding-top: 100px;
}

.bzh_item {
    position: relative;
    flex: 1;
    height: 150px;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    overflow: visible;
}

.bzh_item_wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.bzh_item_bg {
    position: absolute;
    top: -6px;
    left: 0;
    right: 0;
    width: 95px;
    height: 95px;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.pop_tips {
    padding: 0 7px;
    position: absolute;
    top: 83px;
    left: 80px;
}

.pop_tips_textimage {
    width: 62px;
    height: 26px;
}

.item_hd {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #f7bf4e;
    background-image: linear-gradient(to top left, #F4CD52, #F8BD4D);
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.bzh_item_active {
    background-color: #BFBFBF;
    background-image: linear-gradient(to top left, #D2D2D2, #B2B2B2);
}

.item_hd_image {
    width: 40px;
    height: 40px;
}

.item_hd_label {
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 22px;
    color: #fff;
}

.item_hd_text {
    font-size: 22px;
    color: #fff;
}

.item_bd {
    padding-top: 10px;
}

.item_bd_text {
    font-size: 24px;
    color: @main_color;
}

.item_bd_text_active {
    color: #9B9DA4;
}

.task_box {
    background-color: #fff;
}

.title_box {
    padding-top: 30px;
    padding-bottom: 28px;
}

.title_text {
    text-align: center;
    font-size: 32px;
    color: @main_color;
}

.list_box {
    width: 750px;
    margin-top: 10px;
    flex-direction: row;
    flex-wrap: wrap;
    border-bottom-width: 1px;
    border-color: #eee;
}

.TaskItem {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.wait_more {
    padding-top: 15px;
    font-size: 24px;
    color: #9B9DA4;
}

.super_pack_image {
    width: 106px;
    height: 150px;
}

.rank_box {
    border-top-width: 20px;
    border-color: @bgf4f5f6;
    background-color: #fff;
}

.rank_tab_box {
    margin: 0 45px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #FAF3DC;
    height: 70px;
    border-radius: 70px;
}

.tab_box {
    flex: 1;
    height: 70px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.tab_box_active {
    height: 70px;
    border-radius: 70px;
    background-image: linear-gradient(to right, #FB9F38, #FECE48);
}

.tab_text {
    color: #D5B36D;
    font-size: 30px;
}

.tab_text_active {
    color: #fff;
}

.tips_box {
    padding-top: 33px;
    padding-left: @padding_size;
    padding-right: @padding_size;
}

.tips_text {
    padding-bottom: 50px;
    font-size: 20px;
    color: #9B9DA4;
}

.tips_text_time {
    padding-bottom: 15px;
}


.mine_rank_value {
    color: @main_color;
}

.rank_table_box {
    padding: 33px @padding_size;
}

.rank_item {
    padding: 30px @padding_size;
    flex-direction: row;
    align-items: center;
    border-top-width: 1px;
    border-color: #E7EAF1;
}

.table_text {
    font-size: 30px;
    color: #434343;
}

.rank_index {
    width: 150px;
    flex-direction: row;
    align-items: center;
}

.rank_index_image {
    width: 42px;
    height: 38px;
}

.rank_phone {
    flex: 1;
    flex-direction: row;
    align-items: center;
}

.rank_bzh {
    width: 220px;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.supe_redpack {
    position: relative;
    flex-direction: column;
    height: 740px;
    border-radius: 12px;
}

.supe_redpack_image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    flex: 1;
    height: 740px;
}

.supe_redpackopen {
    height: 1.116*773px;
}

.supe_redpackopen_image {
    height: 1.116*773px;
}

.pack_value {
    position: absolute;
    top: 440px;
    left: 0;
    right: 0;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.pack_value_text {
    text-align: center;
    font-size: 80px;
    color: #fff;
    font-weight: bold;
}

.pack_value_unit {
    padding-top: 15px;
    padding-left: 15px;
    text-align: center;
    font-size: 50px;
    color: #fff;
    font-weight: bold;
}

.supe_redpack_tasks_box {
    position: absolute;
    top: 440px;
    left: 0;
    right: 0;
    flex: 1;
}

.supe_redpack_title {
    text-align: center;
    font-size: 30px;
    color: @main_color;
    font-weight: bold;
}

.supe_redpack_list {
    position: relative;
    padding: 0 70px;
    padding-top: 40px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.redpack_item_active {
    width: 105px;
    height: 200px;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.redpack_item_empty {
    width: 105px;
    height: 200px;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.supe_redpack_line {
    position: absolute;
    top: 80px;
    left: 70px + 105px;
    width: 100px;
    background-color: transparent;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.super_redpack_round {
    color: #CE422C;
}

.supe_redpack_line2 {
    left: 85px + 2*105px;
}

.super_redpack_round_active {
    color: #F89C9C;
}

.redpack_item_image_box {
    position: absolute;
    top: 0;
    left: 0;
    width: 105px;
    height: 105px;
    border-radius: 100%;
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.item_empty_box {
    position: absolute;
    top: 0;
    left: 0;
    width: 105px;
    height: 105px;
    border-radius: 50%;
    background-color: #E75741;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.item_image {
    width: 60px;
    height: 60px;
}

.done_icon {
    position: absolute;
    top: 70px;
    right: 0;
    color: #1CCC89;
}

.empty_text {
    font-size: 26px;
    color: #C7402C;
}

.redpack_text {
    padding-top: 90px;
    font-size: 26px;
    color: #fff;
}

.div_mine_rank {
    padding: 15px;
    border-width: 3px;
    border-color: #FAF3DC;
    border-radius: 10px;
    flex-direction: column;
}

.bm_mine_rank {
    height: 90px;
    flex: 1;
}

.mine_rank_text {
    font-size: 26px;
    color: #434343;
}
.mine_rank {
    flex-direction: row;
}
</style>
