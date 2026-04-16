<!-- 发票弹框 -->
<template>
  <el-dialog v-model="dialogVisible"   width="90%">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";

import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps} from "@/views/pcis/support/useIdxParam";
import {useRoute} from "vue-router";

const route = useRoute();
// const idxParam: IdxParamProps = {
//   opertaorProps: { id: route.name },
//   cdeListViewProps: { id: route.name },
// };
// provide(idxParamKey, idxParam);

const props = defineProps({
  visible: {
      type: Boolean,
      default: false,
    },
  queryParam: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
	data: {
    type: Object,
    default: () => {
      return {}
    }
  },
  opertaor: {
    type: Object
  }
})

const opertaor = reactive(props.opertaor ?? {});
const isVisible = computed(() => props.visible);

let cGrpMrk =opertaor.getDataAll()?.['plyBase']?.['Base.cGrpMrk'];

let cCiMrk  = ref('0');   // 联共保  2 4显示

 console.log('999',cGrpMrk)

// const appLicantValue =tabref["applicant"].getFromValue()['Applicant.cAppNo'];  // 单据编号
const emits = defineEmits(['ok'])
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const dialogVisible = ref(true)
const policyService = new PolicyService();
const isHidden = ref(false)

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromUi: {
      cols: 2
    },
    endBtnsPosition: "right",
    title: '发票信息',
    endBtns:computed(() =>  [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        hidden: isHidden.value,
        func: async () => {
          saveTaxInfo()
        },
      }),
       createFreeButtonBase({
        type: "primary",
        label: "主共发票信息",
        hidden: (cCiMrk.value !== '2' && cCiMrk.value !== '4') || isHidden.value,
        func: async () => {
            let customerCode = '9'+ new Date().getTime();
            setValue('CCustomerCode', customerCode);
                  
            setFormItem('CCustomerType',{disabled:false})
            setFormItem('CCustomerNm',{disabled:false})
            setFormItem('CCertfCls',{disabled:false})
            setFormItem('CCertfCde',{disabled:false})
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "同投保人",
        hidden: isHidden.value,
        disabled: (cGrpMrk == 1),
        func: async () => {
          copyApplicant()
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "同被保人",
        hidden: isHidden.value,
        disabled: (cGrpMrk == 1),  //  0 个单  1团单  团单禁用
        func: async () => {
          copyInsured()
        },
      }),
      createFreeButtonBase({
        label: "关闭",
        hidden: isHidden.value,
        func: () => {
          console.log('cl  guanbi')
          close('close')
        },
      }),
    ]),
    


    fromSchema: [
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
        disabled: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "CCustomerCode",
        inputtype: "rtinput",
        title: "客户代码",
        // clearable: true,
         disabled: true,
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
        typeCode: "TYPE_OF_ID",
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

// 保存按钮
const saveTaxInfo = () => {
    // console.log('参数',freeEditRef.value?.getFromValue())
  // let operAppDatas = opertaor.getDataAll()['applicant'];  // 投保人数据
  // let operDatas = opertaor.getDataAll()['insured'];  // 被保人数据

  // let formData  = freeEditRef.value?.getFromValue();
  // freeEditRef.value?.validate().then((isValid) => {
  //   if (!isValid) {
  //     ElMessage.warning('请补全信息');
  //     return;
  //   }
  //       // 提取相关变量（根据实际场景替换获取方式）
  //   const applicantCCustomerType = operAppDatas['Applicant.cClntMrk'];  // 客户类型
  //   const insuredCCustomerType = operDatas['Insured.cClntMrk'];
  //   const applicantCertfCls = operAppDatas['Applicant.cCertfCls'];  // 证件类型
  //   const insuredCertfCls = operDatas['Insured.cCertfCls'];
  //   const applicantCertfCde = operAppDatas['Applicant.cCertfCde'];  // 证件号码
  //   const insuredCertfCde = operDatas['Insured.cCertfCde'];


  //   // 假设当前待判断的字段值（根据实际场景替换来源）
  //   const currentCustomerType = formData['CCustomerType']; // 例如表单中选择的客户类型
  //   const currentCertfCls = formData['CCertfCls'];// 例如表单中输入的证件类型
  //   const currentCertfCde = formData['CCertfCde'];// 例如表单中输入的证件号码
   

  //   // 拆解条件：三个子条件的 "或" 关系
  //   const condition3 = currentCustomerType !== applicantCCustomerType && currentCustomerType !== insuredCCustomerType; // 客户类型不等于投保人性质且不等于被保人性质
  //   const condition1 = currentCertfCls !== applicantCertfCls && currentCertfCls !== insuredCertfCls; // 证件类型不等于投保人且不等于被保人
  //   const condition2 = currentCertfCde !== applicantCertfCde && currentCertfCde !== insuredCertfCde; // 证件号码不等于投保人且不等于被保人

  //   // 总条件：满足任一子条件
  //   const shouldSetValue = condition1 || condition2 || condition3;
  //   console.log('判断信息，',currentCustomerType,currentCertfCls,currentCertfCde)
  //   console.log('判断信息，',condition3,condition1,condition2,operDatas)

  //   // 根据条件执行设置值操作
  //   if (shouldSetValue) {
  //     ElMessage.info("发票信息与客户信息不一致，请点击 '同被保人' 或 '同投保人' 按钮 ！")
  //     return  false;
  //     // freeEditRef.value?.setValue('CCertfCls', operAppDatas['Applicant.cCertfCls']);
  //     // freeEditRef.value?.setValue('CCertfCde', operAppDatas['Applicant.cCertfCde']);
  //   }

    // 安全获取数据源（避免undefined报错）
  const { applicant = {}, insured = {} } = opertaor.getDataAll() || {};
  const formData = freeEditRef.value?.getFromValue() || {};
  const ccimrk = opertaor.getTableRefByKey("plyBase")?.getValue("Base.cCiMrk");
  console.log('ccimrk‘',ccimrk)
  // 表单验证
  freeEditRef.value?.validate().then(isValid => {
    if (!isValid) {
      ElMessage.warning('请补全信息');
      return;
    }

    // 工具函数：统一处理空值（转为空字符串并去空格）
    const normalizeValue = (value) => {
      return value == null ? '' : String(value).trim();
    };

    // 提取并标准化数据（投保人/被保人信息）
    const baseInfo = {
      applicant: {
        customerType: normalizeValue(applicant['Applicant.cClntMrk']),
        certType: normalizeValue(applicant['Applicant.cCertfCls']),
        certNo: normalizeValue(applicant['Applicant.cCertfCde'])
      },
      insured: {
        customerType: normalizeValue(insured['Insured.cClntMrk']),
        certType: normalizeValue(insured['Insured.cCertfCls']),
        certNo: normalizeValue(insured['Insured.cCertfCde'])
      }
    };

    // 提取并标准化当前表单数据
    const currentInfo = {
      customerType: normalizeValue(formData['CCustomerType']),
      certType: normalizeValue(formData['CCertfCls']),
      certNo: normalizeValue(formData['CCertfCde'])
    };

    const isInconsistent = (currentVal, applicantVal, insuredVal) => {
      return currentVal && currentVal !== applicantVal && currentVal !== insuredVal;
    };

    // 批量判断三个字段的一致性
    const hasInconsistency = [
      isInconsistent(currentInfo.customerType, baseInfo.applicant.customerType, baseInfo.insured.customerType),
      isInconsistent(currentInfo.certType, baseInfo.applicant.certType, baseInfo.insured.certType),
      isInconsistent(currentInfo.certNo, baseInfo.applicant.certNo, baseInfo.insured.certNo)
    ].some(Boolean); // 任一不一致则返回true

    // 不一致提示
    console.log(!(ccimrk == '2' || ccimrk == '4'),hasInconsistency)
    if ( !(ccimrk == '2' || ccimrk == '4') && hasInconsistency) {
      ElMessage.info("发票信息与客户信息不一致，请点击 '同被保人' 或 '同投保人' 按钮 ！");
      return;
    }
    //  if(CIsFlag == "true" && !(ccimrk == '2' || ccimrk == '4')
    //   && ((CCertfCde !== insCCertfCde && CCertfCde !== appCCertfCde) 
    //  || (CCustomerNm !== insCInsuredNme && CCustomerNm !== appCAppNme)
    //  || (CCertfCls !== insCCertfCls && CCertfCls !== appCCertfCls)))
    
    policyService.saveTaxInfo(formData).then((response) => {
      if (response.code === 200) {
        ElMessage.success('保存成功');
        close('save');
      } else {
        ElMessage.error(response.msg );
      }
    }).catch((error) => {
      ElMessage.error('连接失败！' + error);
    });
  });
};

const copyInsured = () => {
  //根据tabs的名称获取tabs的实例，拿实例中的数据给这里的表单回显数据。使用该组件时再调整这里
  let operDatas = opertaor.getDataAll()['insured'];  // 被保人数据
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
    freeEditRef.value?.setValue('CCustomerNm',  operDatas['Insured.cInsuredNme']);
    freeEditRef.value?.setValue('CCertfCls',  operDatas['Insured.cCertfCls']);
    freeEditRef.value?.setValue('CCertfCde',  operDatas['Insured.cCertfCde']);
    freeEditRef.value?.setValue('CTele',  operDatas['Insured.cMobile']);
    freeEditRef.value?.setValue('CEmail',  operDatas['Insured.cEmail']);
};

const copyApplicant = () => {
  //根据tabs的名称获取tabs的实例，拿实例中的数据给这里的表单回显数据。使用该组件时再调整这里
  let operAppDatas = opertaor.getDataAll()['applicant'];  // 投保人数据
  console.log('投保人数据',operAppDatas)
 
  freeEditRef.value?.setValue('CInvoiceType', '');
    setValue('CCustomerCode', '');   // 客户代码
    setValue('CCustomerType', '');   //客户类型
    setValue('CCustomerNm', '');    //客户名称
    setValue('CCertfCls', '');    //  证件类型
    setValue('CCertfCde', '');   // 证件号码
    setValue('CTele', '');   // 电话
    setValue('CEmail', '');   // 邮箱
    setValue('CCustomerCode', operAppDatas['Applicant.cAppCde']);
    setValue('CCustomerType',  operAppDatas['Applicant.cClntMrk']);
    setValue('CCustomerNm',  operAppDatas['Applicant.cAppNme']);
    setValue('CCertfCls',  operAppDatas['Applicant.cCertfCls']);
    setValue('CCertfCde',  operAppDatas['Applicant.cCertfCde']);
    setValue('CTele',  operAppDatas['Applicant.cMobile']);
    setValue('CEmail',  operAppDatas['Applicant.cEmail']);
};

const close = (type) => {
 
  dialogVisible.value = false
  console.log('触发关闭了')
  // invoiceShow.value = false
  // 关闭该弹框
  emits('ok', type)
};

const isShow = () =>{
  dialogVisible.value = true
}

onMounted(() => {
  //申请单号；这里逻辑有问题，angular路径src\app\routes\pcis-main\prodDef\common\invoice-info-model\invoice-info-model.component.ts
  //     let CAppNo = freeEditRef.value?.getValue('CAppNo') 
 
  cCiMrk.value =opertaor.getTableRefByKey("plyBase")?.getValue('Base.cCiMrk')
  console.log(267,opertaor.getDataAll())
  console.log(268, opertaor.getTableRefByKey("plyBase")?.getValue('Base.cCiMrk')  )
  console.log(269,cCiMrk.value )
  console.log(269,formconfig1 )
  let CAppNo = opertaor.getDataAll()?.['applicant']?.['Applicant.cAppNo'];   // 申请单号
   nextTick(()=>{
    freeEditRef.value?.setValue('CAppNo', CAppNo); 
    freeEditRef.value?.setValue('CGrpMrk', cGrpMrk); 
		setFormItem('CCustomerType',{disabled:true})
		setFormItem('CCustomerNm',{disabled:true})
		setFormItem('CCertfCls',{disabled:true})
		setFormItem('CCertfCde',{disabled:true})
		// 所有查看详情页，发票信息弹框只读
		if (!!props.data?.pageType &&(props.data?.pageType == 'readonly' || props.data?.pageType == 'PLY_UW_PROCESS_SCENE' || props.data?.pageType == 'UW_READ_SCENE')) {
			isHidden.value = true
			freeEditRef?.value?.setDisabledAll(true);
		}
  })
 

  
  policyService.getTaxInfoByAppNo(CAppNo).then((response) => {
    if (response.code === 200) {
      // 未返回 发票数据自动同步投保人信息
      if (response.data) {
       setValue('CCustomerCode', response.data.cCustomerCode);
       setValue('CCustomerType', response.data.cCustomerType);
       setValue('CCustomerNm', response.data.cCustomerNm);
       setValue('CInvoiceType', response.data.cInvoiceType);
       setValue('CTaxpayerId', response.data.cTaxpayerId);
       setValue('CCertfCls', response.data.cCertfCls);
       setValue('CCertfCde', response.data.cCertfCde);
       setValue('CBank', response.data.cBank);
       setValue('CAccountno', response.data.cAccountno);
       setValue('CTele', response.data.cTele);
       setValue('CEmail', response.data.cEmail);
       setValue('CAddress', response.data.cAddress);

      }else{
        copyApplicant()
      }
    } else {
      ElMessage.error('根据申请单号获取发票信息出现异常！');
    }
  }).catch(() => {
    ElMessage.error('根据申请单号获取发票信息出现异常！');
  });
});


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
        }else{
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

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
</script>

<style scoped lang="scss">
/* Add your styles here */
</style>
