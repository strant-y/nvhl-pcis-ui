<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table
			:tableConfig="tableconfig"
			v-model:pageresult="pageresult"
			ref="tableRef"
			@page-change="handleQuery(false)"
		/>
	</div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
	AppFreeEditConfig,
	AppFreeEditMethod,
	createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useUserStore } from "@/store/modules/user";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const userStore = useUserStore();
const user = ref(userStore.user)
const uploadEdit = defineAsyncComponent(() => import("./upload-edit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "",
		endBtnsPosition: "right",
		//labelPosition: "right",
		//labelWidth: "100px",
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
						cStatus: "",
					});
					handleQuery();
					// freeEditRef.value?.resetForm();
				},
			}),
		],
    fromUi: {
      cols: 2
    },
		fromSchema: [
			{
				prop: "cKindNo",
				inputtype: "rtselect",
				title: "承保机构",
				typeCode: "WEB_SYS_STA_DICT",
				params: { cParCde: "use_mrk" },
				clearable: true,
				showExBtn: true,
				rules: [getRules("required", {})],
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						dzmodal
							.open(departmentTree, { type: "Issuer", data: {} })
							.then((res) => {
								if (res.type === "ok") {
								}
							});
					},
				},
			},
			{
				prop: "CLoadSub",
				inputtype: "rtcheckbox",
				title: "是否包含下级"
			},
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        clearable: true,
        typeCode: "KIND_LIST_GRT",
        param: { cOperId: user.value['opCde'], cDptCde: user.value['companyId'] },
      },      
			{
				prop: "CProdNo",
				inputtype: "rtselect",
				title: "产品",
				clearable: true,
				rules: [getRules("required", {})],
			},
			{
			prop: "CAppNo",
			inputtype: "rtinput",
			title: "投保单号",
			},
			{
			prop: "CPlyNo",
			inputtype: "rtinput",
			title: "保单号",
			},
			{
			prop: "CAppNme",
			inputtype: "rtinput",
			title: "被保人名称",
			},
			{
			prop: "CAppTm",
			inputtype: "rtdatepicker",
			title: "投保申请日期",
			},
			{
			prop: "CBatchNo",
			inputtype: "rtinput",
			title: "Excel导入批次号",
			},
			{
			prop: "TInsrncBgnTm",
			inputtype: "rtdatepicker",
			title: "保险起期",
			},
			{
			prop: "CPrjCtgTypList",
			inputtype: "rtselect",
			title: "项目类别大类",
			},
			{
			prop: "CBatchTm",
			inputtype: "rtdatepicker",
			title: "Excel导入日期",
			},
			{
			prop: "CPrjCtgTypMList",
			inputtype: "rtselect",
			title: "项目类别中类",
			},
			{
			prop: "CPrjCtgTypMList",
			inputtype: "rtselect",
			title: "项目类别子类",
			},
		],
	})
);

const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [{
		cKindNo: 'cKindNo',
		cStatus: '0',
	}],
	/** 总数 */
	total: 0,
});

const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
    showSelection: true,
    isRadio: true,
		titleBtns: [
			createFreeButtonBase({
				id: "score",
				label: "模板下载",
				type: "primary",
				func: function () {
					dzmodal.open(uploadEdit, { type: "", data: {} }).then((res) => {
						if (res.type === "ok") {
							console.log("模板下载")
						}
					});
				},
			}),
			createFreeButtonBase({
				id: "score",
				label: "导出",
				type: "primary",
				func: function () {
				},
			}),
			createFreeButtonBase({
				id: "score",
				label: "Excel导入",
				type: "primary",
				icon: 'Upload',
				func: function () {
				},
			}),
			createFreeButtonBase({
				id: "score",
				label: "保单详细",
				type: "primary",
				func: function () {
				},
			}),
			createFreeButtonBase({
				id: "score",
				label: "状态详细",
				type: "primary",
				func: function () {
				},
			}),
		],
		fromSchema: [
			{
				prop: "cKindNo",
				title: "保单",
			},
			{
				prop: "cKindNo",
				title: "申请单类型",
			},
			{
				prop: "cKindNo",
				title: "产品",
			},
			{
				prop: "cKindNo",
				title: "导入批次号",
			},
			{
				prop: "cKindNo",
				title: "机构部门",
			},
			{
				prop: "cKindNo",
				title: "投保人名称",
			},
			{
				prop: "cKindNo",
				title: "投保人证件号",
			},
			{
				prop: "cKindNo",
				title: "被保人名称",
			},
			{
				prop: "cKindNo",
				title: "被保人证件号",
			},
			{
				prop: "cKindNo",
				title: "保险起止期",
			},
			{
				prop: "cKindNo",
				title: "保险费",
			},
			{
				prop: "cKindNo",
				title: "导入操作员",
			},
			{
				prop: "cKindNo",
				title: "导入日期",
			},
			{
				prop: "cKindNo",
				title: "导入状态",
			}
		],
	})
);

onMounted(async () => {});

// 绑定方法
const method = {
	func1: () => {
		console.log(getRules);
	},
};

// 绑定特殊验证器
const exRules = {
	byrtInput: (rule: any, value: any, callback: any) => {
		const r = freeEditRef.value?.getFromValue();
		if (r["name"]) {
			callback();
		} else {
			callback("姓名");
		}
	},
};

/** 查询 */
function handleQuery(flag?: boolean) {

  // freeEditRef.value?.validate().then((isValid) => {
  //   if (!isValid) {
  //     return false;
  //   } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(s, r);
      getBasicKindList(param)
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
    //}
  //});
}
</script>

<style scoped></style>
