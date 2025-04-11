<!-- 发票弹框 -->
<template>
  <el-dialog v-model="dialogVisible"   width="90%">
   
  <!-- <el-dialog  :visible.sync="visible"  @close="close" width="90%"> -->
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
// import { DataOperator } from '@/utils/data-operator';
import { APPLICANT, INSURED } from '@/constants/tab-constants';
import { getListByCode } from '@/api/code-list-service';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";

import { dataOpertaor } from "@/store/modules/data-opertaor";
import { permission } from 'process';
const opertaor = dataOpertaor();
opertaor.init();
const props = defineProps({
  queryParam: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
})

let cGrpMrk =opertaor.getDataAll()['plyBase']['Base.cGrpMrk'];
// let cGrpMrk =1;

 console.log('999',cGrpMrk)

// const appLicantValue =tabref["applicant"].getFromValue()['Applicant.cAppNo'];  // 单据编号
const emits = defineEmits(['ok'])
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const dialogVisible = ref(true)
const policyService = new PolicyService();
// const props = defineProps({
//   modelValue: {
//     type: Boolean,
//     default: false,
//   },
// });


// const dataOperator = new DataOperator();

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromUi: {
      cols: 2
    },
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          saveTaxInfo()
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "同投保人",
        disabled: (cGrpMrk == 1),
        func: async () => {
          copyApplicant()
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "同被保人",
        disabled: (cGrpMrk == 1),  //  0 个单  1团单  团单禁用
        func: async () => {
          copyInsured()
        },
      }),
      createFreeButtonBase({
        label: "关闭",
        func: () => {
          console.log('cl  guanbi')
          close('close')
        },
      }),
    ],
    


    fromSchema: [
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
        disabled: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "CCustomerCode",
        inputtype: "rtinput",
        title: "客户代码",
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "CCustomerType",
        inputtype: "rtselect",
        title: "客户类型",
        typeCode: "INSURE_NATURE_CACHE",
        params: { 
       
        },
        clearable: true,
      },
      {
        prop: "CCustomerNm",
        inputtype: "rtinput",
        title: "客户名称",
        clearable: true,
      },
      {
        // codeParam: { cParCde: "RdrTyp" },
        // {"codeListName":"RatioTyp_List","codeListParam":{"C_PAR_CDE":"InvoiceType"}}
        prop: "CInvoiceType",
        inputtype: "rtselect",
        title: "发票类型",
        typeCode: "RatioTyp_List",
        codeParam: {  "C_PAR_CDE": "InvoiceType" },
        clearable: true,
        func: (val) => {
          handleInvoiceTypeChange(val)
        }
      },
      {
        prop: "CTaxpayerId",
        inputtype: "rtinput",
        title: "纳税人识别号",
        clearable: true,
      },
      {
        prop: "CCertfCls",
        inputtype: "rtselect",
        title: "证件类型",
        typeCode: "NATURAL_CERTIFICATE_ALL",
        params: { },
        clearable: true,
      },
      {
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "证件号码",
        clearable: true,
      },
      {
        prop: "CBank",
        inputtype: "rtinput",
        title: "开户银行",
        clearable: true,
      },
      {
        prop: "CAccountno",
        inputtype: "rtinput",
        title: "账号",
        clearable: true,
      },
      {
        prop: "CTele",
        inputtype: "rtinput",
        title: "电话",
        clearable: true,
      },
      {
        prop: "CEmail",
        inputtype: "rtinput",
        title: "邮箱",
        clearable: true,
        rules: [getRules("email", {})],
      },
      {
        prop: "CAddress",
        inputtype: "rtinput",
        title: "地址",
        clearable: true,
      },
    ],
  })
);


let formData = freeEditRef.value?.getFromValue()

const handleInvoiceTypeChange = (value: any) => {
  const cCustomerType = freeEditRef.value?.getValue('CCustomerType');
  if (cCustomerType === '1' && value === '2') {
    freeEditRef.value?.setValue('CInvoiceType', '1');
    ElMessage.error('个人不允许使用增值税专用发票');
  }
};

const saveTaxInfo = () => {
    // console.log('参数',freeEditRef.value?.getFromValue())
  let formData  = freeEditRef.value?.getFromValue();
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      ElMessage.warning('请补全信息');
      return;
    }
    
    policyService.saveTaxInfo(formData).then((response) => {
      if (response.code === 200) {
        ElMessage.success('保存成功');
        close('save');
      } else {
        ElMessage.error('保存失败！');
      }
    }).catch((error) => {
      ElMessage.error('连接失败！' + error);
    });
  });
};

const copyInsured = () => {
  //根据tabs的名称获取tabs的实例，拿实例中的数据给这里的表单回显数据。使用该组件时再调整这里
  // const insured = dataOperator.getTabByName(INSURED, route);
  let operDatas = opertaor.getDataAll()['insured'];  // 被保人数据
  // ['applicant']['Applicant.cAppNo']; 
  console.log(operDatas)

  const insured = { content: null };
  freeEditRef.value?.setValue('CInvoiceType', '');
  // if (insured && insured.content) {
    freeEditRef.value?.setValue('CCustomerCode', '');
    freeEditRef.value?.setValue('CCustomerType', '');
    freeEditRef.value?.setValue('CCustomerNm', '');
    freeEditRef.value?.setValue('CCertfCls', '');
    freeEditRef.value?.setValue('CCertfCde', '');
    freeEditRef.value?.setValue('CTele', '');
    freeEditRef.value?.setValue('CEmail', '');


    freeEditRef.value?.setValue('CCustomerCode', operDatas['Insured.cInsuredCde']);
    freeEditRef.value?.setValue('CCustomerType',  operDatas['Insured.cClntMrk']);
    freeEditRef.value?.setValue('CCustomerNm',  operDatas['Insured.cAppNme']);
    freeEditRef.value?.setValue('CCertfCls',  operDatas['Insured.cCertfCls']);
    freeEditRef.value?.setValue('CCertfCde',  operDatas['Insured.cCertfCde']);
    freeEditRef.value?.setValue('CTele',  operDatas['Insured.cMobile']);
    freeEditRef.value?.setValue('CEmail',  operDatas['Insured.cEmail']);



    // formData.CCustomerCode = insured.content.freeEdit.myForm.controls['Insured.CInsuredCde'].value;
    // formData.CCustomerType = insured.content.freeEdit.controls['Insured.CClntMrk'].value;
    // formData.CCustomerNm = insured.content.freeEdit.controls['Insured.CInsuredNme'].value;
    // formData.CCertfCls = insured.content.freeEdit.controls['Insured.CCertfCls'].value;
    // formData.CCertfCde = insured.content.freeEdit.controls['Insured.CCertfCde'].value;
    // let CMobile = insured.content.freeEdit.controls['Insured.CMobile'].value;
    // if (CMobile === null) {
    //   CMobile = insured.content.freeEdit.controls['Insured.CTel'].value;
    // }
    // freeEditRef.value?.setValue('CTele', CMobile);
  // }
};

const copyApplicant = () => {
  //根据tabs的名称获取tabs的实例，拿实例中的数据给这里的表单回显数据。使用该组件时再调整这里
  // const applicant = dataOperator.getTabByName(APPLICANT, route);
  // const applicant = { content: null };
  let operAppDatas = opertaor.getDataAll()['applicant'];  // 投保人数据
 
  freeEditRef.value?.setValue('CInvoiceType', '');
  // if (applicant && applicant.content) {
    freeEditRef.value?.setValue('CCustomerCode', '');   // 客户代码
    freeEditRef.value?.setValue('CCustomerType', '');   //客户类型
    freeEditRef.value?.setValue('CCustomerNm', '');    //客户名称
    freeEditRef.value?.setValue('CCertfCls', '');    //  证件类型
    freeEditRef.value?.setValue('CCertfCde', '');   // 证件号码
    freeEditRef.value?.setValue('CTele', '');   // 电话
    freeEditRef.value?.setValue('CEmail', '');   // 邮箱


    freeEditRef.value?.setValue('CCustomerCode', operAppDatas['Applicant.cInsuredCde']);
    freeEditRef.value?.setValue('CCustomerType',  operAppDatas['Applicant.cClntMrk']);
    freeEditRef.value?.setValue('CCustomerNm',  operAppDatas['Applicant.cAppNme']);
    freeEditRef.value?.setValue('CCertfCls',  operAppDatas['Applicant.cCertfCls']);
    freeEditRef.value?.setValue('CCertfCde',  operAppDatas['Applicant.cCertfCde']);
    freeEditRef.value?.setValue('CTele',  operAppDatas['Applicant.cMobile']);
    freeEditRef.value?.setValue('CEmail',  operAppDatas['Applicant.cEmail']);

    // formData.CCustomerCode = applicant.content.freeEdit.controls['Applicant.CAppCde'].value;
    // formData.CCustomerType = applicant.content.freeEdit.controls['Applicant.CClntMrk'].value;
    // formData.CCustomerNm = applicant.content.freeEdit.controls['Applicant.CAppNme'].value;
    // formData.CCertfCls = applicant.content.freeEdit.controls['Applicant.CCertfCls'].value;
    // formData.CCertfCde = applicant.content.freeEdit.controls['Applicant.CCertfCde'].value;
    // let CMobile = applicant.content.freeEdit.controls['Applicant.CMobile'].value;
    // if (CMobile === null) {
    //   CMobile = applicant.content.freeEdit.controls['Applicant.CTel'].value;
    // }
    // freeEditRef.value?.setValue('CTele', CMobile);
  // }
};

const close = (type) => {
 
  dialogVisible.value = false
  console.log('触发关闭了')
  // invoiceShow.value = false
  // 关闭该弹框
  emits('ok', type)
};

onMounted(() => {
  //投保单号；这里逻辑有问题，angular路径src\app\routes\pcis-main\prodDef\common\invoice-info-model\invoice-info-model.component.ts
  //     let CAppNo = freeEditRef.value?.getValue('CAppNo') 
 
  let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 投保单号
   setTimeout(()=>{
    freeEditRef.value?.setValue('CAppNo', CAppNo); 
    freeEditRef.value?.setValue('CGrpMrk', cGrpMrk); 
  },300)
 
  policyService.getTaxInfoByAppNo(CAppNo).then((response) => {
    if (response.code === 200) {
      if (response.data) {
        freeEditRef.value?.setValue('CCustomerCode', response.data.cCustomerCode);
        freeEditRef.value?.setValue('CCustomerType', response.data.cCustomerType);
        freeEditRef.value?.setValue('CCustomerNm', response.data.cCustomerNm);
        freeEditRef.value?.setValue('CInvoiceType', response.data.cInvoiceType);
        freeEditRef.value?.setValue('CTaxpayerId', response.data.cTaxpayerId);
        freeEditRef.value?.setValue('CCertfCls', response.data.cCertfCls);
        freeEditRef.value?.setValue('CCertfCde', response.data.cCertfCde);
        freeEditRef.value?.setValue('CBank', response.data.cBank);
        freeEditRef.value?.setValue('CAccountno', response.data.cAccountno);
        freeEditRef.value?.setValue('CTele', response.data.cTele);
        freeEditRef.value?.setValue('CEmail', response.data.cEmail);
        freeEditRef.value?.setValue('CAddress', response.data.cAddress);
      }
    } else {
      ElMessage.error('根据申请单号获取发票信息出现异常！');
    }
  }).catch(() => {
    ElMessage.error('根据申请单号获取发票信息出现异常！');
  });
});

</script>

<style scoped lang="scss">
/* Add your styles here */
</style>
