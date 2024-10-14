<template>
  <div class="log-info">
    <!-- 弹窗展示日志信息，弹窗内包含一个列表和分页，包含关闭按钮 -->
    <el-dialog
      :title="`订单分配${currentType === 'detail' ? '详情' : ''}`"
      :visible.sync="showDialog"
      width="500"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form :inline="false" :model="currentRowData" class="demo-form-inline">
          <el-row>
            <el-col :span="12">
              <el-form-item label="产品编码">
                <span>{{ currentRowData.product_code }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单编号">
                <span>{{ currentRowData.order_number }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单名称">
                <span>{{ currentRowData.order_name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产总量">
                <span>{{ $numberWithCommas(currentRowData.total_quantity) }} {{ currentRowData.unit }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <p>选择服务点及分配数量</p>
        <div v-for="(item,index) in assignments" :key="item" style="display: flex;align-items: center;margin-bottom: 10px">
          <el-select
            v-model="item.service_point_id"
            filterable
            remote
            clearable
            :remote-method="remoteMethod"
            :loading="selectLoading"
            style="flex: 2"
            placeholder="请选择"
            :disabled="!canEdit"
          >
            <el-option
              v-for="item in serverOption"
              :key="item.service_point_id"
              :label="item.name"
              :value="item.service_point_id"
            />
          </el-select>
          <el-input v-model.number="item.quantity" :disabled="!canEdit" style="flex: 1.2; margin: 0 10px" placeholder="请填写分配数量" />
          <el-input v-model="item.worker_unit_price" type="number" :disabled="!canEdit" style="flex: 2" placeholder="请输入报价，单位：元">
            <template slot="append">元</template>
          </el-input>
          <div v-if="canEdit" style="width: 70px">
            <i v-if="index+1 === assignments.length" style="font-size: 30px" class="el-icon-circle-plus-outline" @click="handleAdd" />
            <i v-if="assignments.length !== 1" style="font-size: 30px" class="el-icon-remove-outline" @click="handleDel(index)" />
          </div>

        </div>

      </div>
      <!--      关闭按钮-->
      <div slot="footer" class="footer">
        <p style="display: inline-block; position: absolute;left: 20px;">订单总价预估：<span style="color: red">{{ $numberWithCommas(assignments_total_price) }} （元）</span></p>
        <el-button @click="showDialog = false">关闭</el-button>
        <el-button v-if="canEdit" :loading="saveLoading" type="primary" @click="handleSave">{{ currentRowData.status === 'ASSIGNED' ? "重新分配" : "分配" }}</el-button>
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
      assignments: [
        {
          'service_point_id': '', // 服务点ID
          'quantity': '', // 分配数量
          'worker_unit_price': '', // 工人单价
          'estimated_pay_date': '' // 最晚交付时间 （不填 预留）
        }
      ],
      canEdit: false,
      saveLoading: false,
      selectLoading: false,
      serverOption: [],
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }]
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
    assignments_total_price() {
      let total = 0
      if (this.assignments.length) {
        this.assignments.forEach(item => {
          if (item.quantity * item.worker_unit_price) {
            total += item.quantity * item.worker_unit_price
          }
        })
        return total
      } else {
        return 0
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
    handleAdd() {
      this.assignments.push({
        'service_point_id': '', // 服务点ID
        'quantity': '', // 分配数量
        'worker_unit_price': '', // 工人单价
        'estimated_pay_date': '' // 最晚交付时间 （不填 预留）
      })
    },
    async handleSave() {
      if (this.assignments.length === 0) {
        this.$message.error('服务点数据不能为空')
        return
      }
      const service_point_id_arr = this.assignments.map(item => item.service_point_id)
      if (this.assignments.length !== [...new Set(service_point_id_arr)].length) {
        this.$message.error('服务点不能重复，请检查后重试')
        return
      }
      for (let i = 0; i < this.assignments.length; i++) {
        const item = this.assignments[i]
        if (!item.service_point_id) {
          this.$message.error(`第${i + 1}条数据中服务点不能为空`)
          return
        }
        if (!item.quantity) {
          this.$message.error(`第${i + 1}条数据中分配数量不能为空`)
          return
        }
        if (item.quantity % 100 !== 0) {
          this.$message.error(`第${i + 1}条数据中分配数量必须为100的整数倍`)
          return
        }
        if (!item.worker_unit_price) {
          this.$message.error(`第${i + 1}条数据中工人单价不能为空`)
          return
        }
      }

      this.saveLoading = true
      // 考虑重新分配
      if (this.currentRowData.status === 'ASSIGNED') {
        const checkRes = await this.$request.post(`/orders/${this.currentRowData.order_id}/reassignments/validate`, {
          assignments: this.assignments.map(item => {
            return {
              'service_point_id': item.service_point_id, // 服务点ID
              'quantity': item.quantity, // 分配数量
              'worker_unit_price': item.worker_unit_price, // 工人单价
              'estimated_pay_date': item.estimated_pay_date // 最晚交付时间 （不填 预留）
            }
          })
        }).catch(() => {
          this.saveLoading = false
        })

        if (!checkRes.success) {
          this.$alert(checkRes.message, '提示', {
            confirmButtonText: '确定',
            callback: () => {
            }
          })
          this.saveLoading = false
          return
        }
      }

      const url = `/orders/${this.currentRowData.order_id}/assignments`
      this.$request.post(url,
        {
          assignments: this.assignments.map(item => {
            return {
              'service_point_id': item.service_point_id, // 服务点ID
              'quantity': item.quantity, // 分配数量
              'worker_unit_price': item.worker_unit_price, // 工人单价
              'estimated_pay_date': item.estimated_pay_date // 最晚交付时间 （不填 预留）
            }
          })
        }).then(res => {
        if (res.success) {
          this.$message.success('订单分配成功')
          this.showDialog = false
          this.$emit('success')
        } else {
          this.$message.error(res.message)
        }
      }).finally(() => {
        this.saveLoading = false
      })
    },
    remoteMethod(query) {
      // if (query !== '') {
      this.searchLoading = true
      // 请求
      const url = '/service_points'
      const params = {
        'name': query // 必传
      }
      this.$request.get(url, params).then(res => {
        if (res) {
          this.serverOption = res.data.data
        }
        this.selectLoading = false
      }).catch(() => {
        this.selectLoading = false
      })
      // } else {
      //   this.serverOption = []
      // }
    },
    handleDel(index) {
      this.assignments.splice(index, 1)
    },
    initData() {
      this.assignments = []
      if (this.currentType === 'detail') {
        this.canEdit = false
        if (this.currentRowData.status === 'ASSIGNED') {
          this.canEdit = true
        }
        this.$request.get(`/orders/${this.currentRowData.order_id}`, {}).then(res => {
          const { data } = res
          if (data) {
            this.assignments = data.assignments
          }
        })
        this.remoteMethod('')
      } else {
        this.canEdit = true
        this.remoteMethod('')
        this.assignments = [
          {
            'service_point_id': '', // 服务点ID
            'quantity': '', // 分配数量
            'worker_unit_price': '', // 工人单价
            'estimated_pay_date': '' // 最晚交付时间 （不填 预留）
          }
        ]
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
