<template>
  <!-- v-if="iscRsnDetailCde"  -->
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

let detailcodeArray =[
"保费调整",
"赔款后保额冲减",
"赔款后保额恢复",
"增加保额",
"减少保额",
"增加险别",
"变更清单信息",
"减少险别",
"变更保险期限",
"变更车辆信息",
"渠道信息变更",
"增减方案",
"变更投保数量",
"增加保费",
"变更每亩保费",
"减少保费",
"费率调整",
"报停展期",
"增加销售额",
"减少销售额",
"增加保费",
"减少保费",
"其他",
"更改客户信息",
"变更工程造价",
"减少被保险人",
"变更建筑面积",
"收费延期",
"增加被保险人",
"增加清单信息",
"不记名补录被保险人",
"全单注销",
"全单退保",
"一般退保",
"当期退",
"分期失效",
];

const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
const routeData = route.params ; // 获取路由参数 
  console.log("路由参数props.param1212", routeData.param);
   // console.log('pay form' ,props.pageSchema.fromSchema[2].disabled = false)

    const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
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



// 用来处理 哪些场景显示
const iscRsnDetailCde = computed(() => {
      if (cRsnDetailCde.value === null || cRsnDetailCde.value === undefined) {
        return false;
      }
      return detailcodeArray.includes(cRsnDetailCde.value);
    })


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

              setFormItem("Acctinfo.cBankCde", {
                rules: [getRules("required", {})],
              });


              setFormItem("Acctinfo.cPubPri", {
                rules: [getRules("required", {})],
              });
            }

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
