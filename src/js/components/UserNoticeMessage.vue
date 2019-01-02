<template>
    <div class="wrapper">
        <div class="isfixed" v-if="messages.length">
            <div class="time_div">
                <text class="day time_today">{{filters.getNow(messages[timetag_i].update_time) }}</text>
                <text class="day time_day">{{ filters.dateFormat(messages[timetag_i].update_time , 'MM-dd') }}</text>
                <text class="day time_week">{{ filters.dateFormat(messages[timetag_i].update_time, 'w') }}</text>
            </div>
            <text class="stare">{{ $t('实时监控中') }}</text>
        </div>
        <list class="items" ref="message_dom" :style="{height: page_height }" loadmoreoffset="550" @loadmore="loadmoreMessages" @scroll="handleScroll">
            <Refresher :handrefresh="handrefresh" @refresh="refreshMessages" @refreshEnd="refreshEnd" :loading="loading.messages"></Refresher>
            <!-- 内容显示 -->
            <cell class="cell" v-for="(message,index) in messages" :key="index">
                <!-- 头部的 时间格式显示 -->
                <div v-if="message.show_time_tag && index!=0" ref="time_div" class="time_tag" @appear="onappear(index)" @disappear="ondisappear(index)">
                    <div class="time_div">
                        <text class="day time_today">{{filters.getNow(message.update_time) }}</text>
                        <text class="day time_day">{{ filters.dateFormat(message.update_time , 'MM-dd') }}</text>
                        <text class="day time_week">{{ filters.dateFormat(message.update_time, 'w') }}</text>
                    </div>
                </div>
                <div class="item_bd">
                    <div>
                        <text class="time_sf_float">{{filters.dateFormat(message.update_time, 'hh:mm')}}</text>
                        <text class="title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{message.title}}</text>
                    </div>
                    <div class="content" v-if="message.msg_type==1">
                        <text class="li_content">{{ $t('市场') }}：{{message.type=='均价'?$t('均价'):message.platform}}</text>
                        <text class="li_content">{{message.signal}}：{{message.now_price_str}}{{message.unit}}({{message.price_type}}{{message.price_than}}{{message.unit}})</text>
                        <text class="li_content">{{ $t('超过您设置的阈值，请留意。【币智慧】') }}</text>
                    </div>
                    <text class="content" v-else @click="showall(index)">{{filters.cutString(message.content,message.isalltext)}}</text>
                    <text class="icon right_icon shareButton" @click="shareButtonClick(message)" v-if="!hideModule['Share']">&#xe90b;</text>
                </div>
            </cell>
            <cell>
                <Loadmore :loading="loading.messages"  :empty="$t('暂无推送消息')" blankpagetype="icontext" iconsrc="bmlocal://assets/images/blankpage/notice.png"></Loadmore>
            </cell>
            <cell>
                <ArticleCapture :article="share_article" @getBash64Data="getBash64Data" v-if="showShare && is_ios" />
            </cell>
            <cell style="height: 200px;">
            </cell>
        </list>
        <div class="new_notice" v-if="has_new_notice">
            <div class="notice_btn" @click="getNewNotice">
                <text class="notice_text">{{unread_count}}{{ $t('条新消息') }}</text>
                <text class="icon icon_notice notice_text">&#xe925;</text>
            </div>
        </div>
        <ArticleCapture :article="share_article" @getBash64Data="getBash64Data" v-if="showShare && !is_ios" />
        <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="closeShare"></ShareComponents>
    </div>
</template>
<script>
let _self;
const modal = weex.requireModule('modal')
import { WxcTabBar, Utils, WxcButton } from 'weex-ui';
import WxcMinibar from './WxcMinibar.vue'
import StatusBar from './StatusBar.vue'
import CellItem from './CellItem.vue'
import Refresher from './Refresher.vue'
import Loadmore from './Loadmore.vue'
import filters from '../config/filters.js'
import utils from '../config/utils.js'
import ShareComponents from './ShareComponents.vue'
import ArticleCapture from './ArticleCapture.vue'
import { Iconfont } from '../config/config.js'
export default {
    components: {
        WxcTabBar,
        WxcButton,
        StatusBar,
        CellItem,
        WxcMinibar,
        Refresher,
        Loadmore,
        ShareComponents,
        ArticleCapture
    },
    data() {
        return {
            is_ios: String(weex.config.env.platform).toLowerCase() === 'ios' ? true : false,
            router_params: {},
            loading: {
                messages: 'empty',
            },
            messages: [],
            messages_page: 1,
            messages_size: 30,
            filters,
            utils,
            showShare: false,
            month_days: [],
            searchBarFixed: false,
            timetag_i: 0,
            tophidden: 'up',
            scrollnum: 0,
            handrefresh: false,
            unread_count: 0,
            has_new_notice: false,
            user_info: {},
            share_article: {},
            base64Data: {}
        }
    },
    props: {
        Active: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'Active': {
            handler(newValue) {
                if (newValue) {
                    this.init();
                }
            },
            deep: true,
        },
    },
    created() {
        _self = this;
    },
    eros: {
        beforeDisappear() {
            this.$event.emit('m-setData', { is_on_notice_messages_page: false });
        }
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    methods: {
        init() {
            this.getUserInfo();
            if (this.user_info.is_login) {
                if (!this.messages.length) {
                    this.month_days = [];
                    this.getMessagesPush();
                }
                this.getMessagesPushUnread();
            }
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        showall(i) {
            if (this.messages[i].isalltext == 3000) {
                this.messages[i].isalltext = 208;
            } else {
                this.messages[i].isalltext = 3000;
            }
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            })
        },
        refreshMessages() {
            this.getNewNotice();
            this.$refs.message_dom.resetLoadmore(); // 强制触发loadmore
        },
        refreshEnd() {
            this.handrefresh = false;
        },
        loadmoreMessages() {
            if (this.loading.messages !== 'loaded') {
                return;
            }
            this.messages_page++;
            this.getMessagesPush();
        },
        getNewNotice() {
            this.handrefresh = true;
            // this.$notice.loading.show();
            this.messages_page = 1;
            this.month_days = [];
            this.putMessagesPushRead().then((response) => {
                // this.$notice.loading.hide();
                this.has_new_notice = false;
                this.getMessagesPush();
                this.handrefresh = false;
            })
        },
        putMessagesPushRead() {
            let params = {};
            return this.$fetch({
                name: 'putMessagesPushRead',
                method: 'PUT',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {

                } else {
                    this.$notice.toast({ message: resData.message });
                }

            }).catch((e) => {
                console.log(e.message);
            });
        },
        getMessagesPush() {
            let params = {};
            params.page = this.messages_page;
            params.size = this.messages_size;
            this.loading.messages = 'loading';
            return this.$fetch({
                name: 'getMessagesPush',
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.messages = 'loaded';
                    for (let item of resData.items) {
                        item.isalltext = 208;
                        item.show_time_tag = this.isShowTimeTag(item);
                    }
                    if (params.page === 1) {
                        this.messages = resData.items;
                        if (!resData.items.length) {
                            this.loading.messages = 'empty';
                        }
                    } else {
                        if (!resData.items.length) {
                            this.loading.messages = 'nomore';
                        } else {
                            this.messages.push(...resData.items);
                        }
                    }
                } else {
                    if (resData.error === 1) {
                        this.loading.messages = 'need_login';
                    } else {
                        this.loading.messages = 'error';
                    }
                }
            }).catch((e) => {
                console.log(e.message);
            });
        },
        getMessagesPushUnread() {
            let params = {};
            this.$fetch({
                name: 'getMessagesPushUnread',
                method: 'GET',
                data: params
            }).then(async resData => {
                if (resData.error === 0) {
                    this.unread_count = resData.unread_count;
                    this.has_new_notice = resData.unread_count > 0 ? true : false;
                }
            }).catch((e) => {

            });
        },
        shareButtonClick(message) {
            this.share_article = message
            this.share_article.captureType = 'push_message'
            this.showShare = true;
        },
        getBash64Data(data) {
            this.base64Data = data;
        },
        closeShare() {
            this.base64Data = {};
            this.showShare = false;
        },
        isShowTimeTag(article) {
            let month_day = filters.dateFormat(article.update_time, 'yyyy-MM-dd');
            let exists = !!this.month_days.find(m_d => m_d === month_day);
            if (!exists) {
                this.month_days.push(month_day);
            }
            return !exists;
        },
        handleScroll(e) {
            let contentOffset = e.contentOffset;
            let contentSize = e.contentSize;
            if (contentOffset.y < this.scrollnum) {
                this.tophidden = "up";
                this.scrollnum = contentOffset.y;
            } else {
                this.tophidden = "down";
                this.scrollnum = contentOffset.y;
            }
        },
        onappear(char) {
            if (this.tophidden == "up") {} else {
                if (this.timetag_i == 0) {
                    this.timetag_i = 0;
                    // this.$notice.toast({ message: "down"+char});
                } else {
                    this.timetag_i = char - 1;
                    // this.$notice.toast({ message: "down"+char});
                }
            }
        },
        ondisappear(char) {
            if (this.tophidden == "up") {
                this.timetag_i = char;
                // this.$notice.toast({ message: "up"+char});
            } else {
                // this.$notice.toast({ message: "down"+char});
            }
            // this.$notice.toast({ message: this.$t('消失了')+char });
        },

    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        shareConfigs() {
            return {
                title: this.share_article.title || '', // 分享的标题
                content: this.share_article.text || '', // 分享的文字内容
                url: ``, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: this.base64Data.base64, // 'this.share_article.image', // 分享的图片url
                type: 'Image',
                imageInfo: {},
                imageType: 'base64'
            }
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
    font-size: 45px;
    font-family: iconfont2;
}

.wrapper {
    width: 750px;
}

.items {
    width: 750px;
}

.cell {
    background-color: #fff;
}

.item_bd {
    padding: 27px @padding_size;
    border-color: rgba(0, 0, 0, .1);
    border-bottom-width: 1px;
    border-style: solid;
}

.title {
    color: #434343;
    font-size: 30px;
    font-weight: bold;
    line-height: 40px;
}

.content {
    color: #434343;
    font-size: 30px;
    margin-top: 15px;
    margin-bottom: 15px;
    line-height: 50px;
}

.li_content {
    color: #434343;
    font-size: 30px;
    line-height: 50px;
}

.time {
    color: #9b9da4;
    font-size: 22px;
    margin-top: 20px;
}

.time_tag {
    font-size: 28px;
    color: #8b919c;
    padding-top: 20px;
    padding-left: @padding_size;
    padding-bottom: 20px;
    background-color: @bgf4f5f6;
    border-width: 1px;
    border-color: #eee;
}

.isfixed {
    font-size: 28px;
    color: #8b919c;
    padding-top: 22px;
    padding-left: @padding_size;
    padding-right: @padding_size;
    padding-bottom: 22px;
    background-color: @bgf4f5f6;
    border-width: 1px;
    border-color: #eee;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}

.time_div {
    flex-direction: row;
}

.item_div {
    flex-direction: row;
}

.item_head {
    flex-direction: row;
    justify-content: space-between;
}

.time_sf {
    font-size: 20px;
    color: #8b919c;
    width: 90px;
    height: 36px;
    text-align: center;
    line-height: 36px;
    background-color: #eceef1;
    border-radius: 18px;
    margin-right: 10px;
}

.time_sf_float {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 20px;
    color: #8b919c;
    width: 90px;
    height: 36px;
    text-align: center;
    line-height: 36px;
    background-color: #eceef1;
    border-radius: 18px;
    margin-right: 10px;
}

.time_icon {
    font-size: 24px;
    padding-right: 15px;
    color: #434343;
}

.day {
    font-size: 24px;
    padding-right: 15px;
    color: #434343;
}

text {
    display: inline;
}

.right_icon {
    font-size: 36px;
    font-family: iconfont2;
    color: #9b9da4;
}

.new_notice {
    position: absolute;
    top: 35px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.notice_btn {
    width: 190px;
    height: 50px;
    background-color: @main_color;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
}

.notice_text {
    font-size: 22px;
    color: #fff;
}

.icon_notice {
    padding-left: 10px;
}

.stare {
    font-size: 22px;
    color: #257fee;
}

.shareButton {
    text-align: right;
}


.bmspan {
    font-size: 28px;    
}
.notice_warn_color {
    color: @warn_color;
}
.notice_safe_color {
    color: @safe_color;
}
</style>
