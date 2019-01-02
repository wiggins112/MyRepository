<template>
    <div>
        <StatusBar :statusBarStyle="statusBarStyle" />
        <wxc-minibar>
            <div
                slot="middle"
                class="middle">
                <text class="middle_title">{{ title }}</text>
            </div>
        </wxc-minibar>

        <list
            id="list"
            @loadmore="getMoreItems"
            :style="{height: page_height + 'px'}"
            :offset-accuracy="300"
        >
            <Refresher
                @refresh="init()"
                :loading="loading.messages"
            />

                <cell>
                    <BannerSlider
                        :banner_list="banners"
                        :imageWidth="750"
                        :imageHeight="350"
                        imageRadius="0"
                    />
                    <div style="margin-top: 20px;">
                        <div
                            v-for="(i, index) in items"
                            :item="i"
                            :key="index">
                            <FundPlazaList :item="i" />
                        </div>
                    </div>
                </cell>
                <cell>
                    <loadmore :loading="loading.messages" />
                </cell>
            </list>

    </div>
</template>

<script>
import { Utils } from 'weex-ui'
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import BannerSlider from '../components/BannerSlider.vue'
import FundPlazaList from '../components/Fund/FundPlazaList.vue'
import Refresher from '../components/Refresher.vue'

export default {
    name: '',
    components: {
        StatusBar,
        Refresher,
        WxcMinibar,
        BannerSlider,
        FundPlazaList
    },
    data () {
        return {
            loading: {
                messages: 'init',
            },
            statusBarStyle: {
                bgColor: '#fff',
            },
            title: this.$t('策略基金'),
            page: 1,
            size: 10,
            banners: [],
            items: []
        }
    },
    computed: {
        page_height () {
            return Utils.env.getPageHeight()
        }
    },
    watch: {
    },
    mounted () {
        this.init()
    },
    methods: {
        async init () {
            this.items = []
            this.page = 1
            this.loading.messages = 'loading'
            await this.getFunds()
            this.loading.messages = 'loaded'
        },
        async getFunds () {
            try {
                const res = await this.$fetch({
                    name: 'getFunds',
                    method: 'GET',
                    data: {
                        page: this.page,
                        size: this.size
                    }
                })

                if (res.error === 0) {
                    // if (res.result.banner_info.title) this.title = res.banner_info.title
                    // this.banners = res.banner_info.banners
                    this.items.push(...res.result.items)
                    this.banners = [res.result.banner_info]
                    this.page++
                    this.$el('list').resetLoadmore()
                }
            } catch (e) {
                // this.$notice.toast({message: e})
            }
        },
        getMoreItems () {
            if (this.loading.messages !== 'loaded') return
            return this.getFunds()
        }
    },
    filters: {
    }
}
</script>

<style scoped lang="less">
.middle_title {
    font-size: 36px;
    color: #434343;
    font-weight: bold;
    text-align: center;
    flex: 1;
}
</style>
