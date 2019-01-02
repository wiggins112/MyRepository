<template>
    <div class="wrapper">
        <StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
        <wxc-minibar :title="$t('选择类型')"></wxc-minibar>
        <div class="content">
            <text class="hint">{{ $t('请选择反馈类型') }}</text>
            <list :style="{height: page_height}">
                <cell v-for="(item,item_index) in feedback_types" :key="item_index">
                    <div class="list">
                        <CellItem class="list_hd" @wxcCellClicked="showList(item_index)" :has-top-border="false" title="" titleIconSize="40" extraContent="" titlecolor="red">
                            <div slot="title" class="less_row">
                                <text v-if="item.sub.length" :class="['icon',(item.open)?'cell_left_downicon':'cell_left_upicon']">&#xe925</text>
                                <text class="type_text">{{item.main}}</text>
                            </div>
                        </CellItem>
                        <CellItem class="list_bd" v-if="item.open" v-for="(type,type_i) in item.sub" :key="type_i" @wxcCellClicked="handleChoose(type.text, item.id, type.id)" :has-top-border="false" :has-bottom-border="false" title="" titleIconSize="40" extraContent="" titlecolor="red">
                            <div slot="title" class="list_bd_text">
                                <text class="type_text">{{type.text}}</text>
                            </div>
                        </CellItem>
                    </div>
                </cell>
                <cell class="tabbar_height"></cell>
            </list>
        </div>
    </div>
</template>
<script>
import { Utils } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import CellItem from '../components/CellItem.vue'

export default {
    data: function() {
        return {
            feedback_types: [],
        }
    },
    components: {
        WxcMinibar,
        StatusBar,
        CellItem,
    },
    created() {
        this.init();
    },
    methods: {
        init() {
			this.getConfig();
        },
        getConfig() {
            let params = {};
            params.type = 'app_config';
            params.key = 'feedback_types';
            this.$fetch({
                name: 'getConfig',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
					let res = resData.result;
                    this.feedback_types = res.types || [];
                } else {
                    this.$notice.toast({ message: resData.message })
                }
            }).catch((e) => {
                console.log(e.message)
            });
        },
        goFeedbackType() {
            this.$router.open({
                name: 'FeedbackType'
            })
        },
        showList(i) {
            if (!this.feedback_types[i].sub.length) { //若是没有二级数据 则选择当前项 返回上个页面
                this.handleChoose(this.feedback_types[i].main, this.feedback_types[i].id);
            } else {
                this.feedback_types[i].open = !this.feedback_types[i].open;
            }
        },
        handleChoose(type, main_id, sub_id) {
            this.$router.setBackParams({
                choose_type: type,
                choose_main_id: main_id,
                choose_sub_id: sub_id
            })
            this.$router.back();
        },
    },
    computed: {
        page_height() {
            return Utils.env.getPageHeight();
        }
    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    color: #434343;
    font-family: iconfont2;
    font-size: 30px;
}


.right_icon {
    font-size: 36px;
    font-weight: bold;
    color: @main_color;
}

.hint {
    font-size: 28px;
    padding: 25px;
    color: #b4b5b9;
}

.list {
    margin-bottom: 14px;
}

.cell_left_upicon {
    position: absolute;
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(-90deg);
}

.cell_left_downicon {
    position: absolute;
    color: #9b9fa5;
    margin: 5px;
    font-size: 25px;
    transform: rotate(0deg);
}

.cell_left_text {
    color: #333333;
    font-size: 32px;
    padding-left: 15px;
}

.type_text {
    color: #333333;
    font-size: 32px;
    padding-left: 50px;
}

.list_bd {
    flex-direction: row;
    border-bottom-color: #eee;
    border-bottom-width: 1px;
}

</style>
