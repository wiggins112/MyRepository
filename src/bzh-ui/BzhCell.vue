<template>
    <div @click="cellClicked">
        <div class="box">
            <div class="item" :style="{height: height}">
                <slot name="l"></slot>
            </div>
            <div class="item" :style="{height: height}">
                <slot name="m"></slot>
            </div>
            <div class="item" :style="{height: height}">
                <slot name="r"></slot>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: '',
    data () {
        return {
        }
    },
    props: ['height'],
    computed: {
    },
    watch: {
    },
    mounted () {
    },
    methods: {
        cellClicked (e) {
            this.$emit('clickLine', { e });
        }
    },
    filters: {
    },
    components: {
    }
}
</script>

<style scoped>
.box {
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
.item {
    align-items: center;
    justify-content: center;
    flex-direction: row;
}
</style>
