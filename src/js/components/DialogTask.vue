<template>
  <div class="container">
    <wxc-overlay v-if="show" :show="true" duration="50" :hasAnimation="false" @wxcOverlayBodyClicking="wxcOverlayBodyClicking"></wxc-overlay>
    <div class="dialog-box" v-if="show" :style="{top:top+'px'}">
      <div class="dialog-circle" :style="{top:top - 50 +'px'}">
          <div class="circle-content">
            <image class="circle-bg" resize="cover" src="bmlocal://assets/images/tasks/ring_box_shadow.png"></image>
            <div class="circle-image-box">
              <image class="circle-image" resize="cover" :src="iconImage"></image>
            </div>
          </div>
      </div>
      <div class="dialog-close" :style="{top:top - 50 +'px'}">
          <text class="close-content icon" @click="secondaryClicked">&#xe91a;</text>
      </div>
      <div class="dialog-content">
        <slot name="title">
          <text class="content-title" :style="{ color: titleColor }">{{title}}</text>
        </slot>
        <slot name="content">
          <text class="content-subtext" :style="{textAlign: align}">{{content}}</text>
          <image class="content-image" resize="cover" :src="introContentImage" v-if="introContentImage"></image>
        </slot>
        <div class="no-prompt"
             v-if="showNoPrompt"
             @click="noPromptClicked">
          <image :src="noPromptIcon" class="no-prompt-icon"></image>
          <text class="no-prompt-text">{{$t(noPromptText)}}</text>
        </div>
      </div>
      <div class="dialog-footer">
        <div class="footer-btn confirm" @click="primaryClicked">
          <text class="btn-text" :style="{ color: mainBtnColor }">{{$t(confirmText)}}</text>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('../css/veriable.less');
  .icon {
      font-family: iconfont2;
  }
  .container {
    position: fixed;
    width: 750px;
    border-radius: 6px;
    /*兼容H5异常*/
    z-index: 99999;
  }
  .dialog-box {
    position: fixed;
    left: 96px;
    width: 558px;
    margin-top: 40px;
    background-color: #FFFFFF;
    border-radius: 12px;
  }
  .dialog-circle {
    position: fixed;
    left: 96px;
    width: 558px;
    background-color: transparent;
    align-items: center;
    justify-content: center;
  }
  .circle-content {
    position: relative;
    align-items: center;
    justify-content: center;
    width: 165px;
    height: 165px;

  }
  .circle-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 165px;
    height: 165px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .circle-image-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 150px;
    height: 150px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 100%;
  }
  .circle-image {
    width: 95px;
    height: 95px;
  }
  .dialog-close {
    position: fixed;
    left: 96px;
    width: 558px;
    background-color: transparent;
    flex-direction: row;
    justify-content: flex-end;
  }
  .close-content {
    width: 150px;
    height: 150px;
    padding-top: 20px;
    text-align: right;
    font-size: 45px;
    color: #fff;
  }
  .dialog-content {
    padding-top: 36px;
    padding-bottom: 36px;
    padding-left: 36px;
    padding-right: 36px;
    flex-direction: column;
  }
  .content-title {
    padding-top: 50px;
    font-size: 40px;
    text-align: center;
    margin-bottom: 24px;
    color: @main_color;
  }
  .content-subtext {
    color: #434343;
    font-size: 32px;
    line-height: 44px;
    text-align: center;
  }
  .content-image {
    margin: 15px 0;
    flex: 1;
    height: 260px;
  }
  .dialog-footer {
    padding: 60px 65px;
    flex-direction: row;
    align-items: center;
  }
  .footer-btn {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 90px;
    background-color: @main_color;
    border-radius: 12px;
  }
  .cancel {
    border-right-color: #F3F3F3;
    border-right-width: 1px;
  }
  .btn-text {
    font-size: 32px;
    color: #fff;
  }
  .no-prompt {
    width: 486px;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    margin-top: 24px;
  }
  .no-prompt-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
  }
  .no-prompt-text {
    font-size: 24px;
    color: #A5A5A5;
  }
</style>

<script>
  import {WxcOverlay} from 'weex-ui';
  const CHECKED = 'https://gw.alicdn.com/tfs/TB1UT3VpgMPMeJjy1XdXXasrXXa-42-42.png';
  const UN_CHECKED = 'https://gw.alicdn.com/tfs/TB1hE3VpgMPMeJjy1XdXXasrXXa-42-42.png';
  import {Iconfont} from '../config/config.js'
  export default {
    components: { WxcOverlay },
    props: {
      show: {
        type: Boolean,
        default: false
      },
      single: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      titleColor: {
        type: String,
        default: '#F7B237'
      },
      content: {
        type: String,
        default: ''
      },
      align: {
        type: String,
        default: 'center'
      },
      iconImage: {
        type: String,
        default: ''
      },
      introContentImage: {
        type: String,
        default: ''
      },
      top: {
        type: Number,
        default: 400
      },
      cancelText: {
        type: String,
        default: '取消'
      },
      confirmText: {
        type: String,
        default: '确定'
      },
      mainBtnColor: {
        type: String,
        default: '#fff'
      },
      secondBtnColor: {
        type: String,
        default: '#434343'
      },
      showNoPrompt: {
        type: Boolean,
        default: false
      },
      noPromptText: {
        type: String,
        default: '不再提示'
      },
      isChecked: {
        type: Boolean,
        default: false
      },
      closeOnClickOverlay: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      noPromptIcon: UN_CHECKED,
      pageHeight: 1334
    }),
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created () {
      const { env: { deviceHeight, deviceWidth } } = weex.config;
      this.pageHeight = deviceHeight / deviceWidth * 750;
    },
    methods: {
      secondaryClicked () {
        this.$emit('wxcDialogCancelBtnClicked', {
          type: 'cancel'
        });
      },
      primaryClicked (e) {
        this.$emit('wxcDialogConfirmBtnClicked', {
          type: 'confirm'
        });
      },
      noPromptClicked (e) {
        const isChecked = !this.isChecked;
        this.noPromptIcon = isChecked ? CHECKED : UN_CHECKED;
        this.$emit('wxcDialogNoPromptClicked', { isChecked });
      },
      wxcOverlayBodyClicking() {
        if (this.closeOnClickOverlay) {
          this.secondaryClicked();
        }
      },
      computed: {
        hideModule () {
            return this.$storage.getSync('hideModule')
        }
      }
    }
  };
</script>