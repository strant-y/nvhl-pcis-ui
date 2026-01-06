<!-- 续保管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery(false)"
		>
			<!-- policyInfo 列的具名插槽 -->
			<template #column-policyInfo="{ row, column, index }">
				<div v-if="cPrnTypedata == '01'" class="policy-info-cell">
					<div v-if="row.cAppNo" class="policy-number-row">
						<span>{{ row.cAppNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cAppNo)">
							<DocumentCopy />
						</el-icon>
					</div>
					<div v-if="row.cPlyNo" class="policy-number-row">
						<span>{{ row.cPlyNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
							<DocumentCopy />
						</el-icon>
					</div>
				</div>
				<div v-if="cPrnTypedata == '02'" class="policy-info-cell">
					<div v-if="row.cEcAgrNo" class="policy-number-row">
						<span>{{ row.cEcAgrNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cEcAgrNo)">
							<DocumentCopy />
						</el-icon>
					</div>
					<div v-if="row.cEcAgrAppNo" class="policy-number-row">
						<span>{{ row.cEcAgrAppNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cEcAgrAppNo)">
							<DocumentCopy />
						</el-icon>
					</div>
				</div>
			</template>
		</app-table>
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
import {deleteFactorBykey, exportRenewalInsurance,exportECargoRenewalInsurance, findRenewalInsurance, findECargoRenewalInsurance, getBasicKindList, getPolicy} from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { DocumentCopy } from "@element-plus/icons-vue";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const renewalDialog = defineAsyncComponent(() => import("../pcis/guide/renewalDialog.vue"));
import { useUserStore } from "@/store/modules/user";
import {saveAs} from "file-saver";
import {useRouter} from "vue-router";
import dayjs from "dayjs";
import moment from "moment/moment";
import { getAppPolicyComponent, getAppPolicyForRenewal, getECargoPolicyComponent, getECargoPolicyForRenewal,getECargoPolicyPayment } from "../pcis/guide/custom-recording.service";
import { cannotCopy } from '@/utils/cannotCopyPlyNo';
const router = useRouter();
const userStore = useUserStore();
const user = ref(userStore.user);
const queryLoading = ref(false);         // 控制按钮 loading 图标
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "续保管理",
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
          freeEditRef.value?.resetFields();
					freeEditRef.value?.setFormValue({
						tAppTm: [
							moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
									"YYYY-MM-DD 00:00:00"
							),
							moment(new Date()).format("YYYY-MM-DD 23:59:59"),
						],
						cDptCde: "0200000000000",
    				cPrnType: "01",
						cLoadSub:1
  				});
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {
          exportExcel()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {
          trigger: 'change'
        })],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
                .open(DepartmentTree, { type: "Issuer", data: {} })
                .then((res) => {
                  if (res.body) {
                    const selectObj = res.body;
                    freeEditRef.value?.setValue("cDptCde", selectObj.id);
                    setFormItem("cDptCde", {
                      loadData: [
                        {
                          label: selectObj.id+selectObj.name,
                          value: selectObj.id,
                        },
                      ],
                    });
                  }
                });
          },
        },
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        keymap: {
          y: 1,
          n: 0,
        },
			},
			{
        prop: "cPrnType",
        inputtype: "rtselect",
        title: "单据类型",
				clearable: true,
				loadData: [
					{ label: "自定义续保",value: "01"},
					{ label: "协议续保",value: "02"},
				],
        rules: [getRules("required", {})],
				func: (value: any) => {
					if (value == "02") {
						setFormItem("cKindNo", { hidden: true })
						setFormItem("cProdNo", { hidden: true })
						setFormItem("tAppTm", { title: "有效止期" })
					} else {
						setFormItem("cKindNo", { hidden: false })
						setFormItem("cProdNo", { hidden: false })
						setFormItem("tAppTm", { title: "保险止期" })
					}
					tableconfig.fromSchema?.forEach((e: any) => {
            if (e.prop === "cTermNo") {
              if (value == "02") {
                e.isShow = false;
              } else {
                e.isShow = true;
              }
            }
					});
					pageresult.list = [];
        	pageresult.total = 0;
				},
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        clearable: true,
        params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
        func: (val: any) => {
          // 更新产品下拉选
          setFormItem("cProdNo", {
            codeParam: {
              cParCde: val,
              cOperId: user.value?.opCde,
              cDptCde: user.value?.companyId,
            },
          });
          freeEditRef.value?.setValue("cProdNo", null);
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "条款",
        typeCode: "TERM_LIST_IN_GUIDE_NEW",
        clearable: true,
        params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "tAppTm",
        inputtype: "rtdatepicker",
        title: "保险止期",
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
        disabledDate : (time:Date) => {
          const today = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(today.getMonth() - 6);

          // 限制只能选择今天及之前的时间，并且不能早于 6 个月前
          return time.getTime() > today.getTime() || time.getTime() < sixMonthsAgo.getTime();
        },
        func: (val) => {
          if(val){
            handleDateChange(val);
          }
        },
      },
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
const handleDateChange = (value) => {
  let startDate,
      endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD 00:00:00");
  endDate = moment(new Date(value[1]))
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
};
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 140,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "一键续保",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {
           getRenewal(row)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cDptNameL2",
        inputtype: "rtinput",
        title: "二级机构",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "cDptNameL3",
        inputtype: "rtinput",
        title: "三级机构",
        minWidth: 180,
      },
			{
				prop: "policyInfo",
				inputtype: "rtinput",
				title: "保单",
				minWidth: 180,
				slotName: "policyInfo"
			},
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        minWidth: 180,
        isShow: false
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
        isShow: false
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人姓名",
        minWidth: 180,
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款",
        minWidth: 180,
      },
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
        minWidth: 180,
      },
			{
				prop: "InsurancePeriod",
				inputtype: "rtinput",
				title: "保险期间",
			},
      // {
      //   prop: "tInsrncBgnTm",
      //   inputtype: "rtinput",
      //   title: "保险起期",
      //   minWidth: 180,
      // },
      // {
      //   prop: "tInsrncEndTm",
      //   inputtype: "rtinput",
      //   title: "保险止期",
      //   minWidth: 180,
      // },
    ],
  })
);
onMounted(async () => {
  freeEditRef.value?.setFormValue({
    tAppTm: [
      moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
          "YYYY-MM-DD 00:00:00"
      ),
      moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ],
    cDptCde: "0200000000000",
    cPrnType: "01",
    cLoadSub:1
  });
  setFormItem("cDptCde", {
    loadData: [
      {
        label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
        value: JSON.parse(sessionStorage.getItem("user")).companyId,
      },
    ],
  });
});
const handleArray = (obj:any,base)=>{
  // 创建一个新的对象，并移除"Base."前缀
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 通过字符串操作去掉前缀
      let newKey = key.replace(base, '');
      newObj[newKey] = obj[key];
    }
  }
  return newObj
}

const getRenewal = (row:any)=>{
   console.log('一键续保。。。',row.cPlyNo)
  if(row.cPlyNo?.length > 18) {
    ElMessage.error("历史数据的保单, 不允许续保");
    return;
  }
  if (cannotCopy(row.cPlyNo)) {
    ElMessage.error("该保单不允许续保");
    return;
	}
	if (row.appType == "ply") {
		getAppPolicyComponent({ cPlyNo: row.cPlyNo }).then((res:any) => {
			if(res.res.length > 0) {
				dzmodal
					.open(renewalDialog, { 
						type: "Issuer",
						cPlyNo: row.cPlyNo,
						options: Object.keys(res.res[0]).map((item:any) => ({ label: res.res[0][item], value: item })),
						selected: Object.keys(res.res[0]).map((item:any) => item)
					})
					.then((res: any) => {
						if(res.type === 'ok') {
							const renewalComponent = res.body.component;
							getAppPolicyForRenewal({ cPlyNo: row.cPlyNo, components: [renewalComponent] }).then((res: any) => {
								if (res.code == "200") {
									if (res.res.composition.plyBase[0]?.['Base.cTransMrk'] === '1') {
										ElMessage.warning("该保单不允许续保，请重新选择！");
										return
									}
									let cvrg = JSON.parse(JSON.stringify(res.res.composition.cvrg))
									res.res.composition.cvrg = []
									router.push({
										path: "/pcisapp/myPage",
										query: {
											param: JSON.stringify({
												...handleArray(res.res.composition.plyBase[0],"Base."), ...{
													pageType: "orig", 
													cTermNme: cvrg[0]?.["Term.cClauseCode"],
													cTermNo: cvrg[0]?.["Term.cClauseName"],
													res: res
												}
											}),
										},
									});
								} else {
									ElMessage.error(res.msg);
								}
							}
						);
						}
					});
			} else {
				ElMessage.error(res.msg)
			}
		}).catch(err => {
			ElMessage.error(err.msg || err)
		})
	} else if (row.appType == "eCargo") {
		getECargoPolicyComponent({ cPlyNo: row.cEcAgrNo }).then((res:any) => {
			if(res.res.length > 0) {
				dzmodal
					.open(renewalDialog, { 
						type: "Issuer",
						cPlyNo: row.cEcAgrNo,
						options: Object.keys(res.res[0]).map((item:any) => ({ label: res.res[0][item], value: item })),
						selected: Object.keys(res.res[0]).map((item:any) => item)
					})
					.then((res1: any) => {
						if (res1.type === 'ok') {
							// 续保根据单号获取付费方式
							getECargoPolicyPayment({ cPlyNo: row.cEcAgrNo }).then((res2: any) => {
								if (res2 && res2.code == 200) {
									const paymentMethod = res2.data.paymentMethod
									const dptCde = res2.data.dptCde
									const cDptCde = res2.data.cDptCde
									const renewalComponent = res1.body.component;
									getECargoPolicyForRenewal({ cEcAgrNo: row.cEcAgrNo, components: [renewalComponent] }).then((res3: any) => {
										if (res3.code == "200") {
											// 存一份申请单号，把res的单号清空
											let AgreementBase = JSON.parse(JSON.stringify(res3.res.composition.AgreementBase[0]))
											clearCEcAgrAppNoValues(res3.res.composition)
											router.push({
												path: "/protocolManagement/enteringDtl",
												query: {
													param: JSON.stringify({
														...handleArray(AgreementBase,"ECargoBase."),
														res: res3, dptCde, cDptCde,
														renewalComponent: renewalComponent.value
													}),
													type: 'orig',
													payWay: paymentMethod
												},
											});
										} else {
											ElMessage.error(res3.msg);
										}
									})
								} else {
									ElMessage.error(res2.msg);
								}
							})
							.catch((err: any) => {
								ElMessage.error(err.msg);
							});
						}
					});
			} else {
				ElMessage.error(res.msg)
			}
		}).catch(err => {
			ElMessage.error(err.msg || err)
		})
	}
}

//导出
const exportExcel = () => {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, {tInsrncBgnTm:s.tAppTm[0],tInsrncEndTm:s.tAppTm[1]});
  if ( (Date.parse(param.tInsrncEndTm) - Date.parse(param.tInsrncBgnTm)) >= (180 * 1000 * 60 * 60 * 24)) {
    ElMessage.warning("保险起止日期范围请控制在半年以内");
    return;
	}
	let data
	if (s.cPrnType == "01") {
		data = exportRenewalInsurance(param)
	} else if (s.cPrnType == "02") {
		data = exportECargoRenewalInsurance(param)
	}
	data.then((res) => {
    if (res.size <= 0) {
      ElMessage.error({ message: "导出出错", duration: 3000 });
      return;
    }
   const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
    const blob = new Blob([res.data], {
      responseType:res.headers["content-type"]
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
    });
    saveAs(blob, fileName);
  })
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

const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
			queryLoading.value = true;
      refreshData(flag)
    } else {
      ElMessage.error("请填写必填项");
    }
  })
}

/** 查询 */
let cPrnTypedata = ref('01')
function refreshData(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  param.tInsrncBgnTm = param.tAppTm[0]
  param.tInsrncEndTm = param.tAppTm[1]
  if ( (Date.parse(param.tInsrncEndTm) - Date.parse(param.tInsrncBgnTm)) >= (180 * 1000 * 60 * 60 * 24)) {
    ElMessage.warning("保险起止日期范围请控制在距离当前时间半年以内");
    return;
	}
	console.log('param)))))))))))))))))))', param)
	let data
	if (s.cPrnType == "01") {
		cPrnTypedata.value = '01'
		data = findRenewalInsurance(param)
	} else if (s.cPrnType == "02") {
		cPrnTypedata.value = '02'
		data = findECargoRenewalInsurance(param)
	}
	data.then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
				pageresult.list = data.result;
				if (cPrnTypedata.value == '01') {
					pageresult.list = data.result.map((item) => ({
						...item,
						// 创建一个新字段合并两个值
						policyInfo: `${item.cAppNo || ''}\n${item.cPlyNo || ''}`,
						InsurancePeriod: `${item.tInsrncBgnTm || ''}\n${item.tInsrncEndTm || ''}`,
					}))
				} else {
					pageresult.list = data.result.map((item) => ({
						...item,
						// 创建一个新字段合并两个值
						policyInfo: `${item.cEcAgrNo || ''}\n${item.cEcAgrAppNo || ''}`,
						InsurancePeriod: `${item.tInsrncBgnTm || ''}\n${item.tInsrncEndTm || ''}`,
					}))
				}
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
		.finally(() => {
			queryLoading.value = false;
		});
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log('selection',selection)
  removeIds.value = selection.map((item: any) => item.cPkId);
}
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

/**
 * 清空所有对象中字段名包含 '.cEcAgrAppNo' 的值（设为空字符串）
 */
 function clearCEcAgrAppNoValues(data) {
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && typeof item === 'object') {
        clearCEcAgrAppNoValues(item); // 递归处理数组中的对象
      }
    });
  } else if (data && typeof data === 'object') {
    for (const key in data) {
      if (key.endsWith('.cEcAgrAppNo')) {
        // 清空该字段的值（可选：设为 ""、null、undefined）
        data[key] = ""; // 或 null，根据业务需求
      } else if (typeof data[key] === 'object') {
        // 继续递归嵌套对象（虽然你数据是扁平的，但更健壮）
        clearCEcAgrAppNoValues(data[key]);
      }
    }
  }
}
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
