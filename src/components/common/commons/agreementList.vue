<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="特别约定">
    <div>
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @page-change="handleQuery(false)"
      />
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const selectList = ref([]);
const dialogVisible = ref(true);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    fromSchema: [
      {
        prop: "names",
        inputtype: "rtinput",
        title: "特别约定代码",
        minWidth: 180,
      },
      {
        prop: "text",
        inputtype: "rtinput",
        title: "特约内容",
				minWidth: 180,
				align: "left"
      },
    ],
  })
);

onMounted(async () => {
  handleQuery(true);
});

watch(
  () => props.data,
  (newTableConfig) => {
    pageresult.list = [
      { names: "张三", text: "核保意见" },
      { names: "李四", text: "核保意见" },
    ];
    pageresult.total = 2;
  },
  { deep: true }
);
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

/** 查询 */
function handleQuery(flag?: boolean) {
  pageresult.list = [
    { names: "张三", text: "核保意见" },
    { names: "李四", text: "核保意见" },
  ];
  pageresult.total = 2;
  console.log("saadd", pageresult.list);
  // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  // const param = Object.assign(r);
  // getBasicKindList(param)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       pageresult.list = [];
  //       pageresult.list = data.result;
  //       pageresult.total = data.total;
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => {});
}

// 多选事件
function handleSelectionChange(selection: any) {
  selectList.value = selection.map((item: any) => item.names);
  console.log("selection", selection);
}
</script>

<style scoped></style>
