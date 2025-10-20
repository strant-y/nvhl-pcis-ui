<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableConfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
  />
</template>

<script setup lang="ts">
import { queryTermToRelList, saveTermRel } from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits(["handleClose"]);
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
const { getRules } = useValidator();

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "查询条件",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cTermNo: "",
            cNmeCn: "",
            cTermNos: "",
          });
          // handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类编码",
        typeCode: "KIND_LIST_GRT",
        codeParam: { cStatus: "1" },
      },
      {
        prop: "cTermRdrCde",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const tableConfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 80,
        func: (v: any) => {},
      },
      {
        prop: "cKindNo",
        title: "产品大类编码",
        inputtype: "rtinput",
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
        inputtype: "rtinput",
      },
    ],
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        label: "取消",
        func: async () => {
          emits("handleClose");
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "确认",
        func: async () => {
          handleConfirm();
        },
      }),
    ],
  })
);

/**
 * 分页查询
 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r, {
    cRdrTyp: "1",
    cTermNo: props.data.termInfo.cTermNo,
  });
  queryTermToRelList(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

onMounted(() => {
  freeEditRef.value?.setValue("cKindNo", props.data.termInfo.cKindNo);
  setTimeout(() => {
    handleQuery();
  }, 100);
});

const handleConfirm = () => {
  const Allselect = pageresult.list.filter(
    (item: any) => item.isChecked === "1"
  );
  if (Allselect && Allselect.length === 0) {
    ElMessage.error("请选择要关联的附加险");
    return;
  }
  const newArr = Allselect.map((item: any) => {
    item.cTermRdrCde = item.cTermNo;
    item.cTermNo = props.data.termInfo.cTermNo;
    item.cRdrTyp = "1";
    return item;
  });
  const paramData = { cTermNo: props.data.termInfo.cTermNo, rel: newArr };
  saveTermRel(paramData)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        ElMessage.success("保存成功");
        emits("handleClose");
        props.method.isOk();
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
};
</script>
