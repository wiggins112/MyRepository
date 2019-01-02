<template>
    <refresh class="refresh" @refresh="onrefresh" @pullingdown="onpullingdown" :display="showRefresh ? 'show' : 'hide'" :style="{height: height}">
        <image class="loading_icon" :src="pulldownloading" :style="{'transform': 'rotate(360deg)'}" v-if="refreshing" />
        <image class="refresh_icon" :src="pulldown" :style="{'transform': 'rotate(' + (pullingDistance - height - 30)*6 + 'deg)'}" v-else/>
        <loading-indicator class="loading-indicator" v-if="showRefresh">
        </loading-indicator>
        <text class="refreshing_text">{{refreshText}}</text>
    </refresh>
</template>
<script>
export default {
    data() {
        return {
            pulldown: `bmlocal://assets/images/loading/pulldown.png`,
            loading_gif: `bmlocal://assets/images/loading.gif`,
            pulldownloading: `bmlocal://assets/images/loading/pulldownloading.gif`,
            showRefresh: false,
            refreshText: this.$t('下拉刷新'),
            refreshing: false,
            pullingDistance: '', //下拉距离,
            height: 150, // 下拉刷新的高度
        }
    },
    props: {
        handrefresh: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: String,
            default: '',
        },
        loadingText: {
            type: String,
            default: '正在加载',
        },
        pulldownText: {
            type: String,
            default: '下拉刷新',
        },
        pulldowningText: {
            type: String,
            default: '松开立即刷新',
        },
    },
    watch: {
        'handrefresh': {
            handler() {
                this.showRefresh = this.handrefresh;
            },
            deep: true,
        },
        'showRefresh': {
            handler() {
                if (!this.loading) {
                    this.refreshDown();
                }
            },
            deep: true,
        },
        'loading': {
            handler() {
                this.refreshDown();
            },
            deep: true,
        }
    },
    created() {
        this.refreshText = this.$t(this.pulldownText) || this.$t('下拉刷新');
        this.showRefresh = this.handrefresh;
    },
    methods: {
        loadingAniDown() {
            this.refreshing = false;
            this.$emit('refreshEnd', {
                status: 'refreshEnd'
            })
            this.showRefresh = false;
            setTimeout(() => {
                this.refreshing = false;
                this.pullingDistance = 0;
                this.refreshText = this.$t(this.pulldownText);
            }, 500)
        },
        onrefresh() {
            this.refreshText = this.$t(this.loadingText);
            this.refreshing = true;
            this.showRefresh = true;
            this.$emit('refresh', {
                status: 'refreshing'
            });
        },
        onpullingdown(event) {
            this.$emit('onpullingdown', event);
            var pullingDistance = event.pullingDistance;
            if (pullingDistance < 0) {
                pullingDistance = pullingDistance * -1;
            }
            if (pullingDistance > this.height) {
                pullingDistance = this.height;
            }
            if (pullingDistance < this.height - 30) {
                pullingDistance = this.height - 30;
            }
            if (pullingDistance >= this.height - 30) {
                this.pullingDistance = pullingDistance;
            }
            if (!this.refreshing && pullingDistance == this.height) {
                if (pullingDistance < this.height) {
                    this.refreshText = this.$t(this.pulldownText);
                } else {
                    this.refreshText = this.$t(this.pulldowningText);
                }
            }
        },
        refreshDown() {
            if (this.refreshing) {
                if (this.loading && this.loading !== 'loading') {
                    setTimeout(() => {
                        this.loadingAniDown();
                    }, 500)
                } else {
                    setTimeout(() => {
                        this.loadingAniDown();
                    }, 1000)
                }
            }
        },
    }
}

</script>
<style scoped>
/** 下拉刷新样式 */

.refresh {
    justify-content: center;
    align-items: center;
}

.refreshing_text {
    width: 750px;
    color: #B2B2B2;
    font-size: 24px;
    line-height: 24px;
    text-align: center;
}

.refresh_icon {
    height: 40px;
    width: 40px;
    margin-bottom: 20px;
    transition-property: transform;
    transition-duration: 0.1s;
    transition-timing-function: linear;
}

.loading_icon {
    height: 40px;
    width: 40px;
    margin-bottom: 20px;
    /*transition-property: transform;
    transition-duration: 1.5s;
    transition-timing-function: linear;*/
}

.loading-indicator {
    opacity: 0;
    height: 0px;
    width: 0px;
}

</style>
