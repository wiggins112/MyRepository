<template>
    <div class="sentiment" v-if="percent">
        <div class="box" @click="toggleTip('is_benefit_tip')">
            <text :class="['icon', 'icon_tra_up', 'up', is_benefit && 'up_active']">&#xe90f;</text>
            <text :class="[ 'benefit_text' ,is_benefit && 'up_active']">{{ $t('利好') }}</text>
            <text class="tip benefit_tip" v-if="is_benefit_tip">+1</text>
        </div>
        <div class="total">
            <text :class="['benefit_percent', 'percent', is_benefit_less && 'less']" v-if="percent===100" :style=" {width: percent + 'px'} "></text>
            <text :class="['benefit_percent', is_benefit_less && 'less' ]" v-if="percent!==100" :style=" {width: percent + 'px'} "></text>
            <text :class="['empty_percent', 'percent', is_empty_less && 'less']" v-if="(100-percent)===100" :style="{ width: (100-percent) + 'px' }"></text>
            <text :class="['empty_percent', is_empty_less && 'less']" v-if="(100-percent)!==100" :style="{ width: (100-percent) + 'px' }"></text>
        </div>
        <div class="box" @click="toggleTip('is_empty_tip')">
            <text :class="['icon', 'icon_tra_up', 'down', is_empty && 'down_active']">&#xe90f;</text>
            <text :class="['empty_text', is_empty && 'down_active']">{{ $t('利空') }}</text>
            <text class="tip empty_tip" v-if="is_empty_tip">+1</text>
        </div>
        <DialogTaskDone v-if="show_dialog_task_done" :task="dialog_task" @closeDialog="closeTaskDone"></DialogTaskDone>
    </div>
</template>
<script>
import { WxcIcon } from 'weex-ui';

import filters from '../config/filters.js'
import { API_BaseUrl } from '../config/config.js'
import DialogTaskDone from './DialogTaskDone.vue'
export default {
    data() {
        return {
            filters,
            is_benefit: false,
            is_empty: false,
            is_benefit_tip: false,
            is_empty_tip: false,
            is_benefit_less: false,
            is_empty_less: false,
            dialog_task: '',
            show_dialog_task_done: false,
        }
    },
    props: {
        article: {
            type: Object,
            required: true,
        },
        type: {
            type: String,
            default: 'article'
        },
        from: {
            type: String,
            required: true
        }
    },
    created() {
        this.init();
    },
    watch: {
        'article': {
            handler(newValue) {
                this.init();
            },
            deep: true,
        },
    },
    methods: {
        init() {
            if (this.article.vote === 'voteup') {
                this.is_benefit = true;
            }
            if (this.article.vote === 'votedown') {
                this.is_empty = true;
            }
            this.setAutoStyle();
        },
        setAutoStyle() {
            if (this.percent >= 50) {
                this.is_benefit_less = false;
                this.is_empty_less = true;
            } else {
                this.is_benefit_less = true;
                this.is_empty_less = false;
            }
        },
        toggleTip(is_add_1) {
            let scenes = {
                detail: 0,
                index: 1,
                person: 2,
                coin_analyse: 3,
                fast: 4,
                notice: 5,
            }

            let scene = scenes[this.from];

            if (is_add_1 === 'is_benefit_tip') {
                this.postArticleBehavior({ behavior: 'voteup', scene });
            }
            if (is_add_1 === 'is_empty_tip') {
                this.postArticleBehavior({ behavior: 'votedown', scene });
            }

        },
        postArticleBehavior({ behavior, scene }) {
            let params = {};
            params.behavior = behavior;
            params.scene = scene;
            params.article_id = this.article.article_id || this.article._id;
            this.$notice.loading.show();
            this.$fetch({
                url: `${API_BaseUrl}/api/article/${params.article_id}/behavior`,
                method: 'POST',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    if (behavior === 'voteup') {
                        this.is_benefit = !this.is_benefit;
                        this.is_empty = false;
                        if (this.is_benefit) {
                            this.is_benefit_tip = true;
                            setTimeout(() => {
                                this.is_benefit_tip = false;
                            }, 500);
                        } else {
                            this.is_benefit_tip = false;
                        }
                    } else {
                        this.is_empty = !this.is_empty;
                        this.is_benefit = false;
                        if (this.is_empty) {
                            this.is_empty_tip = true;
                            setTimeout(() => {
                                this.is_empty_tip = false;
                            }, 500);
                        } else {
                            this.is_benefit_tip = false;
                        }
                    }
                    this.showTaskDialog('done_daily_vote'); // 每日任务：是否已经投票５篇文章以上
                } else {
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()

            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message)
            });
        },
        showTaskDialog(task) {
            this.dialog_task = task;
            this.show_dialog_task_done = true;
        },
    },
    computed: {
        percent() {
            let percent = this.article.sentiment.prob * 100;
            if (this.article.sentiment.type === 'pos') {
                return percent;
            } else {
                return 100 - percent;
            }
        },

    },
    components: {
        WxcIcon,
        DialogTaskDone,
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #97a1b7;
    font-family: iconfont2;
    font-size: 24px;
}

.sentiment {
    flex-direction: row;
    align-items: center;
    position: relative;
}

.total {
    width: 100px;
    height: 10px;
    margin: 10px;
    flex-direction: row;
}

.benefit_percent {
    position: absolute;
    height: 10px;
    background-color: #00c39c;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.empty_percent {
    position: absolute;
    height: 10px;
    right: 0;
    background-color: #f5593f;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-left: 1px;
}

.box {
    height: 90px;
    position: relative;
    flex-direction: row;
    align-items: center;
}

.benefit_text {
    flex-direction: row;
    color: #97a1b7;
    font-size: 26px;
}

.empty_text {
    flex-direction: row;
    color: #97a1b7;
    font-size: 26px;
}

.less {
    background-color: #e1e3e9;
}

.tip {
    font-size: 28px;
    top: 0px;
    right: 0px;
    position: absolute;
}

.empty_tip {
    color: #ffc7c7;
}

.benefit_tip {
    color: #b8e6ce;
}

.up {
    margin-right: 10px;
    color: #c9d1e2;
    font-size: 20px;
}

.up_active {
    color: #b8e6ce;
}

.down {
    margin-right: 10px;
    transform: rotate(180deg);
    color: #c9d1e2;
    font-size: 20px;
}

.down_active {
    color: #ffc7c7;
}

.percent {
    border-radius: 4px;
}

</style>
