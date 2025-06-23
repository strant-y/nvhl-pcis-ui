<!-- 表单弹窗 -->
<template>
  <el-dialog
    class="dialog_"
    v-model="dialog.visible"
    :title="dialog.title"
    width="650px"
  >
    <div class="dialog_">
      <el-transfer
        v-model="transferData"
        :titles="['系统菜单列表', '快捷菜单列表']"
        :data="shortcutDataList"
      />
    </div>
    <div class="dialog_button">
      <el-button @click="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click="transferDataSendTag">确认</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
// 菜单列表
const tags = ref([]);
const shortcutDataList = ref<[]>([]);

// 快捷菜单编辑弹框基本数据
const dialog = reactive({
  title: "",
  visible: false,
});

const transferData = ref([]);
const transferDataOld = ref([]);
</script>
    