<template>
  <div class="container">
    <div>
      <span class="show-preview-title">英文版预览</span>
      <el-switch
        v-model="enPreview"
        active-color="#40A7FF"
        inactive-color="#D3D3D3"
      />
    </div>
    <div class="add-form-container">
      <el-form ref="formData" v-loading="translatesLoading" :inline="false" :rules="formDataRules" label-position="left" :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="11">
            <el-form-item v-if="!enPreview" label="POI名称" prop="poiName">
              <!--              <el-input v-model="formData.poiName" placeholder="请输入POI名称" />-->
              <el-select
                v-model="formData.poiName"
                filterable
                remote
                style="width: 100%"
                clearable
                placeholder="请输入关键词"
                :remote-method="remoteMethodPoi"
                :loading="poiLoading"
                @change="handlePoiChange"
              >
                <el-option
                  v-for="item in poiOptions"
                  :key="item.poiId"
                  :label="item.name"
                  :value="item.poiId"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-else label="POI名称" prop="poiName">
              <el-input v-model="translates[0].text" placeholder="请输入POI英文名称" @blur="(val) =>handleCheckDataChange(val,'poiName')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="11">
            <el-form-item v-if="!enPreview" key="p1" label="所在城市" prop="cityId">
              <el-select
                v-model="formData.cityId"
                filterable
                remote
                clearable
                style="width: 100%"
                placeholder="请选择所在城市区域"
                :remote-method="remoteMethod"
                :loading="searchLoading"
              >
                <el-option
                  v-for="item in cityOptions"
                  :key="item.areaId"
                  :label="item.showFullName"
                  :value="item.areaId"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="enPreview" key="p2" label="所在城市" prop="cityId">
              <el-select
                v-model="formData.cityId"
                filterable
                remote
                clearable
                style="width: 100%"
                placeholder="请选择所在城市区域"
                :remote-method="remoteMethod"
                :loading="searchLoading"
              >
                <el-option
                  v-for="item in cityOptions"
                  :key="item.areaId"
                  :label="item.enShowFullName"
                  :value="item.areaId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="营业时间" prop="openTime">
              <el-input v-model="formData.openTime" placeholder="请输入营业时间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="11">
            <el-form-item v-if="!enPreview" label="详细地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入详细地址" />
            </el-form-item>
            <el-form-item v-else label="详细地址" prop="address">
              <el-input
                v-model="translates[1].text"
                placeholder="请输入详细地址"
                @blur="(val) =>handleCheckDataChange(val,'address')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="联系电话" prop="contactNumber">
              <el-input v-model="formData.contactNumber" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="11">
            <el-form-item label="售价" prop="price">
              <el-input v-model="formData.price" placeholder="请输入价格"><span slot="suffix">/元</span></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="vr地址" prop="vrUrl">
          <el-input v-model="formData.vrUrl" placeholder="请输入vr地址" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverPicture">
          <upload
            :img-list.sync="formData.coverPicture"
            :img-size="1"
            :img-type="['jpg', 'jpeg', 'png']"
            :limit="1"
          />
        </el-form-item>
        <el-form-item label="POI标签" prop="isValid">
          <div class="pio-container">
            <div class="poi-content">
              <span>POI亮点</span>
              <el-checkbox-group v-model="formData.lightPoiLabelIds" @change="handleCheckedPoiLabelChange">
                <el-checkbox
                  v-for="item in lightList"
                  :key="item.poiLabelId"
                  :label="item.poiLabelId"
                >{{ enPreview ? item.poiLabelEnName : item.poiLabelName }}</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="poi-content">
              <span>POI属性</span>
              <el-checkbox-group v-model="formData.naturePoiLabelIds" @change="handleCheckedPoiLabelChange">
                <el-checkbox
                  v-for="item in natureList"
                  :key="item.poiLabelId"
                  :label="item.poiLabelId"
                >{{ enPreview ? item.poiLabelEnName : item.poiLabelName }}</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="poi-content">
              <span>POI类别</span>
              <el-checkbox-group v-model="formData.categoryPoiLabelIds" @change="handleCheckedPoiLabelChange">
                <el-checkbox
                  v-for="item in categoryList"
                  :key="item.poiLabelId"
                  :label="item.poiLabelId"
                >{{ enPreview ? item.poiLabelEnName : item.poiLabelName }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="!enPreview" label="POI简介">
          <el-input v-model="formData.poiIntroduce" type="textarea" :autosize="{ minRows: 4, maxRows: 8}" show-word-limit maxlength="1000" />
        </el-form-item>
        <el-form-item v-else label="POI简介">
          <el-input
            v-model="translates[2].text"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8}"
            show-word-limit
            maxlength="1000"
            @blur="(val) =>handleCheckDataChange(val,'poiIntroduce')"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="footer-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="primary" plain @click="handleSave('next')">下一步，地图管理</el-button>
    </div>

  </div>
</template>

<script>
import upload from '@/views/product/components/upload'
export default {
  name: 'AddAndEditProduct',
  components: {
    upload
  },
  data() {
    return {
      enPreview: false,
      searchLoading: false,
      translatesLoading: false,
      poiLoading: false,
      poiOptions: [],
      formData: {
        poiId: '',
        poiName: '',
        lonlat: '',
        cityId: '',
        openTime: '',
        address: '',
        contactNumber: '',
        price: '',
        coverPicture: [],
        poiIntroduce: '',
        lightPoiLabelIds: [],
        categoryPoiLabelIds: [],
        naturePoiLabelIds: [],
        lon: '',
        lat: '',
        vrUrl: ''
      },
      cityOptions: [],
      dialogImageUrl: '',
      dialogVisible: false,
      formDataRules: {
        poiName: [
          { required: true, message: '请输入POI名称', trigger: 'blur' }
        ],
        lonlat: [
          { required: true, message: '请输入经纬度', trigger: 'blur' }
        ],
        cityId: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        openTime: [
          { required: true, message: '请输入营业时间', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        contactNumber: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        // coverPicture: [
        //   { required: true, message: '请上传封面图', trigger: 'blur' }
        // ],
        checkedPoiLabel: [
          { required: true, message: '请选择POI标签', trigger: 'change' }
        ]
      },
      categoryList: [],
      lightList: [],
      natureList: [],
      translates: [
        {
          'fieldName': 'poiName', // 翻译的字段，参见如下的model中 现在有poiName:poi名称  address:地址  poiIntroduce:poi简介
          'fromLanguage': 'zh-cn', // 翻译的源语言  中文   目前固定传参
          'toLanguage': 'en-us', // 翻译的目标语言   英文   目前固定传参
          'sourceText': '', // 源 中文
          'text': '', // 目标翻译后的语言  英文
          'isManual': 0 // 用户是否手动修改   1 修改， 0 未修改
        },
        {
          'fieldName': 'address',
          'fromLanguage': 'zh-cn',
          'toLanguage': 'en-us',
          'sourceText': '',
          'text': '',
          'isManual': 0
        },
        {
          'fieldName': 'poiIntroduce',
          'fromLanguage': 'zh-cn',
          'toLanguage': 'en-us',
          'sourceText': '',
          'text': '',
          'isManual': 0
        }
      ],
      fileList: [],
      fileInfo: {},
      uploadLimit: 1,
      isSaving: false
    }
  },
  watch: {
    enPreview(val) {
      if (val) {
        this.getTranslate()
      }
    }
  },
  created() {
    this.getPoiData()
    // 获取参数type和productId
    this.productId = this.$route.query.productId
    if (this.productId) {
      this.getEditData()
    }
  },
  methods: {
    handleCheckDataChange(val, type) {
      // 判断val和translates对应type的值是否一致
      this.translates.forEach(item => {
        if (item.fieldName === type && item.isManual === 0) {
          if (item.sourceText !== val) {
            item.isManual = 1
          } else {
            item.isManual = 0
          }
        }
      })
      console.log(this.translates)
    },
    handleGoMap() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          this.$router.push({
            path: '/product/mapManage',
            query: {
              productId: this.productId
            }
          })
        } else {
          this.$message.error('请完善信息')
          return false
        }
      })
    },
    getEditData() {
      const params = {
        'timestamp': 1650182275596, // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.manage 代表 后台系统
        'params': {
          'productId': this.productId // 必传，传入 productId
        }
      }
      const url = 'product/detailByProductId'
      // 请求数据
      this.$request.post(url, params).then(res => {
        if (res?.data) {
          this.formData = res.data
          this.formData.lightPoiLabelIds = this.formData.lightPoiLabelIds.split(';').filter(item => item)
          this.formData.categoryPoiLabelIds = this.formData.categoryPoiLabelIds.split(';').filter(item => item)
          this.formData.naturePoiLabelIds = this.formData.naturePoiLabelIds.split(';').filter(item => item)
          this.formData.coverPicture = this.formData.coverPicture ? [this.formData.coverPicture] : []
          this.fileList = this.formData.coverPicture.map(item => {
            return {
              name: item,
              url: item
            }
          })
          console.log(this.formData)
          // 需要根据返回值，重新给this.translates赋值
          // this.translates.forEach(item => {
          //   item.sourceText = this.formData[item.fieldName]
          //   item.text = this.formData[item.fieldName]
          // })
          if (this.formData?.poiIntroduceTranslateModel) {
            this.translates[2].sourceText = this.formData?.poiIntroduceTranslateModel?.sourceText
            this.translates[2].text = this.formData?.poiIntroduceTranslateModel?.text
            this.translates[2].isManual = this.formData?.poiIntroduceTranslateModel?.isManual
          }
          if (this.formData?.poiNameTranslateModel) {
            this.translates[0].sourceText = this.formData?.poiNameTranslateModel?.sourceText
            this.translates[0].text = this.formData?.poiNameTranslateModel?.text
            this.translates[0].isManual = this.formData?.poiNameTranslateModel?.isManual
          }
          if (this.formData?.addressTranslateModel) {
            this.translates[1].sourceText = this.formData?.addressTranslateModel?.sourceText
            this.translates[1].text = this.formData?.addressTranslateModel?.text
            this.translates[1].isManual = this.formData?.addressTranslateModel?.isManual
          }
          this.remoteMethod(this.formData.cityName)
        }
      })
    },
    handlePoiChange(val) {
      console.log(val)
      // val和poiOptions对比，找到符合的值
      const temp = this.poiOptions.find(item => item.poiId === val)
      console.log(temp)
      this.formData.poiName = temp?.name
      this.formData.poiId = temp?.poiId
      this.formData.address = temp?.address
      this.formData.cityId = temp?.cityId
      this.formData.price = temp?.price
      this.formData.openTime = temp?.openTime
      this.formData.labels = temp?.labels
      this.formData.lon = temp?.lon
      this.formData.lat = temp?.lat
      this.formData.vrUrl = temp?.vrUrl

      if (this.formData.cityId) {
        this.remoteMethod(temp.cityName)
      }
      if (this.formData.labels) {
        // 需要遍历labels，找到对应的标签，放到对应的数组中
        const labels = this.formData.labels.split(',')
        for (let i = 0; i < labels.length; i++) {
          const item = labels[i]
          const temp = this.categoryList.find(item1 => item1.poiLabelName === item)
          if (temp) {
            const poiLabelId = temp.poiLabelId
            !this.formData.categoryPoiLabelIds.includes(poiLabelId) && this.formData.categoryPoiLabelIds.push(poiLabelId)
            break
          }

          const temp1 = this.lightList.find(item1 => item1.poiLabelName === item)
          if (temp1) {
            const poiLabelId = temp1.poiLabelId
            !this.formData.lightPoiLabelIds.includes(poiLabelId) && this.formData.lightPoiLabelIds.push(poiLabelId)
            break
          }

          const temp2 = this.natureList.find(item1 => item1.poiLabelName === item)
          if (temp2) {
            const poiLabelId = temp2.poiLabelId
            !this.formData.naturePoiLabelIds.includes(poiLabelId) && this.formData.naturePoiLabelIds.push(poiLabelId)
            break
          }
        }
      }
      if (temp.gradeId) {
        const findItem = this.natureList.find(item => item.poiLabelName.startsWith(temp.gradeId))
        if (findItem) {
          !this.formData.naturePoiLabelIds.includes(findItem.poiLabelId) && this.formData.naturePoiLabelIds.push(findItem.poiLabelId)
        }
      }
    },
    remoteMethodPoi(query) {
      if (query !== '') {
        this.poiLoading = true
        // 请求
        const url = 'poi/listQuery'
        const params = {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
          'params': {
            'name': query // 必传
          }
        }
        this.$request.post(url, params).then(res => {
          if (res) {
            this.poiOptions = res.data
          }
          this.poiLoading = false
        }).catch(() => {
          this.poiLoading = false
        })
      } else {
        this.poiOptions = []
      }
    },
    remoteMethod(query) {
      if (query !== '') {
        this.searchLoading = true
        // 请求
        const url = 'area/getCityAreasByName'
        const params = {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
          'params': {
            'areaName': query // 必传
          }
        }
        this.$request.post(url, params).then(res => {
          if (res) {
            this.cityOptions = res.data
          }
          this.searchLoading = false
        }).catch(() => {
          this.searchLoading = false
        })
      } else {
        this.cityOptions = []
      }
    },
    getTranslate() {
      if (!(this.formData.poiName || this.formData.address || this.formData.poiIntroduce)) {
        return
      }
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'params': {
          'fromLanguage': 'zh-cn', // 必传 中文
          'toLanguage': 'en-us', // 必传 英文
          'engine': 'baidu', // 翻译引擎，目前百度，后续会有 youdao 有道  tencent 腾讯 google 谷歌
          'translateModels': []
        }
      }
      if (this.formData.poiName && this.translates[0].isManual === 0) {
        params.params.translateModels.push({
          'key': 'poiName', // 翻译的字段，参见如下的model中 现在有poiName:poi名称  address:地址  poiIntroduce:poi简介
          'sourceText': this.formData.poiName // 源 中文
        })
      }
      if (this.formData.address && this.translates[1].isManual === 0) {
        params.params.translateModels.push({
          'key': 'address',
          'sourceText': this.formData.address
        })
      }
      if (this.formData.poiIntroduce && this.translates[2].isManual === 0) {
        params.params.translateModels.push({
          'key': 'poiIntroduce',
          'sourceText': this.formData.poiIntroduce
        })
      }
      if (params.params.translateModels.length <= 0) {
        return
      }
      const url = 'translate/models'
      this.translatesLoading = true
      this.$request.post(url, params).then(res => {
        this.translatesLoading = false
        // 通过key更新翻译的值
        for (const item of res.data) {
          // 便利translates数组，找到对应的key，更新翻译的值
          for (const translate of this.translates) {
            if (translate.fieldName === item.key) {
              translate.text = item.text
              translate.returnText = item.text
              translate.sourceText = item.sourceText
              break
            }
          }
        }
      }).catch(() => {
        this.translatesLoading = false
      })
    },
    getPoiData() {
    //  通过接口获取数据poi/label/poiLabelList
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'params': {
          'poiLabelTypes': [
            'light', // poi 亮点
            'nature', // poi 属性
            'category' // poi 类别
          ]
        }
      }
      const url = 'poi/label/poiLabelList'
      this.$request.post(url, params).then(res => {
        this.categoryList = res.data.category
        this.lightList = res.data.light
        this.natureList = res.data.nature

        // 默认需要选择中英文亮点
        if (!this.productId) {
          this.lightList.forEach(item => {
            if (item.poiLabelName === '中英文') {
              this.formData.lightPoiLabelIds.push(item.poiLabelId)
            }
          })
        }
      })
    },
    handleCheckedPoiLabelChange(val) {
      console.log(val)
    },
    handleCancel() {
      this.$router.go(-1)
    },
    handleSave(type) {
      if (type === 'next' && !this.productId) {
        this.$message({
          message: '请先保存基本信息',
          type: 'warning'
        })
        return
      }
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          if (this.isSaving) {
            return
          }
          this.isSaving = true
          const temp = JSON.parse(JSON.stringify(this.formData))
          temp.lightPoiLabelIds = this.formData.lightPoiLabelIds.join(';')
          temp.naturePoiLabelIds = this.formData.naturePoiLabelIds.join(';')
          temp.categoryPoiLabelIds = this.formData.categoryPoiLabelIds.join(';')

          temp.coverPicture = this.formData.coverPicture[0]
          const submitData = {
            'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
            'caller': 'deer.front', // 访问标识，用来进行系统的并发控制  deer.front 代表微信小程序  deer.manage 代表 后台系统
            'params': {
              'translateModels': this.translates
            },
            'model': temp
          }
          let url = 'product/create'
          if (this.productId) {
            url = 'product/change'
            submitData.model.productId = this.productId
            this.translates.forEach(item => {
              item.productId = this.productId
            })
          }
          // this.translates过滤掉isManual不为1的数据
          submitData.params.translateModels = this.translates.filter(item => item.isManual === 1 || item.isManual === '1')
          this.$request.post(url, submitData).then(res => {
            this.isSaving = false
            this.$message({
              message: '保存成功',
              type: 'success'
            })
            if (res?.data) {
              this.productId = res.data.productId
            }
            if (type === 'next') {
              this.handleGoMap()
            }
          }).catch(() => {
            this.isSaving = false
          })
        } else {
          this.isSaving = false
          this.$message({
            message: '请完善信息',
            type: 'warning'
          })
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 24px 24px 0;
  background: #F7F8FC;
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  .show-preview-title {
    margin-right: 10px;
    display: inline-block;
    margin-bottom: 18px;
  }
  .add-form-container {
    flex: 1;
    overflow: auto;
    background: #ffffff;
    padding: 35px 30px ;
  }
  .pio-container {
    border-radius: 2px;
    border: 1px solid #E3E3E3;
    padding: 20px;
    .poi-content {
      margin-bottom: 20px;
    }
  }
  .footer-container {
    background: #ffffff;
    text-align: center;
    padding-bottom: 50px;
  }
}
</style>
