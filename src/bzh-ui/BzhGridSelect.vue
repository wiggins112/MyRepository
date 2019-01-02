<template>
    <div class="box" @click="s()"
        :style="{ borderColor: value ? aColor : bgColor, width }">
        <slot></slot>
        <div class="icon" :style="{ backgroundColor: value ? aColor : 'transparent' }"></div>
        <image class="icon-img" :src="img" alt="icon" />
    </div>
</template>

<script>
/**
 * @param {boolean} value 是否选中 true or false
 * @param {string} color 边框颜色
 * @param {string} activeColor 选中颜色, 默认 #f7b237
 * @param {string} 宽度(必须), 默认 200px
 * @param {string} 左上角 icon 图片 url, 宽 20px, 高 20px
 */
export default {
    name: 'BzhGridSelect',
    data () {
        return {
            img: this.src || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACKSURBVDhP7ZPZCYAwEAVTQkpICSnZkizFDuKOvAUVgjnArwwsOXbfIAHDoptSSrKKOs5homx1WO3T0psMWJNa/Vj4Lctq9UNYEvhZZgPVdyAsCTTJttogd+pB25dpEB4B9rqDb5nDoAJwBVX9MoeAgsA6LnMISuCMyxwT8Kb8TvMyx0QRsY6LGiGc5oogIl93HOcAAAAASUVORK5CYII='
        }
    },
    props: ['value', 'color', 'activeColor', 'width', 'src'],
    computed: {
        bgColor () {
            return this.color || '#ffefd2'
        },
        aColor () {
            return this.activeColor || '#f7b237'
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

<style scoped>
.box {
    position: relative;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
	border-style: solid;
    border-width: 3px;
}
.icon {
    position: absolute;
    top: -23px;
    left: -23px;
    width: 46px;
    height: 46px;
    transform: rotate(-45deg);
}
.icon-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
}
</style>
