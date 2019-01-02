<template>
    <div class="picker_box">
        <Dialog :closeOnClickOverlay="!update_info.force" :show="show" top="250" :showCloseBtn="!update_info.force" @wxcDialogCancelBtnClicked="closeDialog" :single="true">
            <div class="dialog_box">
                <div class="scroller_wrap" slot="content">
                    <div class="dialog_content" v-if="!is_wait">
                        <div class="dialog_hd">
                            <image v-if="update_info.logo" :src="update_info.logo" class="logo" />
                            <text class="hd_title">{{update_info.title}}</text>
                            <text class="hd_version" v-if="update_info.versionname">{{ $t('版本') }}: {{update_info.versionname || app_version}}</text>
                        </div>
                        <scroller class="dialog_bd" :style="{minHeight: is_ios ? 270 : 'auto', maxHeight: page_height/2}">
                            <div class="bd_box">
                                <text class="bd_text" :style="{textAlign: update_info.update ? 'left' : 'center'}">{{update_info.desc}}</text>
                            </div>
                        </scroller>
                    </div>
                    <div class="dialog_content dialog_content_update" v-if="is_wait">
                        <text class="wait_hd">{{progress_percent === 100 ? $t('安装包已下载完成了哦~') : $t('更新中，请稍等')}}</text>
                        <div class="progress_box">
                            <div class="progress" :style="{width: 60 + 400 * progress_percent/100}">
                                <text class="progress_percent">{{progress_percent}}%</text>
                            </div>
                        </div>
                        <text class="wait_ft">{{ $t('看币只看币智慧') }}</text>
                    </div>
                </div>
                <div class="dialog-footer" v-if="is_wait && progress_percent === 100">
                    <div class="footer-btn confirm" @click="installerApk">
                        <text class="btn-text" :style="{ color: mainBtnColor }">{{ $t('马上安装') }}</text>
                    </div>
                </div>
                <div class="dialog-footer" v-if="!is_wait">
                    <div class="footer-btn confirm" @click="primaryClicked">
                        <text class="btn-text" :style="{ color: mainBtnColor }">{{confirmText || update_info.confirm_text || $t('确定')}}</text>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import Dialog from './Dialog.vue'
import { Utils } from 'weex-ui'
const NatTransfer = weex.requireModule('transfer')
const installer = weex.requireModule('installer')

export default {
    components: { Dialog },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            is_show_dialog: false,
            is_update: true,
            is_wait: false,
            is_ok: false,
            progress: 0,
        }
    },
    props: {
        update_info: {
            type: Object,
            default: {}
        },
        confirmText: {
            type: String,
            default: ''
        },
        mainBtnColor: {
            type: String,
            default: '#F7B237'
        },
        show: {
            type: Boolean,
            default: false
        },
        align: {
            type: String,
            default: 'left'
        },
        closeOnClickOverlay: {
            type: Boolean,
            default: true
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {},
        //非状态组件，需要在这里关闭
        closeDialog(e) {
            this.$emit('closeDialog', e)
        },
        ConfirmBtnClicked() {
            this.$emit('ConfirmBtnClicked', {
                type: 'confirm'
            });
        },
        primaryClicked(e) {
            if (this.update_info.update && this.update_info.downloadurl) {
                if (this.update_info.platform === 'android') {
                    this.downloadApk();
                } else {
                    this.$router.openBrowser(this.update_info.downloadurl);
                }
            } else {
                this.ConfirmBtnClicked();
            }
        },
        downloadApk() {
            NatTransfer.download({
                'url': this.update_info.downloadurl,
                name: this.apk_name,
                target: '/Download'

            }, (result) => {
                console.log('download', result);
                if (result.status !== 403 && !result.error) {
                    // 403 没有读写内存的权限
                    this.is_wait = true;
                }
                if (result.ok && result.status === 200) {
                    this.installerApk();
                }
                if (result.progress) {
                    this.progress = result.progress;
                }
                if (result.error) {
                    if (result.error.message === 'DOWNLOAD_INTERNAL_ERROR') {
                        this.$notice.toast({ message: this.$t('网络中断啦~') })
                    } else {
                        this.$notice.toast({ message: this.$t('下载出错啦，请使用浏览器下载安装包哦~') })
                    }
                    this.$router.openBrowser(this.update_info.downloadurl);
                }
            })
        },
        installerApk() {
            let target = `/Download/${this.apk_name}`;
            installer.installApk(target, (res) => {
                console.log('installApk', res);
            });
        },
    },
    computed: {
        app_version() {
            return `v${weex.config.env.appVersion}`;
        },
        page_height() {
            return Utils.env.getPageHeight();
        },
        progress_percent() {
            let percent = parseInt(Number(this.progress || 0) * 100);
            return percent
        },
        apk_name() {
            let name = String(this.update_info.downloadurl).split('/').pop();
            return name;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}

.scroller_wrap {}

.logo {
    width: 200px;
    height: 200px;
}

.dialog_hd {
    padding-bottom: 15px;
    align-items: center;
}

.dialog_bd {
    width: 620px;
    max-height: 500px;
    padding: 0 30px;
}

.hd_title {
    padding: 20px 0;
    color: #434343;
    font-size: 36px;
    font-weight: bold;
}

.hd_version {
    padding: 5px 0;
    font-size: 26px;
    color: #9b9da4;
}

.bd_box {
    padding-bottom: 30px;
}

.bd_text {
    line-height: 34px;
    font-size: 34px;
    color: #434343;
    line-height: 50px;
}

.wait_hd {
    color: #434343;
    font-size: 36px;
    font-weight: bold;
    margin-top: 90px;
    margin-bottom: 75px;
    text-align: center;
}

.wait_ft {
    color: #9b9da4;
    font-size: 32px;
    margin: 40px 0 80px 0;
    text-align: center;
}

.dialog-footer {
    flex-direction: row;
    align-items: center;
    border-top-color: #F3F3F3;
    border-top-width: 1px;
}

.footer-btn {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 90px;
}

.cancel {
    border-right-color: #F3F3F3;
    border-right-width: 1px;
}

.btn-text {
    font-size: 32px;
    color: #434343;
}
.dialog_content_update {
    justify-content: center;
    align-items: center;
}
.progress_box {
    position: relative;
    width: 460px;
    height: 30px;
    background-color: #eff2f7;
    border-radius: 30px;
}
.progress {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: 30px;
    background-image: linear-gradient(to right, #74eb9b, #31e1c2);
}
.progress_percent {
    padding-left: 15px;
    color: #fff;
    font-size: 24px;
    text-align: left;
}
</style>
