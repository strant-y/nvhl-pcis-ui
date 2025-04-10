<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
      />
    </myCard>

    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { selectDist, checkAppBase } from "@/api/prod/index";
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
const tableRef = ref<AppTableMethod | null>(null);
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
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  // addFakeData();
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcdistadd: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        dialog.value?.open(
          "distAdd",
          { fromSchema: tableconfig.value.fromSchema, title: "新增" },
          {
            isOk: (res: any) => {},
          },
          { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  handleQuery: () => {
    const selData = tableRef?.value?.getFromValue();
    selectDist(selData).then((res) => {
      console.log(res, "=========");
      // if (res.code === 0) {
      // }
    });
  },
};

// 绑定特殊验证器
const exRules = {};

function getData() {
  // return distEditRef?.value?.getFromValue();
}

function addFakeData() {
  // if (distEditRef.value) {
  //   const fakeData = {
  //     // 假数据示例
  //     NSeqNo: "示例数据1",
  //     CCoinsurerCde: "示例数据2",
  //     cCiSubComp: "示例数据3",
  //   };
  //   distEditRef.value.addRowByData(fakeData); // 设置新行的数据
  // }
}
onMounted(() => {});
defineExpose({
  getData,
});
</script>

<style scoped></style>
