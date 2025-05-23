<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="deDuctibleEditRef" />
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {getPrdDeductible} from "@/api/prod/index";
import { useRoute } from "vue-router";

import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const deductibleDistModal = defineAsyncComponent(
  () => import("../commodityRef/deductibleDistModal.vue")
);
const route = useRoute();
const opertaor = dataOpertaor();
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const deDuctibleEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcdeDuctiadd: () => {
    deDuctibleEditRef?.value?.addRow();
    const val = getFromValue();
    val.items.forEach((key, index) => {
      key["deducti.nTms"] = index + 1;
    });
  },
  //获取免赔
  getDuductible: () => {
    dzmodal
      .open(deductibleDistModal, { type: "add", data: {} })
      .then((res) => {
        if (res.type === "ok") {
          handleQuery();
        }
      });
  },
  //查询免赔
  queryDeductible: () => {
    let param = Object.assign({pageNum:1,pageSize:999}, {cProdNo:route.params.param.cProdNo},);
    getPrdDeductible(param).then((res) => {
      if (res.code == 200) {
        console.log(res.data.result);
        // const val = getFromValue();
        // val.items = res.data.result;
        // val.items.forEach((key, index) => {
        //   key["deducti.nTms"] = index + 1;
        // });
      }
    });
  },
  funcpaydel: () => {
    const selData = deDuctibleEditRef?.value?.getSelectRow();
    if (!selData) {
      ElMessage.error("请选择要删除的数据!");
      return;
    }
    const editIndex = selData["_dataId"];
    deDuctibleEditRef?.value?.delRow(editIndex);
    const val = getFromValue();
    val.items.forEach((key, index) => {
      key["deducti.nTms"] = index + 1;
    });
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return deDuctibleEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  deDuctibleEditRef?.value?.setFormValue(value);
}

function validate() {
  return deDuctibleEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  deDuctibleEditRef?.value?.getTableValue(rowId, key);
}

function getFormconfig() {
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  getFormconfig,
});
</script>

<style scoped></style>
