<!--商品配置-选择方案列表-->
<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>


  <el-dialog v-model="dialogVisible" @update:visible="handleVisibleUpdate" width="90%" title="方案详情">
    <div>
      <planInfo :goodsData="rowData" :goodsType='"goods"' ></planInfo>
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
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
  saveCommodityPlanTermDisPlayNme,

} from "@/api/prod";
const dzmodal = useDzModal();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
// import { useRoute } from "vue-router";
import { useRouter, useRoute } from 'vue-router';

import { c } from "vite/dist/node/types.d-aGj9QkWt";
const planConfigurationEdit = defineAsyncComponent(() => import("./planConfigurationEdit.vue"));
const planInfo = defineAsyncComponent(() => import("@/views/plan-config/plan-info/plan-info.vue"));

const planInfoDialog = defineAsyncComponent(() => import("./planInfoDialog.vue"));
// const factorEdit = defineAsyncComponent(() => import("@/views/prodconfiguration/factorEdit.vue"));
const route = useRoute();
const router = useRouter()
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
const dialogVisible = ref(false);
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const rowData = ref(null);

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
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "cPlanCn",
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
          console.log('点这里 选择方案', tabref.getFromValue())
          

          console.log(tabref.getFromValue());
          if (!tabref.getFromValue()['cCommodityNo']) {
            ElMessage.error('产品编码为空,请保存后操作!');
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

          console.log(7777, row)
          rowData.value = row
          dialogVisible.value = true;

          // let ss = {
          //   ss: new Date().getTime(),
          //   cAccessType: "1",
          //   cCalcFormula: null,
          //   cCiMrk: null,
          //   cCriterionTimeUnit: null,
          //   cCrtCde: "cd0000001",
          //   cDptCde: null,
          //   cEnableStatus: "1",
          //   cGrpMrk: "0",
          //   cKindNme: "责任险",
          //   cKindNo: "04",
          //   cOldPlanNo: null,
          //   cOperId: null,
          //   cOperNme: null,
          //   cOrigin: null,
          //   cPkId: null,
          //   cPlanCn: "040001测试方案",
          //   cPlanEn: null,
          //   cPlanNo: "P25000034",
          //   cProdNme: "公众责任保险",
          //   cProdNo: "040001",
          //   cRationType: "0110",
          //   cRemark: null,
          //   cShowDpt: null,
          //   cSpecContent: null,
          //   cSpecMrk: null,
          //   cSpecNo: null,
          //   cSubmitId: null,
          //   cSubmitNme: null,
          //   cTyp: "1",
          //   cUndrDesc: null,
          //   cUndrStatus: "2",
          //   cUpdCde: null,
          //   nCriterionTime: 0,
          //   nLowInsureDays: 0,
          //   nTopInsureDays: 0,
          //   tBgnTm: "2025-05-26 00:00:00",
          //   tCrtTm: null,
          //   tEndTm: "2026-05-14 00:00:00",
          //   tUpdTm: null,
          //   _dataId: "c4bede5cda0c4cb9ae682d76e7f29638",
          // }


          
          // router.push({
          //   path: '/plan-config/plan-info',
          //   query: { data: JSON.stringify({ type:'view', rowData: ss }) }
          // })

          // router.push({
          //   path: "/goodsConfig/commodityEdit",
          //   query: {
          //     param: JSON.stringify({
          //       editType: "add",
          //     }),
          //   },
          // });
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
        hideBtns: (row: any) => { 
          if (param.editType === 'add' ||  param.editType === 'edit' || param.editType === 'copy' || !param.editType ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          ElMessageBox.confirm("该数据删除之后将无法恢复, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              delFunc(row);
            })
            .catch(() => {
              // 取消删除
            });
       },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
          hideBtns: (row: any) => {
            // &&    param.editType !== "edit" 
          if ( param.editType === 'add' ||  param.editType === 'edit' || param.editType === 'copy' || !param.editType) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          console.log(row);
          dzmodal.open(planConfigurationEdit, { type: "edit", data: row ,idxParam: idxParam }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "cIsMainProdPlan",
        inputtype: "rtselect",
        title: "是否主产品方案",
        loadData: [
          { value: '1', label: '主产品方案' },
          { value: "0",  label: "附属产品方案" },
        ]
      },
      {
        prop: "cDispNme",
        inputtype: "rtinput",
        title: "方案别名",
      },
      {
        prop: "cSaleName",
        inputtype: "rtinput",
        title: "销售名称",
      },
    ],
  })
);



const delFunc = (row: any) => {
  const chkParam = {
    cCommodityNo: row.cCommodityNo,
    cPlanNo: row.cPlanNo,
    checkType: 'deletePlan',
  };
  // 校验要删除的方案号是否配置有有效分保记录
  commodityBaseOperatorCheck(chkParam).then((res) => {
    let { code, msg, data } = res;
    if (code === 200) {
      if (data.data.length>0) { // 有 则中断
        ElMessage.error('该方案号存在有效的再保分保配置，不能进行无效操作，若需置为无效，请联系再保部对该方案号的分保配置做无效处理！');
        return;
      } else { // 无 可删除
        const param = {
          id: row.cPkId
        };
        deleteCommodityPlan(param).then((res2) => {
         
            if (res2.code === 200) {
              ElMessage.success('删除成功！');
              handleQuery();
              // this.refreshData();
            } else {
              ElMessage.error(res2.msg);
            }
        })
      }
    }else{
      ElMessage.error(msg)
    }
  });
}


// from表单查询
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

// table  查询
function getTableValue() {
  return pageresult.list
}

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const c = tabref.getFromValue()['cCommodityNo'];
  // param.cCommodityNo
  
  const params = Object.assign(s, r, { cCommodityNo: param.cCommodityNo? param.cCommodityNo: c });
  if (c == null &&  param.cCommodityNo ==null) {
    ElMessage.error("商品编号为空,请保存后操作!");
    return;
  } else {
    queryCommodityPlanList(params)
      .then((res) => {
        const { code, data, msg } = res;
       
        if (200 === code) {
          pageresult.list = data.result;
          pageresult.total = data.total;

          //           pageresult.total = pageData.total;
          // pageresult.list = pageData.result;


        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => { });
  }
}
const handleCancel = () => {
  // dialogVisible.value = false;
};


const handleVisibleUpdate = (value: boolean) => {
  dialogVisible.value = value
  // emit("update:visible", value);
};
onMounted(() => {
  console.log('path')
  if (param.editType!== 'add' && param.editType) {
    handleQuery()
  }



  //   setTimeout(() => {
  //   pageresult.list = [
  //     { cPlanNo: "P20003007", cSaleName: '张三', CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
  //     { cPlanNo: "P20003007", cSaleName: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
  //     { cPlanNo: "P20003007", cSaleName: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
  //     { cPlanNo: "P20003007", cSaleName: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
  //     { cPlanNo: "P20003007", cSaleName: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
  //   ]
  // }, 1000);

});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getTableValue,
  /** 暴露查询方法，供父组件在复制保存后刷新方案列表 */
  handleQuery,
});
</script>
