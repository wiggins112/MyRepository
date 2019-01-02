<template>
  <div class="container">
    <wxc-overlay v-if="show" :show="true" duration="50" :hasAnimation="false" @wxcOverlayBodyClicking="wxcOverlayBodyClicking"></wxc-overlay>
    <div class="dialog-box" v-if="show" :style="{left: left + 'px', top:top+'px', backgroundColor: dialogBoxBgColor, width: dialogWidth + 'px'}">
      <div class="dialog-close" :style="{left: left + 'px', width: dialogWidth + 'px', top:top - 60 +'px'}" v-if="showCloseBtn">
          <wxc-icon class="close-content icon" name="close" @wxcIconClicked="secondaryClicked"></wxc-icon>
      </div>
      <slot>
        <div class="dialog-content">
          <slot name="title">
            <text class="content-title" :style="{ color: titleColor }">{{title}}</text>
          </slot>
          <slot name="content">
            <text class="content-subtext" :style="{textAlign: align}">{{content}}</text>
          </slot>
          <div class="no-prompt"
               v-if="showNoPrompt"
               @click="noPromptClicked">
            <image :src="noPromptIcon" class="no-prompt-icon"></image>
            <text class="no-prompt-text">{{$t(noPromptText)}}</text>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="footer-btn cancel"
               v-if="!single"
               @click="secondaryClicked">
            <text class="btn-text" :style="{ color: secondBtnColor }">{{$t(cancelText)}}</text>
          </div>
          <div class="footer-btn confirm" @click="primaryClicked">
            <text class="btn-text" :style="{ color: mainBtnColor }">{{$t(confirmText)}}</text>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
  .container {
    position: fixed;
    width: 750px;
    border-radius: 6px;
    /*兼容H5异常*/
    z-index: 99999;
  }
  .dialog-box {
    position: fixed;
    left: 76px;
    width: 598px;
    background-color: #FFFFFF;
    border-radius: 4px;
  }
  .dialog-close {
    position: fixed;
    left: 76px;
    width: 598px;
    background-color: transparent;
    flex-direction: row;
    justify-content: flex-end;
  }
  .close-content {
    width: 150px;
    height: 150px;
    text-align: right;
    font-size: 45px;
    color: #fff;
    font-weight: bold;
  }
  .dialog-content {
    padding-top: 36px;
    padding-bottom: 36px;
    padding-left: 36px;
    padding-right: 36px;
  }
  .content-title {
    color: #333333;
    font-size: 36px;
    text-align: center;
    margin-bottom: 24px;
  }
  .content-subtext {
    color: #434343;
    font-size: 32px;
    line-height: 44px;
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
  import {WxcOverlay, WxcIcon } from 'weex-ui';
  const CHECKED = 'https://gw.alicdn.com/tfs/TB1UT3VpgMPMeJjy1XdXXasrXXa-42-42.png';
  const UN_CHECKED = 'https://gw.alicdn.com/tfs/TB1hE3VpgMPMeJjy1XdXXasrXXa-42-42.png';
  export default {
    components: { WxcOverlay, WxcIcon },
    props: {
      show: {
        type: Boolean,
        default: false
      },
      single: {
        type: Boolean,
        default: false
      },
      showCloseBtn: {
        type: Boolean,
        default: false
      },
      dialogBoxBgColor: {
        type: String,
        default: '#FFFFFF'
      },
      title: {
        type: String,
        default: ''
      },
      titleColor: {
        type: String,
        default: '#333333'
      },
      content: {
        type: String,
        default: ''
      },
      align: {
        type: String,
        default: 'center'
      },
      top: {
        type: Number,
        default: 400
      },
      left: {
        type: Number,
        default: 76
      },
      dialogWidth: {
        type: Number,
        default: 598
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
        default: '#F7B237'
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
    }
  };
</script>