<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="cvrgEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {ref} from "vue";
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
const eCargoSelectTgtFix = defineAsyncComponent(
    () => import("./fix/SelectDistFix.vue")
);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;

const dialog = ref<DialogMethod | null>(null);
const cvrgEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(() => {
  const tableConfig = props.pageSchema;
  tableConfig.fromSchema.forEach((item: any) => {
    if(['Term.nSeqNo', 'Term.nCargoSeq'].includes(item.prop)) {
      item.disabled = true;
    }
  });
  const formconfig11 = formInit(
      JSON.stringify(tableConfig),
      method,
      exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  func1: () => { },
  funcCvrgCargoAdd: () => {
    console.log('funcCvrgCargoAdd')
    cvrgEditRef?.value?.addRow();
    const val = getFormValue();
    console.log('val', val)
    val.forEach((key: string, index: number) => {
      key['Term.nSeqNo'] = index + 1
    });
  },
  funcCvrgCargoDel: () => {
    console.log('funcCvrgCargoDel')
    const selData = cvrgEditRef?.value?.getSelectRow()
    if (!selData) {
      ElMessage.warning("请选择要删除的数据!");
      return;
    }
    const editIndex = selData['_dataId'];
    cvrgEditRef?.value?.delRow(editIndex);
  },
  selecedTgt: () => {
    const row = cvrgEditRef?.value?.getSelectRow()
    console.log('row', row)
    if(!row) {
      ElMessage.warning("请选择一条数据!");
      return;
    }
    const cvrgList = cvrgEditRef?.value?.getFromValue();
    const list = cvrgList.filter((f: any) => f._dataId != row._dataId);
    const selectList = list.map((m: any) => m['Term.nCargoSeq']).join(',').split(',');
    dialog.value?.open(
        eCargoSelectTgtFix,
        {
          selectedData: row, //需要把自定义的过滤掉，只传过去从模板中选择的
          selectList: selectList,
        },
        {
          getSelected(selectdata: any) {
            if(selectdata) {
              const nSeqNoJoin = selectdata.map((item: any) => item['DistECargo.nSeqNo']).join(',')
              cvrgEditRef?.value?.setValueByRowKey('Term.nCargoSeq',row['_dataId'] , nSeqNoJoin)
            }

            // let len = formData.value.length;
            // let sel : any[] = [];
            // selectdata.forEach((item: any,index:number) => {
            //   item.index = len + 1;
            //   sel.push(item);
            //   len++;
            // });
            //
            // sel.forEach((item) => {
            //   rttableFrom.value.addRowByData(item);
            // });
          },
        },
        { title: "选择货物", width: 55 }
    );

  }
};

// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return cvrgEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  cvrgEditRef?.value?.setFormValue(value);
}

function validate() {
  return cvrgEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  cvrgEditRef?.value?.getTableValue(rowId, key);
}

function getFormConfig() {
  return formconfig1;
}
//给表单赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}
function getFormBtn() {
  return cvrgEditRef?.value?.getFormBtn();
}
function getTableBtn() {
  return cvrgEditRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean) {
  cvrgEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  getTableValue,
  getFormConfig,
  setFormItem,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>

<style scoped></style>
