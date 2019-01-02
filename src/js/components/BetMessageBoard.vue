<template>
    <div class="message_box">
        <div class="message_list">
            <div class="cell_box" v-for="(comment, i) in comments" :key="i">
                <image class="user_image" :src="comment.userinfo.headimgurl || default_header" />
                <div class="DiscussBox">
                    <text class="name">{{comment.userinfo.nickname}}</text>
                    <text class="Discuss">{{comment.content}}</text>
                    <div class="DiscussTime">
                        <text class="colora4">{{filters.getFormatMoment(comment.created_at)}}</text>
                        <div class="like_num" @click="toggleLike(comment)">
                            <text :class="['icon','colora4','icon_heart',comment.is_like?'colorred':'']" >{{comment.is_like ? '&#xe93d;' : '&#xe93e;'}}</text>
                            <text class="colora4">（{{comment.like_count || 0}}）</text>
                        </div>
                    </div>
                </div>
            </div>
            <Loadmore :loading="loading.comments" :empty="$t('快来抢沙发吧~')" :nomore="$t('加载完了~')"></Loadmore>
        </div>
        <div class="input_wrap" :style="{height: input_wrap_height}">
            <div class="input_box">
                <div class="textarea">
                    <textarea class="input phone" :placeholder="$t('说说你的见解')" v-model="message_content" :autofocus="false" @focus="inputOnfocus" @blur="inputOnblur" />
                </div>
                <text class="send" @click="enterPostMessage">{{ $t('发送') }}</text>
            </div>
        </div>
    </div>
</template>
<script>
import Loadmore from './Loadmore.vue'
import filters from '../config/filters.js'

export default {
    components: {
        Loadmore,
    },
    data() {
        return {
            is_ios: weex.config.env.platform === 'iOS' ? true : false,
            filters,
            default_header: 'bmlocal://assets/images/default_header.jpg',
            message_content: '',
            loading: {
                comments: 'loading',
            },
            page: {
                comments: 1,
            },
            size: {
                comments: 20,
            },
            comments: [],
            router_params: {},
            input_wrap_height: 100,
            keyborderHeight: 570,
        }
    },
    props: {
        Active: {
            type: Boolean,
            default: false,
        },
        is_loadmore: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        'is_loadmore': {
            handler(newValue) {
                if (newValue) {
                    // 触发滚到底部加载更多
                    this.getMoreComments();
                    this.$emit('Loadmored');
                }
            },
            deep: true,
        },
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.getRouterParams();
        },
        enterPostMessage(event) {
            this.postComment();
        },
        inputOnfocus(e) {
            if (this.is_ios) {
                return;
            }
            this.input_wrap_height = 100 + this.keyborderHeight;
        },
        inputOnblur() {
            if (this.is_ios) {
                return;
            }
            this.input_wrap_height = 100;
        },
        getRouterParams() {
            this.$router.getParams().then(resData => {
                this.router_params = resData;
                this.getComments();
            })
        },
        toggleLike(comment) {
            let params = {};
            if (comment.is_like) {
                params.topic_id = this.router_params.bet_id;
                params.action = 'unlike';
                params.comment_id = comment._id;
                this.putCommentLike(params).then((response) => {
                    let res = response;
                    comment.is_like = false;
                    comment.like_count -= 1;
                })
            } else {
                params.topic_id = this.router_params.bet_id;
                params.action = 'like';
                params.comment_id = comment._id;
                this.putCommentLike(params).then((response) => {
                    let res = response;
                    comment.is_like = true;
                    comment.like_count += 1;
                })
            }
        },
        getMoreComments() {
            if (this.loading.comments !== 'loaded') {
                return;
            }
            this.page.comments++;
            this.getComments();
        },
        getComments() {
            let params = {};
            params.topic_id = this.router_params.bet_id;
            params.topic_type = 'bet';
            params.page = this.page.comments;
            params.size = this.size.comments;
            this.loading.comments = 'loading';
            this.$fetch({
                name: 'getComments',
                method: 'GET',
                data: params
            }).then(resData => {
                if (resData.error === 0) {
                    this.loading.comments = 'loaded';
                    for(let item of resData.items) {
                        item.like_count = item.like_count || 0;
                    }
                    if (params.page > 1) {
                        if (!resData.items.length) {
                            this.loading.comments = 'nomore';
                        }
                        this.comments.push(...resData.items);
                    } else {
                        if (!resData.items.length) {
                            this.loading.comments = 'empty';
                        }
                        this.comments = resData.items;
                    }
                } else {
                    this.loading.comments = 'error';
                    this.$notice.toast({ message: resData.comments })
                }

            }).catch((e) => {
                this.loading.comments = 'error';
                console.log(e.message)
            });
        },
        putCommentLike(params) {
            this.$notice.loading.show();
            return this.$fetch({
                name: 'putCommentLike',
                method: 'PUT',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {

                } else {
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message);
            });
        },
        postComment() {
            let params = {};
            params.topic_id = this.router_params.bet_id;
            params.topic_type = 'bet';
            params.content = this.message_content;
            this.$notice.loading.show();
            return this.$fetch({
                name: 'postComment',
                method: 'POST',
                data: params,
            }).then(resData => {
                if (resData.error === 0) {
                    this.message_content = '';
                    this.page.comments = 1;
                    this.getComments();
                } else {
                    this.$notice.toast({ message: resData.message })
                }
                this.$notice.loading.hide()
            }).catch((e) => {
                this.$notice.loading.hide()
                console.log(e.message);
            });
        },
    },
    computed: {

    }
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');

.icon {
    font-family: iconfont2;
}

.message_box {
    margin-top: 20px;
    padding-bottom: 300px;
}

.user_image {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    margin-right: 22px;
}

.cell_box {
    flex-direction: row;
    padding: 0 30px;
    margin-bottom: 20px;
}

.DiscussBox {
    color: #a4abba;
    flex: 1;
    padding: 17px 25px;
    background-color: white;
}

.name {
    color: #a4abba;
    font-size: 28px;
}

.Discuss {
    color: #666;
    font-size: 30px;
    line-height: 40px;
    margin: 10px 0 30px;
}

.colora4 {
    color: #a4abba;
    font-size: 26px;
}

.DiscussTime {
    flex-direction: row;
    justify-content: space-between;
}

.like_num {
    flex-direction: row;
}

.input_wrap {
    background-color: #fff;
    height: 100px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
}
.input_box {
    padding: 0 20px;
    height: 100px;
    padding: 0 20px;
    flex-direction: row;
    align-items: center;
    border-top-width: 1px;
    border-color: #E7EAF1;
}
.textarea {
    padding: 10px 30px;
    height: 70px;
    line-height: 70px;
    border-width: 1px;
    border-color: #ddd;
    flex: 1;
    flex-direction: row;
    border-radius: 70px;
    align-items: center;
    justify-content: center;
}
.input {
    flex: 1;
    padding-top: 15px;
    height: 70px;
    line-height: 70px;
    background-color: transparent;
    font-size: 28px;
    color: #a4abba;
}

.send {
    width: 150px;
    color: #5b7ae3;
    font-size: 28px;
    text-align: center;
    height: 70px;
    line-height: 70px;
    background-color: @main_color;
    color: #fff;
    border-radius: 70px;
    margin-left: 20px;
}
.icon_heart {
    font-size: 30px;
}
.colorred{color: #E94D63;}
</style>
