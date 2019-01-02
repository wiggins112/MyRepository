<template>
    <div class="picker_box">
        <wxc-popup ref="popup_dom" popup-color="transparent" :show="isBottomShow" @wxcPopupOverlayClicked="closeShare" :pos="pos" :height="screen_height" :animation="{timingFunction: 'cubic-bezier(.25,.1,.3,1.3)'}">
            <div class="download_images">
                <image ref="download_img" :style="download_images_style" resize="contain" :src="shareConfigs.image" v-if="shareConfigs.imageType !== 'local'"></image>
            </div>
            <div class="popup" :style="{height: screen_height}">
                <div class="image_box" :style="{height: (screen_height) - height - 80}" @click="closeShare">
                    <scroller class="iamge_scroller" :style="{width: 750/1.5, height: page_height/1.4}" @click="closeShare" v-if="shareConfigs.type === 'Image' && showImage">
                        <AmImage class="air_logo" :imageStyle="{width: 750/1.5}" :autoHeight="true" :src="share_img_url" @load="onImageLoad" :placeholder="loading_gif"></AmImage>
                    </scroller>
                </div>
                <div class="content">
                    <div class="picker_content">
                        <div class="box_hd">
                            <text class="hd_title">{{ $t('分享至') }}</text>
                        </div>
                        <div class="box_bd">
                            <scroller class="share_scroller" :style="{height: height}">
                                <div class="share_list">
                                    <div class="share_item" v-for="(share, i) in share_configs" :key="i" v-if="shareConfigs.hide_index === i">
                                        <slot :name="`share_0${i+1}`"></slot>
                                    </div>
                                    <div class="share_item" v-for="(share, i) in share_configs" :key="i" @click="shareItemClick(share)" v-if="shareConfigs.hide_index !== i">
                                        <div :class="['share_img', $locale() !== 'zh-CN' && 'share_img_ind']">
                                            <image :class="['share_icon', $locale() !== 'zh-CN' && 'share_icon_ind']" :src="share.icon"></image>
                                        </div>
                                        <text class="share_text">{{share.title}}</text>
                                    </div>
                                </div>
                            </scroller>
                        </div>
                    </div>
                </div>
            </div>
        </wxc-popup>
    </div>
</template>
<script>
import common from '../config/common'
import { Utils, WxcPopup, WxcRadio } from 'weex-ui';
import AmImage from './AmImage.vue';
const bmWXShare = weex.requireModule('bmWXShare')
const ScreenShot = weex.requireModule('ScreenShot')
export default {
    components: { WxcPopup, WxcRadio, AmImage },
    data() {
        return {
            is_ios: String(weex.config.env.platform).toLowerCase() === 'ios' ? true : false,
            screen_height: weex.config.env.realDeviceHeight || weex.config.env.deviceHeight,
            isBottomShow: false,
            share_configs_cn: [{
                title: this.$t('复制链接'),
                icon: `bmlocal://assets/images/copylinks.png`,
                type: 'copylinks',
                appname: 'copylinks',
                eventname: 'copylinks'
            }, {
                title: this.$t('发给好友'),
                icon: `bmlocal://assets/images/wechat_pengyou.png`,
                type: 'WechatSession',
                appname: 'shareInApp',
                eventname: 'weixin'
            }, {
                title: this.$t('朋友圈'),
                icon: `bmlocal://assets/images/wechat_pengyouquan.png`,
                type: 'WechatTimeLine',
                appname: 'shareInApp',
                eventname: 'weixin'
            }, {
                title: this.$t('微博'),
                icon: `bmlocal://assets/images/sina_weibo.png`,
                type: 'SinaWeibo',
                appname: 'shareInApp',
                eventname: 'weibo'
            }],
            share_configs_ind: [{
                title: this.$t('复制链接'),
                icon: `bmlocal://assets/images/copylinks.png`,
                type: 'copylinks',
                appname: 'copylinks',
                eventname: 'copylinks'
            }, {
                title: this.$t('Whatsapp'),
                icon: `bmlocal://assets/images/whatsapp.png`,
                type: 'WhatsApp',
                appname: 'shareInApp',
                eventname: 'whatsapp'
            }, {
                title: this.$t('Line'),
                icon: `bmlocal://assets/images/line.png`,
                type: 'Line',
                appname: 'shareInApp',
                eventname: 'line'
            }
            , {
                title: this.$t('Facebook'),
                icon: `bmlocal://assets/images/Facebook.png`,
                type: 'Facebook',
                appname: 'shareInApp',
                eventname: 'facebook'
            }
            // , {
            //     title: this.$t('Messenger'),
            //     icon: `bmlocal://assets/images/Facebook.png`,
            //     type: 'FacebookMessage',
            //     appname: 'shareInApp',
            //     eventname: 'FacebookMessage'
            // }
            // , {
            //     title: this.$t('Twitter'),
            //     icon: `bmlocal://assets/images/Twitter.png`,
            //     type: 'Twitter',
            //     appname: 'shareInApp',
            //     eventname: 'twitter'
            // }
            ],
            share_configs: [],
            loading_gif: `bmlocal://assets/images/loading/loading_v3.gif`,
        }
    },
    props: {
        showShare: {
            type: Boolean,
            default: false,
        },
        height: {
            type: Number,
            default: 300
        },
        shareConfigs: {
            type: Object,
            require: true,
        },
        showImage: {
            type: Boolean,
            default: true,
        },
        pos: {
            type: String,
            default: 'bottom'
        },
        pageName: {
            type: String,
            default: 'bzh_acticle_detail_share'
        }
    },
    watch: {
        'showShare': {
            handler(newVal, oldVal) {
                this.isBottomShow = this.showShare;
                if (newVal && this.shareConfigs.type === 'Image') {
                    this.$notice.loading.show();
                }
            },
            deep: true,
        },
        'shareConfigs': {
            handler(newVal, oldVal) {
                this.initShareConfigs()
            },
            deep: true,
        }
    },
    created() {
        this.isBottomShow = this.showShare;
        this.initShare();
    },
    methods: {
        initShare() {
            common.initUM();
            common.initWX();
            common.initWeibo();
            this.initShareConfigs();
        },
        openBottomPopup() {
            this.isBottomShow = true;
        },
        initShareConfigs() {
            this.share_configs = this.$locale() !== 'zh-CN' ? this.share_configs_ind : this.share_configs_cn;
            if (this.shareConfigs.type === 'Image') {
                this.share_configs[0] = {
                    title: this.$t('保存到本地'),
                    icon: `bmlocal://assets/images/download.png`,
                    type: 'downloadImage',
                    appname: 'downloadImage',
                    eventname: 'downloadImage'
                }
            } else {
                this.share_configs[0] = {
                    title: this.$t('复制链接'),
                    icon: `bmlocal://assets/images/copylinks.png`,
                    type: 'copylinks',
                    appname: 'copylinks',
                    eventname: 'copylinks'
                }
            }
        },
        //非状态组件，需要在这里关闭
        closeShare(e) {
            this.$notice.loading.hide();
            this.$refs.popup_dom.hide();
            setTimeout(() => {
                this.isBottomShow = false;
                this.$emit('closeShare', e)
            }, 300)
        },
        confirm() {
            this.closeShare();
            this.$emit('confirm', this.currt_selected)
        },
        shareItemClick(share) {
            let uri = this.shareConfigs.image || '';
            if (this.shareConfigs.type === 'Image' && uri === 'undefined') {
                this.$notice.toast({ message: this.$t('请等待图片加载完成再操作') });
                return;
            }
            if (share.appname === 'downloadImage') {
                if (this.shareConfigs.imageType === 'local') {
                    this.saveScreenShot();
                } else {
                    this.saveImage();
                }
            }
            if (share.appname === 'copylinks') {
                this.initCopyShare();
            }
            if (share.appname === 'shareInApp') {
                this.initWxShare(share);
                // this.putShareFastNewTask();
            }
            let event_name = `${this.pageName}_${share.eventname}`;
            // 友盟统计-自定义事件计数
            common.addUmengClickEvent(event_name);
        },
        initCopyShare() {
            let copy_text = `【${this.shareConfigs.title}】 \n ${this.shareConfigs.content || ''} \n ${this.shareConfigs.url}`;
            this.$tools.copyString(copy_text).then(resData => {
                // 复制成功的回调
                this.$notice.toast({ message: this.$t('已复制到剪贴板') });
            }, error => {
                this.$notice.toast({ message: this.$t('复制失败，请稍后再试试') });
            })
        },
        initWxShare(optins) {
            let content = this.shareConfigs.content || '';
            let image_uri = this.shareConfigs.imageType === 'local' ? this.shareConfigs.image.replace('file://', '') : this.shareConfigs.image;
            let share_content = optins.type === 'SinaWeibo' ? '@币智慧 ' + content : content;
            console.log('share_content', share_content)
            this.$notice.loading.show();
            setTimeout(() => {
                this.$notice.loading.hide();
            }, 2500);
            bmWXShare.share({
                title: this.shareConfigs.title, // 分享的标题
                content: share_content, // 分享的文字内容
                url: this.shareConfigs.url, // 分享对应的URL地址，如h5、音乐链接、视频链接、小程序的链接
                image: image_uri || 'https://ganlan-cdn.bizhihui.vip/app/logo/1024x1024.jpg', // 分享的图片url
                shareType: this.getShareType(optins.type, this.shareConfigs.type || 'Webpage'), // this.shareConfigs.type || 'Webpage', // 分享的类型
                platform: optins.type, // 分享平台 朋友圈/好友（注意：历史版本的字段名是platforms,现在是一个字符串而不是数组）
                imageType: this.shareConfigs.imageType || '',

            }, (resData) => { // 注意： 历史版本返回的是一个promise对象，现在的是callback回调     
                // 成功回调
                this.$notice.loading.hide();
                this.$emit('ShareCallback', 'succeed')
                // this.$notice.toast({ message: this.$t('分享成功') });
            }, (resData) => {
                // 失败回调
                this.$notice.loading.hide()
                console.log('share_err', resData);
                this.$emit('ShareCallback', 'error')
                if (resData.status === 2008) {
                    this.$notice.toast({ message: this.$t('未安装该应用') });
                } else {
                    this.$notice.toast({ message: this.$t('分享取消') });
                }
            })
        },
        onImageLoad(event) {
            console.log('loadImage', event)
            if (event.success) {
                this.$notice.loading.hide()
            } else {
                this.$notice.loading.hide()
                if (event.target && event.target.attr && event.target.attr.src) {
                    this.$notice.toast({ message: '分享图片加载失败，请稍后再试试~' })
                }
            }
        },
        saveImage() {
            this.$refs['download_img'].save((result) => {
                // console.log('saveImage', result);
                if (result.success) {
                    this.$emit('saveImageCallback', 'success');
                    this.$notice.toast({ message: this.$t('已保存至本地') })
                } else {
                    this.$emit('saveImageCallback', 'fail');
                    this.$notice.toast({ message: '保存失败！请稍后再试试~' })
                }
            });
        },
        saveScreenShot() {
            let file = this.shareConfigs.image.replace('file://', '');
            let file_arr = file.split('/');
            let filename = file_arr[file_arr.length - 1];
            ScreenShot.saveImages(file, filename, (result) => {
                console.log('pathname——result：', result)
                if (result) {
                    this.$notice.toast({ message: this.$t('已保存至本地') })
                } else {
                    this.$notice.toast({ message: '保存失败！请稍后再试试~' })
                }
            })
        },
        getShareType(platform, type) {
            let shareType = type || 'Webpage';
            if (shareType === 'Webpage') {
                if (platform === 'Line' || platform === 'WhatsApp') {
                    shareType = 'Text'
                }
            }
            return shareType
        },
        putShareFastNewTask() {
            if(this.pageName === 'bzh_fast_news_share') { //请求分享快讯奖励10bzh 
               
            }
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        },
        download_images_style() {
            let imageInfo = this.shareConfigs.imageInfo || {};
            let width = imageInfo.width * 2 || 750 / 1.1;
            let height = imageInfo.height * 2 || 1334 / 1.1;
            return {
                width: width + 'px',
                height: height + 'px',
            }
        },
        share_img_url() {
            let uri = this.shareConfigs.image;
            if (uri && uri === 'undefined') {
                uri = this.loading_gif;
            } else {
                let uri = this.shareConfigs.image;
            }
            return uri;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.picker_box {}

.picker_content {
    width: 750px;
    position: relative;
}

.box_hd {
    background-color: @bgf4f5f6;
}

.hd_title {
    padding: @padding_size;
    text-align: center;
    font-size: 30px;
}

.box_bd {
    background-color: @bgf4f5f6;
}

.box_ft {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    flex-direction: row;
    justify-content: center;
    border-top-width: 1px;
    border-color: #E7EAF1;
    background-color: #ffffff;
}

.share_scroller {}

.share_list {
    padding: @padding_size 60px;
    padding-top: 50px;
    flex-direction: row;
    justify-content: space-around;
}

.share_item {
    flex-direction: column;
    align-items: center;
}

.share_img {
    width: 110px;
    height: 110px;
    border-radius: 12px;
    background-color: #ffffff;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.share_icon {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background-color: #ffffff;
}

.share_img_ind {
    width: 85px;
    height: 85px;
}

.share_icon_ind {
    width: 50px;
    height: 50px;
}

.share_text {
    padding-top: 20px;
    color: #666;
    font-size: 26px;
}

.cancer_text {
    padding: @padding_size;
    text-align: center;
}

.image_box {
    width: 750px;
    margin-bottom: 20px;
    align-items: center;
    justify-content: flex-end;
}

.content {}

.air_logo {
    width: 750/1.5px;
}

.popup {
    position: relative;
    // background-color: red;
}

.iamge_scroller {
    position: relative;
    align-items: center;
}

.download_images {
    position: fixed;
    left: -10000px;
    top: -10000px;
}

</style>
