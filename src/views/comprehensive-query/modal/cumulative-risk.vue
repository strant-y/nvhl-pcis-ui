<!-- 风险积累 弹框 -->
<template>
  <el-dialog
		v-if="dialogVisible"
    v-model="dialogVisible"
    title=""
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
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { getCumulativeRisk } from "@/api/prod";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import { descryptParameter, encryptParameter } from "@/utils/encipher";

const route = useRoute();
const query = ref(route.query);
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { useValidator } from "@/typings/useValidator";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean;
  data: object;
}>();
let cAddrData: any = null;
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const form1 = [
	{
		prop: "cShipName",
		inputtype: "rtinput",
		title: "船名",
		disabled: true,
	},
	{
		prop: "totalCBamt",
		inputtype: "rtinput",
		title: "船舶险累积保额/赔偿限额",
		disabled: true,
	},
	{
		prop: "totalAmt",
		inputtype: "rtinput",
		title: "船货累积保额",
		disabled: true,
	},
];

const table1 = [
	{
		prop: "cPlyNo",
		inputtype: "rtinput",
		title: "保单号",
	},
	{
		prop: "cDptName",
		inputtype: "rtinput",
		title: "出单机构",
	},
	{
		prop: "cInsuredNme",
		inputtype: "rtinput",
		title: "被保险人",
	},
	{
		prop: "tInsrncBgnTm",
		inputtype: "rtinput",
		title: "起保时间",
	},
	{
		prop: "tInsrncEndTm",
		inputtype: "rtinput",
		title: "终保时间",
	},
	{
		prop: "cProdName",
		inputtype: "rtinput",
		title: "险种",
	},
	{
		prop: "cShipName",
		inputtype: "rtinput",
		title: "船名",
	},
	{
		prop: "nAmt",
		inputtype: "rtinput",
		title: "保额/赔偿限额",
	},
];

const form2 = [
	{
		prop: "cShipName",
		inputtype: "rtinput",
		title: "船名",
		disabled: true,
	},
	{
		prop: "cTransportVoyage",
		inputtype: "rtinput",
		title: "航次",
		disabled: true,
	},
	{
		prop: "totalHYamt",
		inputtype: "rtinput",
		title: "货运险累积保额",
		disabled: true,
	},
];

const table2 = [
	{
		prop: "cPlyNo",
		inputtype: "rtinput",
		title: "保单号",
	},
	{
		prop: "cDptName",
		inputtype: "rtinput",
		title: "出单机构",
	},
	{
		prop: "cInsuredNme",
		inputtype: "rtinput",
		title: "被保险人",
	},
	{
		prop: "tDepartureTime",
		inputtype: "rtinput",
		title: "起运日期",
	},
	{
		prop: "cShipName",
		inputtype: "rtinput",
		title: "船名",
	},
	{
		prop: "cTransportVoyage",
		inputtype: "rtinput",
		title: "航次",
	},
	{
		prop: "cDispatchDetail",
		inputtype: "rtinput",
		title: "起运地",
	},
	{
		prop: "cDestinationDetail",
		inputtype: "rtinput",
		title: "目的地",
	},
	{
		prop: "tInsrncBgnTm",
		inputtype: "rtinput",
		title: "起保时间",
	},
	{
		prop: "tInsrncEndTm",
		inputtype: "rtinput",
		title: "终保时间",
	},
	{
		prop: "nAmt",
		inputtype: "rtinput",
		title: "保额/赔偿限额",
	},
];

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险积累信息",
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
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
    fromSchema: [],
    rowDbClickFun(rowData) {
      console.log("选中数据", rowData);
      dialogVisible.value = false;
      emit("ok", rowData);
    },
  })
);
/** 查询 */
function handleQuery(reset = true) {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
	const s = props.data; //获取表单数据
  const param = { ...r, ...s };
  getCumulativeRisk(param)
		.then((res) => {
      const { code, data, msg } = res;
			console.log("返回数据", data.result);
      if (200 === code && data.result.length > 0) {
        pageresult.list = data.result;
				pageresult.total = data.total;
				setFormValue({
					cShipName: props.data.cShipName,
					totalCBamt: data.result[0]['totalCBamt'],
					totalAmt: data.result[0]['totalAmt'],
					totalHYamt: data.result[0]['totalHYamt'],
				})
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {
	if (props.data.nType == '1') {
		formconfig.fromSchema = form1
		tableconfig.fromSchema = table1
	} else if (props.data.nType == '2') {
		formconfig.fromSchema = form2
		tableconfig.fromSchema = table2
	}
	nextTick(() => { 
		handleQuery()
	})
});

//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
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
