<template>
  <app-free-edit    :freeEditConfig="formconfig1" ref="tgtobjEditRef" /> 
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

const route = useRoute(); // 获取当前路由对象
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
 
});

let cRsnDetailCde = ref(route.params.param?.cRsnDetailCde);
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
const routeData = route.params ; // 获取路由参数 
  console.log("路由参数props.param1212", routeData.param,);
   // console.log('pay form' ,props.pageSchema.fromSchema[2].disabled = false)

    const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );

  console.log('数据',formconfig11)
  Object.assign(formconfig1, formconfig11);

  canOperateForm();
  // setFormItem("Acctinfo.cBankRelTyp", {
  //       disabled: false,
  //       rules: [getRules("required", {})],
  //     });

      
});

// 可以操作的配置项处理  身份认真里面的几项
const canOperateForm= ()=>{
    setFormItem("Acctinfo.cAcctNo", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankRelTyp", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankPro", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankArea", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankCounty", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankCde", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cBankAddr", {
        disabled: false,
        // rules: [getRules("required", {})],
      });
    setFormItem("Acctinfo.cPubPri", {
        disabled: false,
        // rules: [getRules("required", {})],
      });


}

// 绑定方法
const method = {
  // func demo
  cBankRelTypFun: (val:any) => {
    console.log(313,val)

    const para = val.split('_');
            const bankname = para[1];  	// 银行名称
            const isdefault = para[2]; 	// 是否默认值
            const banktype = para[3];  	// 银行大类
            console.log(para)
            // 1直连银行 开户行 省、市、对公对私必填   0是非直联，开户行 省、市、区/县、开户行、对公对私必填
            if (isdefault === '1') {    
              setFormItem("Acctinfo.cBankPro", {
             
                rules: [getRules("required", {})],
              });
              setFormItem("Acctinfo.cBankArea", {
                disabled: true,
                rules: [getRules("required", {})],
              });

              setFormItem("Acctinfo.cBankCounty", {
                disabled: true,
                rules: [getRules("required", {})],
              });


              setFormItem("Acctinfo.cPubPri", {
                rules: [getRules("required", {})],
              });
            }else {
              setFormItem("Acctinfo.cBankPro", {
                rules: [getRules("required", {})],
              });
              setFormItem("Acctinfo.cBankArea", {
                rules: [getRules("required", {})],
              });

              setFormItem("Acctinfo.cBankCounty", {
                rules: [getRules("required", {})],
              });

         

              setFormItem("Acctinfo.cPubPri", {
                rules: [getRules("required", {})],
              });
            }

            setFormItem("Acctinfo.cBankCde", {
                codeParam: { 'banktypecod': para[0]  },
                rules: [getRules("required", {})],
              });


  },

  // 开户行省    市 cCityChange    县 cCountyChange
  cProvinceChange:(e)=>{
    console.log(555,e)
    setFormItem("Acctinfo.cBankArea", {
                disabled: false,
                codeParam: { 'areaprovince': e },
                // changeFn: {
                //         next: (value: any) => {
                //             this.freeEdit.controls['CBankArea'].reset();

                //             if (!!value) {
                //                 const preParam = this.freeEdit.controls['CBankArea']['param'];
                //                 let cParCde = {'areaprovince': value};
                //                 if (!value) {
                //                     cParCde = {'areaprovince': '-1'};
                //                 }
                //                 this.freeEdit.controls['CBankArea']['param'] = Object.assign(preParam, cParCde);
                //             }
                //         }
                //     },
                rules: [getRules("required", {})],
              });

  },
  cCityChange:(e)=>{
 
    setFormItem("Acctinfo.cBankCounty", {
              codeParam: { 'areaname': e},
                disabled: false,
                rules: [getRules("required", {})],
              });
  },
  cCountyChange:()=>{
    console.log(5556)
  },

};


//给表单下拉项赋值
const setFormItem = (key, obj) =>{
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
}

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return tgtobjEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  tgtobjEditRef?.value?.setFormValue(value);
}

function validate() {
  return tgtobjEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  tgtobjEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return tgtobjEditRef?.value?.getValue(key);
}

function getFormconfig(){
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped></style>
