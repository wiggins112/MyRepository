<template>
    <div class="rate_box">
        <div class="star_box">
            <div class="star_item" v-for="(item, i) in max" :key="i" @click="selectValue(item)" :style="{width: iconSize*1.5, height: iconSize*1.5}">
                <text :class="['icon', 'text', 'icon_star']" :style="getIconStyle(item)">{{icon}}</text>
                <text :class="['icon', 'text', 'icon_star', 'star_active']" :style="decimalStyle" v-if="showDecimalIcon(item)">{{icon}}</text>
            </div>
        </div>
        <div class="value_box">
            <slot name="value">
                <text class="text value_value" :style="{color: valueColor, fontSize: valueSize}">{{value*2 || ''}}</text>
            </slot>
        </div>
    </div>
</template>
<script>
import {Iconfont } from '../config/config.js'

export default {
    data() {
        return {
            currentValue: this.value,
            pointerAtLeftHalf: true,
        }
    },
    props: {
        // 分值
        value: {
            type: Number,
            default: 0
        },
        // 选中颜色
        activeColor: {
            type: String,
            default: '#ffd33c'
        },
        // 默认颜色
        defaultColor: {
            type: String,
            default: '#dadbdc'
        },
        valueColor: {
            type: String,
            default: '#6d98f0'
        },
        // 是否显示半颗星
        allowHalf: {
            type: Boolean,
            default: true
        },
        // 是否只读
        disabled: {
            type: Boolean,
            default: true
        },
        // 最大分值
        max: {
            type: Number,
            default: 5
        },
        // 图标
        icon: {
            type: String,
            default: `\ue933`
        },
        iconSize: {
            type: Number,
            default: 24
        },
        valueSize: {
            type: String,
            default: 30
        },
    },
    watch: {
        value(val) {
            this.currentValue = val;
            this.pointerAtLeftHalf = this.value !== Math.floor(this.value);
        }
    },
    beforeCreate() {
        var domModule = weex.requireModule('dom');
        domModule.addRule('fontFace', {
            'fontFamily': "iconfont2",
            'src': `url('${Iconfont}')`
        });
    },
    created() {
    },
    methods: {
        showDecimalIcon(item) {
            let showWhenDisabled = this.disabled && this.valueDecimal > 0 && item - 1 < this.value && item > this.value;
            /* istanbul ignore next */
            let showWhenAllowHalf = this.allowHalf &&
                this.pointerAtLeftHalf &&
                item - 0.5 <= this.currentValue &&
                item > this.currentValue;
            return showWhenDisabled || showWhenAllowHalf;
        },
        getIconStyle(item) {
            return {
                color: item <= this.currentValue ? this.activeColor : this.defaultColor,
                fontSize: this.iconSize,
                height: this.fontSize,
            };
        },
        selectValue(value) {
            if (this.disabled) {
                return;
            }
            if (this.allowHalf && this.pointerAtLeftHalf) {
                this.$emit('input', this.currentValue);
                this.$emit('change', this.currentValue);
            } else {
                this.$emit('input', value);
                this.$emit('change', value);
            }
        },

    },
    computed: {
        decimalStyle() {
            let width = '';
            if (this.disabled) {
                width = `${ this.valueDecimal < 50 ? 0 : this.iconSize/2 }px`;
            }
            if (this.allowHalf) {
                width = this.iconSize / 2;
            }
            return {
                color: this.activeColor,
                width,
                height: this.fontSize,
                fontSize: this.iconSize,
            };
        },
        valueDecimal() {
            return this.value * 100 - Math.floor(this.value) * 100;
        },
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}

.rate_box {
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.star_box {
    position: relative;
    top: 2px;
    padding: 0 15px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.value_value {
    font-weight: bold;
}

.star_item {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 40px;
    height: 40px;
    line-height: 40px;
}

.icon_star {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    color: #dadbdc;
}

.star_active {}

</style>
