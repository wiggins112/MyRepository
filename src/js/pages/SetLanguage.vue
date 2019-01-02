<template>
  <div class="container">
    <StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
    <wxc-minibar :title="$t('语言设置')"></wxc-minibar>
    <div class="box">
      <scroller class="scroller" :style="{ height: page_height }" >
        <wxc-radio :list="language" @wxcRadioListChecked="wxcRadioListChecked" :config="config"></wxc-radio>
      </scroller>
    </div>
  </div>
</template>
<script>
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { WxcRadio, Utils} from 'weex-ui'
import { language } from '../config/language.js'
export default {
  components: {
    WxcMinibar,
    StatusBar,
    WxcRadio
  },
  data: function() {
    return {
      language: [],
      loading_text: this.$t('正在加载...')
    }
  },
  created() {
    this.initLanguage();
  },
  methods: {
    init() {

    },
    initLanguage() {
      this.language = [];
      const storageLanguage = this.$storage.getSync('language')
      for (let lang of language.language_list) {
        this.language.push({
          title: lang.full_name,
          value: lang.simple_name,
          checked: lang.simple_name === storageLanguage ? true : false
        })
      }
    },
    wxcRadioListChecked(e) {
      this.$storage.setSync('language', e.value);
      this.$notice.loading.show(this.loading_text);
      setTimeout(() => {
        this.$router.setBackParams({
          change_lang: e.value,
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
