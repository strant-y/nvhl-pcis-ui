<!-- 保单到期查询 -->
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
      <template #column-cPlyNo="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.cPlyNo" class="policy-number-row">
            <span>{{ row.cPlyNo }}</span>
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
      <template #column-cTermNme="{ row, column, index }">
        <el-tooltip :content="row.cTermNme" placement="top">
          <span v-html="row.cTermNme || ''" class="twoLine"></span>
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
const router = useRouter();
const route = useRoute();
import { ref } from "vue";
import { codeListViewStore } from "@/store";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { DocumentCopy } from "@element-plus/icons-vue";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { SCENE_PLY_APP_READ } from "@/constants/tab-constants";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user:any = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);

let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码

const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false,
  },
});
const cPard = ref(null);

function extractCode(str:string) {
  // 匹配 "P+数字" 或 "纯数字"
  const pattern = /^(P\d+|\d+)/;
  return str.match(pattern)?.[0] || "";
}
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
            NExpirationDays: "3",
            cDptCde: user.value.companyId,
            cLoadSub: 1,
            cKindNo: null,
            cProdNo: null,
            cPlyNo: null
          });
          setFormItem("cDptCde", {loadData: [{
            label: user.value.companyId+user.value.companyCnm,
            value: user.value.companyId,
          }]});
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "核保机构",
        btnWidth: 10,
        itemWidth: 2,
        rules: [{ type: "required" }],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(DepartmentTree, { type: "Issuer", data: {} })
              .then((res:any) => {
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
                  freeEditRef.value?.setValue(
                      "cDptCde",
                      selectObj.id
                  );
                  setFormItem("cDptCde", obj);
                }
              });
          },
        },
        loadData: [
          {
            label: user.value.companyCnm,
            value: user.value.companyId,
          }
        ]
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "包含下级机构",
        showKey: [5],
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "NExpirationDays",
        inputtype: "rtnumber",
        step: 1,
        // max: 7,
        min: 0,
        defaultValue: 3,
        title: "保单到期剩余天数",
        rules: [getRules("required", {})],
        clearable: true,
        func:(val:any)=>{
          if(val > 7){
            ElMessage.warning("保单到期剩余天数不能大于7天");
            setValue("NExpirationDays", 7);
          }
        }
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
        func: (val) => {
            setValue("cProdNo","")
            cTermNo = "";      // 重置条款编码
            cPard.value = val;
            formconfig1.fromSchema?.forEach((item) => {
                if (
                    item.prop === "CEmployeeName" ||
                    item.prop === "CIdentificationNumber" ||
                    item.prop === "CPlateNo" ||
                    item.prop === "CEngineNo" ||
                    item.prop === "CIndustryType" ||
                    item.prop === "CProjectName" ||
                    item.prop === "CDetailedAddress" ||
                    item.prop === "CProjectType" ||
                    item.prop === "cPrjCtgTyp" ||
                    item.prop === "cPrjCtgMidTyp" ||
                    item.prop === "cPrjCtgSubTyp"
                ) {
                    item.hidden = true;
                }
            });
            codeListStore
            .queryCodeList({
                codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                codeListParam:{
                cParCde: cPard.value,
                cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
            },
            })
            .then((res) => {
                cTermNoList.value = res;
                setFormItem("cProdNo", {
                    loadData: res,
                });
            });
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "条款",
        itemWidth: 1,
        rules: [{ type: "required" }],
        filterable: true,
        clearable: true,
        func: (val:any) => {
        if(val){
                if(cTermNoList.value.length>0){
                    cTermNoList.value.forEach((ele) => {
                        if(ele['value']  === val){
                            cTermNo =extractCode(ele['label'])
                        }
                    });
                }  
        } else {
            cTermNo = "";
        }
        formconfig1.fromSchema?.forEach((item) => {
                if (
                    item.prop === "CEmployeeName" ||
                    item.prop === "CIdentificationNumber" ||
                    item.prop === "CPlateNo" ||
                    item.prop === "CEngineNo" ||
                    item.prop === "CIndustryType" ||
                    item.prop === "CProjectName" ||
                    item.prop === "CDetailedAddress" ||
                    item.prop === "CProjectType" ||
                    item.prop === "cPrjCtgTyp" ||
                    item.prop === "cPrjCtgMidTyp" ||
                    item.prop === "cPrjCtgSubTyp"
                ) {
                    item.hidden = true;
                }
            });
        },
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
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
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 80,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          showDetails(row);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        slotName: "cPlyNo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
        slotName: "cDptCnm",
        align: 'left',
        // lengthNum: 12,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款",
        slotName: "cTermNme",
        align: 'left',
        // lengthNum: 13,
      },
      {
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "保单到期剩余天数",
        lengthNum: 8,
      },
    ],
  })
);

onMounted(async () => {
	freeEditRef.value?.setFormValue({
		NExpirationDays: "3",
		cDptCde: user.value.companyId,
		cLoadSub: 1,
		cKindNo: null,
		cProdNo: null,
		cPlyNo: null
	});
	setFormItem("cDptCde", {loadData: [{
		label: user.value.companyId + user.value.companyCnm,
		value: user.value.companyId,
	}]});
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

watch(
  () => props.refreshData,
  (n, o) => {
    // 自动刷新列表获取数据
    // pageresult.list = [{}, {}];
    // pageresult.total = 2;
    // 上面代码是仅用于本地调试
    if (n) {
      console.log(n, "保单到期查询");
      // handleQuery(true);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

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
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(
        {
          CurrentUser: user.value.opCde,
          CurrentUserOrg: user.value.companyId,
        },
        s,
        r
      );
      param["cTermNo"] = cTermNo;        // 条款编码
      delete param.cProdNo;
      pcisQueryService
        .getExpirationPolicyList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data.result;
            pageresult.total = data.total;
          }
        })
        .finally(() => {});
    }
  });
}

// 打开详情
function showDetails(row: any) {
  // const en = JSON.stringify({
  //   scene: SCENE_PLY_APP_READ,
  //   CAppNo: row.cAppNo,
  //   CCiMrk: row.cCiMrk,
  //   CProdNo: row.cProdNo,
  // });
  // router.push({
  //   path: '/index/pcis-query/plyDetails',
  //   query: { data: en }
  // });
  const data = row;
  router.push({
    path: "/pcisapp/pcisappView",
    query: {
      param: JSON.stringify({ ...data, ...{ pageType: "edit" } }),
    },
  });
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
function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
defineExpose({
  setValue,
  getValue,
});
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
  line-height: 16px;
}

.policy-number-row span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
</style>

