<template>
    <div class="container">
        <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
        <wxc-minibar :title="$t('文章详情')" >
            <div slot="right" class="right"  @click="minibarRightButtonClick" v-if="!hideModule['Share']">
                <text class="icon right_icon">&#xe90b;</text>
            </div>
        </wxc-minibar>
        <div class="wrapper">
            <scroller class="wrapper_scroller" :style="{height: PageHeight}">
                <web v-if="show_article_web" class="web_box" :style="{height: PageHeight}" :src="article_web_url" @pagefinish="onPageFinish"></web>
            </scroller>
        </div>
        <div class="article_bar">
            <image class="bzh_sub" src="bmlocal://assets/images/bzh.png"></image>
            <div class="sentiment">
                <ArticleSentiment :article="article" from="detail" v-if="loading.article === 'loaded'"></ArticleSentiment>
            </div>
            <div class="operate">
                <div class="box good_box" @click="toggleGood">
                    <div class="content">
                        <text class="icon icon-position" v-if="!article.is_agree">&#xe910;</text>
                        <text class="icon like_active icon-position" v-if="article.is_agree">&#xe910;</text>
                        <text class="icon_text">{{ $t('点赞') }}</text>
                    </div>
                    <text class="tip" v-if="is_tip">+1</text>
                </div>
                <div class="box" @click="showDialog">
                    <text :class="['icon', 'icon_correct', 'icon-position', is_show && 'correct_active']">&#xe90c;</text>
                    <text class="icon_text">{{ $t('纠错') }}</text>
                </div>
            </div>
        </div>
        <Dialog :title="$t('文章纠错')" :top="top" :show="is_show" @wxcDialogCancelBtnClicked="closeDialog" @wxcDialogConfirmBtnClicked="confirm">
            <div slot="content">
                <div class="correct_box" @click.stop="">
                    <div class="body">
                        <div class="item" @click="toggleOther('is_content','is_other','is_error','is_title')">
                            <text class="icon icon_select" v-if="is_content">&#xe929;&nbsp;&nbsp;{{ $t('内容与区块链无关') }}</text>
                            <text class="icon icon_unselected" v-if="!is_content">&#xe928;&nbsp;&nbsp;{{ $t('内容与区块链无关') }}</text>
                        </div>
                        <div class="item" @click="toggleOther('is_error','is_other','is_content','is_title')">
                            <text class="icon icon_select" v-if="is_error">&#xe929;&nbsp;&nbsp;{{ $t('正文错误') }}</text>
                            <text class="icon icon_unselected" v-if="!is_error">&#xe928;&nbsp;&nbsp;{{ $t('正文错误') }}</text>
                        </div>
                        <div class="item" @click="toggleOther('is_title','is_other','is_content','is_error')">
                            <text class="icon icon_select" v-if="is_title">&#xe929;&nbsp;&nbsp;{{ $t('标题错误') }}</text>
                            <text class="icon icon_unselected" v-if="!is_title">&#xe928;&nbsp;&nbsp;{{ $t('标题错误') }}</text>
                        </div>
                        <div class="item edit_box">
                            <text class="icon icon_select" v-if="is_other" @click.stop="toggleOther('is_other','is_title','is_content','is_error')">&#xe929;&nbsp;&nbsp;{{ $t('其他') }}</text>
                            <text class="icon icon_unselected" v-if="!is_other" @click.stop="toggleOther('is_other','is_title','is_content','is_error')">&#xe928;&nbsp;&nbsp;{{ $t('其他') }}</text>
                            <textarea class="edit" v-if="is_other" v-model="title" @focus="setTopMin" @blur="setTopMax" :placeholder="$t('请在此处填写纠错内容')"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
        <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="closeShare" />
        <DialogTaskDone v-if="show_dialog_task_done" :task="dialog_task" @closeDialog="closeTaskDone"></DialogTaskDone>
    </div>
</template>
<script>
import { Utils, WxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import correctBox from '../components/correctBox.vue'
import { API_BaseUrl, Bizhihui_Url, Iconfont, PUBLISH_COUNTRY } from '../config/config.js'
import ArticleSentiment from '../components/ArticleSentiment.vue'
import Dialog from '../components/Dialog.vue'
import ShareComponents from '../components/ShareComponents.vue'
import DialogTaskDone from '../components/DialogTaskDone.vue'
import common from '../config/common';

export default {
    components: {
        WxcButton,
        WxcMinibar,
        StatusBar,
        ArticleSentiment,
        correctBox,
        Dialog,
        ShareComponents,
        DialogTaskDone,
    },
    data() {
        return {
            PUBLISH_COUNTRY,
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            router_params: {},
            show: false,
            show_dialog_task_done: false,
            bzh: 50,
            PageHeight: 1334,
            loading: {
                article: 'loading',
            },
            article: {},
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            API_BaseUrl: API_BaseUrl,
            is_tip: false,
            is_correct: false,
            is_other: false,
            is_content: false,
            is_error: false,
            is_title: false,
            edit_content: '',
            title: '',
            is_show: false,
            top: 300,
            showShare: false,
            user_token: {},
            user_info: {},
            show_article_web: false,
            dialog_task: '',
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
        beforeDisappear(options) {
            // 离开页面
            this.$notice.loading.hide();
        },
    },
    methods: {
        init() {
            this.getUserInfo();
            this.getRouterParams();
            this.initTabPage();
            this.getUserToken();
            if (this.is_ios) {
                this.$notice.loading.show();
            }
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        initTabPage() {
            this.PageHeight = Utils.env.getPageHeight();
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.show_article_web = true;
                this.getArticle();
            })
        },
        minibarRightButtonClick() {
            this.showShare = true;
        },
        closeShare() {
            this.showShare = false;
        },
        closeTaskDone() {
            this.show_dialog_task_done = false;
        },
        getArticle() {
            let params = {};
            params.article_id = this.router_params.article_id;
            let get_url =  `${API_BaseUrl}/api/article/${params.article_id}`;
            let get_url_ind =  `${API_BaseUrl}/api/message/ind/${params.article_id}`;
            this.loading.article = 'loading';
            this.$fetch({
                url: this.$locale() === 'zh-CN' ? get_url : get_url_ind ,
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.article = 'loaded';
                    resData.result.is_favor ? resData.result.is_favor = true : resData.result.is_favor = false;
                    resData.result.is_agree ? resData.result.is_agree = true : resData.result.is_agree = false;
                    this.article = resData.result;

                    this.showTaskDialog('done_daily_read'); // 每日任务：是否已经阅读５篇文章以上
                } else {
                    this.$notice.toast({ message: resData.message })
                }

            }).catch((e) => {
                this.loading.article = 'error';
                console.log(e.message)
            });
        },
        showTaskDialog(task) {
            this.dialog_task = task;
            this.show_dialog_task_done = true;
        },
        getUserToken() {
            let params = {};
            if (!this.user_info.is_login) {
                return;
            }
            this.$fetch({
                name: 'getUserToken',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.user_token = resData.result;
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((resData) => {
                this.$notice.toast({ message: resData.message })
            });
        },
        toggleGood() {
            this.postArticleBehavior({ behavior: 'agree', scene: 0 });
        },
        postArticleBehavior({ behavior, scene }) {
            let params = {};
            params.behavior = behavior;
            params.scene = scene;
            params.article_id = this.router_params.article_id;
            if (this.title) {
                params.remarks = this.title;
            }
            this.$notice.loading.show();
            this.$fetch({
                url: `${API_BaseUrl}/api/article/${params.article_id}/behavior`,
                method: 'POST',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    if (behavior === 'agree') {
                        this.article.is_agree = !this.article.is_agree;
                        if (this.article.is_agree) {
                            this.is_tip = true;
                            setTimeout(() => {
                                this.is_tip = false;
                            }, 1500)
                        }

                    }
                } else {
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message)
            });
        },

        toggleOther(is_tab, is_tab2, is_tab3, is_tab4) {
            this[is_tab] = !this[is_tab];
            this[is_tab2] = false;
            this[is_tab3] = false;
            this[is_tab4] = false;
            if (is_tab === 'is_content') {
                this.title = this.$t('内容与区块链无关')
            } else if (is_tab === 'is_error') {
                this.title = this.$t('正文错误')

            } else if (is_tab === 'is_title') {
                this.title = this.$t('标题错误')
            } else if (is_tab === 'is_other') {
                this.title = '';
            }
        },
        showDialog() {
            this.is_show = true;
        },
        closeDialog() {
            this.is_show = false;
        },

        confirm() {
            this.postArticleBehavior({ behavior: 'correct', scene: 0 });
            this.closeDialog();
        },
        setTopMin() {
            this.top = 100;
        },
        setTopMax() {
            this.top = 300;
        },
        onPageFinish() {
            this.$notice.loading.hide()
        },
    },
    computed: {
        tabPageHeight() {
            return Utils.env.getPageHeight();
        },
        shareConfigs() {
            return {
                title: this.article.title, // 分享的标题
                content: this.article.abstract || this.article.text, // 分享的文字内容
                url: this.share_url, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: this.article.image, // 分享的图片url
            }
        },
        platform_ios() {
            return String(weex.config.env.platform).toLowerCase() === 'ios';
        },
        hideModule() {
           return this.$storage.getSync('hideModule');
        },
        share_url() {
            let zhCNUrl = `${Bizhihui_Url}/article/${this.router_params.article_id}?token=${this.user_token.ic || ''}`;
            let indUrl = this.article_web_url;
            if (this.$locale() === 'zh-CN') {
                return zhCNUrl;
            } else {
                return indUrl;
            }
        },
        article_web_url() {
            let uri = `${API_BaseUrl}/api/article/${this.router_params.article_id}?html=1&_locale=${this.$locale()}&_country=${PUBLISH_COUNTRY}`;
            return uri;
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.container {}

.status_bar {
    height: 40;
    background-color: @base_color;
}

.box_hd {}

.box_bd {}

.box_ft {}

.icon {
    font-size: 38px;
    font-family: iconfont2;
}

.wrapper {
    width: 750px;
}

.wrapper_scroller {
    width: 750px;
}

.web_box {
    width: 750px;
    padding-bottom: 90px;
}
.right {
    height: 90px;
    width: 100px;
    justify-content: center;
}
.right_icon {
    text-align: right;
    font-size: 43px;
    color: #434343;
}

.info {
    padding-top: @padding_size;
    padding-bottom: @padding_size;
    padding-left: @padding_size;
    padding-right: @padding_size;
}

.article_bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 750px;
    height: 97px;
    background-color: #fff;
    border-top-width: 1px;
    border-color: #ddd;
}

.operate {
    flex-direction: row;
    justify-content: flex-end;
}

.box {
    padding: 15px 30px;
    position: relative;
}

.good_box {
    position: relative;
}

.content {
    justify-content: center;
}

.like_active {
    color: #ff6060;
}
.icon-position {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
}

.icon_correct {
    color: #434343;
}

.icon_text {
    font-size: 20px;
    margin-top: 46px;
}

.correct_active {
    color: #f7b237;
}

.tip {
    position: absolute;
    left: 38px;
    top: -3px;
    color: #ff6060;
    font-size: 24px;
}

.body {
    margin-top: 25px;
}

.item {
    margin-bottom: 30px;
}

.icon_unselected {
    color: #434343;
    font-size: 32px;
}

.icon_select {
    color: #f7b237;
    font-size: 32px;
}

.edit_box {
    height: 280px;
}

.edit {
    padding: 20px;
    width: 480px;
    height: 200px;
    margin-top: 20px;
    border-style: solid;
    border-color: #434343;
    border-width: 1px;
    color: #434343;
    font-size: 28px;
}

.sentiment {
    flex: 1;
    margin-left: 70px;
}

.bzh_sub {
    width: 80px;
    height: 80px;
    position: absolute;
}
</style>
