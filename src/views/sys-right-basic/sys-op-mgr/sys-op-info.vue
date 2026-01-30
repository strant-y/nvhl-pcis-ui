<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)" />
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

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { SysOpMgrService } from '@/views/sys-right-basic/service/sys-op-mgr.service';

import { useDzModal } from "@/common/dzmodel/DzModalService";
import { codeListViewStore } from "@/store";
import { cloneDeep } from "lodash-es";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const props = defineProps({
	getDptCde: {
		type: String,
		required: true
	}
})
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const emits = defineEmits(['cleanCheck', 'refreshTree'])
const sysOpMgrService = new SysOpMgrService();
const dzmodal = useDzModal();
let cParentCdeOption = []
let cOpTypeOption = []
const sysOpInfoEdit = defineAsyncComponent(() => import("./sys-op-info-edit.vue"));
const codeListMap = reactive({
	COpType: [],
	CParentCde: []
})
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "",
		endBtnsPosition: "right",
		fromUi: {
			cols: 2
		},
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
					freeEditRef.value?.resetFields()
					emits('cleanCheck')
				},
			}),
		],
		fromSchema: [
			{
				prop: "cOpCde",
				inputtype: "rtinput",
				title: "菜单代码",
				disabled: true,
				rules: [getRules("required", {})]
			},
			{
				prop: "cLoadSub",
				inputtype: "rtcheckbox",
				title: "是否包含子级菜单",
				defaultValue: 0,
				keymap: {
					y: 1,
					n: 0,
				},
			},
			{
				prop: "cOpCnm",
				inputtype: "rtinput",
				title: "菜单名称"
			},
			{
				prop: "cOpType",
				inputtype: "rtselect",
				title: "菜单类型",
				typeCode: "WEB_SYS_STA_DICT",
				params: { 'cParCde': 'op_typ' },
			},
			// {
			// 	prop: "CSubSysCde",
			// 	inputtype: "rtinput",
			// 	type: 'hidden',
			// 	defaultValue: 'PCIS'
			// },
		],
	})
);

const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
		editFlag: true,
		editList: ["cStatus"],
		titleBtns: [
			createFreeButtonBase({
				id: "score",
				label: "新增",
				type: "success",
				func: function () {
					if (props.getDptCde) {
						dzmodal.open(sysOpInfoEdit, { COperateTyp: "add", COpCde: props.getDptCde }).then((res) => {
							if (res.type === "ok") {
								handleQuery();
								emits('refreshTree')
							}
						});
					} else {
						ElMessage.warning('请先选定父级菜单,再进行操作！')
					}
				},
			}),
		],
		tableBtnType: "btn",
		tableBtnWidth: 220,
		tableBtnPosition: "right",
		tableBtnFixed: "right",
		tableBtn: [
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "编辑",
				type: "success",
				size: "large",
				icon: "Edit",
				tableClick: (row) => {
					dzmodal.open(sysOpInfoEdit, { COperateTyp: "update", COpCde: props.getDptCde }).then((res) => {
						if (res.type === "ok") {
							handleQuery();
							emits('refreshTree')
						}
					});
				},
			}),
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "删除",
				type: "danger",
				size: "large",
				icon: "Delete",
				tableClick: (row) => {
					console.log(row);
					deleteRow(row.cOpCde)
				},
			}),
		],
		fromSchema: [
			{
				prop: "cOpCde",
				inputtype: "rtinput",
				title: "菜单代码",
			},
			{
				prop: "cOpCnm",
				inputtype: "rtinput",
				title: "菜单名称",
			},
			{
				prop: "cParentCde",
				inputtype: "rtinput",
				title: "父级菜单",
				formatter: (val) => {
					const item = codeListMap['CParentCde'].length && codeListMap['CParentCde'].find(item => item.value === val)
					return item ? item.label : val
				}
			},
			{
				prop: "cOpType",
				inputtype: "rtinput",
				title: "菜单类型",
				formatter: (val) => {
					const item = codeListMap['COpType'].length && codeListMap['COpType'].find(item => item.value === val)
					return item ? item.label : val
				}
			}
		],
	})
);
onMounted(async () => {
	// 操作菜单类型
	codeListStore.queryCodeList({
		codeListName: 'WEB_SYS_STA_DICT',
		codeListParam: { 'cParCde': 'op_typ' }
	}, false, true).then(res => {
		if (res) {
			codeListMap['COpType'] = res;
		}
	}, () => {
		ElMessage.error('后台服务异常,请联系管理员');
	});
	// 父级菜单
	codeListStore.queryCodeList({
		codeListName: 'SYS_OP_LIST_CACHE',
		codeListParam: {}
	}, false, true).then(res => {
		if (res) {
			codeListMap['CParentCde'] = res;
		}
	}, () => {
		ElMessage.error('后台服务异常,请联系管理员');
	});
});
watch(() => props.getDptCde, (newVal) => {
	if (newVal) {
		freeEditRef.value?.setValue('cOpCde', newVal)
		handleQuery(true);
	}
})

/** 查询 */
function handleQuery(flag = true) {
	freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
			const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
			const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
			if(s.cLoadSub) {
				s.cLoadSub += ''
			} else {
				s.cLoadSub = null
			}
			const param = Object.assign(s, r);
			sysOpMgrService.qrySysOpList(param)
				.then((res) => {
					const { code, data, msg } = res;
					if (200 === code) {
						pageresult.list = [];
						pageresult.list = data.result;
						pageresult.total = data.total;
					} else {
						//ElMessage.error(msg);
					}
				})
				.finally(() => { });
		} else {
			ElMessage.error("请填写必填项");
		}
	})

}

const deleteRow = (opCde) => {
	if (!opCde) {
		ElMessage.warning('菜单代码为空！');
		return;
	}
	ElMessageBox.confirm('确认要删除吗？该数据删除之后将无法恢复。', '提示', {
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		const param = {
			COpCde: opCde,
		};
		sysOpMgrService.delSysOpInfo(param).then((res: any) => {
			if (res.code === 200) {
				const data = res.data;
				ElMessage.success(data.message);
				handleQuery(true);
				emits('refreshTree')
			} else {
				ElMessage.error(data.message);
			}
		});
	})
}
</script>

<style scoped></style>
