<template>
  <div>
    <!--  地图基础设置form表单  -->
    <el-form
      ref="formData"
      :inline="false"
      :rules="formDataRules"
      label-position="left"
      :model="formData"
      label-width="180px"
    >
      <el-form-item label="手绘地图范围(左下角)" prop="handLeftCoordinate">
        <el-input
          v-model="formData.handLeftCoordinate"
          placeholder="左下角经纬度"
          @change="$emit('boundsChange',[formData.handLeftCoordinate,formData.handRightCoordinate])"
        />
      </el-form-item>
      <el-form-item label="手绘地图范围(右上角)" prop="handRightCoordinate">
        <el-input
          v-model="formData.handRightCoordinate"
          placeholder="右上角经纬度"
          @change="$emit('boundsChange',[formData.handLeftCoordinate,formData.handRightCoordinate])"
        />
      </el-form-item>
      <el-form-item label="手绘地图" prop="handPicture">
        <!--    开启时，上传多层级    -->
        <!--        <el-switch-->
        <!--          v-model="isWanpian"-->
        <!--          active-color="#40A7FF"-->
        <!--          inactive-color="#D3D3D3"-->
        <!--        />-->
        <upload
          :img-list.sync="formData.handPicture"
          :img-size="10"
          :img-type="['jpg', 'jpeg', 'png']"
          :limit="1"
          @update:imgList="$emit('handMapChange',$event)"
        />
      </el-form-item>
      <el-form-item label="背景图选择" prop="backgroundPicture">
        <upload
          :img-list.sync="formData.backgroundPicture"
          :img-size="10"
          :img-type="['jpg', 'jpeg', 'png']"
          :limit="1000"
        />
        <div class="bg-list">
          <div
            v-for="item in bgList"
            :key="item.id"
            class="bg-item"
            :class="{ active: item.pictureUrl === formData.backgroundPicture }"
            @click="handleBgClick(item)"
          >
            <i v-if="item.pictureUrl === formData.backgroundPicture" class="el-icon-success check-icon" />
            <el-image
              :src="item.disPictureUrl"
              fit="contain"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="定位服务" prop="locationSwitch">
        <el-switch
          v-model="formData.locationSwitch"
          active-color="#40A7FF"
          inactive-color="#D3D3D3"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="最大缩放等级" prop="scaleLevel">
        <el-select v-model="formData.scaleLevel" placeholder="请选择">
          <el-option
            v-for="item in levelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="footer-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script>
import upload from '@/views/product/components/upload'

export default {
  name: 'MapBaseSetting',
  components: {
    upload
  },
  props: {
    productId: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => {
      }
    },
    productMapId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isWanpian: true,
      formData: {
        handLeftCoordinate: '',
        handRightCoordinate: '',
        handPicture: [],
        backgroundPicture: [],
        locationSwitch: false,
        scaleLevel: '5'
      },
      formDataRules: {
        handLeftCoordinate: [
          { required: true, message: '请输入左上角经纬度', trigger: 'blur' }
          // { trigger: 'blur', validator: this.validateCode }
        ],
        handRightCoordinate: [
          { required: true, message: '请输入右下角经纬度', trigger: 'blur' }
        ],
        handPicture: [
          { required: true, message: '请上传手绘地图', trigger: 'blur' }
        ],
        scaleLevel: [
          { required: true, message: '请选择最大缩放等级', trigger: 'blur' }
        ]
      },
      levelOptions: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' }
      ],
      bgList: []
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (val && this.productMapId) {
          this.formData = JSON.parse(JSON.stringify(val))
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getBgList()
  },
  methods: {
    handleBgClick(item) {
      this.formData.backgroundPicture = [item.pictureUrl]
    },
    getBgList() {
      const url = 'picture/listQuery'
      const params = {
        'timestamp': 1650182275596, // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'pictureType': 'background' // background 地图-背景图
        }
      }
      this.$request.post(url, params).then(res => {
        this.bgList = res?.data || []
        // disPictureUrl
        this.bgList.forEach(item => {
          item.disPictureUrl = `${process.env.VUE_APP_BASE_PHOTO_URL}${item.pictureUrl}`
        })
      })
    },
    //  取消
    handleCancel() {
      // this.$emit('cancel')
      this.$router.go(-1)
    },
    //  保存
    handleSave() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          console.log(this.formData)
          this.$emit('save', this.formData)
        }
      })
    }
    //  验证经纬度
    // validateCode(rule, value, callback) {
    //   if (value) {
    //     if (!this.validateLatLng(value)) {
    //       callback(new Error('请输入正确的经纬度，如:116.404,39.915'))
    //     } else {
    //       callback()
    //     }
    //   } else {
    //     callback()
    //   }
    // },
    // validateLatLng(latLng) {
    //   const latLngPattern = /^-?([1-8]?\d{1}\.\d{1,6}|90\.\d{1,6}),\s?-?([1-8]?\d{1}\.\d{1,6}|90\.\d{1,6})$/
    //
    //   return latLngPattern.test(latLng)
    // }
  }
}
</script>

<style lang="scss" scoped>
.footer-container {
  background: #ffffff;
  text-align: center;
  padding: 20px;
}
.bg-list {
  display: flex;
  flex-wrap: wrap;

  .bg-item {
    border: 1px solid transparent;
    width: 200px;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 4px;
    border-radius: 4px;
    position: relative;

    .check-icon {
      color: #40A7FF;
      position: absolute;
      right: 0;
      top: 0;
    }

    img {
      width: 100%;
    }
  }
  .active {
    border: 1px solid #409EFF;
  }
}
</style>
