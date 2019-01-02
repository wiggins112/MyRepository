<template>
    <div class="picker_box">
        <wxc-popup popup-color="#ffffff" :show="isBottomShow" @wxcPopupOverlayClicked="closePicker" pos="bottom" :height="height">
            <div class="picker_content">
                <div class="box_hd">
                    <text class="hd_text cancer" @click="closePicker">{{ $t('取消') }}</text>
                    <text class="hd_text title">{{title}}</text>
                    <text class="hd_text confirm" @click="confirm">{{ $t('确定') }}</text>
                </div>
                <div class="box_bd">
                    <scroller class="scroller" append="tree" offset-accuracy="10" @scroll="scrollHandler" :style="{ height: (height-80) + 'px' }">
                        <div class="pick_list">
                            <wxc-radio :list="pick_datas" @wxcRadioListChecked="wxcRadioListChecked"></wxc-radio>
                            <!-- <div :class="['pick_item', pick.selected && 'pick_item_active']"  v-for="(pick, index) in pick_datas" @click="selectedPick(pick)">
                                <text :class="['pick_text', pick.selected && 'pick_text_active']">{{pick.label}}{{pick.selected}}</text>
                            </div> -->
                        </div>
                    </scroller>
                </div>
            </div>
        </wxc-popup>
    </div>
</template>
<script>
import filters from '../config/filters.js'
import { WxcPopup, WxcRadio } from 'weex-ui';
export default {
    components: { WxcPopup, WxcRadio },
    data() {
        return {
            filters,
            isBottomShow: false,
            pos: {
                offsetX: 0,
                offsetY: 0,
                eventCnt: 0,
            },
            eventCnt: 0,
            hint: 0,
            pick_datas: [],
            currt_selected: {},
        }
    },
    props: {
        showPicker: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: '600'
        },
        pick_data: {
            type: Array,
            required: false,
        },
        title: {
            type: String,
            default: ''
        },
    },
    watch: {
        'showPicker': {
            handler() {
                this.isBottomShow = this.showPicker;
            },
            deep: true,
        },
        'pick_data': {
            handler() {
                this.initPickData();
            },
            deep: true,
        }
    },
    created() {
        this.isBottomShow = this.showPicker;
        this.initPickData();
    },
    methods: {
        handleLike() {

        },
        wxcRadioListChecked (e) {
            if (!e) return
            this.currt_selected = {
                index: e.index,
                value: e.value,
                title: e.title
            };
        },
        // selectedPick(pick) {
        //     for(let item of this.pick_datas) {
        //         if (item.label === pick.label) {
        //             item.selected = true;
        //         } else {
        //             item.selected = false;
        //         }
        //     }
        //     this.$notice.toast({ message: this.pick_datas });
        //     // this.$notice.toast({ message: pick });
        // },
        initPickData() {
            this.pick_datas = this.pick_data;
            if (this.pick_datas && this.pick_datas.length) {
                for(let pick of this.pick_datas) {
                    pick.selected = false;
                    pick.title = pick.label;
                    pick.value = pick.value;
                }
            }
        },
        openBottomPopup() {
            this.isBottomShow = true;
        },
        //非状态组件，需要在这里关闭
        closePicker(e) {
            this.isBottomShow = false;
            this.$emit('closePicker', e)
        },
        confirm() {
            this.closePicker();
            this.$emit('confirm', this.currt_selected)
        },
        scrollHandler: function(e) {
            // console.log(e.message);
            var nowCnt = this.eventCnt + 1;
            this.pos.eventCnt = nowCnt;
            this.pos.offsetX = e.contentOffset.x;
            this.pos.offsetY = e.contentOffset.y;
            this.hint = this.pos.offsetY;
        }
    },
    computed: {
        
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #9FA0A7;
    font-family: iconfont2;
    font-size: 24px;
}

.box_hd {
    flex-direction: row;
    justify-content: space-between;
    border-bottom-width: 2px;
    border-color: #ddd;
    align-items: center;
}
.title {
    text-align: center;
    flex: 1;
}
.cancer {
    width: 150px;
    text-align: left;
}
.confirm {
    width: 150px;
    color: @main_color;
    text-align: right;
}
.hd_text {
    padding: @padding_size;
    font-size: 24px;
}
.pick_list {

}
.pick_item {
    padding-top: @padding_size;
    padding-bottom: @padding_size;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}
.pick_text {
    font-size: 23px;
}
.pick_item_active {
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}
.pick_text_active {
    font-size: 25px;
    color: @main_color;
}
</style>
