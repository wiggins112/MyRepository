<template>
	<div class="wrapper">
		<div class="">
			<div class="img_box">
				<div class="img_box_item" v-for="(item,index) in listImage" :key="index">
					<image class="img_url" resize="color" :src="item" @click="handlePreview(index)"></image>
					<image class="icon_clear" @click="handleClear(index)" :src="clear"></image>
				</div>
				<div class="img_box_item">
					<image @click="pickImage" class="img_url" resize="color" :src="`bmlocal://assets/images/upload/upload_${language}.png`" v-if="listImage.length < limitNum"></image>
				</div>
			</div>

		</div>
	</div>
</template>
<script>
import { Iconfont, QINIU_CDN } from '../config/config.js'
import _ from 'lodash'
export default {
	data: function() {
		return {
			clear: `bmlocal://assets/images/upload/clear.png`,
			is_operator: false,
			listImage: [],
			img_url: `${QINIU_CDN}`+'/',
			limitNum: '',
		}
	},
	components: {

	},
	props: {
		limitNum: {
			type: Number,
			default: 9
		},
	},
	created() {
	},
	methods: {
		pickImage() {// 选择图片在页面上显示，不上传
			this.$image.pick({
					maxCount: this.limitNum - this.listImage.length,
					imageWidth: 800,
				})
				.then(resData => {
					if (resData.length) {
						// 在页面上显示选择的图片
						this.listImage = this.listImage.concat(resData);
						this.listImage = _.uniq(this.listImage); // 防止重复选择同一个图片：选择图片->取消->选择图片->
						this.$emit('link', this.listImage)
					}
				}, error => {
			})
		},
		handleClear(i) {
			this.listImage.splice(i, 1);
		},
		handlePreview(i) {
			this.$image.preview({
				index: i, // 所点击图片下标
				images: this.listImage, // 图片的网络地址
			})
		},
	},
	computed: {
        language() {
            return this.$storage.getSync('language');
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

.img_box_item {
	padding: 20px 20px 0 0;
	margin: 0 5px 20px 0;
}

.icon_clear {
	width: 40px;
	height: 40px;
	position: absolute;
	right: 0;
	top: 0;
}

.wrapper {
	background-color: #fff;
}

.img_box {
	width: 750px;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-start;
	padding-left: 25px;
}

.img_url {
	width: 156px;
	height: 156px;
	border-radius: 5px;
}

.img_url_item {
	width: 156px;
	height: 156px;
	border-radius: 5px;
}

</style>
