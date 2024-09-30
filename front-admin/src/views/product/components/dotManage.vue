<template>
  <div>
    <div class="tag-container">
      <el-button type="primary" class="button-new-tag" size="small" @click="handleAdd">+新增分类</el-button>
      <editTag
        v-for="item in dynamicTags"
        ref="editTag"
        :key="item.id"
        :tag-data.sync="item"
        :product-id="productId"
        :is-active="item.id === currentTag.id"
        @delete="handleDeleteTag"
        @addSuccess="addSuccess"
        @clickTag="handleClickTag"
      />
    </div>
    <div>
      <el-table
        v-loading="listLoading"
        element-loading-text="数据加载中..."
        border
        highlight-current-row
        :data="list"
      >
        <el-table-column label="图标" width="100">
          <template slot-scope="scope">
            <div v-if="scope.row.image">
              <el-image
                style="width: 40px"
                :src="scope.row.image"
                fit="contain"
                :preview-src-list="[scope.row.image]"
              />
            </div>
            <div v-else>暂未选择</div>
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="110" align="center">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="110" align="center">
          <template slot-scope="scope">
            {{ scope.row.siteType | siteTypeFilter }}
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="110" align="center">
          <template slot-scope="scope">
            {{ showClassName(scope.row.siteClassId) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="" label="操作" width="300">
          <template slot-scope="scope">
            <div class="table-operation-content">
              <el-button type="text" size="mini" @click="handleGoEdit(scope.row.siteId)">内容编辑</el-button>
              <el-button type="text" size="mini">复制链接</el-button>
              <el-button
                v-if="scope.row.isValid === 1"
                type="text"
                size="mini"
                style="color: #666666"
                @click="handleSetValid(scope.row, 0)"
              >有效</el-button>
              <el-button
                v-if="scope.row.isValid === 0"
                style="color: #F56C6C"
                type="text"
                size="mini"
                @click="handleSetValid(scope.row, 1)"
              >无效</el-button>
              <el-button
                v-if="scope.row.isValid === 0"
                style="color: #F56C6C"
                type="text"
                size="mini"
                @click="handleDeleteDot(scope.row, 1)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 15, 20, 30]"
        layout="total, prev, pager, next, jumper"
        :total="total"
        class="pagination"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import editTag from '@/views/product/components/editTag'
export default {
  name: 'DotManage',
  components: {
    editTag
  },
  filters: {
    siteTypeFilter(val) {
      const siteTypeOptions = {
        guide: '讲解点',
        transfer: '中转点'
      }
      return siteTypeOptions[val] || '-'
    }
  },
  props: {
    productId: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    productMapId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dynamicTags: [],
      list: [],
      currentPage: 1,
      total: 0,
      currentTag: {},
      listLoading: false
    }
  },
  created() {
    this.productMapId && this.getClassList(true)
  },
  methods: {
    handleDeleteDot(data) {
      // 弹窗确认
      this.$confirm('确认删除该点位吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDot(data)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    deleteDot(data) {
      // product/site/batchDelete
      const url = 'product/site/batchDelete'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'productSiteIds': [data.siteId] // 暂时只支持单个
        }
      }
      this.$request.post(url, params).then(async res => {
        this.$message.success('操作成功')
        await this.fetchSiteData()
        this.$emit('poiRefresh', this.currentTag)
      })
    },
    handleSetValid(data, type) {
      // product/site/batchValid
      const url = 'product/site/batchValid'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'isValid': type, // 1 上下 0 下线
          'productSiteIds': [data.siteId] // 暂时只支持单个
        }
      }
      this.$request.post(url, params).then(async res => {
        this.$message.success('操作成功')
        await this.fetchSiteData()
        this.$emit('poiRefresh', this.currentTag)
      })
    },
    showClassName(id) {
      const item = this.dynamicTags.find(item => item.siteClassId === id)
      return item?.name || '-'
    },
    handleGoEdit(siteId) {
      this.$emit('goEdit', siteId)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.fetchSiteData()
    },
    addSuccess(data) {
      // 新增分类成功
      this.getClassList()
    },
    async handleClickTag(data) {
      // 点击分类
      this.currentTag = data
      this.$emit('setTag', data)
      this.fetchSiteData()
      this.$emit('poiRefresh', this.currentTag)
    },
    async fetchSiteData() {
      const data = this.currentTag
      const url = 'product/site/pageQueryManage'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
        'page': this.currentPage,
        'size': 10,
        'params': {
          'productId': this.productId, // 必传，传入 productId
          'productMapId': this.productMapId, // 必传，上一步中保存的地图id
          'siteClassId': data.siteClassId, // 必传，分类id
          'isValid': '',
          'name': '',
          'siteType': '' // 必传，类型
        }
      }
      this.listLoading = true
      return this.$request({
        url,
        method: 'post',
        data: params
      }).then(res => {
        console.log(res.data)
        this.list = res?.data.pageData || []
        this.list.forEach(item => {
          item.image = item.image ? `${process.env.VUE_APP_BASE_PHOTO_URL}${item.image}` : ''
        })
        this.total = res?.data.total || 0
        this.listLoading = false
      }).catch(err => {
        console.log(err)
        this.listLoading = false
        this.list = []
        this.total = 0
      })
    },
    handleDeleteTag(data) {
      // 通过data.id删除分类
      const index = this.dynamicTags.findIndex(item => item.id === data.id)
      this.dynamicTags.splice(index, 1)
    },
    getClassList(needGetSite) {
      // 接口请求 product/site/class/listQueryAll
      const url = 'product/site/class/listQueryAll'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
        'params': {
          'productId': this.productId, // 必传，传入 productId
          'productMapId': this.productMapId // 必传，上一步中保存的地图id
        }
      }
      this.$request({ url, method: 'post', data: params }).then(res => {
        this.dynamicTags = res.data
        // 默认选中第一个
        if (this.dynamicTags.length > 0 && needGetSite) {
          this.handleClickTag(this.dynamicTags[0])
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async handleAdd() {
      this.dynamicTags.push({ name: '' })
      await this.$nextTick()
      console.log(this.$refs)
      this.$refs.editTag[this.dynamicTags.length - 1].editing = true
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-container{
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-right: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.pagination {
  text-align: right;
  padding: 10px 0;
}
</style>
