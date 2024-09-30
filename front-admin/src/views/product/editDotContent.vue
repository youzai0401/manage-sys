<template>
  <div v-if="showPage" class="dot-manage-container">
    <!--  地图基础设置form表单  -->
    <h3>内容编辑</h3>
    <el-form
      ref="formData"
      v-loading="translatesLoading"
      :inline="false"
      :rules="formDataRules"
      label-position="left"
      :model="formData"
      label-width="180px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-if="!enPreview" v-model="formData.name" placeholder="请输入点位名称" />
        <el-input v-else v-model="translates[0].text" placeholder="请输入点位名称" @blur="(val) =>handleCheckDataChange(val,'name')" />
      </el-form-item>
      <el-form-item label="三方导航功能" prop="navigationSwitch">
        <el-switch
          v-model="formData.navigationSwitch"
          active-color="#40A7FF"
          inactive-color="#D3D3D3"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="归属菜单" prop="siteClassId">
        <!--    点位分类选择      -->
        <el-select v-model="formData.siteClassId" placeholder="请选择">
          <el-option
            v-for="item in dynamicTags"
            :key="item.siteClassId"
            :label="item.name"
            :value="item.siteClassId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="点位类型" prop="siteType">
        <el-select v-model="formData.siteType" placeholder="请选择">
          <el-option
            v-for="item in siteTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <template v-if="formData.siteType !== 'transfer'">
        <el-form-item label="图标选择" prop="image">
          <!-- 遍历iconList -->
          <div class="icon-list">
            <div
              v-for="item in iconList"
              :key="item.id"
              class="icon-item"
              :class="{ active: item.pictureUrl === formData.image }"
              @click="handleIconClick(item)"
            >
              <i v-if="item.pictureUrl === formData.image" class="el-icon-success check-icon" />
              <!--              <img :src="item.pictureUrl" alt="">-->
              <el-image
                :src="item.disPictureUrl"
                fit="contain"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="经纬度" prop="centralPointCoordinate">
          <div style="display: flex">
            <el-input v-model="formData.centralPointCoordinate" :disabled="!canEditCentralPointCoordinate" placeholder="请输入点位名称" />
            <el-button
              type="primary"
              style="margin-left: 10px"
              @click="canEditCentralPointCoordinate = !canEditCentralPointCoordinate"
            >{{ canEditCentralPointCoordinate ? '保存' : '编辑' }}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="上传多张图片" prop="pictures">
          <upload
            :img-list.sync="formData.pictures"
            :img-size="10"
            :img-type="['jpg', 'jpeg', 'png']"
            :multiple="true"
            :limit="999"
          />
        </el-form-item>
        <el-form-item label="简介（英文版预览）">
          <el-switch
            v-model="enPreview"
            active-color="#40A7FF"
            inactive-color="#D3D3D3"
          />
        </el-form-item>
        <el-form-item label="营业时间" prop="openTime">
          <el-input v-model="formData.openTime" placeholder="请输入营业时间" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactNumber">
          <el-input v-model="formData.contactNumber" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-if="!enPreview" v-model="formData.address" placeholder="请输入地址信息" />
          <el-input v-else v-model="translates[1].text" placeholder="请输入地址信息" @blur="(val) =>handleCheckDataChange(val,'address')" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input
            v-if="!enPreview"
            v-model="formData.introduce"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8}"
            show-word-limit
            maxlength="1000"
          />
          <el-input
            v-else
            v-model="translates[2].text"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8}"
            show-word-limit
            maxlength="1000"
            @blur="(val) =>handleCheckDataChange(val,'introduce')"
          />
        </el-form-item>
        <el-form-item v-if="!enPreview" label="音频" prop="audioUrl">
          <div style="display: flex;">
            <el-input v-model="formData.audioUrl" placeholder="请输入链接" />
            <el-button type="primary" style="margin-left: 10px; margin-right: 10px" @click="handleTransMp3">自动转音频</el-button>
            <el-upload
              action
              :before-upload="beforeUpload"
              :http-request="uploadVideo"
              class="video-class"
            >
              <el-button type="primary">本地上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item v-else label="英文版音频" prop="enAudioUrl">
          <div style="display: flex;">
            <el-input v-model="formData.enAudioUrl" placeholder="请输入链接" />
            <el-button type="primary" style="margin-left: 10px; margin-right: 10px" @click="handleTransMp3En">自动转音频</el-button>
            <el-upload
              action
              :before-upload="beforeUploadEn"
              :http-request="uploadVideoEn"
              class="video-class"
            >
              <el-button type="primary">本地上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="外链名称" prop="externalUrlName">
          <el-input v-if="!enPreview" v-model="formData.externalUrlName" placeholder="请输入外链名称" />
          <el-input v-else v-model="translates[3].text" placeholder="请输入外链名称" @blur="(val) =>handleCheckDataChange(val,'externalUrlName')" />
        </el-form-item>
        <el-form-item label="外部链接" prop="externalUrl">
          <el-input v-model="formData.externalUrl" placeholder="请输入外部链接" />
        </el-form-item>
        <el-form-item label="全景链接" prop="vrUrl">
          <el-input v-model="formData.vrUrl" placeholder="请输入外部链接" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="经纬度" prop="centralPointCoordinate">
          <div style="display: flex">
            <el-input v-model="formData.centralPointCoordinate" :disabled="!canEditCentralPointCoordinate" placeholder="请输入点位名称" />
            <el-button
              type="primary"
              style="margin-left: 10px"
              @click="canEditCentralPointCoordinate = !canEditCentralPointCoordinate"
            >{{ canEditCentralPointCoordinate ? '保存' : '编辑' }}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="简介（英文版预览）">
          <el-switch
            v-model="enPreview"
            active-color="#40A7FF"
            inactive-color="#D3D3D3"
          />
        </el-form-item>
        <el-form-item label="外链名称" prop="externalUrlName">
          <el-input v-if="!enPreview" v-model="formData.externalUrlName" placeholder="请输入外链名称" />
          <el-input v-else v-model="translates[3].text" placeholder="请输入外链名称" @blur="(val) =>handleCheckDataChange(val,'externalUrlName')" />
        </el-form-item>
        <el-form-item label="外部链接" prop="externalUrl">
          <el-input v-model="formData.externalUrl" placeholder="请输入外部链接" />
        </el-form-item>
      </template>
    </el-form>
    <div class="footer-container">
      <el-button type="primary" @click="handleCancel">取消</el-button>
      <el-button type="success" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script>
import upload from '@/views/product/components/upload'
import videoRequest from '@/utils/videoRequest'

export default {
  components: {
    upload
  },
  props: {
    productId: {
      type: String,
      default: ''
    },
    productMapId: {
      type: String,
      default: ''
    },
    siteId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      detailData: {},
      showPage: false,
      translatesLoading: false,
      dynamicTags: [],
      enPreview: false,
      canEditCentralPointCoordinate: false,
      siteTypeOptions: [
        {
          label: '讲解点',
          value: 'guide'
        },
        {
          label: '中转点',
          value: 'transfer'
        }
      ],
      translates: [
        {
          'fieldName': 'name', // 翻译的字段，参见如下的model中 现在有name:poi名称  address:地址  introduce:poi简介
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
          'fieldName': 'introduce',
          'fromLanguage': 'zh-cn',
          'toLanguage': 'en-us',
          'sourceText': '',
          'text': '',
          'isManual': 0
        },
        {
          'fieldName': 'externalUrlName',
          'fromLanguage': 'zh-cn',
          'toLanguage': 'en-us',
          'sourceText': '',
          'text': '',
          'isManual': 0
        }
      ],
      formData: {
        name: '',
        siteType: '',
        handPicture: '',
        centralPointCoordinate: '',
        pictures: [],
        openTime: '',
        contactNumber: '',
        address: '',
        introduce: '',
        audioUrl: '',
        enAudioUrl: '',
        externalUrlName: '',
        externalUrl: '',
        vrUrl: '',
        navigationSwitch: 0,
        siteClassId: '',
        image: '',
        leftTopCoordinate: '',
        rightBottomCoordinate: '',
        rightTopCoordinate: '',
        leftBottomCoordinate: '',
        audioDuration: ''
      },
      formDataRules: {
        name: [
          { required: true, message: '请输入点位名称', trigger: 'blur' }
        ],
        siteClassId: [
          { required: true, message: '请选择归属菜单', trigger: 'change' }
        ],
        siteType: [
          { required: true, message: '请选择点位类型', trigger: 'change' }
        ],
        centralPointCoordinate: [
          { required: true, message: '请输入经纬度', trigger: 'blur' }
        ],
        image: [
          { required: true, message: '请选择图标', trigger: 'change' }
        ]
      },
      iconList: [],
      isSaveLoading: false,
      fileInfo: null,
      fileInfoEn: null
    }
  },
  watch: {
    enPreview(val) {
      if (val) {
        this.$nextTick(() => {
          this.getTranslate()
        })
      }
    }
  },
  created() {
    if (this.productMapId) {
      this.getProductMapDetail()
      this.getClassList()
    }

    this.getDotDetail()
    this.getIconList()
  },
  methods: {
    beforeUpload(file) {
      this.fileInfo = file
    },
    async uploadVideo() {
      const formData = new FormData()
      formData.append('audio', this.fileInfo)
      formData.append('caller', 'deer.front')
      formData.append('memberId', '88888888888')
      const path = `${process.env.VUE_APP_BASE_UPLOAD_API}upload/audio/single`
      const config = {
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        baseURL: ''
      }
      const res = await this.$request.post(path, formData, config)
      if (res) {
        this.formData.audioUrl = res?.data?.path
        this.formData.audioDuration = res?.data?.duration
      }
    },
    beforeUploadEn(file) {
      this.fileInfoEn = file
    },
    async uploadVideoEn() {
      const formData = new FormData()
      formData.append('audio', this.fileInfoEn)
      formData.append('caller', 'deer.front')
      formData.append('memberId', '88888888888')
      const path = `${process.env.VUE_APP_BASE_UPLOAD_API}upload/audio/single`
      const config = {
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        baseURL: ''
      }
      const res = await this.$request.post(path, formData, config)
      if (res) {
        this.formData.enAudioUrl = res?.data?.path
      }
    },
    handleIconClick(item) {
      this.formData.image = item.pictureUrl
    },
    getIconList() {
      const url = 'picture/listQuery'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'pictureType': 'icon' // 图标
        }
      }
      this.$request.post(url, params).then(res => {
        this.iconList = res.data
        this.iconList.forEach(item => {
          item.disPictureUrl = `${process.env.VUE_APP_BASE_PHOTO_URL}${item.pictureUrl}`
        })
      })
    },
    getTranslate() {
      if (!(this.formData.name || this.formData.address || this.formData.introduce || this.formData.externalUrlName)) {
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
      if (this.formData.name && this.translates[0].isManual === 0) {
        params.params.translateModels.push({
          'key': 'name', // 翻译的字段，参见如下的model中 现在有poiName:poi名称  address:地址  poiIntroduce:poi简介
          'sourceText': this.formData.name // 源 中文
        })
      }
      if (this.formData.address && this.translates[1].isManual === 0) {
        params.params.translateModels.push({
          'key': 'address',
          'sourceText': this.formData.address
        })
      }
      if (this.formData.introduce && this.translates[2].isManual === 0) {
        params.params.translateModels.push({
          'key': 'introduce',
          'sourceText': this.formData.introduce
        })
      }
      if (this.formData.externalUrlName && this.translates[3].isManual === 0) {
        params.params.translateModels.push({
          'key': 'externalUrlName',
          'sourceText': this.formData.externalUrlName
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
    getDotDetail() {
      const url = 'product/site/detailWithSiteId'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'siteId': this.siteId // 必传，传入 siteId
        }
      }
      this.$request.post(url, params).then(res => {
        Object.assign(this.formData, res.data)
        if (this.formData.pictures) {
          this.formData.pictures = this.formData.pictures.split(',')
        } else {
          this.formData.pictures = []
        }
        this.formData.siteType = this.formData.siteType || 'guide'
        // 需要更新翻译的字段
        if (this.formData?.nameTranslateModel) {
          this.translates[0].sourceText = this.formData?.nameTranslateModel?.sourceText
          this.translates[0].text = this.formData?.nameTranslateModel?.text
          this.translates[0].isManual = this.formData?.nameTranslateModel?.isManual
        }
        if (this.formData?.addressTranslateModel) {
          this.translates[1].sourceText = this.formData?.addressTranslateModel?.sourceText
          this.translates[1].text = this.formData?.addressTranslateModel?.text
          this.translates[1].isManual = this.formData?.addressTranslateModel?.isManual
        }
        if (this.formData?.introduceTranslateModel) {
          this.translates[2].sourceText = this.formData?.introduceTranslateModel?.sourceText
          this.translates[2].text = this.formData?.introduceTranslateModel?.text
          this.translates[2].isManual = this.formData?.introduceTranslateModel?.isManual
        }
        if (this.formData?.externalUrlNameTranslateModel) {
          this.translates[3].sourceText = this.formData?.externalUrlNameTranslateModel?.sourceText
          this.translates[3].text = this.formData?.externalUrlNameTranslateModel?.text
          this.translates[3].isManual = this.formData?.externalUrlNameTranslateModel?.isManual
        }
        this.$emit('updatePoi', { type: 'init', data: this.formData })
      })
    },
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
    },
    getClassList() {
      // 接口请求 product/site/class/listQueryAll
      const url = 'product/site/class/listQueryAll'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
        'params': {
          'productId': this.productId, // 必传，传入 productId
          'productMapId': this.productMapId // 必传，上一步中保存的地图id
        }
      }
      this.$request({ url, method: 'post', data: params }).then(res => {
        this.dynamicTags = res.data
        // 默认选中第一个
      }).catch(err => {
        console.log(err)
      })
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
        this.detailData = res.data
        this.detailData.backgroundPicture = [res.data.backgroundPicture]
        this.detailData.handPicture = [res.data.handPicture]
        this.showPage = true
      }).catch(err => {
        console.log(err)
      })
    },
    handleTransMp3() {
      if (this.formData.introduce.length === 0) {
        this.$message.warning('请先输入介绍')
        return
      }
      const url = `${process.env.VUE_APP_BASE_UPLOAD_API}upload/audio/textToAudio`
      console.log(url)
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'text': this.formData.introduce
        }
      }
      videoRequest.post(url, params).then(res => {
        this.formData.audioUrl = res?.data?.path
        this.formData.audioDuration = res?.data?.duration
      })
    },
    handleTransMp3En() {
      if (this.translates[2].text.length === 0) {
        this.$message.warning('请先输入英文介绍')
        return
      }
      const url = `${process.env.VUE_APP_BASE_UPLOAD_API}upload/audio/textToAudio`
      console.log(url)
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'text': this.translates[2].text
        }
      }
      videoRequest.post(url, params).then(res => {
        this.formData.enAudioUrl = res?.data?.path
        // this.formData.audioDuration = res?.data?.duration
      })
    },
    handleSave() {
      // 保存
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          const temp = JSON.parse(JSON.stringify(this.formData))
          temp.pictures = temp.pictures.join(',')
          const url = 'product/site/change'
          const params = {
            'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
            'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
            'params': {
              'translateModels': this.translates
            },
            'model': {
              'siteId': this.siteId, // 必传，传入 siteId
              'productId': this.productId, // 必传，传入 productId
              'productMapId': this.productMapId, // 必传，上一步中保存的地图id
              ...temp
            }
          }
          this.translates.forEach(item => {
            item.productId = this.productId
            item.childId = this.siteId
            item.scene = 'site'
          })
          // this.translates过滤掉isManual不为1的数据
          params.params.translateModels = this.translates.filter(item => item.isManual === 1 || item.isManual === '1')
          console.log('???', params)
          this.isSaveLoading = true
          this.$request.post(url, params).then(res => {
            this.$message({
              message: '保存成功',
              type: 'success'
            })
            this.isSaveLoading = false
            this.$emit('cancel')
            this.$emit('updatePoi', { type: 'save' })
          }).catch(err => {
            this.isSaveLoading = false
            console.log(err)
          })
        } else {
          this.$message({
            message: '请完善信息',
            type: 'warning'
          })
          return false
        }
      })
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>
<style lang="scss" scoped>
.dot-manage-container {
    background: #ffffff;
    padding-bottom: 50px;

  .icon-list {
    display: flex;
    flex-wrap: wrap;

    .icon-item {
      border: 1px solid transparent;
      //width: 100px;
      width: 41px;
      height: 43px;
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
        //width: 100%;
      }
    }
    .active {
      border: 1px solid #409EFF;
    }
  }
  .footer-container {
    background: #ffffff;
    text-align: center;
    padding-bottom: 50px;
  }
  .video-class {
    ::v-deep .el-upload-list {
      display: none;
    }
  }
}
</style>
