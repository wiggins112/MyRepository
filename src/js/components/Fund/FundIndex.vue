<template>
    <scroller scroll-direction="horizontal" class="slider" :offset-accuracy="300">
        <div
            v-for="(i, index) in items"
            :key="index"
        >
            <FundIndexList
                :item="i"
                :pageIndex="index + 1"
            />
        </div>
    </scroller>
</template>

<script>
import { Utils } from 'weex-ui'
import FundIndexList from './FundIndexList.vue'

export default {
    name: '',
    components: {
        FundIndexList
    },
    data () {
        return {
            page: 1,
            size: 10,
            items: []
        }
    },
    computed: {
    },
    watch: {
    },
    mounted () {
        this.init()
    },
    methods: {
        async init () {
            await this.getFunds()
        },
        async getFunds () {
            try {
                const res = await this.$fetch({
                    name: 'getFunds',
                    method: 'GET',
                    data: {
                        page: 1,
                        size: 10,
                        index: true
                    }
                })

                if (res.error === 0) {
                    this.items = res.result.items
                }
            } catch (e) {
            }
        },
        async getMoreFunds () {
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
                    this.items.push(...res.result.items)
                }
            } catch (e) {
            }
        }
    },
    filters: {
    }
}
</script>

<style scoped lang="less">
.slider {
    height: 235px;
    flex-direction: row;
}
</style>
