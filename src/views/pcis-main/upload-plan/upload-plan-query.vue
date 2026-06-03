<!-- Excel导入出单 -->
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
			<template #column-cAppNo="{ row, column, index }">
				<div class="policy-info-cell">
					<div v-if="row.cAppNo" class="policy-number-row">
						<span style="width: calc(100% - 1em - 5px)">{{ row.cAppNo }}</span>
						<el-icon class="copy-icon" @click="copyText(row.cAppNo)">
							<DocumentCopy />
						</el-icon>
					</div>
				</div>
			</template>
		</app-table>
    <!-- 弹窗组件 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="详细信息" 
      width="50%" 
      :append-to-body="true"
    >
      <div class="error-list">
        <div v-for="(item, index) in errorList" :key="index" class="error-item">
          {{ item }}
        </div>
      </div>
      <!-- <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template> -->
    </el-dialog>
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
import { codeListViewStore } from "@/store";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, selectImportRecord, getProdEnableList, checkCdeptByCdptCde } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { downloadPlanTemplate, importPlan } from "@/views/pcis/guide/custom-recording.service";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dzmodal = useDzModal();
const userStore = useUserStore();
const user = ref(userStore.user);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const uploadEdit = defineAsyncComponent(() => import("./upload-edit.vue"));
const departmentTree = defineAsyncComponent(() => import("@/pcis/prodRef/commodityRef/DepartmentTree.vue"))
const queryLoading = ref(false); // 控制按钮 loading 图标
const downloadTemplateLoading = ref(false); // 模板下载Loading
const importTemplateLoading = ref(false); // 模板导入Loading
const prodTotalDatas = ref([]); // 所有产品数据
const cProdData = ref([]); // 选中产品大类的产品
const isProdList = ["010022", "040002", "043002", "043009", "047002", "047003", "059903", "059905", "059906", "059908", "059914", "080002", "080026", "080027", "120003", "120005", "130001", "130002", "130003"]; // 可以点击模板导入和下载的产品
const hidden = ref(true);
const dialogVisible = ref(false)
const dialogData = ref("")
const errorList = computed(() => 
  dialogData.value.split('\n').filter(item => item.trim() !== '')
)
const kindData: any = computed(() => {
    return prodTotalDatas.value.map((item: any) => ({
        label: item.code + " " + item.value,
        value: item.code,
        list: item.list,
    }));
});

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
					freeEditRef.value?.resetFields();
					freeEditRef.value?.setFormValue({
						cDptCde: "0200000000000",
						cLoadSub: 1,
					});
					freeEditRef.value.setValue(
						"cDptCde",
						JSON.parse(sessionStorage.getItem("user")).companyId
					);
					setFormItem("cDptCde", {
						loadData: [
							{
								label:
									JSON.parse(sessionStorage.getItem("user")).companyId +
									JSON.parse(sessionStorage.getItem("user")).companyCnm,
								value: JSON.parse(sessionStorage.getItem("user")).companyId,
							},
						],
					});
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
				title: "承保机构",
        btnWidth: 20,
        itemWidth: 2,
        clearable: true,
				showExBtn: true,
				disabled: true,
        rules: [getRules("required", {})],
        btnItems: {
          icon: "Search",
          type: "primary",
          func: (val: string) => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  const selectObj = res.body;
                  freeEditRef.value?.setValue("cDptCde", selectObj.id);
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
          },
        },
        loadData: [
          {
            label: "0200000000000永安保险总公司",
            value: "0200000000000",
          },
				],
				func: (val) => {
					checkCdeptByCdptCde({ dptCde: val }).then((res) => {
						if (res["code"] === 200) {
							if (res.data) {
								//查询项目类别大类数据
								codeListStore
									.queryCodeList(
										{
											codeListName: "CPrjCtgTyp_List",
											codeListParam: {
												CRangeCde: res.data,
												CParCde: '-1',
												cLev: "1",
											},
										},
										false,
										false
									)
									.then((res) => {
										if (res) {
											setValue("cPrjCtgTyp", "")
											setFormItem("cPrjCtgTyp", { loadData: [] });
											setValue("cPrjCtgMidTyp", "")
											setFormItem("cPrjCtgMidTyp", { loadData: [] });
											setValue("cPrjCtgSubTyp", "")
											setFormItem("cPrjCtgSubTyp", { loadData: [] });
											setFormItem("cPrjCtgTyp", { loadData: res });
										}
									})
									.catch((err) => {
										setFormItem("cPrjCtgTyp", { loadData: [] });
									});
							}
						} else {
							ElMessage.error("根据机构编码查询分公司出现异常！");
						}
					});
				},
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
        rules: [getRules("required", {})],
        clearable: true,
        typeCode: "KIND_LIST_GRT",
        filterable: true,
        clearable: true,
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
				loadData: kindData,
				func: (val: string) => {
					setValue("cProdNo","")
					setValue("cPlanNo","")
          if (val && val.length > 0) {
							let options: any = [];
							kindData.value.forEach((item: any) => {
									if (val.includes(item.value)) {
											const list = item.list.map((item: any) => ({
													label: item.code + " " + item.value,
													value: item.code,
													list: item.list,
											}));
											options = options.concat(list);
									}
							});
							cProdData.value = options;
							setFormItem("cProdNo", { loadData: options });
							freeEditRef.value?.setValue("cProdNo", null);
					} else {
							setFormItem("cProdNo", { loadData: [] });
							freeEditRef.value?.setValue("cProdNo", null);
					}
        },
			},
			{
				prop: "cProdNo",
				inputtype: "rtselect",
				title: "产品名称",
				clearable: true,
				filterable: true,
				rules: [getRules("required", {})],
				func: (val) => {
					if (isProdList.includes(val)) {
						hidden.value = false
					} else {
						hidden.value = true
					}
					setValue("cPlanNo","")
					if (val && val.length > 0) {
						let options: any = [];
						cProdData.value.forEach((item: any) => {
								if (val.includes(item.value)) {
										const list = item.list.map((item: any) => ({
												label: item.code + " " + item.value,
												value: item.code,
												list: item.list,
										}));
										options = options.concat(list);
								}
						});
						setFormItem("cPlanNo", { loadData: options });
						freeEditRef.value?.setValue("cPlanNo", null);
					} else {
						setFormItem("cPlanNo", { loadData: [] });
						freeEditRef.value?.setValue("cPlanNo", null);
					}
				},
			},
      {
				prop: "cPlanNo",
				inputtype: "rtselect",
				title: "方案名称",
				itemWidth: 1,
				rules: [getRules("required", {})],
				filterable: true,
				clearable: true,
				func: (val:any) => {},
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
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
				clearable: true,
      },
      {
        prop: "tAppTm",
        inputtype: "rtdatepicker",
        title: "投保申请日期",
        type: "datetimerange",
        itemWidth: 1,
				clearable: true,
        format: "YYYY-MM-DD HH:mm:ss",
				valueFormat: "YYYY-MM-DD HH:mm:ss",
				defaultTime: [
					moment(new Date()).format("YYYY-MM-DD 00:00:00"),
          moment(new Date(Date.now() + (6 * 1000 * 60 * 60 * 24))).format(
                "YYYY-MM-DD 23:59:59"
					)
				],
      },
      {
        prop: "cBatchNo",
        inputtype: "rtinput",
        title: "Excel导入批次号",
				clearable: true,
      },
      {
        prop: "TInsrncBgnTm",
        inputtype: "rtdatepicker",
        title: "保险起期",
        type: "datetimerange",
        itemWidth: 1,
        clearable: true,
        format: "YYYY-MM-DD HH:mm:ss",
				valueFormat: "YYYY-MM-DD HH:mm:ss",
				defaultTime: [
					moment(new Date()).format("YYYY-MM-DD 00:00:00"),
          moment(new Date(Date.now() + (6 * 1000 * 60 * 60 * 24))).format(
                "YYYY-MM-DD 23:59:59"
					)
				],
			},
			{
        prop: "tOprTm",
        inputtype: "rtdatepicker",
        title: "Excel导入日期",
        itemWidth: 1,
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
				defaultTime: [
					moment(new Date()).format("YYYY-MM-DD 00:00:00"),
          moment(new Date(Date.now() + (6 * 1000 * 60 * 60 * 24))).format(
                "YYYY-MM-DD 23:59:59"
					)
				],
      },
      {
        prop: "cPrjCtgTyp",
        inputtype: "rtselect",
				title: "项目类别大类",
        typeCode: "CPrjCtgTyp_List",
				clearable: true,
				func: (val) => {
					setValue("cPrjCtgMidTyp", "")
					setFormItem("cPrjCtgMidTyp", { loadData: [] });
					setValue("cPrjCtgSubTyp", "")
					setFormItem("cPrjCtgSubTyp", { loadData: [] });
					if (val) {
						codeListStore
						.queryCodeList({
							codeListName: "CPrjCtgTyp_List",
							codeListParam: {
								CParCde: val,
								cLev: "2",
							},
						})
						.then((res) => {
							if (res) {
								setFormItem("cPrjCtgMidTyp", {
									loadData: res,
								});
							}
						});
					}
				},
      },
      {
        prop: "cPrjCtgMidTyp",
        inputtype: "rtselect",
        title: "项目类别中类",
				clearable: true,
				func: (val) => {
					setValue("cPrjCtgSubTyp", "")
					setFormItem("cPrjCtgSubTyp", { loadData: [] });
					if (val) {
						codeListStore
						.queryCodeList({
							codeListName: "CPrjCtgTyp_List",
							codeListParam: {
								CParCde: val,
								cLev: "3",
							},
						})
						.then((res) => {
							if (res) {
								setFormItem("cPrjCtgSubTyp", {
									loadData: res,
								});
							}
						});
					}
				},
      },
      {
        prop: "cPrjCtgSubTyp",
        inputtype: "rtselect",
        title: "项目类别子类",
				clearable: true,
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


const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    tableBtnType: "btn",
    tableBtnWidth: 95,
    tableBtnPosition: "right",
    tableBtnTitle: "错误信息",
    fixed: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "模板下载",
				type: "primary",
				loading: downloadTemplateLoading,
				hidden: hidden,
				func: function () {
					let formData = freeEditRef.value?.getFromValue()
					if(!formData.cProdNo || !formData.cPlanNo) {
						ElMessage.warning("请先选择方案！");
						return false
					}
					if(!formData.cDptCde) {
						ElMessage.warning("请先选择承保机构！");
						return false
					}
					downloadTemplateLoading.value = true;
					const param = {
						cPlanNo: formData.cPlanNo,
						CProdNo: formData.cProdNo,
						CGrpMrk: '0',
						cDptCde: formData.cDptCde,
					}
					downloadPlanTemplate(param).then((res:any) => {
						downloadTemplateLoading.value = false;
						if (res.size <= 0) {
							ElMessage.error({ message: "下载出错", duration: 3000 });
							return;
						}
						const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
						const blob = new Blob([res.data], {
							responseType: res.headers["content-type"]
							// "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
						});
						saveAs(blob, fileName);
					})
					.catch(() => {
						ElMessage.error("模板下载失败");
						downloadTemplateLoading.value = false;
					});
          // dzmodal.open(uploadEdit, { type: "", data: {} }).then((res) => {
          //   if (res.type === "ok") {
          //     console.log("模板下载");
          //   }
          // });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   label: "导出",
      //   type: "primary",
      //   func: function () {},
      // }),
      createFreeButtonBase({
        id: "score",
        label: "Excel导入",
        type: "primary",
        icon: "Upload",
				hidden: hidden,
				func: function () {
					let formData = freeEditRef.value?.getFromValue()
					if(!formData.cProdNo || !formData.cPlanNo) {
						ElMessage.warning("请先选择方案！");
						return false
					}
					if(!formData.cDptCde) {
						ElMessage.warning("请先选择承保机构！");
						return false
					}
					const input = document.createElement('input');
					input.type = 'file';
					input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
					input.onchange = () => {
						if (input.files?.length) {
							const file = input.files[0];
							const reader = new FileReader();
				
							reader.onload = async (e) => {
								const base64String = e.target?.result as string;
				
								// 构建参数并请求接口
								const params = {
									cPlanNo: formData.cPlanNo,
									CProdNo: formData.cProdNo,
									CGrpMrk: '0',
									cDptCde: formData.cDptCde,
									file: base64String,
								}
								importTemplateLoading.value = true;
								importPlan(params).then((res:any) => {
									importTemplateLoading.value = false;
									if (res.code === 200) {
										
									} else {
										ElMessage.error(res.msg || "导入失败");
									}
								}).catch((error) => {
									ElMessage.error("导入出错，请检查文件格式或内容");
									console.error("导入错误：", error);
									importTemplateLoading.value = false;
								});
							};
				
							reader.onerror = (e) => {
								console.error("文件读取失败", e);
								ElMessage.error("文件读取失败");
							};
							reader.readAsDataURL(file); // 启动读取
						}
					};
					input.click(); // 触发文件选择对话框
				},
      }),
      createFreeButtonBase({
        id: "score",
        label: "保单详细",
        type: "primary",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "状态详细",
        type: "primary",
        func: function () {},
      }),
		],
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看错误原因",
        type: "success",
        size: "large",
        icon: "View",
        hideBtns: (row: any) => {
          if (!!row.cImportAppMsg) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          dialogData.value = row.cImportAppMsg;
          dialogVisible.value = true;
        },
      }),
    ],
    fromSchema: [
      {
				prop: "cAppGroup",
				inputtype: "rtinput",
				title: "保单序号",
      },
      {
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "保单",
        lengthNum: 22,
				lengthIsNumber: true,
				slotName: "cAppNo"
      },
      {
        prop: "cAppTyp",
				inputtype: "rtselect",
				title: "申请单类型",
        loadData :[
          { label:'投保',value:"A" },
          { label:'批改',value:"E" },
        ]
      },
      {
        prop: "cProdNo_text",
				inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "cBatchNo",
				inputtype: "rtinput",
        title: "导入批次号",
      },
      {
        prop: "cDptCde_text",
				inputtype: "rtinput",
        title: "机构部门",
      },
      {
        prop: "cApplicantNme",
				inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cApplicantCertfCde",
				inputtype: "rtinput",
        title: "投保人证件号",
      },
      {
        prop: "cInsuredNme",
				inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "cInsuredCertfCde",
				inputtype: "rtinput",
        title: "被保人证件号",
      },
      {
        prop: "tInsrncTm",
				inputtype: "rtinput",
				title: "保险起止期",
        minWidth: 240,
      },
      {
        prop: "nPrm",
				inputtype: "rtinput",
        title: "保险费",
      },
      {
        prop: "cImportType",
				inputtype: "rtselect",
				title: "导入类型",
        loadData :[
          { label:'普通出单',value: 1 },
          { label:'方案出单',value: 2 },
        ]
      },
      {
        prop: "cOprCde_text",
				inputtype: "rtinput",
        title: "导入操作员",
      },
      {
        prop: "tOprTm",
				inputtype: "rtinput",
        title: "导入日期",
      },
      {
        prop: "cImportAppStatus_text",
				inputtype: "rtinput",
        title: "导入状态",
      },
    ],
  })
);

onBeforeMount(() => {
    let params = {
        level: 2,
        type: 2, // 自定义录单---1/方案录单---2
        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
    }
    getProdEnableList(params).then((res: any) => {
        if (res.data && res.data.length > 0) {
            prodTotalDatas.value = res.data;
        }
    });
});

onMounted(async () => {
  freeEditRef.value?.setFormValue({
    cDptCde: "0200000000000",
    cLoadSub: 1,
  });
  freeEditRef.value.setValue(
    "cDptCde",
    JSON.parse(sessionStorage.getItem("user")).companyId
  );
  setFormItem("cDptCde", {
    loadData: [
      {
        label:
          JSON.parse(sessionStorage.getItem("user")).companyId +
          JSON.parse(sessionStorage.getItem("user")).companyCnm,
        value: JSON.parse(sessionStorage.getItem("user")).companyId,
      },
    ],
  });
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

/** 查询 */
function handleQuery(flag?: boolean) {
	freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
			queryLoading.value = true;
      const tm = freeEditRef.value?.getFromValue().Tm;
      const param = {
        ...freeEditRef.value?.getFromValue(),
        ...tableRef.value?.getPartnerPage(flag),//获取分页数据
      };
      if(tm && tm.length > 1) {
        param.tInsrncBgnTm = tm[0]
        param.tInsrncEndTm = tm[1]
      }
      delete param.Tm
			pageresult.list = []
      selectImportRecord(param)
        .then((res: any) => {
					queryLoading.value = false;
          if (res && res.code === 200) {
            const pageData = res.data;
            if (pageData) {
							pageresult.list = pageData.data.map((item) => ({
								...item,
								// 创建一个新字段合并两个值
								tInsrncTm: `${item.tInsrncBgnTm || ''}\n${item.tInsrncEndTm || ''}`,
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

// 选中事件
const selectedRows = ref<any[]>([]);
function handleSelectionChange(rows: any) {
  selectedRows.value = rows;
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

function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
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
.error-list {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}
.error-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0; /* 给每一条加个底部分割线 */
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
/* 去掉最后一条的分割线 */
.error-item:last-child {
  border-bottom: none;
}
</style>
