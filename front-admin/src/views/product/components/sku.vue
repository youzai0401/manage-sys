<template>
  <div v-show="showSku" class="data-display-container">
    <div class="sku-content">
      <div class="sku-content-title">
        <span class="title-1">SKU</span>
        <span class="title-2">线上累计</span>
      </div>
      <div class="sku-number-content">
        <span class="sku-number-item">{{ skuCount[0] }}</span>
        <span class="sku-number-item">{{ skuCount[1] }}</span>
        <span class="sku-number-item">{{ skuCount[2] }}</span>
        <span class="sku-number-item">{{ skuCount[3] }}</span>
        <span class="sku-number-item">{{ skuCount[4] }}</span>
        <span class="sku-number-item">{{ skuCount[5] }}</span>
      </div>
    </div>
    <div class="other-content">
      <template v-for="(item, i) in itemList">
        <div :key="item.name" class="other-item">
          <span class="item-number"><countTo :start-val="0" :end-val="item.num" :duration="2000" />{{ item.unit }}</span>
          <span class="item-name">{{ item.name }}</span>
        </div>
        <div v-show="i !== 4" :key="i" class="item-line" />
      </template>
    </div>
    <i class="el-icon-circle-close close-icon" @click="handleClose" />
  </div>
</template>

<script>
import countTo from 'vue-count-to'

export default {
  name: 'Sku',
  components: { countTo },
  props: {
    showSku: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 国家数量,国内覆盖省份,国内覆盖城市,国内5A覆盖率,国内4A覆盖率
      skuCount: [],
      itemList: [
        {
          num: 10,
          name: '国家数量',
          unit: '',
          key: 'countryCount'
        },
        {
          num: 20,
          name: '国内覆盖省份',
          unit: '',
          key: 'domesticProvinceCount'
        },
        {
          num: 30,
          name: '国内覆盖城市',
          unit: '',
          key: 'domesticCityCount'
        },
        {
          num: 50,
          name: '国内5A覆盖率',
          unit: '%',
          key: 'fiveGradeCoverageRate'
        },
        {
          num: 66,
          name: '国内4A覆盖率',
          unit: '%',
          key: 'fourGradeCoverageRate'
        }
      ]
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      // 通过接口获取数据 analysis/productAnalysis
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front' // 访问标识，用来进行系统的并发控制  deer.front 代表微信小程序  deer.manage 代表 后台系统
      }
      this.$request.post('/analysis/productAnalysis', params).then(res => {
        const data = res?.data || {}
        // 将data中skuCount补齐为6为数字，不足的用0补齐，然后转为数组
        this.skuCount = data.skuCount.toString().padStart(6, '0').split('').map(item => +item)
        // 将data中的其他数据赋值给itemList，通过key匹配
        this.itemList.forEach(item => {
          item.num = data[item.key]
        })
      })
    },
    handleClose() {
      // 将传入的showSku改为false
      this.$emit('update:showSku', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-display-container {
  width: 100%;
  display: flex;
  background: linear-gradient(90deg, #B9CFFF 0%, #A4D5FF 59%, #C0C7FF 100%);
  border-radius: 16px;
  justify-content: space-around;
  flex-wrap: wrap;
  padding-bottom: 40px;
  position: relative;
  margin-bottom: 44px;
  .close-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 32px;
    color: #00236B;
    cursor: pointer;
  }
  .sku-content {
    display: flex;
    align-items: center;
    padding-top: 40px;
    .sku-content-title {
      width: 100px;
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-right: 20px;
      .title-1 {
        height: 50px;
        font-size: 36px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #00184A;
        line-height: 50px;
      }
      .title-2 {
        height: 28px;
        font-size: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #00184A;
        line-height: 28px;
      }
    }
    .sku-number-content {
      display: flex;
      .sku-number-item {
        width: 52px;
        height: 84px;
        margin-right: 18px;
        text-align: center;
        background: linear-gradient(360deg, #D2E5FC 0%, #DBEAFF 52%, #C9DFFF 100%);
        box-shadow: inset 0px 1px 6px 0px rgba(10,89,255,0.38);
        border-radius: 4px;
        border: 3px solid #FFFFFF;

        font-size: 60px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #0A54FC;
        line-height: 84px;
      }
    }

  }
  .other-content {
    display: flex;
    justify-content: space-between;
    width: 800px;
    padding: 40px 20px 0;
    align-items: center;
    .other-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 168px;
      .item-number {
        height: 50px;
        font-size: 36px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #00184A;
        line-height: 50px;
      }
      .item-name {
        height: 28px;
        font-size: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #00184A;
        line-height: 28px;
      }
    }
    .item-line {
      width: 1px;
      height: 43px;
      opacity: 0.2;
      border: 1px solid #00184A;
    }
  }
}
</style>
