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
const dealTerminationDataType = ref(true);
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
        typeCode: "SJKG",
        // loadData: [
        //   { value: 'TerEdr', label: '终保后批改' },
        //   { value: 'SurBck', label: '一般退保倒签' },
        //   // { value: 'CanBck', label: '注销倒签' },
        //   { value: 'SurPrm', label: '一般退保手动修改退保总保费' },
        //   { value: 'AppPrm', label: '投保手动修改保费' },
        //   { value: 'EdrPrm', label: '一般批改手动修改责任保费' },
        //   { value: 'CancelM1', label: '取消免费延期校验' },
        // ],
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
      // createFreeButtonBase({
      //   id: "score",
      //   label: "打开开关",
      //   type: "primary",
      //   func: function () {
      //      openAll();
      //   },
      // }),
      // createFreeButtonBase({
      //   id: "score",
      //   label: "关闭开关",
      //   type: "primary",
      //   func: function () {
      //      closeAll();
      //   },
      // }),
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
        title: "保险起期",
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
        func: async (val:any,row:any) => {
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          if(val === 'on'){
            const r = await freeEditRef.value?.validateField("cTitleOa");
            if(!r) {
              handleQuery();
              return;
            }
          }
          const params = {
            forms: Object.assign(s,{cAppTyp:val}),
            list: [row]
          }
          dealTerminationData(params).then((res:any) => {
            if(res.code != 200){
              ElMessage.error(res.msg);
            }
            handleQuery();
          }).catch((err:any) => {
            ElMessage.error(err.msg);
            handleQuery();
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
  if(!s.cAppNo && s.cOperType === 'AppPrm') {
    ElMessage.warning('投保手动修改保费，请录入申请单号!');
  } else if(!s.cAppNo && s.cOperType === 'EdrPrm') {
    ElMessage.warning('一般批改手动修改责任保费，请录入申请单号!');
  } else if(!s.cAppNo && s.cOperType === 'SurPrm') {
    ElMessage.warning('一般退保手动修改退保总保费，请录入申请单号!');
  } else if(s.cPlyNo || s.cAppNo) {
    const r = await freeEditRef.value?.validate();
    if(r){
      const param = Object.assign(s);
      qryTerminationDataList(param)
        .then((res:any) => {
          const { code, data, msg } = res;
          pageresult.list = [];
          if (200 === code) {
            pageresult.list = data;
          } else {
            ElMessage.error(msg);
          }
        })
        .catch((err:any) => {
          pageresult.list = [];
          ElMessage.error(err.msg);
        });
    }
  }else{
    ElMessage.warning('保单号/申请单号至少录入一个');
  }
}

</script>

<style scoped></style>
