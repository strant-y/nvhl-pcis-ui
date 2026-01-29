<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="underwriteEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const policyService = new PolicyService();
const dzmodal = useDzModal();
const RiskunitA = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/pages/RiskunitA.vue")
);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const { getRules } = useValidator();
const props = defineProps({
  // param: {
  //     type: [Object],
  // },
  pageData: {
    type: [Object],
  },
});
const { getCUndrMrk, getBackClsList, queryRiskCodelist, riskQueryData, riskQueryDataXJ, queryRiskCodelistXJ } = NewUdrListService();
const undrOpnMap = {
  "0": "经过审核，同意承保该业务。",
  "1": "经过审核，该业务缺少如下必要信息，请补充后再提交：",
  "2": "经过审核，该业务必须修改如下承保条件：",
  "3": "经过核算，该业务的前线费用已经超出我司规定的上限，请将费用控制在        %以内。",
  "4": "经过审核，我司决定放弃该业务，原因如下：",
  "5":
    "此业务已经超出本级别核保权限，提交上级核保。" +
    "\n" +
    "初步审核意见如下：",
  "6": "经过审核，同意承保该业务。",
};
const underwriteEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user"));
const bzFlag = ref(false);
const params = opertaor.getParam();
const contRiskInfo = ref("");
const cProdNoMap = ['059011','059012','059013','059016','059017','059018','059019','059020'];
const cUndrMrkOptions = ref([])
const riskunitDisabledFlag = ref(false)
const riskunitDisabled = computed(() => {
  return cProdNoMap.indexOf(params.cProdNo) != -1 || params.cAppTyp === "E" || riskunitDisabledFlag.value
})
const checkboxDisabledFlag = ref(false)
const riFacMrkDisabled = computed(() => {
  return params.cAppTyp === "E" || checkboxDisabledFlag.value
})
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        inputtype: "rtButton",
        itemWidth: 2,
        btnWidth: 60,
        btnItems: {
          label: "风险单位划分、风险累积及分保安排",
          type: "primary",
          disabled: riskunitDisabled,
          func: () => {
            //  触发临分后不能改变风险等级，临分退回后可以改变。
            dzmodal.open(RiskunitA, { type: "", param: {insrnc: opertaor.getDataAll()["insrnc"]}, idxParam: idxParam }).then((res:any) => {
              if (res.type === "ok" && res.body) {
                // cReadOnly 是否可编辑 0 否 1 是
                if(res.body.cReadOnly === "1") {
                  setFormItem('cIsExcluding', { disabled: false })
                  setValue('cIsExcluding', res.body.cExc)
                }
              }
            });
          },
        },
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "riFacMrk",
        inputtype: "rtcheckbox",
        title: "是否临分",
        propWidth:35,
        keymap: {
          'y': "1",
          'n': "0",
        },
        defaultValue: "0",
        rules: [getRules("required", {})],
        disabled: riFacMrkDisabled, // 批单不允许进行自主临分
        func: (val: any) => {
          if (val == "1") {
            // 勾选临分时，临分意见必填
            setFormItem("riFacOpn", {
              rules: [getRules("required", {})],
            });
            setFormItem("riFacMrk", {
              btnItems: {disabled: params.cAppTyp !== "E" ? false : true},
            });
          } else {
            setFormItem("riFacOpn", {
              rules: [],
            });
            setFormItem("riFacMrk", {
              btnItems: {disabled: true},
            });
          }
        },
        showExBtn: true,
        btnWidth: 80,
        btnItems: {
          label: "自主临分提交",
          type: "primary",
          disabled: true, // 批单不允许进行自主临分
          func: async () => {
            setFormItem("riFacMrk", {
              btnItems: {disabled: true}
            });
            const riskDataIsMultiple = await getRiskDataIsMultiple();
            if(riskDataIsMultiple) {
              ElMessage.warning("多险位不可以自主临分，请检查险位信息。");
              setFormItem("riFacMrk", {
                btnItems: {disabled: false}
              });
              return;
            }
            const param = {
              cDocTyp: params.cAppTyp, // 单证类型 A 保单 E 批单
              cAppNo: params.cAppNo, // 保批单申请单号
              nEdrPrjNo: props.pageData?.plyBase["Base.nEdrPrjNo"], // 批改序号
              cPlyNo: params.plyNo, // 保单号
              cInsrntNme: props.pageData?.insured["Insured.cInsuredNme"], // 被保人名称
              tInsmcBgnTm: props.pageData?.insrnc["Base.tInsrncBgnTm"], // 保险起期
              tInsmcEndTm: props.pageData?.insrnc["Base.tInsrncEdnTm"], // 保险止期
              cProdNo: params.cProdNo, // 产品编码
              cProdNme: params.cTermNme, // 产品名称
              cDptCde: params.cDptCde, // 机构代码
              // nAmtChgRate: null,// 保额币种汇率
              // nPrmChgRate: null,// 保费币种汇率
              tEdrBgnTm: props.pageData?.edrbase ? ["EdrBase.tEdrBgnTm"] : "", // 批改生效起期
              // tEdrEndTm: null,// 批改生效止期
              cLastOpn: underwriteEditRef.value?.getValue("riFacOpn"), // 临分意见
            };
            if(params.cProdNo === "010001" || params.cProdNo === "010002" || params.cProdNo === "010003" || params.cProdNo === "010007") {
              param.cDductDesc = props.pageData?.deductibleDist && props.pageData?.deductibleDist[0] ? props.pageData?.deductibleDist[0]["DeductibleDist.cDeductibleContent"] : ""; // 免赔约定
            }
            const checkLibertyInfo = params.pageName === "priceInquiry" ? await policyService.checkLibertyXJ(param) : await policyService.checkLiberty(param);
            if(checkLibertyInfo && checkLibertyInfo.code === '1') {
              ElMessageBox.confirm("自主临分已提交，请线下向再保部提交临分申报材料！", "提示", {
                showCancelButton: false,
                confirmButtonText: "确定",
                type: "warning",
                lockScroll: false,
              }).then(() => {});
              // 自主临分成功后，是否临分、风险单位划分不可编辑，不能核保退回
              setFormItem("riFacMrk", {
                btnItems: {disabled: true}
              });
              checkboxDisabledFlag.value = true
              riskunitDisabledFlag.value = true
              setFormItem("cUndrMrk",{ loadData: cUndrMrkOptions.value.filter((item:any) => item.value != "B" && item.value != "T") })
              setValue("cUndrMrk", "")
            } else if(checkLibertyInfo && checkLibertyInfo.code === '2') {
              ElMessage.error("满足强制临分，不能自主临分");
              // 满足强制临分，不能自主临分
              setFormItem("riFacMrk", {
                btnItems: {disabled: true}
              });
              checkboxDisabledFlag.value = true
              riskunitDisabledFlag.value = true
              setFormItem("cUndrMrk",{ loadData: cUndrMrkOptions.value.filter((item:any) => item.value != "B" && item.value != "T") })
              setValue("cUndrMrk", "")
            } else {
              ElMessage.error(checkLibertyInfo.message);
              setFormItem("riFacMrk", {
                btnItems: {disabled: false}
              });
            }
          },
        },
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "riFacOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "临分意见",
        rows: 3,
        itemWidth: 2,
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "cRiFacFeeOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "临分反馈意见",
        rows: 3,
        itemWidth: 2,
        disabled: true,
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "cFacObReOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "预约分保意见",
        rows: 3,
        itemWidth: 2,
        disabled: true,
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "cIsExcluding",
        inputtype: "rtselect",
        title: "是否再保比例分保合同除外业务",
        rules: [{ type: "required" }],
        loadData: [
          { value: "1", label: "是" },
          { value: "0", label: "否" },
        ],
        disabled: true,
        func: (val: any) => {
          if (val === "1") {
            setFormItem("riFacMrk", {
              btnItems: {disabled: true}
            });
            checkboxDisabledFlag.value = true
            if (!bzFlag.value && params.initFlag == false && !params.cProdNo?.startsWith('05')) {
              ElMessageBox.confirm(
                "该业务认定为非水险比例分保合同除外业务，是否查看该险种合同除外责任并进一步确认。",
                "提示",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  lockScroll: false,
                }
              ).then(() => {});
            }
            setFormItem("cIsExcluding", {
              btnItems: {disabled: false}
            });
          } else {
            setFormItem("cIsExcluding", {
              btnItems: {disabled: true}
            });
          }
        },
        itemWidth: 2,
        showExBtn: true,
        clearable: true,
        btnItems: {
          label: "查看再保比例分保合同除外责任",
          type: "primary",
          disabled: true,
          func: () => {
            if (contRiskInfo.value == "" || contRiskInfo.value == null) {
              ElMessage.warning("该产品无再保比例分保合同除外责任！");
            } else {
              showContRiskInfo(contRiskInfo.value);
            }
          },
        },
        hidden: params.pageName === "priceInquiry"
      },
      {
        prop: "cUndrMrk",
        inputtype: "rtselect",
        title: "核保选项",
        loadData: [
          {value: 'A', label: '同意'},
          {value: 'R', label: '上报'},
          {value: 'B', label: '退回给出单员'},
          {value: 'T', label: '退回至指定核保级别人员'}
        ],
        rules: [getRules("required", {})],
        clearable: true,
        func: (v:any) => {
          setValue("cUndrOpnList", "");
          if ("A" === v) {
            if ("E" === params["cAppTyp"]) {
              setFormItem("cUndrOpnList", {
                loadData: [{ label: "审核通过", value: "6" }],
              });
              setValue("cUndrOpnList", "6");
            } else {
              setFormItem("cUndrOpnList", {
                loadData: [{ label: "审核通过", value: "0" }],
              });
              setValue("cUndrOpnList", "0");
            }
          } else if ("R" === v) {
            setFormItem("cUndrOpnList", {
              loadData: [{ label: "提交上级", value: "5" }],
            });
            setValue("cUndrOpnList", "5");
          } else if(!v) {
            setFormItem("cUndrOpnList", {
              loadData: [],
            });
          } else {
            setFormItem("cUndrOpnList", {
              loadData: [
                { label: "缺少必要信息", value: "1" },
                { label: "修改承保条件", value: "2" },
                { label: "费用超标", value: "3" },
                { label: "拒绝承保", value: "4" },
                { label: "录入错误", value: "7" },
                { label: "资料不全", value: "8" },
                { label: "其他", value: "9" },
              ],
            });
            setValue("cUndrOpnList", "9");
          }
          if ("T" === v) {
            setValue("cBckOp", "");
            setFormItem("cBckOp", {
              hidden: false,
              rules: [getRules("required", {})],
            });
            const param = {
              usrDptCde: user["companyId"],
              operId: user["opCde"],
              prodNo: params.cProdNo,
              appNo: params.cAppNo,
              dptCde: params.cDptCde,
            };
            console.log(param);
            getBackClsListUrlFn(param);
          } else {
            setFormItem("cBckOp", {
              hidden: true,
              rules: "",
            });
            setValue("cBckOp", "");
          }
        },
      },
      {
        prop: "cUndrOpnList",
        inputtype: "rtselect",
        title: "核保意见选项",
        loadData: [
          { label: "审核通过", value: "0" },
          { label: "缺少必要信息", value: "1" },
          { label: "修改承保条件", value: "2" },
          { label: "费用超标", value: "3" },
          { label: "拒绝承保", value: "4" },
          { label: "其他", value: "5" },
        ],
        rules: [getRules("required", {})],
        itemWidth: 1,
        valueSpan: 10,
        clearable: true,
        func: (val: any) => {
          const data = val ? undrOpnMap[val] : "";
          underwriteEditRef.value?.setValue("undrOpn", data);
        },
      },
      {
        prop: "undrOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "核保意见",
        rows: 3,
        itemWidth: 2,
      },
      {
        prop: "cIsTransaction",
        inputtype: "rtselect",
        title: "关联交易确认",
        rules: [{ type: "required" }],
        itemWidth: 1,
        loadData: [
          { value: "1", label: "是" },
          { value: "0", label: "否" },
        ],
        clearable: true,
        func:(val:any)=>{
            if(val ==='1'){
                setFormItem("cRelationNo",{ hidden: false})
                setFormItem("cUploadSign",{ hidden: false})
            }else{
                setFormItem("cRelationNo",{ hidden: true})
                setFormItem("cUploadSign",{ hidden: true})
            }
        }
      },

      {
        prop: "cRelationNo",
        inputtype: "rtinput",
        title: "关联交易审批单编号",
        hidden: true,
         itemWidth: 0.5,
      },
      {
        prop: "cUploadSign",
        inputtype: "rtcheckbox",
        title: "是否上传关联交易审批单",
         itemWidth: 0.5,
         hidden: true,
        keymap: {
          y: "1",
          n: "0",
        },
      },

      {
        prop: "cIsRiskExp",
        inputtype: "rtselect",
        title: "是否需要风险查勘",
        rules: [{ type: "required" }],
        loadData: [
          { value: "1", label: "是" },
          { value: "0", label: "否" },
        ],
        itemWidth: 1,
        clearable: true,
        hidden: params.pageName === "priceInquiry" ? true : false,
        func: (val:any) => {
          if(val === "1") {
            setFormItem("cUndrMrk", {
              loadData: [{value: 'B', label: '退回给出单员'}],
            });
            setValue("cUndrMrk", "B");
          } else {
            setFormItem("cUndrMrk", {
              loadData: cUndrMrkOptions.value,
            });
            setValue("cUndrMrk", "");
          }
        }
      },

      {
        prop: "cBckOp",
        inputtype: "rtselect",
        title: "退回核保级别",
        loadData: [],
        clearable: true,
      },
      {
        prop: "riFacMrk1",
        inputtype: "rtselect",
        title: "再保退回",
        rules: [{ type: "required" }],
        loadData: [
          { value: "1", label: "是" },
          { value: "2", label: "否" },
        ],
        clearable: true,
        hidden: params.pageName === "priceInquiry" ? true : false,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
  })
);

function getFromValue() {
  return underwriteEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  underwriteEditRef?.value?.setFormValue(value);
}

function validate() {
  return underwriteEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  underwriteEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return underwriteEditRef?.value?.getValue(key);
}
function getCUndrMrkUrlFn(prarm) {
  getCUndrMrk(prarm).then((r: any) => {
    console.log(prarm);
    if (r.code == 200) {
      cUndrMrkOptions.value = r["data"];
      setFormItem("cUndrMrk", {
        loadData: r["data"],
      });
    }
  });
}
function getBackClsListUrlFn(prarm) {
  getBackClsList(prarm).then((r: any) => {
    console.log(prarm);
    if (r.code !== 200) {
      ElMessage.error({ message: r.msg, duration: 6000 });
    } else {
      setFormItem("cBckOp", {
        loadData: r["data"],
      });
      if(r["data"]?.length === 1) {
        setValue("cBckOp", r["data"][0]["value"]);
      }
    }
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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

function showContRiskInfo(text: any) {
  ElMessageBox.alert(text, "再保比例分保合同除外责任", {
    confirmButtonText: "确定",
    customStyle: {
      "min-width": "650px",
      'white-space': 'pre'
    },
  });
}

watch(
  () => props.pageData,
  (newVal) => {
    // 触发自主临分之后  不能做风险单位划分  可以做核保通过 核保退回需要再保部确认
    // 触发强制临分之后   不能做风险单位划分  核保通过时得再保部确认才能核保通过 核保退回需要再保部确认
    if(props.pageData?.plyBase) {
      if(props.pageData?.plyBase['Base.cRiFacMrk'] == "1" || props.pageData?.plyBase['Base.cRiFacMrk'] == "2") {// 1 自主临分 2 强制临分 3 不需要临分
        riskunitDisabledFlag.value = true
        checkboxDisabledFlag.value = true
        setFormItem("riFacMrk", {
          btnItems: {disabled: true}
        });
        // 临分标识如果是1，则是否临分复选框设置勾选状态
        setValue("riFacMrk", props.pageData?.plyBase['Base.cRiFacMrk'] == "1" ? "1" : "0");
      }
      // 反显临分意见
      if(props.pageData?.plyBase['Base.cRiFacOpn']) {
        setValue("riFacOpn", props.pageData?.plyBase['Base.cRiFacOpn']);
      }
      // 反显临分反馈意见
      if(props.pageData?.plyBase['Base.cRiFacFeeOpn']) {
        setValue("cRiFacFeeOpn", props.pageData?.plyBase['Base.cRiFacFeeOpn']);
      }
    }
  },
  {
    deep: true,
  }
);

onMounted(() => {
  nextTick(() => {
    console.log(cUndrMrkOptions)
    setValue("cIsRiskExp", "0");
    // Base.cRiFacMrk
    setValue("riFacMrk", "0")
    const param = {
      cProdNo: params.cProdNo,
      opCde: user.opCde,
      companyId: user.companyId,
      cPlanNo: params.cPlanNo,
    };
    if(params.pageName === "priceInquiry") {
      param.cInquiryNo = params.cInquiryNo
    } else {
      param.cAppNo = params.cAppNo
    }
    // 如果不是关联交易，则关联交易显示否且不可编辑
    if (
      params.cRelateBusi &&
      params.cEdrRsnBundleCde !== "s1" &&
      params.cEdrRsnBundleCde !== "s2" &&
      params.cEdrRsnBundleCde !== "c1"
    ) {
      setFormItem("cIsTransaction", {
        disabled: false,
      });
      setValue("cIsTransaction", "")
    } else {
      setFormItem("cIsTransaction", {
        disabled: true,
      });
      setValue("cIsTransaction", "0")
    }
    // 获取核保选项
    getCUndrMrkUrlFn(param);
    loadUwTabData();
    // 查询合同除外责任
    queryRiskCodelistFn();
  });
});

const prodNo = ref("");
const appTyp = ref("");
const riMrk = ref("");
const riFacMrk = ref("");
function loadUwTabData() {
  const dataLoadParam = JSON.stringify(params);
  if (dataLoadParam.indexOf("prodNo") >= 0) {
    const startIndex = dataLoadParam.indexOf("prodNo=") + 7;
    let endIndex = dataLoadParam.indexOf("&", startIndex);
    if (endIndex < 0) {
      endIndex = dataLoadParam.length - 1;
      prodNo.value = dataLoadParam.substring(startIndex, endIndex);
    }
  }
  if (dataLoadParam.indexOf("appType") >= 0) {
    const startIndex = dataLoadParam.indexOf("appType=") + 8;
    let endIndex = dataLoadParam.indexOf("&", startIndex);
    if (endIndex < 0) endIndex = dataLoadParam.length - 1;
    appTyp.value = dataLoadParam.substring(startIndex, endIndex);
  }
  if (dataLoadParam.indexOf("riMrk") >= 0) {
    const startIndex = dataLoadParam.indexOf("riMrk=") + 6;
    let endIndex = dataLoadParam.indexOf("&", startIndex);
    if (endIndex < 0) endIndex = dataLoadParam.length - 1;
    riMrk.value = dataLoadParam.substring(startIndex, endIndex);
  }
  if (dataLoadParam.indexOf("riFacMrk") >= 0) {
    const startIndex = dataLoadParam.indexOf("riFacMrk=") + 9;
    let endIndex = dataLoadParam.indexOf("&", startIndex);
    if (endIndex < 0) endIndex = dataLoadParam.length - 1;
    riFacMrk.value = dataLoadParam.substring(startIndex, endIndex);
  }

  //是否需要风险查勘
  const yprodNo = ["010001", "010002", "010003", "090001", "090002", "090003"];
  if (appTyp.value == "A") {
    for (var i = 0; i < yprodNo.length; i++) {
      if (prodNo.value == yprodNo[i]) {
        if (cRiskLvlCde == null || cRiskLvlCde == "") {
          cRiskLvlCde = "0";
        }
        cIsRiskExp;
        tool.setAttrValue(opinionDw, "CRiskLvlCde", cRiskLvlCde);
        tool.setAttrNodeAttr(opinionDw, "CRiskLvlCde", "isReadOnly", false);
        tool.setAttrNodeAttr(opinionDw, "CRiskLvlCde", "isNullable", false);
        break;
      }
    }
  }
}

async function queryRiskCodelistFn() {
  if(params.pageName === "priceInquiry") return;
  const queryRiskCodelistInfo:any = await queryRiskCodelist({ cAppNo: params.cAppNo })
  if(queryRiskCodelistInfo && queryRiskCodelistInfo.code === "1") {
    contRiskInfo.value = queryRiskCodelistInfo.data?.cResv1 || null;
    setFormItem("cIsExcluding", { disabled: queryRiskCodelistInfo.data?.cReadOnly === "1" ? false : true })
    setValue("cIsExcluding", queryRiskCodelistInfo.data?.cExc || '')
    // 05大类调整：是否可以编辑如果再保返回的是"是" 前端控制必须去选择是否合同除外业务。
    if(params.cProdNo?.startsWith('05') && queryRiskCodelistInfo.data?.cReadOnly === "1") {
      setFormItem("cIsExcluding", { rules: [getRules('required',{})] })
    }
  }
}

// 获取风险单位划分列表数据是否多险位
const getRiskDataIsMultiple = async () => {
  if(params.pageName === "priceInquiry") return;
  let flag = false;
  const riskQueryInfo:any = await riskQueryData({ cAppNo: params.cAppNo })
  if(riskQueryInfo && riskQueryInfo.code === "200") {
    if(riskQueryInfo.data && riskQueryInfo.data.length > 1) {
      flag = true
    }
  }
  return flag;
}

// 判断风险单位划分列表中的CRiskLvlCde值是否为null
const getRiskDataCriskLvlCde = async () => {
  let flag = false;
  const riskQueryInfo:any = await riskQueryData({ cAppNo: params.cAppNo })
  if(riskQueryInfo && riskQueryInfo.code === "200") {
    if(riskQueryInfo.data && !riskQueryInfo.data[0]?.cRiskLvlCde) {
      ElMessage.warning('请先进行险位划分!')
      flag = true
    }
  }
  return flag;
}

function setRiskunitDisabled() {
  // 风险单位划分按钮置灰
  riskunitDisabledFlag.value = true
  // 自主临分按钮置灰
  setFormItem("riFacMrk", {
    btnItems: {disabled: true},
  });
  // 是否临分复选框置灰
  checkboxDisabledFlag.value = true
}
function addProvide<T>(key: InjectionKey<T> | string, value: T) {
  underwriteEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  setRiskunitDisabled,
  getRiskDataCriskLvlCde,
  addProvide
});
</script>
<style lang="scss" scoped>
// :deep(form .el-col:nth-child(1) .el-form-item__content div) {
//   width: 400px !important;
// }
// :deep(form .el-col:nth-child(2) .el-form-item__content div) {
//   width: 200px !important;
// }
</style>
