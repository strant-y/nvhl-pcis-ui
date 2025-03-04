<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveCommodityBase, getCommodityBase } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

import { useRoute } from "vue-router";
import { cp } from "fs";
const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();
const selectedKindNo = ref<string | null>(null);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const cPard = ref(null);
async function loadProducts(ckindNo: string) {
  console.log("kindNo", ckindNo);
  const params = {
    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
    cParCde: ckindNo,
  };
  const products = await codeListStore.queryCodeList({
    codeListName: "PROD_LIST_IN_GUIDE",
    codeListParam: params,
  });
  return products;
}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    // title: "商品基本信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确认",
        func: async () => {
          const r = await freeEditRef.value.validate();
          if (r) {
            const data = freeEditRef.value?.getFromValue();
            router.push({
              path: "/pcis/my-page",
              query: {
                param: JSON.stringify({ ...data, ...{ pageType: "app" } }),
              },
            });
          } else {
            ElMessage.warning("请检查表单！");
          }
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "承保机构",
        btnWidth: 20,
        itemWidth: 2,
        rules: [{ type: "required" }],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
        },
        loadData: [
          {
            label: "营总销售团队1",
            value: "0251010013000",
          },
        ],
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        itemWidth: 1,
        rules: [{ type: "required" }],
        typeCode: "KIND_LIST_GRT",
        child: "cProdNo",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        func: (row) => {
          cPard.value = row;
          selectedKindNo.value = row.value; // 更新选中的产品大类
          loadProducts(row.value).then((products) => {
            const cProdNoItem = formconfig1.fromSchema.find(
              (item) => item.prop === "cProdNo"
            );
            if (cProdNoItem) {
              cProdNoItem.loadData = products;
            }
          });
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        itemWidth: 1,
        rules: [{ type: "required" }],
        // loadData: [
        //   {
        //     label: "雇主责任保险",
        //     value: "040002",
        //   },
        // ],
        filterable:true,
        typeCode: "PROD_LIST_IN_GUIDE",
        codeParam: {
          cParCde: cPard.value,
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtselect",
        title: "是否团单",
        loadData: [
          { value: "0", label: "否" },
          { value: "1", label: "是" },
          { value: "2", label: "家庭单" },
        ],
      },
      {
        prop: "cCiMrk",
        inputtype: "rtselect",
        title: "联共保业务",
        loadData: [
          { value: "0", label: "非共保业务" },
          { value: "1", label: "外部共保我方主共_主联" },
          { value: "2", label: "外部共保我方从共_主联" },
          { value: "3", label: "外部共保我方主共_无联保" },
          { value: "4", label: "外部共保我方从共_无联保" },
          { value: "5", label: "司内联保_主联" },
        ],
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
/**
 * 获取商品详情
 */
function handleQuery() {
  console.log("param", sessionStorage.getItem("user"));
  const newparam = { cCommodityNo: param.cCommodityNo };
  getCommodityBase(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        freeEditRef?.value?.setFormValue(data.data);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
function setDisa() {
  // formconfig1.fromSchema?.forEach((e) => {
  //   if (e.prop === "cProdNo" || e.prop === "cKindNo") {
  //     e.disabled = true;
  //   }
  // });
}

onMounted(() => {
  if (param.editType === "edit") {
    handleQuery();
    // setDisa();
  }
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
