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
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res) => {
      if (res.code === 200) {
        const tabref = opertaor.getTableRefs();
        const cEdrType = param.cEdrType;
        let bussNo;
        let plyNo;
        let appTyp;
        let CDptCde;
        let COprCde;
        if (cEdrType === "2" || cEdrType === "3") {
          // 批改类型 2 注销 3 退保
          const edrBaseTab = tabref["edrBase"].getFromValue();
          bussNo = edrBaseTab["EdrBase.cAppNo"];
          plyNo = edrBaseTab["EdrBase.cPlyNo"];
          appTyp = edrBaseTab["EdrBase.cAppTyp"];
          CDptCde = edrBaseTab["EdrBase.cDptCde"];
          COprCde = user.opCde;
        } else {
          const baseTab = tabref["plyBase"].getFromValue();
          bussNo = baseTab["Base.cAppNo"];
          plyNo = baseTab["Base.cPlyNo"];
          appTyp = baseTab["Base.cAppTyp"];
          CDptCde = baseTab["Base.cDptCde"];
          COprCde = baseTab["Base.cOprCde"];
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
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res) => {
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
  getFormconfig,
});
</script>

<style scoped></style>
