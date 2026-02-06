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
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import {checkAppBase} from "@/api/prod";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const policyService = new PolicyService();
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(createAppFreeEditConfig({}));

const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const user = idxParam?.user;

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  console.log('AgreementImagedInformation', formconfig11);
  Object.assign(formconfig1, formconfig11);
});


const method = {
  // 主联单证
  mainImage: () => {
    showImagSys("jino");
  },
// 影像上传管理
  imageUploadManage: () => {
    let param = {cEcAgrAppNo:''};
    const allFromData = formPage?.getAllFormData();
    const base = allFromData['AgreementBase'];
    param['cEcAgrAppNo'] = base["ECargoBase.cEcAgrAppNo"]
    checkAppBase(param).then((res:any) => {
      if (res.code === 200) {
        const cEdrType = idxParam?.param?.cEdrType;
        let bussNo;
        let plyNo;
        let appTyp;
        let CDptCde;
        let COprCde;
        if (cEdrType === "2" || cEdrType === "3") {
          // 批改类型 2 注销 3 退保
          const baseTab = allFromData['AgreementBase'];
          const edrBaseTab = allFromData['AgreementEdrEcargoBase'];
          bussNo = baseTab["ECargoBase.cEcAgrAppNo"];
          plyNo = edrBaseTab["EdrECargoBase.cPlyNo"];
          appTyp = edrBaseTab["EdrECargoBase.cAppTyp"];
          CDptCde = edrBaseTab["EdrECargoBase.cDptCde"];
          COprCde = user.opCde;
        } else {
          const baseTab = allFromData['AgreementBase'];
          bussNo = baseTab["ECargoBase.cEcAgrAppNo"];
          plyNo = baseTab["ECargoBase.cEcAgrNo"];
          appTyp = baseTab["ECargoBase.cAppTyp"];
          CDptCde = baseTab["ECargoBase.cDptCde"];
          COprCde = baseTab["ECargoBase.cOprCde"];
        }

        if (!bussNo) {
          ElMessage.warning("申请单号为空！");
          return;
        }

        if (!appTyp) {
          ElMessage.warning("保单类型为空！");
          return;
        }

        if (!CDptCde) {
          ElMessage.warning("机构为空！");
          return;
        }

        if (!COprCde) {
          ElMessage.warning("操作员为空！");
          return;
        }
        const data = {
          bussNo: bussNo,
          viewType: "upload",
          plyNo: plyNo,
          appTyp: appTyp,
          CDptCde: CDptCde,
          COprCde: COprCde,
        };
        policyService
            .imageInfoUpload(data)
            .then((res: any) => {
              if (res.code === 200) {
                window.open(res.url, "_blank");
              } else {
                ElMessage.error(res.msg);
              }
            })
            .catch((err: any) => {
              ElMessage.error(err);
            });
      } else {
        ElMessage.error("请先保存申请单!");
      }
    })
  },
  // 影像查看
  imageView: () => {
    let param = {cEcAgrAppNo:''};
    const allFromData = formPage?.getAllFormData();
    const base = allFromData['AgreementBase'];
    param['cEcAgrAppNo'] = base["ECargoBase.cEcAgrAppNo"]
    checkAppBase(param).then((res:any) => {
      if (res.code === 200) {
        showImagSys("manager");
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
};
function showImagSys(viewType: string) {
  let ParamNo;
  const CEdrType = param.cEdrType;
  const allFromData = formPage?.getAllFormData();
  const base = allFromData['AgreementBase'];
  if ("jino" === viewType) {
    ParamNo = base["ECargoBase.CJiNo"];
    const CCiMrk = base["ECargoBase.cCiMrk"];
    if ("6" === CCiMrk) {
      if (!ParamNo) {
        ElMessage.warning("请核实从联单中的主联单申请单号是否正确！");
        return;
      }
    } else {
      ElMessage.warning("请核实是否为从联单！");
      return;
    }
  } else {
    if (CEdrType === "2" || CEdrType === "3") {
      const edrBaseTab = allFromData['AgreementEdrEcargoBase'];
      ParamNo = edrBaseTab["ECargoBase.cEcAgrAppNo"];
    } else {
      ParamNo = base["ECargoBase.cEcAgrAppNo"];
    }

    if (!ParamNo) {
      ElMessage.warning("申请单号为空！");
      return;
    }
  }
  policyService
      .imageInfoShow({ ParamNo: ParamNo })
      .then((res: any) => {
        if (res.code === 200) {
          window.open(res.url, "_blank");
        } else {
          ElMessage.error(res.msg);
        }
      })
      .catch((err: any) => {
        ElMessage.error(err);
      });
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
