<template>
  <div class="tag-item-container" style="display: inline-block; margin-right: 10px;margin-bottom: 10px">
    <div class="tag-item">
      <span :style="{color: isActive ? '#40A7FF' : '#333333'}" @click="handleClickTag">{{ itemData.name }}</span>
      <img v-if="!isActive" class="edit" src="../../../assets/images/pic_edit.png" @click="startEditing">
      <img v-else class="edit" src="../../../assets/images/pic_edit_2.png" @click="startEditing">
      <img v-if="!isActive" class="delete" src="../../../assets/images/pic_delete.png" alt="" @click="handleDelete">
      <img v-else class="delete" src="../../../assets/images/pic_delete_2.png" alt="" @click="handleDelete">
    </div>
    <!--    <div v-else>-->
    <!--      <el-input ref="tagInput" v-model="itemData.name" style="height: 30px" placeholder="请输入分类名称" @blur="handleSave" />-->
    <!--    </div>-->
    <div v-if="editing">
      <add-or-edit-tag
        :tag-data="itemData"
        :show.sync="editing"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script>
import addOrEditTag from '@/views/product/components/addOrEditTag'
export default {
  name: 'EditTag',
  components: {
    addOrEditTag
  },
  props: {
    tagData: {
      type: Object,
      default: () => {}
    },
    productId: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      itemData: {},
      editing: false,
      isSaving: false
    }
  },
  watch: {
    tagData: {
      handler(val) {
        this.itemData = JSON.parse(JSON.stringify(val))
      },
      immediate: true
    }
  },
  methods: {
    handleClickTag() {
      this.$emit('clickTag', this.tagData)
    },
    startEditing() {
      this.editing = true
    },
    handleDelete() {
      if (this.tagData.sort < 0) {
        this.$message.error('默认分类不能删除')
        return
      }
      // 需要弹窗确认
      this.$confirm('确认删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteTag()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    deleteTag() {
      if (this.tagData.id) {
        const url = 'product/site/class/delete'
        const params = {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
          'params': {
            'siteClassId': this.tagData.siteClassId // 必传，传入 siteClassId
          }
        }
        this.$request({ url, method: 'post', data: params }).then(res => {
          this.$message.success('删除成功')
          // 删除原来数据
          this.$emit('delete', this.tagData)
        }).catch(err => {
          console.log(err)
        })
      }
    },
    handleSave(formData) {
      if (this.isSaving) {
        return
      }
      this.isSaving = true
      if (this.tagData.id) {
        // 编辑
        const url = 'product/site/class/change'
        const params = {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
          'params': {
            'translateModels': [] // todo 传入的数据
          },
          'model': {
            'siteClassId': this.tagData.siteClassId, // 必传 分类的id，在创建后，会自动生成该id
            'name': formData.name, // 修改后的 点位分类名称
            'image': formData.image // 修改后的 点位分类小图标
          }
        }
        this.$request({ url, method: 'post', data: params }).then(res => {
          this.editing = false
          this.$emit('addSuccess')
          this.$message.success('修改成功')
          this.isSaving = false
        }).catch(err => {
          this.itemData.name = this.tagData.name
          console.log(err)
          this.isSaving = false
        })
      } else {
        // 新增
        const url = 'product/site/class/create'
        const params = {
          'timestamp': +new Date(), // 当前的接口时间戳，13位 精确到毫秒
          'caller': 'deer.front', // 访问标识，用来进行系统的并发控制 deer.front 代表微信小程序  deer.front 代表 前端
          'params': {
            'translateModels': [] // todo 传入的数据
          },
          'model': {
            'productId': this.productId, // 必传，上一步中保存的产品id
            'productMapId': 'map_e54b6716e62a47909b0928cfe4557e55', // 必传，上一步中保存的地图id
            'name': formData.name, // 修改后的 点位分类名称
            'image': formData.image // 修改后的 点位分类小图标
          }
        }
        this.$request({ url, method: 'post', data: params }).then(res => {
          console.log(res)
          this.editing = false
          this.$emit('addSuccess')
          this.$message.success('新增成功')
          this.isSaving = false
        }).catch(err => {
          console.log(err)
          this.isSaving = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-item-container {
  height: 30px;
  background: #F0F7FF;
  border-radius: 2px;
  line-height: 30px;
  font-size: 0;
  .tag-item {
    height: 30px;
    background: #F0F7FF;
    border-radius: 2px;
    line-height: 30px;
    padding: 0 12px 0 19px;

    span {
      display: inline-block;
      margin-right: 10px;
      font-weight: 500;
      height: 30px;
      font-size: 14px;
      color: #333333;
      line-height: 30px;
      cursor: pointer;
    }

    .edit {
      margin-right: 10px;
    }
    .edit, .delete {
      width: 12px;
      height: 13px;
      cursor: pointer;
    }
  }
  ::v-deep .el-input__inner {
    height: 30px;
  }
}
</style>
