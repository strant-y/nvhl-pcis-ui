<template>
  <div>
    <app-free-edit
      v-model:freeEditConfig="formconfig1"
      :key="formconfig1.fromSchema"
      ref="freeEditRef"
    />
    <comDialog ref="dialog"></comDialog>
  </div>
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
import {
  saveInruanceTypeBasicInfo,
  getCvrgList,
  savePrdTermInfo,
  getPrdTermInfo,
} from "@/api/prod";
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { DialogMethod } from "@/views/dzmodel/ComDialogConf";
const dialog = ref<DialogMethod | null>(null);

const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "条款基本信息",
    endBtnsPosition: "right",
    endBtns: [
      // createFreeButtonBase({
      //   label: "上传",
      //   type: "primary",
      //   func: () => {},
      // }),
      createFreeButtonBase({
        type: "success",
        label: "标题绑定",
        func: async () => {
          const cTermNo = freeEditRef.value?.getValue("cTermNo");

          dialog.value?.open(
            "termGroupConfig",
            {
              type: "show",
              data: {
                cTermNo: cTermNo,
              },
            },
            {
              isOk: (selectdata: any) => {},
            },
            { title: "群组编辑", width: 85 }
          );
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (isValid) {
            const s = freeEditRef.value?.getFromValue(); //获取表单数据
            const datas = Object.assign(s, { type: param.type });
            // const paramData = datas.map((item: any) => {
            //   if (item.cRdrTyp == "1") {
            //   }
            // });
            savePrdTermInfo(datas)
              .then((res) => {
                const { code, data, msg } = res;
                console.log(data, "data");
                if (200 === code) {
                  freeEditRef?.value?.setFormValue({ cTermNo: data });
                  ElMessage.success("保存成功");
                } else {
                  ElMessage.error(msg);
                }
              })
              .finally(() => {});
          } else {
            ElMessage.error("请填写必填项");
          }
        },
      }),
      createFreeButtonBase({
        label: "返回",
        func: () => {
          router.push("/prodconfiguration/insuranceConfiguration");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险类代码",
        typeCode: "KIND_LIST_CACHE",
        codeParam: { codeListParam: "" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
        disabled: true,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cFilingNo",
        inputtype: "rtinput",
        title: "备案号",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRegisteredNo",
        inputtype: "rtinput",
        title: "注册号",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cEnableFlag",
        inputtype: "rtselect",
        title: "启用标志",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "use_mrk" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIsInternet",
        inputtype: "rtselect",
        title: "是否互联网",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "termRateLower",
        inputtype: "rtnumber",
        title: "费率上限",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "termRateUpper",
        inputtype: "rtnumber",
        title: "费率下限",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "averageCostRate",
        inputtype: "rtnumber",
        title: "平均费用率",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "costRateUpper",
        inputtype: "rtnumber",
        precision: 8,
        placeholder: "1.00000000",
        step: 0.01,
        max: 999999,
        stepStrictly: true,
        min: 0,
        title: "费用率上限",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        title: "主条款/附加条款",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "RdrTyp" },
        rules: [getRules("required", { change: true })],
        //主条款是1附加条款是0
        func: (val: any) => {
          formconfig1.fromSchema.forEach((item: any) => {
            if (item.prop === "cRdrTyp") {
              if (val === "1") {
                item.hidden = true;
              } else {
                item.hidden = false;
              }
            }
          });
        },
      },
      {
        prop: "additionalInsuranceType",
        inputtype: "rtselect",
        title: "附加条款类型",
        typeCode: "additional_insurance",
        codeParam: { cParCde: "add_type" },
        rules: [getRules("required", { change: true })],
        hidden: true, // 初始状态为显示
      },
      {
        prop: "tFilingTm",
        inputtype: "rtdatepicker",
        title: "备案日期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFeedbackTm",
        inputtype: "rtdatepicker",
        title: "反馈日期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIsExist",
        inputtype: "rtselect",
        title: "条款文件是否存在",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      // {
      //   prop: "cClassOfClause",
      //   inputtype: "rtselect",
      //   title: "条款类别",
      //   typeCode: "ClassOfClause",
      //   codeParam: { cParCde: "" },
      // },
      {
        prop: "cWebsite",
        inputtype: "rtinput",
        title: "官网链接",
        btnWidth: 20,
        itemWidth: 3,
        disabled: true,
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        btnWidth: 20,
        itemWidth: 3,
        rows: 4,
        title: "条款描述",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
// 监听主条款/附加条款字段的变化
watch(
  () => freeEditRef.value?.getValue("cRdrTyp"),
  (newValue) => {
    const additionalInsuranceTypeField = formconfig1.fromSchema.find(
      (field) => field.prop === "additionalInsuranceType"
    );
    if (additionalInsuranceTypeField) {
      additionalInsuranceTypeField.hidden = newValue === "1";
    }
  }
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
function handleQuery() {
  const newparam = { cPkId: param.cPkId, pageNum: 1, pageSize: 10 };
  getPrdTermInfo(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        freeEditRef?.value?.setFormValue(data);
        // 调用 watch 监听器中的逻辑来设置 additionalInsuranceType 字段的 hidden 属性
        const cRdrTypValue = data.cRdrTyp;
        setAdditionalInsuranceTypeHidden(cRdrTypValue);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
// 新增函数来设置 additionalInsuranceType 字段的 hidden 属性
function setAdditionalInsuranceTypeHidden(cRdrTypValue: string) {
  const additionalInsuranceTypeField = formconfig1.fromSchema.find(
    (field) => field.prop === "additionalInsuranceType"
  );
  if (additionalInsuranceTypeField) {
    additionalInsuranceTypeField.hidden = cRdrTypValue === "0";
    if (cRdrTypValue === "0") {
      // 隐藏时将值置空
      freeEditRef.value?.setValue("additionalInsuranceType", null);
    }
  }
}
const emit = defineEmits(["clause-type-change"]);

// 监听主条款/附加条款字段的变化
watch(
  () => freeEditRef.value?.getValue("cRdrTyp"),
  (newValue) => {
    emit("clause-type-change", newValue);
  }
);
function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cTermNo" || e.prop === "cWebsite") {
      e.disabled = true;
    }
  });
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});

watch(
  () => formconfig1.fromSchema,
  (newVal) => {},
  {
    deep: true,
  }
);

onMounted(() => {
  if (param.type === "edit") {
    handleQuery();
  } else {
    setAdditionalInsuranceTypeHidden("1");
    // 如果不是编辑模式，确保默认值生效
    freeEditRef.value?.setFormValue({ cSourceTyp: "9" });
  }
});
</script>
