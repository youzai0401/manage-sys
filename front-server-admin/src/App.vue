<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="scss">
.el-image .el-image-viewer__close {
  color: #fff !important;
  bottom: 30px;
  left: 50%;
  -webkit-transform: translateX(150px);
  transform: translateX(150px);
  width: 44px;
  height: 44px;
  font-size: 30px;
  background-color: #606266;
  top: auto;
}

.ellipsis-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.multi-line-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.multi-line-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.multi-line-4 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.el-table__header {
  thead {
    tr {
      th {
        background: #E2F0FF;
        color: #000000;
      }
    }
  }
}
</style>
