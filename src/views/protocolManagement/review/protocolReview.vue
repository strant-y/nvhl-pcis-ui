<!-- ECargo 协议录入 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @selection-change="handleSelectionChange"
    >
			<!-- policyInfo 列的具名插槽 -->
			<template #column-policyInfo="{ row, column, index }">
				<div class="policy-info-cell">
					<div v-if="row.cEcAgrAppNo" class="policy-number-row">
						<span style="width: calc(100% - 1em - 5px)">{{ row.cEcAgrAppNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cEcAgrAppNo)">
							<DocumentCopy />
						</el-icon>
					</div>
					<div v-if="row.cEcAgrNo" class="policy-number-row">
						<span style="width: calc(100% - 1em - 5px)">{{ row.cEcAgrNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cEcAgrNo)">
							<DocumentCopy />
						</el-icon>
					</div>
				</div>
			</template>
      <template #column-cAppNme="{ row, column, index }">
        <el-tooltip :content="row.cAppNme" placement="top">
          <span v-html="row.cAppNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cDptCnm="{ row, column, index }">
        <el-tooltip :content="row.cDptCnm" placement="top">
          <span v-html="row.cDptCnm || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
			<template #column-cSubDptCnm="{ row, column, index }">
        <el-tooltip :content="row.cSubDptCnm" placement="top">
          <span v-html="row.cSubDptCnm || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
		</app-table>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from "vue-router";
const { getRules } = useValidator();
const route = useRoute();
const router = useRouter();
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { initMultiCodeList } from "@/api/code-list-service"; // 代码列表服务
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { codeListViewStore } from "@/store";
import { DocumentCopy } from "@element-plus/icons-vue";
import cargoApi from '@/api/cargo'
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";

const {
  getBaseInfoByAppNo,
  getBackUdrList,
  getNewUdrList,
  removeReceived,
  checkEdrPocly,
  hasReceived,
  getAppTask,
} = NewUdrListService();
const policyService = new PolicyService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const params = route.query.data ? JSON.parse(route.query.data) : {};
const dataSet = ref<any>([]); // 数据集合
const planSet = ref<any>([]); //结果集

const selectedRows = ref<any[]>([]);
const btnTitle = ref<any>([{ label: "" }, { label: "" }]);
const appStatusOptions = ref([
  { label: "暂存", value: "1" },
  { label: "已提核", value: "2" },
  { label: "核保退回/撤回", value: "3" },
  { label: "核保通过", value: "4" },
  { label: "已出保单", value: "5" },
  { label: "已做失效操作", value: "6" },
  { label: "已提交未接收", value: "7" },
  { label: "见费出单退回", value: "8" },
])
const departmentTree = defineAsyncComponent(() => import("@/pcis/prodRef/commodityRef/DepartmentTree.vue"))
// 任务痕迹列表 弹框页面
const TaskListVestige = defineAsyncComponent(
  () => import("../../pcis-new-udr-list/common/TaskListVestige.vue")
);
const queryLoading = ref(false); // 控制按钮 loading 图标
const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      endBtnsPosition: "right",
      endBtns: [
        createFreeButtonBase({
          type: "primary",
          label: "查询",
					loading: queryLoading,
          func: async () => {
            handleQuery();
          },
        }),
        createFreeButtonBase({
          label: "重置",
          func: () => {
            freeEditRef.value?.setFormValue({
              cDptCde: "0200000000000",
              cLoadSub: 1,
              cKindNo: null,
              cTermNo: null,
							cEcAgrAppNo: "",
							cEcAgrNo: "",
              cAppNme: "",
							insuredNme: "",
							udrType: "1",
              Tm: [
                moment(new Date(Date.now() - 5 * 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 00:00:00"),
								moment(new Date(Date.now() + 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 23:59:59"),
              ]
            });
            freeEditRef.value.setValue("cDptCde", JSON.parse(sessionStorage.getItem("user")).companyId);
            setFormItem("cDptCde", {
              loadData: [
                {
                  label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
                  value: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
              ],
            });
            handleQuery(true);
            // freeEditRef.value?.resetForm();
          },
        }),
      ],
			fromSchema: [
				{
					prop: "udrType",
					inputtype: "rtSelectV2",
					title: "单据状态",
					minWidth: 180,
					loadData: [
						{ label: "待核保任务", value: "1" },
						{ label: "暂存任务", value: "2" },
						{ label: "已上报任务", value: "3" },
						{ label: "核保退回任务", value: "4" },
						{ label: "核保通过任务", value: "5" },
					],
				},
        {
          prop: "cDptCde",
          inputtype: "rtselect",
          title: "承保机构",
          btnWidth: 20,
          itemWidth: 1,
					disabled: true,
        	rules: [getRules("required", {})],
          showExBtn: true,
          btnItems: {
            icon: "Search",
            type: "primary",
            func:() => {
              dzmodal
                .open(departmentTree, { type: "Issuer", data: {} })
                .then((res:any) => {
                  if (res.type === "ok") {
                    const selectObj = res.body;
                    freeEditRef.value?.setValue(
                      "cDptCde",
                      selectObj.id
                    );
                    setFormItem("cDptCde", {
                      loadData: [
                        {
                          label: selectObj.name,
                          value: selectObj.id,
                        },
                      ],
                    });
                  }
                });
            }
          },
          loadData: [
            {
							label: "0200000000000永安保险总公司",
							value: "0200000000000",
						},
          ]
        },
        {
          prop: "cLoadSub",
          inputtype: "rtcheckbox",
          title: "是否包含下级",
          defaultValue: 1,
          keymap: {
            y: 1,
            n: 0,
          },
          itemWidth: 1,
        },
        {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "产品大类",
          itemWidth: 1,
          rules: [{ type: "required" }],
          typeCode: "KIND_LIST_GRT",
          child: "cProdNo",
          filterable: true,
          clearable: true,
          codeParam: {
            cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
            cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
          },
          func: (val: string) => {
            codeListStore
                .queryCodeList({
                  codeListName: "TERM_LIST_IN_GUIDE_NEW",
                  codeListParam:{
                    cParCde: val,
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                  },
                })
                .then((res) => {
                  setFormItem("cTermNo", {
                    loadData: res,
                  });
                });
          },
        },
        {
          prop: "cTermNo",
          inputtype: "rtselect",
          title: "条款",
          itemWidth: 1,
          rules: [{ type: "required" }],
          filterable: true,
          clearable: true,
          // typeCode: "TERM_LIST_IN_GUIDE_NEW",
          // codeParam: {
          //   cParCde: cPard.value,
          //   cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          //   cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
          // },
          func: (val: string) => {},
        },
        {
          prop: "cEcAgrAppNo",
          inputtype: "rtinput",
          title: "预约协议申请单号",
          clearable: true,
        },
				{
					prop: "cEcAgrNo",
					inputtype: "rtinput",
					title: "协议单号",
					clearable: true,
				},
        {
          prop: "cAppNme",
          inputtype: "rtinput",
          title: "投保人客户名称",
          clearable: true,
        },
        {
          prop: "insuredNme",
          inputtype: "rtinput",
          title: "被保险人名称",
          clearable: true,
        },
        {
          prop: "Tm",
          inputtype: "rtdatepicker",
          title: "保险日期",
          itemWidth: 1,
          clearable: true,
          type: "datetimerange",
          format: "YYYY-MM-DD HH:mm:ss",
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          defaultValue: [
            moment(new Date()).format("YYYY-MM-DD 00:00:00"),
            moment(new Date(Date.now() + (6 * 1000 * 60 * 60 * 24))).format(
                "YYYY-MM-DD 23:59:59"
            )
          ],
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

const tableBtns = [
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "接收",
		type: "info",
		size: "large",
		icon: "Message",
		iconSize: "25",
		hidden: true,
		tableClick: (row) => {
			//待核保任务 接收
			handleWorkFlow(row, "handleReceived");
		},
	}),
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "修改",
		type: "success",
		size: "large",
		icon: "Edit",
		iconSize: "25",
		hideBtns: (row: any) => {
			if (row.udrType === "2") {
				return false;
			} else {
				return true;
			}
		},
		tableClick: (row) => {
			console.log(row);
			if (row.state == "1") toDtl({ ...row, sence:'app' }, 'audit');
		},
	}),
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "取消接收",
		type: "info",
		size: "large",
		icon: "Release",
		iconSize: "25",
		hideBtns: (row: any) => {
			if (row.udrType === "2") {
				return false;
			} else {
				return true;
			}
		},
		tableClick: (row) => {
			handleWorkFlow(row, "removeReceived");
		},
	}),
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "撤回",
		type: "danger",
		size: "large",
		icon: "return",
		iconSize: "25",
		hideBtns: (row: any) => {
			// if (row.udrType === "3" && !!row.curtTask) {
				// return false;
			// } else {
				return true;
			// }
		},
		tableClick: (row) => {
			// showDetails(row)
			const res = {};
			res["cUndrMrk"] = "W";
			res["undrMrk"] = "W";
			res["user"] = JSON.parse(sessionStorage.getItem("user"));
			res["user"]["opRelCde"] = JSON.parse(sessionStorage.getItem("user")).opCde;
			res["appNo"] = row.cEcAgrAppNo;
			res["taskId"] = row.curtTask;
			res["appTyp"] = row.cAppTyp;
			res["cAntiLnderRisk"] = "0"; //关联交易确认
			res["cIsTransaction"] = "0"; //反洗钱风险
			res["CRiBesprakMrk"] = "0"; // 预约分保标志
			res["backUndrDptCde"] = row.dptCde; // 退回指定核保级别机构编码
			res["backUndrClsCde"] = row.level; // 退回指定核保级别编码
			res["backUndrDptCnm"] = JSON.parse(sessionStorage.getItem("user"))[
				"userName"
			]; // 退回指定核保人员名称
			let submitUnder;
			submitUnder = submitUnderwriting(res);
			submitUnder.then((res) => {
				if (res["code"] == "200") {
					ElMessage.success(res.msg);
					handleQuery();
				} else {
					ElMessage.error(res.msg);
				}
			});
		},
	}),
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "查看",
		type: "primary",
		size: "large",
		icon: "View",
		iconSize: "25",
		hideBtns: (row: any) => {
			if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
				return false;
			} else {
				return true;
			}
		},
		tableClick: (row) => {
			toDtl({ ...row, sence:'app' }, 'view');
		},
	}),
	createFreeButtonBase({
		id: "score",
		link: true,
		tooltip: "承保流程",
		type: "danger",
		size: "large",
		icon: "Refresh",
		iconSize: "25",
		hideBtns: (row: any) => {
			if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
				return false;
			} else {
				return true;
			}
		},
		tableClick: (row) => {
			let data;
			if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
				data = { objId: row.objId, sysType: row.objExt };
			} else {
				data = {
					objId: row.cEcAgrAppNo,
					sysType:
						!!row["cAppTyp"] &&
						("A" === row["cAppTyp"] || "P" === row["cAppTyp"])
							? "U"
							: "E",
				};
			}
			dzmodal
				.open(TaskListVestige, { type: "Issuer", data })
				.then((res) => {
					if (res.type === "ok") {
						handleQuery(true);
					}
				});
		},
	}),
]

const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
			editFlag: true,
			editList: ["cStatus"],
			showSelection: true,
			tableBtnType: "btn",
			tableBtnWidth: 80,
			fixed: true,
			tableBtnPosition: "right",
			rowDbClickFun:(row:any)=> rowDbClick(row),
      tableBtn: tableBtns,
      tableBtnWidth: 95,
      tableBtnPosition: "right",
      tableBtnType: "btn",
      fromSchema: [
				{
					prop: "policyInfo",
					inputtype: "rtinput",
					title: "申请单号/协议号",
          lengthNum: 22,
          lengthIsNumber: true,
					slotName: "policyInfo"
				},
        {
          prop: "cEcAgrAppNo",
          inputtype: "rtinput",
          title: "预约协议申请单号",
          minWidth: 180,
        	isShow: false
        },
        {
          prop: "cEcAgrNo",
          inputtype: "rtinput",
          title: "协议单号",
          minWidth: 180,
        	isShow: false
        },
				{
          prop: "cSubDptCnm",
          inputtype: "rtinput",
          title: "分公司",
          slotName: "cSubDptCnm",
          align: 'left',
          // lengthNum: 12,
        },
        {
          prop: "cDptCnm",
          inputtype: "rtinput",
          title: "出单机构",
          slotName: "cDptCnm",
          align: 'left',
          // lengthNum: 12,
				},
				{
          prop: "cAppId",
          inputtype: "rtinput",
          title: "投保人编号",
          lengthNum: 14,
          lengthIsNumber: true,
        },
        {
          prop: "cAppNme",
          inputtype: "rtinput",
          title: "投保人名称",
          slotName: "cAppNme",
          align: 'left',
          // lengthNum: 12,
				},
				// {
				// 	prop: "InsurancePeriod",
				// 	inputtype: "rtinput",
				// 	title: "协议期间",
        //   lengthNum: 36,
        //   lengthIsNumber: true,
				// },
        {
          prop: "tInsrncBgnTm",
          inputtype: "rtinput",
          title: "协议起期",
          minWidth: 120,
        },
        {
          prop: "tInsrncEndTm",
          inputtype: "rtinput",
          title: "协议止期",
          minWidth: 120,
        },
        {
          prop: "cAppStatus",
          inputtype: "rtselect",
          title: "协议状态",
          lengthNum: 7,
          align: "left",
          loadData: appStatusOptions.value
        },
        // {
        //   prop: "cIsValid",
        //   inputtype: "rtinput",
        //   title: "有效",
        //   minWidth: 180,
        // },
        // {
        //   prop: "nPayBalance",
        //   inputtype: "rtinput",
        //   title: "缴费余额",
        //   minWidth: 120,
        // },
      ],
    })
);

onMounted(async () => {
	freeEditRef.value?.setFormValue({
		cDptCde: "0200000000000",
		cLoadSub: 1,
		cKindNo: null,
		cTermNo: null,
		cEcAgrAppNo: "",
		cEcAgrNo: "",
		cAppNme: "",
		insuredNme: "",
		udrType: "1",
		Tm: [
			moment(new Date(Date.now() - 5 * 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 00:00:00"),
			moment(new Date(Date.now() + 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 23:59:59"),
		]
	});
  freeEditRef.value.setValue("cDptCde", JSON.parse(sessionStorage.getItem("user")).companyId);
  setFormItem("cDptCde", {
    loadData: [
      {
        label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
        value: JSON.parse(sessionStorage.getItem("user")).companyId,
      },
    ],
  });
});

function toDtl(row: any, type: string) {
	row.rightbtns = true
	row.sysType = row.objExt
	let query = {
		param: JSON.stringify(row),
		type: type
	}
	if (row.udrType == '1' || row.udrType == '2') {
		query.title = '协议审核'
	}
	router.push({
		path: "/protocolManagement/enteringDtl",
		query
	});
}

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {};

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
			queryLoading.value = true;
      const tm = freeEditRef.value?.getFromValue().Tm;
      const param = {
        sence: "2",// 1 协议录入 2 协议审核 3 协议批改
        ...freeEditRef.value?.getFromValue(),
				...tableRef.value?.getPartnerPage(flag),//获取分页数据
				user: JSON.parse(sessionStorage.getItem("user")),
      };
      if(tm && tm.length > 1) {
        param.tInsrncBgnTm = tm[0]
        param.tInsrncEndTm = tm[1]
      }
      delete param.Tm
			pageresult.list = []
      cargoApi.queryEcargoList(param).then((res: any) => {
				queryLoading.value = false;
        if (res && res.code === 200) {
					ElMessage.success(res.msg)
					if(param.udrType === "1") {
						tableconfig.tableBtn = []
					} else {
						tableconfig.tableBtn = tableBtns
					}
          const pageData = res.data;
          if (pageData) {
            // pageresult.list = pageData.data;
						pageresult.list = pageData.data.map((item) => ({
							...item,
							// 创建一个新字段合并两个值
							policyInfo: `${item.cEcAgrAppNo || ''}\n${item.cEcAgrNo || ''}`,
							// InsurancePeriod: `${item.tInsrncBgnTm || ''}\n${item.tInsrncEndTm || ''}`,
						}))
            pageresult.total = pageData.total;
          }
        } else {
          ElMessage.error(res.msg);
        }
      })
      .catch((err: any) => {
				queryLoading.value = false;
        ElMessage.error(err.msg);
      });
    }
  });
}

// 行双击事件
function rowDbClick(row: any) {
  if(row.udrType === "1") {// 待核保任务
    handleWorkFlow(row, "handleReceived");
  } else if(row.udrType === "2") {// 暂存任务
    if (row.state == "1") {
      toDtl({ ...row, sence:'app' }, 'audit');
    }
  } else if(row.udrType === "4") {// 核保退回任务
    toDtl({ ...row, sence:'app' }, 'view');
  } else if(row.udrType === "5") {// 核保通过任务
    toDtl({ ...row, sence:'app' }, 'view');
  }
}

// 工作流处理
function handleWorkFlow(row: any, type: any) {
  const param = {
    taskId: row.curtTask,
    user: user.value,
  };

  let udrData;
  // 接收 / 取消接收
  if (type === "handleReceived") {
    udrData = hasReceived(param);
  }
  if (type === "removeReceived") udrData = removeReceived(param);
  udrData && udrData
      .then((result: any) => {
        if (result.code !== 200) {
          ElMessage.error({ message: result.msg, duration: 3000 });
        } else {
          if (type === "handleReceived") {
						// 详情
						toDtl({ ...row, sence:'app' }, 'audit');
          }
          if (type === "removeReceived") {
            ElMessage.success({ message: '解除接收成功', duration: 3000 });
            handleQuery(true);
          }
        }
      })
      .catch((error: any) => {
        console.log("出错了", error);
        ElMessage.error({
          message: "后台服务异常,请联系管理员",
          duration: 3000,
        });
      });
}

// 选中事件
function handleSelectionChange(rows: any) {
  selectedRows.value = rows;
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}
//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
//给表格表单项赋值
function setTableFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    tableconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success('复制成功');
        },
        () => {
          ElMessage.error('复制失败');
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        ElMessage.success('复制成功');
      } else {
        ElMessage.error('复制失败');
      }
    } catch (err) {
      ElMessage.error('复制失败，请稍后再试');
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
};
</script>

<style scoped>
.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}

.policy-info-cell {
  display: flex;
  flex-direction: column;
}

.policy-number-row {
  display: flex;
  align-items: center;
  height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

:deep(.el-table td.el-table__cell div.cell) {
    white-space: pre-line;
}
</style>
