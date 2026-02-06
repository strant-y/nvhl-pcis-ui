<template>
  <div class="app-container">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef"/>
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InsuranceLimit } from './service/index';
import { getListByCode } from '@/api/code-list-service';
import { AppKey } from "@/constants/api";
import AddOrEdit from './components/addOrEdit.vue';


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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { cloneDeep } from 'lodash-es';
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dzmodal = useDzModal();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const userStore = useUserStore();
const { getRules } = useValidator();
const CCertfClsType = ref('') //客户证件类型字段请求数据字典的type值
const CCertfClsType2 = ref('') //股东证件类型字段请求数据字典的type值
const CCertfCdeRules = ref([])
const CCertfCdeRules2 = ref([])
const chooseProdName = ref('') //当前选中的条款名称
const user = ref<any>({});
user.value = userStore.user || {};
const insuranceLimit = new InsuranceLimit();

const codeListMap = reactive<any>({
	Nature: [],
  persionType: [], //性质选择个人时，证件类型下拉值
  NV049001: [],  //性质选择法人时，证件类型下拉值
  kind: [], //产品大类下拉值
})

const companyCodeData = ref([]) //股东证件类型 下拉值
const cProdNoOptions:any = ref([]) //产品 下拉值

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          CCertfCdeRules.value = []
          CCertfCdeRules2.value = []
          freeEditRef.value.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "productCategories",
        inputtype: "rtselect",
        title: "产品大类",
        clearable: true,
        rules: [getRules("required", {})],
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
          freeEditRef.value?.setValue("cProdNo", null);
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
        }
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
          freeEditRef.value?.setValue("clauseCode", null);
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
            });
        }
      },
      {
        prop: "clauseCode",
        inputtype: "rtselect",
        title: "条款",
        clearable: true,
        // typeCode: "PROD_LIST",
        params: { },
        rules: [getRules("required", {})],
        func: (val, option) => {
          chooseProdName.value = option ? option.label : ''
        }
      },
      {
        prop: "customerNature",
        inputtype: "rtselect",
        title: "客户性质",
        clearable: true,
        loadData: [],
        typeCode: "INSURE_NATURE_CACHE",
        func: (val:any) => {
          handleNatureChange(val)
        }
      },
      {
        prop: "customerIdType",
        inputtype: "rtselect",
        title: "客户证件类型",
        clearable: true,
        loadData: [],
        func: (val) => {
          handleCertificateChange(val)
        }
      },
      {
        prop: "customerIdNumber",
        inputtype: "rtinput",
        title: "客户证件号码",
        clearable: true,
        rules: CCertfCdeRules
      },
      {
        prop: "customerName",
        inputtype: "rtinput",
        title: "客户名称",
        clearable: true,
      },
      {
        prop: "shareholderNature",
        inputtype: "rtselect",
        title: "股东性质",
        clearable: true,
        loadData: [],
        typeCode: "INSURE_NATURE_CACHE",
        func: (val) => {
          handleNatureChange2(val)
        }
      },
      {
        prop: "shareholderIdType",
        inputtype: "rtselect",
        title: "股东证件类型",
        clearable: true,
        loadData: [],
        func: (val) => {
          handleCertificateChange2(val)
        },
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
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: false,
    titleBtns: [
      createFreeButtonBase({
        id: "add",
        label: "新增",
        type: "success",
        hidden: true,
        func: function () {
          openEdit('save')
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row: any) => {
          return row.canEdit === '1' ? false : true
        },
        tableClick: (row) => {
          openEdit('update', row.cPkId)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        // hideBtns: (row: any) => {
        //   return row.canDelete === '1' ? false : true
        // },
        hidden: true,
        tableClick: (row) => {
          deleteData(row.cPkId)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "primary",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          openEdit('view', row.cPkId)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "productCategories",
        inputtype: "rtinput",
        title: "产品大类",
        formatter: (val) => {
          const item = codeListMap['kind'].find((item: any) => item.value === val);
          return item ? item.label : val
        }
      },
      {
        prop: "clauseName",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "customerNature",
        inputtype: "rtinput",
        title: "客户性质",
        formatter: (val) => {
          const item = codeListMap['Nature'].find((item: any) => item.value == val);
          return item ? item.label : val
        }
      },
      {
        prop: "customerIdType",
        inputtype: "rtinput",
        title: "客户证件类型",
        formatter: (val, row) => {
          let tempData = []
          if(row.customerNature == '1') { //个人
            tempData = codeListMap['persionType']
          } else {
            tempData = codeListMap['NV049001']
          }
          const item = tempData.find((item: any) => item.value == val);
          return item ? item.label : val
        }
      },
      {
        prop: "customerIdNumber",
        inputtype: "rtinput",
        title: "客户证件号码",
      },
      {
        prop: "customerName",
        inputtype: "rtinput",
        title: "客户名称",
      },
      {
        prop: "shareholderNature",
        inputtype: "rtinput",
        title: "股东性质",
        formatter: (val) => {
          const item = codeListMap['Nature'].find((item: any) => item.value === val);
          return item ? item.label : val
        }
      },
      {
        prop: "shareholderIdType",
        inputtype: "rtinput",
        title: "股东证件类型",
        formatter: (val, row) => {
          let tempData = []
          if(row.shareholderNature == '1') { //个人
            tempData = codeListMap['persionType']
          } else {
            tempData = codeListMap['NV049001']
          }
          const item = tempData.find((item: any) => item.value === val);
          return item ? item.label : val
        }
      },
      {
        prop: "shareholderIdNumber",
        inputtype: "rtinput",
        title: "股东证件号码",
      },
      {
        prop: "shareholderName",
        inputtype: "rtinput",
        title: "股东名称",
      },
      {
        prop: "stringNAmt",
        inputtype: "rtinput",
        title: "保额/限额",
      },
    ]
  })
);

const handleQuery = (flag = true) => {
  submitForm(flag)
}
const submitForm = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};


const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue()
  const params = Object.assign(s, r)
  params['prodCNmeCn'] = cProdNoOptions.value.find((item:any) => item.value === s.cProdNo)?.label || ''
  params.scenarioType = '0'
  params.clauseName = String(chooseProdName.value)
  insuranceLimit.qryList(params).then((res: any) => {
    if (res.code == '1') {
      const pageData = res;
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = pageData.result;
      }
    }
  });
};


//客户性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange = (value: string) => {
  if (value === '1') {
    setFormItem("customerIdType", { loadData: codeListMap['persionType'] })
  } else if (value === '0') {
    setFormItem("customerIdType", { loadData: codeListMap['NV049001'] })
  }
  freeEditRef.value?.setValue('customerIdType', null) //清空客户证件类型
  freeEditRef.value?.clearValidate('customerIdType')
  freeEditRef.value?.setValue('customerIdNumber', null) //清空客户证件号码值
  freeEditRef.value?.clearValidate('customerIdNumber') //
  freeEditRef.value?.setValue('customerName', null) //清空客户名称值
  freeEditRef.value?.clearValidate('customerName')
}

//股东性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange2 = (value: string) => {
  if (value === '1') {
    setFormItem("shareholderIdType", { loadData: codeListMap['persionType'] })
    companyCodeData.value = codeListMap['persionType']
  } else if (value === '0') {
    setFormItem("shareholderIdType", { loadData: codeListMap['NV049001'] })
    companyCodeData.value = codeListMap['NV049001']
  }
  freeEditRef.value?.setValue('shareholderIdType', null) //清空股东证件类型
  freeEditRef.value?.clearValidate('shareholderIdType')
  freeEditRef.value?.setValue('shareholderIdNumber', null) //清空股东证件号码值
  freeEditRef.value?.clearValidate('shareholderIdNumber')
  freeEditRef.value?.setValue('shareholderName', null) //清空股东证件号码值
  freeEditRef.value?.clearValidate('shareholderName')
}

//证件类型change
const handleCertificateChange = (value: string) => {
  freeEditRef.value?.setValue('customerIdNumber', null) //清空客户证件号码值
  freeEditRef.value?.clearValidate('customerIdNumber') //
  freeEditRef.value?.setValue('customerName', null) //清空客户名称值
  freeEditRef.value?.clearValidate('customerName')
  if (value == '111') { // 身份证号
    CCertfCdeRules.value = [getRules("idCard", {})]
  } else if (value == '01') { // 统一社会信用代码
    CCertfCdeRules.value = [getRules("socialCode", {})]
  } else if (value == '110001') { // 组织机构
    CCertfCdeRules.value = [getRules("orgCode", {})]
  } else if(value == '07') { // 护照
    CCertfCdeRules.value = [getRules("passPort", {})]
  } else if(value == '553') { //外国人永久居留身份证
    CCertfCdeRules.value = [getRules("ariCard", {})]
  } else if ('110002' === value) {  // 营业执照
    CCertfCdeRules.value = [getRules("businessLicense", {})]
  } else {
    CCertfCdeRules.value = [getRules("maxLength", {len: 20})]
  }
};

//股东证件类型change
const handleCertificateChange2 = (value: string) => {
  freeEditRef.value?.setValue('shareholderIdNumber', '') //清空股东证件号码值
  freeEditRef.value?.clearValidate('shareholderIdNumber')
  freeEditRef.value?.setValue('shareholderName', '') //清空股东证件号码值
  freeEditRef.value?.clearValidate('shareholderName')
  if (value == '111') { // 身份证号
    CCertfCdeRules2.value = [getRules("idCard", {})]
  } else if (value == '01') { // 统一社会信用代码
    CCertfCdeRules2.value = [getRules("socialCode", {})]
  } else if (value == '110001') { // 组织机构
    CCertfCdeRules2.value = [getRules("orgCode", {})]
  } else if(value == '07') { // 护照
    CCertfCdeRules2.value = [getRules("passPort", {})]
  } else if(value == '553') { //外国人永久居留身份证
    CCertfCdeRules2.value = [getRules("ariCard", {})]
  } else if ('110002' === value) {  // 营业执照
    CCertfCdeRules2.value = [getRules("businessLicense", {})]
  } else {
    CCertfCdeRules2.value = [getRules("maxLength", {len: 20})]
  }
};

const openEdit = (type: string, id?: string) => {
  dzmodal.open(AddOrEdit, { actionType: type, pageType: 'one', cPkId: id}).then((res) => {
    if (res.type === "ok") {
      handleQuery();
    }
  });
};

const deleteData = (id) => {
  ElMessageBox.confirm('确认要删除吗？该数据删除之后将无法恢复。', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    insuranceLimit.delData({ cPkId: id }).then((res: any) => {
      if (res.code == '1') {
        ElMessage.success(res.msg);
        handleQuery();
      } else {
        ElMessage.error(res.msg);
      }
    });
  }).catch(() => {
    //防止报错
  })
}

onMounted(() => {
  // 产品大类
	codeListStore.queryCodeList({
		codeListName: 'KIND_LIST_GRT',
		codeListParam: { cOperId: user.value['opCde'], cDptCde: user.value['companyId'] }
	}, false, true).then(res => {
		if (res) {
      nextTick(() => {
        const item = freeEditRef.value?.getFromSchemaItem('productCategories')
        item.loadData = res
      })
			codeListMap['kind'] = res;
		}
	}, () => {
		ElMessage.error('后台服务异常,请联系管理员');
	});
  // 客户性质/股东性质
	codeListStore.queryCodeList({
		codeListName: 'INSURE_NATURE_CACHE',
		codeListParam: { }
	}, false, true).then(res => {
		if (res) {
      nextTick(() => {
        const item = freeEditRef.value?.getFromSchemaItem('customerNature')
        const item2 = freeEditRef.value?.getFromSchemaItem('shareholderNature')
        item.loadData = res
        item2.loadData = res
      })
			codeListMap['Nature'] = res;
		}
	}, () => {
		ElMessage.error('后台服务异常,请联系管理员');
	});
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
  // 获取新增按钮显示权限
  insuranceLimit.jurisdictionInsert({}).then((res: any) => {
    if (res.code == '1') {
      const btn = tableconfig.titleBtns?.find(item => item.id === 'add');
      if(btn) {
        btn.hidden = false;
      }
    }
  }).catch((err:any) => {
    ElMessage.error(err.message);
  });
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
