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
  console.log("9999999999", props.pageSchema);
  const processedFromSchema = props.pageSchema.fromSchema.map((item) => {
    return Object.keys(item).reduce(
      (acc, key) => {
        if (typeof item[key] === "string" && item[key].startsWith("Dist.")) {
          acc[key] = item[key].replace(/^Dist\./, "");
        } else {
          acc[key] = item[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );
  });
  const formconfig11 = formInit(
    JSON.stringify({ ...props.pageSchema, fromSchema: processedFromSchema }),
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
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 220;
  tableconfig.value.tableBtnPosition = "right";
  tableconfig.value.tableBtn = [
    {
      id: "score",
      link: true,
      tooltip: "编辑",
      type: "success",
      size: "large",
      icon: "Edit",
      tableClick: (row) => {},
    },
    {
      id: "score",
      type: "danger",
      tooltip: "删除",
      icon: "Delete",
      link: true,
      tableClick: (row) => {},
    },
  ];
  // addFakeData();
});

// 绑定方法
const method = {
  func1: () => {},
  handleClose: (val) => {},
  funcdistadd: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        dialog.value?.open(
          "distAdd",
          { fromSchema: tableconfig.value.fromSchema, title: "新增" },
          {
            isOk: (res: any) => {},
            handleQuery: method.handleQuery, // 新增：将 handleQuery 方法传递给 distAdd 组件
          },
          { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  handleQuery: () => {
    const selData = {
      cComponentTable: "AddressDist",
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    };
    selectDist(selData).then((res) => {
      if (res.code === 200) {
        pageresult.list = [];
        pageresult.list = res.data;
        // pageresult.total = data.total;
      }
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
