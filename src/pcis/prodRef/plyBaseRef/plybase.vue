<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="plyBaseEditRef" />
  <comDialog ref="agent"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { getBsnsTypList, getChaTypeList, getChaSubtypList } from "@/api/code-list-service";
import moment from "moment";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const agent = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();

const sessionData = ref(null)

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const plyBaseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    // 录单日期、签单日期默认值
    setValue('Base.tOprTm', moment(new Date()).format("YYYY-MM-DD HH:mm:ss"))
    setValue('Base.tIssueTm', moment(new Date()).format("YYYY-MM-DD HH:mm:ss"))
    // 是否见费出单 默认值
    setValue('Base.cNeedfeeFlag', '1')
  })
  if(sessionStorage.getItem('toMyPageData')) {
    const data = JSON.parse(sessionStorage.getItem('toMyPageData'))
    sessionData.value = data
    //业务来源大类下拉数据
    const params = {
      CDptCde: data['cDptCde'],
      CKindNo: data['cKindNo']
    }
    getBsnsTypList(params).then(res => {
      if (null != res && null != res['code']) {
        if (res['code'] === 200) {
          const codeValData = res.data;
          setFormValue({
            prop: 'Base.cBsnsTyp',
            loadData: res
          })
        }
      }
    })
  }
 
});

// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },
  //业务来源大类
  businessKindFunc: (val) => {
    setValue('Base.cChaType', '')
    setValue('Base.cChaSubtype', '')
    if(val) {
      getChaTypeList({'BsnsTyp': val}).then(res => {
        if (null != res && null != res['code']) {
            if (res['code'] === 200) {
                const codeValData = res.data;
                setFormValue({
                  prop: 'Base.cChaType',
                  loadData: res
                })
            }
        }
        
      })
    }
  },
  //业务来源中类
  businessFunc: (val) => {
    setValue('Base.cChaSubtype', '')
    if(val) {
      const params = {
        'CChaType': val,
        'flag': 1
      }
      getChaSubtypList(params).then(res => {
        if (null != res && null != res['code']) {
            if (res['code'] === 200) {
                const codeValData = res.data;
                setFormValue({
                  prop: 'Base.cChaSubtype',
                  loadData: res
                })
            }
        }
        
      })
    }
  },
  //业务来源子类
  businessSubFunc: (val) => {
    // 清除代理(经纪)人、代理业务员的值
    setValue('Base.cBrkrCde', '')
    setValue('Base.cBrkSlsCde', '')
  },
  //代理(经纪)人change事件
  agentChange: () => {
    // 清除代代理业务员的值
    setValue('Base.cBrkSlsCde', '')
  },
  //代理(经纪)人icon事件 
  agentFunc: () => {
    agent.value?.open(
        "agentPre",
        {
            type: "show",
            data: {
              CDptCde: sessionData.value?.cDptCde,
              cBsnsTyp: getValue('Base.cBsnsTyp'),
              cChaType: getValue('Base.cChaType'),
              cChaSubtype: getValue('Base.cChaSubtype'),
            },
        },
        {
            isOk: (selectdata: any) => {
                console.log('a',selectdata)
            },
        },
        { title: "代理查询", width: 85 }
    );
  },
  //代理业务员icon事件
  agentSaleFunc: () => {
    if(!getValue('Base.cBrkrCde')) {
      ElMessage.warning('请先选择代理(经济)人！');
      return
    }
    
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return plyBaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  plyBaseEditRef?.value?.setFormValue(value);
}

function validate() {
  return plyBaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  plyBaseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return plyBaseEditRef?.value?.getValue(key);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped></style>
