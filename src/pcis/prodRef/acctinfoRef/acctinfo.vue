<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
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
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();

const route = useRoute(); // 获取当前路由对象
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

let cRsnDetailCde = ref(opertaor.getParam()?.cRsnDetailCde);
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
let para: any[] = [];

onMounted(() => {
  const routeData = route.params; // 获取路由参数
  console.log("路由参数props.param1212", routeData);
  // console.log('pay form' ,props.pageSchema.fromSchema[2].disabled = false)

  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);

  canOperateForm();

  setTimeout(() => {
    setValue('Acctinfo.cAcctNme', opertaor.getDataAll()['applicant']['Applicant.cAppNme'])
    setFormItem('Acctinfo.cBankRelTyp',{
        rules: [],
        clearable: true, 
    })

    setFormItem('Acctinfo.cBankPro',{

        clearable: true, 
    })
    setFormItem('Acctinfo.cBankCounty',{
        clearable: true, 
    })
    setFormItem('Acctinfo.cBankArea',{
        clearable: true, 
    })
    setFormItem('Acctinfo.cPubPri',{
        clearable: true, 
    })
  }, 1000)
});

// 可以操作的配置项处理  身份认真里面的几项
const canOperateForm = () => {
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
  // setFormItem("Acctinfo.cBankCde", {
  //     disabled: false,
  //     // rules: [getRules("required", {})],
  //   });
  setFormItem("Acctinfo.cBankAddr", {
    disabled: false,
    // rules: [getRules("required", {})],
  });
  setFormItem("Acctinfo.cPubPri", {
    disabled: false,
    // rules: [getRules("required", {})],
  });
};

// 绑定方法
const method = {
  // func demo
  cBankRelTypFun: (val: any) => {
    
    setValue('Acctinfo.cAcctNme', opertaor.getDataAll()['applicant']['Applicant.cAppNme'])
    if (val) {


      para = val.split("_");
      const bankname = para[1]; // 银行名称
      const isdefault = para[2]; // 是否默认值
      const banktype = para[3]; // 银行大类
      console.log(313, val); 
      console.log(para,isdefault);
      // 1直连银行 开户行 省、市、对公对私必填   0是非直联，开户行 省、市、区/县、开户行、对公对私必填
      if (isdefault === "1") {
        console.log('进来了111')
        setFormItem("Acctinfo.cBankPro", {
          disabled: false,
          rules: [getRules("required", {})],
        });
        setFormItem("Acctinfo.cBankArea", {
          disabled: false,
          rules: [getRules("required", {})],
        });

        // 开户行县
        setFormItem("Acctinfo.cBankCounty", {
          // disabled: true, 
          rules: [],
        });

        // 对公对私
        setFormItem("Acctinfo.cPubPri", {
          disabled: false,
          rules: [getRules("required", {})],
        });

        // 开户行
        setFormItem("Acctinfo.cBankCde", {
          disabled: true,
          rules: [],
        });

      } else  if (isdefault === "0")  {
        setFormItem("Acctinfo.cBankPro", {
          disabled: false,
          rules: [getRules("required", {})],
        });
        setFormItem("Acctinfo.cBankArea", {
           disabled: false,
          rules: [getRules("required", {})],
        });

        setFormItem("Acctinfo.cBankCounty", {
          disabled: false,
          rules: [getRules("required", {})],
        });

        setFormItem("Acctinfo.cPubPri", {
          rules: [getRules("required", {})],
        });

        // 开户行
        setFormItem("Acctinfo.cBankCde", {
          disabled: false,
          rules: [],
        });
      }

      // 清空开户行

      if (isdefault === "1") {
        // setValue("Acctinfo.cBankPro", "");
        // setValue("Acctinfo.cBankArea", "");
        // setValue("Acctinfo.cBankCounty", "");
        setValue("Acctinfo.cBankCnaps", "");
        setValue("Acctinfo.cBankCde", "");
        setValue("Acctinfo.cBankAddr", bankname);
      } else  if (isdefault === "0"){
        setValue("Acctinfo.cBankAddr", null);
        const data = tgtobjEditRef.value?.getFromValue();
        const cBankCde = data["Acctinfo.cBankCde"];
        console.log('cBankCde',cBankCde)
        if (cBankCde !== null && cBankCde !== "" && cBankCde !== undefined) {
          const arrayCBankCde = cBankCde.split("_");
          const codeCBankCde = arrayCBankCde[0];
          const nameCBankCde = arrayCBankCde[1];
          setValue("Acctinfo.cBankAddr", nameCBankCde);
          setValue("Acctinfo.cBankCnaps", codeCBankCde);
        }
      }
    }else{
        // setValue("Acctinfo.cBankPro", "");
        // setValue("Acctinfo.cBankArea", "");
        // setValue("Acctinfo.cBankCounty", "");
        setValue("Acctinfo.cBankCnaps", "");
        setValue("Acctinfo.cBankCde", "");
        setValue("Acctinfo.cBankAddr", '');
        setValue("Acctinfo.cPubPri", '');
        setFormItem("Acctinfo.cBankPro", {
          disabled: false,
          rules: [],
        });
         setFormItem("Acctinfo.cBankPro", {
          disabled: false,
          rules: [],
        });
         setFormItem("Acctinfo.cBankArea", {
          disabled: false,
          rules: [],
        });
         setFormItem("Acctinfo.cBankCounty", {
          // disabled: true,
          rules: [],
        });
         setFormItem("Acctinfo.cBankCde", {
          disabled: true,
          rules: [],
        });
         setFormItem("Acctinfo.cBankAddr", {
          disabled: false,
          rules: [],
        });
         setFormItem("Acctinfo.cPubPri", {
          rules: [],
        });
    }
  },
  // 开户行省Acctinfo.cBankPro 
  // 市  Acctinfo.cBankArea
  // 县  Acctinfo.cBankCounty
  // 开户行 Acctinfo.cBankCde

  // 开户行省    市 cCityChange    县 cCountyChange
  cProvinceChange: (e: any) => {
    console.log(555, e);
    // setFormItem("Acctinfo.cBankArea", {
    //   disabled: false,
    //   typeCode: 'CBankAreaList',
    //   codeParam: { areaprovince: e },
    //   rules: [getRules("required", {})],
    // });
    const p = opertaor.getParam();
    console.log('开户',p)
    if (!p.initFlag) {
        setValue("Acctinfo.cBankArea", "");
    }

    if(e){
      
          // setValue("Acctinfo.cBankCounty", "");  
          codeListStore
          .queryCodeList(
            {
              codeListName: "CBankAreaList",
              codeListParam: {
                areaprovince: e
              },
            },
          )
          .then((res) => {

            console.log('111', res)
            tgtobjEditRef.value?.addCodeListMap({
              code: "Acctinfo.cBankArea",
              list: res
            })
            // setFormItem("Acctinfo.cBankArea", {
            //   disabled: false,
            //   rules: [getRules("required", {})],
            // });
          });
        }
  },

  cCityChange: (e: any) => {
    console.log('112', e)
    // setFormItem("Acctinfo.cBankCounty", {
    //   typeCode: 'CBankCountyList',
    //   codeParam: { areaname: e },
    //   disabled: false,
    //   rules: [getRules("required", {})],
    // });
    if(3){
      codeListStore
      .queryCodeList(
        {
          codeListName: "CBankCountyList",
          codeListParam: {
            areaname: e
          },
        },
      )
      .then((res) => {
        tgtobjEditRef.value?.addCodeListMap({
          code: "Acctinfo.cBankCounty",
          list: res
        })
        // setFormItem("Acctinfo.cBankCounty", {
        //   disabled: false,
        //   // rules: [getRules("required", {})],
        // });
      });
        }
  },
  cCountyChange: (val: any) => {
    console.log(5556, para[3], val);

    // setFormItem("Acctinfo.cBankCde", {
    //   disabled: false,
    //   typeCode: 'CBankCdeList',
    //   // codeParam: { 'banktypecod': para[3], 'areacode': val },
    //   codeParam: { banktypecod: para[3], areacode: val },
    //   rules: [getRules("required", {})],
    // });
     if(3){
      codeListStore
        .queryCodeList(
          {
            codeListName: "CBankCdeList",
            codeListParam: {
              'banktypecod': para[3], 'areacode': val
            },
          },
        )
        .then((res) => {
          tgtobjEditRef.value?.addCodeListMap({
            code: "Acctinfo.cBankCde",
            list: res
          })
          // setFormItem("Acctinfo.cBankCde", {
          //   disabled: false,
          //   rules: [getRules("required", {})],
          // });
        });
      }
  },
  // 开户行  
  cBankCdeChange: (val: any) => {
    console.log(val, '开户行')
    if (val) {
      let backAddr = val.split('_');
      setValue('Acctinfo.cBankCnaps', backAddr[0])
      setValue('Acctinfo.cBankAddr', backAddr[1])
    }
  },
};

//给表单下拉项赋值
const setFormItem = (key: any, obj: any) => {
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
};



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

function getFormconfig() {
  return formconfig1;
}
function setDisabledAll(isDisabled: boolean) {
  tgtobjEditRef?.value?.setDisabledAll(isDisabled);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  setFormItem,
  setDisabledAll
});
</script>

<style scoped></style>
