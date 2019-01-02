<template>
  <div class="wxc-minibar" v-if="!hideModule['BetMy']">
    <div name="floatbt" v-if="type === 'floatbt'">
      <image class="float_image" src="bmlocal://assets/images/bets/bet_flow_banner1120.png" @click="goBetList"></image>
      <div class="float_image_new" v-if="betRedDot" />
    </div>
    <div name="betview" v-if="type === 'betview' && bet[tabberindex]">
      <div class="list">
        <div class="listcell">
          <image class="banner_image" resize="cover" :src="bet[tabberindex].banner" @click="goBetDetail(tabberindex)" />
          <CellItem class="cellitem" :has-arrow="true" @wxcCellClicked="goBetDetail" :has-top-border="false" title="" hasVerticalIndent="" titleIconSize="40" extraContent="" titlecolor="red">
            <div slot="title" class="less_row">
              <text class="bet_ing">{{ $t('竞猜') }}</text>
              <text class="cell_title">{{bet[tabberindex].title}}</text>
            </div>
          </CellItem>
          <text class="banner_num">{{bet[tabberindex].user_bet_total}}{{ $t('人参加') }}</text>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CellItem from '../components/CellItem.vue'
import common from '../config/common';
export default {
  components: {
    CellItem,
  },
  data() {
    return {
      bet: [],
      hasbet: false,
      betItem0: {},
      betRedDot: this.$storage.getSync('betRedDot') || false,
    };
  },
  created() {
    this.getBetList();
  },
  props: {
    type: {
      type: String,
      default: 'floatbt',
    },
    tabberindex: {
      type: Number,
      default: '',
    }
  },
  methods: {
    getBetList() { //list 加载数据
      let params = {};
      params.page = 1;
      params.size = 10;
      return this.$fetch({
        name: 'getBetActivities',
        method: 'GET',
        data: params,
      }).then(resData => {
        if (resData.error === 0) { //加载成功
          if (resData.items.length) {
            this.betItem0 = resData.items[0]
            this.betRedDot = resData.items[0]._id
              && (this.$storage.getSync('betHaveReadID') !== resData.items[0]._id) 
              && resData.items[0].bet_state !== 'opened'
            this.$event.emit('changeBetRedDot', this.betRedDot)
            this.$event.on('changeBetRedDot', flag => {
              this.betRedDot = flag
            })
          }
          // 过滤掉已经结束的竞猜
          this.bet = resData.items.filter((bet) => {
            return bet.bet_state !== 'opened'
          });
        }
      }).catch((e) => {
        console.log(e.message);
      });
    },
    goBetDetail(i) {
      this.$router.open({
        name: 'BetDetail',
        params: {
          bet_id: this.bet[i]._id,
        }
      })
      // 友盟统计-自定义事件计数
      common.addUmengClickEvent('bzh_gamble_enter_news');
    },
    goBetList() {
      this.$router.open({
        name: 'BetList',
      })
      this.$event.emit('changeBetRedDot', false)
      this.$storage.setSync('betRedDot', false)
      // 友盟统计-自定义事件计数
      common.addUmengClickEvent('bzh_gamble_enter_market');
    },

  },
  computed: {
      hideModule() {
        return this.$storage.getSync('hideModule')
    }
  }
};

</script>
<style scoped lang="less">
@import url('../css/veriable.less');
.float_image {
  width: 140px;
  height: 140px;
  position: fixed;
  bottom: 260px;
  right: 30px;
}

.list {
  width: 750px;
  margin: @padding_size 0;
}

.banner_image {
  height: 300px;
}

.listcell {}

.banner_num {
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 10px 15px;
  border-radius: 30px;
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 18px;
}

.cell-content {
  flex-direction: row;
  justify-content: space-between;
  height: 80px;
  line-height: 80px;
}



.cell-arrow-icon {
  width: 22px;
  height: 22px;
}

.cell_title {
  color: #333;
  font-weight: 600;
}

.bet_ing {
  border-radius: 5px;
  font-size: 22px;
  padding: 3px 12px;
  color: #fff;
  margin-right: @padding_size;
  font-weight: 500;
  background-color: #94b5eb;
}
.float_image_new {
  position: fixed;
  bottom: 355px;
  right: 50px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background-color: #ff0000;
}
</style>
