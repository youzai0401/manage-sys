<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      :title="`${productName}-操作日志`"
      :visible.sync="showDialog"
      width="80%"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-table :data="logList" border>
          <el-table-column align="center" label="序号" width="95">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="日期" width="180">\
            <template slot-scope="scope">
              {{ scope.row.createTime | formatDate }}
            </template>
          </el-table-column>
          <el-table-column prop="creatorName" label="操作员" width="180" />
          <el-table-column prop="logEvent" label="事件" width="180" />
          <el-table-column prop="errorReason" label="报错" :min-width="180" />
        </el-table>
        <el-pagination
          class="pagination"
          background
          :current-page="currentPage"
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'LogInfo',
  filters: {
    formatDate(time) {
      if (!time) return ''
      // dayjs处理时间
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  props: {
    productId: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    },
    productName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      logList: [],
      total: 0,
      pageSize: 10,
      currentPage: 1
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
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getLogList()
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
