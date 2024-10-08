<template>
  <div class="log-info">
    <el-dialog
      title="扫码录入"
      :visible.sync="showDialog"
      width="500"
      @close="handleClose"
    >
      <div style="text-align: center">
        <canvas id="QRCode_header" />
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcode'
export default {
  name: 'EditBox',
  props: {
    currentRowData: {
      type: Object,
      default() {
        return {}
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      saveLoading: false,
      QRCodeMsg: ''
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
    handleClose() {
      this.showDialog = false
    },
    async initData() {
      await this.$nextTick()
      const opts = {
        errorCorrectionLevel: 'H', // 容错级别
        type: 'image/png', // 生成的二维码类型
        quality: 0.3, // 二维码质量
        margin: 0, // 二维码留白边距
        width: 200, // 宽
        height: 180, // 高
        text: 'http://www.xxx.com', // 二维码内容
        color: {
          dark: '#333', // 前景色
          light: '#eee'// 背景色
        }
      }
      this.QRCodeMsg = 'http://www.baidu.com' // 生成的二维码为URL地址js
      const msg = document.getElementById('QRCode_header')
      // 将获取到的数据（val）画到msg（canvas）上
      QRCode.toCanvas(msg, this.QRCodeMsg, opts, function(error) {
        console.log(error)
      })
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
