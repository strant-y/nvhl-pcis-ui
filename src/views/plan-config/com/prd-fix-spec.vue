<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <div class="app-container">
      <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
        @selection-change="handleSelectionChange" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="returnData">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { codeListViewStore } from "@/store";


const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const emits = defineEmits(['ok'])
const dialogVisible = ref(true)
const tableRef = ref<MyTableMethod | null>(null);
const selected = ref([])
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: true,
    fromSchema: [
      {
        prop: "PrdFixSpec.CSpecNo",
        inputtype: 'rtinput',
        title: "特别约定代码",
      },
      {
        prop: "PrdFixSpec.CNmeCn",
        inputtype: 'rtinput',
        title: "特约内容",
				align: "left"
      },
      {
        prop: "PrdFixSpec.CNmeEn",
        inputtype: 'rtinput',
        title: "英文名",
				align: "left"
      },
    ],
  })
);

const handleSelectionChange = (selection) => {
  selected.value = selection
}

const refreshData = () => {
  // 查询列表数据
  codeListStore.queryCodeList({
    codeListName: 'FIX_SPEC_LIST',
    codeListParam: {
      'cProdNo': props.data.cProdNo
    }
  }, false, true).then(res => {
    if (res) {
      pageresult.list = []
      res.forEach(item => {
        pageresult.list.push({
          'PrdFixSpec.CSpecNo': item.cSpecNo,
          'PrdFixSpec.CNmeCn': item.cNmeCn,
          'PrdFixSpec.CNmeEn': item.cNmeEn,
        })
      })
    }
  });
};

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
  emits('ok', selected.value)
  dialogVisible.value = false
}

onMounted(() => {
  refreshData()
});
</script>

<style scoped lang="scss"></style>