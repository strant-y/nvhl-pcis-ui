<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
		<comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { codeListViewStore, dataOpertaor } from "@/store";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import {ref} from "vue";
import {useValidator} from "@/typings/useValidator";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {calculateAgeFromIdCard, validateAndGetGender} from "@/utils/common";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  handleQuery: {
    type: Function,
    required: false,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});
const { getRules } = useValidator();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const params = opertaor.getParam();
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const init = ref(true);
const getCComponentTable = () => {
    return 'InsuredDist';
};
const cComponentTable = getCComponentTable();

const emits = defineEmits(["handleClose"]);
const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig(props.data.fromUi),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if(isValid){
            const s = freeEditRef.value?.getFromValue();
            if(typeof props.method.isOk == 'function'){
              props.method.isOk(s);
              emits("handleClose");
              return;
            }
          }
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
  })
);

onMounted(async  () => {
  let newSchema = [];
  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){

    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
		}
		// 证件类型
    if(['GrpMemberYjx.identifyType'].includes(item.prop)) {
      item["func"] = (value: any) => {
        console.log("identifyTypeChange", value);
        if(value === '111') {
          setFormItem('GrpMemberYjx.certfEndDate', {rules: [getRules("required", {})]})
          setFormItem('GrpMemberYjx.certfBgnDate', {rules: [getRules("required", {})]})
        }else {
          setFormItem('GrpMemberYjx.certfEndDate', {rules: []})
          setFormItem('GrpMemberYjx.certfBgnDate', {rules: []})
        }
      };
		}
		// 被保人地址
    if(['GrpMemberYjx.insuredAddress'].includes(item.prop)) {
      if(item.groupList.length>0){
        item.groupList[0]["func"] = (value: any, rowData: any) => { //  省市区 级联选择器 GrpMemberYjx.addrProp
          console.log("addrPropChange", value, rowData);
        };
        item.groupList[1]["func"] = (value: any) => { // 街道 GrpMemberYjx.suffixAddr
          console.log("getcSuffixAddr", value);
        };
      }
		}

    if(item.prop === 'GrpMemberYjx.identifyNumber') {
      item.func = (val:any) => {
        if(init.value) return;
        if(val && ['111','553'].includes(getValue('GrpMemberYjx.identifyType'))) {
          setValue('GrpMemberYjx.age', calculateAgeFromIdCard(val))
          const birthDateFromId = val.substring(6, 14);
          const formattedBirthDate = `${birthDateFromId.substring(0, 4)}-${birthDateFromId.substring(4, 6)}-${birthDateFromId.substring(6, 8)}`;
          setValue('GrpMemberYjx.birthday', formattedBirthDate);
          setValue('GrpMemberYjx.sex', validateAndGetGender(val));
        }
      }
    }

  if(params.cEdrType === '1' && (props.data.title == "编辑" || props.data.title == "新增")){
      item.disabled = false;
      if(item.inputtype === 'rtinputgroup'){
        item.groupList.forEach(data => {
          data.disabled = false;
        })
      }
    }
    newSchema.push(item);
  }
  formconfig1.value.fromSchema = newSchema;
  formconfig1.value.title = props.data.title;
  console.log('props.data.rowData', props.data.rowData)
	if (props.data.title == "编辑") {
    setTimeout(() => {
      setFormValue(props.data.rowData);
    }, 150);
  } else if(props.data.title == '详情'){
    setTimeout(() => {
      setFormValue(props.data.rowData);
      freeEditRef.value?.setDisabledAll();
    }, 150);
  }else {
    setTimeout(() => {
      setValue("GrpMemberYjx.insuredType", '1');
    }, 150);
  }
  nextTick(() => {
    init.value = false;
  })
});


//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.value.fromSchema?.forEach((item) => {
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
function clearValidate(key = null) {
  freeEditRef?.value?.clearValidate(key);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  clearValidate,
});
</script>

<style scoped></style>
