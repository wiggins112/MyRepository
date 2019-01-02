<template>
    <div class="box" :style="{
        backgroundColor: value === label ? bgColor : '#fff',
        borderColor:  value === label ? 'transparent' : '#e7eaf1'
        }"
        @click="s()">
        <div class="box-inner"></div>
    </div>
</template>

<script>
/**
 * @param {*} value 当前选择的值
 * @param {*} label 该选项的值
 * @param {string} color 颜色, 默认 '#f6d070'
 */
export default {
    name: '',
    data () {
        return {
        }
    },
    props: ['value', 'label', 'color', 'disabled'],
    computed: {
        bgColor () {
            return this.color || '#f6d070'
        }
    },
    watch: {
        // value (val) {
        //     if (val === this.label) this.$emit('true')
        // }
    },
    methods: {
        s () {
            if (this.disabled) return
            if (this.$attrs.hasOwnProperty('cancel') && this.value === this.label) {
                this.$emit('input', false)
                return
            }
            // 这里是不等于，this.$emit('input', this.label) 后才等于
            if (this.value !== this.label) this.$emit('clickTure')
            this.$emit('input', this.label)
        }
    }
}
</script>

<style scoped>
.box {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    border-style: solid;
    border-width: 3px;
    position: relative;
    margin: 0 15px;
}
.box-inner {
    background-color: #fff;
    position: absolute;
    left: 7px;
    top: 7px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
</style>
