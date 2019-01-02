<template>
	<div class="wrapper">
		<StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
		<wxc-minibar :title="$t('个人设置')">
			<text slot="right" class="icon right_icon" @click="confirmPutUserInfo">{{ $t('完成') }}</text>
		</wxc-minibar>
		<div class="items">
			<div class="box">
				<text class="text">{{ $t('名字设置') }}</text>
			</div>
			<div class="box">
				<input type="text" :placeholder="$t('昵称')" class="input_name" v-model="input_username" />
				<text class="icon icon_clear_text" @click="clearName" v-if="input_username.length">&#xe932;</text>
			</div>
		</div>
		<div class="items">
			<div class="box">
				<text class="text">{{ $t('头像设置') }}</text>
			</div>
			<div class="box image ">
				<div class="user_image">
					<image class="user_image" resize="color" :src="user_info.headimgurl || default_header"></image>
					<div class="iamge_mask" @click="pickImage">
						<text class="icon icon_upload">&#xe931;</text>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
let _self;
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { Iconfont } from '../config/config.js'

export default {
	data: function() {
		return {
			default_header: `bmlocal://assets/images/default_header.jpg`,
			input_username: '',
			headimgurl: '',
			is_operator: false,
			user_info: {},
			headimg_source: [],
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
		_self = this;
		this.init();
	},
	methods: {
		init() {
			this.getUserInfo();
		},
		getUserInfo() {
			this.user_info = this.$storage.getSync('user_info') || {};
			this.input_username = this.user_info.nickname || this.user_info.phone;
		},
		goSetting() {
			this.$router.open({
				name: 'Settings',
			})
		},
		putUserInfo() {
			let params = {};
			params.nickname = this.input_username;
			if (this.headimgurl) {
				params.headimgurl = this.headimgurl;
			}
			this.$notice.loading.show();
			this.$fetch({
				name: 'putUserInfo',
				method: 'PUT',
				data: params,
			}).then(resData => {
				if (resData.error === 0) {
					resData.result.is_login = true;
					this.$storage.setSync('user_info', resData.result);
					this.$router.back();
				} else {
					this.$notice.toast({ message: resData.message });
				}
				this.$notice.loading.hide()

			}).catch((e) => {
				this.$notice.loading.hide()
				console.log(e.message);
			});
		},
		toggleOperator() {
			this.is_operator = !this.is_operator;
		},
		clearName() {
			this.input_username = '';
		},
		confirmPutUserInfo() {
			if (this.headimg_source.length) {
				this.putHeaderImage();
			} else {
				this.putUserInfo();
			}
		},
		putHeaderImage() {
			this.getCdnToken();
		},
		getCdnToken() {
			let params = {};
			params.prefix = 'headimg/';
			this.$fetch({
				name: 'getCdnToken',
				method: 'GET',
				data: params,
			}).then(resData => {
				if (resData.error === 0) {
					this.token = resData.result;
					this.UploadImage(this.token);
				} else {
					this.$notice.toast({ message: resData.message });
				}
			}).catch((e) => {
				console.log(e.message);
			});
		},
		pickImage() {
			// 选择图片在页面上显示，不上传
			this.$image.pick({
					maxCount: 1,
					imageWidth: 800,
					allowCrop: true
				})
				.then(resData => {
					if (resData.length) {
						// 在页面上显示选择的图片
						this.user_info.headimgurl = resData[0];
						this.headimg_source = resData;
					}
				}, error => {
					console.log(error)
			})
		},
		UploadImage(token) {
			// 上传已选的图片
			this.$image.upload({
			    url: 'http://upload.qiniu.com', // 自定义图片上传地址，默认上传地址是 eros.native.js 中的 image 地址
			    params: {
					token: token, // 七牛云token
				}, // 传递的参数
				header: {}, // 自定义请求 header
			    source: this.headimg_source // 图片路径
			})
			.then(resData => {
			    this.headimgurl = resData[0].key;
			    this.putUserInfo();
			}, error => {
			    console.log(error)
			})

		},
	},
	components: {
		WxcMinibar,
		StatusBar
	},
	computed: {

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
	font-size: 30px;
	font-weight: bold;
	color: @main_color;
}

.items {
	margin-top: 20px;
}

.box {
	width: 750px;
	flex-direction: row;
	justify-content: space-between;
	background-color: #fff;
	height: 100px;
	align-items: center;
	padding: 0 31px;
	border-bottom-style: solid;
	border-bottom-width: 1px;
	border-bottom-color: rgba(0, 0, 0, .1);
}

.image {
	position: relative;
	height: 197px;
}

.iamge_mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.3);
	width: 147px;
	height: 147px;
}

.icon_upload {
	color: #fff;
	text-align: center;
	line-height: 147px;
	font-size: 45px;
}

.text {
	font-size: 32px;
	color: #434343;
}

.icon_clear_text {
	color: #9B9DA4;
}

.user_image {
	position: relative;
	width: 147px;
	height: 147px;
	border-radius: 6px;
}

.edit {
	width: 50px;
}

.input_name {
	flex: 1;
	height: 100px;
}

</style>
