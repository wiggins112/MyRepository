<template>
	<div class="wrapper">
		<StatusBar :statusBarStyle="{bgColor:'#ffffff'}"></StatusBar>
		<wxc-minibar :title="$t('通知设置')" rightWidth="175px">
			<text slot="right" :class="['icon', 'right_icon', is_put && 'active_icon']" @click="clickRightBtn">{{confirm_text}}</text>
		</wxc-minibar>
		<div class="box">
			<text class="text">{{ $t('应用内通知') }}</text>
			<switch class="switch" :checked="form.switch_app" @change="onchangeAppNotice"></switch>
		</div>
		<div class="box">
			<text class="text">{{ $t('短信通知') }}</text>
			<switch class="switch" :checked="form.switch_phone" @change="onchangeMessageNotice"></switch>
		</div>
		<div class="phone_code" v-if="is_edit">
            <div class="input_name">
                <input type="text" class="input_name" :placeholder="$t('图形验证码')" v-model="form.image_code" />
            </div>
            <div v-if="show_captcha" :class="['btn_code_image']">
                <web class="web_image_code" :src="`${API_BaseUrl}/api/user/captcha`" ref="webview_image_code" @pagefinish="onPageFinish" @error="onError"></web>
                <div class="overlay_image_code" @click="reloadImageCodeWeb"></div>
            </div>
        </div>
		<div class="input_box" v-if="form.switch_phone">
			<div class="input">
				<input type="text" :placeholder="$t('请输入手机号')" class="input_name" v-model="form.phone" />
				<div class="edit_box" v-if="!is_edit" @click="editPhone">
					<text class="icon icon_edit">&#xe91e;</text>
					<text class="icon edit_text">{{ $t('修改') }}</text>
				</div>
				<div class="edit_box" v-if="is_edit">
					<div :class="['btn_code', show_countdown && 'disable_btn']" @click="getPhoneCode">
						<text class="btn_text" v-if="!show_countdown">{{ $t('获取验证码') }}</text>
						<wxc-countdown v-if="show_countdown" tpl="{s}S" :timeBoxStyle="{backgroundColor: 'transparent'}" :timeTextStyle="{fontSize: '30px', color: '#fff'}" :dotTextStyle="{color: '#fff', fontSize: '30px', fontWeight: 'normal'}" :dotBoxStyle="{width: '30px'}" :style="{justifyContent: 'center'}" :time="countdown_time" @wxcOnComplete="onCompletedTwo">
						</wxc-countdown>
					</div>
				</div>
			</div>
		</div>
		<div class="input_box" v-if="is_edit">
			<div class="input">
				<input type="text" :placeholder="$t('验证码')" class="input_name" v-model="form.code" />
				<div class="edit_box" v-if="is_validate">
					<text class="icon icon_edit succeed">&#xe920;</text>
					<text class="icon edit_text succeed">{{ $t('已验证') }}</text>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { WxcCountdown } from 'weex-ui';
import WxcMinibar from '../components/WxcMinibar.vue'
import StatusBar from '../components/StatusBar.vue'
import { API_BaseUrl } from '../config/config.js'
import common from '../config/common'

export default {
	data: function() {
		return {
			form: {
				phone: '',
				code: '',
				switch_app: false,
				switch_phone: false,
				image_code: '',
			},
			is_edit: false,
			is_validate: false,
			loading: {
				contact: 'loading'
			},
			show_countdown: false,
			countdown_time: new Date().getTime() + 6000 * 10,
			API_BaseUrl: API_BaseUrl,
            show_captcha: true,
            session_token: '',
            confirm_text: this.$t('完成'),
            is_put: false,
		}
	},
	watch: {
        'form.code': {
            handler(newValue) {
                if (newValue.length) {
                	this.is_put = true;
                } else {
                	this.is_put = false;
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
			this.getUserConfig();
		},
		editPhone() {
			this.form.switch_phone = true;
			this.is_edit = true;
			this.form.image_code = '';
		},
		onchangeAppNotice(event) {
			this.form.switch_app = event.value;
			this.putUserConfigNotice();
		},
		onchangeMessageNotice(event) {
			this.form.switch_phone = event.value;
			this.putUserConfigNotice();
			if (event.value) {
				if (!this.form.phone) {
					this.is_edit = true;
				}
			} else {
				this.is_edit = false;
			}
		},
		onCompletedTwo() {
			this.show_countdown = false;
		},
		getPhoneCode() {
			if (!this.show_countdown) {
				this.getUserPhoneCode();
			}
		},
		getUserConfig() {
			let params = {};
			params.key = 'notice';
			this.loading.contact = 'loading';
			this.$fetch({
				name: 'getUserConfig',
				method: 'GET',
				data: params
			}).then(resData => {
				if (resData.error === 0) {
					this.loading.contact = 'loaded';
					let data = resData.result;
					this.form = {
						phone: data.notice_phone || '',
						code: '',
						switch_app: data.app_notice_open === 1 ? true : false,
						switch_phone: data.phone_notice_open === 1 ? true : false,
						image_code: '',
					}
				} else {
					this.loading.contact = 'error';
					this.$notice.toast({ message: resData.message })
				}

			}).catch((e) => {
				this.loading.contact = 'error';
				console.log(e.message);
			});
		},
		clickRightBtn() {
			if (this.is_put) {
				this.putUserConfigNotice();
			}
		},
		putUserConfigNotice() {
			let params = {};
			params.phone_notice_open = this.form.switch_phone ? 1 : 0;
			params.app_notice_open = this.form.switch_app ? 1 : 0;
			if (this.form.code) {
				if (!this.form.phone) {
					this.$notice.toast({ message: this.$t('请输入手机号!') })
					return;
				}
				params.phone = this.form.phone;
				params.code = this.form.code;
			}
            this.$notice.loading.show();
			this.$fetch({
				name: 'putUserConfigNotice',
				method: 'PUT',
				data: params
			}).then(resData => {
				if (resData.error === 0) {
					if (params.code) {
						this.is_validate = true;
						this.$notice.toast({ message: this.$t('修改成功') })
						this.$router.back();
					}
				} else {
					this.reloadImageCodeWeb();
					this.$notice.toast({ message: resData.message })
				}
				this.$notice.loading.hide();
			}).catch((e) => {
				this.$notice.loading.hide();
				console.log(e.message);
			});
		},
		getUserPhoneCode() {
			let params = {};
			params.phone = this.form.phone;
			params.captcha = String(this.form.image_code).toUpperCase();
            params.session_token = this.session_token;
            if (!this.isPhoneValid(params.phone)) {
                this.$notice.toast({ message: this.$t('请输入正确的手机号') })
                return;
            }
            if (!params.captcha) {
                this.$notice.toast({ message: this.$t('请输入图形验证码！') })
                return;
            }
            this.$notice.loading.show();
			this.$fetch({
				url: `${API_BaseUrl}/api/user/${params.phone}/code`,
				method: 'GET',
				data: params
			}).then(resData => {
				if (resData.error === 0) {
					this.show_countdown = true;
					this.countdown_time = new Date().getTime() + 6000 * 10;
				} else {
					this.reloadImageCodeWeb();
					this.$notice.toast({ message: resData.message })
				}
				this.$notice.loading.hide();
			}).catch((e) => {
				this.$notice.loading.hide();
				console.log(e.message)
			});
		},
		isPhoneValid(string) {
            return common.isPhoneValid(string);
        },
		reloadImageCodeWeb() {
            // this.$notice.loading.show();
            // webview.reload(this.$refs.webview_image_code);
            this.show_captcha = false;
            this.form.image_code = '';
            setTimeout(() => {
                this.show_captcha = true;
            }, 200);
        },
        onPageFinish(e) {
            this.session_token = e.url.split('session_token=')[1];
            this.$notice.loading.hide();
        },
        onError(e) {
            this.$notice.loading.hide();
        },
	},
	components: {
		WxcMinibar,
		StatusBar,
		WxcCountdown
	}
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.icon {
	color: #434343;
	font-family: iconfont2;
}
.right_icon {
	font-size: 30px;
	font-weight:bold;
	color: #ddd;
}
.active_icon {
	color: @main_color;
}
.box {
	width: 750px;
	flex-direction: row;
	justify-content: space-between;
	background-color: #fff;
	height: 100px;
	align-items: center;
	margin-top: 20px;
	padding: @padding_size;
	border-bottom-width: 1px;
	border-color: #eee;
}

.text {
	font-size: 32px;
	color: #434343;
}

.input_box {
	padding-left: @padding_size;
	background-color: #fff;
}

.input {
	padding-right: @padding_size*2;
	width: 750px;
	flex-direction: row;
	justify-content: space-between;
	height: 100px;
	align-items: center;
	border-top-style: solid;
	border-top-width: 1px;
	border-top-color: rgba(0, 0, 0, .1);
}

.input_name {
	flex: 1;
	height: 100px;
	color: #434343;
}

.edit_box {
	flex-direction: row;
}

.edit_text {
	font-size: 28px;
	padding-left: 10px;
}

.icon_edit {
	position: relative;
	top: 1px;
}

.btn_code {
	width: 200px;
	padding: 18px 0;
	background-color: @main_color;
	border-radius: 4px;
	color: #fff;
	text-align: center;
}

.disable_btn {
	background-color: rgba(247, 178, 55, 0.8);
}

.btn_text {
	color: #fff;
	text-align: center;
	font-size: 30px;
}

.succeed {
	color: #21C77B;
}
.phone_code {
	padding-left: @padding_size;
    width: 750px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #fff;
}
.btn_code_image {
    width: 340px;
    height: 90px;
    position: relative;
}

.web_image_code {
    position: absolute;
    top: 0;
    left: 0;
    width: 340px;
    height: 90px;
}

.overlay_image_code {
    position: absolute;
    top: 0;
    left: 0;
    width: 340px;
    height: 90px;
    background-color: transparent;
}
</style>
