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
import { saveInruanceTypeBasicInfo, getCvrgList } from "@/api/prod";
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "险别基本信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (isValid) {
            const s = freeEditRef.value?.getFromValue(); //获取表单数据
            const datas = Object.assign(s, param);
            saveInruanceTypeBasicInfo(datas)
              .then((res) => {
                const { code, data, msg } = res;
                if (200 === code) {
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
        prop: "cCvrgNo",
        inputtype: "rtinput",
        title: "险别代码",
        maxlength: 6,
        rules: [getRules("required", {})],
        func: (val) => {
          formconfig1.fromSchema?.forEach((e) => {
            if (e.prop === "cCvrgNo") {
              setValue("cDispCde", val);
            }
          });
          // setValue("cCvrgNo", val);
          // freeEditRef?.value?.setValue("cCvrgNo", val);
        },
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "大类代码",
        rules: [getRules("required", {})],
        typeCode: "KIND_LIST_ALL",
        params: { cStatus: "1" },
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cDispCde",
        inputtype: "rtinput",
        title: "险别显示码",
        rules: [getRules("required", {})],
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        title: "主险/附加险",
        rules: [getRules("required", {})],
        loadData: [
          {
            label: "主险",
            value: "1",
          },
          {
            label: "附加险",
            value: "2",
          },
        ],
      },
      {
        prop: "cCalcAmt",
        inputtype: "rtselect",
        title: "是否计入总保额",
        effect: "light",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
      },
      {
        prop: "cDutyFree",
        inputtype: "rtselect",
        title: "是否免税",
        effect: "light",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
      },
      // {
      //   prop: "cCvrgTypFlag",
      //   inputtype: "rtselect",
      //   title: "健康险意外险类型",
      //   effect: "light",
      //   loadData: [
      //     {
      //       label: "是",
      //       value: "1",
      //       type: "success",
      //     },
      //     {
      //       label: "否",
      //       value: "2",
      //       type: "info",
      //     },
      //   ],
      // },
      // {
      //   prop: "cHealthType",
      //   inputtype: "rtselect",
      //   title: "意健险13大类",
      //   effect: "light",
      //   loadData: [
      //     {
      //       label: "是",
      //       value: "1",
      //       type: "success",
      //     },
      //     {
      //       label: "否",
      //       value: "2",
      //       type: "info",
      //     },
      //   ],
      // },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "启用标志",
        effect: "light",
        rules: [getRules("required", { change: true })],
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
      },
      {
        prop: "cSourceTyp",
        inputtype: "rtselect",
        title: "险别用途",
        effect: "light",
        loadData: [
          { value: "1", label: "仅核心" },
          { value: "2", label: "仅渠道" },
          { value: "9", label: "通用" },
        ],
        defaultValue: "9",
      },
      {
        prop: "cCvrgDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: "险别描述",
        effect: "light",
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
function handleQuery() {
  const newparam = { cCvrgNo: param.cCvrgNo, pageNum: 1, pageSize: 10 };
  getCvrgList(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        freeEditRef?.value?.setFormValue(data.result[0]);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cCvrgNo" || e.prop === "cKindNo") {
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
onMounted(() => {
  if (param.type === "edit") {
    handleQuery();
    // setTimeout(() => {
    //   freeEditRef.value?.setFormValue(param.data);
    // }, 50);
  }
});
</script>
