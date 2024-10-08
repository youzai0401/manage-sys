<template>
  <div>
    <el-upload
      ref="upload"
      :file-list="fileList"
      :show-file-list="true"
      action
      :multiple="multiple"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :http-request="uploadPicture"
      :limit="limit"
      :class="{hide:limit === fileList.length}"
    >
      <i class="el-icon-plus" />
      <div slot="tip" style="color: #CCCCCC" class="el-upload__tip">{{ tips }}</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Upload',
  props: {
    uploadUrl: {
      type: String,
      default: 'upload/picture/single'
    },
    tips: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 1
    },
    allowType: {
      type: Array,
      default: () => ['jpeg', 'jpg', 'png']
    },
    imgSize: {
      type: Number,
      default: 1
    },
    imgList: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      fileInfo: {}
    }
  },
  watch: {
    imgList: {
      handler(val) {
        this.fileList = val.map(e => {
          return {
            name: e,
            url: `${process.env.VUE_APP_BASE_PHOTO_URL}${e}`
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async uploadPicture(param) {
      // http-request钩子参数名只能用param
      // console.log('param:', param);
      const fileInfo = this.fileInfo
      const path = `${process.env.VUE_APP_BASE_UPLOAD_API}${this.uploadUrl}`
      console.log('fileInfo:', fileInfo, path)
      const formData = new FormData()
      formData.append('picture', fileInfo)
      formData.append('caller', 'deer.front')
      formData.append('memberId', '88888888888')

      const config = {
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        baseURL: ''
      }
      const res = await this.$request.post(path, formData, config)
      if (res) {
        if (this.limit === 1) {
          // 上传成功后，将返回的图片地址赋值给imgList
          this.$emit('update:imgList', Array.isArray(res.data) ? res.data : [res.data])
        } else {
          // 上传成功后，将返回的图片地址push到imgList
          this.$emit('update:imgList', [...this.imgList, res.data])
        }
      }
    },
    beforeUpload(file) {
      const isAllowSize = file.size / 1024 / 1024 < this.imgSize
      const allowType = this.allowType
      const isAllowType = allowType.some(e => 'image/' + e === file.type)
      if (!isAllowType) {
        this.$notify({
          message: `上传图片只能是 ${allowType} 格式!`,
          type: 'warning'
        })
        // 不能直接return 空值，不然就算格式不符合也会生成缩略图
        return Promise.reject()
      }
      if (!isAllowSize) {
        this.$notify({
          message: `上传图片大小不能超过 ${this.imgSize}MB!`,
          type: 'warning'
        })
        return Promise.reject()
      }
      this.fileChange(file)
      return isAllowType && isAllowSize
    },
    fileChange(file) {
      console.log('fileChange:')
      // 单个图片直接赋值，如果需要多个图片，改为对象数组
      this.fileInfo = file
      // const url = URL.createObjectURL(file)
      // console.log(url);
      // this.fileList.push({ uid: file.uid, url })
      // 文件到达上限后隐藏上传按钮
      this.hideUploadEdit = this.fileList.length >= this.uploadLimit
    },
    onLoadImg(e) {
      const img = e.target
      let width = 0
      if (img.fileSize > 0 || (img.naturalWidth > 1 && img.naturalHeight > 1)) {
        width = img.naturalWidth
      }
      console.log('图片大小:', img.naturalWidth, img.naturalHeight)
      if (img.naturalWidth < 200) {
        width = 200
      } else if (img.naturalHeight > img.naturalWidth && width > 370) {
        width = 370
      } else if (width > 1000) {
        width = 1000
      }
      this.imgWidth = width + 'px'
      this.dialogWidth = width + 40 + 'px'
      console.log('imgWidth:', this.imgWidth)
      console.log('dialogWidth:', this.dialogWidth)
    },
    handleRemove(file) {
      console.log(file)
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i]['uid'] === file.uid) {
          this.fileList.splice(i, 1)
          break
        }
      }
      this.$emit('update:imgList', this.fileList.map(e => e.name))
      // if (this.fileList.length <= 0) {
      //   this.formData.imagePath = ''
      // }
      // 文件未到达上限后显示上传按钮
      this.hideUploadEdit = this.fileList.length > this.uploadLimit - 1
      console.log('handleRemove:', this.hideUploadEdit)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .hide .el-upload--picture-card {
  display: none;
}
</style>
