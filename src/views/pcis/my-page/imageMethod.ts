import { dataOpertaor } from "@/store";
import { pageMethod } from "./pageMethod";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { checkAppBase } from "@/api/prod/index";

const policyService = new PolicyService();
export const imageMethod = {
  showImage: function (opertaor: any) {
    const param = {};
    const params = opertaor.getParam();
    const CEdrType = params.cEdrType;
    let ParamNo = null;
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    if (params?.pageName === "priceInquiry") {
      ParamNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
      param["cInquiryNo"] = ParamNo;
    } else {
      if (CEdrType === "2" || CEdrType === "3") {
        const edrBaseTab = opertaor.getFatherPage().getEdrbaseValue();
        ParamNo = edrBaseTab["EdrBase.cAppNo"];
      } else {
        ParamNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
      }
      param["cAppNo"] = ParamNo;
    }
    if (!ParamNo) {
      ElMessage.warning("申请单号为空！");
      return;
    }

    if (pageMethod.imageReadonly(opertaor) || (opertaor.getDataAll().plyBase?.['Base.cOprCde'] != user.opCde && opertaor.getDataAll().plyBase?.['Base.cOprCde'] != user.opCnm)) {
      // let ParamNo = null;
      let data = {
        COprCde: opertaor.getDataAll().plyBase?.['Base.cOprCde'], // 录单员id
        cOperatorId: user.opCde, // 操作员id
      };
      policyService.listEmployeesByRecorder(data).then((res: any) => {
        if (res.code === 200) {
          imageMethod.showImage2(opertaor,param,params)
        } else {
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
      })
    } else {
      imageMethod.showImage2(opertaor,param,params)
    }
  },

  showImage2: function (opertaor,param,params) {
    checkAppBase(param).then((res) => {
      if (res.code === 200) {
        const tabref = opertaor.getTableRefs();
        const cEdrType = params.cEdrType;
        let bussNo;
        let plyNo;
        let appTyp;
        let CDptCde;
        let COprCde;
        if (cEdrType === "2" || cEdrType === "3") {
          // 批改类型 2 注销 3 退保
          const edrBaseTab = opertaor.getFatherPage().getEdrbaseValue();
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
    });
  },

  showPositeImage: function (params: any) {
    console.log('showPositeImage', params)
    const base = params.plyBase;
    const cCombinationNo = params.cCombinationNo;
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    if (!base) {
      ElMessage.warning("请先保存组合单！");
      return;
    }

    const bussNo = cCombinationNo;
    const plyNo = cCombinationNo;
    const appTyp = base["Base.cAppTyp"];
    const CDptCde = base["Base.cDptCde"];
    const COprCde = base["Base.cOprCde"];

    if (!bussNo) {
      ElMessage.warning("组合单号为空！");
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
  },

};
