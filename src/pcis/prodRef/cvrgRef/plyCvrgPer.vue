<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <!-- <el-form ref="cvrgFormfef" :model="formData" :inline-message="true">
          <tremTemplate
            v-for="(i, index) in formData"
            :key="index"
            v-model="formData[index]"
            @delete="(r)=>{deleteData(index,r) }"
            :ref="(res)=>{ tremTemplateRefs[index] = res } "
          />
        </el-form> -->

        <template v-if="formData['m'] && formData['m'].length > 0">
          <myCard
            :cardConfig="{
              title: '主条款信息',
              showInTitle: true,
            }"
          >
            <tremTemplate
              v-for="(i, index) in formData['m']"
              :key="index"
              v-model="formData['m'][index]"
              :disabled-flag="disAbledFlag"
              :faters="faters"
              @delete="
                (r) => {
                  deleteData(r);
                }
              "
              :ref="
                (res) => {
                  tremTemplateRefs['m' + index] = res;
                }
              "
            />
          </myCard>
        </template>

        <template v-if="formData['a1'] && formData['a1'].length > 0">
          <myCard
            :cardConfig="{
              title: '扩展类附加条款信息',
              showInTitle: true,
            }"
          >
            <el-form
              ref="cvrgFormfef"
              :model="formData['a1']"
              :inline-message="true"
            >
              <tremTemplate
                v-for="(i, index) in formData['a1']"
                :key="index"
                v-model="formData['a1'][index]"
                :disabled-flag="disAbledFlag"
                :faters="faters"
                @delete="
                  (r) => {
                    deleteData(r);
                  }
                "
                :ref="
                  (res) => {
                    tremTemplateRefs['a1' + index] = res;
                  }
                "
              />
            </el-form>
          </myCard>
        </template>
        <template v-if="formData['a2'] && formData['a2'].length > 0">
          <myCard
            :cardConfig="{
              title: '限制类附加条款信息',
              showInTitle: true,
            }"
          >
            <tremAddTemplate2
              :planData="formData['a2']"
              :disabled-flag="disAbledFlag"
              @delete="
                (r) => {
                  deleteData(r);
                }
              "
              :ref="
                (res) => {
                  tremTemplateRefs['a2' + index] = res;
                }
              "
            />
          </myCard>
        </template>
        <template v-if="formData['a3'] && formData['a3'].length > 0">
          <myCard
            :cardConfig="{
              title: '规范类附加条款信息',
              showInTitle: true,
            }"
          >
            <tremAddTemplate3
              :planData="formData['a3']"
              :disabled-flag="disAbledFlag"
              @delete="
                (r) => {
                  deleteData(r);
                }
              "
              :ref="
                (res) => {
                  tremTemplateRefs['a3' + index] = res;
                }
              "
            />
          </myCard>
        </template>
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
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { codeListViewStore } from "@/store";
import { qryProdRelTermRiskList } from "@/api/prod";
import { getEdrRsnTermItem } from "@/api/query";
const codeListStore = codeListViewStore();
const opertaor = dataOpertaor();
const parparam = opertaor.getParam();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});

const cardconfig = ref(creatCardConfig({}));
const tremTemplateRefs = ref<any>({});
const cvrgFormfef = ref("cvrgFormfef");
const formData = ref<{ [key: string]: [] }>({});
const disAbledFlag = ref(false);

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
  if (parparam.pageType === "app") {
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
            "Term.NSeqNo":1,
            riskList: riskList,
          };
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          // 数据初始化
          initTermData(item,data);
          plans.push(data);
        });
        refushData(plans);
      } else {
        ElMessage.error(msg);
      }
    });
  }
});

// 绑定方法
const method = {
  funcadd: () => {
    addTermData();
  },
};

const edrItem = ref<[key: string, value: Array<any>] | any>({});
function updateEdrItem(terms: any[]) {
  console.log(parparam);
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

function addTermData() {
  const param = opertaor.getParam();
  const iss: any[] = [];
  if (formData.value) {
    Object.keys(formData.value).forEach((k: any) => {
      iss.push(...formData.value[k]);
    });
  }
  dialog.value?.open(
    "addtremView",
    {
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        isselectData: iss,
      },
    },
    {
      isOk: (selectdata: any) => {
        console.log('-------------',selectdata)
        let plans: any[] = [];
        selectdata.forEach((item: any, index:number) => {
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
              "Term.NSeqNo": index+1,
            };
          }
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          // 数据初始化
          initTermData(item,data);
          data.riskList = riskList;
          plans.push(data);
        });
        console.log('2121',plans)
        refushData(plans);
      },
    },
    { title: "添加条款", width: 85 }
  );
}

function initTermData(item: any,data:any){
  if(item.cUniqueTermNo === "00425000137"){
    data["Term.nAdjustFactor"] = 100;
  }
  if(item.cUniqueTermNo === "00425000179"){
    console.log(data);
    data['Term.cClaimInclude'] = '0';
  }
}
function deleteData(term: any) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTermByNo(term["Term.cClauseCode"]);
    if (term['Term.cRdrTyp'] === "0") {
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
              deleteTermByNo(r["RdrTerm"]);
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

function deleteTermByNo(t: any) {
  Object.keys(formData.value).forEach((item) => {
    let deleindex: any = null;
    for (const i in formData.value[item]) {
      if (formData.value[item][i]["Term.cClauseCode"] === t) {

        // 批改的情况下，标记该单为删除状态
        if (parparam.cEdrType) {
          tremTemplateRefs.value[item+i].setCancel();
        } else {
          deleindex = i;
        }
      }
      if (deleindex != null) {
        formData.value[item].splice(deleindex, 1);
        deleindex = null;
      }
    }
  });
}

function refushData(datas: any) {
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
  formData.value = {};
  setTimeout(() => {
    formData.value = pd;
    nextTick(() => {
      showFlush();
    });
  }, 50);
}

function getFromValue() {
  let redata: any[] = [];
  const terms: any[] = [];
  Object.keys(formData.value).forEach((item) => {
    formData.value[item].forEach((d: any) => {
      const i = JSON.parse(JSON.stringify(d));
      if (i["riskList"]) {
        i["Term.riskList"] = i["riskList"];
        delete i["riskList"];
      }
      redata.push(i);
    });
  });
  return redata;
}

function setFormValue(value: any) {
  const terms: any[] = [];
  formData.value = {};
  let plandata: any[] = [];
  value.forEach((item: any) => {
    let creData = JSON.parse(JSON.stringify(item));
    creData["riskList"] = creData["Term.riskList"];
    terms.push(creData["Term.cClauseCode"]);
    delete creData["Term.riskList"];
    plandata.push(creData);
  });
  refushData(plandata);
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
  Object.keys(tremTemplateRefs.value).forEach((item: any) => {
    if (tremTemplateRefs.value[item]) {
      tremTemplateRefs.value[item].dataInit();
    }
  });
  updateBtn();
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
}

function getndisAbleConfig(key: any) {
  return edrItem.value[key];
}

const faters = ref({
  getndisAbleConfig: getndisAbleConfig,
});


function calcCheck(){
  return {
    res: true,
    msg: "验证通过",
  };
}

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
});
</script>

<style scoped>
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important;
}
</style>
