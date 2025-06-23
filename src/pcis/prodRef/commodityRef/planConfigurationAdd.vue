<template>
  <el-dialog v-model="dialogVisible" title="选择方案" width="80%" @update:model-value="handleVisibleUpdate">
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" @selection-change="handleSelectionChange" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const dzmodal = useDzModal();
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
const tabProref = opertaor.getTableRefByKey("productBasicInfo");
import { descryptParameter, encryptParameter } from "@/utils/encipher";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}"); 
// const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}"); 
const emits = defineEmits(["ok", "cancel"]);
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo, queryPlan, commodityBaseOperatorCheck, saveCommodityPlan } from "@/api/prod";
import { on } from "events";


let selValue = ref([])
const props = defineProps<{
  // visible: boolean;
  data: object;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>();

// 保存
const handleSave = async () => {


  // const formData = freeEditRef.value?.getFromValue();
  // selValue.value.forEach(item => {
  //   if (!!this.planMap[item['CPlanNo']] && item['CPlanNo'] === this.planMap[item['CPlanNo']]['cPlanNo']) {
  //     const cDispNme = this.planMap[item['CPlanNo']]['cDispNme'];
  //     const cSaleName = this.planMap[item['CPlanNo']]['cSaleName'];
  //     Object.assign(item, { 'CDispNme': cDispNme, 'CSaleName': cSaleName }); S25000057
  //   }
  // });

  // selValue.value
  if (selValue.value.length == 0) {
    ElMessage.error('请选择方案信息');
    return false;
  }

  let planList = selValue.value.map((item) => {
    return item.CPlanNo
  })

  let param = {
    CCommodityNo: props.data['cCommodityNo'],
    checkType: 'addPlan',
    planList: planList
  }

  let param2 = {
    CCommodityNo: props.data['cCommodityNo'],
    items: selValue.value
  }

  console.log('参数---', param)
  console.log('参数2---', param2)
  commodityBaseOperatorCheck(param)
    .then((res) => {
      const { code, data, msg } = res;
      console.log(data)
      if (code === 200) {
        if (!!data && data.length>0) {
          ElMessage.error('方案号[' + data.map((obj) => obj.CPlanNo).join(', ') + ']存在无效的再保分保配置记录，若该类业务需分保，请联系再保部对该方案进行分保配置！');
        }
      }

    })




  saveCommodityPlan(param2)
    .then((res) => {
      const { code, data, msg } = res;
      dialogVisible.value = false;
      emits("ok", data)
      if (code == 200) {
        console.log(data)
        ElMessage.success('保存成功！')
      } else {
        ElMessage.error(msg)
      }
    })

};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  // emit("update:visible", value);
};
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const selectedIds = ref(['P25000034']);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    showSelection: true,
    // tableBtn: [
    //   createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "删除",
    //     icon: "Delete",
    //     link: true,
    //     tableClick: (row) => {
    //       delRiskRel(row)
    //         .then((res) => {
    //           const { code, data, msg } = res;
    //           if (200 === code) {
    //             ElMessage.success("删除成功");
    //             handleQuery();
    //           } else {
    //             ElMessage.error(msg);
    //           }
    //         })
    //         .finally(() => {});
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "CNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "CPlanNo",
        inputtype: "rtinput",
        title: "方案代码",
      },
      {
        prop: "CPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "CNmeCn",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "方案类型",
      },
      {
        prop: "CTyp",
        inputtype: "rtselect",
        title: "是否主产品方案",
        // typeCode: "WEB_SYS_STA_DICT",
        // codeParam: { cParCde: "yes_no" },
      },
    ],
  })
);


// 多选事件
const handleSelectionChange = (selection: any) => {
  console.log('selection', selection)
  // selValue.value = selection.map((item: any) => item.CPlanNo);
  selValue.value = selection
  console.log(selValue.value)
}


/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const dptCde = JSON.parse(sessionStorage.getItem("user"));
  const c = tabref.getFromValue().cCommodityNo;
  // CCommodityNo    companyId
  const param = {
    codeListName: "Commodity_PLAN_LIST",
    codeListParam: {
      cCommodityNo: props.data['cCommodityNo'],    // 商品编号
      dptCde: dptCde.companyId,     // companyId
      prodNo: props.data['cProdNo'],
      status: "1",
    },
  };
  // let p = {
  //   // "codeListName": "PROD_LIST_IN_GUIDE",
  //   "codeListName": "Commodity_PLAN_LIST",
  //     "codeListParam": {
  //       "cParCde": "04",
  //       "cOperId": "cd0000001",
  //       "cDptCde": "0200000000000"
  //     }
  //   }

  // let p = { "codeListName": "Commodity_PLAN_LIST", "codeListParam": { "commodityNo": "S25000057", "prodNo": "040001", "dptCde": "0200000000000", "status": "1" } }
  queryPlan(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        // pageresult.list = [
        //   { CPlanNo: "P20003007", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
        //   { CPlanNo: "P20003008", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
        //   { CPlanNo: "P20003009", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
        //   { CPlanNo: "P20003006", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },
        //   { CPlanNo: "P20003005", CPlanEn: null, CPlanCn: "核心出单测试060003", CProdNo: "060003", CNmeCn: "旅游意外伤害保险", },


        // ]

        if (data !== null) {
          pageresult.list = data;
          pageresult.total = data.length;

          nextTick();
          setDefaultSelection();

        }

      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

const setDefaultSelection = () => {
  console.log(22)

  tableRef.value?.setValueByRowKey()

  // pageresult.list.forEach(row => {
  //   console.log(row.CPlanNo)
  //   if (selectedIds.value.includes(row.CPlanNo)) {
  //     console.log('进来了',row)
  //     tableRef.value?.toggleRowSelection(row, true);

  //   }
  // });
};

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
onMounted(() => {
  handleQuery();

});
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
