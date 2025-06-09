<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <div v-for="(v, k) in planData" :key="k" class="planInfo">
          <el-card>
            <template #header>
              <el-row :gutter="16">
                <el-col :span="4">
                  <a style="margin-right: 5px" @click="changeHidden(k)">
                    <el-icon v-if="!isHidden(k)"><ArrowUpBold /></el-icon>
                    <el-icon v-if="isHidden(k)"><ArrowDownBold /></el-icon>
                  </a>
                  {{ k }}方案</el-col
                >
                <el-col :span="16">
                  {{ showTitleMap[k] ? showTitleMap[k] : "" }}
                </el-col>
                <el-col :span="4">
                  <rt-button
                    v-if="!btnItem.addPlan.hidden"
                    @click="addTermData(k)"
                    :item="btnItem.addPlan"
                  />
                  <rt-button
                    v-if="!btnItem.delPlan.hidden"
                    @click="deletePlan(k)"
                    :item="btnItem.delPlan"
                  />
                </el-col>
              </el-row>
            </template>
            <template v-if="isHidden(k)">
              <template v-if="planData[k]['m'] && planData[k]['m'].length > 0">
                <myCard
                  :cardConfig="{
                    title: '主条款信息',
                    showInTitle: true,
                  }"
                >
                  <tremTemplate
                    v-for="(i, index) in planData[k]['m']"
                    :key="index"
                    v-model="planData[k]['m'][index]"
                    :disabled-flag="disAbledFlag"
                    @delete="
                      (r) => {
                        deleteData(k, r);
                      }
                    "
                    :faters="faters"
                    :ref="
                      (res) => {
                        tremTemplateRefs[k + 'm' + index] = res;
                      }
                    "
                  />
                </myCard>
              </template>

              <template
                v-if="planData[k]['a1'] && planData[k]['a1'].length > 0"
              >
                <myCard
                  :cardConfig="{
                    title: '扩展类附加条款信息',
                    showInTitle: true,
                  }"
                >
                  <el-form
                    ref="cvrgFormfef"
                    :model="planData[k]['a1']"
                    :inline-message="true"
                  >
                    <tremTemplate
                      v-for="(i, index) in planData[k]['a1']"
                      :key="index"
                      v-model="planData[k]['a1'][index]"
                      :disabled-flag="disAbledFlag"
                      @delete="
                        (r) => {
                          deleteData(k, r);
                        }
                      "
                      :faters="faters"
                      :ref="
                        (res) => {
                          tremTemplateRefs[k + 'a1' + index] = res;
                        }
                      "
                    />
                  </el-form>
                </myCard>
              </template>
              <template
                v-if="planData[k]['a2'] && planData[k]['a2'].length > 0"
              >
                <myCard
                  :cardConfig="{
                    title: '限制类附加条款信息',
                    showInTitle: true,
                  }"
                >
                  <tremAddTemplate2
                    :planData="planData[k]['a2']"
                    :disabled-flag="disAbledFlag"
                    @delete="
                      (r) => {
                        deleteData(k, r);
                      }
                    "
                    :ref="
                      (res) => {
                        tremTemplateRefs[k + 'a2' + index] = res;
                      }
                    "
                  />
                </myCard>
              </template>
              <template
                v-if="planData[k]['a3'] && planData[k]['a3'].length > 0"
              >
                <myCard
                  :cardConfig="{
                    title: '规范类附加条款信息',
                    showInTitle: true,
                  }"
                >
                  <tremAddTemplate3
                    :planData="planData[k]['a3']"
                    :disabled-flag="disAbledFlag"
                    @delete="
                      (r) => {
                        deleteData(k, r);
                      }
                    "
                    :ref="
                      (res) => {
                        tremTemplateRefs[k + 'a3' + index] = res;
                      }
                    "
                  />
                </myCard>
              </template>
            </template>
          </el-card>
        </div>
      </div>
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";

const tremTemplate = defineAsyncComponent(() => import("./trem-template.vue"));
const tremAddTemplate2 = defineAsyncComponent(
  () => import("./trem-add2-template.vue")
);
const tremAddTemplate3 = defineAsyncComponent(
  () => import("./trem-add3-template.vue")
);

const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { prodTemple } from "./titleTemple";
import { codeListViewStore } from "@/store";
import { qryProdRelTermRiskList } from "@/api/prod";
import { getEdrRsnTermItem } from "@/api/query";
const codeListStore = codeListViewStore();
const disAbledFlag = ref(false);

const opertaor = dataOpertaor();
const parparam = opertaor.getParam();
const terconfig = terConfig();
terconfig.configInit(); // 条款配置数据初始化

const tremTemplateRefs = ref<any>({});

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const btnItem = ref<{ [key: string]: { [key: string]: any } }>({
  addPlan: {
    label: "添加条款",
    icon: "CirclePlus",
    type: "primary",
    size: "small",
  },
  delPlan: {
    icon: "Delete",
    type: "danger",
    size: "small",
  },
});

const cardconfig = ref(creatCardConfig({}));
const cvrgFormfef = ref("cvrgFormfef");
let planData = ref<{ [key: string]: { [key: string]: any } }>({});
const hiddenFlag = ref<any[]>([]);
const showTitleMap = ref<{ [key: string]: string }>({});

function updateTitle() {
  Object.keys(planData.value).forEach((k: any) => {
    if (parparam.cProdNo === "043009") {
      const terms = planData.value[k];
      // 获取模版字符串
      const str = prodTemple.value.default;
      let sumobj = 0;
      let sumprm = 0;
      const m = terms["m"]; // 主条款
      if (m && m.length > 0) {
        m.forEach((item: any) => {
          sumobj += item["Term.nInsuredCount"] ? item["Term.nInsuredCount"] : 0;
          sumprm += item["Term.nInsuranceFee"] ? item["Term.nInsuranceFee"] : 0;
        });
      }

      const a1 = terms["a1"]; // 扩展类

      if (a1 && a1.length > 0) {
        a1.forEach((item: any) => {
          sumprm += item["Term.nInsuranceFee"] ? item["Term.nInsuranceFee"] : 0;
        });
      }

      const a2 = terms["a2"]; // 限制类
      if (a2 && a2.length > 0) {
        a2.forEach((item: any) => {
          sumprm += item["Term.nInsuranceFee"] ? item["Term.nInsuranceFee"] : 0;
        });
      }

      const filledString = fillTemplate(str, {
        sumPrm: sumprm,
        sumObjs: sumobj,
      });
      showTitleMap.value[k] = filledString;
    }
  });
}

function fillTemplate(
  template: string,
  params: { [key: string]: any }
): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
  if (parparam.pageType === "app") {
    method.funcadd();
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
            riskList: riskList,
          };
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          plans.push(data);
        });
        refushData("P1", plans);
      } else {
        ElMessage.error(msg);
      }
    });
  }
});

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
    Object.keys(btnItem.value).forEach((k: any) => {
      const t = unbut.find((un: any) => un["cEdrItem"] === k + "_btn");
      btnItem.value[k].hidden = false;
    });
  }
}

// 绑定方法
const method = {
  funcadd: () => {
    if (parparam.cProdNo === "043009") {
      const tgt = opertaor.getTableRefByKey("tgt");
      const tgtData = tgt.getFromValue();
      if (!tgtData["Tgt.cInsuranceMethod"]) {
        ElMessage.error("请先选择标的信息中的投保方式!");
        return;
      }
      if (tgtData["Tgt.cInsuranceMethod"] !== "613001") {
        ElMessage.error(
          "当投保方式为工程造价投保/劳务合同价投保/按建筑面积投保时,不可添加多方案!"
        );
        return;
      }
    }
    let maxindex = 0;
    const l = Object.keys(planData.value).forEach((k: any) => {
      const numberPart = parseInt(k.replace(/\D/g, ""), 10);
      if (numberPart > maxindex) {
        maxindex = numberPart;
      }
    });
    const planKey = "P" + (maxindex + 1);
    planData.value[planKey] = [];
  },
};

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
// 绑定特殊验证器
const exRules = {};

function addTermData(PlanNo: string) {
  const param = opertaor.getParam();
  const sp = planData.value[PlanNo];
  let seld: any[] = [];
  Object.keys(sp).forEach((k: any) => {
    seld.push(...sp[k]);
  });
  dialog.value?.open(
    "addtremView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        isselectData: seld,
      },
    },
    {
      isOk: (selectdata: any) => {
        let plans: any[] = [];
        selectdata.forEach((item: any) => {
          let riskList: { [key: string]: any }[] = [];
          const se = seld.filter(
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
            };
          }
          data.riskList = riskList;
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          plans.push(data);
        });
        refushData(PlanNo, plans);
      },
    },
    { title: "添加条款", width: 85 }
  );
}
function refushData(planNo: string, datas: any) {
  let pd: { [key: string]: any } = {};
  datas?.forEach((item: any) => {
    let key = "m";
    if (item["Term.cRdrTyp"] !== "0") {
      key = "a" + item["Term.cClauseCategory"];
    }
    if (!pd[key]) {
      pd[key] = [];
    }
    pd[key].push(item);
  });
  // 强制刷新组件,对数据进行更新
  delete planData.value[planNo];

  setTimeout(() => {
    planData.value[planNo] = pd;
    // nextTick(() => {
    //   showFlush();
    // });
  }, 100);
}
function deletePlan(plan: string) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    delete planData.value[plan];
    ElMessage({
      type: "success",
      message: "删除成功",
    });
  });
}
function deleteData(plan: string, term: any) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTermByNo(plan, term["Term.cClauseCode"]);
    if (term["Term.cRdrTyp"] === "0") {
      codeListStore
        .queryCodeList(
          {
            codeListName: "MainTermlist",
            codeListParam: { cTermNo: term["Term.cClauseCode"] },
          },
          false,
          false
        )
        .then((res) => {
          if (res && res.length > 0) {
            res.forEach((r: any) => {
              deleteTermByNo(plan, r["RdrTerm"]);
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    ElMessage({
      type: "success",
      message: "删除成功",
    });
  });
}

function deleteTermByNo(plan: any, t: any) {
  Object.keys(planData.value[plan]).forEach((item) => {
    let deleindex = null;
    for (let i = 0; i < planData.value[plan][item].length; i++) {
      if (planData.value[plan][item][i]["Term.cClauseCode"] === t) {
        // 批改的情况下，标记该单为删除状态
        if (parparam.cEdrType) {
          planData.value[plan][item][i]["Term.cCancelMrk"] = "1";
        } else {
          deleindex = i;
        }
      }
    }
    if (deleindex != null) {
      planData.value[plan][item].splice(deleindex, 1);
    }
  });
}

function getFromValue() {
  let redata: any[] = [];
  Object.keys(planData.value).forEach((plan) => {
    Object.keys(planData.value[plan]).forEach((item) => {
      planData.value[plan][item].forEach((d: any) => {
        const i = JSON.parse(JSON.stringify(d));
        i["Term.cPlanNo"] = plan;
        if (i["riskList"]) {
          i["Term.riskList"] = i["riskList"];
          delete i["riskList"];
        }
        redata.push(i);
      });
    });
  });
  return redata;
}

function setFormValue(value: any) {
  const terms: any[] = [];
  planData.value = {};
  let plandata: { [key: string]: any } = {};
  value.forEach((item: any) => {
    const planKey = item["Term.cPlanNo"];
    terms.push(item["Term.cClauseCode"]);
    let creData = JSON.parse(JSON.stringify(item));
    creData["riskList"] = creData["Term.riskList"];
    delete creData["Term.riskList"];
    if (plandata[planKey]) {
      plandata[planKey].push(creData);
    } else {
      let newrisk: any[] = [];
      newrisk.push(creData);
      plandata[planKey] = newrisk;
    }
  });
  Object.keys(plandata).forEach((planNo: any) => {
    refushData(planNo, plandata[planNo]);
  });
  updateEdrItem(terms);
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
  updateTitle();
  Object.keys(tremTemplateRefs.value).forEach((item) => {
    tremTemplateRefs.value[item].dataInit();
  });
  updateBtn();
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
  Object.keys(btnItem.value).forEach((k: any) => {
    btnItem.value[k].hidden = true;
  });
  Object.keys(tremTemplateRefs.value).forEach((item) => {
    tremTemplateRefs.value[item].setDisabledAll();
  });
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
}

function getndisAbleConfig(key: any) {
  return edrItem.value[key];
}

const faters = ref({
  getndisAbleConfig: getndisAbleConfig,
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
});
</script>

<style scoped>
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important;
}
</style>
