<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
    </myCard>
    
    <comDialog ref="dialog"></comDialog>
   </div>
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { AppTableConfig, createTableEditConfig } from "@/shared/app-table-config";
import { formInit } from "@/shared/from-init";
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const dialog = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});
const distEditRef = ref<AppGridEditMethod | null>(null);
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1.value, formconfig11);
  cardconfig.value.title = formconfig1.value.title;
  tableconfig.value.showEdit = true;
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns:formconfig1.value.titleBtns,
    fromSchema:formconfig1.value.distSchema,
  });
  // addFakeData();
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcdistadd: () => {
    dialog.value?.open(
    "distAdd",
    { fromSchema: tableconfig.value.fromSchema,
      title:"新增"
     },
    {
      isOk: (res: any) => {
      },
    },
    { width:'60' }
  );
  },
  funcdistdel: () => {
    const selData = distEditRef?.value?.getSelectRow();
    if (!selData) {
      ElMessage.error("请选择要删除的数据!");
      return;
    }
    const editIndex = selData["_dataId"];
    distEditRef?.value?.delRow(editIndex);
    // const val = getFromValue();
    // val.items.forEach((key, index) => {
    //   key["Dist.ids"] = index + 1;
    // });
  },
};

// 绑定特殊验证器
const exRules = {};

function getData() {
  return distEditRef?.value?.getFromValue();
}

function addFakeData() {
  if (distEditRef.value) {
    const fakeData = {
      // 假数据示例
      NSeqNo: "示例数据1",
      CCoinsurerCde: "示例数据2",
      cCiSubComp: "示例数据3",
    };
    distEditRef.value.addRowByData(fakeData); // 设置新行的数据
  }
}
onMounted(() => {});
defineExpose({
  getData,
});
</script>

<style scoped></style>
