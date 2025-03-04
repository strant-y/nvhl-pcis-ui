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
// import { BaseCheck } from '@/utils/base-check';

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
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const userStore = useUserStore();

const props = defineProps({
  pageType: { //one 单一产品；all 全部产品
    type: String,
    required: true
  },
  actionType: { // add 新增； update 修改
    type: String,
    required: true
  }
})
const emits = defineEmits(['ok'])
const { getRules } = useValidator();
const dialogVisible = ref(true)
const user = ref(userStore.user)
const CCertfClsType = ref('INSURE_NATURE_CACHE') //客户证件类型字段请求数据字典的type值
const CCertfClsType2 = ref('INSURE_NATURE_CACHE') //股东证件类型字段请求数据字典的type值
const CCertfCdeRules = ref([getRules("required", {})])
const settingOne = ref([])
const insuranceLimit = new InsuranceLimit();

if (props.pageType === 'one') {
  settingOne.value = [
    {
      prop: "CClntMrk",
      inputtype: "rtcascader",
      title: "产品大类",
      clearable: true,
      typeCode: "KIND_LIST_GRT",
      param: { cOperId: user.value['opCde'], cDptCde: user.value['companyId'] },
    },
    {
      prop: "CClntMrk",
      inputtype: "rtcascader",
      title: "条款",
      clearable: true,
      typeCode: "PROD_LIST_GRT",
      param: { cParCde: '', cOperId: user.value['opCde'], cDptCde: user.value['companyId'] },
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
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "保额/限额",
        clearable: true,
      },
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "客户性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        param: {},
        func: (val) => {
          handleNatureChange(val)
        }
      },
      {
        prop: "CCertfCls",
        inputtype: "rtselect",
        title: "客户证件类型",
        clearable: true,
        typeCode: CCertfClsType,
        param: {},
        func: (val) => {
          handleCertificateChange(val)
        }
      },
      {
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "客户证件号码",
        clearable: true,
        rules: CCertfCdeRules
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "客户名称",
        clearable: true,
      },
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "股东性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        param: {},
        func: (val) => {
          handleNatureChange2(val)
        }
      },
      {
        prop: "CCertfCls",
        inputtype: "rtselect",
        title: "股东证件类型",
        clearable: true,
        typeCode: CCertfClsType2,
        param: {},
      },
      {
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "股东证件号码",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "股东名称",
        clearable: true,
      },
    ],
  })
);


// 证件号码
// const idCard = (rule: any, value: any, callback: any) => {
//   return BaseCheck.idCard(value) ? callback(BaseCheck.idCard(value)) : callback();
// }
// //统一社会信用代码校验
// const socialCode = (rule: any, value: any, callback: any) => {
//   return BaseCheck.socialCode(value) ? callback(BaseCheck.socialCode(value)) : callback();
// }
// //组织机构校验
// const orgCode = (rule: any, value: any, callback: any) => {
//   return BaseCheck.orgCode(value) ? callback(BaseCheck.orgCode(value)) : callback();
// }
// /**
//  *自然人姓名
//  */
// const perName = (rule: any, value: any, callback: any) => {
//   return BaseCheck.perName(value) ? callback(BaseCheck.perName(value)) : callback();
// }
const rules = reactive({
  limit: [
    { required: true, message: '不能为空!', trigger: 'change' },
  ],
  CClntMrk: [
    { required: true, message: '不能为空!', trigger: 'change' },
  ],
  CCertfCls: [
    { required: true, message: '不能为空!', trigger: 'change' },
  ],
  CCertfCde: [
    { required: true, message: '不能为空!', trigger: 'blur' },
    // { validator: idCard, trigger: 'blur' },
    { max: 20, message: '长度不能超过 20 个字符', trigger: 'blur' },
  ],
  CAppNme: [
    { required: true, message: '不能为空!', trigger: 'blur' },
    // { validator: perName, trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
  ],
});



const submitForm = () => {
  const r = freeEditRef.value?.getFromValue();
  const params = Object.assign({}, r);
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      //新增和编辑是否要区分接口 actionType
      insuranceLimit.saveData(params).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success('保存成功');
          closeDialog()
        }
      });
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};
//通知父组件更新列表
const closeDialog = () => {
  emits('ok')
};


//客户性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange = (value: string) => {
  if (value === '1') {
    CCertfClsType.value = 'NATURAL_CERTIFICATE_CACHE';
  } else if (value === '0') {
    CCertfClsType.value = 'UN_NATURAL_CERTIFICATE_CACHE';
  }
}

//股东性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange2 = (value: string) => {
  if (value === '1') {
    CCertfClsType2.value = 'NATURAL_CERTIFICATE_CACHE';
  } else if (value === '0') {
    CCertfClsType2.value = 'UN_NATURAL_CERTIFICATE_CACHE';
  }
}

//证件类型change
const handleCertificateChange = (value: string) => {
  freeEditRef.value?.setValue('CCertfCde', '') //清空客户证件号码值
  freeEditRef.value?.clearValidate('CCertfCde') //客户证件号码
  if (value == '120001') {
    CCertfCdeRules.value = [getRules("idCard", {}), getRules("required", {})]
  } else if (value == '110005') {
    CCertfCdeRules.value = [getRules("required", {}), getRules("socialCode", {})]
  } else if (value == '110001') {
    CCertfCdeRules.value = [getRules("required", {}), getRules("orgCode", {})]
  } else {
    CCertfCdeRules.value = [getRules("required", {}),]
  }
};


onMounted(() => {
  
});

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
