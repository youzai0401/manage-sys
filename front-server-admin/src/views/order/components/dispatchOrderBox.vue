<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      title="发布订单"
      :visible.sync="showDialog"
      width="700px"
      @close="handleClose"
    >
      <div class="log-info__content">
        <p style="font-size: 16px; font-weight: bolder">订单信息如下，是否确认发布此订单？</p>
        <el-form ref="formData" :inline="false" :model="formData" :rules="formDataRules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="订单名称">
                <span>{{ currentRowData.order_name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产总量">
                <span>{{ $numberWithCommas(currentRowData.quantity) }} {{ currentRowData.unit }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产总价">
                <span>{{ $numberWithCommas(currentRowData.assignments_total_price) }} （元）</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="回货日期">
                <span>{{ $dayjs(currentRowData.estimated_return_date).format('YYYY-MM-DD') }}</span>
              </el-form-item>
            </el-col>
            <el-form-item v-if="!(userInfo.type === 'DIRECT' || !userInfo.is_salary_managed)" label="工人单价" prop="worker_unit_price">
              <el-input v-model="formData.worker_unit_price" style="width: 300px" placeholder="请输入工人生产单支报价，单位：元"><span slot="suffix">/元</span></el-input>
            </el-form-item>
            <el-form-item label="交付时间" prop="estimated_pay_date">
              <el-date-picker
                v-model="formData.estimated_pay_date"
                style="width: 300px"
                type="date"
                placeholder="请选择工人最晚交付日期和时间"
              />
            </el-form-item>
            <el-form-item label="加工要求" prop="processing_requirements">
              <el-input
                v-model="formData.processing_requirements"
                type="textarea"
                maxlength="1000"
                show-word-limit
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="请输入加工要求，如工艺、物料说明、交付方式等"
              />
            </el-form-item>
            <el-form-item v-if="!(userInfo.type === 'DIRECT' || !userInfo.is_salary_managed)" label="预计生产总价">
              <span style="color: red; font-size: 16px">{{ $numberWithCommas(estimated_total) }} （元）</span>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button :loading="isSaving" type="primary" @click="handleSave">发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'DispatchOrderBox',
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
        worker_unit_price: [
          { required: true, message: '请输入工人单价', trigger: 'blur' }
        ],
        estimated_pay_date: [
          { required: true, message: '请选择交付时间', trigger: 'blur' }
        ],
        processing_requirements: [
          { required: true, message: '请输入加工要求', trigger: 'blur' }
        ]
      },
      formData: {
        estimated_pay_date: '',
        worker_unit_price: '',
        processing_requirements: ''
      },
      selectLoading: false,
      serverOption: [],
      userInfo: {}
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
    },
    estimated_total() {
      if (this.formData.worker_unit_price) {
        return this.formData.worker_unit_price * this.currentRowData.quantity
      }
      return ''
    }
  },
  watch: {
    show(val) {
      val && this.initData()
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
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
          this.$request.post(`/assignments/${this.currentRowData.assignment_id}/publish`,
            {
              ...this.formData
            }).then(res => {
            if (res.success) {
              this.$message.success('订单发布成功')
              this.$emit('success')
              this.showDialog = false
            } else {
              this.$message.error(res.message)
            }
          }).finally(() => {
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
      this.formData.worker_unit_price = ''
      this.formData.estimated_pay_date = ''
      this.formData.processing_requirements = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  text-align: right;
  padding: 10px 0;
}
//::v-deep .el-form-item {
//  margin-bottom: 12px;
//}
</style>
