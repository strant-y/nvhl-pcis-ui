<!--商品配置-选择方案列表-->
<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>


  <el-dialog v-model="dialogVisible" @update:visible="handleVisibleUpdate">
    <div>123123
      <planInfo></planInfo>


    </div>

  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
const planConfigurationAdd = defineAsyncComponent(
  () => import("./planConfigurationAdd.vue")
);
import {
  getPlanBasePage,
  saveCvrgRiskRel,
  queryCommodityPlanList,
  commodityBaseOperatorCheck,
  deleteCommodityPlan,
  saveCommodityPlanCvrgDisPlayNme,

} from "@/api/prod";
const dzmodal = useDzModal();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
import { useRoute } from "vue-router";

import { c } from "vite/dist/node/types.d-aGj9QkWt";
const planConfigurationEdit = defineAsyncComponent(() => import("./planConfigurationEdit.vue"));
const planInfo = defineAsyncComponent(() => import("@/views/plan-config/plan-info/plan-info.vue"));

const planInfoDialog = defineAsyncComponent(() => import("./planInfoDialog.vue"));
// const factorEdit = defineAsyncComponent(() => import("@/views/prodconfiguration/factorEdit.vue"));
const route = useRoute();
const router = useRouter()
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const dialogVisible = ref(false);
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "选择方案",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => {
          handleQuery();
          // dialogVisible.value= true;


        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
        func: () => { },
      }),
    ],
    fromSchema: [
      {
        prop: "CPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "CPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 5,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "add-planConf",
        label: "选择方案",
        type: "success",
        func: function () {
          console.log('点这里 选择方案',)

          console.log(tabref.getFromValue());
          if (!tabref.getFromValue()['cCommodityNo']) {
            ElMessage.error('产品代码为空,请保存后操作!');
            return false;
          }
          dzmodal
            .open(planConfigurationAdd, { type: "add", data: tabref.getFromValue() })
            .then((res) => {

              // handleQuery();
              console.log('保存成功---', res)
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          console.log(row);
          let ss = {
            cAccessType: "1",
            cCalcFormula: null,
            cCiMrk: null,
            cCriterionTimeUnit: null,
            cCrtCde: "cd0000001",
            cDptCde: null,
            cEnableStatus: "1",
            cGrpMrk: "0",
            cKindNme: "责任险",
            cKindNo: "04",
            cOldPlanNo: null,
            cOperId: null,
            cOperNme: null,
            cOrigin: null,
            cPkId: null,
            cPlanCn: "040001测试方案",
            cPlanEn: null,
            cPlanNo: "P25000034",
            cProdNme: "公众责任保险",
            cProdNo: "040001",
            cRationType: "0110",
            cRemark: null,
            cShowDpt: null,
            cSpecContent: null,
            cSpecMrk: null,
            cSpecNo: null,
            cSubmitId: null,
            cSubmitNme: null,
            cTyp: "1",
            cUndrDesc: null,
            cUndrStatus: "2",
            cUpdCde: null,
            nCriterionTime: 0,
            nLowInsureDays: 0,
            nTopInsureDays: 0,
            tBgnTm: "2025-05-26 00:00:00",
            tCrtTm: null,
            tEndTm: "2026-05-14 00:00:00",
            tUpdTm: null,
            _dataId: "c4bede5cda0c4cb9ae682d76e7f29638",
          }
          router.push({
            // path: '/plan-config/plan-info',
            // path: '@/views/plan-config/plan-info/plan-info.vue',
            name: 'plan-info',
            query: { data: JSON.stringify({ type: 'view', rowData: ss }) }
          })
          // dzmodal.open(planInfoDialog, { type: "view", data: row }).then((res) => {
          //   if (res.type === "ok") {
          //     handleQuery();
          //   }
          // });
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          ElMessageBox.confirm("该数据删除之后将无法恢复, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              delFunc(row);
              //   unAssociationTerm(row)
              //     .then((res) => {
              //       const { code, data, msg } = res;
              //       if (200 === code) {
              //         ElMessage.success("删除成功");
              //         handleQuery();
              //       } else {
              //         ElMessage.error(msg);
              //       }
              //     })
              //     .finally(() => {});
            })
            .catch(() => {
              // 取消删除
            });


          // delRiskRel(row)
          //   .then((res) => {
          //     const { code, data, msg } = res;
          //     if (200 === code) {
          //       ElMessage.success("删除成功");
          //       handleQuery();
          //     } else {
          //       ElMessage.error(msg);
          //     }
          //   })
          //   .finally(() => { });
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
          dzmodal.open(planConfigurationEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "CPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "CIsMainProdPlan",
        inputtype: "rtinput",
        title: "是否主产品方案",
      },
      {
        prop: "CDispNme",
        inputtype: "rtinput",
        title: "方案别名",
      },
      {
        prop: "   ",
        inputtype: "rtinput",
        title: "销售名称",
      },
    ],
  })
);



const delFunc = (row: any) => {
  const chkParam = {
    CCommodityNo: row.cCommodityNo,
    CPlanNo: row.cPlanNo,
    checkType: 'deletePlan',
  };
  // 校验要删除的方案号是否配置有有效分保记录
  commodityBaseOperatorCheck(chkParam).then((res) => {
    let { code, msg, data } = res;
    if (code === 200) {
      if (data) { // 有 则中断
        ElMessage.error('该方案号存在有效的再保分保配置，不能进行无效操作，若需置为无效，请联系再保部对该方案号的分保配置做无效处理！');
        return;
      } else { // 无 可删除
        const param = {
          id: id
        };
        const saveProdData = this.commodityService.deleteCommodityPlan(param);
        saveProdData.subscribe((res: any) => {
          if (null != res && null != res['code']) {
            if (code === 200) {
              ElMessage.success(msg);
              // this.refreshData();
            } else {
              ElMessage.error(msg);
            }
          }
        });
      }
    }
  });
}

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}
/** 查询 */
function handleQuery() {
  console.log("查询条件:", sessionStorage.getItem("user"));
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const c = tabref.getFromValue().cCommodityNo;
  const param = Object.assign(s, r, { cCommodityNo: c });
  if (c == !null) {
    ElMessage.error("商品编号为空,请保存后操作!");
    return;
  } else {
    queryCommodityPlanList(param)
      .then((res) => {
        const { code, data, msg } = res;
        console.log(data, '1212')
        if (200 === code) {
          pageresult.list = data;
          pageresult.total = data.length;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => { });
  }
}
const handleCancel = () => {
  console.log('1212')
  // dialogVisible.value = false;
};


const handleVisibleUpdate = (value: boolean) => {
  dialogVisible.value = value
  // emit("update:visible", value);
};
onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
  }

  setTimeout(() => {
    pageresult.list = [
      { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
      { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
      { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
      { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
      { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
    ]
  }, 1000);
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
