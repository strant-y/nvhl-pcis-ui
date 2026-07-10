<template>
  <div class="" style="padding-bottom: 6px">
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
import { formatActionTitle } from "@/utils/action-title";
import { useValidator } from "@/typings/useValidator";
import {
  saveInruanceTypeBasicInfo,
  getCvrgList,
  savePrdTermInfo,
  getPrdTermInfo,
} from "@/api/prod";
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
const router = useRouter();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { clear } from "console";
import { dataParam } from "@/store/modules/dataParam";
import { closeCurrentTagAndBack } from "@/utils/common";
const paramparam = dataParam();
const dialog = ref<DialogMethod | null>(null);
const param = paramparam.getParam();
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: formatActionTitle(param?.type, "条款基本信息"),
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "success",
        label: "条款要素绑定",
        func: async () => {
          const cTermNo = freeEditRef.value?.getValue("cTermNo");

          dialog.value?.open(
            "termFactorConfig",
            {
              type: "show",
              data: {
                cTermNo: cTermNo,
              },
            },
            {
              isOk: (selectdata: any) => {},
            },
            { title: "条款要素绑定", width: 75 }
          );
        },
      }),
      createFreeButtonBase({
        type: "success",
        label: "条责分组关联",
        func: async () => {
          const cTermNo = freeEditRef.value?.getValue("cTermNo");
          dialog.value?.open(
            "termRiskGroupConfig",
            {
              type: "show",
              data: {
                cTermNo: cTermNo,
              },
            },
            {
              isOk: (selectdata: any) => {},
            },
            { title: "条款责任分组关联", width: 75 }
          );
        },
      }),
      // createFreeButtonBase({
      //   label: "上传条款文件",
      //   type: "primary",
      //   func: async () => {
      //     handleUpload();
      //   },
      // }),
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (isValid) {
            const s = freeEditRef.value?.getFromValue(); //获取表单数据
            const datas = Object.assign(s, { type: param.type === "copy" ? "add" : param.type });
            // const paramData = datas.map((item: any) => {
            //   if (item.cRdrTyp == "1") {
            //   }
            // });
            savePrdTermInfo(datas)
              .then((res) => {
                const { code, data, msg } = res;
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
          closeCurrentTagAndBack("/prodconfiguration/InsuranceConfiguration");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险类代码",
        typeCode: "KIND_LIST_GRT",
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
        prop: "termRateUpper",
        inputtype: "rtnumber",
        title: "费率上限",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "termRateLower",
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
        typeCode: "WEB_SYS_RdrTyp",
        codeParam: { cParCde: "RdrTyp" },
        clearable: true,
        rules: [getRules("required", { change: true })],
        //主条款是0附加条款是1
        func: (val: any) => {
          emit("clause-type-change", val);
          setFormItem("additionalInsuranceType", {
            hidden: val === "1" ? 0 : 1,
          });
          // 当选择附加条款时，隐藏费率相关字段
          const rateFields = ["termRateUpper", "termRateLower", "averageCostRate", "costRateUpper"];
          rateFields.forEach(field => {
            setFormItem(field, {
              hidden: val === "1"
            });
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
        hidden: false, // 初始状态为显示
      },
      {
        prop: "tFilingTm",
        inputtype: "rtdatepicker",
        title: "备案日期",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFeedbackTm",
        inputtype: "rtdatepicker",
        title: "反馈日期",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRegisterDate",
        inputtype: "rtdatepicker",
        title: "注册日期",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "cAreaRange",
        inputtype: "rtinput",
        title: "经营区域",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cIsGreenProduct",
        inputtype: "rtselect",
        title: "是否绿色产品",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cBasicRate",
        inputtype: "rtnumber",
        title: "基础费率",
        precision: 8,
        placeholder: "1.00000000",
      },
      {
        prop: "cRateFloatCoefFloor",
        inputtype: "rtnumber",
        title: "费率浮动系数上限",
        precision: 8,
        placeholder: "1.00000000",
      },
      {
        prop: "cRateFloatCoefCeil",
        inputtype: "rtnumber",
        title: "费率浮动系数下限",
        precision: 8,
        placeholder: "1.00000000",
      },
      {
        prop: "cIsGroup",
        inputtype: "rtselect",
        title: "是否团单",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "isDutyfree",
        inputtype: "rtselect",
        title: "是否免税",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cInsurancePeriod",
        inputtype: "rtinput",
        title: "保险期间",
      },
      {
        prop: "cClauseFilename",
        inputtype: "rtinput",
        title: "条款附件名称",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRateFilepath",
        inputtype: "rtinput",
        title: "费率附件下载路径",
        btnWidth: 20,
        itemWidth: 3,
        disabled: true,
      },
      {
        prop: "cIsExist",
        inputtype: "rtselect",
        title: "电子保单是否存在",
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
// 上传文件处理函数
const handleUpload = async () => {
  try {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.docx";
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await uploadFile(formData);
        if (response.code === 200) {
          ElMessage.success("文件上传成功");
        } else {
          ElMessage.error(response.msg || "文件上传失败");
        }
      }
    };
    fileInput.click();
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

//上传文件的 API
const uploadFile = (formData: FormData) => {
  // 调用后端 API 进行文件上传
  // return axios.post('/api/upload', formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // });
};
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
function handleQuery() {
  const newparam = { cPkId: param.row.cPkId, pageNum: 1, pageSize: 10 };
  getPrdTermInfo(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        setTimeout(() => {
          freeEditRef?.value?.setFormValue(data);
          emit("clause-type-change", data?.cRdrTyp);
          if (param.type === "copy") {
            freeEditRef?.value?.setValue("cTermNo", null);
          }
        }, 1000);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
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
  
  if (param.type === "edit" || param.type === "copy") {
    handleQuery();
  } else {
    // 如果不是编辑模式，确保默认值生效
    freeEditRef.value?.setFormValue({ cSourceTyp: "9" });
    freeEditRef?.value?.setFormValue({cIsExist:'0'})
  }
});
</script>
