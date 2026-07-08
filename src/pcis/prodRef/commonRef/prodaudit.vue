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
const { getRules } = useValidator();
import { saveProdAudit, getProducts } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
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
    title: "产品审核信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "提交",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (isValid) {
            const s = freeEditRef.value?.getFromValue(); //获取表单数据
            const newparam = { cProdNo: param.prod.cProdNo };
            const newparams = Object.assign(s, newparam);
            saveProdAudit(newparams)
              .then((res) => {
                const { code, data, msg } = res;
                if (200 === code) {
                  ElMessage.success("保存成功");
                  router.push("/prodconfiguration/prod-audit");
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
          router.push("/prodconfiguration/prod-audit");
        },
      }),
    ],
    fromSchema: [
      // {
      //   prop: "cFeeFlag",
      //   inputtype: "rtcheckbox",
      //   title: " 费用配置已完成",
      //   keymap: {
      //     y: "1",
      //     n: "0",
      //   },
      // },
      // {
      //   prop: "cFeedBackFlag",
      //   inputtype: "rtcheckbox",
      //   title: " 测试反馈报告已完成",
      //   keymap: {
      //     y: "1",
      //     n: "0",
      //   },
      // },
      // {
      //   prop: "cNetProdFlag",
      //   inputtype: "rtcheckbox",
      //   title: " 互联网产品线上披露已完成",
      //   keymap: {
      //     y: "1",
      //     n: "0",
      //   },
      // },
      // {
      //   prop: "cEpolicyFlag",
      //   inputtype: "rtcheckbox",
      //   title: " 电子保单配置完成",
      //   keymap: {
      //     y: "1",
      //     n: "0",
      //   },
      // },

      {
        prop: "cAuditType",
        inputtype: "rtselect",
        title: " 审核意见",
        clearable: true,
        rules: [getRules("required", { change: "审核意见不能为空" })],
        loadData: [
          {
            value: "audit",
            label: "审核通过",
          },
          {
            value: "unsubmit",
            label: "退回",
          },
        ],
      },
      {
        prop: "cAuditDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: " 说明",
        itemwidth: 500,
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
/** 查询详情 */
function handleQuery() {
  const newparam = { cProdNo: param.prod.cProdNo };
  getProducts(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (pageType.value === "copy") {
          data.data.cProdNo = null;
        }
        freeEditRef?.value?.setFormValue(data.data);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {
  if (param.editType === "edit") {
    // handleQuery(param.prodNo);
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
});
</script>
