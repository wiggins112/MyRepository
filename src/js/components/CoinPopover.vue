<template>
  <div class="popover_box">
    <div :class="['popover', type === 'people' && 'popover_show']" v-if="type === 'people'">
      <div class="arrow">
        <text class="icon icon_trans" :style="{left: position.x + 'px'}">&#xe90f;</text>
      </div>
      <div class="popover_content">
        <div class="popover_title">
          <text class="popover_title_text_left" :style="{color: titleLeft.color}">{{popData.value_fmt}}</text>
          <text class="popover_title_text_right" :style="{color: popData.color}">{{getRightTitle(popData.type)}}</text>
        </div>
        <div :class="['info_team_box', coin_data.length === index + 1 && 'none_border']" v-for="(person , index) in coin_data" :key="index" @click="toggleTransLimit(person, index)" v-if="coin_data.length">
          <div class="team_name_box">
            <div class="header_img">
              <div class="team_img">
                <image class=" logo_header" resize="cover" :src="person.headimgurl || default_person_logo"></image>
              </div>
              <div class="team_name">
                <div class="related_box">
                  <text class="zh_name">{{ person.name }}</text>
                </div>
                <text class="job_name">{{ person.desc }}</text>
              </div>
            </div>
          </div>
          <div class="team_intro_box">
            <text :class="['intro_box_text', 'info_team_limit' , person.tram_limit && 'info_team_unlimit' ]">{{ person.intro }}</text>
          </div>
        </div>
        <div class="info_team_box none_border" v-if="!coin_data.length">
          <text class="job_name">{{ $t('暂无数据') }}~</text>
        </div>
      </div>
    </div>
    <div :class="['popover', type === 'text' && 'popover_show']" v-if="type === 'text'">
      <div class="arrow">
        <text class="icon icon_trans" :style="{left: position.x + 'px'}">&#xe90f;</text>
      </div>
      <div class="popover_content">
        <div class="popover_title" v-if="popData.show_popover_title">
          <text class="popover_title_text_left" :style="{color: titleLeft.color}">{{popData.value_fmt}}</text>
          <text class="popover_title_text_right" :style="{color: popData.color}">{{getRightTitle(popData.type, popData.value_fmt)}}</text>
        </div>
        <div>
          <text class="intro_box_text">{{popData.data || $t('暂无数据')}}</text>
        </div>
      </div>
    </div>
    <div :class="['popover', type === 'message' && 'popover_show']" v-if="type === 'message' && show_message">
      <div class="arrow">
        <text class="icon icon_trans" :style="{left: position.x + 'px'}">&#xe90f;</text>
      </div>
      <div class="popover_content">
        <div class="content">
          <div class="message_item" v-for="(message, index) in coin_data" v-if="coin_data && coin_data.length" @click="toggleTransLimit(message, index)">
            <div class="message_time">
              <text class="job_name">{{message.publish_time_str}}</text>
            </div>
            <div>
              <text :class="['message_title']">{{ message.title }}</text>
              <text :class="['message_intro', message.tram_limit && 'message_info_unlimit' ]">{{ message.abstract }}</text>
            </div>
          </div>
          <div class="message_item none_border" v-if="coin_data && !coin_data.length">
            <text class="job_name">{{ $t('暂无消息') }}~</text>
          </div>
        </div>
      </div>
    </div>
    <div :class="['popover', type === 'table' && 'popover_show']" v-if="type === 'table'">
      <div class="arrow">
        <text class="icon icon_trans" :style="{left: position.x + 'px'}">&#xe90f;</text>
      </div>
      <div class="popover_content">
        <div class="content" v-if="popData.data && popData.data.length">
          <div class="table_head">
            <div class="tb_hd">
              <div :class="['tb_th', index === 0 && 'table_name1', popData.table_head.length === index + 1 && 'last_text']" v-for="(table, index) in popData.table_head">
                <text :class="['job_name', popData.table_head.length === index + 1 && 'last_text']">{{table.name}}</text>
              </div>
            </div>
          </div>
          <div class="table_body">
            <div :class="['tb_bd', popData.data.length === index + 1 && 'none_border']" v-for="(table, index) in popData.data">
              <div :class="['tb_td', k === 0 && 'table_name1', popData.table_head.length === k + 1 && 'last_text']" v-for="(key, k) in popData.table_head">
                <text :class="['job_name', getTableColorType(table.type), popData.table_head.length === k + 1 && 'last_text']">{{table[key.key] || '-'}}</text>
              </div>
            </div>
          </div>
        </div>
        <div class="content" v-if="popData.data && !popData.data.length">
          <text class="job_name">{{ $t('暂无数据') }}~</text>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      coin_data: [],
      show_message: false,
      default_person_logo: `bmlocal://assets/images/default_header.jpg`,
    }
  },
  props: {
    type: {
      type: String,
      default: 'text',
    },
    popData: {
      type: Object,
      default: {},
    },
    hasTitle: {
      type: Boolean,
      default: false,
    },
    titleLeft: {
      type: Object,
      default: {
        text: '强',
        color: '#444'
      },
    },
    titleRight: {
      type: Object,
      default: {
        text: '利好',
        color: '#00C39C'
      },
    },
    position: {
      type: Object,
      default: {
        x: 50,
        y: 0,
      },
    }
  },
  watch: {
    'popData.data': {
      handler(newValue) {
        this.initPeople();
      },
      deep: true,
    },
  },
  created() {
    this.initPeople();
  },
  methods: {
    initPeople() {
      this.show_message = false;
      if (this.type === 'people' || this.type === 'message') {
        this.coin_data = [];
        for (let item of this.popData.data) {
          item.tram_limit = false;
          this.coin_data.push(item);
        }
        this.$nextTick(() => {
          this.show_message = true;
        })
      }
    },
    toggleTransLimit(item, index) {
      item.tram_limit = !item.tram_limit;
      // 强制渲染调用方法：Vue.set( target, key, value ) // target：要更改的数据源(可以是对象或者数组) // key：要更改的具体数据 // value ：重新赋的值
      Vue.set(this.coin_data, index, item);
    },
    getRightTitle(type, value_fmt) {
      if (type === 'buy') {
        if (value_fmt === '情绪指数') {
          return this.$t('积极')
        }
        return this.$t('利好')
      }
      if (type === 'sell') {
        if (value_fmt === '情绪指数') {
          return this.$t('消极')
        }
        return this.$t('利空')
      }
      if (type === 'watch') {
        return this.$t('观望')
      }
      return '';
    },
    getTableColorType(type) {
      if (type === 'buy') {
        return 'safe'
      } else if (type === 'sell') {
        return 'warn'
      } else {
        return ''
      }
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

.popover_box {}

.popover {
  opacity: 0;
  position: relative;
}

.arrow {}

.popover_content {
  padding: @padding_size;
  border-radius: 12px;
  background-color: #edeef1;
}

.content {}

.popover_title {
  margin-bottom: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 20px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
}

.popover_title_text_left {
  flex: 1;
  text-align: left;
}

.popover_title_text_right {
  flex: 1;
  text-align: right;
}

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
  font-size: 22px;
  color: #9B9DA4;
}

.info_team_box {
  padding: @padding_size 0;
  border-bottom-width: 1px;
  border-color: #ddd;
  margin-bottom: 15px;
}

.icon_trans {
  position: relative;
  top: 7px;
  left: 50px;
  color: #edeef1;
}

.none_border {
  border-color: transparent;
  border-bottom-color: transparent;
}

.team_intro_box {
  padding: 20px 0;
}

.intro_box_text {
  font-size: 24px;
  color: #434343;
  line-height: 43px;
}
.info_team_limit {
  lines: 2;
  text-overflow: ellipsis;
}
.info_team_unlimit {
  lines: 0;
}

.message_time {
  padding-bottom: 5px;
}
.message_info {
  line-height: 33px;
  lines: 5;
  text-overflow: ellipsis;
}

.message_info_unlimit {
  lines: 0;
}

.message_item {
  margin-bottom: 35px;
}

.message_title {
  line-height: 33px;
  font-weight: bold;
  font-size: 22px;
}

.message_intro {
  lines: 5;
  text-overflow: ellipsis;
  line-height: 33px;
  font-size: 22px;
}

.table_head {}

.table_body {}

.tb_hd {
  padding: 0 15px;
  flex-direction: row;
  border-bottom-width: 2px;
  border-bottom-color: #ddd;
}

.tb_bd {
  padding: 0 15px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #e4e6ea;
  border-color: #e4e6ea;
}

.tb_th {
  padding: 15px 0;
  flex: 1;
}

.tb_td {
  padding: 15px 0;
  flex: 1;
}

.table_name1 {
  flex: 1.5;
}

.last_text {
  text-align: right;
}
.popover_show {
  opacity: 1;
  transition-property: opacity;
  transition-duration: 1.5s;
  transition-timing-function: linear;
}
</style>
