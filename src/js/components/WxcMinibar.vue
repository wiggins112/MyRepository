<!-- CopyRight (C) 2017-2022 Alibaba Group Holding Limited. -->
<!-- Created by Tw93 on 16/10/25. -->
<!--A top navigation bar.-->

<template>
  <div class="wxc-minibar" :style="{ backgroundColor: backgroundColor, backgroundImage: backgroundImage, borderBottomWidth: borderBottomWidth, borderBottomColor: borderBottomColor }" v-if="show">
    <div class="left" @click="leftButtonClicked" aria-:label="$t('返回')" :accessible="true" :style="{width: leftWidth}">
      <slot name="left">
        <image :src="leftButton"
               v-if="leftButton && !leftText"
               class="left-button"></image>
        <text v-if="leftText"
              class="icon-text"
              :style="{ color: textColor }">{{leftText}}</text>
      </slot>
    </div>
    <slot name="middle">
      <text class="middle-title" :style="{ color: textColor }">{{$t(title)}}</text>
    </slot>
    <div class="right" @click="rightButtonClicked" :style="{width: rightWidth}">
      <slot name="right">
        <image v-if="rightButton && !rightText"
               class="right-button"
               :src="rightButton"
               :aria-hidden="true"></image>
        <text v-if="rightText"
              class="icon-text"
              :style="{ color: textColor }">{{rightText}}</text>
      </slot>
    </div>
  </div>
</template>

<style scoped>
  .wxc-minibar {
    width: 750px;
    height: 90px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
  }
  .left {
    width: 130px;
    height: 90px;
    padding-left: 32px;
    flex-direction: column;
    justify-content: center;
  }
  .middle-title {
    flex: 1;
    font-size: 36px;
    color: #434343;
    height: 36px;
    line-height: 36px;
    font-weight: bold;
    lines: 1;
    text-overflow: ellipsis;
    text-align: center;
  }
  .right {
    width: 130px;
    height: 90px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding-right: 32px;
  }
  .left-button {
    width: 21px;
    height: 36px;
  }
  .right-button {
    width: 32px;
    height: 32px;
  }
  .icon-text {
    font-size: 28px;
    color: #434343;
  }
</style>

<script>
  const Navigator = weex.requireModule('navigator');
  export default {
    props: {
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      backgroundImage: {
        type: String,
        default: ''
      },
      borderBottomWidth: {
        type: String,
        default: '1px'
      },
      borderBottomColor: {
        type: String,
        default: '#ddd'
      },
      leftButton: {
        type: String,
        default: 'https://gw.alicdn.com/tfs/TB1x18VpwMPMeJjy1XdXXasrXXa-21-36.png'
      },
      textColor: {
        type: String,
        default: '#434343'
      },
      rightButton: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: '标题'
      },
      leftText: {
        type: String,
        default: ''
      },
      rightText: {
        type: String,
        default: ''
      },
      useDefaultReturn: {
        type: Boolean,
        default: true
      },
      show: {
        type: Boolean,
        default: true
      },
      leftWidth: {
        type: String,
        default: '130px'
      },
      rightWidth: {
        type: String,
        default: '130px'
      },
    },
    methods: {
      leftButtonClicked () {
        if (this.useDefaultReturn) {
          Navigator.pop({}, e => {
          });
        }
        this.$emit('wxcMinibarLeftButtonClicked', {});
      },
      rightButtonClicked () {
        const hasRightContent = this.rightText || this.rightButton || (this.$slots && this.$slots.right);
        hasRightContent && this.$emit('wxcMinibarRightButtonClicked', {});
      }
    }
  };
</script>