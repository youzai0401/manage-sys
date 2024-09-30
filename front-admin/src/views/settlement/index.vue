<template>
  <div class="app-container">
    <!--搜索项-->
    <div class="opera-container">
      <div class="operation-content" style="margin-bottom: 10px">
        余额：<span style="color: red">1231,123 元</span>
      </div>
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
      <el-table-column align="center" label="ID" min-width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.record_id }}
        </template>
      </el-table-column>
      <el-table-column label="产品编码" width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.product_code }}
        </template>
      </el-table-column>
      <el-table-column label="订单编号" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_number }}
        </template>
      </el-table-column>
      <el-table-column label="订单名称" width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_name }}
        </template>
      </el-table-column>
      <el-table-column label="生产总量" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.total_quantity }}
        </template>
      </el-table-column>
      <el-table-column label="回货总量" min-width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="单位" :min-width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.manager_name }}
        </template>
      </el-table-column>
      <el-table-column label="预计回货日期" min-width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.contact_number }}
        </template>
      </el-table-column>
      <el-table-column label="实际回货日期" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.address }}
        </template>
      </el-table-column>
      <el-table-column label="生产总价（元）" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.address }}
        </template>
      </el-table-column>
      <el-table-column label="结算状态" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.address }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="180" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button type="primary" plain size="mini" @click="handleConfirm(scope.row)">确认结算</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 15, 20, 30]"
      layout="total, prev, pager, next, jumper"
      :total="total"
      class="pagination"
      @current-change="handleCurrentChange"
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
      total: 0
    }
  },
  created() {
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
    handleConfirm(rowData) {
      this.$confirm('账单确认结算后系统会在本月账期结束后自动出账。是否结算?', '结算确认', {
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
    fetchData() {
      this.listLoading = true
      const params = {
        'page': this.currentPage,
        'page_size': this.pageSize
      }

      this.list = [{
        'record_id': 'int', // 财务记录ID
        'order_id': 'int', // 订单ID
        'order_number': 'string', // 订单编号
        'order_name': 'string', // 订单名称
        'product_code': 'string', // 产品编码
        'work_order_id': 'int', // 工单ID
        'amount': 'decimal', // 金额
        'transaction_date': 'datetime', // 交易日期
        'type': 'string', // 类型
        'total_quantity': 'int', // 生成总量
        'return_quantity': 'int', // 回货总量
        'unit_price': 'string', // 单位
        'estimated_return_date': 'decimal', // 预计回货时间
        'return_date': 'decimal' // 实际回货时间
      }]
      this.listLoading = false
      return

      this.$request({
        url: '/financial_records',
        method: 'get',
        data: params
      }).then(res => {
        this.list = res?.data?.service_points || []
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
