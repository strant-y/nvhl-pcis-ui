<!-- 数据处理开关 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { dealTerminationData, deleteFactorBykey, getBasicKindList, qryTerminationDataList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromUi:{
      cols:2,
    },
    title: "数据处理开关",
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
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "cOperType",
        inputtype: "rtselect",
        title: "业务申请类型",
        clearable: true,
        rules: [getRules("required", {})],
        loadData: [
          {value: 'TerEdr', label: '终保后批改'},
          {value: 'SurBck', label: '一般退保倒签'},
          {value: 'CanBck', label: '注销倒签'},
          {value: 'EdrUpdPrm', label: '批改时手动修改保费'},
          {value: 'EdrBckBgn', label: '批改时允许倒签批改生效时间'},
          {value: 'SurUpdPrm', label: '一般退保手动修改退保费'},
          {value: 'EdrUpdRate', label: '修改批减手续费比例'}
        ],
      },
      {
        prop: "cTitleOa",
        inputtype: "rtinput",
        title: "OA标题",
        rules: [getRules("required", {})],
        clearable: true,
      },
      // {
      //   prop: "tOperTm",
      //   inputtype: "rtdatepicker",
      //   title: "业务申请时间",
      //   clearable: true,
      //   type: "daterange",
      // },
      {
        prop: "cOperCde",
        inputtype: "rtinput",
        title: "业务申请人",
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
    editList: ["cAppTyp"],
    showSelection:true,
    tableBtnPosition:'center',
    endBtns: [
      createFreeButtonBase({
        id: "score",
        label: "选择全部打开",
        type: "primary",
        func: function () {
           openAll();
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "选择全部关闭",
        type: "primary",
        func: function () {
           closeAll();
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险日期",
        minWidth: 180,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
        minWidth: 180,
      },
      {
        prop: "cAppTyp",
        inputtype: "rtswitch",
        title: "开关状态",
        keymap: {
          y: "on",
          n: "off",
        },
        activeText: "启用",
        inactiveText: "禁用",
        inlinePrompt: true,
        func: (val,row) => {
          console.log(val);
          console.log(row);

          let saveType = null;
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          if(val === 'on'){
            freeEditRef.value?.validate().then((res) => {
              if(!res){
                tableRef.value?.setValueByRowKey("cAppTyp", row._dataId, val === 'off');  //如果验证不通过,则不修改状态
                return ;
              }
            });
          }
          const params = {
            forms: Object.assign(s,{cAppTyp:val}),
            list: [row]
          }

          dealTerminationData(params).then((res) => {
            if(res.code === 200){
              handleQuery();
            }else{
              ElMessage.error(res.msg);
            }
          });
        },
      },
    ],
  })
);

onMounted(async () => {});

// 绑定方法
const method = {
  func1: () => {},
};

function openAll(){ 
  const all = tableRef.value?.getselectionData();
  if(!all || all.length === 0){ 
    ElMessage.error('请选择至少一条数据!');
    return ;
  }

  freeEditRef.value?.validate().then((res) => {
    if(res){
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const params = {
        forms: Object.assign(s,{cAppTyp:'on'}),
        list: all
      }
      dealTerminationData(params).then((res) => {
        if(res.code === 200){
          handleQuery();
        }else{
          ElMessage.error(res.msg);
        }
      });
    }
  });
}


function closeAll(){
  
  const all = tableRef.value?.getselectionData();
  if(!all || all.length === 0){ 
    ElMessage.error('请选择至少一条数据!');
    return ;
  }

  freeEditRef.value?.validate().then((res) => {
    if(res){
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const params = {
        forms: Object.assign(s,{cAppTyp:'off'}),
        list: all
      }
      dealTerminationData(params).then((res) => {
        if(res.code === 200){
          handleQuery();
        }else{
          ElMessage.error(res.msg);
        }
      });
    }
  });

}

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {},
};

/** 查询 */
async function handleQuery(flag?: boolean) {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  if(s.cPlyNo || s.cAppNo) {
    const r = await freeEditRef.value?.validateField("cOperType");
    if(r){
      const param = Object.assign(s);
      qryTerminationDataList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    }
  }else{
    ElMessage.error('保单号/申请单号至少录入一个');
  }
}

</script>

<style scoped></style>
