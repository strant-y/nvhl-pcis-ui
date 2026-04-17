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
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { codeListViewStore } from "@/store";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
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
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

let cRsnDetailCde = ref(opertaor.getParam()?.cRsnDetailCde);
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
let para: any[] = [];

onMounted(() => {
  const routeData = route.params; // 获取路由参数
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);

  canOperateForm();

  nextTick(() => {
    setFormItem('Acctinfo.cBankRelTyp', {
      rules: [],
      clearable: true,
    })

    setFormItem('Acctinfo.cBankPro', {

      clearable: true,
    })
    setFormItem('Acctinfo.cBankCounty', {
      clearable: true,
    })
    setFormItem('Acctinfo.cBankArea', {
      clearable: true,
    })
    setFormItem('Acctinfo.cPubPri', {
      clearable: true,
    })
  })


	let timer = setInterval(() => {
		if (!getValue('Acctinfo.cAcctNme')) {
			setValue('Acctinfo.cAcctNme', opertaor.getDataAll()['applicant']?.['Applicant.cAppNme'])
			let cAcctNme = getValue('Acctinfo.cAcctNme')
			if (cAcctNme) {
				clearInterval(timer); //清除定时器
			}
		} else {
			clearInterval(timer); //清除定时器
		}
  }, 1000)
});

// 获取开户行省
const loadSelDataCounty = () => {

}


// 可以操作的配置项处理  身份认真里面的几项
const canOperateForm = () => {
  setFormItem("Acctinfo.cAcctNo", {
    disabled: false,
		// rules: [getRules("required", {})],
		rules: [getRules('bankNum',{})],
  });
  setFormItem("Acctinfo.cAcctNme", {
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
  // cBankRelTypFun: (val: any) => {
  //   console.log('123123',val)
  //       const param = opertaor.getParam();
  //       const isInit = param.initFlag; // 是否是初始化状态
  //     if(isInit)return;

  //   setValue('Acctinfo.cAcctNme', opertaor.getDataAll()['applicant']['Applicant.cAppNme'])



  //   if (val) {
  //     para = val.split("_");
  //     const bankname = para[1]; // 银行名称
  //     const isdefault = para[2]; // 是否默认值
  //     const banktype = para[3]; // 银行大类
  //     // 1直连银行 开户行 省、市、对公对私必填   0是非直联，开户行 省、市、区/县、开户行、对公对私必填


  //     if (isdefault === "1") {
  //       setValue("Acctinfo.cBankCnaps", "");
  //       setValue("Acctinfo.cBankCde", "");
  //       setValue("Acctinfo.cBankAddr", bankname);

  //       setFormItem("Acctinfo.cBankPro", {
  //         disabled: false,
  //         rules: [getRules("required", {})],
  //       });
  //       setFormItem("Acctinfo.cBankArea", {
  //         disabled: false,
  //         rules: [getRules("required", {})],
  //       });

  //       // 开户行县
  //       setFormItem("Acctinfo.cBankCounty", {
  //         // disabled: true, 
  //         rules: [],
  //       });

  //       // 对公对私
  //       setFormItem("Acctinfo.cPubPri", {
  //         disabled: false,
  //         rules: [getRules("required", {})],
  //       });

  //       // 开户行
  //       setFormItem("Acctinfo.cBankCde", {
  //         disabled: true,
  //         rules: [],
  //       });

  //     } else  if (isdefault === "0")  {
  //       setFormItem("Acctinfo.cBankPro", {
  //         disabled: false,
  //         rules: [getRules("required", {})],
  //       });
  //       setFormItem("Acctinfo.cBankArea", {
  //          disabled: false,
  //         rules: [getRules("required", {})],
  //       });

  //       setFormItem("Acctinfo.cBankCounty", {
  //         disabled: false,
  //         rules: [getRules("required", {})],
  //       });

  //       setFormItem("Acctinfo.cPubPri", {
  //         rules: [getRules("required", {})],
  //       });
  //        setValue("Acctinfo.cBankAddr", null);
  //       const data = tgtobjEditRef.value?.getFromValue();
  //       const cBankCde = data["Acctinfo.cBankCde"];
  //       if (cBankCde !== null && cBankCde !== "" && cBankCde !== undefined) {
  //         const arrayCBankCde = cBankCde.split("_");
  //         const codeCBankCde = arrayCBankCde[0];
  //         const nameCBankCde = arrayCBankCde[1];
  //         setValue("Acctinfo.cBankAddr", nameCBankCde);
  //         setValue("Acctinfo.cBankCnaps", codeCBankCde);
  //       }


  //     }



  //   if(para[3]){
  //        setFormItem("Acctinfo.cBankCde", {
  //           disabled: false,
  //           // rules: [getRules("required", {})],
  //         });

  //     codeListStore
  //       .queryCodeList(
  //         {
  //           codeListName: "CBankCdeList",
  //           codeListParam: {
  //             'banktypecod': para[3], 'areacode': getValue('Acctinfo.cBankCounty') || ""
  //           },
  //         },
  //       )
  //       .then((res) => {
  //         tgtobjEditRef.value?.addCodeListMap({
  //           code: "Acctinfo.cBankCde",
  //           list: res
  //         })
  //         // setFormItem("Acctinfo.cBankCde", {
  //         //   disabled: false,
  //         //   // rules: [getRules("required", {})],
  //         // });


  //       });
  //     }

  //   }else{
  //       // setValue("Acctinfo.cBankPro", "");
  //       // setValue("Acctinfo.cBankArea", "");
  //       // setValue("Acctinfo.cBankCounty", "");
  //       setValue("Acctinfo.cBankCnaps", "");
  //       // setValue("Acctinfo.cBankCde", "");
  //       setValue("Acctinfo.cBankAddr", '');
  //       setValue("Acctinfo.cPubPri", '');
  //       setFormItem("Acctinfo.cBankPro", {
  //         disabled: false,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cBankPro", {
  //         disabled: false,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cBankArea", {
  //         disabled: false,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cBankCounty", {
  //         // disabled: true,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cBankCde", {
  //         disabled: true,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cBankAddr", {
  //         disabled: false,
  //         rules: [],
  //       });
  //        setFormItem("Acctinfo.cPubPri", {
  //         rules: [],
  //       });
  //   }


  // },
  cBankRelTypFun: (val: any) => {
    console.log('银行大类值', val);
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否初始化/回显状态
    console.log('是否初始化/回显状态', isInit);

		// 自动填充账户名称为投保人姓名
		if (!isInit) {
			setValue('Acctinfo.cAcctNme', opertaor.getDataAll()['applicant']['Applicant.cAppNme'] || '');
		}

    // 规则：有银行大类值 无值→强制置灰   初始化不做处理  直连银行=1  不必填  非直连=0  必填  
    const setBankCdeStatusByCategory = (isRequired: any, isDisabled = false) => {
      setFormItem("Acctinfo.cBankCde", {
        rules: isRequired ? [getRules("required", {})] : [],
      });
      // debugger;
      // 初始化触发
      if (!isInit) {
        setFormItem("Acctinfo.cBankCde", {
          disabled: isDisabled
        });
      }
    };

    // 请求银行编码接口
    const loadBankCodeList = (banktype, countyCode) => {
      if (!banktype) return;

      codeListStore
        .queryCodeList({
          codeListName: "CBankCdeList",
          codeListParam: {
            'banktypecod': banktype,
            'areacode': countyCode || ""
          },
        })
        .then((res) => {
          tgtobjEditRef.value?.addCodeListMap({
            code: "Acctinfo.cBankCde",
            list: res || []
          });
        });
    };

    // 1. 有收款银行大类值（val存在）
    if (val) {
      para = val.split("_");
      const bankname = para[1] || '';
      const isdefault = para[2] || ''; // 1=直连，0=非直连
      const banktype = para[3] || '';
      const countyCode = getValue('Acctinfo.cBankCounty') || '';

      // 1.1 直连银行（特殊场景：即使有大类值也置灰）
      if (isdefault === "1") {
        if (!isInit) {
          setValue("Acctinfo.cBankCnaps", "");
          setValue("Acctinfo.cBankCde", "");
        }

        setValue("Acctinfo.cBankAddr", bankname);

        // 省、市、对公对私必填配置
        setFormItem("Acctinfo.cBankPro", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("Acctinfo.cBankArea", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("Acctinfo.cBankCounty", { disabled: false, rules: [] });
        setFormItem("Acctinfo.cPubPri", { disabled: false, rules: [getRules("required", {})] });


        setBankCdeStatusByCategory(false);
        // 加载下拉列表（即使置灰也需要数据）
        loadBankCodeList(banktype, countyCode);
      }

      // 1.2 非直连银行（根据大类值判断）
      else if (isdefault === "0") {
        // 省、市、区县、对公对私必填配置
        setFormItem("Acctinfo.cBankPro", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("Acctinfo.cBankArea", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("Acctinfo.cBankCounty", { disabled: false, rules: [getRules("required", {})] });
        setFormItem("Acctinfo.cPubPri", { disabled: false, rules: [getRules("required", {})] });
        setValue("Acctinfo.cBankAddr", null);

        // 处理已有银行编码回显
        const data = tgtobjEditRef.value?.getFromValue() || {};
        const cBankCde = data["Acctinfo.cBankCde"] || '';
        if (cBankCde) {
          const [codeCBankCde, nameCBankCde] = cBankCde.split("_") || ['', ''];
          setValue("Acctinfo.cBankAddr", nameCBankCde);
          setValue("Acctinfo.cBankCnaps", codeCBankCde);
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
      setValue("Acctinfo.cBankCnaps", "");
      setValue("Acctinfo.cBankAddr", '');
      setValue("Acctinfo.cPubPri", '');

      // 重置其他字段状态
      setFormItem("Acctinfo.cBankPro", { disabled: false, rules: [] });
      setFormItem("Acctinfo.cBankArea", { disabled: false, rules: [] });
      setFormItem("Acctinfo.cBankCounty", { disabled: false, rules: [] });
      setFormItem("Acctinfo.cBankAddr", { disabled: false, rules: [] });
      setFormItem("Acctinfo.cPubPri", { disabled: false, rules: [] });

      // 无大类值→强制置灰
      setBankCdeStatusByCategory(false, true);
    }
  },
  // 开户行省Acctinfo.cBankPro 
  // 市  Acctinfo.cBankArea
  // 县  Acctinfo.cBankCounty
  // 开户行 Acctinfo.cBankCde

  // 开户行省        
  cProvinceChange: (e: any) => {
    console.log('省', e);
    if (e) {
      let cBankArea = getValue('Acctinfo.cBankArea');

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
          tgtobjEditRef.value?.addCodeListMap({
            code: "Acctinfo.cBankArea",
            list: res
          })

          if (res.length > 0) {
            let delData = true;
            res.forEach((item: any) => {
              if (item['value'] == cBankArea) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('Acctinfo.cBankArea', null)
              setValue('Acctinfo.cBankCounty', null)
            }
          }


        });
    }
  },
  // 市  
  cCityChange: (e: any) => {
    console.log('市', e)
    if (e) {

      let cBankCounty = getValue('Acctinfo.cBankCounty');// 县
      let cBankPro = getValue('Acctinfo.cBankPro')   // 获取省
      console.log(11, cBankPro)
      codeListStore
        .queryCodeList(
          {
            codeListName: "CBankCountyList",
            codeListParam: { "areaprovince": cBankPro, "areaname": e },
            // codeListParam: {
            //   areaname: e
            // },
          },
        )
        .then((res) => {
          tgtobjEditRef.value?.addCodeListMap({
            code: "Acctinfo.cBankCounty",
            list: res
          })
          if (res.length > 0) {
            let delData = true;
            res.forEach((item: any) => {
              if (item['value'] == cBankCounty) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('Acctinfo.cBankCounty', null)
            }
          }
        });
    }
  },
  // 县
  cCountyChange: (val: any) => {
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否初始化/回显状态
    console.log(val, para[3])
    if (val && para[3]) {
      if (!isInit) {
        setFormItem("Acctinfo.cBankCde", {
          disabled: false
        });
      }

      let cBankCde = getValue('Acctinfo.cBankCde');

      codeListStore
        .queryCodeList(
          {
            codeListName: "CBankCdeList",
            codeListParam: {
              'banktypecod': para[3], 'areacode': val
              //         'banktypecod': banktype,
              // 'areacode': countyCode || ""
            },
          },
          
        )
        .then((res) => {
          console.log('来了里面', res)
          tgtobjEditRef.value?.addCodeListMap({
            code: "Acctinfo.cBankCde",
            list: res
          })


          if (res.length > 0) {
            let delData = true;
            res.forEach((item: any) => {
              if (item['value'] == cBankCde) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('Acctinfo.cBankCde', null)
              setValue("Acctinfo.cBankCnaps", null);
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
