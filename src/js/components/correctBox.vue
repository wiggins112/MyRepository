<template>
	<div class="box_mask" v-if="show" @click="OnClickModal">
		<div class="correct_box" @click.stop="">
			<div class="head">
				{{ $t('文章纠错') }}
			</div>
			<div class="body">
				<div class="item" @click="toggleOther('is_content','is_other','is_error','is_title')">
					<text class="icon icon_select" v-if="is_content">&nbsp;&nbsp;{{ $t('内容与区块链无关') }}</text>
					<text class="icon icon_unselected" v-if="!is_content">&nbsp;&nbsp;{{ $t('内容与区块链无关') }}</text>
				</div>
				<div class="item" @click="toggleOther('is_error','is_other','is_content','is_title')">
					<text class="icon icon_select" v-if="is_error">&nbsp;&nbsp;{{ $t('正文错误') }}</text>
					<text class="icon icon_unselected" v-if="!is_error">&nbsp;&nbsp;{{ $t('正文错误') }}</text>
				</div>
				<div class="item" @click="toggleOther('is_title','is_other','is_content','is_error')">
					<text class="icon icon_select" v-if="is_title">&nbsp;&nbsp;{{ $t('标题错误') }}</text>
					<text class="icon icon_unselected" v-if="!is_title">&nbsp;&nbsp;{{ $t('标题错误') }}</text>
				</div>
				<div class="item edit_box">
					<text class="icon icon_select" v-if="is_other" @click.stop="toggleOther('is_other','is_title','is_content','is_error')">&nbsp;&nbsp;{{ $t('其他') }}</text>
					<text class="icon icon_unselected" v-if="!is_other" @click.stop="toggleOther('is_other','is_title','is_content','is_error')">&nbsp;&nbsp;{{ $t('其他') }}</text>
					<textarea class="edit" v-show="is_other" v-model="title" :placeholder="$t('请在此处填写纠错内容')"></textarea>
				</div>
			</div>
			<div class="foot">
				<text class="item" @click.stop="confirm">{{ $t('提交') }}</text>
				<text class="item cancel" @click.stop="cancel">{{ $t('取消') }}</text>
			</div>
		</div>
	</div>
</template>
<script>
let _self;
export default {
	data() {
		return {
			is_other: false,
			is_content: false,
			is_error: false,
			is_title: false,
			edit_content: '',
			title: ''
		}
	},
	created() {
		_self = this;
	},
	props: {
		show: {
			type: Boolean,
			default: false,
		},
		closeOnClickModal: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		postArticleBehavior() {
			let params = {};
			params.behavior = 'correct';
			params.scene = 0;
			params.remarks = this.title;
			params.article_id = this.$route.params.article_id;
			this.$fetch({
				url: `${API_BaseUrl}/api/article/{article_id}/behavior`,
				method: 'POST',
				data: params
			}).then(resData => {

			}).catch((e) => {
				console.log(e.message)
			});
		},
		closeDialog(e) {
			this.$emit('closeDialog', e)
		},
		OnClickModal(e) {
			if (this.closeOnClickModal) {
				this.closeDialog();
			}
		},
		confirm(e) {
			this.postArticleBehavior();
			this.$emit('confirmDialog', e);
		},
		cancel() {
			this.closeDialog();
		},
		toggleOther(is_tab, is_tab2, is_tab3, is_tab4) {
			this[is_tab] = !this[is_tab];
			this[is_tab2] = false;
			this[is_tab3] = false;
			this[is_tab4] = false;
			if (is_tab === 'is_content') {
				this.title = this.$t('内容与区块链无关')
			} else if (is_tab === 'is_error') {
				this.title = this.$t('正文错误')

			} else if (is_tab === 'is_title') {
				this.title = this.$t('标题错误')
			} else if (is_tab === 'is_other') {
				this.title = '';
			}

		}
	},
	components: {}
}

</script>
<style scoped lang="less">

.box_mask {
	margin-top: 63px;
	position: fixed;
	width: 750px;
	background-color: rgba(0, 0, 0, 0.3);
	left: 0;
	top: 0;
	bottom: 0;
	right: 0;
	z-index: 999;
}

.correct_box {
	width: 600px;
	height: 400px;
	box-shadow: 0 0 40px rgba(0, 0, 0, .15);
	margin: auto;
	position: absolute;
	top: 0px;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: #fff;
	padding: 20px;
	border-radius: 5px;
	z-index: 999999;
	color: #434343;
}

.head {
	font-size: 18px;
	font-weight: bold;
	margin-top: 10px;
}

.body {
	font-size: 16px;
	margin-top: 25px;
}

.item {
	margin-bottom: 10px;
	&:hover {
		cursor: pointer;
	}
	&.edit_box {
		position: relative;
	}
}

.icon {
	margin-right: 10px;
}

.icon_unselected {
	color: icon #dee0ec;
}

.icon_select {
	color: #f7b237;
}

.edit {
	position: absolute;
	width: 85%;
	height: 60px;
	padding: 10px;
	resize: none;
	left: 25px;
	top: 30px;
}

.foot {
	display: flex;
	justify-content: space-between;
	color: #fff;
	font-size: 18px;
	color: #fff;
	margin-top: 140px;
}

.item {
	width: 145px;
	height: 44px;
	line-height: 44px;
	background-color: #f7b237;
	text-align: center;
	border-radius: 5px;
	&:hover {
		cursor: pointer;
	}
	&.cancel {
		background-color: #434343;
	}
}

</style>
