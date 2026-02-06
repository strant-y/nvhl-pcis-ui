<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import {formInit} from "@/shared/from-init";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const { getRules } = useValidator();
import { codelistQuery } from "@/api/dict";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(createAppFreeEditConfig({}));

const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const user = idxParam?.user;
const initFlag = computed(() => formPage.init);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});
let para: any[] = [];

onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  console.log('AgreementAcctinfo', formconfig11);
	Object.assign(formconfig1, formconfig11);
	canOperateForm();

  nextTick(() => {
    setFormItem('ECargoAcctinfo.cBankRelTyp', {
      rules: [],
      clearable: true,
    })

    setFormItem('ECargoAcctinfo.cBankPro', {
      clearable: true,
    })
    setFormItem('ECargoAcctinfo.cBankCounty', {
      clearable: true,
    })
    setFormItem('ECargoAcctinfo.cBankArea', {
      clearable: true,
    })
    setFormItem('ECargoAcctinfo.cPubPri', {
      clearable: true,
    })
  })

});

// 可以操作的配置项处理  身份认真里面的几项
const canOperateForm = () => {
  setFormItem("ECargoAcctinfo.cAcctNo", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cBankRelTyp", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cBankPro", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cBankArea", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cBankCounty", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cBankAddr", {
    disabled: false,
  });
  setFormItem("ECargoAcctinfo.cPubPri", {
    disabled: false,
  });
};

const method = {
	cBankRelTypFun: (val: any) => {
    console.log('银行大类值', val);
    console.log('是否初始化/回显状态', initFlag);
		const applicantValue = formPage.getFormDataById('AgreementApplicant')
    // 自动填充账户名称为投保人姓名
    setValue('ECargoAcctinfo.cAcctNme', applicantValue['ECargoApplicant.cAppNme'] || '');

    // 规则：有银行大类值 无值→强制置灰   初始化不做处理  直连银行=1  不必填  非直连=0  必填  
    const setBankCdeStatusByCategory = (isRequired: any, isDisabled = false) => {
      setFormItem("ECargoAcctinfo.cBankCde", {
        rules: isRequired ? [getRules("required", {})] : [],
      });
      // 初始化触发
      if (!initFlag) {
        setFormItem("ECargoAcctinfo.cBankCde", {
          disabled: isDisabled
        });
      }
    };

    // 请求银行编码接口
    const loadBankCodeList = (banktype, countyCode) => {
      if (!banktype) return;
      codelistQuery({
          codeListName: "CBankCdeList",
          codeListParam: {
            'banktypecod': banktype,
            'areacode': countyCode || ""
          },
        })
        .then((res) => {
          freeEditRef.value?.addCodeListMap({
            code: "ECargoAcctinfo.cBankCde",
            list: res.data || []
          });
        });
    };

    // 1. 有收款银行大类值（val存在）
    if (val) {
      para = val.split("_");
      const bankname = para[1] || '';
      const isdefault = para[2] || ''; // 1=直连，0=非直连
      const banktype = para[3] || '';
      const countyCode = getValue('ECargoAcctinfo.cBankCounty') || '';

      // 1.1 直连银行（特殊场景：即使有大类值也置灰）
      if (isdefault === "1") {
        if (!initFlag) {
          setValue("ECargoAcctinfo.cBankCnaps", "");
          setValue("ECargoAcctinfo.cBankCde", "");
        }

        setValue("ECargoAcctinfo.cBankAddr", bankname);

        // 省、市、对公对私必填配置
        setFormItem("ECargoAcctinfo.cBankPro", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("ECargoAcctinfo.cBankArea", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("ECargoAcctinfo.cBankCounty", { disabled: false, rules: [] });
        setFormItem("ECargoAcctinfo.cPubPri", { disabled: false, rules: [getRules("required", {})] });

        setBankCdeStatusByCategory(false);
        // 加载下拉列表（即使置灰也需要数据）
        loadBankCodeList(banktype, countyCode);
      }
      // 1.2 非直连银行（根据大类值判断）
      else if (isdefault === "0") {
        // 省、市、区县、对公对私必填配置
        setFormItem("ECargoAcctinfo.cBankPro", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("ECargoAcctinfo.cBankArea", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("ECargoAcctinfo.cBankCounty", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("ECargoAcctinfo.cPubPri", { disabled: false, rules: [getRules("required", {})] });
        setValue("ECargoAcctinfo.cBankAddr", null);

        // 处理已有银行编码回显
        const data = freeEditRef.value?.getFromValue() || {};
        const cBankCde = data["ECargoAcctinfo.cBankCde"] || '';
        if (cBankCde) {
          const [codeCBankCde, nameCBankCde] = cBankCde.split("_") || ['', ''];
          setValue("ECargoAcctinfo.cBankAddr", nameCBankCde);
          setValue("ECargoAcctinfo.cBankCnaps", codeCBankCde);
        }

        // 非直连银行：有大类值且非特殊场景 
        setBankCdeStatusByCategory(true);
        // 加载下拉列表
        loadBankCodeList(banktype, countyCode);
      }
    }
    // 2. 无收款银行大类值（val不存在）
    else {
      // 重置相关字段值
      setValue("ECargoAcctinfo.cBankCnaps", "");
      setValue("ECargoAcctinfo.cBankAddr", '');
      setValue("ECargoAcctinfo.cPubPri", '');

      // 重置其他字段状态
      setFormItem("ECargoAcctinfo.cBankPro", { disabled: false, rules: [] });
      setFormItem("ECargoAcctinfo.cBankArea", { disabled: false, rules: [] });
      setFormItem("ECargoAcctinfo.cBankCounty", { disabled: false, rules: [] });
      setFormItem("ECargoAcctinfo.cBankAddr", { disabled: false, rules: [] });
      setFormItem("ECargoAcctinfo.cPubPri", { disabled: false, rules: [] });

      // 无大类值→强制置灰
      setBankCdeStatusByCategory(false, true);
    }
  },
  // 开户行省Acctinfo.cBankPro 
  // 市  ECargoAcctinfo.cBankArea
  // 县  ECargoAcctinfo.cBankCounty
  // 开户行 ECargoAcctinfo.cBankCde
  // 开户行省        
  cProvinceChange: (e: any) => {
    console.log('省', e);
    if (e) {
      let cBankArea = getValue('ECargoAcctinfo.cBankArea');
      codelistQuery(
          {
            codeListName: "CBankAreaList",
            codeListParam: {
              areaprovince: e
            },
          },
        )
        .then((res) => {
          freeEditRef.value?.addCodeListMap({
            code: "ECargoAcctinfo.cBankArea",
            list: res.data || []
          })

          if (res.data.length > 0) {
            let delData = true;
            res.data.forEach((item: any) => {
              if (item['value'] == cBankArea) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('ECargoAcctinfo.cBankArea', null)
              setValue('ECargoAcctinfo.cBankCounty', null)
            }
          }
        });
    }
	},
	
  // 市  
  cCityChange: (e: any) => {
    console.log('市', e)
    if (e) {
      let cBankCounty = getValue('ECargoAcctinfo.cBankCounty');// 县
      let cBankPro = getValue('ECargoAcctinfo.cBankPro')   // 获取省
      console.log(11, cBankPro)
      codelistQuery(
          {
            codeListName: "CBankCountyList",
            codeListParam: { "areaprovince": cBankPro, "areaname": e },
          },
        )
        .then((res) => {
          freeEditRef.value?.addCodeListMap({
            code: "ECargoAcctinfo.cBankCounty",
            list: res.data || []
          })
          if (res.data.length > 0) {
            let delData = true;
            res.data.forEach((item: any) => {
              if (item['value'] == cBankCounty) {
                delData = false;
              }
            })
            // 判断是否有可以清空的数据
            if (delData) {
              setValue('ECargoAcctinfo.cBankCounty', null)
            }
          }
        });
    }
	},
	
  // 县
  cCountyChange: (val: any) => {
    console.log(val, para[3])
    if (val && para[3]) {
      if (!initFlag) {
        setFormItem("ECargoAcctinfo.cBankCde", {
          disabled: false
        });
      }
      let cBankCde = getValue('ECargoAcctinfo.cBankCde');
      codelistQuery(
          {
            codeListName: "CBankCdeList",
            codeListParam: {
              'banktypecod': para[3], 'areacode': val
            },
          },
        )
        .then((res) => {
          console.log('来了里面', res)
          freeEditRef.value?.addCodeListMap({
            code: "ECargoAcctinfo.cBankCde",
            list: res.data || []
          })

          if (res.data.length > 0) {
            let delData = true;
            res.data.forEach((item: any) => {
              if (item['value'] == cBankCde) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('ECargoAcctinfo.cBankCde', null)
              setValue("ECargoAcctinfo.cBankCnaps", null);
            }
          }
        });
    }
	},

  // 开户行  
  cBankCdeChange: (val: any) => {
    console.log(val, '开户行')
    if (val) {
      let backAddr = val.split('_');
      setValue('ECargoAcctinfo.cBankCnaps', backAddr[0])
      setValue('ECargoAcctinfo.cBankAddr', backAddr[1])
    }
  },
}

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

function getFormValue() {
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
function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return freeEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  freeEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  getFormBtn,
  setDisabledAll
});
</script>
