<!-- 表单弹窗 -->
<template>
  <el-dialog
    class="dialog_"
    v-model="dialogVisible"
    title="快捷菜单标记"
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
    <template #footer>
      <rt-button :item="cancelBtn"/>
      <rt-button :item="confirmBtn"/>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { createFreeButtonBase } from "@/shared/button-config";
import {getShortcutDataList, updateShortRoute} from "@/api/menu";
const props = defineProps({
  param: {
    type: Object,
  },
});

const emits = defineEmits(['ok','cancel'])

const dialogVisible = ref(true);
// 标签类型
const tagType = ["primary", "success", "info", "warning", "danger"];
// 菜单列表
const shortcutDataList = ref<[]>([]);
const transferData = ref([]);
const transferDataOld = ref([]);

const cancelBtn = createFreeButtonBase({
  type: "primary",
  label: "取消",
  func: () => {
    dialogVisible.value = false;
  },
});
const confirmBtn = createFreeButtonBase({
  type: "primary",
  label: "确认",
  func: () => {
    transferDataSendTag()
  },
});
onMounted(() => {
  initShortRoute()
})
const init = ref(true);
const initShortRoute = () => {
  transferData.value = [];
  getShortcutDataList().then((res:any) => {
    if(res.code == 200){
      shortcutDataList.value = res.data;
      res.data.forEach(d => {
        if(d.select){
          transferData.value.push(d.key);
        }
      })
      transferDataSendTag();
    }
  }).finally(()=>{
    init.value = false;
  })
}
const transferDataSendTag = () => {
  const tagList:any = [];
  let i = 0 ;
  if(transferData.value.length > 5){
    transferData.value = transferDataOld.value;
    ElMessage({
      message: "选择过多,无法正常显示,最多5个！",
      type: "warning",
    });
    return ;
  }
  shortcutDataList.value.forEach((obj:any) => {
    transferData.value.forEach(tr => {
      if (obj.key === tr) {
        tagList.push({
          name: obj.label,
          type: tagType[(i % 5) + 1],
          url: obj.url,
        });
        i++;
      }
    })
    transferDataOld.value = transferData.value;
  });
  emits('ok',tagList)
  if(!init.value){
    updateShortRoute({shortRoute: transferData.value}).then((res => {
      dialogVisible.value = false;
    }))
  }
};
</script>
    