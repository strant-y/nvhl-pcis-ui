<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElCascader, ElSelect, ElOption, ElButton, ElTable, ElTableColumn, ElPagination, ElMessageBox, ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { getListByCode } from '@/api/code-list-service';
import { AppKey } from '@/constants/api';
import { SCENE_TEMPLATE } from '@/constants/tab-constants';

import { useUserStore } from "@/store/modules/user";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref<any>(userStore.user);
const { getRules } = useValidator();

const policyService = new PolicyService();
const prodList = ref([]); //产品的下拉数据
const kindNoSubRules = ref([]) //产品小类校验规则
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
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "PrdProdTemplate.CTplNme",
        inputtype: "rtinput",
        title: "模板名称",
        clearable: true,
      },

      // typeCode: "KIND_LIST_GRT",
      // child: "cProdNo",
      // filterable: true,
      // clearable: true,
      // codeParam: {
      //   cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
      //   cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
      // },
      {
        prop: "Base.cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        clearable: true,
        func: (val) => {
          if (val) {
            console.log('vvvv', val)
            // setFormI 
            setFormItem('PrdProdTemplate.CProdNo', {
              typeCode: "PROD_LIST",
              codeParam: {
                cParCde: val,
                cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
              }

            })
          }
          // handleKindNoChange(val)
        }
      },
      // {
      //   prop: "CKindNoSub",
      //   type: "hidden",
      //   inputtype: "rtselect",
      //   title: "产品小类",
      //   loadData: [
      //     { value: '1', label: '国内' },
      //     { value: '2', label: '出口' },
      //     { value: '3', label: '进口' }
      //   ],
      //   rules: kindNoSubRules,
      //   clearable: true,
      //   func: (val) => {
      //     handleCKindNoSubChange(val)
      //   }
      // },
      {
        prop: "PrdProdTemplate.CProdNo",
        inputtype: "rtselect",
        title: "产品",
        clearable: true,
        // loadData: prodList,
        // typeCode: "PROD_LIST",

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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "编辑",
      //   type: "success",
      //   size: "large",
      //   icon: "Edit",
      //   tableClick: (row) => {
      //     edit(row)
      //   },
      // }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          deleteRow(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cTplNme",
        inputtype: 'rtinput',
        title: "模板名称",
      },
      {
        prop: "cDesc",
        inputtype: 'rtinput',
        title: "说明",
      },
    ],
  })
);

//产品大类change
const handleKindNoChange = (value: any[]) => {
  if (value === '02') {
    console.log('模板val', value)
    nextTick(() => {
      let item = freeEditRef.value.getFromSchemaItem('CKindNoSub')
      item.type = ''
    })
    kindNoSubRules.value = [getRules("required", {})]
  } else {
    nextTick(() => {
      let item = freeEditRef.value.getFromSchemaItem('CKindNoSub')
      item.type = 'hidden'
    })
    kindNoSubRules.value = []
    freeEditRef.value?.setValue('CKindNoSub', '')
  }
  getCProdNoOption()
};
//获取产品options
const getCProdNoOption = () => {
  getListByCode('PROD_LIST', { cParCde: '' }).then((res: any) => {
    if (res && res.data) {
      //清空产品的值并给下拉数据赋值
      freeEditRef.value?.setValue('PrdProdTemplate.CProdNo', '')
      prodList.value = res.data.map((item: any) => ({ value: item.value, label: item.label }));
    }
  });
};
//选择产品小类后根据选择的数据再次获取产品options
const handleCKindNoSubChange = (value: string) => {
  if (value) {
    const CKindNo = freeEditRef.value?.getValue('Base.cKindNo')
    getListByCode('PROD_LIST_IN_GUIDE', { cParCde: CKindNo, subProd: value }).then((res: any) => {
      if (res && res.data) {
        //清空产品的值并给下拉数据赋值
        freeEditRef.value?.setValue('PrdProdTemplate.CProdNo', '')
        prodList.value = res.data.map((item: any) => ({ value: item.value, label: item.label }));
      }
    });
  }
};

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

const deleteRow = (row: any) => {
  ElMessageBox.confirm('该数据删除之后将无法恢复。', '确认要删除吗？', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    policyService.deleteTemplate(row.cPkId).then((result: any) => {
      if (result.code === 200) {
        ElMessage.success('删除成功');
        handleQuery(true)
      } else {
        ElMessage.error(result.msg);
      }
    });
  })
};

const edit = (row: any) => {
  const params = {};
  params['Base.CProdNo'] = row.cProdNo;
  params['scene'] = SCENE_TEMPLATE;
  params['cPkId'] = row.cPkId;
};

const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const obj = {
    'PrdProdTemplate.CCrtCde': user.value.opCde,
    'CKindNoSub': null
  }
  const params = Object.assign(s, r, obj)
  policyService.searchTemplate(params).then((result: any) => {
    if (result.code === 200) {
      ElMessage.success('查询成功');
      console.log('result', result)
      pageresult.list = result.res;
      pageresult.total = result.res.length;
    } else {
      ElMessage.error(result.msg);
    }
  });
};

onMounted(() => {
  handleQuery();
});


//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});

</script>

<style scoped lang="scss">
/* 添加样式 */
</style>
