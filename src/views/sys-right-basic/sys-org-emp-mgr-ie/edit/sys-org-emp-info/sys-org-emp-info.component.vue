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
import { getListByCode } from '@/api/code-list-service';
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { SysOrgEmpMgrService } from '@/views/sys-right-basic/service/sys-org-emp-mgr.service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const emits = defineEmits(['cleanCheck'])
const props = defineProps({

	getDptCde: {
		type: String,
		required: true
	}
});
let dptMinCde = []
const sysOrgEmpMgrService = new SysOrgEmpMgrService();
const dzmodal = useDzModal();
const SysOrgEmpEditComponent = defineAsyncComponent(() => import("../sys-org-emp-edit/sys-org-emp-edit.component.vue"));
const sysAgreementAssignComponent = defineAsyncComponent(() => import("../sys-org-emp-edit/sys-agreement-assign.component.vue"));
//const SysOrgIeempWdconfigComponent = defineAsyncComponent(() => import("./sys-org-ieemp-wdconfig.component.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const edits = ref<any[]>([]);
const edits_end = ref<any[]>([]);
const user = JSON.parse(sessionStorage.getItem("user"));
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "机构部门",
		endBtnsPosition: "right",
		endBtns: [
      //IE相关，不用了
			// createFreeButtonBase({
			// 	label: "网点管理",
			// 	id: 'WdConfigBtn',
			// 	type: "primary",
			// 	position: 'btn-left',
			// 	func: () => {
			// 		dzmodal.open(SysOrgIeempWdconfigComponent, {
			// 			queryType: 'wdconfig',
			// 		}).then(() => {});
			// 	},
			// }),
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
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "机构代码",
        disabled: true,
        rules: [getRules("required", {})]
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 0,
        keymap: {
          y: 1,
          n: 0,
        },
      },
			{
				prop: "cEmpCde",
				inputtype: "rtinput",
				title: "员工代码"
			},
			{
				prop: "cEmpCnm",
				inputtype: "rtinput",
				title: "员工名称"
			},
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: "是否在职",
        loadData: [{ value: '0', label: '否' }, { value: '1', label: '是' }],
      }
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
const tableFromSchema = [
	{
		prop: "cEmpCde",
		inputtype: "rtinput",
		title: "员工代码"
	},
	{
		prop: "cEmpCnm",
		inputtype: "rtinput",
		title: "员工名称",
	},
	{
		prop: "cDptDispCde",
		inputtype: "rtinput",
		title: "机构显示代码",
	},
	{
		prop: "cDptCnm",
		inputtype: "rtinput",
		title: "机构名称",
	},
	{
		prop: "cSex",
		inputtype: "rtinput",
		title: "性别",
    formatter: (val)=>{
      const cSex = [{ value: '1', label: '男' }, {value: '2', label: '女'}]
      const result = cSex.find(item => item.value === val);
      return result ? result.label : val;
    }
	},
	{
		prop: "tEntTm",
		inputtype: "rtinput",
		title: "入司时间",
	},
	{
		prop: "cIsValid",
		inputtype: "rtswitch",
		title: "就职状态",
		keymap: {
			y: "1",
			n: "0",
		},
		activeText: '在职',
		inactiveText: '离司',
		inlinePrompt: true,
		func: (val: string, row: any) => {
			const paramss = {
				CEmpCde: row.cEmpCde,
				CIsValid: val
			};
			const getEmpDatas = sysOrgEmpMgrService.changeOrgEmpStatus(paramss);
			getEmpDatas.then((res: any) => {
				if (res['code'] == "200") {
					ElMessage.success(res.msg);
				} else {
					ElMessage.error(res.msg);
				}
				handleQuery();
			});
		},
	}
]
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
		editFlag: true,
		editList: ["cIsValid"],
		//showSelection:true,
		titleBtns: [
			createFreeButtonBase({
				id: "score",
				label: "新增",
				type: "success",
				func: function () {
					const CDptCde = freeEditRef.value?.getValue('cDptCde')
					if(!CDptCde) {
					  ElMessage.warning('请先选定机构,再进行操作！');
					  return;            
					}
					const titlemsg = '新增员工信息';
					const contetobj = SysOrgEmpEditComponent;
					dzmodal.open(contetobj, {
						type: "add",
						title: titlemsg,
						cDptCde: props.getDptCde
					}).then((res) => {
						if (res.type === "ok") {
							handleQuery();
						}
					});
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
				tooltip: "查看",
				type: "success",
				size: "large",
				icon: "View",
				tableClick: (row) => {
					const titlemsg = '员工信息详情';
					const contetobj = SysOrgEmpEditComponent;
					dzmodal.open(contetobj, {
						type: "view",
						data: row,
						title: titlemsg,
						cEmpCde: row.cEmpCde
					}).then((res) => {
						if (res.type === "ok") {
							handleQuery();
						}
					});
				},
			}),
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "修改",
				type: "success",
				size: "large",
				icon: "Edit",
				tableClick: (row) => {
					const titlemsg = '员工信息修改';
					const contetobj = SysOrgEmpEditComponent;
					dzmodal.open(contetobj, {
						type: "update",
						data: row,
						title: titlemsg,
						cEmpCde: row.cEmpCde
					}).then((res) => {
						if (res.type === "ok") {
							handleQuery();
						}
					});
				},
			}),
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "分配",
				type: "success",
				size: "large",
				icon: "Position",
				tableClick: (row) => {
					dzmodal.open(sysAgreementAssignComponent, {
						type: "update",
						data: row,
						title: '分配',
						cEmpCde: row.cEmpCde
					}).then((res) => {
						if (res.type === "ok") {
							handleQuery();
						}
					});
				},
			})
		],
		fromSchema: tableFromSchema,
	})
);
watch(() => props.getDptCde, (newVal) => {
  if (newVal) {
    freeEditRef.value?.setValue('cDptCde', newVal)
    handleQuery(true);
  }
})
onMounted(async () => {
  //加载IE员工信息 --- 用不到了
  //changeWdconfigBtn();
});

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
function changeWdconfigBtn(){
  const paramss = {
      CEmpCde: user.opCde
  };
  const getEmpDatas = sysOrgEmpMgrService.loadOrgEmpIeInfo(paramss);
  getEmpDatas.then((res: any) => {
      if (null != res && null != res['code']) {
          if (res['code'] === 200) {
              const usermsg = res['data'];
              if (usermsg.cPositionCde === '8') { // 只有管理员帐号,才能配置网点
                console.log("加载IE员工信息")
              }
          }
      }
  });
};
/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
			const param = Object.assign(s, r);
			param.isie = "1"
      sysOrgEmpMgrService.qryOrgEmpList(param)
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
      .finally(() => { });
    }
  });

}
</script>

<style scoped></style>
