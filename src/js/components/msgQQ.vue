<template>
  <image src="bmlocal://assets/images/supportQQ.png" alt="supportQQ" class="img" @click="callQQ()">
</template>

<script>
import { API_BaseUrl } from '../config/config.js'
import common from '../config/common.js'

export default {
    name: '',
    props: {
        umengEvent: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            qq: '1609508904',
            link: ''
        }
    },
    created () {
        this.init()
    },
    methods: {
        async init () {
            await this.getQQ()
            this.$event.on('singleFundQQ', q => {
                this.qq = q
            })
        },
        async getQQ () {
            try {
                const res = await this.$fetch({
                    name: 'getConfig',
                    method: 'GET',
                    data: {
                        type: 'app_config',
                        key: 'fund_customer_service'
                    }
                })
                if (res.error === 0) {
                    if (res.result.qq) this.qq = res.result.qq
                    if (res.result.hasOwnProperty('link')) this.link = res.result.link
                }
            } catch (err) {
            }
        },
        callQQ () {
            if (this.umengEvent) common.addUmengClickEvent(this.umengEvent)
            if (this.link) this.$router.openBrowser(this.link)
            this.$notice.confirm({
                message: '客服QQ: ' + this.qq,
                okTitle: '复制 QQ 号码',
                cancelTitle: '关闭',
                okCallback: () => {
                  this.$tools.copyString(this.qq).then(res => {
                        this.$notice.toast({
                            message: '复制成功'
                        })
                    }, error => {
                        this.$notice.toast({
                            message: '复制失败'
                        })
                    })
                }

            })
        }
    }
}
</script>

<style scoped>
.img {
    width: 145px;
    height: 145px;
    position: fixed;
    right: 0;
    bottom: 183px;
}
</style>
