<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
    >
      <template #column-cInquiryNo="{ row, column, index }">
        <div v-if="row.baseType === '询价'">
          <div class="policy-number-row">
            <span v-html="row.cAppNo"></span>
            <el-icon
                class="copy-icon"
                @click="copyText(row.cAppNo)"
                v-if="row.cAppNo"
            >
              <DocumentCopy />
            </el-icon>
          </div>
          <div class="policy-number-row">
            <span v-html="row.cInquiryNo" class="primmaryColor"></span>
            <el-icon class="copy-icon" @click="copyText(row.cInquiryNo)">
              <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
      <template #column-cPlyNo="{ row, column, index }">
        <div v-if="row.baseType === '投保'">
          <div class="policy-number-row">
            <span v-html="row.cAppNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
              <DocumentCopy />
            </el-icon>
          </div>
          <div class="policy-number-row">
            <span v-html="row.cPlyNo" class="primmaryColor"></span>
            <el-icon
                class="copy-icon"
                @click="copyText(row.cPlyNo)"
                v-if="row.cPlyNo"
            >
              <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
      <template #column-cEdrNo="{ row, column, index }">
        <div v-if="row.baseType === '批改'">
          <div class="policy-number-row">
            <span v-html="row.cAppNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
              <DocumentCopy />
            </el-icon>
          </div>
          <div class="policy-number-row">
            <span v-html="row.cEdrNo" class="primmaryColor"></span>
            <el-icon
                class="copy-icon"
                @click="copyText(row.cEdrNo)"
                v-if="row.cEdrNo"
            >
              <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
      <template #column-cTermNme="{ row, column, index }">
        <el-tooltip :content="row.cTermNme" placement="top">
          <span v-html="row.cTermNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cAppNme="{ row, column, index }">
        <el-tooltip :content="row.cAppNme" placement="top">
          <span v-html="row.cAppNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cInsuredNme="{ row, column, index }">
        <el-tooltip :content="row.cInsuredNme" placement="top">
          <span v-html="row.cInsuredNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-InsurancePeriod="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.tInsrncBgnTm" class="policy-period-row">
            <span v-html="row.tInsrncBgnTm"></span>
          </div>
          <div v-if="row.tInsrncEndTm" class="policy-period-row">
            <span v-html="row.tInsrncEndTm"></span>
          </div>
        </div>
      </template>
    </app-table>
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { useValidator } from "@/typings/useValidator";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import { getProdEnableList } from "@/api/prod";
import dayjs from "dayjs";
import { selectTask } from "../workbenches/service";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { withdraw } = NewUdrListService();
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import {POSITE_PAGE_TYPE_APP, POSITE_PAGE_TYPE_READ, POSITE_PAGE_TYPE_SAVE} from "@/views/pcis/support/composite.types";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const dzmodal = useDzModal();
const user = JSON.parse(sessionStorage.getItem("user") || "{}");
const { getRules } = useValidator();

const kindData: any = computed(() => {
  return prodTotalDatas.value.map((item: any) => ({
    label: item.code + " " + item.value,
    value: item.code,
    list: item.list,
  }));
});
const cProdData = ref([]);
const taskStatusOptions = [
  { label: "暂存", value: "1" },
  { label: "已提核", value: "2" },
  { label: "核保退回/撤回", value: "3" },
  { label: "已核待缴费", value: "4" },
  { label: "已出单", value: "5" },
  // { label: "已做失效操作", value: "6" },
  // { label: "已提交未接收", value: "7" },
  { label: "见费出单退回", value: "8" },
];
const inquiryTaskStatusOptions = [
  { label: "失效", value: "0" },
  { label: "暂存", value: "1" },
  { label: "已提交", value: "2" },
  { label: "询价退回/撤回", value: "3" },
  { label: "询价通过", value: "5" },
]
const baseTypeStatus = ref("询价");
const cAppStatusOptions = computed(() => {
  if (baseTypeStatus.value === "询价") {
    return inquiryTaskStatusOptions;
  } else {
    return taskStatusOptions;
  }
});
// 核保信息
const UndrOpnList = defineAsyncComponent(
    () => import("@/views/comprehensive-query/modal/UndrOpnList.vue")
);
// 任务痕迹
const TaskListVestige = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
// 反馈意见
const feedbackOpinion = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/common/feedbackOpinion.vue")
);

const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      title: "组合申请单查询",
      endBtnsPosition: "right",
      endBtns: [
        createFreeButtonBase({
          type: "primary",
          label: "查询",
          func: async () => {
            freeEditRef.value?.validate().then((isValid: boolean) => {
              if (isValid) {
                handleQuery();
              } else {
                ElMessage.error("请填写必填项");
              }
            });
          },
        }),
        createFreeButtonBase({
          label: "重置",
          icon: "RefreshRight",
          func: () => {
            setFormItem("cDptCde", {
              loadData: [
                {
                  label: user.companyId + user.companyCnm,
                  value: user.companyId,
                },
              ],
            });
            freeEditRef.value?.setFormValue({
              baseType: "组合单",
              cAppNme: "",
              cDptCde: user.companyId,
              cLoadSub: '1',
              cKindNo: null,
              cAppNo: "",
              cPlyNo: "",
              cInsuredNme: "",
              tAppTm: [
                dayjs().subtract(7, "day").format("YYYY-MM-DD 00:00:00"),
                dayjs().format("YYYY-MM-DD 23:59:59"),
              ],
              tIssueTm: [],
            });
            handleQuery();
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
          showExBtn: true,
          rules: [getRules("required", {})],
          btnItems: {
            icon: "Search",
            type: "primary",
            func: () => {
              dzmodal
                  .open(DepartmentTree, { type: "Issuer", data: {} })
                  .then((res: any) => {
                    if (res.body) {
                      const selectObj = res.body;
                      let obj = {
                        loadData: [
                          {
                            label: selectObj.name,
                            value: selectObj.id,
                          },
                        ],
                      };
                      console.log(freeEditRef.value);
                      freeEditRef.value?.setValue("cDptCde", selectObj.id);
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
        },
        {
          prop: "cLoadSub",
          inputtype: "rtradio",
          title: "包含下级机构",
          loadData: [
            { label: "是", value: '1' },
            { label: "否", value: '0' },
          ],
          defaultValue: '1',
        },
        {
          prop: "baseType",
          inputtype: "rtselect",
          title: "任务类型",
          clearable: true,
          defaultValue: "组合单",
          loadData: [
            { label: "组合单", value: "组合单" },
          ],
          func: (val: any) => {
            setFormItem("taskStatus", { loadData: taskStatusOptions });
            freeEditRef.value?.setValue("taskStatus", null);
            if (val === "组合单") {
              const cCombinationNo = freeEditRef.value?.getFromSchemaItem('cCombinationNo');
              // cCombinationNo.itemConfig.rules = [getRules("required", {})]
              console.log(cCombinationNo);
            }
          },
          rules: [getRules("required", {})],
        },
        {
          prop: "taskStatus",
          inputtype: "rtselect",
          title: "任务状态",
          clearable: true,
          loadData: taskStatusOptions,
        },
        {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "产品大类",
          itemWidth: 1,
          filterable: true,
          clearable: true,
          multiple: true,
          loadData: kindData,
          func: (val: any) => {
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
          itemWidth: 1,
          filterable: true,
          clearable: true,
          multiple: true,
          func: (val: any) => {
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
              setFormItem("cTermNo", { loadData: options });
              freeEditRef.value?.setValue("cTermNo", null);
            } else {
              setFormItem("cTermNo", { loadData: [] });
              freeEditRef.value?.setValue("cTermNo", null);
            }
          },
        },
        {
          prop: "cTermNo",
          inputtype: "rtselect",
          title: "条款",
          itemWidth: 1,
          filterable: true,
          clearable: true,
          multiple: true,
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
          prop: "cAppNme",
          inputtype: "rtinput",
          title: "投保人名称",
          clearable: true,
        },
        {
          prop: "cInsuredNme",
          inputtype: "rtinput",
          title: "被保人名称",
          clearable: true,
        },
        {
          prop: "cCombinationNo",
          inputtype: "rtinput",
          title: "组合单号",
          clearable: true,
        },
        {
          prop: "tAppTm",
          inputtype: "rtdatepicker",
          title: "申请日期",
          format: "YYYY-MM-DD",
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          clearable: true,
          type: "datetimerange",
          rules: [getRules("required", {})],
        },
        {
          prop: "tIssueTm",
          inputtype: "rtdatepicker",
          title: "签单日期",
          format: "YYYY-MM-DD",
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          clearable: true,
          type: "datetimerange",
        },
      ],
    })
);
const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
      tableBtnType: "btn",
      tableBtnWidth: 80,
      tableBtnPosition: "right",
      fixed: true,
      rowDbClickFun: (row:any) => {
        handleDblClick(row);
      },
      tableBtn: [
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "编辑",
          type: "success",
          size: "large",
          icon: "Edit",
          hideBtns: (row: any) => {
            if (
                (row.taskStatus == "1" ||
                    row.taskStatus == "3" ||
                    row.taskStatus == "8") &&
                row.cOprCde == user.opCde
            ) {
              return false;
            } else {
              return true;
            }
          },
          tableClick: async (row) => {
            skipPositePage({...row,...{ initType: POSITE_PAGE_TYPE_SAVE, pageTye: 'app' }});
          },
        }),
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "查看",
          type: "danger",
          size: "large",
          icon: "View",
          hideBtns: (row: any) => {
            if (row.taskStatus === "2" || row.taskStatus === "4" || row.taskStatus === "5") {
              return false;
            } else {
              return true;
            }
          },
          tableClick: (row) => {
            if (row) {
              skipPositePage({...row,...{ initType: POSITE_PAGE_TYPE_READ, pageTye: 'app'}});
            }
          },
        }),
      ],
      fromSchema: [
        {
          prop: "baseType",
          inputtype: "rtinput",
          title: "任务类型",
          lengthNum: 4,
        },
        {
          prop: "cCombinationNo",
          inputtype: "rtinput",
          title: "组合单号",
          lengthNum: 21,
        },
        {
          prop: "cInquiryNo",
          inputtype: "rtinput",
          title: "申请单号/询价单号",
          slotName: "cInquiryNo",
          lengthNum: 21,
          lengthIsNumber: true,
        },
        {
          prop: "cPlyNo",
          inputtype: "rtinput",
          title: "申请单号/保单号",
          slotName: "cPlyNo",
          lengthNum: 21,
          lengthIsNumber: true,
        },
        // {
        //   prop: "cEdrNo",
        //   inputtype: "rtselect",
        //   title: "批改申请单号/批单号",
        //   slotName: "cEdrNo",
        //   lengthNum: 21,
        //   lengthIsNumber: true,
        // },
        // {
        //   prop: "cRsnCdeText",
        //   inputtype: "rtinput",
        //   title: "批改原因",
        //   align: "left",
        //   lengthNum: 8,
        // },
        {
          prop: "cTermNme",
          inputtype: "rtinput",
          title: "条款名称",
          slotName: "cTermNme",
          align: "left",
          lengthNum: 13,
        },
        {
          prop: "tAppTm",
          inputtype: "rtinput",
          title: "申请日期",
          lengthNum: 17,
          lengthIsNumber: true,
        },
        {
          prop: "cAppNme",
          inputtype: "rtinput",
          title: "投保人名称",
          align: "left",
          lengthNum: 12,
          slotname: "cAppNme",
        },
        {
          prop: "cInsuredNme",
          inputtype: "rtinput",
          title: "被保人名称",
          align: "left",
          lengthNum: 12,
          slotname: "cInsuredNme",
        },
        {
          prop: "tInsrncBgnTm",
          inputtype: "rtinput",
          title: "保险期间",
          align: "left",
          lengthNum: 17,
          lengthIsNumber: true,
          slotName: "InsurancePeriod",
        },
        {
          prop: "nPrm",
          inputtype: "rtinput",
          title: "保费",
          align: "left",
          lengthNum: 12,
          lengthIsNumber: true,
          formatter: (val:any) => {
            return val?.toLocaleString()
          }
        },
        {
          prop: "nPrmVar",
          inputtype: "rtinput",
          title: "保费变化量",
          align: "left",
          lengthNum: 13,
          lengthIsNumber: true,
          formatter: (val:any) => {
            return val?.toLocaleString()
          }
        },
        {
          prop: "tUdrTm",
          inputtype: "rtinput",
          title: "核保日期",
          align: "left",
          lengthNum: 17,
          lengthIsNumber: true,
        },
        {
          prop: "cUdrCnm",
          inputtype: "rtinput",
          title: "核保人",
          align: "left",
          lengthNum: 4,
        },
        {
          prop: "cAppStatus",
          inputtype: "rtselect",
          title: "任务状态",
          loadData: cAppStatusOptions,
          lengthNum: 7,
          align: "left",
        },
        {
          prop: "cStatus",
          inputtype: "rtinput",
          title: "状态",
          lengthNum: 7,
          align: "left",
          isShow: false,
          formatter: (val: any) => {
            return val == '0' ? "失效":"有效"
          }
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

// 行双击查看详情
function handleDblClick(row:any) {
  skipPositePage({ ...row, ...{ pageType: POSITE_PAGE_TYPE_READ }});
}

const prodTotalDatas = ref([]);
onBeforeMount(() => {
  let params = {
    level: 2,
    type: 1,
    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
  }
  getProdEnableList(params).then((res: any) => {
    if (res.data && res.data.length > 0) {
      prodTotalDatas.value = res.data;
    }
  });
});

onMounted(() => {
  setFormItem("cDptCde", {
    loadData: [
      {
        label: user.companyId + user.companyCnm,
        value: user.companyId,
      },
    ],
  });
  const param:any = {
    cLoadSub: '1',
    cDptCde: user.companyId,
    tAppTm: [
      dayjs().subtract(7, "day").format("YYYY-MM-DD 00:00:00"),
      dayjs().format("YYYY-MM-DD 23:59:59"),
    ],
    baseType: "组合单"
  }
  if (sessionStorage.getItem("navToOrderProcessing")) {
    param['taskStatus'] = JSON.parse(
        sessionStorage.getItem("navToOrderProcessing") || "{}"
    )?.taskStatus
  }
  freeEditRef.value?.setFormValue(param);
  // handleQuery()
});
onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem("navToOrderProcessing") &&
  sessionStorage.removeItem("navToOrderProcessing");
});

// 校验表单查询
function handleQuery(flag = true) {
  freeEditRef.value?.validate().then((isValid: boolean) => {
    if (isValid) {
      const tAppTm = freeEditRef.value?.getValue("tAppTm")
      if(dayjs(tAppTm[1]).diff(dayjs(tAppTm[0]),'day') > 7) {
        ElMessage.error("申请日期查询范围不能超过7天！");
        return
      }
      refreshData(flag);
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

// 查询
function refreshData(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = {
    ...r,
    ...s,
    isCombination: '1',
  };
  if(param.tAppTm && param.tAppTm[1]) {
    param.tAppTm[1] = dayjs(param.tAppTm[1]).format("YYYY-MM-DD 23:59:59")
  }
  if(param.tIssueTm && param.tIssueTm[1]) {
    param.tIssueTm[1] = dayjs(param.tIssueTm[1]).format("YYYY-MM-DD 23:59:59")
  }
  baseTypeStatus.value = param.baseType;
  if(param.baseType) {
    param.baseType = [param.baseType];
  }
  formconfig1.endBtns[0].loading = true
  console.log('param', param)
  selectTask(param)
      .then((res: any) => {
        if (res.code === 200) {
          pageresult.list = res.data || [];
          pageresult.total = res.total || 0;
        } else {
          ElMessage.error({ message: res.msg, duration: 3000 });
        }
        formconfig1.endBtns[0].loading = false
      })
      .catch((err: any) => {
        ElMessage.error({ message: err.msg, duration: 3000 });
        formconfig1.endBtns[0].loading = false
      });
}

function formatTwoLine(text, num=7) {
  if (!text) return '';
  const len = text.length;
  const maxLen = num * 2 - 1;
  if (len <= maxLen) {
    return `${text.slice(0, num)}<br/>${text.slice(num)}`;
  }
  return `${text.slice(0, num)}<br/>${text.slice(num, maxLen)}…`;
}

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning("没有可复制的内容");
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success("复制成功");
        },
        () => {
          ElMessage.error("复制失败");
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand("copy");
      if (result) {
        ElMessage.success("复制成功");
      } else {
        ElMessage.error("复制失败");
      }
    } catch (err) {
      ElMessage.error("复制失败，请稍后再试");
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
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

/**
 * 跳转组合出单页面
 * @param row
 */
function skipPositePage(row: any) {
  policyService.getCombinationProdList({ // 先查询组合产品信息
    cCombinationNo: row.cCombinationNo
  }).then((res: any) => {
    console.log('getCombinationProdList-res', res);
    if(res.code === 200) {
      router.push({
        path: '/pcisapp/posite-page',
        query: {
          param: JSON.stringify({
            ...row,
            cProdDtlList: res.data.map((m: any) => {
              return {
                ...m,
                cKindNo: m.cProdNo.substring(0, 2)
              }
            }).sort((a: any, b: any) => a.cProdNo.localeCompare(b.cProdNo)),
            cCombinationType: row.cCombinationPlanNo ? '2' : '1',
            cProdList: res.data
                .map((m: any) => m.cProdNo)
                .sort((a: string, b: string) => a.localeCompare(b))
          })
        },
      });
    }else {
      ElMessage.error(res.msg);
    }
  })
}

onActivated(() => {
  console.log("keep-alive -> onActivated");
  // 缓存页面激活 更新查询列表 保存页码不变
  refreshData(false);
});
onDeactivated(() => {
  console.log("keep-alive -> onDeactivated");
});
</script>
<style lang="scss" scoped>
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

.primmaryColor {
  color: var(--el-color-primary);
  cursor: pointer;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
:deep(.el-table thead th) {
  font-weight: 600!important;
}
</style>
