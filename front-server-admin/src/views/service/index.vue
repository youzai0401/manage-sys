<template>
  <div class="app-container">
    <!--搜索项-->
    <div class="opera-container">
      <div class="operation-content" style="margin-bottom: 10px">
        <el-button type="success" @click="handleAdd">新建服务点<i class="el-icon-plus el-icon--right" /></el-button>
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
      <!--      <el-table-column-->
      <!--        type="selection"-->
      <!--        align="center"-->
      <!--        width="55"-->
      <!--      />-->
      <el-table-column align="center" label="ID" min-width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.service_point_id }}
        </template>
      </el-table-column>
      <el-table-column label="服务点名称" min-width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" :min-width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.manager_name }}
        </template>
      </el-table-column>
      <el-table-column label="联系方式" min-width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.contact_number }}
        </template>
      </el-table-column>
      <el-table-column label="详细地址" min-width="200" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.address }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="180" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button type="primary" plain size="mini" @click="handelEdit(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="handleDel(scope.row)">删除</el-button>
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
    <editBox :show.sync="showEditBox" :current-row-data="currentRowData" />
  </div>
</template>

<script>
import editBox from './components/editBox'
export default {
  name: 'Product',
  components: {
    editBox
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
      showEditBox: false,
      currentRowData: {},
      cityOptions: [],
      cityLoading: false,
      multipleSelection: [],
      currentPage: 1,
      pageSize: 20,
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
    handelEdit(rowData) {
      this.showEditBox = true
      this.currentRowData = rowData
    },
    handleDel(rowData) {
      this.$confirm('是否删除服务点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: `/service_points/${rowData.service_point_id}`,
          method: 'delete'
        }).then(res => {
          if (res.data.success) {
            this.$message({
              type: 'success',
              message: '已删除!'
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
        'service_point_id': 'int', // 服务点ID
        'name': 'string', // 服务点名称
        'manager_name': 'string', // 负责人姓名
        'contact_number': 'string', // 联系电话
        'address': 'string', // 详细地址
        'type': 'string', // 类型（直营店、非直营店）
        'is_salary_managed': 'boolean'// 是否代结工资
      }]
      this.listLoading = false
      return

      this.$request({
        url: '/service_points',
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
