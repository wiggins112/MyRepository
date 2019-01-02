<template>
    <div class="box" @click="s()"
        :style="{
            backgroundColor: value ? bgColor : '#f3f5f8',
            borderColor:  value ? 'transparent' : '#e7eaf1'
            }">
        <div class="btn" :style="{left: value ? '33px' : '1px'}"></div>
    </div>
</template>

<script>
export default {
    name: '',
    data () {
        return {
        }
    },
    props: ['value', 'color'],
    computed: {
        bgColor () {
            return this.color || '#f6d070'
        }
    },
    watch: {
    },
    mounted () {
    },
    methods: {
        s () {
            this.$emit('input', !this.value)
        }
    },
    filters: {
    },
    components: {
    }
}
</script>

<style scoped lang="less">
.box {
    position: relative;
	width: 92px;
	height: 60px;
    border-radius: 30px;
    border-style: solid;
    border-width: 3px;

    transition-property: backgroundColor;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
}
.btn {
    position: absolute;
    width: 52px;
    height: 52px;
    top: 1px;
    border-radius: 26px;
	background-color: #fff;
    
    transition-property: left;
    transition-duration: 0.2s;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
}
</style>
