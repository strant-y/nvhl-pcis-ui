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
const codeListStore = codeListViewStore();
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
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user:any = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false,
  },
});
const cPard = ref(null);
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
            orgCde: user.value.companyId,
            CLoadSub: 1,
            cKindNo: null,
            cProdNo: null,
            CPlyNo: null
          });
          setFormItem("orgCde", {loadData: [{
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
        prop: "orgCde",
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
                        label: `${selectObj.id}${selectObj.name}`,
                      	value: selectObj.id,
                      },
                    ],
                  };
                  freeEditRef.value?.setValue(
                      "orgCde",
                      selectObj.id
                  );
                  setFormItem("orgCde", obj);
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
        prop: "CLoadSub",
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
        max: 7,
        min: 0,
        defaultValue: 3,
        title: "保单到期剩余天数",
        rules: [getRules("required", {})],
        clearable: true,
        // func:(val)=>{
        //   if(val <= 8){
        //     console.log("9999999999",val)
        //   }
        // }
      },
      // {
      //   prop: "CKindNo",
      //   inputtype: "rtselect",
      //   title: "产品大类",
      //   typeCode: "KIND_LIST_GRT",
      //   params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
      //   clearable: true,
      // },
      // {
      //   prop: "CProdNo",
      //   inputtype: "rtselect",
      //   title: "条款",
      //   typeCode: "PROD_LIST_GRT",
      //   params: { cParCde:'', cOperId: user.value.opCde, cDptCde: user.value.companyId },
      //   clearable: true,
      // },
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
          cPard.value = val;
          codeListStore
            .queryCodeList({
                codeListName: "TERM_LIST_IN_GUIDE_NEW",
                codeListParam:{
                cParCde: cPard.value,
                cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
            },
            })
            .then((res) => {
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
        // typeCode: "TERM_LIST_IN_GUIDE_NEW",
        // codeParam: {
        //   cParCde: cPard.value,
        //   cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
        //   cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        // },
        func: (val) => {},
      },
      {
        prop: "CPlyNo",
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
    tableBtnWidth: 90,
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
        slotName: "cPlyNo"
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款",
      },
      {
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "保单到期剩余天数",
      },
    ],
  })
);

onMounted(async () => {
	freeEditRef.value?.setFormValue({
		NExpirationDays: "3",
		orgCde: user.value.companyId,
		CLoadSub: 1,
		cKindNo: null,
		cProdNo: null,
		CPlyNo: null
	});
	setFormItem("orgCde", {loadData: [{
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
    pageresult.list = [{}, {}];
    pageresult.total = 2;
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
  gap: 4px;
}

.policy-number-row {
  display: flex;
  align-items: center;
}

.policy-number-row span {
  flex: 1;
}
</style>

