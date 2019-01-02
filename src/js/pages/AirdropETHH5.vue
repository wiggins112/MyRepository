<template>
	<div class="container">
		<div class="web_box">
			<scroller class="wrapper_scroller" :style="{height: page_height}">
				<web v-if="hasweb" :src="web_uri" class="web" :style="{height: page_height}" @pagefinish="onPageFinish"></web>
			</scroller>
		</div>
		<StatusBar :statusBarStyle="{bgColor:'transparent'}"></StatusBar>
		<ShareComponents  :showShare="showShare" :shareConfigs="shareConfigs" @closeShare="showShare = false" @ShareCallback="ShareCallback" />
	</div>
</template>
<script>
import { Utils, WxcIcon } from 'weex-ui';
import StatusBar from '../components/StatusBar.vue'
import ShareComponents from '../components/ShareComponents.vue'
import { STATIC_SERVER } from '../config/config.js'
const globalEvent = weex.requireModule('globalEvent')
export default {
	components: {
		WxcIcon,
		StatusBar,
		ShareComponents
	},
	data() {
		return {
			user_token: '',
			showShare: false,
			ww: '',
			share_image: {},
			other_invite_code: '',
			invite_code: '',
			router_params: {},
			hasweb: false,
			user_info: {},
			share_time: '',
		};
	},
	created() {
		this.init();
	},
	eros: {
		beforeBackAppear() {
			this.init();
		},
	},
	methods: {
		init() {
			// this.$notice.loading.show();
			this.getRouterParams();
			this.startShareDialog();
			this.$event.on('goBack', params => {
				this.$router.back();
			});
		},
		getRouterParams() {
			this.$router.getParams().then(resData => {
				this.other_invite_code = resData.token || ''; //这是从注册页跳过来的 需要传递到web页面打开 确定用户注册成功 可以领取
			})
			this.user_token = this.$storage.getSync('user_token');
			this.getUserToken();
		},
		ShareCallback(res) {
			if (res === 'succeed') {
				this.share_time = new Date().getTime();//获取分享的时间戳 显示分享成功的弹框
				this.showShare = false;
				clickStatPost(clickStat.click_get_eth); //统计
				if (this.message.button_state) {
					this.postAirdropWallet(); //分享成功之后返回 然后发送获取空投 重新刷新页面
				}
				// 友盟统计-自定义事件计数
				common.addUmengClickEvent('bzh_airdrop_share');
			}
		},
		startShareDialog() {
			this.$event.on('startShareDialog', params => {
				params = params || `{}`;
				let params_data = JSON.parse(params);
				if (params_data.base64) {
					this.share_image = params_data;
					this.showShare = true;
				}else {
					this.$notice.toast({
						message: "请求邀请海报超时，请稍后重试"
					})
				}
			});
		},
		getUserToken() {
			let params = {};
			this.$fetch({
				name: 'getUserToken',
				method: 'GET',
				data: params
			}).then(resData => {
				if (resData.error === 0) {
					this.invite_code = resData.result.ic;
					this.hasweb = true; //这时候就开始渲染页面
				} else {
					this.$notice.loading.hide();
				}
			}).catch((resData) => {});
		},
		onPageFinish(event) {
			this.$notice.loading.hide();
		},
	},
	computed: {
		page_height() {
			return Utils.env.getPageHeight() + 140;
		},
		shareConfigs() {
			return {
				title: "全网最壕，500ETH免费送", // 分享的标题
				content: "最高领6.66枚ETH，仅限5天，速来领取吧！", // 分享的文字内容  
				url: ``,
				image: `${this.share_image.base64}`, // 分享的图片url,
				type: 'Image',
				imageInfo: this.share_image.imageInfo || {},
				imageType: 'base64'
			}
		},
		web_uri() {
			let uri = `${STATIC_SERVER}/airdrop/airdrop.html?token=${this.user_token}&other_invite_code=${this.other_invite_code}&invite_code=${this.invite_code}#${this.share_time}`;
			console.log(uri)
			return uri;
		}
	}
}

</script>
<style lang="less">
@import url('../css/veriable.less');
.web {
	width: 760px;
	display: none;
}

.wrapper_scroller {
	width: 760px;
}

.container {}

.icon {
	font-family: iconfont2;
}

.web_box {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}


</style>
