<template>
  <div class="app-container">
    <sku :show-sku.sync="showSku" />
    <div>
      <span class="show-img-title">图片展示预览</span>
      <el-switch
        v-model="showImg"
        active-color="#40A7FF"
        inactive-color="#D3D3D3"
      />
    </div>
    <!--搜索项-->
    <div class="opera-container">
      <div class="operation-content" style="margin-bottom: 30px">
        <el-button type="success" @click="handleAdd">新增产品<i class="el-icon-plus el-icon--right" /></el-button>
        <el-button type="primary" @click="handleBatchExport">批量导出</el-button>
        <el-button type="primary" plain @click="handleBatchValid(1)">批量上线</el-button>
        <el-button type="warning" @click="handleBatchValid(0)">批量下线</el-button>
      </div>
      <el-form ref="searchForm" class="search-content" :inline="true" :model="searchForm">
        <el-form-item label="" prop="productId">
          <el-input v-model="searchForm.productId" style="width: 150px" placeholder="产品ID" />
        </el-form-item>
        <el-form-item label="" prop="poiName">
          <el-input v-model="searchForm.poiName" placeholder="poi名称" />
        </el-form-item>
        <el-form-item label="" prop="cityId">
          <el-select
            v-model="searchForm.cityId"
            filterable
            remote
            clearable
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="cityLoading"
          >
            <el-option
              v-for="item in cityOptions"
              :key="item.areaId"
              :label="item.showFullName"
              :value="item.areaId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="isValid">
          <el-select v-model="searchForm.isValid" style="width: 100px" placeholder="状态">
            <el-option label="全部" value="" />
            <el-option label="有效" value="1" />
            <el-option label="无效" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--操作按钮-->
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
      <el-table-column align="center" label="产品ID" width="95" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.productId }}
        </template>
      </el-table-column>
      <el-table-column label="MID" width="100" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.mid }}
        </template>
      </el-table-column>
      <el-table-column label="POI名称" :width="180" align="center" :resizable="false">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.poiName">
            <p class="multi-line-2">{{ scope.row.poiName }}</p>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="城市" width="160" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.cityName }}
        </template>
      </el-table-column>
      <el-table-column label="封面图" min-width="210" align="center" :resizable="false">
        <template slot-scope="scope">
          <!--先判断是否有图片，如果有再通过showImg控制是否展示图片-->
          <div v-if="scope.row.coverPicture">
            <el-image
              v-if="showImg"
              style="width: 100px; height: 75px"
              :src="scope.row.coverPicture"
              fit="contain"
              :preview-src-list="[scope.row.coverPicture]"
            />
            <span v-else>Y</span>
          </div>
          <div v-else>暂未上传</div>
        </template>
      </el-table-column>
      <el-table-column label="手绘图" min-width="210" align="center" :resizable="false">
        <template slot-scope="scope">
          <!--先判断是否有图片，如果有再通过showImg控制是否展示图片-->
          <div v-if="scope.row.handPicture">
            <el-image
              v-if="showImg"
              style="width: 100px; height: 75px"
              :src="scope.row.handPicture"
              fit="contain"
              :preview-src-list="[scope.row.handPicture]"
            />
            <span v-else>Y</span>
          </div>
          <div v-else>暂未上传</div>
        </template>
      </el-table-column>
      <el-table-column label="售价" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="讲解数" width="100" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.guideCount }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center" :resizable="false">
        <template slot-scope="scope">
          {{ scope.row.isValid | validFilter }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" prop="" label="操作" width="440" :resizable="false">
        <template slot-scope="scope">
          <div class="table-operation-content">
            <el-button type="primary" plain size="mini" @click="handleGoBaseInfo(scope.row)">基础信息</el-button>
            <el-button type="warning" plain size="mini" @click="handleGoMapManage(scope.row)">地图管理</el-button>
            <el-button type="info" plain size="mini" @click="handleGoLogInfo(scope.row)">日志</el-button>
            <el-button type="success" plain size="mini" @click="handleCopyLink(scope.row)">复制链接</el-button>
            <el-button v-if="scope.row.isValid === 0" type="danger" plain size="mini" @click="handleDelete(scope.row)">永久删除</el-button>
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
    <log-info ref="logInfo" :show.sync="showLogInfo" :product-id="currentProductId" :product-name="currentProductName" />
  </div>
</template>

<script>
import sku from '@/views/product/components/sku.vue'
import logInfo from '@/views/product/components/logInfo'

export default {
  name: 'Product',
  components: {
    sku,
    logInfo
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
      showImg: false,
      showSku: true,
      searchForm: {
        productId: '',
        poiName: '',
        isValid: '1',
        cityId: ''
      },
      currentProductId: '',
      currentProductName: '',
      showLogInfo: false,
      cityOptions: [],
      cityLoading: false,
      multipleSelection: [],
      currentPage: 1,
      total: 0
    }
  },
  computed: {
    pageSize() {
      // 一页最多展示20个产品，超过20个自动翻页，若有弹框(showSku)减少5个，若打开图片预览(showImg)减少5个；
      return this.showSku ? (this.showImg ? 10 : 15) : (this.showImg ? 15 : 20)
    }
  },
  watch: {
    showImg(val) {
      // 存到localStorage中
      this.updateImg(val)
      this.handleQuery()
    },
    showSku() {
      this.handleQuery()
    }
  },
  created() {
    this.getShowImg()
    this.fetchData()
  },
  methods: {
    getShowImg() {
      // 通过接口更新/config/listQuery
      this.$request.post('/config/listQuery', {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'params': {
          'configKey': 'deer_product_picture_show_switch',
          scene: 'deer_product'
        }
      }).then(res => {
        this.showImg = res?.data[0]?.configValue === 'on'
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    updateImg(val) {
      console.log(val)
      // 通过接口更新/manage/config/listQuery
      this.$request.post('/config/changeKeyValue', {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'params': {
          'configKey': 'deer_product_picture_show_switch',
          configValue: val === 1 ? 'on' : 'off'
        }
      }).then(res => {
        this.showImg = res?.data[0]?.configValue === 'on'
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    handleBatchExport() {
      console.log('导出')
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'params': {
          'productIds': this.multipleSelection.map(item => item.productId)
        }
      }
      // todo 文件导出
      this.$request.post('/product/batchExport', params).then(res => {
        console.log(res)
        this.$message.success('操作成功')
        this.fetchData()
      }).catch(err => {
        console.log(err)
      })
    },
    handleAdd() {
      this.$router.push({
        path: '/product/addAndEditProduct',
        query: {
          type: 'add'
        }
      })
    },
    handleBatchValid(type) {
      // 没有选择产品，提示选择产品
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选择数据',
          type: 'warning'
        })
        return
      }
      const tips = type === 1 ? '是否确定执行批量上线' : '是否确定执行批量下线<br />下线后平台对应的产品均无法使用'
      this.$confirm(tips, '提示', {
        confirmButtonText: type === 1 ? '上线' : '下线',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        // 如果this.multipleSelection为空，那么批量上下线需要将当前查询条件传递给后端
        let params = {}
        if (this.multipleSelection.length === 0) {
          params = {
            'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
            'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
            'params': {
              'isValid': type, // 1 上下 0 下线
              ...this.searchForm
            }
          }
        } else {
          params = {
            'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
            'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
            'params': {
              'isValid': type, // 1 上下 0 下线
              'productIds': this.multipleSelection.map(item => item.productId)
            }
          }
        }

        this.$request.post('/product/batchValid', params).then(res => {
          console.log(res)
          this.$message.success('操作成功')
          this.fetchData()
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.fetchData()
    },
    handleGoBaseInfo(row) {
      this.$router.push({
        path: '/product/addAndEditProduct',
        query: {
          type: 'edit',
          productId: row.productId
        }
      })
    },
    handleGoMapManage(row) {
      console.log(row)
      this.$router.push({
        path: '/product/mapManage',
        query: {
          productId: row.productId,
          poiName: row.poiName
        }
      })
    },
    handleGoLogInfo(row) {
      console.log(row)
      this.showLogInfo = true
      this.currentProductId = row.productId
      this.currentProductName = row.poiName
    },
    handleCopyLink(row) {
      console.log(row)
      this.$copyText(row?.guideUrl || '测试文字').then((e) => {
        this.$message.success('复制成功')
      }, (e) => {
        this.$message.error('复制失败')
        console.log(e)
      })
    },
    handleDelete(row) {
      // this.$message.error('暂未实现')
      // 弹窗提示
      this.$confirm('是否确定删除该产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.deleteProduct(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    deleteProduct(row) {
      const url = 'product/delete'
      const parmas = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'productId': row.productId
        }
      }
      this.$request.post(url, parmas).then(res => {
        console.log(res)
        this.$message.success('删除成功')
        this.fetchData()
      }).catch(err => {
        console.log(err)
      })
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row)
        })
      } else {
        this.$refs.table.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleReset() {
      this.$refs.searchForm.resetFields()
    },
    handleQuery() {
      this.currentPage = 1
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
        'page': this.currentPage,
        'size': this.pageSize,
        'params': {
          'productId': this.searchForm.productId, // 产品id 可不传，或者为空
          'poiName': this.searchForm.poiName, // poi名称 可不传 或者为空
          'cityId': this.searchForm.cityId, // 城市id 可不传或者为空
          'isValid': this.searchForm.isValid // 状态 1 有效 0 无效 可不传或者为空
        }
      }

      this.$request({
        url: '/product/pageQuery',
        method: 'post',
        data: params
      }).then(res => {
        this.list = res?.data?.pageData || []
        this.list.forEach(item => {
          item.coverPicture = item.coverPicture ? `${process.env.VUE_APP_BASE_PHOTO_URL}${item.coverPicture}` : ''
          item.handPicture = item?.productMapModel?.handPicture ? `${process.env.VUE_APP_BASE_PHOTO_URL}${item?.productMapModel?.handPicture}` : ''
        })
        this.listLoading = false
        this.total = res?.data?.total
      }).catch(err => {
        console.log(err)
        this.list = []
        this.listLoading = false
      })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.searchLoading = true
        // 请求
        const url = 'area/getCityAreasByName'
        const params = {
          'timestamp': 1650182275596, // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制
          'params': {
            'areaName': query // 必传
          }
        }
        this.$request.post(url, params).then(res => {
          if (res) {
            this.cityOptions = res.data
          }
          this.searchLoading = false
        }).catch(() => {
          this.searchLoading = false
        })
      } else {
        this.cityOptions = []
      }
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
