<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="imageEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {
  checkAppBase,
} from "@/api/prod/index";
const opertaor = dataOpertaor();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const imageEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
import { useRoute } from "vue-router";
const route = useRoute();
const param = route.params.param;
const user = JSON.parse(sessionStorage.getItem("user"));
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  // 主联单证
  mainImage: () => {
    showImagSys("jino");
  },
  // 影像上传管理
  imageUploadManage: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        const searchParams = {
          bussNo: param.cAppNo,// 业务单号 投保单号
          riskCode: param.cProdNo,// 险种代码
        };
        try {
          const res: any = policyService.listImage(searchParams);
          if(res.code === 200 && res.data.imgWebUrl) {
            window.open(res.data.imgWebUrl,'_blank')
          } else {
            ElMessage.error(res.msg);
          }
        } catch (error) {
          ElMessage.error(error);
        }
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  // 影像查看
  imageView: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        showImagSys("manager");
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
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

function showImagSys(viewType: string) {
  let ParamNo;
  const CEdrType = param.cEdrType;
  const base = opertaor.getTableRefs()["plyBase"].getFromValue();
  if ("jino" === viewType) {
    ParamNo = base["Base.CJiNo"];
    const CCiMrk = base["Base.cCiMrk"];
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
      const edrBaseTab = opertaor.getTableRefs()["edrBase"].getFromValue();
      ParamNo = edrBaseTab["EdrBase.cAppNo"];
    } else {
      ParamNo = base["Base.cAppNo"];
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
