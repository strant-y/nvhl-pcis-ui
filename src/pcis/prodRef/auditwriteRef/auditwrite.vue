<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="underwriteEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const undrOpnMap = {
  "0": "经过审核，同意承保该业务。",
  "1": "经过审核，该业务缺少如下必要信息，请补充后再提交：",
  "2": "经过审核，该业务必须修改如下承保条件：",
  "3": "经过核算，该业务的前线费用已经超出我司规定的上限，请将费用控制在        %以内。",
  "4": "经过审核，我司决定放弃该业务，原因如下：",
  "5":
    "此业务已经超出本级别核保权限，提交上级核保。" +
    "\n" +
    "初步审核意见如下：",
};
const underwriteEditRef = ref<AppFreeEditMethod | null>(null);
const cUndrMrkOptions = ref([])
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cUndrMrk",
        inputtype: "rtselect",
        title: "核保选项",
        loadData: [
          {value: 'A', label: '同意'},
          {value: 'B', label: '退回给出单员'}
        ],
        rules: [getRules("required", {})],
        clearable: true,
        func: (v:string) => {
          setFormItem('cUndrOpnList',{disabled:false})
          setFormItem('undrOpn',{disabled:false})
          if ("A" === v) {
            setValue("cUndrOpnList", "");
            setFormItem("cUndrOpnList", {
              loadData: [{ label: "审核通过", value: "0" }],
            });
          }else {
            setValue("cUndrOpnList", "");
            setFormItem("cUndrOpnList", {
              loadData: [
                { label: "缺少必要信息", value: "1" },
                { label: "修改承保条件", value: "2" },
                { label: "费用超标", value: "3" },
                { label: "拒绝承保", value: "4" },
                { label: "录入错误", value: "7" },
                { label: "资料不全", value: "8" },
                { label: "其他", value: "9" },
              ],
            });
          }
        },
      },
      {
        prop: "cUndrOpnList",
        inputtype: "rtselect",
        title: "核保意见选项",
        loadData: [
          { label: "审核通过", value: "0" },
          { label: "缺少必要信息", value: "1" },
          { label: "修改承保条件", value: "2" },
          { label: "费用超标", value: "3" },
          { label: "拒绝承保", value: "4" },
          { label: "提交上级", value: "5" },
        ],
        rules: [getRules("required", {})],
        itemWidth: 1,
        valueSpan: 10,
        clearable: true,
        func: (val: any) => {
          const data = val ? undrOpnMap[val] : "";
          underwriteEditRef.value?.setValue("undrOpn", data);
        },
      },
      {
        prop: "undrOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "核保意见",
        rows: 3,
        itemWidth: 2,
      }
    ],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
  })
);
onMounted(()=>{
  setFormItem('cUndrOpnList',{disabled:true})
  setFormItem('undrOpn',{disabled:true})

})
function getFromValue() {
  return underwriteEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  underwriteEditRef?.value?.setFormValue(value);
}

function validate() {
  return underwriteEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  underwriteEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return underwriteEditRef?.value?.getValue(key);
}

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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
<style lang="scss" scoped>
// :deep(form .el-col:nth-child(1) .el-form-item__content div) {
//   width: 400px !important;
// }
// :deep(form .el-col:nth-child(2) .el-form-item__content div) {
//   width: 200px !important;
// }
</style>
