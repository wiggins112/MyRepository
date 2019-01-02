<template>
  <div class="container">
    <StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
    <wxc-minibar :title="$t('行情设置')"></wxc-minibar>
    <div class="box">
      <scroller class="scroller" :style="{ height: page_height }" >
        <wxc-radio :list="currency_info"  @wxcRadioListChecked="handleCurrency" ></wxc-radio>
        <wxc-radio :list="open_info"  @wxcRadioListChecked="handleOpen"></wxc-radio>
      </scroller>
    </div>
  </div>
</template>
<script>
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { WxcRadio, Utils} from 'weex-ui'
import { currency, open } from '../config/language.js'
export default {
  components: {
    WxcMinibar,
    StatusBar,
    WxcRadio
  },
  data: function() {
    return {
      loading_text: this.$t('正在加载...'),
      currency_info: [],
      open_info: [],
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.initCurrency();
      this.initOpen();
    },
    initCurrency() {
      const storageCurrency = this.$storage.getSync('currency'); // 默认是USD （有 USD 和 CNY 的选择）
      for (let lang of currency.currency_list) {
        this.currency_info.push({
            title: lang.currency_txt,
            value: lang.currency_code,
            checked: lang.currency_code === storageCurrency.currency_code ? true : false
        })
      }
    },
    initOpen() {
      const storageOpenCode = this.$storage.getSync('open').open_code; // （有 8am 和 24h 的选择）
      for (let item of open.open_list) {
        this.open_info.push({
            title: item.open_txt,
            value: item.open_code,
            checked: (item.open_code === storageOpenCode) ? true : false
        })
      }
    },
    handleCurrency(e) {
      this.$storage.setSync('currency', currency.currency_list[e.index]);
      this.$notice.loading.show(this.loading_text);
      setTimeout(() => {
        this.$router.setBackParams({
          change_currency: e,
        })
        this.$router.back();
        this.$notice.loading.hide()
      }, 2000)
    },
    handleOpen(e) {
      this.$storage.setSync('open', open.open_list[e.index]);
      this.$notice.loading.show(this.loading_text);
      setTimeout(() => {
        this.$router.setBackParams({
          change_open: e,
        })
        this.$router.back();
        this.$notice.loading.hide()
      }, 2000)
    },
  },
  computed: {
    page_height() {
        return Utils.env.getPageHeight();
    },
  }
}

</script>
<style scoped lang="less">
.box {
  margin-top: 20px;
}
.scroller {
  width: 750px;
}
</style>
