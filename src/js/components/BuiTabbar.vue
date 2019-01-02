<template>
    <div :style="getContainerStyle()">
        <div :key="index" v-for="(item,index) in tabItems" :style="getItemStyle(item, index)" @click="itemClick($event,item,index)">
            <bui-icon v-if="item.icon" :name="item.icon" :color="index === value ? selectedColor : normalColor" @click="itemClick($event,item,index)" :size="iconSize + 'px'"></bui-icon>
            <text v-if="item.title" :style="getTitleStyle(item, index)" @click="itemClick($event,item,index)">{{ item.title }}</text>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: {
        tabItems: { default: [] },
        value: { type: Number, default: 0 },
        height: { default: 96 },
        iconSize: { default: 45 },
        titleSize: { default: 36 },
        background: { default: '#ffffff' },
        selectedBackground: { default: '#ffffff' },
        normalColor: { default: '#434343' },
        selectedColor: { default: '#434343' },
        borderBottomColor: { default: '#F7B237' },
        borderBottomWidth: { default: '7px' },
        containerStyle: { default: function() { return {} } },
        itemStyle: { default: function() { return {} } },
        showSelectedLine: { default: true },
        fontWeight: { default: 'bold' },
    },
    methods: {
        "getContainerStyle": function() {
            //合并样式
            var style = { 'flex-direction': 'row', 'justify-content': 'space-around', 'border-bottom-width': '1px', 'border-bottom-color': '#ddd', 'height': this.height + 'px' };
            style = Object.assign(style, this.containerStyle);
            return style;
        },
        "getItemStyle": function(item, index) {
            const selected = index === this.value;

            const backgroundColor = selected ? this.selectedBackground : this.background;
            const borderBottomColor = (selected && this.showSelectedLine) ? this.borderBottomColor : backgroundColor;
            let arrTitleLength = [];
            let tlength = null;
            for (let tab of this.tabItems) {
                let titleLength = tab.title.length;
                tlength = titleLength;
                arrTitleLength.push(titleLength);
            }
            let equation = arrTitleLength.filter((k) => {
                return k === tlength;
            });
            let style = {};
            if (equation.length === this.tabItems.length) {
                style = {
                    'flex': 1,
                    'align-items': 'center',
                    'justify-content': 'center',
                    'backgroundColor': backgroundColor,
                };
            } else {
                style = {
                    'align-items': 'center',
                    'justify-content': 'center',
                    'backgroundColor': backgroundColor,
                };
            }

            return Object.assign(style, this.itemStyle);
            return style;
        },
        "getTitleStyle": function(item, index) {
            const selected = index === this.value;
            const backgroundColor = selected ? this.selectedBackground : this.background;
            const borderBottomColor = (selected && this.showSelectedLine) ? this.borderBottomColor : backgroundColor;
            var style = {
                'color': selected ? this.selectedColor : this.normalColor,
                'font-size': this.titleSize + 'px',
                'font-weight': this.fontWeight,
                'border-bottom-width': this.borderBottomWidth,
                'border-bottom-style': 'solid',
                'height': this.height,
                'line-height': this.height,
                'border-bottom-color': borderBottomColor,

            };
            return style;
        },
        "itemClick": function(e, item, index) {
            this.value = index;
            this.$emit('input', index);
            this.$emit('change', index);
        }
    }
}

</script>
