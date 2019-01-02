<template>
    <div class="task_box">
        <slot>
            <div class="box" @click="taskClick">
                <div class="box_hd">
                    <image class="image" :src="task.icon_image"/>
                    <text class="name_text">{{task.name}}</text>
                </div>
                <div class="box_bd">
                    <text class="intro_text">{{task.intro}}</text>
                </div>
                <div class="box_ft">
                    <div class="btn_box" v-if="!task.active">
                        <text class="btn_text">{{task.btn_text}}</text>
                    </div>
                    <div class="btn_box btn_box_done" v-if="task.active">
                        <text class="icon btn_icon_text btn_box_done_icon">&#xe920;</text>
                        <text class="btn_text btn_box_done_text">{{ $t('今天已领取') }}</text>
                    </div>
                </div>
            </div>
        </slot>
    </div>
</template>
<script>
export default {
    data() {
        return {

        }
    },
    props: {
        task: {
            type: Object,
            default: {}
        },
    },
    created() {

    },
    methods: {
        taskClick() {
            this.$emit('taskClick', this.task);
        },
    },
    computed: {

    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}

.task_box {
    border-top-width: 1px;
    border-right-width: 1px;
    border-color: #eee;
    width: 250px;
    height: 240px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.box {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.box_hd {
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.image {
    width: 75px;
    height: 75px;
}

.name_text {
    padding-left: 20px;
    font-size: 30px;
    color: #434343;
    font-weight: bold;
}

.box_bd {
    padding: 20px 0;
}

.intro_text {
    font-size: 24px;
    color: #9B9DA4;
}

.box_ft {
    
}
.btn_box {
    width: 180px;
    height: 48px;
    background-image: linear-gradient(to right, #F86CA6, #FBAC54);
    border-radius: 6px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.btn_box_done {
    background-image: none;
    background-color: transparent;
}
.btn_text {
    text-align: center;
    color: #fff;
    font-size: 24px;
}
.btn_box_done_text {
    color: #434343;
}
.btn_box_done_icon {
    color: #17CE8B;
}
.btn_icon_text {
    padding-right: 10px;
    text-align: center;
    color: #fff;
    font-size: 24px;
}

</style>
