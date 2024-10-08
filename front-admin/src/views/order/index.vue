<template>
  <div class="app-container">
    <!--搜索项-->
    <div class="opera-container">
      <div class="operation-content" style="margin-bottom: 10px">
        <el-button type="success" @click="handleAdd">导入订单<i class="el-icon-plus el-icon--right" /></el-button>
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
          {{ scope.row.total_quantity }}
        </template>
      </el-table-column>
      <el-table-column label="单位" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="预计回货日期" width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $dayjs(scope.row.estimated_return_date).format('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="回货数量" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.return_quantity }}
        </template>
      </el-table-column>
      <el-table-column label="生产总价（元）" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.production_price }}
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
      <el-table-column fixed="right" align="center" prop="" label="操作" width="440" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button v-if="scope.row.status == 'UNASSIGNED'" type="primary" plain size="mini" @click="dispatchOrder(scope.row, 'dispatch')">分配</el-button>
            <el-button v-if="scope.row.status === 'ASSIGNED' || scope.row.status === 'COMPLETED'" type="primary" plain size="mini" @click="dispatchOrder(scope.row, 'detail')">分配详情</el-button>
            <el-button :disabled="scope.row.status === 'CANCELLED'" type="danger" plain size="mini" @click="cancelOrder(scope.row)">取消订单</el-button>
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
    <DispatchOrderBox :show.sync="showDispatchOrder" :current-row-data="currentRowData" :current-type="currentType" @success="handleImportSuccess" />
    <ImportOrderBox :show.sync="showImportOrder" @success="handleImportSuccess" />
  </div>
</template>

<script>
import DispatchOrderBox from './components/dispatchOrderBox'
import ImportOrderBox from './components/importOrderBox'
export default {
  name: 'Product',
  components: {
    DispatchOrderBox,
    ImportOrderBox
  },
  filters: {
    validFilter(val) {
      // - UNASSIGNED：待分配
      // - ASSIGNED：加工中
      // - COMPLETED：已完成
      // - CANCELLED：已取消
      let text = ''
      switch (val) {
        case 'UNASSIGNED':
          text = '待分配'
          break
        case 'ASSIGNED':
          text = '加工中'
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
      showImportOrder: false,
      currentRowData: {},
      currentType: '',
      cityOptions: [],
      cityLoading: false,
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleAdd() {
      this.showImportOrder = true
    },
    handleImportSuccess() {
      this.currentPage = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.fetchData()
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
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
    cancelOrder(rowData) {
      this.$confirm('服务点端分配的订单将被取消，是否确认取消?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: `/orders/${rowData.order_id}`,
          method: 'delete'
        }).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '订单已取消!'
            })
            this.currentPage = 1
            this.fetchData()
          } else {
            this.$message({
              type: 'warning',
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
    fetchData() {
      this.listLoading = true
      const params = {
        'page': this.currentPage,
        'page_size': this.pageSize
      }

      // this.list = [{
      //   'order_id': 'int', // 订单ID
      //   'order_number': 'string', // 订单编号
      //   'order_name': 'string', // 订单名称
      //   'product_code': 'string', // 产品编码
      //   'total_quantity': 'int', // 订单总数量（生产总量）
      //   'status': 'string', // 订单状态 英文枚举需要转成中文 所以都这样
      //   'unit_price': 'decimal', // 单价
      //   'estimated_return_date': 'date', // 预计回货时间
      //   'unit': 'string', // 单位
      //   'return_quantity': 'int', // 回货数量
      //   'production_price': 'string', // 生成总价
      //   'material_description': 'string'// 物料说明
      // }]
      // this.listLoading = false
      // return

      this.listLoading = true
      this.$request.get('/orders', {
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
