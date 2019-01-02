<template>
    <div class="weibo_box">
        <!-- IOS必须设置宽高，否则无法加载 -->
        <web style="width:750; height:1;" :src="`${API_BaseUrl}/api/message/${article_id}?html=1&type=${article.captureType || ''}&_locale=${this.$locale()}&_country=${PUBLISH_COUNTRY}&share=1`"></web>
    </div>
</template>
<script>
import { API_BaseUrl, PUBLISH_COUNTRY } from '../config/config.js'
export default {
    data() {
        return {
            PUBLISH_COUNTRY,
            API_BaseUrl: API_BaseUrl
        }
    },
    props: {
        article: {
            type: Object,
            default: {}
        },
    },
    created() {
        this.ImagesDataUrl();
    },
    methods: {
        ImagesDataUrl() {
            this.$event.on('ImagesDataUrl', params => {
                params = params || `{}`;
                let params_data = JSON.parse(params);
                this.$emit('getBash64Data', params_data)
                console.log('ImagesDataUrl', params_data.imageInfo);
            });
        },
        
    },
    computed: {
        article_id() {
            console.log('article', this.article._id)
            return this.article._id;
        }
    },
}

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.weibo_box {
    
}

</style>
