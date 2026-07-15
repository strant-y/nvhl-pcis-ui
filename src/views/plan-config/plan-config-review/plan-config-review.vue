<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      :loading="loading" @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import {  ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { useRouter } from 'vue-router';

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
import { getActionLabel } from "@/utils/action-title";
import { useUserStore } from "@/store/modules/user";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const loading = ref(false);
const { getRules } = useValidator();

const router = useRouter()
const userStore = useUserStore();
const user = ref(userStore.user);
const policyService = new PolicyService();
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
        prop: "cUndrStatus",
        inputtype: "rtselect",
        title: "状态",
        loadData:[{value:'1',label:'待审核'},{value:'2',label:'已审核'}],
        // code: 'BAS_COMM_CODE_OUT_CDE',
        // codeParam: {'cParCde': 'OperUndrStatus'},
        clearable: true,
        rules: [getRules("required", {})],
        func: (val) => {
        }
      },
        {
            prop: "cKindNo",
            inputtype: "rtselect",
            title: "产品大类",
            itemWidth: 1,
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
            filterable: true,
            clearable: true,
            typeCode: "PROD_LIST_IN_GUIDE",
            codeParam: {
                cParCde: "999",
            },
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
    maxHeight: "400px",
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "处理",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row: any) => {
            if (
                row.cUndrStatus == "1"
            ) {
                return false;
            } else {
                return true;
            }
        },
        tableClick: (row) => {
            const param={id:row.cPkId}
            policyService.accept(param).then(result => {
                if (result['code'] === 200) {
                    if(result['data']['code']=='1'){
                        row['cGrpMrk']='0'
                        openEdit('handle', row)
                    }else{
                        ElMessage.error(result['data']['message']);
                    }
                } else {
                    ElMessage.error(result['msg']);
                }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "取消接收",
        type: "danger",
        size: "large",
        icon: "Unlock",
        hideBtns: (row: any) => {
            if (
                row.cUndrStatus == "1"
            ) {
                return false;
            } else {
                return true;
            }
        },
        tableClick: (row) => {
          handlerReject(row)
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
              return false;
          },
          tableClick: (row) => {
              row['cGrpMrk']='0'
              openEdit('view', row)
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
            title: "产品名称",
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




//处理
const openEdit = (type: string, row) => {
  const moduleName = type === "handle" || type === "view" ? "方案审核" : "方案配置";
  router.push({
    path: 'plan-info',
    query: {
      data: JSON.stringify({ type, rowData: row }),
      title: `${moduleName} - ${type === "handle" ? "处理" : getActionLabel(type)}`,
    }
  })
};

const handlerReject = (row) => {
    const param={id:row.cPkId}
    policyService.unAccept(param).then(result => {
        if (result['code'] === 200) {
            if(result['data']['code']=='1'){
                ElMessage.success(result['data']['message']);
            }else{
                ElMessage.error(result['data']['message']);
            }
        } else {
            ElMessage.error(result['msg']);
        }
    });
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

const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid) => {
    if(isValid) {
      refreshData(flag)
    } else {
      ElMessage.error("请填写必填项");
    }
  })
}

const refreshData = (reset = true) => {
  loading.value = true;
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  policyService.qryUndrPlanBaseList(param).then(result => {
    if (result['code'] === 200) {
      ElMessage.success('查询成功');
      const pageData = result['data'];
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = [];
        pageresult.list= pageData.result
      }
    } else {
      ElMessage.error(result['msg']);
    }
  }).finally(() => {
    loading.value = false;
  });
};

onMounted(() => {
  nextTick(() => {
    freeEditRef.value?.setValue("cUndrStatus", "1");
    handleQuery();
  });
});

function setFormItem(prop: string, config: any) {
    formconfig1.fromSchema?.forEach((item) => {
        if (item.prop === prop) {
            Object.assign(item, config);
        }
    });
}
</script>

<style scoped lang="scss">
.container {
  margin: 20px;
}
</style>
