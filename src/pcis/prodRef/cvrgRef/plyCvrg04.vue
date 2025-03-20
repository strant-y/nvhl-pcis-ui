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
                    :item="{
                      label: '添加条款',
                      icon: 'CirclePlus',
                      type: 'primary',
                      size: 'small',
                      func: () => {
                        addTermData(k);
                      },
                    }"
                  />
                  <rt-button
                    :item="{
                      icon: 'Delete',
                      type: 'danger',
                      size: 'small',
                      func: () => {
                        deletePlan(k);
                      },
                    }"
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
                    @delete="
                      (r) => {
                        deleteData(k, r);
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
                      @delete="
                        (r) => {
                          deleteData(k, r);
                        }
                      "
                      :ref="
                        (res) => {
                          tremTemplateRefs[index] = res;
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
                    @delete="
                      (r) => {
                        deleteData(k, r);
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
                    @delete="
                      (r) => {
                        deleteData(k, r);
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
import tremTemplate from "./trem-template.vue";
import tremAddTemplate2 from "./trem-add2-template.vue";
import tremAddTemplate3 from "./trem-add3-template.vue";

const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { prodTemple } from "./titleTemple";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();

const opertaor = dataOpertaor();
const terconfig = terConfig();
terconfig.configInit(); // 条款配置数据初始化

const tremTemplateRefs = ref<any[]>([]);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const cardconfig = ref(creatCardConfig({}));
const cvrgFormfef = ref("cvrgFormfef");
let planData = ref<{ [key: string]: { [key: string]: any } }>({});
const hiddenFlag = ref<any[]>([]);
const showTitleMap = ref<{ [key: string]: string }>({});

function updateTitle() {
  Object.keys(planData.value).forEach((k: any) => {
    const str = prodTemple.value.default;
    const filledString = fillTemplate(str, { sumPrm: 0, sumObjs: 0 });
    showTitleMap.value[k] = filledString;
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
  nextTick(() => {
    updateTitle();
  });
});

// 绑定方法
const method = {
  funcadd: () => {
    let maxindex = 0;
    const l = Object.keys(planData.value).forEach((k: any) => {
      const numberPart = parseInt(k.replace(/\D/g, ""), 10);
      if (numberPart > maxindex) {
        maxindex = numberPart;
      }
    });
    const planKey = "P" + (maxindex + 1);
    planData.value[planKey] = [];
    updateTitle();
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
  dialog.value?.open(
    "addtremView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        isselectData: planData.value[PlanNo],
      },
    },
    {
      isOk: (selectdata: any) => {
        let plans: any[] = [];
        selectdata.forEach((item: any) => {
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
  planData.value[planNo] = pd;
}
function deletePlan(plan: string) {
  delete planData.value[plan];
}
function deleteData(plan: string, term: any) {
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
}

function deleteTermByNo(plan: any, t: any) {
  console.log(t);
  Object.keys(planData.value[plan]).forEach((item) => {
    let deleindex = null;
    for (let i = 0; i < planData.value[plan][item].length; i++) {
      if (planData.value[plan][item][i]["Term.cClauseCode"] === t) {
        deleindex = i;
      }
    }
    if (deleindex != null) {
      planData.value[plan][item].splice(deleindex, 1);
    }
  });
}

function getFromValue() {
  let tableobj: { [key: string]: any } = {};
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
  tableobj["items"] = redata;
  return tableobj;
}

function setFormValue(value: any) {
  Object.assign(planData.value,{});
  let plandata: { [key: string]: any } = {};
  value.forEach((item: any) => {
    const planKey = item["Term.cPlanNo"];
    let creData = JSON.parse(JSON.stringify(item));
    creData["riskList"] = creData["Term.riskList"];
    delete creData["Term.riskList"];
    creData["riskList"].forEach((e: any) => {
      for (let key in e) {
        const k = "TermRisktgt." + key;
        e[k] = e[key];
        delete e[key];
      }
    });
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
  updateTitle();
}

function validate() {}
function showFlush() {
  tremTemplateRefs.value.forEach((item) => {
    item.dataInit();
  });
}
function getTableValue(rowId: number, key: string) {}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  showFlush,
});
</script>

<style scoped>
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important;
}
</style>
