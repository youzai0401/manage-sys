<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      :title="`订单分配${currentType === 'detail' ? '详情' : ''}`"
      :visible.sync="showDialog"
      width="80%"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="审批人">
            <el-input v-model="formInline.user" placeholder="审批人" />
          </el-form-item>
          <el-form-item label="活动区域">
            <el-select v-model="formInline.region" placeholder="活动区域">
              <el-option label="区域一" value="shanghai" />
              <el-option label="区域二" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DispatchOrderBox',
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
    },
    currentType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
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
      val && this.getLogList()
    }
  },
  methods: {
    handleClose() {
      this.showDialog = false
    },
    getLogList() {
      this.$request.post('/product/log/pageQueryByProductId',
        {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
          page: this.currentPage,
          pageSize: this.pageSize,
          params: {
            productId: this.productId,
            page: this.currentPage,
            pageSize: this.pageSize
          }
        }).then(res => {
        const { data } = res
        if (data) {
          this.logList = data.pageData
          this.total = data.total
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
