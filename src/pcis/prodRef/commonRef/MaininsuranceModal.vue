<template>
  <el-dialog
    v-model="dialogVisible"
    title="关联主条款"
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableConfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handelCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
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
  associationCvrg,
  associationTerm,
  getUnbindCvrgRefProd,
  getUnbindTermRefProd,
} from "@/api/prod";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, defineEmits, defineProps } from "vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const emits = defineEmits(["ok", "cancel"]);
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
// const opertaor = dataOpertaor(idxParam.opertaorProps);
const dialogVisible = ref(true);
const props = defineProps<{
  data: Object;
  type: string;
  idxParam: Object;
}>();
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);

const selectedRows = ref<any[]>([]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();

function getCProdNo() {
  const prodInfoRef = opertaor?.getTableRefByKey?.("prodInfo");
  const cProdNo = prodInfoRef?.getFromValue?.()?.cProdNo;
  if (!cProdNo) {
    ElMessage.error("产品编码为空,请保存后操作!");
    return "";
  }
  return cProdNo;
}

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
          queryFormRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "业务大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
        // disabled: true,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
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
    maxHeight: "300",
    fromSchema: [
      {
        prop: "cKindNme",
        title: "产品大类名称",
        inputtype: "rtinput",
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "条款名称",
        inputtype: "rtinput",
      },
    ],
  })
);
/**
 * 分页查询
 */
function handleQuery(flag?: boolean) {
  const cProdNo = getCProdNo();
  if (!cProdNo) {
    return;
  }
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r, {
    cRdrTyp: "0",
    cProdNo,
  });
  getUnbindTermRefProd(param)
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

const handelCancel = () => {
  dialogVisible.value = false;
};

const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择至少一项");
    return;
  }
  const cProdNo = getCProdNo();
  if (!cProdNo) {
    return;
  }
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const param = selectedRows.value.map((item) => item.cTermNo).join(",");
  const newParam = {
    userId: user.opCde,
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cTermNo: param,
    cProdNo,
    cTyp: "0",
  };
  associationTerm(newParam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        emits("ok", {});
        ElMessage.success("保存成功");
        dialogVisible.value = false;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
