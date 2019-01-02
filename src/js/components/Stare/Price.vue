<template>
    <div class="box">
        <div class="name">
            <text class="name-p1">{{ name1 | lazy }}</text>
            <text class="name-p2">{{ name2 | lazy  }}</text>
        </div>
        <div class="price">
            <text class="price-p1" :style="{color: riseP1Color}">{{ price1 | lazy  }}</text>
            <text class="price-p2" :style="{color: riseP1Color}">= {{ price2 | lazy  }}</text>
        </div>
        <div class="rise">
            <text class="rise-p1" :style="{color: riseP1Color}">{{ rise1 | lazy  }}</text>
            <text class="rise-p2" :style="{color: riseP1Color}">{{ rise2 | lazy }}</text>
        </div>
    </div>
</template>

<script>
export default {
    name: '',
    data () {
        return {
        }
    },
    props: ['name1', 'name2', 'price1', 'price2', 'rise1', 'rise2'],
    computed: {
        riseP1Color () {
            return String(this.rise1).includes('-')? '#f5593f' : '#00c39c'
        }
    },
    filters: {
        lazy (val) {
            if (val === undefined) return '--'
            return val
        }
    }
}
</script>

<style scoped>
.box {
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    height: 140px;
    width: 750px;
    flex-direction: row;
    padding: 40px;
}
.name {
    flex: 1.75;
}
.price {
    flex: 1.5;
}
.rise {
    flex: 1;
}

.name-p1, .price-p1, .rise-p1 {
    padding: 10px 0;
    font-size: 30px;
    font-weight: bold;
}
.name-p2, .price-p2, .rise-p2 {
    font-size: 22px;
}

.name-p1, .name-p2 {
	color: #434343;
}
.rise-p2 {
	color: #00c39c;
}
</style>
