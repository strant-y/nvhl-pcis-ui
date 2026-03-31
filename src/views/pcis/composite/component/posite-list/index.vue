<template>
  <app-grid-edit  ref="gridEditRef" :gridEditConfig="formconfig"/>
</template>
<script setup lang="ts">
import {AppGridEditMethod, createAppGridEditConfig} from "@/shared/app-grid-edit-config";
import {createFreeButtonBase} from "@/shared/button-config";
import {CompositePageView} from "@/views/pcis/support/composite.types";
import {codeListViewStore} from "@/store";
import {ref} from "vue";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  prodList: {
    type: Array,
  }
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const emit = defineEmits(['update:prodList', 'prodListChange']);
const gridEditRef = ref<AppGridEditMethod | null>();
const pageView = inject("pageView", ref(new CompositePageView()));

const formconfig = ref(createAppGridEditConfig({
  title: '产品信息',
  editFlag: true, //是否可以编辑
  titleBtns: [
    createFreeButtonBase({
      id: 'add',
      type: "primary",
      label: "新增",
      size: 'small',
      func: () => {
        gridEditRef.value?.addRowByData({cGrpMrk: props.prodList[0]['cGrpMrk']});
      },
    }),
    createFreeButtonBase({
      id: 'del',
      type: "primary",
      label: "删除",
      size: 'small',
      func: () => {
        const selRow = gridEditRef.value?.getSelectRow();
        if(selRow) {
          gridEditRef.value?.delRow(selRow['_dataId']);
          if(!!selRow['cProdNo'] && selRow['cProdNo'] !== '') {
            const list = gridEditRef.value?.getFromValue()
            console.log('<-prodListChange-list', list)
            emit('update:prodList', list)
            emit('prodListChange', list)
          }
        }
      },
    }),
  ],
  fromSchema: [
    {
      prop: 'cCombinationNo',
      inputtype: 'rtinput',
      title: '组合申请单号',
      disabled: true,
      width: 100
    },
    {
      prop: 'cAppNo',
      inputtype: 'rtinput',
      title: '申请单号',
      disabled: true,
      width: 100
    },
    {
      prop: 'cPlyNo',
      inputtype: 'rtinput',
      title: '保单号',
      disabled: true,
      width: 100
    },
    {
      prop: "cGrpMrk",
      inputtype: "rtselect",
      title: "团个单标识",
      width: 80,
      disabled: true,
      loadData: [
        {
          label: "个单",
          value: "0",
        },
        {
          label: "团单",
          value: "1",
        },
      ],
    },
    {
      prop: "cKindNo",
      inputtype: "rtselect",
      title: "产品大类",
      // typeCode: "Query_Kind_List",
      codeParam: {},
      onInit: async (options: any) => {
        const {value, rowData} = options;
        const list = await codeListStore.queryCodeList({
          codeListName: 'Query_Kind_List',
          codeListParam: {},
        });
        gridEditRef.value?.addCodeListMap({
          code: 'cKindNo' + rowData['_dataId'],
          list: [
            ...list,
            {label: '意健险', value: '06'}
          ]
        });
      },
      func: async (value: string, rowData: any) => {
        let list;
        if(value === '06') {
          list = [
            {
              value: '060030',
              label: '陕西秦科保团体人身意外伤害保险',
              planNo: 'P26000176',
              planNme: '陕西秦科保团体人身意外伤害保险'
            }
          ]
        }else {
          list = await codeListStore.queryCodeList({
            codeListName: 'PROD_LIST',
            codeListParam: {"cParCde": value},
          });
        }
        gridEditRef.value?.setValueByRowKey('cProdNo', rowData['_dataId'], undefined)
        gridEditRef.value?.addCodeListMap({
          code: 'cProdNo' + rowData['_dataId'],
          list: list
        });
      }
    },
    {
      prop: "cProdNo",
      inputtype: "rtselect",
      title: "产品/方案",
      // typeCode: "PROD_LIST",
      codeParam: {},
      func: async (value: string, rowData: any) => {
        if(value) {
          const list = gridEditRef.value?.getFromValue();
          const rows = list.filter((f: any) => f['cProdNo'] === value);
          if (rows && rows.length > 1) {
            ElMessage.warning('该产品已存在，请重新选择');
            rowData['cProdNo'] = undefined;
            return;
          }
          await setProdNme(rowData, value);
          const updList = gridEditRef.value?.getFromValue()
          console.log('### prodListChange', updList);
          emit('update:prodList', updList);
          emit('prodListChange', updList);
        }
      },
      onInit: (options: any) => {
        const {value, rowData} = options;
        setProdNme(rowData, value);
      },
    },
    {
      prop: 'cProdNme',
      inputtype: 'rtinput',
      disabled: true,
      isShow: false
    },
    {
      prop: 'cPlanNo',
      inputtype: 'rtinput',
      disabled: true,
      isShow: false
    },
    {
      prop: 'cPlanNme',
      inputtype: 'rtinput',
      disabled: true,
      isShow: false
    },
  ]
}));

const setProdNme = async (rowData: any, cProdNo: string) => {
  if(rowData && rowData['cKindNo']) {
    let list = [];
    if(rowData['cKindNo'] === '06') {
      list.push({
        value: '060030',
        label: '陕西秦科保团体人身意外伤害保险'
      })
    }else {
      list = await codeListStore.queryCodeList({
        codeListName: 'PROD_LIST',
        codeListParam: {"cParCde": rowData['cKindNo']},
      });
    }
    gridEditRef.value?.addCodeListMap({
      code: 'cProdNo' + rowData['_dataId'],
      list: list
    });
    const item = list.find((item: any) => item.value === cProdNo);
    if(item) {
      gridEditRef.value?.setValueByRowKey('cProdNme', rowData['_dataId'], item.label?.trim().replace(cProdNo, ''));
    }
    if(rowData['cKindNo'] === '06') {
      gridEditRef.value?.setValueByRowKey('cPlanNo', rowData['_dataId'], 'P26000176');
      gridEditRef.value?.setValueByRowKey('cPlanNme', rowData['_dataId'], '陕西秦科保团体人身意外伤害保险');
    }
  }
};

onMounted(() => {
  console.log('---- props.prodList', props.prodList)
  if(props.prodList) {
    nextTick(() => {
      gridEditRef.value?.setFormValue([]);
      gridEditRef.value?.setFormValue(props.prodList);
    })
  }
});


watch(() => props.prodList, (newVal) => {
  if(newVal) {
    gridEditRef.value?.setFormValue([]);
    gridEditRef.value?.setFormValue(newVal);
  }
}, {
  immediate: true
});
function getFormBtn() {
  return gridEditRef?.value?.getFormBtn();
}
function getTableBtn() {
  return gridEditRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean) {
  gridEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({setDisabledAll, getFormBtn, getTableBtn});
</script>
<style scoped>

</style>