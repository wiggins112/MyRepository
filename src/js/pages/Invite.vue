<template>
    <div class="container">
        <div class="wrapper">
            <StatusBar :statusBarStyle="statusBarStyle"></StatusBar>
            <wxc-minibar :title="$t('邀请注册')" >
                <text slot="left" class="icon back_icon" @click="minibarLeftButtonClick">&#xe91a;</text>
                <text slot="right" class="icon right_icon" @click="minibarRightButtonClick" v-if="!hideModule['Share']">&#xe90b;</text>
            </wxc-minibar>
            <div class="box_bd">
               <image class="img" ref="img" style="width: 600px; height: 1067px;" :src="shareConfigs.image"></image>
               <image @load="onImageLoad" :class="['poster_bg', is_phonex && 'is_phonex_poster_bg', is_fullscreen && 'fullscreen_poster_bg']" style="width: 750px; height: 1334px;" :src="shareConfigs.image"></image>
                <text class="icon delete_icon" @click="Notfullscreen" v-if="0">&#xe91a;</text>
                <div :class="['invite_box', is_phonex && 'is_phonex_invite_box', is_fullscreen && 'invite_box_fullscreen']"  v-if="0">
                    <div class="box">
                        <text class="title_text">{{ $t('您的邀请码') }}</text>
                        <text class="code_text">{{user_token.ic || ''}}</text>
                        <bmrichtext class="bmrichtext">
                            <bmspan class="rich_text" :value="$t('每邀请一位好友下载注册成功币智慧APP可以获得')"></bmspan>
                            <bmspan class="rich_text bzh_value" value="600BZH"></bmspan>
                            <bmspan class="rich_text" :value="$t('奖励')"></bmspan>
                        </bmrichtext>
                    </div>
                </div>
            </div>
        </div>
        <ShareComponents :showShare="showShare" :shareConfigs="shareConfigs" @ShareCallback="ShareCallback" @saveImageCallback="saveImageCallback" @closeShare="closeShare" v-if="!hideModule['Share']">
        </ShareComponents>
    </div>
</template>
<script>
import { wxcButton } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import ShareComponents from '../components/ShareComponents.vue'
import { API_BaseUrl, Iconfont } from '../config/config.js'
import common from '../config/common';

export default {
    components: {
        StatusBar,
        WxcMinibar,
        wxcButton,
        ShareComponents
    },
    data() {
        return {
            invite_poster_bg: `bmlocal://assets/images/poster/invite_poster_bg.jpg`,
            download: `bmlocal://assets/images/download.png`,
            phone: '',
            password: '',
            is_show: true,
            showShare: false,
            statusBarStyle: {
                bgColor: '#ffffff',
            },
            router_params: {},
            user_token: {},
            is_fullscreen: false,
            is_phonex: weex.config.env.touchBarHeight ? true : false,
            user_token_pic: '',
            loading: {
                pic: 'loading',
                user_token_pic: 'loading'
            },
            user_info: {},
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
        beforeDisappear() {
            this.$notice.loading.hide();
            this.$event.emit('m-setData', { is_on_login_page: false });
        },
        beforeBackAppear(params, options) {
            this.getUserInfo();
            if (this.user_info.is_login) {
                this.getUserToken();
            }
        },
    },
    methods: {
        init() {
            this.getUserInfo();
            this.getUserToken();
            this.getRouterParams();
        },
        getUserInfo() {
            this.user_info = this.$storage.getSync('user_info') || {};
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
            })
        },
        showDialog() {
            this.is_show = true;
        },
        closeDialog() {
            this.is_show = false;
        },
        confirm() {

        },
        closeShare() {
            this.showShare = false;
        },
        ShareCallback(state) {
            if (state === 'succeed') {
                common.addUmengClickEvent('bzh_invite_weixin');
            }
        },
        saveImageCallback(state) {
            if (state === 'succeed') {
                common.addUmengClickEvent('bzh_invite_save');
            }
        },
        Notfullscreen() {
            this.is_fullscreen = false;
        },
        minibarRightButtonClick() {
            this.showShare = true;
        },
        minibarLeftButtonClick() {
            if (this.router_params.from === 'settings') {
                this.$router.back();
            } else {
                this.$router.back({
                    length: this.router_params.route_length || 1,
                });
            }

        },
        onImageLoad(event) {
            this.$notice.loading.hide()
            if (event.success) {
                this.showShare = true;
            } else {
                // this.$notice.toast({ message: '分享海报加载失败，请稍后再试试~' })
            }
        },
        getUserToken() {
            this.$notice.loading.show();
            let params = {};
            this.loading.pic = 'loading';
            this.$fetch({
                name: 'getUserToken',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.pic = 'loaded';
                    this.user_token = resData.result.ic;
                    this.getUserTokenPic();
                } else {
                    this.loading.pic = 'error';
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((resData) => {
                this.$notice.toast({ message: resData.message })
            });
        },
        getUserTokenPic() {
            let params = {};
            params.token = this.user_token;
            this.loading.user_token_pic = 'loading';
            this.$fetch({
                name: 'getUserTokenPic',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.user_token_pic = 'loaded';
                    this.user_token_pic = resData.ic_pic;
                } else {
                    this.loading.user_token_pic = 'error';
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((resData) => {
                this.$notice.toast({ message: resData.message })
            });
        },

    },
    computed: {
        shareConfigs() {
            return {
                title: `我的邀请码：${String(this.user_token).toUpperCase()}`, // 分享的标题
                content: this.$t('扫码下载币智慧App免费领取1000BZH'), // 分享的文字内容
                url: this.user_token_pic, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: this.user_token_pic, // 分享的图片url
                type: 'Image'
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
.container {}

.icon {
    font-size: 43px;
    color: #434343;
    font-family: iconfont2;
}

.delete_icon {
    font-size: 40px;
}
.back_icon {
    color: #434343;
}
.poster_bg {
    top: 120px;
    left: 0;
    right: 0;
    position: fixed;
    height: 1334px;
    width: 750px;
}
.invite_box {
    padding: 0 100px;
    position: fixed;
    top: 400;
    width: 750px;
}
.fullscreen_poster_bg {
    top: 0;
}
.invite_box_fullscreen {
    top: 400 - 50;
}
.is_phonex_poster_bg {
    top: 180px;
}
.is_phonex_invite_box {
    top: 550px;
}
.delete_icon {
    position: fixed;
    top: 70px;
    right: 40px;
    color: #fff;
}
.box_ft {
    position: fixed;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.save_img {
    width: 110px;
    height: 110px;
    background-color: rgba(255,255,255,0.8);
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
}
.download_img {
    width: 70px;
    height: 70px;
}
.code_text {
    padding-top: 20px;
    font-size: 70px;
    color: #22D3C9;
}
.bmrichtext {
    padding-top: 30px;
}
.rich_text {
    font-size: 30px;
    line-height: 50px; 
    color: #767A7D;
}
.bzh_value {
    color: #22D3C9;
}
.box {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.share_img {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    background-color: #ffffff;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.share_icon {
    width: 90px;
    height: 90px;
    border-radius: 12px;
    background-color: #ffffff;
}

.share_text {
    padding-top: 20px;
    color: #666;
    font-size: 28px;
}
</style>
