<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
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
				<template #column-policyInfoTB="{ row, column, index }">
            <div class="policy-info-cell">
                <div v-if="row.cAppNo" class="policy-number-row">
                    <span style="width: calc(100% - 1em - 5px)">{{ row.cAppNo }}</span>
                    <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                        <DocumentCopy />
                    </el-icon>
                </div>
                <div v-if="row.cPlyNo" class="policy-number-row">
                    <span style="width: calc(100% - 1em - 5px)">{{ row.cPlyNo }}</span>
                    <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                        <DocumentCopy />
                    </el-icon>
                </div>
            </div>
        </template>
        <template #column-cDptCnm="{ row, column, index }">
          <el-tooltip :content="row.cDptCnm" placement="top">
            <span v-html="row.cDptCnm || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-cSecondDptCnm="{ row, column, index }">
          <el-tooltip :content="row.cSecondDptCnm" placement="top">
            <span v-html="row.cSecondDptCnm || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-cAppNme="{ row, column, index }">
          <el-tooltip :content="row.cAppNme" placement="top">
            <span v-html="row.cAppNme || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-insuredNme="{ row, column, index }">
          <el-tooltip :content="row.insuredNme" placement="top">
            <span v-html="row.insuredNme || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
	</app-table>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {AppFreeEditConfig,AppFreeEditMethod,createAppFreeEditConfig} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import {AppTableConfig,AppTableMethod,createTableEditConfig,MyTableMethod} from "@/shared/app-table-config";
import dayjs from "dayjs";
import moment from "moment";
import cargoApi from '@/api/cargo'
import { DocumentCopy } from "@element-plus/icons-vue";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";

const { getRules } = useValidator();
const dzmodal = useDzModal();
const router = useRouter();
const route = useRoute();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery(true);
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
					reset()
        },
      }),
    ],
		fromSchema: [
			{
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "归属机构名称",
        showExBtn: true,
        disabled: true,
        rules: [getRules("required", {})],
        btnItems: {
            icon: "Search",
            type: "primary",
            func: () => {
                dzmodal.open(DepartmentTree, { type: "Issuer", data: {} }).then((res:any) => {
                    if (res.type === "ok") {
                        if (res.body) {
                            freeEditRef.value?.setValue("cDptCde", res.body.id);
                            setFormItem("cDptCde", {
                                loadData: [
                                    {
                                        label: `${res.body.id}${res.body.name}`,
                                        value: res.body.id,
                                    },
                                ],
                            });
                        }
                    }
                });
            },
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
        prop: "cEcAgrNo",
        inputtype: "rtinput",
        title: "预约协议号",
        clearable: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
	  	{
        prop: "insuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
      {
        prop: "cAppStatus",
        inputtype: "rtselect",
        title: "任务状态",
        minWidth: 180,
        clearable: true,
        loadData: [
            {label: "暂存", value: 1},
            {label: "已提核", value: 2},
            {label: "核保退回/撤回", value: 3},
            {label: "已核待缴费", value: 4},
            {label: "已出单", value: 5},
            {label: "见费出单退回", value: 8},
        ]
      },
      {
        prop: "cUdrNme",
        inputtype: "rtinput",
        title: "操作员名称",
        clearable: true,
      },
	  	{
        prop: "tInsrncTm",
        inputtype: "rtdatepicker",
        title: "生效日期",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
        func: (val:any) => {
            handleDateChange(val, "1");
        },
	  	},
      {
        prop: "cInsuredCde",
        inputtype: "rtinput",
        title: "代理人代码",
        clearable: true,
      },
	  	{
        prop: "tAppTm",
        inputtype: "rtdatepicker",
        title: "录入日期",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        type: "datetimerange",
        rules: [getRules("required", {})],
        func: (val:any) => {
            handleDateChange(val, "2");
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: false,
	tableBtn: [
	createFreeButtonBase({
        id: "view",
        link: true,
        tooltip: "查看",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          console.log(row);
          toDtl(row, 'view');
        },
    })],
    fromSchema: [
      {
        prop: "policyInfo",
        inputtype: "rtinput",
        title: "申请单号/协议号",
        fixed: "left",
        lengthNum: 22,
        lengthIsNumber: true,
		    slotName: "policyInfo"
			},
			{
        prop: "policyInfoTB",
        inputtype: "rtinput",
        title: "投保单号/保单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "policyInfoTB"
    	},
      {
        prop: "cSecondDptCnm",
        inputtype: "rtinput",
        title: "分公司",
        slotName: "cSecondDptCnm",
        align: 'left',
        lengthNum: 12,
	  	},
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "出单机构",
        slotName: "cDptCnm",
        align: 'left',
        lengthNum: 12,
	  	},
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        lengthNum: 21,
        lengthIsNumber: true,
        isShow: false
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        lengthNum: 21,
        lengthIsNumber: true,
        isShow: false
      },
	  	{
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        slotName: "cAppNme",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "insuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        slotName: "insuredNme",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "协议起期",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "协议止期",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      // {
      //   prop: "InsurancePeriod",
      //   inputtype: "rtinput",
      //   title: "输入日期",
      //   lengthNum: 17,
      //   lengthIsNumber: true,
      //   slotName: "InsurancePeriod"
	  	// },
      {
        prop: "nRmbPrm",
        inputtype: "rtinput",
        title: "预估总保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nRmbAmt",
        inputtype: "rtinput",
        title: "预估总保额",
        lengthNum: 13,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nLowPrm",
        inputtype: "rtinput",
        title: "最低保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nWhRmbAmt",
        inputtype: "rtinput",
        title: "预扣保额",
        lengthNum: 13,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nRecRemEstAmt",
        inputtype: "rtinput",
        title: "协议剩余实收(预估)保额",
        lengthNum: 13,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nRmbReceivedPrm",
        inputtype: "rtinput",
        title: "预收保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nWhRmbPrm",
        inputtype: "rtinput",
        title: "预扣保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "nRecRemPrm",
        inputtype: "rtinput",
        title: "协议剩余实收(预估)保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
				formatter: (val: any) => {
						return val.toLocaleString()
				}
      },
      {
        prop: "cAppStatus",
        inputtype: "rtselect",
        title: "任务状态",
        loadData: [
            {label: "暂存", value: '1'},
            {label: "已提核", value: '2'},
            {label: "核保退回/撤回", value: '3'},
            {label: "已核待缴费", value: '4'},
            {label: "已出单", value: '5'},
            {label: "见费出单退回", value: '8'},
        ],
        lengthNum: 7,
        align: "left"
			},
			{
        prop: "cUdrNme",
        inputtype: "rtinput",
        title: "操作员",
        lengthNum: 4,
	  	},
    ],
  })
);

const handleQuery = (flag: boolean) => {
   submitForm(flag);
};

const submitForm = (flag: boolean) => {
  freeEditRef.value?.validate().then((isValid: boolean) => {
    if (isValid) {
      refreshData(flag);
    } else {
      console.log("error submit!!");
      return false;
    }
  });
};

const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue();
	if (s.cLoadSub == null || s.cLoadSub == undefined) {
        s.cLoadSub = "1";
  }
  const params = Object.assign(s, r);
  cargoApi.queryRelevancePolicy(params).then((res: any) => {
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData) {
		pageData.data.forEach((item: any, index: number) => {
          item.nSeqNo = index + 1;
        });
        pageresult.list = pageData.data;
        pageresult.total = pageData.total;
      }
    }
  });
};

onMounted(() => {
	reset()
});

function reset (){
	freeEditRef.value?.setFormValue({
		cDptCde: "0200000000000",
		cAppStatus: 4,
		tAppTm: [
            dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
		],
	});
	setFormItem("cDptCde", {
		loadData: [
			{
				label: "0200000000000永安保险总公司",
				value: "0200000000000",
			},
		],
	});
	handleQuery(true)
}

function toDtl(row: any, type: string) {
  router.push({path: "/protocolManagement/enteringDtl", query: {param: JSON.stringify(row), type: type}});
}

// 日期change事件
const handleDateChange = (value:any, num:String) => {
  let startDate,
      endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD 00:00:00");
  endDate = moment(new Date(value[1])).endOf("day").format("YYYY-MM-DD HH:mm:ss");
	// 生效日期
	if(num == "1"){
		freeEditRef.value?.setFormValue({
			tInsrncBgnTm: startDate, // 生效日期起期
			tInsrncEndTm: endDate, // 生效日期止期
		});
	} else if(num == "2"){ // 录入日期
		freeEditRef.value?.setFormValue({
			tAppBgnTm: startDate, // 录入日期起期
			tAppEndTm: endDate, // 录入日期止期
		});
	}
};

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
                } else {
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
</script>

<style scoped lang="scss">
.custom-modal {
  width: 1000px;
}

.inlineForm {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  position: relative;
}

.clo-2 {
  flex: 0 0 50%;
  max-width: 50%;
}

.clo-3 {
  flex: 0 0 33%;
  max-width: 33%;
}

.clo-4 {
  flex: 0 0 25%;
  max-width: 25%;
}

.col-button {
  flex: 0 0 100%;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
</style>
<style lang="scss">
.addRoleConfirmPop {
  .el-message-box__container {
    display: block;
  }
}
.app-container{
  padding: 6px 30px;
}
::v-deep(.el-form){
  padding: 5px 30px;
}

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
