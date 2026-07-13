<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableConfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
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
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, defineEmits, defineProps } from "vue";
import { ElMessage } from "element-plus";
import {
  query,
  getRiskList,
  saveCvrgRiskRel,
  saveTermRiskRel,
} from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const emits = defineEmits(["handleClose"]);
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

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
/** 动态获取条款基本信息组件引用，避免 setup 阶段 ref 未注册 */
const getTabref = () => opertaor.getTableRefByKey("clauseConfBasicInfo");
const { getRules } = useValidator();

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
          freeEditRef.value?.resetFields();
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
        prop: "cRiskNo",
        inputtype: "rtinput",
        title: "责任代码",
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

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableConfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    maxHeight: "260px",
    editList:['cIsCommon'],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "产品大类编码",
        inputtype: "rtinput",
      },
      {
        prop: "cRiskNo",
        title: "责任代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeEn",
        title: "英文名称",
        inputtype: "rtinput",
      },
      {
        prop: "cIsCommon",
        title: "公共信息",
        inputtype: "rtswitch",
        keymap:{
          y:'1',
          n:'0'
        }
      },
    ],
    endBtns:[
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: () => {
          handleConfirm();
        },
      }),
      createFreeButtonBase({
        type: "info",
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ]
  })
);

const selectedRows = ref<any[]>([]);
/**
 * 分页查询
 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r, { cTermNo: getTabref()?.getFromValue()?.cTermNo });
  getRiskList(param)
    .then((res) => {
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

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

const handleConfirm = () => {
  const opCde = JSON.parse(sessionStorage.getItem("user")).opCde;
  const cTermNo = getTabref()?.getFromValue()?.cTermNo;
  const newArr = selectedRows.value.map((item) => {
    item.cCrtCde = opCde;
    item.cUpdCde = opCde;
    item.cTermNo = cTermNo;
    return item;
  });
  const paramData = { cTermNo: cTermNo, rel: newArr };
  saveTermRiskRel(paramData)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        ElMessage.success("保存成功");
        if (props.method && typeof props.method.isOk === 'function') {
          props.method.isOk();
        }
        emits("handleClose");
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
};
onMounted(() => {
  setTimeout(() => {
    handleQuery();
  }, 100);
});

</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
