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
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { codeListViewStore } from "@/store";
import cargoApi from '@/api/cargo'
import { DocumentCopy } from "@element-plus/icons-vue";

const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const codeListStore = codeListViewStore();

const params = route.query.data ? JSON.parse(route.query.data) : {};
const dataSet = ref<any>([]); // 数据集合
const planSet = ref<any>([]); //结果集

const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";

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
const paymentDialog = defineAsyncComponent(() => import("./paymentMethod.vue"));

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
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
          freeEditRef.value?.setFormValue({
            cDptCde: "0200000000000",
            cLoadSub: 1,
            cKindNo: null,
            cTermNo: null,
            cAppNme: "",
            insuredNme: "",
						cEcAgrNo: "",
						cEcAgrAppNo: "",
            Tm: [
							moment(new Date(Date.now() - 5 * 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 00:00:00"),
							moment(new Date(Date.now() + 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 23:59:59"),
          	],
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
            func: (val: string) => {
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
                          label: `${selectObj.id}${selectObj.name}`,
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
                codeListName: "TERM_LIST_IN_GUIDE_NEW1",
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
        title: "被保人姓名",
        clearable: true,
      },
      {
        prop: "Tm",
        inputtype: "rtdatepicker",
        title: "生效日期",
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "addAgrBtn",
        type: "primary",
        label: "新增",
        icon: "Plus",
        func: () => {
          showMethodModal()
        },
      }),
    ],
    tableBtnWidth: 95,
    tableBtnPosition: "right",
    tableBtnType: "btn",
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
          toDtl({ ...row, sence:'policy' }, 'view', row.cEdrFlag == 'YY' ? '01' : row.cEdrFlag == 'AY' ? '02' : '');
        },
      }),
      createFreeButtonBase({
        id: "edit",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log('row', { ...row, sence:'app' });
          toDtl({ ...row, sence:'app' }, 'edit', row.cEdrFlag == 'YY' ? '01' : row.cEdrFlag == 'AY' ? '02' : '');
        },
      }),
      createFreeButtonBase({
        id: "edit",
        link: true,
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        size: "large",
        tableClick: (row) => {
          if(row.cEcAgrAppNo){
            handelDet(row.cEcAgrAppNo)
          }

        },
      }),
    ],
    fromSchema: [
			{
				prop: "policyInfo",
				inputtype: "rtinput",
				title: "协议号",
        lengthNum: 22,
        // lengthIsNumber: true,
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
        prop: "cAppId",
        inputtype: "rtinput",
        title: "客户编号",
        // lengthNum: 12,
        // lengthIsNumber: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "客户名称",
        slotName: "cAppNme",
        align: 'left',
        // lengthNum: 9,
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
				prop: "InsurancePeriod",
				inputtype: "rtinput",
				title: "协议期间",
        // lengthNum: 36,
        // lengthIsNumber: true,
			},
      // {
      //   prop: "tInsrncBgnTm",
      //   inputtype: "rtinput",
      //   title: "协议起期",
      //   minWidth: 120,
      // },
      // {
      //   prop: "tInsrncEndTm",
      //   inputtype: "rtinput",
      //   title: "协议止期",
      //   minWidth: 120,
      // },
      {
        prop: "cAppStatus",
        inputtype: "rtselect",
        title: "协议状态",
        // lengthNum: 7,
        // align: "left",
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
		cAppNme: "",
		insuredNme: "",
		cEcAgrNo: "",
		cEcAgrAppNo: "",
		Tm: [
			moment(new Date(Date.now() - 5 * 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 00:00:00"),
			moment(new Date(Date.now() + 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 23:59:59"),
		],
	})
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

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {};

function showMethodModal() {
  dzmodal
    .open(paymentDialog)
    .then((res: any) => {
      if (res.type === "ok") {
        const selectedPayment = res.body?.param;
        const dptCde = res.body?.dptCde;
        const cDptCde = res.body?.cDptCde;
        const cDptCnm = res.body?.cDptCnm;
        toDtl({dptCde,cDptCde,cDptCnm}, 'add', selectedPayment);
      }
    });
};
const handelDet = (cEcAgrAppNo:any)=>{
  ElMessageBox.confirm("此操作将删除该数据, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
      .then(() => {
        // 删除逻辑
        console.log("删除", cEcAgrAppNo);
        // 可以在这里调用 API 删除数据
        cargoApi.deleteEcargo({cEcAgrAppNo})
            .then((res: any) => {
              if (res && res.code === 200) {
                handleQuery(true);
              } else {
                ElMessage.error(res.msg);
              }
            })
            .catch((err: any) => {
              ElMessage.error(err.msg);
            });
      })
      .catch(() => {
        // 取消删除
      });
}
function toDtl(row: any, type: string, payWay: string ) {

  if(row.cAppTyp === 'E'){
    router.push({path: "/protocolManagement/enteringDtl", query: {param: JSON.stringify(row), type: 'EDR_APP_NEW_SCENE',isActive:'1'}});
  }else {
    router.push({path: "/protocolManagement/enteringDtl", query: {param: JSON.stringify(row), type: type, payWay: payWay}});
  }
}

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const tm = freeEditRef.value?.getFromValue().Tm;
      const param = {
        sence: "1",// 1 协议录入 2 协议审核 3 协议批改
        ...freeEditRef.value?.getFromValue(),
        ...tableRef.value?.getPartnerPage(flag),//获取分页数据
      };
      if(tm && tm.length > 1) {
        param.tInsrncBgnTm = tm[0]
        param.tInsrncEndTm = tm[1]
      }
      delete param.Tm
      cargoApi.queryEcargoList(param)
        .then((res: any) => {
          if (res && res.code === 200) {
            const pageData = res.data;
            if (pageData) {
              pageresult.list = []
              pageresult.list = pageData.data;
							pageresult.list = pageData.data.map((item) => ({
								...item,
								// 创建一个新字段合并两个值
								policyInfo: `${item.cEcAgrAppNo || ''}\n${item.cEcAgrNo || ''}`,
								InsurancePeriod: `${item.tInsrncBgnTm || ''}\n${item.tInsrncEndTm || ''}`,
							}))
              pageresult.total = pageData.total;
            }
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err: any) => {
          ElMessage.error(err.msg);
        });
    }
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
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
</style>
