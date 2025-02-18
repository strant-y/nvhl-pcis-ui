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
import { saveProInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const orderIssuer = defineAsyncComponent(() => import("./OrderIssuer.vue"));
const salesman = defineAsyncComponent(() => import("./Salesman.vue"));
const agent = defineAsyncComponent(() => import("./Agent.vue"));
const departmentTree = defineAsyncComponent(
  () => import("./DepartmentTree.vue")
);
import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "出单权限分配",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          saveProInfo(s)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("保存成功");
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => {});
        },
      }),
      createFreeButtonBase({
        label: "返回",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "商品制定机构",
        btnWidth: 20,
        itemWidth: 3,
        rules: [{ type: "required" }],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            // const ck = freeEditRef.value?.getValue("componentGroup");
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  // freeEditRef.value?.setValue("componentGroup", res.body);
                }
              });
          },
        },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "CBsnsTyp",
        inputtype: "rtselect",
        title: "渠道大类",
        rules: [getRules("required", {})],
        loadData: [
          {
            label: "13233",
            value: "04",
          },
          {
            label: "34234",
            value: "05",
          },
        ],
      },
      {
        prop: "CChaType",
        inputtype: "rtselect",
        title: "渠道中级分类",
        rules: [getRules("required", {})],
      },
      {
        prop: "CChaSubType",
        inputtype: "rtselect",
        title: "渠道子类",
        rules: [getRules("required", {})],
      },
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "出单机构",
        btnWidth: 20,
        itemWidth: 3,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
        rules: [getRules("required", {})],
      },
      {
        prop: "COperGroup",
        inputtype: "rtselect",
        title: "出单员",
        btnWidth: 10,
        itemWidth: 1.5,
        showExBtn: true,
        btnItems: createFreeButtonBase({
          icon: "Search",
          type: "primary",
          func: () => {
            // const ck = freeEditRef.value?.getValue("componentGroup");
            dzmodal
              .open(orderIssuer, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  // freeEditRef.value?.setValue("componentGroup", res.body);
                }
              });
          },
        }),
        rules: [getRules("required", {})],
      },
      {
        prop: "CSlsGroup",
        inputtype: "rtselect",
        title: " 业务员/产险专员",
        btnWidth: 10,
        itemWidth: 1.5,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            // const ck = freeEditRef.value?.getValue("componentGroup");
            dzmodal.open(salesman, { type: "sales", data: {} }).then((res) => {
              if (res.type === "ok") {
                // freeEditRef.value?.setValue("componentGroup", res.body);
              }
            });
          },
        },
      },
      {
        prop: "CBrkrCde",
        inputtype: "rtselect",
        title: "代理人/经纪人",
        btnWidth: 20,
        itemWidth: 3,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            // const ck = freeEditRef.value?.getValue("componentGroup");
            dzmodal.open(agent, { type: "sales", data: {} }).then((res) => {
              if (res.type === "ok") {
                // freeEditRef.value?.setValue("componentGroup", res.body);
              }
            });
          },
        },
      },
      {
        prop: "CAgtAgrNo",
        inputtype: "rtinput",
        title: "代理协议号",
      },
      {
        prop: "NPropFeeRate",
        inputtype: "rtinput",
        title: "手续费比例",
      },
      {
        prop: "CBusinessTel",
        inputtype: "rtinput",
        title: "机构业务人员联系电话",
      },
      {
        prop: "CEvenJointTel",
        inputtype: "rtinput",
        title: "渠道对接人员联系电话",
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

function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}

onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
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
