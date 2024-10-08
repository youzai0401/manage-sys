<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      :title="`${currentRowData.service_point_id ? '编辑服务点' : '新增服务点'}`"
      :visible.sync="showDialog"
      width="500"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form :inline="false" :model="formData" label-width="100px">
          <el-form-item label="服务点名称">
            <el-input v-model="formData.name" show-word-limit maxlength="15" placeholder="请输入服务点名称" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="formData.manager_name" show-word-limit maxlength="10" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="formData.contact_number" show-word-limit maxlength="11" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="登录密码">
            <el-input v-model="formData.login_password_hash" show-word-limit maxlength="20" placeholder="请输入登录密码" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="formData.address" show-word-limit maxlength="50" placeholder="请输入详细地址" />
          </el-form-item>
          <el-form-item label="服务点类型">
            <el-radio-group v-model="formData.type">
              <el-radio label="1">直营点</el-radio>
              <el-radio label="2">非直营点</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否代结工资">
            <el-radio-group v-model="formData.is_salary_managed">
              <el-radio :label="true">代结</el-radio>
              <el-radio :label="false">不代结</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">关闭</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EditBox',
  props: {
    currentRowData: {
      type: Object,
      default() {
        return {}
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      saveLoading: false,
      formData: {
        'name': '', // 服务点名称
        'manager_name': '', // 负责人姓名
        'contact_number': '', // 联系电话
        'address': '', // 详细地址
        'login_password_hash': '', // 登录密码哈希值
        'type': '', // 服务点类型（直营店、非直营店）
        'is_salary_managed': '' // 是否代结工资（TRUE代结，FALSE不代结）'
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
    show(val) {
      val && this.initData()
    }
  },
  methods: {
    handleClose() {
      this.showDialog = false
    },
    handleSave() {
      this.saveLoading = true
      if (this.currentRowData.service_point_id) {
        this.$request.post(`/service_points/${this.currentRowData.service_point_id}`,
          {
            ...this.formData
          }).then(res => {
          const { data } = res
          if (data.success) {
            this.$message.success('修改服务点成功')
          }
        }).finally(() => {
          this.saveLoading = false
        })
      } else {
        this.$request.post('/service_points',
          {
            ...this.formData
          }).then(res => {
          const { data } = res
          if (data.success) {
            this.$message.success('新增服务点成功')
          }
        }).finally(() => {
          this.saveLoading = false
        })
      }
    },
    initData() {
      if (this.currentRowData?.service_point_id) {
        this.$request.get(`/service_points/${this.currentRowData.service_point_id}`, {}).then(res => {
          const { data } = res
          if (data) {
            Object.assign(this.formData, data)
          }
        })
      } else {
        this.formData = {
          'name': '', // 服务点名称
          'manager_name': '', // 负责人姓名
          'contact_number': '', // 联系电话
          'address': '', // 详细地址
          'login_password_hash': '', // 登录密码哈希值
          'type': '', // 服务点类型（直营店、非直营店）
          'is_salary_managed': '' // 是否代结工资（TRUE代结，FALSE不代结）'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  text-align: right;
  padding: 10px 0;
}
</style>
