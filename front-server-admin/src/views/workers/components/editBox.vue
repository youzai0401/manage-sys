<template>
  <div class="log-info">
    <el-dialog
      title="编辑工人信息"
      :visible.sync="showDialog"
      width="500"
      @close="handleClose"
    >
      <div class="log-info__content">
        <el-form :inline="false" :model="formData" :rules="formDataRules" label-width="100px">
          <el-form-item label="工人ID">
            <span>{{ currentRowData.worker_id }}</span>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="formData.name" required show-word-limit maxlength="10" placeholder="请输入姓名"/>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remark"
                      type="textarea"
                      :autosize="{ minRows: 4, maxRows: 8}"
                      show-word-limit maxlength="500"
                      placeholder="请输入备注"/>
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
        'name': '', // 名称
        'remark': '' // 备注
      },
      formDataRules: {
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'}
        ],
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
      this.$request.put(`/workers/${this.currentRowData.worker_id}`,
        {
          ...this.formData
        }).then(res => {
        if (res.success) {
          this.$message.success('修改成功')
          this.handleClose();
          this.$emit("success")
        }
      }).finally(() => {
        this.saveLoading = false
      })
    },
    initData() {
      this.formData.name = this.currentRowData.name;
      this.formData.remark = this.currentRowData.remark;
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
