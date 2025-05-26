<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择方案"
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const dzmodal = useDzModal();
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
const tabProref = opertaor.getTableRefByKey("productBasicInfo");
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo, queryPlan } from "@/api/prod";
import { on } from "events";

const props = defineProps<{
  // visible: boolean;
  data:object;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>();

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await saveRiskInfo(formData); //保存接口调用
      ElMessage.success("保存成功");
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  // emit("update:visible", value);
};
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    // tableBtn: [
    //   createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "删除",
    //     icon: "Delete",
    //     link: true,
    //     tableClick: (row) => {
    //       delRiskRel(row)
    //         .then((res) => {
    //           const { code, data, msg } = res;
    //           if (200 === code) {
    //             ElMessage.success("删除成功");
    //             handleQuery();
    //           } else {
    //             ElMessage.error(msg);
    //           }
    //         })
    //         .finally(() => {});
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "CNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "CPlanNo",
        inputtype: "rtinput",
        title: "方案代码",
      },
      {
        prop: "CPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "CNmeCn",
        // inputtype: "rtselect",
        title: "方案类型",
      },
      {
        prop: "CTyp",
        inputtype: "rtselect",
        title: "是否主产品方案",
        // typeCode: "WEB_SYS_STA_DICT",
        // codeParam: { cParCde: "yes_no" },
      },
    ],
  })
);
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const dptCde = JSON.parse(sessionStorage.getItem("user"));
  const c = tabref.getFromValue().cCommodityNo;
  // CCommodityNo    companyId
  const param = {
    codeListName: "Commodity_PLAN_LIST",
    codeListParam: {
      cCommodityNo: props.data['cCommodityNo'] || 'S25000032',    // 商品编号
      dptCde: dptCde.companyId,     // companyId
      prodNo: props.data['cProdNo'],
      status: "1",
    },
  };
  queryPlan(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = data.length;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
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
onMounted(() => {
  handleQuery();
});
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
