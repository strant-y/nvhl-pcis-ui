<!-- 配置 -->
<template>
  <div>
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
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
        label: '确定',
        func: () => {
          confirm()
        },
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { queryCAssPlyNo } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const selectList = ref([]);
const dialogVisible = ref(true);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits(["handleClose"]);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
  })
);

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
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        lengthNum: 20,
        lengthIsNumber: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品",
				align: "left"
      },
    ],
  })
);

onMounted(async () => {
  // handleQuery(true);
});

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue();
  const param = Object.assign(r, s);
  queryCAssPlyNo(param).then((res:any) => {
    if ('1' === res.code) {
      pageresult.list = [];
      pageresult.list = res.data;
      pageresult.total = res.total;
    } else {
      ElMessage.error(res.message);
    }
  }).catch((err:any) => {
      ElMessage.error(err.message);
  });
}

const selectedRows = ref<any[]>([]);

// 选中事件
function handleSelectionChange(rows: any) {
  if (rows.length > 1) {
    // 如果尝试选择多个，取消之前的选中状态
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(rows[1], true); // 重新选中最后一个行
  } else {
    selectedRows.value = rows;
  }
}

function confirm() {
  if(selectedRows.value.length < 1) {
    ElMessage.warning('请先选择数据');
    return;
  } else {
    props.method.isOk(selectedRows.value[0]);
    emits("handleClose");
  }
}
</script>

<style scoped></style>
