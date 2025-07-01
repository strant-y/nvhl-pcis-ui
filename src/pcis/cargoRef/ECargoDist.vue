<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
          ref="distTableRef"
      />
    </myCard>
    <comDialog ref="dialog"></comDialog>
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
import {
  deleteDist,
} from "@/api/prod";
import {getAddressStr} from "@/api/query";
import moment from "moment";
import {formInit} from "@/shared/from-init";
import {codeListViewStore} from "@/store";

const codeListStore = codeListViewStore();
import {CardConfig, creatCardConfig} from "@/shared/mytemplate/card-config";
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import {useRoute} from "vue-router";
import {AppFreeEditMethod} from "@/shared/app-free-edit-config";

const cargoDistAdd = defineAsyncComponent(
    () => import("@/pcis/cargoRef/fix/DistAddFix.vue")
);

const route = useRoute();
const dialog = ref<DialogMethod | null>(null);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const distTableRef = ref<AppTableMethod | null>(null);
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

let fileBase: string;
// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (compKey: string): string => {


  return "";
};

const tabKey = computed(() => {
  if(props.compKey === 'AgreementDistInsured') {
    return 'ECargoInsured';
  }else {
    return 'ECargoDist';
  }
})

const formconfig11 = ref<any>({});
onMounted(async () => {
  console.log("props.compKey", props.compKey)
  formconfig11.value = formInit(
      // JSON.stringify({ ...props.pageSchema, fromSchema: processedFromSchema }),
      JSON.stringify({...props.pageSchema}),
      method,
      exRules
  );
  Object.assign(formconfig1.value, formconfig11.value);
  cardconfig.value.title = formconfig1.value.title;
  tableconfig.value.showEdit = true;
  formconfig1.value.fromSchema.forEach((e: any) => {  // 隐藏不需要显示在表格内的数据
    if (e.cShowLocation === '0') {
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  if(props.pageSchema.fromUi) {
    tableconfig.value.fromUi['groupBy'] = props.pageSchema.fromUi['groupBy']
  }
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  tableconfig.value.isPage = false;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns;
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
  tableconfig.value.isPage = false;
  console.log('tableconfig.value', tableconfig.value)
  console.log('props.pageSchema', props.pageSchema)
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue(
      ''
  );

});

// 绑定方法
const method = {
  func1: () => {
  },
  handleClose: (val: any) => {
  },
  viewmethod: (row: any) => {
    console.log('row', row)
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "详情",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
        {width: "60"}
    );
  },
  addmethod: (row: any) => {
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "新增",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
        {
          isOk: (res: any) => {
            const newRow = {
              ...res,
            };
            newRow[tabKey.value + '.nSeqNo'] = pageresult.list.length + 1;
            setTableData([
              ...pageresult.list,
              ...[newRow]
            ]);
          },
        },
        {width: "60"}
    );
  },
  editmethod: (row: any) => {
    const rowId = row._dataId;
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "编辑",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
        {
          isOk: (res: any) => {
            pageresult.list.forEach((item: any) => {
              if(item._dataId = rowId) {
                Object.assign(item, res);
              }
            })
          },
        },
        {width: "60"}
    );
  },
  // 删除
  delmethod: (row: any) => {
    const idx = pageresult.list.findIndex((item: any) => row._dataId = item._dataId);
    pageresult.list.splice(idx, 1)
  },

  // 同投保人按钮点击事件
  applicantToInsured: () => {
    const appInfo = formPage.getFormDataById('AgreementApplicant');
    if(Object.keys(appInfo).length > 0) {
      const f = pageresult.list.filter((item: any) =>
          item['ECargoInsured.cCustomerName'] === appInfo['Applicant.cAppNme'] &&
          item['ECargoInsured.cIdentificationNumber'] === appInfo['Applicant.cCertfCde']
      );
      if(f.length > 0) {
        return;
      }
      setTableData([
        ...pageresult.list,
        ...[{
          ...{
            'ECargoInsured.nSeqNo': pageresult.list.length + 1,
            'ECargoInsured.cCustomerName': appInfo['Applicant.cAppNme'],
            'ECargoInsured.cIdentificationNumber': appInfo['Applicant.cCertfCde'],
            'ECargoInsured.cDocumentType': appInfo['Applicant.cCertfCls'],
            'ECargoInsured.cGender': appInfo['Applicant.cSex'],
            'ECargoInsured.nAge': appInfo['Applicant.nAge'],
          },
        }]
      ]);
    } else {
      ElMessage.warning('请先录入投保人信息！');
    }
  },

  handleQuery: () => {
    // let tgtRef = opertaor.getTableRefByKey('tgt')
    // const param = opertaor.getParam();
    // let app = "";
    // if (param.cOrgAppNo) {
    //   app = param.cOrgAppNo;
    // } else if (opertaor.getDataAll().plyBase["Base.cAppNo"]) {
    //   app = opertaor.getDataAll().plyBase["Base.cAppNo"];
    // } else {
    //   app = route.params.param.cAppNo
    // }
    // const selData = {
    //   cComponentTable: cComponentTableValue,
    //   cAppNo: app,
    // };
  },

  setregistAdd() {
    const ads = distTableRef?.value?.getValue('ECargoDist.AllProp');
    const a = distTableRef?.value?.getValue("ECargoDist.cRegisterSuffixAddr") || "";
    if (ads) {
      getAddressStr({address: ads}).then((res: any) => {
        const {code, data, msg} = res;
        if (code === 200) {
          const b = (data ? data['addStr'] : "") + a;
          setAddressStr("ECargoDist.cClntAddr", b);
        }
      });
    } else {
      setAddressStr("ECargoDist.cClntAddr", a);
    }
    console.log("清单级联事件触发")
  },
  cOccupationalLevelOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    const AllOccup = rowData['ECargoDist.AllOccup'];
    if (AllOccup.length < 3) return;
    codeListStore.queryCodeList({
      codeListName: "Occupt_ZYLB",
      codeListParam: {cParCde: AllOccup.at(-1)},
    }).then((res) => {
      //给表单下拉项赋值
      config.loadData = res;
    });
  }
};

// 绑定特殊验证器
const exRules = {};

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
  handleQuery: method.handleQuery,
  setTableData,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>

<style scoped></style>
