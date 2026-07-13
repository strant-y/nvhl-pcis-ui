<template>
  <div style="padding-top: 6px">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import dayjs from "dayjs";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { saveProInfo, getProducts } from "@/api/prod";
const emit = defineEmits(["prod-data-loaded", "prod-saved"]);
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import { dataParam } from "@/store/modules/dataParam";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const dataparam = dataParam();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);

const router = useRouter();
const param = dataparam.getParam();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const props = defineProps({
  data: Object,
  type: String,
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "产品基本信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (isValid) {
            const s = freeEditRef.value?.getFromValue(); //获取表单数据
            saveProInfo(s)
              .then((res) => {
                const { code, data, msg } = res;
                if (200 === code) {
                  ElMessage.success("保存成功");
                  param?.onSaved?.(s);
                  // 复制模式下，保存成功后通知父组件，用新 cProdNo 保存关联数据
                  // cProdNo 由用户手动输入，从表单数据中获取，而非接口返回值
                  if (param.editType === "copy") {
                    nextTick(() => {
                      emit("prod-saved", s.cProdNo);
                    });
                  }
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
        label: param?.inDialog ? "关闭" : "返回",
        func: () => {
          if (param?.inDialog) {
            param?.onClose?.();
          } else {
            router.push("/prodconfiguration/prodFactory");
          }
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cBsType",
        inputtype: "rtselect",
        title: "业务大类",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "BsType" },
        clearable: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类编码",
        rules: [getRules("required", {})],
        typeCode: "KIND_LIST_GRT",
        codeParam: { cStatus: "1" },
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编码",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
        clearable: true,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cCnmAbr",
        inputtype: "rtinput",
        title: "中文简称",
        clearable: true,
      },
      {
        prop: "cPlynoFlag",
        inputtype: "rtcheckbox",
        title: "手工录入保单号",
        clearable: true,
        keymap: {
          y: "1",
          n: "0",
        },
        func: (val) => {
          console.log(val);
        },
      },
      {
        prop: "cDispOrd",
        inputtype: "rtinput",
        title: "显示顺序",
      },
      {
        prop: "nCriterionTime",
        inputtype: "rtnumber",
        title: "标准承保期限",
        clearable: true,
        rules: [getRules("required", { change: "标准承保期限不能为空" })],
      },
      {
        prop: "cCriterionTimeUnit",
        inputtype: "rtselect",
        title: "标准承保期限单位",
        rules: [getRules("required", { change: "标准承保期限单位不能为空" })],
        typeCode: "WEB_BAS_CODELIST",
        codeParam: { cParCde: "CriterionUnit" },
        clearable: true,
      },
      {
        prop: "cFincvrgFlag",
        inputtype: "rtcheckbox",
        title: "按险别核算标志",
        clearable: true,
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cInsrncLong",
        inputtype: "rtselect",
        title: " 长短期标志",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "longshortIns" },
      },
      {
        prop: "cClmedrFlag",
        inputtype: "rtcheckbox",
        title: " 赔款后生成减保额批单",
        clearable: true,
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cPerFlag",
        inputtype: "rtcheckbox",
        title: " 是否个单",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cGrpFlag",
        inputtype: "rtcheckbox",
        title: " 是否团单",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cIsSelect",
        inputtype: "rtselect",
        title: " 是否展示所有条款",
        loadData: yesOrNo,
      },
      {
        prop: "tBgnTm",
        inputtype: "rtdatepicker",
        title: " 生效日期",
        rules: [getRules("required", { change: "生效日期不能为空" })],
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
        // func: (val: any) => {
        //   freeEditRef.value?.setFormValue({
        //     cCriterionTimeUnit: "A",
        //     tBgnTm: dayjs(val).format("YYYY-MM-DD"),
        //     tAdbTm: dayjs(val).add(3, "day").format("YYYY-MM-DD"),
        //   });
        // },
      },
      {
          prop: "tAdbTm",
          inputtype: "rtdatepicker",
          title: " 失效日期",
          rules: [getRules("required", { change: "失效日期不能为空" })],
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          format: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "cSepaCvrgFlag",
        inputtype: "rtcheckbox",
        title: " 主条款和附加条款是否分开",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cPkgFlag",
        inputtype: "rtcheckbox",
        title: " 是否组合产品",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cAddType",
        inputtype: "rtselect",
        title: " 利率类型",
        typeCode: "RECEIVE_BANK_CATEGORY",
        clearable: true,
        codeParam: { cParCde: "addtype" },
      },
      {
        prop: "descri",
        inputtype: "rtinput",
        type: "textarea",
        title: " 利率描述",
        itemWidth: 2,
      },
      {
        prop: "cFamilyFlag",
        inputtype: "rtcheckbox",
        title: " 是否家庭单",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      // {
      //   prop: "cCvrgTypFlag",
      //   inputtype: "rtselect",
      //   title: " 健康险意外险类型",
      //   clearable: true,
      //   loadData: [
      //     {
      //       value: "0",
      //       label: "健康险",
      //     },
      //     {
      //       value: "1",
      //       label: "意外险",
      //     },
      //     {
      //       value: "3",
      //       label: "其他险",
      //     },
      //   ],
      // },
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
    if (e.prop === "cProdNo" || e.prop === "descri") {
      e.disabled = true;
    }
  });
}
/** 查询详情 */
function handleQuery(prodNo?: string) {
  const cProdNo = prodNo || param?.prodNo || param?.prod?.cProdNo;
  if (!cProdNo) {
    return;
  }
  const newparam = { cProdNo };
  getProducts(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        // 复制模式下，先保留原始 cProdNo 回显数据，通知父组件后再清空
        if (param.editType === "copy") {
          freeEditRef?.value?.setFormValue(data);
          nextTick(() => {
            emit("prod-data-loaded");
          });
        } else if (pageType.value === "copy") {
          data.cProdNo = null;
          freeEditRef?.value?.setFormValue(data);
        } else {
          freeEditRef?.value?.setFormValue(data);
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

/**
 * 复制模式下，清空产品编码
 * 在数据回显完成后，由父组件调用此方法
 */
function clearCopyProdNo() {
  if (param.editType === "copy") {
    freeEditRef?.value?.setValue("cProdNo", null);
  }
}
onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
    setTimeout(() => {
      handleQuery(param.prodNo);
    }, 100);
  } else if (param.editType === "copy") {
    // 复制模式：使用原始产品编码查询数据，回显后再清空产品编码
    setTimeout(() => {
      handleQuery(param.prodNo);
    }, 100);
  } else if (param.editType === "view") {
    setTimeout(() => {
      handleQuery(param.prodNo);
    }, 100);
    formconfig1.fromSchema?.forEach((e) => {
      e.disabled = true;
    });
    // view 模式下禁用保存按钮，但保留返回按钮可用
    if (formconfig1.endBtns && formconfig1.endBtns.length > 0) {
      formconfig1.endBtns[0].disabled = true;
    }
  } else {
    setTimeout(() => {
      freeEditRef.value?.setFormValue({
        cCriterionTimeUnit: "A",
        tBgnTm: dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        tAdbTm: dayjs()
          .add(1, "year")
          .endOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
      });
    }, 50);
  }
});
const pageType = ref("add");
function copyInitProdNo(prodNo: string) {
  formconfig1.endBtns = [];
  pageType.value = "copy";
  handleQuery(prodNo);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  copyInitProdNo,
  /** 暴露清空复制产品编码方法，供父组件在数据回显后调用 */
  clearCopyProdNo,
});
</script>
