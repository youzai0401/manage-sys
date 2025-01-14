<template>
  <div class="log-info">
    <el-dialog
      title="扫码录入"
      :visible.sync="showDialog"
      width="600px"
      @close="handleClose"
    >
      <div style="text-align: center">
        <img id="img" style="width: 400px" :src="url" alt="">
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import QRCode from 'qrcode'
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
      QRCodeMsg: '',
      userInfo: {},
      url: ''
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
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
  },
  methods: {
    handleClose() {
      this.showDialog = false
    },
    async initData() {
      await this.$nextTick()
      const url = `${process.env.VUE_APP_BASE_API}/auth/servicePoint/${this.userInfo.service_point_id}`
      this.$request.get(url).then(res => {
        if (res.success) {
          // 将URL赋值给<img>标签的src属性
          document.getElementById('img').src = res.data
        } else {
          this.$message.error(res.message)
        }
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
