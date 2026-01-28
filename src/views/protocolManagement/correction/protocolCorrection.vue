<!-- ECargo 协议批改 -->
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { codeListViewStore } from "@/store";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
import cargoApi from '@/api/cargo'
import {PcisEdrQueryService} from "@/views/edr-qry-endorse-list/service/pcis-edr-query-service";
import { DocumentCopy } from "@element-plus/icons-vue";

const codeListStore = codeListViewStore();

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
const queryLoading = ref(false); // 控制按钮 loading 图标
const departmentTree = defineAsyncComponent(() => import("@/pcis/prodRef/commodityRef/DepartmentTree.vue"))
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
              Tm: [
                moment(new Date(Date.now() - 5 * 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 00:00:00"),
								moment(new Date(Date.now() + 1000 * 60 * 60 * 24)).format("YYYY-MM-DD 23:59:59"),
              ]
            });
            handleQuery(true);
            freeEditRef.value.setValue("cDptCde", JSON.parse(sessionStorage.getItem("user")).companyId);
            setFormItem("cDptCde", {
              loadData: [
                {
                  label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
                  value: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
              ],
            });
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
                          label: `${selectObj.id}${selectObj.name}`,
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
const pcisEdrQueryService = new PcisEdrQueryService();
const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
      showSelection: false,
      editFlag: true,
      editList: ["id", "iddetail"],
      tableBtn: [
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "查看",
          type: "danger",
          size: "large",
          icon: "View",
          tableClick: (row) => {
            console.log(row);
            toDtl({ ...row, sence:'policy' }, 'view');
          },
        }),
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "编辑",
          type: "success",
          size: "large",
          icon: "Edit",
          tableClick: (row) => {
            console.log(row);
            let cEdrType:string = ''
            const rsnTyp = row['id'] && row['id'].length > 0 ? row['id'][0]?.split('-')[0] : null;
              if(!row['id'] || row['id'].length < 2) {
                ElMessage.warning("请选择批改原因");
                return;
              }
            const param = {
              cEcAgrAppNo: row.cEcAgrAppNo,
              edrType: rsnTyp,
              prodNo: '029900',
              edrRsnCde: row['id'][1],
            };
            // let en:any
            // if ("2" === rsnTyp) {
            //   //注销
            //   en = {
            //     ...row,
            //     cRsnCde: row['id'][1],
            //     cEdrType: '2',
            //     pageType: "EDR_APP_NEW_SCENE",
            //   }
            //   //预留跳转路径
            //   cEdrType = '2'
            // } else if ("3" === rsnTyp) {
            //   //退保
            //   en = {
            //     ...row,
            //     cRsnCde: row['id'][1],
            //     cEdrType: '3',
            //     pageType: "EDR_APP_NEW_SCENE",
            //   }
            //   cEdrType = '3'
            // } else if ("1" === rsnTyp) {
            //   //一般批改
            //   en = {
            //     ...row,
            //     cRsnCde: row['id'][1],
            //     cEdrType: '1',
            //     pageType: "EDR_APP_NEW_SCENE",
            //   }
            //   cEdrType = '1'
            // }
            // toDtl(en, 'EDR_APP_NEW_SCENE',cEdrType);
            pcisEdrQueryService.validEndorsexy(param).then(
                async (result) => {
                  if (200 !== result["code"]) {
                    ElMessage.error(result["msg"]);
                  } else {
                    if (result["data"]) {
                      let en:any
                      if ("2" === rsnTyp) {
                        //注销
                        en = {
                          ...row,
                          sence:'edr',
                          cRsnCde: row['id'][1],
                          cEdrType: '2',
                          pageType: "EDR_APP_NEW_SCENE",
                        }
                        //预留跳转路径
                        cEdrType = '2'
                      } else if ("3" === rsnTyp) {
                        //退保
                        en = {
                          ...row,
                          sence:'edr',
                          cRsnCde: row['id'][1],
                          cEdrType: '3',
                          pageType: "EDR_APP_NEW_SCENE",
                        }
                        cEdrType = '3'
                      } else if ("1" === rsnTyp) {
                        //一般批改
                        en = {
                          ...row,
                          sence:'edr',
                          cRsnCde: row['id'][1],
                          cEdrType: '1',
                          pageType: "EDR_APP_NEW_SCENE",
                        }
                        cEdrType = '1'
                      }
                      toDtl(en, 'EDR_APP_NEW_SCENE',cEdrType);
                    } else {
                      ElMessage.error(result["msg"]);
                    }
                  }
                },
                (error) => {
                  console.log("err: ", error);
                  ElMessage.error("连接失败！" + error);
                }
            );
          },
        }),
      ],
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
          title: "协议号",
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
        {
          prop: "cPlySts",
          inputtype: "rtselect",
          title: "是否有效",
          lengthNum: 4,
          loadData: [
            { label: '有效', value: 'I' },
            { label: '终止', value: 'T' },
            { label: '满期', value: 'M' },
          ]
        },
        {
          prop: "nPrm",
          inputtype: "rtinput",
          title: "缴费余额",
          lengthNum: 12,
          lengthIsNumber: true,
					formatter: (val: any) => {
							return val.toLocaleString()
					}
        },
        {
          prop: "id",
          inputtype: "rtcascader",
          title: "批改原因",
          lengthNum: 16,
          typeCode: 'EDR_RSN_LIST_NEW',
          checkStrictly: false,
          func: (val, row, codeListMap) => {
            if(val && val[1] && codeListMap['EDR_RSN_LIST_NEW-1-' + val[0]]) {
              row["iddetail"] = codeListMap['EDR_RSN_LIST_NEW-1-' + val[0]].find((item:any) => item.value === val[1]);
            }
          },
        },
      ],
    })
);

onMounted(() => {
	freeEditRef.value?.setFormValue({
		cDptCde: "0200000000000",
		cLoadSub: 1,
		cKindNo: null,
		cTermNo: null,
		cEcAgrAppNo: "",
		cEcAgrNo: "",
		cAppNme: "",
		insuredNme: "",
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

function toDtl(row: any, type: string,cEdrType = '') {
  router.push({path: "/protocolManagement/enteringDtl", query: {param: JSON.stringify(row), type,cEdrType}});
}


// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {};
function setRowFieldProp(rowId: string, field: string, prop: string, value: any) {
  return tableRef.value?.setRowFieldProp(rowId, field, prop, value);
}
/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
			queryLoading.value = true;
      const tm = freeEditRef.value?.getFromValue().Tm;
      const param = {
        sence: "3",// 1 协议录入 2 协议审核 3 协议批改
        ...freeEditRef.value?.getFromValue(),
        ...tableRef.value?.getPartnerPage(flag),//获取分页数据
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
            nextTick(()=>{
              tableRef.value?.getTableValues().forEach((item:any ) =>{
                if(item.cEdrFlag === 'YY'){
                  setRowFieldProp(
                      item['_dataId'],
                      "id",
                      "typeCode",
                      'EDR_RSN_LIST_YY',
                  );
                  setRowFieldProp(
                      item['_dataId'],
                      "id",
                      "loadData",
                      [
                        { label: '一般批改', value: `1-${'029900'.slice(0,2)}` },
                        { label: '注销', value: `2-${'029900'.slice(0,2)}` },
                        { label: '退保', value: `3-${'029900'.slice(0,2)}` },
                      ],
                  );
                }else {
                  setRowFieldProp(
                      item['_dataId'],
                      "id",
                      "typeCode",
                      'EDR_RSN_LIST_AY',
                  );
                  setRowFieldProp(
                      item['_dataId'],
                      "id",
                      "loadData",
                      [
                        { label: '一般批改', value: `1-${'029900'.slice(0,2)}` },
                        { label: '注销', value: `2-${'029900'.slice(0,2)}` }
                      ],
                  );
                }
               })
            })
          }
        } else {
          ElMessage.error(res.msg);
        }
      }).catch((err: any) => {
				queryLoading.value = false;
        ElMessage.error(err.msg);
      });
    }

    // pageresult.list = [
    //   {
    //     cAgreementNo: '1234567890',
    //     cClientNo: '222',
    //     cClientNme: '张三',
    //     cDptCde: '0200000000000',
    //     tEffectTm: '2025-01-01 00:00:00',
    //     tExpireTm: '2026-01-01 00:00:00',
    //     cStatus: '正常',
    //     nPayBalance: 100,
    //   },
    //   {
    //     cAgreementNo: '1234567890',
    //     cClientNo: '222',
    //     cClientNme: '张三',
    //     cDptCde: '0200000000000',
    //     tEffectTm: '2025-01-01 00:00:00',
    //     tExpireTm: '2026-01-01 00:00:00',
    //     cStatus: '正常',
    //     nPayBalance: 100,
    //   },
    // ]
    // pageresult.total = 2;
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

