<template>
    <div class="coin_info_box">
        <div class="list" v-if="JSON.stringify(coin) !== '{}'">
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('简介') }}</text>
                    </div>
                    <div class="item_info_text">
                        <text :class="['info_text', show_more ? 'info_text_more' : 'info_text_limit']">{{ coin.description || $t('暂无信息') }}</text>
                        <div class="show_more" @click="toggleShowMore" v-if="coin.description && coin.description.length > 100">
                            <text class="more_text">{{show_more ? $t('收起') : $t('展开')}}</text>
                            <text :class="['icon', 'icon_more_text', show_more && 'icon_down']" class="">&#xe925;</text>
                        </div>
                    </div>
                    <div class="item_info_table">
                        <div class="info_table_hd">
                            <div class="table_item">
                                <text class="table_name">logo</text>
                                <div class="table_text logo_image_box">
                                    <image class=" logo_image" resize="cover" :src="coin.icon || default_coin_icon"></image>
                                </div>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('英文名') }}</text>
                                <text class="table_text">{{ coin.name }}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('发行时间') }}</text>
                                <text class="table_text">{{ coin.publish_date || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('算法') }}</text>
                                <text class="table_text">{{ coin.algorithm || '--'}}</text>
                            </div>
                        </div>
                        <div class="info_table_bd">
                            <div class="table_item">
                                <text class="table_name">{{ $t('中文名') }}</text>
                                <text class="table_text">{{ coin.cn || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('简称') }}</text>
                                <text class="table_text">{{ coin.symbol || '--'}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('上架交易所') }}</text>
                                <text class="table_text">{{coin.publish_count || $t('暂无')}}</text>
                            </div>
                            <div class="table_item">
                                <text class="table_name">{{ $t('共识机制') }}</text>
                                <text class="table_text">{{ coin.consensus || '--'}}</text>
                            </div>
                        </div>
                    </div>
                    <div class="item_info_items">
                        <div class="info_items">
                            <text class="table_name">{{ $t('官网链接') }}</text>
                            <div class="links_box" v-for="link in coin.websites" :key="link">
                                <text class="links" @click="goLink(link)">{{ link || '--'}}</text>
                            </div>
                            <div class="links_box" v-if="!coin.websites || !coin.websites.length">
                                <text class="links">--</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_name">{{ $t('区块链浏览器') }}</text>
                            <div class="links_box"  v-for="(link, index) in coin.browsers" :key="index">
                                <text class="links" @click="goLink(link)" >{{ $t('区块') }}{{ index+1 }}</text>
                            </div>
                            <div class="links_box" v-if="!coin.browsers || !coin.browsers.length">
                                <text class="links">--</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_name">{{ $t('论坛') }}</text>
                            <div class="links_box" v-for="(link, index) in coin.forums" :key="index">
                                <text class="links" @click="goLink(link)">{{ $t('论坛') }}{{ index+1 }}</text>
                            </div>
                            <div class="links_box" v-if="!coin.forums || !coin.forums.length">
                                <text class="links">--</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_name">{{ $t('白皮书') }}</text>
                            <div class="links_box" v-for="link in coin.white_papers" :key="link">
                                <text class="links" @click="goLink(link)">{{ $t('白皮书地址') }}</text>
                            </div>
                            <div class="links_box" v-if="!coin.white_papers || !coin.white_papers.length">
                                <text class="links">--</text>
                            </div>
                        </div>
                        <div class="info_items" v-for="link in coin.source_codes" :key="link">
                            <text class="table_name">GitHub{{ $t('仓库地址') }}</text>
                            <div class="links_box" >
                                <text class="links" @click="goLink(link)">{{ link || '--'}}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('公募信息') }}</text>
                    </div>
                    <div class="item_info_items">
                        <div class="info_items">
                            <text class="table_l_name">{{ $t('代币分配') }}</text>
                            <div class="table_r_box" >
                                <text ref="dist_token_div" :class="['table_text', (div_size.height > 30) ? 'txt_l' : '']">{{ coin.ico_info.distribution || '--'}}</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_l_name">ICO{{ $t('成本') }}</text>
                            <div class="table_r_box">
                                <text class="table_text">{{ coin.ico_info.amount || '--'  }}</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_l_name">{{ $t('募集资金') }}</text>
                            <div class="table_r_box">
                                <text ref="fund_div" class="table_text" :class="['table_text', (fund_size.height > 30) ? 'txt_l' : '']">{{ coin.ico_info.price || '--'  }}</text>
                            </div>
                        </div>
                        <div class="info_items">
                            <text class="table_l_name">{{ $t('时间') }}</text>
                            <div class="table_r_box">
                                <text class="table_text">{{ coin.ico_info.time || '--'  }}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('团队成员') }}</text>
                    </div>
                    <div class="item_info_team">
                        <div class="info_team_box" v-if="coin.people && coin.people.length" v-for="(person , index) in coin.people" @click="toggleTransLimit(index)" :key="index">
                            <div class="team_name_box">
                                <div class="header_img">
                                    <div class="team_img">
                                        <image class=" logo_header" resize="cover" :src="person.headimgurl || default_person_logo"></image>
                                    </div>
                                    <div class="team_name">
                                        <div class="related_box">
                                            <text class="zh_name">{{ person.name }}</text>
                                          <!--   <text class="related_text" v-if="person.projects && person.projects.length">{{ $t('他和') }}{{ person.projects.length }}{{ $t('个项目相关') }}</text> -->
                                        </div>
                                        <text class="job_name">{{ person.desc }}</text>
                                    </div>
                                </div>
                            </div>
                            <div class="team_intro_box" v-if="person.intro">
                                <text :class="['intro_box_text' , person.tram_limit ? 'info_team_limit' : '' ]" >{{ person.intro }}</text>
                            </div>
                            <div class="team_community_box">
                                <text class="icon icon_community" @click="goLink(person.linkedin)" v-if="person.linkedin">&#xe918;</text>
                                <text class="icon icon_community" @click="goLink(person.weibo)" v-if="person.weibo">&#xe912;</text>
                                <text class="icon icon_community" @click="goLink(person.twitter)" v-if="person.twitter">&#xe911;</text>
                                <text class="icon icon_community" @click="goLink(person.facebook)" v-if="person.facebook">&#xe917;</text>
                            </div>
                        </div>
                        <Loadmore v-if="!coin.people || !coin.people.length"  blankpagetype="text" loading="no"></Loadmore>
                    </div>
                </div>

            </div>
            <div class="cell">
                <div class="cell_item">
                    <div class="item_title">
                        <text class="title_line"></text>
                        <text class="title_text">{{ $t('路线图') }}</text>
                    </div>
                    
                    <div class="item_info_timeline">
                        <text class="road" v-if="coin.road_map">{{ coin.road_map}}</text>
                        <Loadmore v-else  blankpagetype="text" loading="no"></Loadmore>
                    </div>
                </div>
            </div>
        </div>
        <Loadmore :loading="loading.coin"></Loadmore>
    </div>
</template>
<script>
import SimpleFlow from './SimpleFlow.vue';
import { API_BaseUrl } from '../config/config.js'
import Loadmore from './Loadmore.vue'
import common from '../config/common'
const dom = weex.requireModule('dom')
export default {
    components: { SimpleFlow ,Loadmore },
    data() {
        return {
            show_more: false,
            default_coin_icon: `bmlocal://assets/images/default_coin_icon.png`,
            default_person_logo: `bmlocal://assets/images/default_header.jpg`,
            themeColor1: {
                lineColor: '#F7B237',
                pointInnerColor: '#fff',
                pointBorderColor: '#F7B237',
                highlightTitleColor: '#F7B237',
                highlightPointInnerColor: '#F7B237',
                highlightPointBorderColor: '#F7DCA5'
            },
            coin: {
                ico_info: {},
            },
            loading: {
                coin: 'init',
                base_info: 'init'
            },
            router_params: {},
            div_size: {},
            fund_size: {},
        }
    },
    props: {
        is_loadmore: {
            type: Boolean,
            default: false,
        },
    },
    created() {
        this.init();
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                this.$emit('Loadmoreing');
            },
            deep: true,
        },
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        toggleShowMore() {
            this.show_more = !this.show_more;
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                let coin = common.storageGetData("my_coininfo_"+ this.router_params.symbol_id); //缓存数据 在函数调用之前引入
                if(coin){
                    this.coin = coin;
                } else {
                    this.getCoinInfo();
                }
                this.$nextTick(() => {
                    let result = dom.getComponentRect(this.$refs.dist_token_div, option => {
                        this.div_size = option.size || {};
                    })
                    let fund_div = dom.getComponentRect(this.$refs.fund_div, option => {
                        this.fund_size = option.size || {};
                    })
                })
            })
        },
        getCoinInfo() {
            let params = {};
            params.symbol = this.router_params.symbol;
            params.symbol_id = this.router_params.symbol_id;
            params.block_cc_id = this.router_params.block_cc_id;
            this.loading.coin = 'loading';
            this.$fetch({
                url: `${API_BaseUrl}/api/coin/${params.symbol}/info`,
                method: 'GET',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.coin = 'loaded';
                    resData.result.ico_info = resData.result.ico_info || {};
                    for(let item of resData.result.people){
                        item.tram_limit = true;
                    }
                    this.coin = resData.result;
                     common.storageSetData("my_coininfo_"+ this.router_params.symbol_id, this.coin);//缓存数据 
                } else {
                    this.loading.coin = 'error';
                }
            }).catch((e) => {
                this.loading.coin = 'error';
                console.log(e.message)
            });
        },
        goLink(url) {
            this.$router.openBrowser(url);
        },
        toggleTransLimit(i) {
            this.coin.people[i].tram_limit = !this.coin.people[i].tram_limit;
        },
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
    font-family: iconfont2;
}

.coin_info_box {
    width: 750px;
    background-color: #fff;
}

.cell_item {}

.item_title {
    padding: 20px @padding_size;
    position: relative;
    flex-direction: row;
    background-color: @bgf4f5f6;
}

.title_line {
    width: 6px;
    height: 26px;
    background-color: #434343;
}

.title_text {
    margin-left: 15px;
    font-size: 24px;
    color: #434343;
    font-weight: bold;
}

.item_info_text {
    padding: @padding_size;
}

.info_text {
    line-height: 36px;
    font-size: 24px;
    color: #434343;
}

.info_text_limit {
    lines: 3;
    text-overflow: ellipsis;
}
.info_team_limit {
    lines: 4;
    text-overflow: ellipsis;
}

.info_text_more {}

.show_more {
    padding-top: 15px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.more_text {
    padding-right: 15px;
    font-size: 28px;
    color: @main_color;
}

.icon_more_text {
    font-size: 28px;
    color: @main_color;
    transform: rotate(0deg);
}

.icon_down {
    transform: rotate(180deg);
}

.item_info_table {
    flex-direction: row;
    border-top-width: 1px;
    border-color: #E7EAF1;
}

.info_table_hd {
    flex: 1;
    border-right-width: 1px;
    border-color: #E7EAF1;
}

.info_table_bd {
    flex: 1;
}

.table_item {
    padding-left: @padding_size;
    padding-right: @padding_size;
    height: 70px;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
    align-items: center;
}

.table_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 1;
}

.table_text {
    color: #434343;
    font-size: 24px;
    text-align: right;
    flex: 1;
}

.logo_image_box {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-direction: row;
    justify-content: flex-end;
}

.logo_image {
    width: 40px;
    height: 40px;
}

.info_items {
    padding: @padding_size;
    flex-direction: row;
    border-bottom-width: 1px;
    border-color: #E7EAF1;
}

.links_box {
    flex-direction: row;
}

.links {
    margin-left: 15px;
    color: #4464D3;
    font-size: 24px;
    flex: 1;
}

.team_name_box {}

.related_box {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.header_img {
    flex-direction: row;
    flex: 1;
    align-items: center;
}

.team_img {
    width: 75px;
    height: 75px;
    border-radius: 50%;
}

.logo_header {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    border-width: 1px;
    border-color: #eee;
}

.team_name {
    padding-left: 20px;
    flex: 1;
}

.zh_name {
    font-size: 30px;
    color: #434343;
}

.job_name {
    font-size: 24px;
    color: #9B9DA4;
}

.related_text {
    font-size: 24px;
    color: @main_color;
    text-align: right;
}

.item_info_team {
    padding: @padding_size;
}

.info_team_box {
    padding: @padding_size;
    border-width: 1px;
    border-color: #E7EAF1;
    border-radius: 10px;
    margin-bottom: 15px;
}

.team_intro_box {
    padding: 20px 0;
}

.intro_box_text {
    font-size: 24px;
    color: #434343;
    line-height: 43px;

}

.team_community_box {
    flex-direction: row;
}

.icon_community {
    margin-right: 70px;
    color: #BBBEC8;
}

.item_info_timeline {
    padding: @padding_size;
}

.road {
    font-size: 24px;
    color: #434343;
    line-height: 43px;
}
.table_l_name {
    color: #9B9DA4;
    font-size: 24px;
    text-align: left;
    flex: 1;
}
.table_r_box {
    flex-direction: row;
    flex: 3;
    padding-left: 15px;
}
.txt_l {
    text-align: left;
}
</style>
