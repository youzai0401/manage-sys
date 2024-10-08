<template>
  <div class="app-container">
    <!--搜索项-->
    <!--    <div class="opera-container">-->
    <!--      <div class="operation-content" style="margin-bottom: 10px">-->
    <!--        余额：<span style="color: red">1231,123 元</span>-->
    <!--      </div>-->
    <!--    </div>-->

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
      <el-table-column align="center" label="订单ID" min-width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_id }}
        </template>
      </el-table-column>
      <el-table-column label="产品编码" width="150" :resizable="false">
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
          {{ scope.row.actual_return_quantity }}
        </template>
      </el-table-column>
      <el-table-column label="预计回货日期" min-width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.estimated_return_date }}
        </template>
      </el-table-column>
      <el-table-column label="实际回货日期" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.actual_return_date }}
        </template>
      </el-table-column>
      <el-table-column label="单位(元)" :min-width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="生产总价(元)" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.estimated_total_price }}
        </template>
      </el-table-column>
      <el-table-column label="结算总价(元)" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.estimated_total_price }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="180" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button type="primary" plain size="mini" @click="goDetail(scope.row)">明细</el-button>
          </div>
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
      // - PENDING：待结算
      // - SETTLED：已结算
      let text = ''
      switch (val) {
        case 'PENDING':
          text = '待结算'
          break
        case 'SETTLED':
          text = '已结算'
          break
        default :
          text = '未知'
      }

      return text
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
      userInfo: {}
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
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
    goDetail(rowData) {
      this.$router.push({
        path: '/settlement/settlementManageDetail',
        query: {
          record_id: rowData.record_id,
          product_code: rowData.product_code,
          order_number: rowData.order_number,
          order_name: rowData.order_name,
          order_id: rowData.order_id,
          assignment_id: rowData.assignment_id,
          service_point_id: this.userInfo.service_point_id
        }
      })
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
          url: `/orders/${rowData.order_id}/settlement`,
          method: 'post'
        }).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: res.message
            })
          } else {
            this.$message({
              type: 'error',
              message: res.message
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
        status: 'PUBLISHED',
        service_point_id: this.userInfo.service_point_id
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
      this.$request.get('/assignments', {
        params: {
          ...params
        }
      }).then(res => {
        this.list = res?.data?.orders || []
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
