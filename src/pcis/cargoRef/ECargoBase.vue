<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialog"></comDialog>
<!--  <input-->
<!--      type="file"-->
<!--      ref="fileInputRef"-->
<!--      style="display: none"-->
<!--      @change="handleFileChange"-->
<!--  />-->
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore,dataOpertaor, useProductStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
import { useRoute } from "vue-router";
import {getBsnsTypList,getChaTypeList,getChaSubtypList,} from "@/api/code-list-service";
const route = useRoute();
const fileInputRef = ref(null);
const idxParam = inject<any>('idxParam', {});
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const user = idxParam?.user;
const opertaor = dataOpertaor();

onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    initComp();
  })
});


// 组件初始化方法
function initComp() {
  //业务来源大类下拉数据
  getBsnsTypList({ CDptCde: user.companyId, CKindNo: '02'}).then((res) => {
    if (null != res && null != res["code"]) {
      if (res["code"] === 200) {
        baseEditRef.value?.addCodeListMap({
          code: 'ECargoBase.cBsnsTyp',
          list: res.data
        });
      }
    }
  });

}

// 绑定方法
const method = {
  // func demo
  funcquery: () => {},

  cCiMrkChange: (val: string) => {
    idxParam.ciJiMrk = val;
    const ciAgreementECargo = formPage.getComponentRefById('AgreementCiTcp');
    if(ciAgreementECargo) {
      ciAgreementECargo.cCiMrkChangeFun({cCiMrk: val})
    }
    const cargoCiRef = formPage.getComponentRefById('AgreementCi');
    if (!!cargoCiRef) {
      cargoCiRef.initCiInfo({
        cCiMrk: val
      });
    }
  },
  //业务来源大类change事件
  businessKindFunc: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("ECargoBase.cChaType", "");
      setValue("ECargoBase.cChaSubtype", "");
    }
    if (val) {
      getChaTypeList({ BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }).then(
        (res) => {
          if (null != res && null != res["code"]) {
            if (res["code"] === 200) {
              baseEditRef.value?.addCodeListMap({
                code: 'ECargoBase.cChaType',
                list: res.data
              });
            }
          }
        }
      );
      nextTick(() => {
        if (val === "19002" || val === "19003") {
          //代理业务 | 经纪业务
          const obj = {
            rules: [getRules("required", {})],
            btnItems: {
              disabled: false,
            },
          };
          setFormItem("ECargoBase.cBrkrCde", {...obj,disabled:0}); //代理(经纪)人
          setFormItem("ECargoBase.cBrkSlsCde", obj); //代理业务员
          setFormItem("ECargoBase.cAgtAgrNo", { rules: [getRules("required", {})] }); //代理合作协议
        } else {
          const obj = {
            rules: [],
            disabled: true,
            btnItems: {
              disabled: true,
            },
          };
          setFormItem("ECargoBase.cBrkrCde", obj); //代理(经纪)人
          setFormItem("ECargoBase.cBrkSlsCde", obj); //代理业务员

          setFormItem("ECargoBase.cAgtAgrNo", { rules: null }); //代理合作协议
          if (!p.initFlag) {
            setValue("ECargoBase.cBrkrCde", "");
            setValue("ECargoBase.cBrkSlsCde", "");
            setValue("ECargoBase.cAgtAgrNo", "");
          }
          nextTick(() => {
            plyBaseEditRef.value?.clearValidate("ECargoBase.cBrkSlsCde");
          });
        }
      });
    }
  },
    //业务来源中类
  businessFunc: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("ECargoBase.cChaSubtype", "");
    }

    if (val) {
      const params = {
        CChaType: val,
        flag: 1,
        scene: "PLY_APP_NEW_SCENE",
      };
      if (val === "1900201") {
        //个人代理
        const obj = {
          rules: null,
          btnItems: {
            disabled: true,
          },
        };
        if (!p.initFlag) {
          setFormItem("ECargoBase.cSlsId", obj); //业务员工号
        }
        setFormItem("ECargoBase.cSlsId", { rules: null }); //业务员工号
        setValue("ECargoBase.cSlsId", "");
      } else {
        const obj = {
          rules: [getRules("required", {})],
          btnItems: {
            disabled: false,
          },
        };
        if (!p.initFlag) {
          setFormItem("ECargoBase.cSlsId", obj); //业务员工号
        }
        setFormItem("ECargoBase.cSlsId", { rules: [getRules("required", {})] }); //业务员工号
      }

      getChaSubtypList(params).then((res) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            baseEditRef?.value?.addCodeListMap({
              code: 'ECargoBase.cChaSubtype',
              list: res.data
            })
            // const obj = {
            //   loadData: res.data,
            // };
            // setFormItem("ECargoBase.cChaSubtype", obj);
          }
        }
      });
    }
  },
  //业务来源子类
  businessSubFunc: (val) => {
    // 清除代理(经纪)人、代理业务员的值
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("ECargoBase.cBrkrCde", "");
      setValue("ECargoBase.cBrkSlsCde", "");
    }
  },
  //代理(经纪)人icon事件
  agentFunc: () => {
    console.log("代理(经纪)人icon事件");
    if (getValue("ECargoBase.cBsnsTyp") && getValue("ECargoBase.cBsnsTyp") !== "19001") {
      dialogRef.value?.open(
        "agentPre",
        {
          type: "show",
          data: {
            CDptCde: sessionData.value?.cDptCde, //机构
            CProdNo: sessionData.value?.cProdNo, //产品
            cBsnsTyp: getValue("ECargoBase.cBsnsTyp"), //业务来源大类
            cChaType: getValue("ECargoBase.cChaType"), //业务来源中类
            cChaSubtype: getValue("ECargoBase.cChaSubtype"), //业务来源子类
          },
          method: {
            getSelected: (params) => {
              setFormItem("ECargoBase.cBrkrCde", {
                loadData: [{ value: params.CChaCde, label:params.CChaCde + params.CChaNme }],
              });
              setValue("ECargoBase.cBrkrCde", params.CChaCde);
              setValue("ECargoBase.cAgtAgrNo", params.CAgtAgrNo);

              console.log("回显----", params);

              dialogRef.value?.handleClose();
            },
          },
        },
        {
          isOk: (selectdata: any) => {
            console.log("a", selectdata);
          },
        },
        { title: "代理查询", width: 85 }
      );
    } else {
      ElMessage.warning("渠道分类--请选择非直销业务!");
    }
  },
};

function getFormValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

function getFormConfig(){
  return formconfig1;
}

function getFormBtn() {
  return baseEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  baseEditRef?.value?.setDisabledAll(isDisabled);
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {formBtn[key].hidden = isDisabled;})
  }
}

defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormBtn,
  getFormConfig,
  setDisabledAll
});
</script>

<style scoped></style>
