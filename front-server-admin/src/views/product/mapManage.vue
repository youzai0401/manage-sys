<template>
  <div v-if="showPage" class="map-manage-container">
    <div class="left-container">
      <el-tabs v-if="showMapSetting" v-model="activeName" class="tab-class" @tab-click="handleClick">
        <el-tab-pane label="地图基础设置" name="first">
          <mapBaseSetting
            :product-id="productId"
            :detail-data="detailData"
            :product-map-id="detailData.productMapId"
            @boundsChange="onBoundsChange"
            @handMapChange="onHandMapChange"
            @save="onSave"
          />
        </el-tab-pane>
        <el-tab-pane label="点位管理" name="second">
          <dotManage
            v-if="detailData.productMapId"
            ref="dotManage"
            :detail-data="detailData"
            :product-map-id="detailData.productMapId"
            :product-id="productId"
            @setTag="handleSetTag"
            @goEdit="handleGoEdit"
            @poiRefresh="fetchPoi"
          />
          <p v-else>请先完成地图基础设置</p>
        </el-tab-pane>
        <el-tab-pane label="线路管理" name="third">线路管理</el-tab-pane>
        <el-tab-pane label="菜单管理" name="fourth">菜单管理</el-tab-pane>
      </el-tabs>
      <editDotContent
        v-else
        ref="editDotContent"
        :current-tag="currentTag"
        :product-map-id="detailData.productMapId"
        :product-id="productId"
        :site-id="siteId"
        @save="onSaveDot"
        @cancel="onCancelDot"
        @updatePoi="onPoi"
      />
    </div>
    <div class="right-container">
      <div v-if="detailData.productMapId" style="position: absolute;left: 15px;top: 15px;z-index: 333333; display: flex;align-items: center">
        <el-button v-show="activeName==='second'&&showMapSetting" @click="addPoi">新增点位</el-button>
        <el-switch
          v-model="baseMap.switchMap"
          active-color="#40A7FF"
          inactive-color="#D3D3D3"
          style="margin-left: 5px"
          @change="onChangeMap"
        />手绘图展示
        <el-switch
          v-show="activeName==='second'&&showMapSetting"
          v-model="baseMap.switchPoi"
          active-color="#40A7FF"
          inactive-color="#D3D3D3"
          @change="showMarkers"
        />
        <span v-show="activeName==='second'&&showMapSetting">点位预览</span>
      </div>
      <Map
        ref="map"
        style="height: 90vh"
        :hand-picture="baseMap.handMap"
        :bounds="baseMap.bounds"
        @load="onLoadMap"
        @savePoi="onSavePoi"
        @cancelSavePoi="onCancelSavePoi"
        @updatePoi="onPoi"
      />
    </div>
  </div>
</template>

<script>
import mapBaseSetting from '@/views/product/components/mapBaseSetting'
import dotManage from '@/views/product/components/dotManage'
import Map from '@/components/Map'
import editDotContent from '@/views/product/editDotContent'

export default {
  components: {
    mapBaseSetting,
    dotManage,
    Map,
    editDotContent
  },
  data() {
    return {
      activeName: 'first',
      productId: '',
      detailData: {},
      currentTag: {},
      showPage: false,
      showMapSetting: true,
      siteId: '',
      addPointStatus: false,
      baseMap: {
        bounds: [],
        handMap: '',
        switchMap: true,
        switchPoi: true
      },
      isSaving: false,
      isSavingMap: false
    }
  },
  created() {
    this.productId = this.$route.query.productId
    this.getProductMapDetail()
  },
  methods: {
    onLoadMap() {
      this.$refs.map.showImg(this.baseMap.bounds, this.baseMap.handMap, true)
      this.fetchPoi({ siteClassId: '' })
    },
    fetchPoi({ siteClassId }) {
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
        'params': {
          'productId': this.productId, // 必传，传入 productId
          'productMapId': this.productMapId, // 必传，上一步中保存的地图id
          'siteClassId': siteClassId // 必传，分类id
        }
      }
      this.$request.post('product/site/listQueryManage', params).then(res => {
        this.$refs.map.showMarker(res.data)
      })
    },
    onPoi({ type, data }) {
      if (type === 'init') {
        this.$refs.map.showMarker([])
        const { centralPointCoordinate, leftTopCoordinate, rightTopCoordinate, rightBottomCoordinate, leftBottomCoordinate } = data
        this.$refs.map.addPoi({
          centerCoord: centralPointCoordinate.split(','),
          path: [leftTopCoordinate.split(','), rightBottomCoordinate.split(','),
            rightTopCoordinate.split(','), leftBottomCoordinate.split(',')]
        })
      }
      if (type === 'update') {
        console.log(data)
        this.$refs.editDotContent.formData.centralPointCoordinate = data.centerCoord.join(',')
        this.$refs.editDotContent.formData.leftTopCoordinate = `${data.path[0].lat},${data.path[0].lng}`
        this.$refs.editDotContent.formData.rightBottomCoordinate = `${data.path[1].lat},${data.path[1].lng}`
        this.$refs.editDotContent.formData.rightTopCoordinate = `${data.path[2].lat},${data.path[2].lng}`
        this.$refs.editDotContent.formData.leftBottomCoordinate = `${data.path[3].lat},${data.path[3].lng}`
      }
      if (type === 'save') {
        this.$refs.map.poiDisable()
        this.showMarkers()
      }
    },
    onChangeMap() {
      this.$refs.map.showImg(this.baseMap.bounds, this.baseMap.handMap, {
        visible: this.baseMap.switchMap,
        flyTo: false
      })
    },
    showImg() {
      this.$refs.map.showImg(this.baseMap.bounds, this.baseMap.handMap, { visible: this.baseMap.switchMap })
    },
    showMarkers() {
      if (this.baseMap.switchPoi) this.fetchPoi(this.currentTag)
      else this.$refs.map.showMarker([])
    },
    addPoi() {
      if (this.addPointStatus) {
        this.$message({
          message: '请先保存当前点位，再继续添加',
          type: 'warning'
        })
        return
      }
      this.addPointStatus = true
      this.$refs.map.addPoi({})
    },
    onSaveDot() {
      this.showMapSetting = true
      this.$refs.dotManage.getClassList()
    },
    onCancelDot() {
      this.showMapSetting = true
      this.activeName = 'second'
    },
    handleSetTag(tag) {
      this.currentTag = tag
    },
    getProductMapDetail() {
      this.$request({
        url: '/product/map/detail',
        method: 'post',
        data: {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
          'params': {
            'productId': this.productId // 必传，传入 productMapId
          }
        }
      }).then(res => {
        console.log(res.data)
        if (res?.data) {
          this.detailData = res.data
          this.detailData.backgroundPicture = [res.data.backgroundPicture]
          this.detailData.handPicture = [res.data.handPicture]
          this.baseMap.bounds = [res.data?.handLeftCoordinate.split(','), res.data?.handRightCoordinate.split(',')]
          this.baseMap.handMap = `${process.env.VUE_APP_BASE_PHOTO_URL}${this.detailData.handPicture[0]}`
        }

        this.showPage = true
      }).catch(err => {
        console.log(err)
      })
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    handleGoEdit(siteId) {
      this.showMapSetting = false
      this.siteId = siteId
    },
    onSave(form) {
      // 需要区分是新增还是保存
      if (this.isSavingMap) {
        return
      }
      this.isSavingMap = true
      let url = ''
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
        'model': {
          ...form,
          'tileMapSwitch': 0,
          backgroundPicture: form.backgroundPicture[0],
          handPicture: form.handPicture[0],
          'centralPointCoordinate': '31.388813,120.625763'
        }
      }
      if (this.detailData.productMapId) {
        url = '/product/map/change'
        params.model.productMapId = this.detailData.productMapId
      } else {
        url = '/product/map/create'
        params.model.productId = this.productId
      }

      this.$request({
        url,
        method: 'post',
        data: params
      }).then(res => {
        console.log(res.data)
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.isSavingMap = false
        if (res?.data) {
          this.detailData = res.data
          this.detailData.backgroundPicture = [res.data.backgroundPicture]
          this.detailData.handPicture = [res.data.handPicture]
          this.baseMap.bounds = [res.data?.handLeftCoordinate.split(','), res.data?.handRightCoordinate.split(',')]
          this.baseMap.handMap = `${process.env.VUE_APP_BASE_PHOTO_URL}${this.detailData.handPicture[0]}`
        }
      }).catch(err => {
        this.isSavingMap = false
        console.error(err)
      })

      // 测试完放入回调
      this.$refs.map.showImg([form.handLeftCoordinate.split(','), form.handRightCoordinate.split(',')], params.model.handPicture)
    },
    onCancelSavePoi() {
      this.addPointStatus = false
    },
    onSavePoi(geo) {
      if (this.isSaving) {
        return
      }
      this.isSaving = true
      console.log(geo, '点位数据')
      const url = '/product/site/create'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'translateModels': [ // 翻译的字段，集合，有打开英文预览，就要传递这个集合

          ]
        },
        'model': {
          'productId': this.productId, // 必传，上一步中保存的产品id
          'productMapId': this.detailData.productMapId, // 必传，上一步中保存的地图id
          'siteClassId': this.currentTag.siteClassId, // 必传，所属类别 不可以选择全部
          'name': geo.name, // 必传 点位名称
          'leftTopCoordinate': `${geo.path[0].lat},${geo.path[0].lng}`, // 必传 左上经纬度 纬度,经度 存储
          'leftBottomCoordinate': `${geo.path[1].lat},${geo.path[1].lng}`, // 必传 左下经纬度 纬度,经度 存储
          'rightTopCoordinate': `${geo.path[2].lat},${geo.path[2].lng}`, // 必传 右上经纬度 纬度,经度 存储
          'rightBottomCoordinate': `${geo.path[3].lat},${geo.path[3].lng}`, // 必传 右下经纬度 纬度,经度 存储
          'centralPointCoordinate': geo.centerCoord.toString()// 必传 中心点的经纬度  纬度,经度 存储
        }
      }
      this.$request({
        url,
        method: 'post',
        data: params
      }).then(res => {
        console.log(res.data)
        this.$refs.dotManage.fetchSiteData()
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.addPointStatus = false
        this.isSaving = false
      }).catch(err => {
        console.error(err)
        this.addPointStatus = false
        this.isSaving = false
      })
    },
    onHandMapChange([img]) {
      console.log(77)
      this.baseMap.handMap = img
      this.$refs.map.showImg(this.baseMap.bounds, `${process.env.VUE_APP_BASE_PHOTO_URL}${img}`)
    },
    onBoundsChange(bounds) {
      this.baseMap.bounds = bounds.map(p => p.split(','))
      this.$refs.map.showImg(this.baseMap.bounds, `${process.env.VUE_APP_BASE_PHOTO_URL}${this.baseMap.handMap}`)
    }
  }
}
</script>
<style lang="scss" scoped>
.map-manage-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-height: calc(100vh - 50px);
  padding: 25px;
  background: #F7F8FC;

  .left-container {
    flex: 1;
    background-color: #fff;
    padding: 0 24px 24px;
    border-radius: 4px;
    margin-right: 40px;
    width: 40%;
  }

  .right-container {
    position: relative;
    flex: 1;
    background-color: #fff;
  }
}
</style>
