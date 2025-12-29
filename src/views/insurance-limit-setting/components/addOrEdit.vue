<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { InsuranceLimit } from '../service/index';
import { getListByCode } from '@/api/code-list-service';
import { AppKey } from "@/constants/api";
// import { BaseCheck } from '@/utils/base-review';

import { useUserStore } from "@/store/modules/user";
import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { cloneDeep } from 'lodash-es';
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const userStore = useUserStore();

const props = defineProps({
  pageType: { //one 单一产品；all 全部产品
    type: String,
    required: true
  },
  actionType: { // add 新增； update 修改 view 查看
    type: String,
    required: true
  },
  cPkId: { //编辑时有值
    type: String
  }
})
const emits = defineEmits(['ok'])
const { getRules } = useValidator();
const dialogVisible = ref(true)
const user = ref(userStore.user)
const CCertfClsType = ref('') //客户证件类型字段请求数据字典的type值
const CCertfClsType2 = ref('') //股东证件类型字段请求数据字典的type值
const CCertfCdeRules:any = ref([])
const CCertfCdeRules2:any = ref([])
const settingOne:any = ref([])
const chooseProdName = ref('') //选中的条款名称
const insuranceLimit = new InsuranceLimit();
const codeListMap = reactive({
  persionType: [],
  NV049001: []
})
const cProdNoOptions:any = ref([])
const cTermNoOptions:any = ref([])
const initFlag = ref(true)


if (props.pageType === 'one') {
  settingOne.value = [
    {
      prop: "productCategories",
      inputtype: "rtselect",
      title: "产品大类",
      clearable: true,
      typeCode: "KIND_LIST_GRT",
      codeParam: {
        cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
        cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
      },
      func: (val:any) => {
        setFormItem("cProdNo", {
          loadData: [],
        });
        cProdNoOptions.value = []
        if(!initFlag.value) {
          freeEditRef.value?.setValue("cProdNo", null);
        }
        if(val) {
          codeListStore
            .queryCodeList({
              codeListName: "PROD_LIST_GRT",
              codeListParam:{
                cParCde: val,
                cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
                cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
              },
            })
            .then((res) => {
              setFormItem("cProdNo", {
                loadData: res,
              });
              cProdNoOptions.value = res
            });
        }
      },
      rules: [getRules("required", {})]
    },
    {
      prop: "cProdNo",
      inputtype: "rtselect",
      title: "产品",
      clearable: true,
      // typeCode: "PROD_LIST",
      params: { },
      rules: [getRules("required", {})],
      func: (val:any) => {
        setFormItem("clauseCode", {
          loadData: [],
        });
        cTermNoOptions.value = [];
        if(!initFlag.value) {
          freeEditRef.value?.setValue("clauseCode", null);
        }
        codeListStore
          .queryCodeList({
            codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
            codeListParam:{
              value: val,
              cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
              cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
            },
          })
          .then((res) => {
            setFormItem("clauseCode", {
              loadData: res,
            });
            cTermNoOptions.value = res;
          });
      }
    },
    {
      prop: "clauseCode",
      inputtype: "rtselect",
      title: "条款",
      clearable: true,
      // typeCode: "PROD_LIST",
      params: {},
      func: (val:any) => {
        chooseProdName.value = cTermNoOptions.value.find((item: any) => item.value === val)?.label || ''
      },
      rules: [getRules("required", {})]
    },
  ]
} else {
  settingOne.value = []
}

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          submitForm();
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          dialogVisible.value = false
        },
      }),
    ],
    fromSchema: [
      ...settingOne.value,
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额/限额",
        clearable: true,
        rules: [getRules("required", {}), getRules("validateAmout", {maxIntegerLength: 12, maxDecimalLength: 8})]
      },
      {
        prop: "customerNature",
        inputtype: "rtselect",
        title: "客户性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        params: {},
        func: (val) => {
          handleNatureChange(val)
        },
        rules: [getRules("required", {})]
      },
      {
        prop: "customerIdType",
        inputtype: "rtselect",
        title: "客户证件类型",
        clearable: true,
        typeCode: CCertfClsType,
        params: {},
        func: (val) => {
          handleCertificateChange(val)
        },
        rules: [getRules("required", {})],
        loadData: null //回显时给这个loadData赋值
      },
      {
        prop: "customerIdNumber",
        inputtype: "rtinput",
        title: "客户证件号码",
        clearable: true,
        rules: CCertfCdeRules,
      },
      {
        prop: "customerName",
        inputtype: "rtinput",
        title: "客户名称",
        clearable: true,
        rules: [getRules("required", {})]
      },
      {
        prop: "shareholderNature",
        inputtype: "rtselect",
        title: "股东性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        params: {},
        func: (val) => {
          handleNatureChange2(val)
        },
        rules: [getRules("required", {})]
      },
      {
        prop: "shareholderIdType",
        inputtype: "rtselect",
        title: "股东证件类型",
        clearable: true,
        typeCode: CCertfClsType2,
        params: {},
        rules: [getRules("required", {})],
        func: (val) => {
          handleCertificateChange2(val)
        },
        loadData: null //回显时给这个loadData赋值
      },
      {
        prop: "shareholderIdNumber",
        inputtype: "rtinput",
        title: "股东证件号码",
        clearable: true,
        rules: CCertfCdeRules2,
      },
      {
        prop: "shareholderName",
        inputtype: "rtinput",
        title: "股东名称",
        clearable: true,
        rules: [getRules("required", {})]
      },
    ],
  })
);

const submitForm = () => {
  const r = freeEditRef.value?.getFromValue();
  const tempData = Object.assign({}, r);
  if(props.pageType == 'one') { //单一产品配置
    tempData.scenarioType = '0'
  } else { //全部产品配置
    tempData.scenarioType = '1'
  }
  if(chooseProdName.value) {
    tempData.clauseName = String(chooseProdName.value)
  }
  const params = {
    type: props.actionType,
    webCustShareCoverageList: [tempData]
  }
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      insuranceLimit.saveData(params).then((res: any) => {
        if (res.code === '1') {
          ElMessage.success(res.message);
          closeDialog()
        } else {
          ElMessage.error(res.message);
        }
      }).catch((err:any) => {
        ElMessage.error(err.message);
      });
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};
//通知父组件更新列表
const closeDialog = () => {
  dialogVisible.value = false
  emits('ok')
};


//客户性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange = (value: string) => {
  if (value === '1') {
    setFormItem("customerIdType", { loadData: codeListMap['persionType'] })
  } else if (value === '0') {
    setFormItem("customerIdType", { loadData: codeListMap['NV049001'] })
  }
  if(!initFlag.value) {
    freeEditRef.value?.setValue('customerIdType', null) //清空客户证件类型
    freeEditRef.value?.setValue('customerIdNumber', null) //清空客户证件号码值
    freeEditRef.value?.setValue('customerName', null) //清空客户证件号码值
  }
  freeEditRef.value?.clearValidate('customerIdType')
  freeEditRef.value?.clearValidate('customerIdNumber')
  freeEditRef.value?.clearValidate('customerName')
}

//股东性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange2 = (value: string) => {
  if (value === '1') {
    setFormItem("shareholderIdType", { loadData: codeListMap['persionType'] })
  } else if (value === '0') {
    setFormItem("shareholderIdType", { loadData: codeListMap['NV049001'] })
  }
  if(!initFlag.value) {
    freeEditRef.value?.setValue('shareholderIdType', null) //清空股东证件类型
    freeEditRef.value?.setValue('shareholderIdNumber', null) //清空股东证件号码值
    freeEditRef.value?.setValue('shareholderName', null) //清空股东证件号码值
  }
  freeEditRef.value?.clearValidate('shareholderIdType')
  freeEditRef.value?.clearValidate('shareholderIdNumber')
  freeEditRef.value?.clearValidate('shareholderName')
}

//证件类型change
const handleCertificateChange = (value: string) => {
  if(!initFlag.value) {
    freeEditRef.value?.setValue('customerIdNumber', null) //清空客户证件号码值
    freeEditRef.value?.setValue('customerName', null) //清空客户证件号码值
  }
  freeEditRef.value?.clearValidate('customerIdNumber')
  freeEditRef.value?.clearValidate('customerName')
  console.log('value111', value)
  if (value == '111') { // 身份证号
    CCertfCdeRules.value = [getRules("required", {}), getRules("idCard", {})]
  } else if (value == '01') { // 统一社会信用代码
    CCertfCdeRules.value = [getRules("required", {}), getRules("socialCode", {})]
  } else if (value == '110001') { // 组织机构
    CCertfCdeRules.value = [getRules("required", {}), getRules("orgCode", {})]
  } else if(value == '07') { // 护照
    CCertfCdeRules.value = [getRules("required", {}), getRules("passPort", {})]
  } else if(value == '553') { //外国人永久居留身份证
    CCertfCdeRules.value = [getRules("required", {}), getRules("ariCard", {})]
  } else if ('110002' === value) {  // 营业执照
    CCertfCdeRules.value = [getRules("required", {}), getRules("businessLicense", {})]
  } else {
    CCertfCdeRules.value = [getRules("required", {}), getRules("maxLength", {len: 20})]
  }
};

//股东证件类型change
const handleCertificateChange2 = (value: string) => {
  if(!initFlag.value) {
    freeEditRef.value?.setValue('shareholderIdNumber', null) //清空股东证件号码值
    freeEditRef.value?.setValue('shareholderName', null) //清空股东证件号码值
  }
  freeEditRef.value?.clearValidate('shareholderIdNumber')
  freeEditRef.value?.clearValidate('shareholderName')
  if (value == '111') { // 身份证号
    CCertfCdeRules2.value = [getRules("required", {}), getRules("idCard", {})]
  } else if (value == '01') { // 统一社会信用代码
    CCertfCdeRules2.value = [getRules("required", {}), getRules("socialCode", {})]
  } else if (value == '110001') { // 组织机构
    CCertfCdeRules2.value = [getRules("required", {}), getRules("orgCode", {})]
  } else if(value == '07') { // 护照
    CCertfCdeRules2.value = [getRules("required", {}), getRules("passPort", {})]
  } else if(value == '553') { //外国人永久居留身份证
    CCertfCdeRules2.value = [getRules("required", {}), getRules("ariCard", {})]
  } else if ('110002' === value) {  // 营业执照
    CCertfCdeRules2.value = [getRules("required", {}), getRules("businessLicense", {})]
  } else {
    CCertfCdeRules2.value = [getRules("required", {}), getRules("maxLength", {len: 20})]
  }
};


onMounted(() => {
  // 证件类型 - 个人
  codeListStore.queryCodeList({
    codeListName: 'NATURAL_CERTIFICATE_CACHE',
    codeListParam: { }
  }, false, true).then(res => {
    if (res) {
      codeListMap['persionType'] = res;
    }
  }, () => {
    ElMessage.error('后台服务异常,请联系管理员');
  });
  // 证件类型 - 法人
  codeListStore.queryCodeList({
    codeListName: 'UN_NATURAL_CERTIFICATE_CACHE',
    codeListParam: { }
  }, false, true).then(res => {
    if (res) {
      codeListMap['NV049001'] = res;
    }
  }, () => {
    ElMessage.error('后台服务异常,请联系管理员');
  });
  if(props.cPkId) { //编辑时查询详情
    const params = {
      cPkId: props.cPkId
    }
    insuranceLimit.getDetail(params).then((res: any) => {
      if (res.code == '1') {
        res.data.nAmt = res.data.stringNAmt
        freeEditRef.value?.setFormValue(res.data)
        
        nextTick(() => {
          const item = freeEditRef.value?.getFromSchemaItem('customerIdType')
          const item2 = freeEditRef.value?.getFromSchemaItem('shareholderIdType')
          if(res.data.customerNature == '1') {
            item.loadData = codeListMap['persionType']
          } else {
            item.loadData = codeListMap['NV049001']
          }
          if(res.data.shareholderNature == '1') {
            item2.loadData = codeListMap['persionType']
          } else {
            item2.loadData = codeListMap['NV049001']
          }
          initFlag.value = false;
        })
      }
    })
    if(props.actionType === 'view') {
      formconfig1.endBtns = [] //查看时不显示底部按钮
      nextTick(() => {
        freeEditRef.value?.setDisabledAll(true)
      })
    }
  }
});

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

</script>

<style scoped lang="scss">
.custom-modal {
  width: 1000px;
}

.inlineForm {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  position: relative;
}

.clo-2 {
  flex: 0 0 50%;
  max-width: 50%;
}

.clo-3 {
  flex: 0 0 33%;
  max-width: 33%;
}

.clo-4 {
  flex: 0 0 25%;
  max-width: 25%;
}

.col-button {
  flex: 0 0 100%;
}
</style>
<style lang="scss">
.addRoleConfirmPop {
  .el-message-box__container {
    display: block
  }
}
</style>
