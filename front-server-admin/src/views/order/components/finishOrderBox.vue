<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      title="结算工单"
      :visible.sync="showDialog"
      width="800px"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form ref="formData" :inline="false" :model="formData" :rules="formDataRules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="计划回货量">
                <span>{{ $numberWithCommas(currentRowData.receiver_quantity) }} {{ currentRowData.unit }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结算单价">
                <span>{{ $numberWithCommas(currentRowData.worker_unit_price) }} （元）</span>
              </el-form-item>
            </el-col>
          </el-row>
          <div v-if="userInfo.type === 'DIRECT' || (userInfo.type !== 'DIRECT' && userInfo.is_salary_managed)">
            <el-form-item label="实际回货量" prop="actual_settlement_quantity">
              <el-input v-model.number="formData.actual_settlement_quantity" placeholder="请填写实际回货量"><span slot="suffix">/元</span></el-input>
            </el-form-item>
            <el-form-item label="工单质检合格率" prop="work_order_quality_rate">
              <el-input v-model.number="formData.work_order_quality_rate" placeholder="请填写质检合格率"><span slot="suffix">%</span></el-input>
            </el-form-item>
            <el-form-item label="额外类型" prop="worker_unit_price">
              <el-radio-group v-model="reward_type">
                <el-radio label="1">奖励</el-radio>
                <el-radio label="2">扣款</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="reward_type === '1'">
              <el-form-item label="额外奖励" prop="reward_salary">
                <el-input v-model="formData.reward_salary" type="number" placeholder="请填写奖励金额（元）"><span slot="suffix">/元</span></el-input>
              </el-form-item>
              <el-form-item label="额外奖励原因" prop="reward_reason">
                <el-input v-model="formData.reward_reason" placeholder="请填写奖励原因" />
              </el-form-item>
            </template>
            <template v-if="reward_type === '2'">
              <el-form-item label="额外扣款" prop="deduction_salary">
                <el-input v-model="formData.deduction_salary" type="number" placeholder="请填写扣款金额（元）"><span slot="suffix">/元</span></el-input>
              </el-form-item>
              <el-form-item label="额外扣款原因" prop="deduction_reason">
                <el-input v-model="formData.deduction_reason" placeholder="请填写扣款原因" />
              </el-form-item>
            </template>
            <el-form-item label="预计发放工资为">
              <span style="color: red; font-size: 16px">{{ $numberWithCommas(formData.actual_salary) }} 元</span>
            </el-form-item>
          </div>
          <div v-else>
            <el-form-item label="工单质检合格率" prop="work_order_quality_rate">
              <el-input v-model.number="formData.work_order_quality_rate" placeholder="请填写质检合格率"><span slot="suffix">%</span></el-input>
            </el-form-item>
            <el-form-item label="结算金额" prop="actual_salary">
              <el-input v-model="formData.actual_salary" type="number" placeholder="请填写本单结算金额（元）"><span slot="suffix">/元</span></el-input>
            </el-form-item>
            <el-form-item label="预计发放工资为">
              <span style="color: red; font-size: 16px">{{ $numberWithCommas(formData.actual_salary) }} 元</span>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button :loading="isSaving" type="primary" @click="handleSave">结算</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FinishOrderBox',
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
      reward_type: '',
      isSaving: false,
      formDataRules: {
        actual_settlement_quantity: [
          { required: true, message: '请填写实际回货量', trigger: 'blur' }
        ],
        work_order_quality_rate: [
          { required: true, message: '请填写质检合格率', trigger: 'blur' }
        ],
        actual_salary: [
          { required: true, message: '请填写本单结算金额', trigger: 'blur' }
        ]
      },
      formData: {
        'reward_salary': '', // 奖励工资
        'reward_reason': '', // 奖励原因
        'deduction_salary': '', // 扣除工资
        'deduction_reason': '', // 扣除原因
        'actual_settlement_quantity': '', // 实际回货量
        'work_order_quality_rate': '', // 工单质检合格率
        'actual_salary': '' // 实际工资金额（预计发放工资）
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
      if (this.worker_unit_price) {
        return this.worker_unit_price * this.currentRowData.total_quantity
      }
      return ''
    }
  },
  watch: {
    show(val) {
      val && this.initData()
    },
    reward_type() {
      Object.assign(this.formData, {
        'reward_salary': '', // 奖励工资
        'reward_reason': '', // 奖励原因
        'deduction_salary': '', // 扣除工资
        'deduction_reason': '' // 扣除原因
      })
    },
    'formData.actual_settlement_quantity'() {
      this.caclTotal()
    },
    'formData.reward_salary'() {
      this.caclTotal()
    },
    'formData.deduction_salary'() {
      this.caclTotal()
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  },
  methods: {
    caclTotal() {
      if (this.formData.actual_settlement_quantity) {
        this.formData.actual_salary = (this.formData.actual_settlement_quantity * this.currentRowData.worker_unit_price).toFixed(2)
        if (this.formData.reward_salary) {
          this.formData.actual_salary = (Number(this.formData.actual_salary) + Number(this.formData.reward_salary)).toFixed(2)
        }
        if (this.formData.deduction_salary) {
          this.formData.actual_salary = (Number(this.formData.actual_salary) - Number(this.formData.deduction_salary)).toFixed(2)
        }
      }
    },
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
          let params = {}
          if (this.userInfo.is_salary_managed) {
            params = {
              'reward_salary': this.formData.reward_salary, // 奖励工资
              'reward_reason': this.formData.reward_reason, // 奖励原因
              'deduction_salary': this.formData.deduction_salary, // 扣除工资
              'deduction_reason': this.formData.deduction_reason, // 扣除原因
              'actual_settlement_quantity': this.formData.actual_settlement_quantity, // 实际回货量
              'work_order_quality_rate': this.formData.work_order_quality_rate / 100 // 工单质检合格率
            }
          } else {
            params = {
              'work_order_quality_rate': this.formData.work_order_quality_rate / 100, // 工单质检合格率
              actual_salary: this.formData.actual_salary
            }
          }
          this.$request.post(`/work_orders/${this.currentRowData.work_order_id}/settlement`, params).then(res => {
            if (res.success) {
              this.$message.success('工单结算成功')
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
      Object.assign(this.formData, {
        'reward_salary': '', // 奖励工资
        'reward_reason': '', // 奖励原因
        'deduction_salary': '', // 扣除工资
        'deduction_reason': '', // 扣除原因
        'actual_settlement_quantity': '', // 实际回货量
        'work_order_quality_rate': '', // 工单质检合格率
        'actual_salary': '' // 实际工资金额（预计发放工资）
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
</style>
