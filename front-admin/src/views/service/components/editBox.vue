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
        <el-form ref="formData" :inline="false" :rules="formDataRules" :model="formData" label-width="120px">
          <el-form-item label="服务点名称" prop="name">
            <el-input v-model="formData.name" show-word-limit maxlength="15" placeholder="请输入服务点名称" />
          </el-form-item>
          <el-form-item label="负责人" prop="manager_name">
            <el-input v-model="formData.manager_name" show-word-limit maxlength="10" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="手机号" prop="contact_number">
            <el-input v-model="formData.contact_number" show-word-limit maxlength="11" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="登录密码" prop="login_password_hash">
            <el-input v-model="formData.login_password_hash" show-word-limit maxlength="20" placeholder="请输入登录密码" />
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="formData.address" show-word-limit maxlength="50" placeholder="请输入详细地址" />
          </el-form-item>
          <el-form-item label="服务点类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="DIRECT">直营点</el-radio>
              <el-radio label="NON_DIRECT">非直营点</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.type === 'NON_DIRECT'" label="是否代结工资" prop="is_salary_managed">
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
      },
      formDataRules: {
        name: [
          { required: true, message: '服务点名称必填', trigger: 'blur' },
          { min: 0, max: 15, message: '长度在15个字符以内', trigger: 'blur' }
        ],
        manager_name: [
          { required: true, message: '负责人必填', trigger: 'blur' },
          { min: 0, max: 10, message: '长度在10个字符以内', trigger: 'blur' }
        ],
        contact_number: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          { min: 0, max: 11, message: '长度在11个字符以内', trigger: 'blur' }
        ],
        login_password_hash: [
          { required: true, message: '登录密码必填', trigger: 'blur' },
          { min: 0, max: 50, message: '长度在50个字符以内', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '详细地址必填', trigger: 'blur' },
          { min: 0, max: 50, message: '长度在50个字符以内', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '服务点类型必填', trigger: 'blur' }
        ],
        is_salary_managed: [
          { required: true, message: '是否代结工资必填', trigger: 'blur' }
        ]
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
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.saveLoading = true
          if (this.currentRowData.service_point_id) {
            const params = {
              ...this.formData,
              is_salary_managed: this.formData.type === 'DIRECT' ? true : this.formData.is_salary_managed
            }
            delete params.service_point_id
            delete params.is_deleted
            if (!params.login_password_hash) {
              delete params.login_password_hash
            }
            this.$request.put(`/service_points/${this.currentRowData.service_point_id}`,
              {
                'name': params.name, // 服务点名称
                'manager_name': params.manager_name, // 负责人姓名
                'contact_number': params.contact_number, // 联系电话
                'address': params.address, // 详细地址
                'login_password_hash': params.login_password_hash, // 登录密码哈希值
                'type': params.type, // 服务点类型（直营店、非直营店）
                'is_salary_managed': params.is_salary_managed // 是否代结工资（TRUE代结，FALSE不代结）'
              }).then(res => {
              if (res.success) {
                this.$message.success('修改服务点成功')
                this.showDialog = false
                this.$emit('success')
              } else {
                this.$message.error(res.message)
              }
            }).finally(() => {
              this.saveLoading = false
            })
          } else {
            this.$request.post('/service_points',
              {
                ...this.formData,
                is_salary_managed: this.formData.type === 'DIRECT' ? true : this.formData.is_salary_managed
              }).then(res => {
              if (res.success) {
                this.$message.success('新增服务点成功')
                this.showDialog = false
                this.$emit('success')

                this.$alert('创建成功，请通知服务点负责人使用手机号及密码登录服务点端，服务点端地址为：https://service.bmxt.info/', '创建服务点', {
                  confirmButtonText: '确定',
                  callback: () => {
                  }
                })
              } else {
                this.$message.error(res.message)
              }
            }).finally(() => {
              this.saveLoading = false
            })
          }
        } else {
          this.$message.warning('信息填写有误，请检查！')
        }
      })
    },
    initData() {
      if (this.currentRowData?.service_point_id) {
        this.formDataRules.login_password_hash[0].required = false
        this.$request.get(`/service_points/${this.currentRowData.service_point_id}`, {}).then(res => {
          const { data } = res
          if (data) {
            Object.assign(this.formData, data, { login_password_hash: '' })
          }
        })
      } else {
        this.formDataRules.login_password_hash[0].required = true
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
