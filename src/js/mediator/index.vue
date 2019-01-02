<template>
    <div></div>
</template>
<script>
// 这个vue的实例我们在app启动的时候就执行并常驻app内存，在app关闭时候销毁，所以data中的数据每次重启都会被初始化
// 而我们在app运行期间都可以任意改变data中的数据，然后推送给订阅者

// 如果想要持久化存储，可以配合storage来完成，每次启动app时候都从本地取数据，当data改变的时候异步的更新一下即可
// 住： 不能再app退出的时候来持久化存储，退出时间很短，无法保证存储成功

// 我们不建议在这里存储大量的数据 这里仅仅希望用作一个中介者 来提供给其他页面实例来通信 他无法替代storage 读取速度也远远慢与storage
const bmRouter = weex.requireModule('bmRouter');
import { language } from '../config/config.js'
import { hide } from '../config/language.js'
import common from '../config/common'
export default {
    data() {
        return {
            is_on_login_page: false, // 登录跳转标记，防止多次请求接口时出现多次重复打开登录页面。
            is_on_notice_messages_page: false, // 跳转标记，防止重复打开页面。
            lang: 'zh-CN'
        }
    },

    watch: {
    },
    methods: {
        init() {
            console.log('mediator.init');
            this.refresh();
            this.goLogin();
            this.setData();
            // this.getLang()
            this.LoginOut()          
        },
        getLang () {
            if (!this.$storage.getSync('language')) this.$storage.setSync('language', language)
            this.lang = this.$storage.getSync('language') || language
            let obj = {}
            if (hide[this.lang] && hide[this.lang].length) {
                hide[this.lang].map(x => {
                    obj[x] = true
                })
            }
            this.$storage.setSync('hideModule', obj)
        },
        LoginOut () {
            this.$event.on('LoginOut', resData => {
                const storageOpen = this.$storage.getSync('open');
                const storageCurrency = this.$storage.getSync('currency');
                const storageLanguage = this.$storage.getSync('language')
                const storageHideModule = this.$storage.getSync('hideModule')
                const storageIsSetLanguage = this.$storage.getSync('is_set_locale_language')
                this.$storage.removeAll().then(res => {
                    this.$storage.setSync('open', storageOpen);
                    this.$storage.setSync('currency', storageCurrency);
                    this.$storage.setSync('language', storageLanguage)
                    this.$storage.setSync('hideModule', storageHideModule)
                    this.$storage.setSync('is_set_locale_language', storageIsSetLanguage)
                })
            })
        },
        refresh() {
            this.$event.on('refresh', resData => {
                this.$router.refresh()
            })
        },
        goLogin() {
            this.$event.on('m-goLogin', params => {
                console.log('is_on_login_page ', this.is_on_login_page);
                if (!this.is_on_login_page) {
                    this.is_on_login_page = true;
                    bmRouter.open({
                        url: '/pages/Login.js', // 页面对应的 js 地址(注意路径从 /pages/ 开始)
                        type: 'PUSH',
                        params: params, // 传到下一个页面的参数，params 通过 router.getParams(callback) 获取 
                        navShow: false, // 是否显示原生导航栏
                    }, function() {});
                }
            })
        },
        goNoticeMessages() {
            this.$event.on('m-goNoticeMessages', params => {
                console.log('is_on_notice_messages_page ', this.is_on_notice_messages_page);
                if (!this.is_on_notice_messages_page) {
                    this.is_on_notice_messages_page = true;
                    bmRouter.open({
                        url: '/pages/index.js',
                        type: 'PUSH',
                        params: {
                            tab: 0,
                            hide_poster: true,
                            unback_exit: true,
                        }, 
                        navShow: false,
                    }, function() {
                        // callback   
                    });
                }
            })
        },
        setData() {
            this.$event.on('m-setData', params => {
                console.log('m-setData ', params);
                for (let k in params) {
                    this[k] = params[k];
                }
            });
        }
    },
    created() {
        this.init();
    }
}

</script>
