<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      :loading="loading" @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const loading = ref(false);
const router = useRouter()
const policyService = new PolicyService();
const { getRules } = useValidator();
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2
    },
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
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "产品大类",
          itemWidth: 1,
          rules: [getRules("required", {})],
          typeCode: "KIND_LIST_GRT",
          child: "cProdNo",
          codeParam: {
              cOperId: user.value?.opCde,
              cDptCde: user.value?.companyId,
          },
          filterable: true,
          clearable: true,
          func: (row: any) => {
              // 更新产品下拉选
              setFormItem("cProdNo", {
                  codeParam: {
                      cParCde: row,
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
          title: "产品名称",
          itemWidth: 1,
          rules: [getRules("required", {})],
          filterable: true,
          clearable: true,
          typeCode: "PROD_LIST_IN_GUIDE",
          codeParam: {
              cParCde: "999",
          },
      },
      {
          prop: "cGrpMrk",
          inputtype: "rtselect",
          rules: [getRules("required", {})],
          title: "是否团单",
          loadData: [
              { value: "0", label: "否" },
              { value: "1", label: "是" },
              { value: "2", label: "家庭单" },
          ],
      },
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        clearable: true,
      },
      {
        prop: "cTplNme",
        inputtype: "rtinput",
        title: "方案名称",
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
    maxHeight: "420px",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: function () {
            freeEditRef.value?.validate().then((isValid) => {
                if(isValid) {
                    const param = freeEditRef.value?.getFromValue(); //获取表单数据
                    param.pageType='planConfigAdd'
                    openEdit('planConfigAdd', param)
                } else {
                    ElMessage.error("请填写必填项");
                }
            })
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    // editList: ["PrdProdPlan.CEnableStatus"],
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
                row.cUndrStatus == "0"
            ) {
                return false;
            } else {
                return true;
            }
        },
        tableClick: (row) => {
          row['cGrpMrk']='0'
          openEdit('planConfigupdate', row)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        hideBtns: (row: any) => {
            if (
                row.cUndrStatus == "0"
            ) {
                return false;
            } else {
                return true;
            }
        },
        tableClick: (row) => {
          showDetails(row)
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
              if (
                  row.cUndrStatus != "0"
              ) {
                  return false;
              } else {
                  return true;
              }
          },
          tableClick: (row) => {
              row['cGrpMrk']='0'
              openEdit('planConfigview', row)
          },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNme",
        inputtype: 'rtinput',
        title: "产品大类",
      },
      {
        prop: "cProdNme",
        inputtype: 'rtinput',
        title: "条款",
      },
      {
        prop: "cPlanNo",
        inputtype: 'rtinput',
        title: "方案编号",
      },
      {
        prop: "cPlanCn",
        inputtype: 'rtinput',
        title: "方案名称",
      },
      {
        prop: "cUndrStatus",
        inputtype: 'rtselect',
        title: "审核状态",
        loadData:[{value:'0',label:'暂存'},{value:'1',label:'待审核'},{value:'2',label:'已审核'}]
      },
      {
        prop: "cAccessType",
        inputtype: 'rtselect',
        title: "访问类型",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: {'cParCde': 'CAccessType'},
      },
        {
            prop: "cEnableStatus",
            inputtype: 'rtselect',
            title: "启用标识",
            loadData:[{value:'0',label:'禁用'},{value:'1',label:'启用'}]
        },
        // {
        //     prop: "PrdProdPlan.CEnableStatus",
        //     inputtype: "rtswitch",
        //     title: "启用标识",
        //     keymap: {
        //         y: "1",
        //         n: "0",
        //     },
        //     activeText: "启用",
        //     inactiveText: "禁用",
        //     inlinePrompt: true,
        //     func: async (val, row) => {
        //         // await changeStatus({
        //         //     cProdNo: row.cProdNo,
        //         //     cStatus: val,
        //         // }).then((res) => {
        //         //     if (res.code === 200) {
        //         //         handleQuery();
        //         //     }
        //         // });
        //     },
        // },
      {
        prop: "cRationType",
        inputtype: 'rtselect',
        title: "方案类型",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: {'cParCde': 'CRationType'},
      },
    ],
  })
);

//新增and编辑
const openEdit = (type: string, row) => {
  router.push({
    // path: '/plan-config/plan-info',
    path:'plan-info',
    query: { data: JSON.stringify({ type, rowData: row }) }
  })

      // router.push({
      //           path: "/pcisapp/myPage",
      //           // query: {
      //           //   // param: JSON.stringify({ ...data, ...{ queryTyp: "orig" } }),
      //           //   title: "询价单录入" // 直接设置新标题
      //           // },
             
      //         });
};

//查看详情
const showDetails = (row) => {
  //跳转到详情页
}
//转小写
const firstCharUpper = (str: string) => {
  return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}
/*
* 将后台传入前台的对象中的每个属性的首字母转大写,并拼入模块名
*/
const dtofirstCharUpper = (map: any, key?: any) => {
  const data = {};
  if (key) {
    for (const k in map) {
      if (map[k] != null) {
        data[key + '.' + firstCharUpper(k)] = map[k];
      }
    }
  } else {
    for (const k in map) {
      if (map[k] != null) {
        data[firstCharUpper(k)] = map[k];
      }
    }
  }
  return data;
}

const getSafeMessage = (msg: unknown, fallback = "系统出错") => {
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  if (msg instanceof Error && msg.message) {
    return msg.message;
  }
  if (msg && typeof msg === "object") {
    try {
      return JSON.stringify(msg);
    } catch (error) {
      return fallback;
    }
  }
  return fallback;
}

const handleQuery = (flag) => {
  refreshData(flag)
}

const refreshData = (reset = false) => {
  loading.value = true;
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  policyService.searchPlan(param).then(result => {
    if (result['code'] === 200) {
      ElMessage.success('查询成功');
      const pageData = result['data'];
      const resultList = Array.isArray(pageData?.data)
        ? pageData.data
        : Array.isArray(pageData?.result)
          ? pageData.result
          : [];
      pageresult.total = Number(pageData?.total) || resultList.length || 0;
      pageresult.list = resultList;
    } else {
      pageresult.total = 0;
      pageresult.list = [];
      ElMessage.error(getSafeMessage(result['msg']));
    }
  }).catch((error) => {
    pageresult.total = 0;
    pageresult.list = [];
    console.error("searchPlan error:", error);
  }).finally(() => {
    loading.value = false;
  });
};
function setFormItem(prop: string, config: any) {
    formconfig1.fromSchema?.forEach((item) => {
        if (item.prop === prop) {
            Object.assign(item, config);
        }
    });
}
onMounted(() => {
  nextTick(() => {
    handleQuery();
  });
});
</script>

<style scoped lang="scss">
.container {
  margin: 20px;
}
</style>
