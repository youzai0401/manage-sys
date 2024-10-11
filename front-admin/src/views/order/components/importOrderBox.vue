<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      title="导入订单"
      :visible.sync="showDialog"
      width="400"
      @close="handleClose"
    >
      <div class="log-info__content">
        <div>1、点击下载EXCEL模板并填写订单信息 <el-button type="text" @click="handleDownload">点击下载</el-button></div>
        <div>2、上传填写好的EXCEL文件
          <el-upload
            ref="upload"
            style="margin-left: 8px;display: inline-table;"
            action
            :before-upload="beforeUpload"
            :http-request="uploadFile"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <!--          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
          </el-upload></div>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
        <!--        <el-button :loading="saveLoading" @click="handleImport">导入</el-button>-->
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ImportOrderBox',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileInfo: null,
      fileUrl: '',
      saveLoading: false
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      }
    }
  },
  watch: {
    show(val) {
      val && this.initData()
    }
  },
  methods: {
    beforeUpload(file) {
      this.fileInfo = file
    },
    handleDownload() {
      this.$request.get('/orders/template/download', {
        responseType: 'blob'
      }).then(res => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', decodeURIComponent('订单模板.xlsx')) // 解码，这里也可以自定义下载的文件名字，如link.setAttribute('download', 'xxxxxdownload.xls')
        document.body.appendChild(link)
        link.click() // 用新窗口打开window.open(link.click())，但是下载完成后不会先get请求那样自动关闭窗口
      }).catch(() => {
      })
    },
    async uploadFile() {
      const formData = new FormData()
      formData.append('file', this.fileInfo)
      const config = {
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const res = await this.$request.post('/orders/import', formData, config).catch(err => {
        console.log(err)
      })
      if (res.success) {
        this.$alert(res.message, '订单导入', {
          confirmButtonText: '确定',
          callback: action => {
            this.showDialog = false
            this.$emit('success')
          }
        })
        // 刷新页面
      } else {
        this.$alert(res.message, '订单导入', {
          confirmButtonText: '确定',
          callback: action => {
            this.$refs.upload.clearFiles()
          }
        })
      }
    },
    handleImport() {

    },
    handleClose() {
      this.showDialog = false
    },
    async initData() {
      await this.$nextTick()
      this.$refs.upload.clearFiles()
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  text-align: right;
  padding: 10px 0;
}
</style>
