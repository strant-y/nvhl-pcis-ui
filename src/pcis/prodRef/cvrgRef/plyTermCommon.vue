<template>
  <div class="planInfo">
    <myCard :cardConfig="cardconfig">
      <myCard :cardConfig="cardMainconfig">
        <template v-if="formData['m'] && formData['m'].length > 0">
          <tremTemplatecommon
            v-for="(i, index) in formData['m']"
            :key="index"
            :rowIndex="index"
            v-model="formData['m'][index]"
            :disabled-flag="disAbledFlag"
            :faters="faters"
            :showConf="{ showPlanNo: true }"
            @delete="
              (r) => {
                if (formData['m'].length === 1 && parparam.cTransMrk !== '1') {
                  ElMessage.error('仅剩1条主条款时,不能删除!');
                  return;
                } else {
                  deleteData(index, r);
                }
              }
            "
            @editPlan="
            (r) =>{
              editPlanData(index,formData['m'][index]);
            }
            "
            :ref="
              (res) => {
                tremTemplateRefs['m' + index] = res;
              }
            "
          />
        </template>
      </myCard>
      <myCard :cardConfig="cardComconfig">
        <template
          v-if="planDataCommon && Object.keys(planDataCommon).length > 0"
        >
          <termCommon
            v-model="planDataCommon"
            :disabled-flag="disAbledFlag"
            :faters="faters"
            ref="termcommonRef"
          />
        </template>
      </myCard>
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { mutualExclusionClause } from "./mutualExclusionClause.ts";
import termCommon from "./termCommon.vue";
import tremTemplatecommon from "./trem-template-common.vue";

import { v4 as uuidv4 } from "uuid";

const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { codeListViewStore } from "@/store";
import { qryProdRelTermRiskList, qryProdTermCf } from "@/api/prod";
import { getEdrRsnTermItem } from "@/api/query";
import { terConfig } from "@/store/modules/term-config";
import {
  idxParamKey,
  IdxParamProps,
  useIdxParam,
} from "@/views/pcis/support/useIdxParam";
import { createFreeButtonBase } from "@/shared/button-config.js";

const codeListStore = codeListViewStore();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const parparam = opertaor.getParam();
const termConfig = terConfig();
const { selectedRow } = storeToRefs(termConfig);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
  },
});

const cardconfig = ref(creatCardConfig({}));

const cardMainconfig = ref(
  creatCardConfig({
    title: "主条款信息",
    showInTitle: true,
    titleClass: "mainTitle",
    // titleBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "添加条款",
    //     id: "addPlan_btn",
    //     icon: "CirclePlus",
    //     size: "small",
    //     func: () => {
    //       addTermData();
    //     },
    //   }),
    // ],
  })
);

const cardComconfig = ref(
  creatCardConfig({
    title: "公共信息",
    showInTitle: true,
    titleClass: "mainTitle",
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        id: "addPlan_btn",
        label: "增加附加条款",
        icon: "CirclePlus",
        size: "small",
        func: () => {
          addAndinitData();
        },
      }),
    ],
  })
);

const tremTemplateRefs = ref<any>({});
const termcommonRef = ref("termcommonRef");
const formData = ref<{ [key: string]: [] }>({});
const planDataCommon = ref<{ [key: string]: { [key: string]: any } }>({}); //公共信息
const disAbledFlag = ref(false);
const codeListMap = ref<any>({});
provide("codeListMap", codeListMap.value);

function hiddenBtn(){
  cardMainconfig.value.titleBtns?.forEach((item: any) => {
    item.hidden = true;
  });
  cardComconfig.value.titleBtns?.forEach((item: any) => {
    item.hidden = true;
  });
}

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  if(parparam.cRsnCde === "99"){
    hiddenBtn();
  }
  let deleteId = 0;
  if (formconfig11.titleBtns) {
    formconfig11.titleBtns.forEach((item: any, index: number) => {
      if (item.id === "selectGoods") {
        deleteId = index;
      }
    });
  }
  if (!parparam.cProdNo.startsWith("02") && deleteId > 0) {
    // 只有货运险,需要选择获取按钮
    formconfig11.titleBtns?.splice(deleteId, 1);
  }
  Object.assign(cardconfig.value, formconfig11);
  selectedRow.value = {}; // 初始化清除选中的缓存数据
  if (parparam.pageType === "app" && parparam.cRecordType != 4) {
    // 新建保单时,初始化条款信息
    const param = {
      cProdNo: parparam.cProdNo,
      cTermNo: parparam.cTermNo,
    };
    qryProdRelTermRiskList(param).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        let plans: any[] = [];
        data.forEach((item: any) => {
          let riskList: { [key: string]: any }[] = [];
          item.children?.forEach((e: any) => {
            riskList.push({
              "TermRisktgt.cLiabCode": e.cRiskNo,
            });
          });
          let data: { [key: string]: any } = {
            "Term.cClauseCode": item.cTermNo,
            "Term.cRdrTyp": item.cRdrTyp,
            "Term.cUniqueTermNo": item.cUniqueTermNo,
            "Term.cPlanNo": "P1",
          };
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          if (
            item.cUniqueTermNo &&
            mutualExclusionClause.value.includes(item.cUniqueTermNo)
          ) {
            // 部分条款责任互斥,所以互斥条款,不再加载对应的责任信息
            data.riskList = [];
          } else {
            data.riskList = riskList;
          }
          // 数据初始化
          initTermData(item, data);
          plans.push(data);
        });
        refushData(plans);
      } else {
        ElMessage.error(msg);
      }
    });
  }
});

function addPlanMethod() {
  let maxindex = 0;
  if (formData.value["m"] && formData.value["m"].length > 0) {
    formData.value["m"].forEach((item: any) => {
      const pln = item["Term.cPlanNo"];
      const numberPart = parseInt(pln.replace(/\D/g, ""), 10);
      if (numberPart > maxindex) {
        maxindex = numberPart;
      }
    });
  }

  const planKey = "P" + (maxindex + 1);
  return planKey;
}

function addAndinitData() {
  const param = opertaor.getParam();
  const iss: any[] = [];
  let mainTerm = null;
  if (formData.value["m"] && formData.value["m"].length > 0) {
    mainTerm = formData.value["m"][0]["Term.cClauseCode"];
  }
  if (!mainTerm) {
    ElMessage.error("请先选择主条款,再选择附加条款!");
    return;
  }
  if (planDataCommon.value) {
    Object.keys(planDataCommon.value).forEach((item: any) => {
      if (item !== "m") {
        iss.push(...item);
      }
    });
  }

  dialog.value?.open(
    "addtremComView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        isselectData: iss,
        showType: "andinit",
        mainTerm: mainTerm,
      },
    },
    {
      isOk: (selectdata: any) => {
        let plans: any[] = [];
        selectdata.forEach((item: any, index: number) => {
          let riskList: { [key: string]: any }[] = [];
          const se = iss.filter(
            (em) => em["Term.cClauseCode"] === item.cTermNo
          );
          item.children?.forEach((e: any) => {
            if (se.length > 0) {
              const seri = se[0].riskList.filter(
                (er: { [x: string]: any }) =>
                  er["TermRisktgt.cLiabCode"] === e.cRiskNo
              );
              if (seri.length > 0) {
                riskList.push(seri[0]);
              } else {
                riskList.push({
                  "TermRisktgt.cLiabCode": e.cRiskNo,
                });
              }
            } else {
              riskList.push({
                "TermRisktgt.cLiabCode": e.cRiskNo,
              });
            }
          });
          let data: { [key: string]: any } = {};
          if (se.length > 0) {
            data = se[0];
          } else {
            data = {
              "Term.cClauseCode": item.cTermNo,
              "Term.cRdrTyp": item.cRdrTyp,
              "Term.cUniqueTermNo": item.cUniqueTermNo,
            };
          }
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          // 数据初始化
          initTermData(item, data);
          data.riskList = riskList;
          plans.push(data);
        });
        // refushData(plans);

        refushAndData(plans);
      },
    },
    { title: "添加条款", width: 50 }
  );
}

// 绑定方法
const method = {
  funcadd: () => {
    addTermData();
  },
};

const edrItem = ref<[key: string, value: Array<any>] | any>({});
function updateEdrItem(terms: any[]) {
  if (
    parparam.pageType === "EDR_APP_NEW_SCENE" ||
    parparam.pageType === "EDR_APP_MODIFY_BOUNCED_SCENE" ||
    (parparam.pageType === "TEMPORARY_DEPOSIT" && parparam.cAppTyp === "E")
  ) {
    const res = {
      CProdNo: parparam.cProdNo,
      CDptCde: parparam.cDptCde,
      CRsnCde: parparam.cRsnCde,
      CRsnDetailCde: parparam.cRsnDetailCde,
      CEdrType: parparam.cEdrType,
      CGrpMrk: parparam.cGrpMrk,
      terms: terms,
    };
    getEdrRsnTermItem(res).then((res: any) => {
      if (res["code"] == "200") {
        const { data } = res;
        edrItem.value = data.data;
        showFlush();
      } else {
        ElMessage.error(res.msg);
      }
    });
  }
}

// 绑定特殊验证器
const exRules = {};

function editPlanData(index,data) {
  const param = opertaor.getParam();
  let mainTerm = data["Term.cClauseCode"];
  dialog.value?.open(
    "addtremComView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        showType: "main",
        showMethod: "edit",
        mainTerm: mainTerm,
        isselectData: [data],
        commonconf:commonCf.value[mainTerm]
      },
    },
    {
      isOk: (selectdata: any) => {
        let nelist = [];
        selectdata.forEach((item: any, index: number) => {
          let riskList: { [key: string]: any }[] = [];
          item.children?.forEach((e: any) => {
            const f = data.riskList.filter((e1: any) => { 
              return e1['TermRisktgt.cLiabCode'] === e['cRiskNo'];
            });
            if(f && f.length > 0) {
              riskList.push(f[0]);
            } else {
              riskList.push({
                "TermRisktgt.cLiabCode": e.cRiskNo,
              });
            }
          });
          data.riskList = riskList;
        });
        nextTick(() => { 
          showFlush();
        });
      },
    },
    { title: "编辑条款", width: 50 }
  );
}
function addTermData() {
  const param = opertaor.getParam();
  let mainTerm = "";
  if (formData.value["m"]) {
    mainTerm = formData.value["m"][0]["Term.cClauseCode"];
  }
  dialog.value?.open(
    "addtremComView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        showType: "main",
        showMethod: "add",
        mainTerm: mainTerm,
      },
    },
    {
      isOk: (selectdata: any) => {
        selectdata.forEach((item: any, index: number) => {
          let riskList: { [key: string]: any }[] = [];

          item.children?.forEach((e: any) => {
            riskList.push({
              "TermRisktgt.cLiabCode": e.cRiskNo,
            });
          });
          let data = {
            "Term.cClauseCode": item.cTermNo,
            "Term.cRdrTyp": item.cRdrTyp,
            "Term.cUniqueTermNo": item.cUniqueTermNo,
            "Term.cPlanNo": addPlanMethod(),
          };
          // 数据初始化
          initTermData(item, data);
          data.riskList = riskList;
          let o = formData.value["m"];
          if(!o){
            o = [];
          }
          o.push(data);
          refushData(o);
        });
      },
    },
    { title: "添加条款", width: 50 }
  );
}

function initTermData(item: any, data: any) {
  if (
    item.cUniqueTermNo === "00425000137" ||
    item.cUniqueTermNo === "00425000134"
  ) {
    data["Term.nAdjustFactor"] = 100;
  }
}
function deleteData(index: any, term: any) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTermByNo(index, term["Term.cClauseCode"]);
    ElMessage({
      type: "success",
      message: "删除成功",
    });
  });
}

// 隐藏控制组
const hiddenFlag = ref<any[]>([]);
function isHidden(pl: any) {
  return hiddenFlag.value.indexOf(pl) == -1;
}
function changeHidden(pl: any) {
  const index = hiddenFlag.value.indexOf(pl);
  if (index == -1) {
    hiddenFlag.value.push(pl);
  } else {
    hiddenFlag.value.splice(index, 1);
  }
}

function deleteTermByNo(i: any, t: any) {
  Object.keys(formData.value).forEach((item) => {
    let deleindex: any = null;
    if (formData.value[item][i]["Term.cClauseCode"] === t) {
      // 批改的情况下，标记该单为删除状态
      if (parparam.cEdrType && formData.value[item][i]["Term.cRowId"]) {
        if (
          formData.value[item][i]["Term.cRdrTyp"] !== "0" &&
          formData.value[item][i]["Term.cClauseCategory"] !== "1"
        ) {
          // 规范类，限制类，退保状态只标记
          formData.value[item][i]["Term.cCancelMrk"] = "1";
        } else {
          tremTemplateRefs.value[item + i].setCancel();
        }
      } else {
        deleindex = i;
      }
    }
    if (deleindex != null) {
      formData.value[item].splice(deleindex, 1);
      deleindex = null;
    }
  });
}

const commonCf = ref<{ [key: string]: any } | null>({});
async function refushData(datas: any) {
  let pd: { [key: string]: any } = {};

  let mTerm = null;
  datas?.forEach((item: any) => {
    let key = "m";
    if (item["Term.cRdrTyp"] === "0") {
      mTerm = item["Term.cClauseCode"];
    }
  });

  if (mTerm && !commonCf.value[mTerm]) {
    const cf = await qryProdTermCf({ termNo: mTerm });
    if (cf.code === 200) {
      commonCf.value[mTerm] = cf.data;
    }
  }
  let mterm = null;
  if (mTerm) {
    mterm = commonCf.value[mTerm];
  }

  datas?.forEach((item: any) => {
    let exterm = {};
    let key = "m";
    if (item["Term.cRdrTyp"] !== "0") {
      key = "a" + item["Term.cClauseCategory"];
    } else {
      let l = mterm["termRisk"];
      let ex = [];
      let ol = [];
      if (item["riskList"] && item["riskList"].length > 0) {
        item["riskList"].forEach((ris) => {
          let r = false;
          l.forEach((litem: any) => {
            if (litem.cRiskNo === ris["TermRisktgt.cLiabCode"]) {
              if (litem.cIsCommon === "1") {
                r = true;
              }
            }
          });
          // 如果满足公共条款,则添加到公共条款中,否则保留在原条款数据中
          if (r) {
            exterm = JSON.parse(JSON.stringify(item));
            ex.push(ris);
          } else {
            ol.push(ris);
          }
        });
      }
      if (ex && ex.length > 0) {
        exterm.riskList = ex;
        item.riskList = ol;
      }
    }

    if (!pd[key]) {
      pd[key] = [];
    }
    pd[key].push(item);
    if(exterm && Object.keys(exterm).length > 0) {
      planDataCommon.value[key] = [exterm];
    }
  });
  // 强制刷新组件,对数据进行更新
  formData.value = {};
  setTimeout(() => {
    formData.value = pd;
    // nextTick(() => {
    //   showFlush();
    // });
  }, 50);
}

async function refushAndData(datas: any) {
  let pd: { [key: string]: any } = {};

  datas?.forEach((item: any) => {
    let key = "a" + item["Term.cClauseCategory"];

    if (!pd[key]) {
      pd[key] = [];
    }
    pd[key].push(item);
  });

  const m = planDataCommon.value["m"];
  // 强制刷新组件,对数据进行更新
  pd["m"] = m;

  planDataCommon.value = pd;
  // setTimeout(() => {

  nextTick(() => {
    showFlush();
  });
  // }, 50);
}

function getFromValue() {
  let redata: any[] = [];
  let seqNo = 1;
  Object.keys(formData.value).forEach((item) => {
    formData.value[item].forEach((d: any) => {
      const i = JSON.parse(JSON.stringify(d));
      let list = [];
      if (i["riskList"]) {
        list = JSON.parse(JSON.stringify(i["riskList"]));
        delete i["riskList"];
      }
      if (item === "m") {
        //主条款,查下是否存在公共信息
        if (planDataCommon.value["m"] && planDataCommon.value["m"].length > 0) {
          const r = planDataCommon.value["m"][0];
          const nr = [];
          if(r && r.riskList && r.riskList.length > 0){
            r.riskList.forEach((l: any) => {
              let d = JSON.parse(JSON.stringify(l));
              d["TermRisktgt.cIsCommon"] = '1';
              list.push(d);
            });
          }
          
        }
      }
      const plan = i["Term.cPlanNo"];
      let risk_index = 1;
      list.forEach((r: any) => {
        r["TermRisktgt.cPlanNo"] = plan;
        r['TermRisktgt.nSeqNo'] = risk_index++;
      });
      i["Term.riskList"] = list;
      i["Term.nSeqNo"] = seqNo++;
      redata.push(i);
      if (
        planDataCommon.value &&
        Object.keys(planDataCommon.value).length > 0
      ) {
        Object.keys(planDataCommon.value).forEach((k) => {
          if (k !== "m") {
            const md = JSON.parse(JSON.stringify(planDataCommon.value[k]));
            md.forEach((m) => {
              m["Term.cPlanNo"] = plan;
              m["Term.nSeqNo"] = seqNo++;
              m["Term.cIsCommon"] = '1';
              if (m["riskList"]) {
                let l = JSON.parse(JSON.stringify(m["riskList"]));
                delete m["riskList"];
                let risk_index = 1;
                l.forEach((r: any) => {
                  r["TermRisktgt.cPlanNo"] = plan;
                  r["TermRisktgt.cIsCommon"] = '1';
                  r['TermRisktgt.nSeqNo'] = risk_index++;
                });
                m["Term.riskList"] = l;
              }
              redata.push(m);
            });
          }
        });
      }
    });
  });
  return redata;
}

function setFormValue(value: any) {
  const terms: any[] = [];
  formData.value = {};
  let plandata: any[] = [];
  let comData: any[] = [];
  let planNo = null;
  value.forEach((item: any) => {
    let creData = JSON.parse(JSON.stringify(item));
    creData["riskList"] = creData["Term.riskList"];
    terms.push(creData["Term.cClauseCode"]);
    delete creData["Term.riskList"];
    if (creData["Term.cRdrTyp"] === "0") {
      plandata.push(creData);
    } else {
      if (planNo === null) {
        comData.push(creData);
        planNo = creData["Term.cPlanNo"];
      } else if (planNo === creData["Term.cPlanNo"]) {
        comData.push(creData);
      }
    }
  });
  refushData(plandata);
  refushAndData(comData);
  nextTick(() => {
    updateEdrItem(terms);
  });
}

async function validate() {
  let r = true;
  const keys = Object.keys(tremTemplateRefs.value);
  for (const item of keys) {
    if (tremTemplateRefs.value[item] && tremTemplateRefs.value[item].validate) {
      const res = await tremTemplateRefs.value[item].validate();
      r = r && res;
    }
  }
  return r;
}

function showFlush() {
  Object.keys(tremTemplateRefs.value).forEach((item: any) => {
    if (tremTemplateRefs.value[item]) {
      tremTemplateRefs.value[item].dataFlash();
    }
  });
  if (termcommonRef.value.showFlush) {
    termcommonRef.value.showFlush();
  }
  updateBtn();
}

function getPlanNo() {
  let plans = [];
  if (formData.value["m"] && formData.value["m"].length > 0) {
    formData.value["m"].forEach((e) => {
      let d = { label: e["Term.cPlanNo"], value: e["Term.cPlanNo"] };
      plans.push(d);
    });
  }
  return plans;
}

function updateBtn() {
  const unbut = getndisAbleConfig("null");
  if (unbut && unbut.length > 0) {
    cardconfig.value.endBtns?.forEach((item: any) => {
      const t = unbut.find((un: any) => un["cEdrItem"] === item.id);
      if (t) {
        item.hidden = false;
      }
    });
    cardconfig.value.titleBtns?.forEach((item: any) => {
      const t = unbut.find((un: any) => un["cEdrItem"] === item.id);
      if (t) {
        item.hidden = false;
      }
    });

    cardMainconfig.value.titleBtns?.forEach((item: any) => {
      const t = unbut.find((un: any) => un["cEdrItem"] === item.id);
      if (t) {
        item.hidden = false;
      }
    });
    cardComconfig.value.titleBtns?.forEach((item: any) => {
      const t = unbut.find((un: any) => un["cEdrItem"] === item.id);
      if (t) {
        item.hidden = false;
      }
    });
  }
}

function getTableValue(rowId: number, key: string) {}

function getFormconfig() {
  return {
    fromType: "custom",
  };
}
function setDisabledAll() {
  disAbledFlag.value = true;
  if (cardconfig.value.titleBtns && cardconfig.value.titleBtns.length > 0) {
    cardconfig.value.titleBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  if (cardconfig.value.endBtns && cardconfig.value.endBtns.length > 0) {
    cardconfig.value.endBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  if (
    cardMainconfig.value.titleBtns &&
    cardMainconfig.value.titleBtns.length > 0
  ) {
    cardMainconfig.value.titleBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  if (
    cardComconfig.value.titleBtns &&
    cardComconfig.value.titleBtns.length > 0
  ) {
    cardComconfig.value.titleBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  if (Object.keys(tremTemplateRefs.value).length > 0) {
    Object.keys(tremTemplateRefs.value).forEach((item: any) => {
      tremTemplateRefs.value[item].setDisabledAll();
    });
  }
}
function setUnDisabledByKeyList(key: any) {
  cardconfig.value.endBtns?.forEach((item: any) => {
    if (item.id === key) {
      item.hidden = false;
    }
  });
  cardconfig.value.titleBtns?.forEach((item: any) => {
    if (item.id === key) {
      item.hidden = false;
    }
  });
  cardMainconfig.value.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  cardComconfig.value.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
}

function getndisAbleConfig(key: any) {
  return edrItem.value[key];
}

const getRowId = (): string => {
  return uuidv4().replace(/-/g, "");
};

function setTermData(param: any, value: any) {
  const prop: string = param.factorProp;
  const termNo: string = param.termNo;
  const riskNo: string = param.riskNo;
  Object.keys(formData.value).forEach((item) => {
    formData.value[item].forEach((d: any) => {
      if (d["Term.cUniqueTermNo"] === termNo) {
        if (!prop.startsWith("TermRisktgt")) {
          d[prop] = value;
        }
        if (d.riskList && d.riskList.length > 0) {
          d.riskList.forEach((r: any) => {
            if (r["TermRisktgt.cLiabCode"] === riskNo) {
              r[param.factorProp] = value;
            }
          });
        }
      }
    });
  });
  showFlush();
}
const faters = ref({
  getndisAbleConfig: getndisAbleConfig,
  setTermData: setTermData,
});

function calcCheck() {
  return {
    res: true,
    msg: "验证通过",
  };
}
const setCargoSeq = (value: string, pkId: string) => {
  const { index, data } = selectedRow.value;
  if (formData.value["m"] && formData.value["m"].length > 0) {
    if (data["Term.cClauseCode"]) {
      formData.value["m"][index]['Term.cDistCodeNo'] = value;
      formData.value["m"][index]['Term.cDistPkId'] = pkId;
      selectedRow.value.data = formData.value["m"][index];
    } else {
      formData.value["m"][index]["riskList"].forEach((item: any) => {
        if (item["TermRisktgt.cLiabCode"] === data["TermRisktgt.cLiabCode"]) {
          item['TermRisktgt.cDistCodeNo'] = value;
          item['TermRisktgt.cDistPkId'] = pkId;
          selectedRow.value.data = item;
        }
      });
    }
  }
};

onActivated(() => {
  console.log("keep-alive -> onActivated");
});
onDeactivated(() => {
  console.log("keep-alive -> onDeactivated");
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  showFlush,
  getFormconfig,
  setDisabledAll,
  setUnDisabledByKeyList,
  calcCheck,
  setTermData,
  getPlanNo,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
.planInfo ::v-deep .el-card__header {
  padding: 2px 15px !important;
}
</style>
