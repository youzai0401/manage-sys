<template>
  <div class="app-container">
    <!--搜索项-->
    <div class="page-header" style="margin-bottom: 10px; display: flex; flex: 1">
      <p>订单ID：{{ queryData.order_id }}</p>
      <p>产品编码：{{ queryData.product_code }}</p>
      <p>订单编号：{{ queryData.order_number }}</p>
      <p>订单名称：{{ queryData.order_name }}</p>
    </div>

    <!--列表展示-->
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="数据加载中..."
      border
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column align="center" label="支付单ID" min-width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.payment_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="工单ID" min-width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.work_order_id }}
        </template>
      </el-table-column>
      <el-table-column label="支付金额(元)" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.estimated_return_date }}
        </template>
      </el-table-column>
      <el-table-column label="收款人" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.worker_name }}
        </template>
      </el-table-column>
      <el-table-column label="工号" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.worker_id }}
        </template>
      </el-table-column>
      <el-table-column label="支付时间" width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.payment_date }}
        </template>
      </el-table-column>
      <el-table-column label="交易单号" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.transaction_number }}
        </template>
      </el-table-column>
      <el-table-column label="奖励（元）" min-width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.reward_salary }}
        </template>
      </el-table-column>
      <el-table-column label="奖励原因" :min-width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.reward_reason }}
        </template>
      </el-table-column>
      <el-table-column label="扣款（元）" min-width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.deduction_salary }}
        </template>
      </el-table-column>
      <el-table-column label="扣款原因" :min-width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.deduction_reason }}
        </template>
      </el-table-column>
      <el-table-column label="当前状态" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.payment_status }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 15, 20, 30]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      class="pagination"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
export default {
  name: 'Product',
  components: {},
  filters: {
    validFilter(val) {
      return val === 1 ? '有效' : '无效'
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      searchForm: {
        productId: '',
        poiName: '',
        isValid: '1',
        cityId: ''
      },
      currentProductId: '',
      currentProductName: '',
      showEditBox: false,
      currentRowData: {},
      cityOptions: [],
      cityLoading: false,
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      queryData: {}
    }
  },
  created() {
    this.queryData = this.$route.query
    this.fetchData()
  },
  methods: {
    handleAdd() {
      this.showEditBox = true
      this.currentRowData = {}
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handelEdit(rowData) {
      this.showEditBox = true
      this.currentRowData = rowData
    },
    goDetail() {

    },
    handleConfirm(rowData) {
      this.$confirm('请确认订单结算金额无误后点击结算按钮。\n' +
        '\n' +
        '其中:\n' +
        '\n' +
        '1.直营点及代发工资的非直营点会在账期结束后自动给工人结算工资。\n' +
        '\n' +
        '2.非直营点的服务点余额需要线下手动打款进行结算。', '结算确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: '/monthly_statements/settlement',
          method: 'post',
          data: {
            month: rowData.month,
            service_point_id: rowData.service_point_id
          }
        }).then(res => {
          if (res.data.success) {
            this.$message({
              type: 'success',
              message: res.data.message
            })
          }
        }).catch(() => {
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      const params = {
        'page': this.currentPage,
        'page_size': this.pageSize,
        order_id: this.queryData.order_id,
        assignment_id: this.queryData.assignment_id,
        service_point_id: this.queryData.service_point_id
      }

      // this.list = [{
      //   'record_id': 'int', // 财务记录ID
      //   'order_id': 'int', // 订单ID
      //   'order_number': 'string', // 订单编号
      //   'order_name': 'string', // 订单名称
      //   'product_code': 'string', // 产品编码
      //   'work_order_id': 'int', // 工单ID
      //   'amount': 'decimal', // 金额
      //   'transaction_date': 'datetime', // 交易日期
      //   'type': 'string', // 类型
      //   'total_quantity': 'int', // 生成总量
      //   'return_quantity': 'int', // 回货总量
      //   'unit_price': 'string', // 单位
      //   'estimated_return_date': 'decimal', // 预计回货时间
      //   'return_date': 'decimal' // 实际回货时间
      // }]
      // this.listLoading = false
      // return
      this.listLoading = true
      const url = '/payment_orders'
      this.$request.get(url, {
        params: {
          ...params
        }
      }).then(res => {
        this.list = res?.data?.payment_orders || []
        this.listLoading = false
        this.total = res?.data?.total
      }).catch(err => {
        console.log(err)
        this.list = []
        this.listLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.opera-container {
  display: flex;
  justify-content: space-between;

  .operation-content {
    width: 500px;
  }

  .search-content {
    flex: 1;
    text-align: right;
  }
}
.page-header {
  p {
    margin-right: 20px;
  }
}
.show-img-title {
  margin-right: 10px;
  display: inline-block;
  margin-bottom: 34px;
}
.pagination {
  text-align: right;
  padding: 10px 0;
}
</style>
