<template>
  <div>
    <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        @page-change="loadData(false)"
        ref="distTableRef"
        @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import {
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import moment from "moment";
import {codeListViewStore, dataOpertaor} from "@/store";

import {AppFreeEditMethod} from "@/shared/app-free-edit-config";
import cargoApi from "@/api/cargo";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { createFreeButtonBase } from "@/shared/button-config";
const policyService = new PolicyService();
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const distTableRef = ref<AppTableMethod | null>(null);
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

let fileBase: string;
// 声明全局变量
let cComponentTableValue: string;

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  method: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(["handleClose"]);
// 复选框选中
const selectedRows = ref<any[]>([]);
function handleSelectionChange(selection: any) {
  const selectList = props.data.selectList;
  let filteredArray:any = []
  // selection.forEach((item2) => {
  //   const f = selectList.find( f => f === item2["Dist.nSeqNo"]+'' );
  //   if(f){
  //     ElMessage.warning("本条数据已被使用不可选");
  //     distTableRef.value?.toggleRowSelection(item2,false)
  //   }
  // })
  // filteredArray = selection.filter((item:any)=>
  //     !selectList.includes(item['Dist.nSeqNo']+'')
  // );
  // selectedRows.value = filteredArray;
  selectedRows.value = selection;
}
function setSelected() {
  const lastSelected = props.data.selectedData;
  let key = undefined;
  if(lastSelected) {
    if(lastSelected['Term.nCargoSeq']) {
      key = 'Term.nCargoSeq';
    } else {
      key = 'TermRisktgt.nCargoSeq';
    }
    if(lastSelected[key]) {
      const nCargoSeqList = lastSelected[key].split(",");
      nCargoSeqList.forEach((item) => {
        pageresult.list.forEach((item2) => {
          if (item === (item2["Dist.nSeqNo"] + '')) {
            item2["checked"] = true;
            distTableRef.value?.toggleRowSelection(item2, true);
          }
        });
      });
    }
  }
  const selectList = props.data.selectList;
  if(selectList) {
    pageresult.list.forEach((item2) => {
      const f = selectList.find( f => f === item2["Dist.nSeqNo"]+'' );
      item2["disabled"] = !!f;
      // debugger
      // distTableRef.value?.setValueByRowKey('disabled',item2._dataId,false)
    });
  }
}
const distKey = computed(() => Object.keys(opertaor.getTableRefs()).find(f => f.includes('CargoDist')));
const cAppNo = computed(() => opertaor.getDataAll()['plyBase']['Base.cAppNo']);
onMounted(async () => {
  const tabref = opertaor.getTableRefs();
  const formconfig11 = tabref[distKey.value].getFormConfig()
  Object.assign(formconfig1.value, formconfig11);
  tableconfig.value.title =formconfig1.value.title;
  tableconfig.value.titleBtnPosition = 'right';
  tableconfig.value.showEdit = true;
  tableconfig.value.showSelection = true;
  formconfig1.value.fromSchema.forEach((e: any) => {  // 隐藏不需要显示在表格内的数据
    if (e.cShowLocation === '0') {
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema =formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: [],
    fromSchema: formconfig1.value.distSchema,
  });
  tableconfig.value.endBtnsPosition = "right";
  tableconfig.value.isPage = false; //先不分页
  tableconfig.value.endBtns =[createFreeButtonBase({
    type: "primary",
    label: "确定",
    func: () => {
      // if (selectedRows.value.length === 0) {
      //   ElMessage.warning("请先选择数据");
      //   return;
      // }
        props.method.getSelected(selectedRows.value);
      },
    }),createFreeButtonBase({
    type: "default",
    label: "取消",
    func: () => {
      emits("handleClose");
    },
    })
  ];
    if(cAppNo.value){
      loadData()
    }
});
const loadData = (flag = true)=>{
  const r = distTableRef.value?.getPartnerPage(flag); //获取分页数据
  r.pageSize = 9999
  // let param = Object.assign({cComponentTable: distKey.value, cAppNo: cAppNo.value}, r);
  // cargoApi.selectDistNew(param).then((res: any) => {
  //   if(res.code === 200) {
  //     if(res.data.data.length > 0 ){
  //       pageresult.list = res.data.data
  //       pageresult.total = res.data.total
  //       pageresult.list.forEach((item) => {
  //         item.checked = true;
  //       });
  const tabref = opertaor.getTableRefs();
  const list = tabref[distKey.value].getTableData();
  const arr: any[] = [];
  for(const i in list){
    arr.push({...list[i]});
  }
  pageresult.list = arr;
  nextTick(()=> {
    setSelected();
  })
  //     }
  //   }else {
  //     ElMessage.success(res.msg);
  //   }
  // })
}

function validate() {
  return true;
}
function setValue(key: string, value: any) {
  distTableRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return distTableRef?.value?.getValue(key);
}

function setUnDisabledByKeyList(key: any) {
  tableconfig.value.formconfig.endBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.formconfig.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.tableBtn?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
}
function setTableData(data: any) {
  pageresult.list = data.map((item: any, index: any) => {
    return {
      ...item,
      ...{
        nSeqNo: index + 1,
        tOpeningTime: item['ECargoDist.tOpeningTime']
            ? moment(item['ECargoDist.tOpeningTime']).format("YYYY-MM-DD")
            : null,
        'ECargoDist.AllOccup': [
          item['ECargoDist.cMajorCategories'], item['ECargoDist.cMediumClassification'], item['ECargoDist.cOccupationalSubcategory']
        ],
      }
    };
  });
}

function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}

function getFormValue() {
  return pageresult.list;
}

function setFormValue(value: any) {
  setTableData(value);
}

function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return distTableRef?.value?.getFormBtn();
}
function getTableBtn() {
  return distTableRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean, noSet: string[] = []) {
  const tableBtn = getTableBtn();
  if(tableBtn && Object.keys(tableBtn).length > 0) {
    Object.keys(tableBtn).forEach((key: any) => {
      if(!noSet.includes(key)) {
        tableBtn[key].hidden = isDisabled;
      }
    });
  }
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {
      if(!noSet.includes(key)) {
        formBtn[key].hidden = isDisabled;
      }
    })
  }
}
defineExpose({
  getValue,
  setValue,
  getFormValue,
  setFormValue,
  getFormConfig,
  setUnDisabledByKeyList,
  setTableData,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>

<style scoped></style>
