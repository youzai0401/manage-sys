<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      title="改单"
      :visible.sync="showDialog"
      width="500"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form ref="formData" :inline="false" :model="formData" :rules="formDataRules" label-width="120px">
          <el-form-item label="工单ID">
            <span>{{ currentRowData.work_order_id }}</span>
          </el-form-item>
          <el-form-item label="领取人">
            <span>{{ currentRowData.worker_name || '-' }}</span>
          </el-form-item>
          <el-form-item label="领取数量" prop="receiver_quantity">
            <el-input v-model="formData.receiver_quantity" placeholder="请输入产品领取数量" />
          </el-form-item>
          <el-form-item label="工单状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择">
              <el-option label="待取料" value="TO_BE_CLAIMED" />
              <el-option label="加工中" value="IN_PROGRESS" />
              <el-option label="已交付" value="DELIVERED" />
              <el-option label="完成" value="COMPLETED" />
              <el-option label="作废" value="VOID" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button :loading="isSaving" type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ChangeOrderBox',
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
    },
    currentType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isSaving: false,
      formDataRules: {
        receiver_quantity: [
          { required: true, message: '请输入产品领取数量', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择工单状态', trigger: 'blur' }
        ]
      },
      formData: {
        receiver_quantity: '',
        status: ''
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
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          if (this.isSaving) {
            return
          }
          this.isSaving = true
          this.$request.put(`/work_orders/${this.currentRowData.work_order_id}`,
            {
              ...this.formData
            }).then(res => {
            if (res.success) {
              this.$message.success('工单修改成功')
              this.showDialog = false
              this.$emit('success')
            } else {
              this.$message.error(res.message)
            }
          }).catch(() => {
            this.isSaving = false
          })
        } else {
          this.isSaving = false
          this.$message({
            message: '请完善信息',
            type: 'warning'
          })
          return false
        }
      })
    },
    initData() {
      this.formData.receiver_quantity = ''
      this.formData.status = ''
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
