<template>
  <div class="app-container">
    <!--搜索项-->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="工人（领取人）">
        <el-select
          v-model="searchForm.worker_id"
          filterable
          remote
          style="width: 100%"
          clearable
          placeholder="请输入关键词"
          :remote-method="remoteMethodWorker"
          :loading="workerLoading"
        >
          <el-option
            v-for="item in workerOptions"
            :key="item.worker_id"
            :label="item.name"
            :value="item.worker_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="ghost" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
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
      <!--      <el-table-column-->
      <!--        type="selection"-->
      <!--        align="center"-->
      <!--        width="55"-->
      <!--      />-->
      <el-table-column align="center" label="工单ID" width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.work_order_id }}
        </template>
      </el-table-column>
      <el-table-column label="领取人" width="100" :resizable="false">
        <template slot-scope="scope">
          {{ $numberWithCommas(scope.row.worker_name) }}
        </template>
      </el-table-column>
      <el-table-column label="领取数量" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $numberWithCommas(scope.row.receiver_quantity) }}
        </template>
      </el-table-column>
      <el-table-column label="单位" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="领取时间" width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.material_pickup_date ? $dayjs(scope.row.material_pickup_date).format('YYYY-MM-DD') : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="单价（元）" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $numberWithCommas(scope.row.worker_unit_price) }}
        </template>
      </el-table-column>
      <el-table-column label="总价（元）" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $numberWithCommas(scope.row.worker_total_price) }}
        </template>
      </el-table-column>
      <el-table-column label="工单状态" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '待取料'" type="warning">{{ scope.row.status }}</el-tag>
          <el-tag v-if="scope.row.status === '加工中'" type="info">{{ scope.row.status }}</el-tag>
          <el-tag v-if="scope.row.status === '已交付'">{{ scope.row.status }}</el-tag>
          <el-tag v-if="scope.row.status === '已完成'" type="success">{{ scope.row.status }}</el-tag>
          <el-tag v-if="scope.row.status === '作废'" type="danger">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预计交付时间" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ $dayjs(scope.row.estimated_pay_date).format('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="实际交付时间" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.completion_date ? $dayjs(scope.row.completion_date).format('YYYY-MM-DD') : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="订单ID" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_id }}
        </template>
      </el-table-column>
      <el-table-column label="订单名称" width="140" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.order_name }}
        </template>
      </el-table-column>
      <el-table-column label="物料说明" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          <div style="text-align: left; white-space: break-spaces;">
            {{ scope.row.material_description }}
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="440" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button :disabled="scope.row.status === '作废' || scope.row.status === '加工中' || scope.row.status === '已交付'" type="primary" plain size="mini" @click="dispatchOrder(scope.row)">发放物料</el-button>
            <el-button :disabled="scope.row.status === '作废' || scope.row.status === '待领取' || scope.row.status === '已交付'" type="success" plain size="mini" @click="finishOrder(scope.row)">结算</el-button>
            <el-button :disabled="scope.row.status === '作废'" type="warning" plain size="mini" @click="changeOrder(scope.row)">改单</el-button>
            <el-button :disabled="scope.row.status === '作废'" type="danger" plain size="mini" @click="cancelOrder(scope.row)">作废</el-button>
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
      @size-change="handleSizeChange"
    />
    <changeOrderBox :show.sync="showChangeOrder" :current-row-data="currentRowData" @success="refresh" />
    <finishOrderBox :show.sync="showFinishOrder" :current-row-data="currentRowData" @success="refresh" />
  </div>
</template>

<script>
import changeOrderBox from './components/changeOrderBox.vue'
import finishOrderBox from '@/views/order/components/finishOrderBox.vue'
export default {
  name: 'Product',
  components: {
    changeOrderBox,
    finishOrderBox
  },
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
      showDispatchOrder: false,
      showChangeOrder: false,
      showFinishOrder: false,
      workerLoading: false,
      currentRowData: {},
      currentType: '',
      cityOptions: [],
      cityLoading: false,
      multipleSelection: [],
      workerOptions: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      userInfo: {}
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
    this.fetchData()
  },
  methods: {
    onSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm.worker_id = ''
    },
    handleAdd() {
      this.$router.push({
        path: '/product/addAndEditProduct',
        query: {
          type: 'add'
        }
      })
    },
    remoteMethodWorker(query) {
      if (query !== '') {
        this.workerLoading = true
        // 请求
        const url = '/workers'
        const params = {
          service_point_id: this.userInfo.service_point_id,
          page: 1,
          page_size: 10,
          name: query
        }
        this.$request.get(url, {
          params: {
            ...params
          }
        }).then(res => {
          console.log(res)
          if (res) {
            this.workerOptions = res.data.data
          }
          this.workerLoading = false
        }).catch(() => {
          this.workerLoading = false
        })
      } else {
        this.workerOptions = []
      }
    },
    refresh() {
      // this.currentPage = 1
      this.fetchData()
    },
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
    finishOrder(rowData) {
      this.showFinishOrder = true
      this.currentRowData = rowData
    },
    changeOrder(rowData) {
      this.showChangeOrder = true
      this.currentRowData = rowData
    },
    dispatchOrder(rowData, type) {
      this.$confirm('请确保已将生产物料已全额交付给工人?', '提示', {
        confirmButtonText: '确认发放',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: `/work_orders/${rowData.work_order_id}/pickup_material`,
          method: 'post'
        }).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '工单已发放!'
            })
            this.refresh()
            // this.currentPage = 1
            // this.fetchData()
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
    cancelOrder(rowData) {
      this.$confirm('是否确定作废工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: `/work_orders/${rowData.work_order_id}/void`,
          method: 'post'
        }).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '工单已作废!'
            })
            this.currentPage = 1
            this.fetchData()
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
    fetchData() {
      this.listLoading = true
      const params = {
        'page': this.currentPage,
        'page_size': this.pageSize,
        service_point_id: this.userInfo.service_point_id,
        worker_id: this.searchForm.worker_id
      }

      // this.list = [{
      //   'work_order_id': 'int', // 工单ID
      //   'worker_name': 'string', // 领取人（工人姓名）
      //   'assignment_id': 'int', // 分配单ID
      //   'receiver_quantity': 'int', // 领取数量
      //   'material_pickup_date': 'date', // 领取时间
      //   'worker_unit_price': 'decimal', // 工单单价
      //   'worker_total_price': 'decimal', // 工单总价
      //   'status': 'string', // 工单状态
      //   'estimated_pay_date': 'date', // 预计交付时间
      //   'completion_date': 'date', // 实际交付时间
      //   'order_id': 'int', // 订单ID
      //   'order_number': 'string', // 订单编号
      //   'order_name': 'string', // 订单名称
      //   'material_description': 'string' // 物料说明
      // }]
      // this.listLoading = false
      // return
      this.listLoading = true
      this.$request.get('/work_orders', {
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
