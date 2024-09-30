<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      :title="tagData.id ? '编辑分类' : '新增分类'"
      :visible.sync="showDialog"
      width="50%"
      @close="showDialog = false"
    >
      <el-form
        ref="formData"
        v-loading="loadData"
        :inline="false"
        :rules="formDataRules"
        label-position="left"
        :model="formData"
        label-width="120px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标" prop="image">
          <!--          <upload-->
          <!--            :img-list.sync="formData.image"-->
          <!--            :img-size="1"-->
          <!--            :img-type="['jpg', 'jpeg', 'png']"-->
          <!--            :limit="1"-->
          <!--          />-->
          <div class="icon-list">
            <div
              v-for="item in iconList"
              :key="item.id"
              class="icon-item"
              :class="{ active: item.pictureUrl === formData.image }"
              @click="handleIconClick(item)"
            >
              <i v-if="item.pictureUrl === formData.image" class="el-icon-success check-icon" />
              <!--              <img :src="item.pictureUrl" alt="">-->
              <el-image
                :src="item.disPictureUrl"
                fit="contain"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import upload from '@/views/product/components/upload'

export default {
  name: 'AddOrEditTag',
  components: {
    // upload
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    tagData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loadData: false,
      formData: {
        name: '',
        image: []
      },
      iconList: [],
      formDataRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        image: [{ required: true, message: '请上传分类图标', trigger: 'blur' }]
      }
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
    tagData: {
      handler(val) {
        this.formData.image = val.image
        this.formData.name = val.name
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getIconList()
  },
  methods: {
    handleIconClick(item) {
      this.formData.image = item.pictureUrl
    },
    getIconList() {
      const url = 'picture/listQuery'
      const params = {
        'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
        'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.mapp 代表微信小程序  deer.front 代表 前端
        'params': {
          'pictureType': 'siteClass' // 图标
        }
      }
      this.$request.post(url, params).then(res => {
        this.iconList = res.data
        this.iconList.forEach(item => {
          item.disPictureUrl = `${process.env.VUE_APP_BASE_PHOTO_URL}${item.pictureUrl}`
        })
      })
    },
    handleSave() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.$emit('save', this.formData)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  text-align: right;
  padding: 10px 0;
}
.icon-list {
  display: flex;
  flex-wrap: wrap;

  .icon-item {
    border: 1px solid transparent;
    width: 100px;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 4px;
    border-radius: 4px;
    position: relative;

    .check-icon {
      color: #40A7FF;
      position: absolute;
      right: 0;
      top: 0;
    }

    img {
      width: 100%;
    }
  }
  .active {
    border: 1px solid #409EFF;
  }
}

</style>
