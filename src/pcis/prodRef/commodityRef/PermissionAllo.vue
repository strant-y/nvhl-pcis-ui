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
import { useDzModal } from "@/common/dzmodel/DzModalService";
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
        prop: "cPertainDptCde",
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
                  const selectObj = res.body;
                  freeEditRef.value.setValue(
                                      "cPertainDptCde",
                                      selectObj.id
                                  );
                  setFormItem("cPertainDptCde", {
                                      loadData: [
                                          {
                                              label: `${selectObj.id}${selectObj.name}`,
                                              value: selectObj.id,
                                          },
                                      ],
                                  });

                }
              });
          },
        },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cBsnsTyp",
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
        prop: "cChaType",
        inputtype: "rtselect",
        title: "渠道中级分类",
        rules: [getRules("required", {})],
      },
      {
        prop: "cChaSubType",
        inputtype: "rtselect",
        title: "渠道子类",
        rules: [getRules("required", {})],
      },
      {
        prop: "cDptCde",
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
                  
                  const selectObj = res.body;
                  freeEditRef.value.setValue(
                                      "cDptCde",
                                      selectObj.id
                                  );


                  setFormItem("cDptCde", {
                                      loadData: [
                                          {
                                              label: selectObj.name,
                                              label: `${selectObj.id}${selectObj.name}`,
                                              value: selectObj.id,
                                          },
                                      ],
                                  });
                }
              });
          },
        },
        rules: [getRules("required", {})],
      },
      {
        prop: "cOperGroup",
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
        prop: "cSlsGroup",
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
        prop: "cBrkrCde",
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
            dzmodal.open(agent, { cProdNo: '',type: "sales", data: {} }).then((res) => {
              console.log(res,78)
              if (res.type === "ok") {
                // freeEditRef.value?.setValue("componentGroup", res.body);
           
              }
            });
          },
        },
      },
      {
        prop: "cAgtAgrNo",
        inputtype: "rtinput",
        title: "代理协议号",
      },
      {
        prop: "nPropFeeRate",
        inputtype: "rtinput",
        title: "手续费比例",
      },
      {
        prop: "cBusinessTel",
        inputtype: "rtinput",
        title: "机构业务人员联系电话",
      },
      {
        prop: "cEvenJointTel",
        inputtype: "rtinput",
        title: "渠道对接人员联系电话",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

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
