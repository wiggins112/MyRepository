<template>
	<div class="container">
		<StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
		<wxc-minibar :title="$t('反馈建议')">
			<text v-if="!input_suc" slot="right" class="icon right_icon" v-on:click.once="handleCommit">{{ $t('提交') }}</text>
		</wxc-minibar>
		<div class="content" v-if="!input_suc">
			<CellItem :has-arrow="true" @wxcCellClicked="goFeedbackType" title="" titleIconSize="40">
				<div slot="title" class="less_row">
					<text class="type_text">{{choose_type|| $t('反馈建议类型 ')}}</text>
					<text class="warn" v-if="!choose_type">*</text>
				</div>
			</CellItem>
			<textarea class="textarea" ref="textarea" lines="8" :placeholder="$t('请在此处输入您的反馈内容')" @input="oninput" @blur="onblur"></textarea>
			<text class="textarea_num">{{advise.length}}/{{feedback_word_limit}}</text>
			<UploadImage @link="getLink" limitNum="9"></UploadImage>
		</div>
		<div class="suc_box" v-if="input_suc">
			<image :src="post_img" class="suc_box_img"></image>
			<text class="suc_box_text">{{ $t('您的反馈已收到') }}，</text>
			<text class="suc_box_text">{{ $t('感谢您对币智慧支持') }}！</text>
			<text class="suc_box_link" @click="goBack">{{ $t('返回个人中心') }} ></text>
		</div>
		<div class="msg_qq">
			<text class="qq">{{feedback_kefu_qq}}</text>
		</div>
	</div>
</template>
<script>
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import UploadImage from '../components/UploadImage.vue'
import CellItem from '../components/CellItem.vue'
import { Iconfont, QINIU_CDN } from '../config/config.js'
export default {
	data: function() {
		return {
			choose_type: '',
			main_id: '',
			sub_id: '',
			advise: '',
			choose_image: [],
			input_suc: false,
			post_img: 'bmlocal://assets/images/feedback/post.png',
			feedback_types: [],
			feedback_word_limit: 200,
			feedback_title: this.$t('反馈建议类型'),
			feedback_placeholder: this.$t('请在此处输入您的反馈内容'),
			feedback_kefu_qq: '2582680058',
			choose_key: [],
		}
	},
	components: {
		WxcMinibar,
		StatusBar,
		UploadImage,
		CellItem,
	},
	props: {},
	created() {
		this.init();
	},
	eros: {
		beforeBackAppear(params) {
			if (params) {
				this.choose_type = params.choose_type;
				this.main_id = params.choose_main_id;
				this.sub_id = params.choose_sub_id;
			}
		}
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
					this.feedback_word_limit = res.word_limit || 200;
					this.feedback_title = res.types_title || this.$t('反馈建议类型');
					this.feedback_placeholder = res.placeholder || this.$t('请在此处输入您的反馈内容');
					this.feedback_kefu_qq = res.kefu_qq || '2582680058';
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
		oninput(event) {
			this.advise = event.value;
		},
		handleCommit() {
			this.$refs['textarea'].blur();
			if (!this.choose_type) {
				this.$notice.alert({
					message: this.$t('请选择反馈建议类型')
				})
				return;
			} else if (!this.advise) {
				this.$notice.alert({
					message: this.$t('请输入您的反馈内容')
				})
				return;
			} else if (this.advise.length > this.feedback_word_limit) {
				this.$notice.alert({
					message: this.$t('字数超过限制')
				})
				return;
			} else {
				if(!this.choose_image.length) {//若是没有选择图片 则直接上传空数组
					this.postUserFeedback();
				}else { //若是有上传图片 则得到token
					this.getCdnToken();
				}
			}
		},
		goBack() {
			this.$router.back();
		},
		getLink(arr) {
			this.choose_image = arr;
		},
		getCdnToken() {
			let params = {};
			this.$fetch({
				name: 'getCdnToken',
				method: 'GET',
				data: params,
			}).then(resData => {
				if (resData.error === 0) {
					this.uploadImage(resData.result);
				} else {
					this.$notice.toast({ message: resData.message });
				}
			}).catch((e) => {
				console.log(e.message);
			});
		},
		uploadImage(token) {
			this.$image.upload({
				url: 'http://upload.qiniu.com', // 自定义图片上传地址，默认上传地址是 eros.native.js 中的 image 地址
				params: {
					token: token, // 七牛云token
				},
				header: {}, // 自定义请求 header
				source: this.choose_image, // 图片路径
			}).then(resData => {
				for (let icon of resData) {
					this.choose_key.push(icon.key);
				}
				this.postUserFeedback();
			}, error => {
				this.$notice.toast({ message: resData.message })
			})
		},
		postUserFeedback() {
			let params = {};
			params.content = this.advise;
			params.files = this.choose_key;
			params.main_id = this.main_id;
			params.sub_id = this.sub_id;
			this.$fetch({
				name: 'postUserFeedback',
				method: 'POST',
				data: params
			}).then(resData => {
				if (resData.error === 0) {
					this.input_suc = true;
				} else {
					this.$notice.toast({ message: resData.message })
				}
			}).catch((e) => {
				console.log(e.message)
			});
		},
	},

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
	font-size: 30px;
	font-weight: bold;
	color: @main_color;
}

.bgfff {
	background-color: #fff;
}

.content {
	margin-top: 20px;
	background-color: #fff;
}

.type_text {
	color: #434343;
}

.textarea {
	font-size: 32px;
	height: 300px;
	padding: 25px;
	color: #434343;
}

.textarea_num {
	text-align: right;
	font-size: 28px;
	color: #cfd1d8;
	padding: 0 25px;
}

.msg_qq {
	position: absolute;
	bottom: 60px;
	left: 0;
	right: 0;
	justify-content: center;
}
.qq {
	text-align: center;
	font-size: 28px;
	color: #b4b5b9;
}
.suc_box {
	position: absolute;
	top: 129px;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #fff;
}

.suc_box_text {
	margin-top: 30px;
	font-size: 30px;
	color: #434343;
	text-align: center;
}

.suc_box_link {
	margin-top: 80px;
	font-size: 30px;
	color: #f7b237;
	text-align: center;
}

.suc_box_img {
	width: 224px;
	height: 258px;
	margin-left: 375px - 112px;
	margin-top: 160px;
}

</style>
