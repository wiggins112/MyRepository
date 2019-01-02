<template>
    <text class="price-tips" :style="{top, left}">{{ title }}</text>
</template>

<script>
export default {
    name: '',
    data () {
        return {
        }
    },
    props: ['top', 'left', 'title'],
    computed: {
    },
    watch: {
    },
    mounted () {
    },
    methods: {
    },
    filters: {
    },
    components: {
    }
}
</script>

<style scoped>
.price-tips {
    position: absolute;
    font-size: 20px;
    height: 36px;
    padding-top: 8px;
    padding-right: 16px;
    padding-bottom: 8px;
    padding-left: 16px;
    color: #fff;
	background-color: #f5593f;
	border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 18px;
    opacity: 0.8;
}
</style>
