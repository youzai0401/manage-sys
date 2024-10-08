<template>
  <div class="app-container">
    <!--搜索项-->

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
      <el-table-column align="center" label="订单ID" width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_id }}
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
          {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="单位" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="单价（元）" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.assignments_price }}
        </template>
      </el-table-column>
      <el-table-column label="生产总价（元）" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.assignments_total_price }}
        </template>
      </el-table-column>
      <el-table-column label="预计回货日期" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $dayjs(scope.row.estimated_return_date).format('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="回货总量" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.actual_return_quantity }}
        </template>
      </el-table-column>
      <el-table-column label="已领取/待领取" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.received_num }}/{{ scope.row.pending_num }}
        </template>
      </el-table-column>
      <el-table-column label="领取人数" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.receiver_count }}
        </template>
      </el-table-column>
      <el-table-column label="当前状态" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.status | validFilter }}
        </template>
      </el-table-column>
      <el-table-column label="物料说明" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.material_description }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="220" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button type="primary" :disabled="scope.row.status !== 'PENDING'" plain size="mini" @click="dispatchOrder(scope.row, 'dispatch')">发布</el-button>
            <el-button type="primary" :disabled="scope.row.status !== 'PUBLISHED'" plain size="mini" @click="finishOrder(scope.row)">完成</el-button>
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
    <DispatchOrderBox :show.sync="showDispatchOrder" :current-row-data="currentRowData" :current-type="currentType" @success="handleRefresh" />
  </div>
</template>

<script>
import DispatchOrderBox from './components/dispatchOrderBox'
export default {
  name: 'Product',
  components: {
    DispatchOrderBox
  },
  filters: {
    validFilter(val) {
      // - PENDING：待发布
      // - PUBLISHED：已发布
      // - COMPLETED：已完成
      // - CANCELLED：已取消
      let text = ''
      switch (val) {
        case 'PENDING':
          text = '待发布'
          break
        case 'PUBLISHED':
          text = '已发布'
          break
        case 'COMPLETED':
          text = '已完成'
          break
        case 'CANCELLED':
          text = '已取消'
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
      showDispatchOrder: false,
      currentRowData: {},
      currentType: '',
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
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    dispatchOrder(rowData, type) {
      this.showDispatchOrder = true
      this.currentRowData = rowData
      this.currentType = type
    },
    finishOrder(rowData) {
      this.$confirm('是否确定完成订单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: `/assignments/${rowData.assignment_id}/complete`,
          method: 'post'
        }).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '订单已完成!'
            })
            this.handleRefresh()
          } else {
            this.$message.error(res.message)
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
    handleRefresh() {
      this.currentPage = 1
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      const params = {
        'page': this.currentPage,
        'page_size': this.pageSize,
        service_point_id: this.userInfo.service_point_id
      }

      // this.list = [{
      //   'assignment_id': 'int', // 分配单ID
      //   'order_id': 'int', // 订单ID
      //   'order_number': 'string', // 订单编号
      //   'order_name': 'string', // 订单名称
      //   'product_code': 'string', // 产品编码
      //   'quantity': 'int', // 分配数量（生产总量）
      //   'assignments_total_price': 'decimal', // 生成总价（分配的生产总价）
      //   'status': 'string', // 订单状态 英文枚举需要转成中文 所以都这样
      //   'assignments_price': 'decimal', // 单价（分配的单价）
      //   'estimated_return_date': 'date', // 预计回货时间
      //   'unit': 'string', // 单位
      //   'return_quantity': 'int', // 回货数量
      //   'pending_num': 'int', // 待领取数量
      //   'received_num': 'int', // 已领取数量
      //   'receiver_count': 'int' // 领取人数
      // }]
      // this.listLoading = false
      // return
      this.$request.get('/assignments', {
        params: {
          ...params
        }
      }).then(res => {
        this.list = res?.data?.data || []
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
