<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <div v-for="(v, k) in planData" :key="k" class="planInfo">
          <el-card class="planCard">
            <template #header>
              <el-row :gutter="16">
                <el-col :span="4">
                  <a style="margin-right: 5px" @click="changeHidden(k)">
                    <el-icon v-if="!isHidden(k)" color="var(--el-text-color)"><ArrowRightBold /></el-icon>
                    <el-icon v-if="isHidden(k)" color="var(--el-text-color)"><ArrowDownBold /></el-icon>
                  </a>
                  {{ k }}方案</el-col
                >
                <el-col :span="14">
                  {{ showTitleMap[k] ? showTitleMap[k] : "" }}
                </el-col>
                <el-col :span="6">
                  <rt-button
                    v-if="!btnItem.addPlan.hidden"
                    @click="addTermData(k)"
                    :item="btnItem.addPlan"
                  />
                  <rt-button
                    v-if="showPlanDelete(k,btnItem.delPlan)"
                    @click="()=>{ 
                      let cancount = 0;
                      Object.keys(planData).forEach(item =>{
                        if(planData[item]['m'] && planData[item]['m'].length > 0){    //计算未退保主条款数
                          planData[item]['m'].forEach( m =>{
                            if(m['Term.cCancelMrk'] !== '1'){
                              cancount++;
                            }
                          })
                        }
                      })
                      if(cancount <= 1 && parparam.cTransMrk !== '1'){
                        ElMessage.error('仅剩1个方案时,不能删除!');
                        return;
                      }else{
                        deletePlan(k);
                      }
                    }"
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
                    titleClass: 'mainTitle',
                    showInTitle: true,
                  }"
                >
                  <tremTemplate
                    v-for="(i, index) in planData[k]['m']"
                    :key="planData[k]['m'][index]['&rowId']"
                    :rowIndex="i['Term.cPlanNo']"
                    v-model="planData[k]['m'][index]"
                    :disabled-flag="disAbledFlag"
                    @delete="
                      (r) => {
                        if(planData[k]['m'].length === 1 && parparam.cTransMrk !== '1'){
                          ElMessage.error('仅剩1条主条款时,不能删除!');
                          return ;
                        }else{ 
                          deleteData(k, r);
                        }
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
                      :key="planData[k]['a1'][index]['&rowId']"
                      :rowIndex="i['Term.cPlanNo']"
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
                        tremTemplateRefs[k + 'a2'] = res;
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
                        tremTemplateRefs[k + 'a3'] = res;
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
import { fillTemplate, prodTemple } from "./titleTemple";
import { codeListViewStore } from "@/store";
import { qryProdRelTermRiskList } from "@/api/prod";
import { getEdrRsnTermItem } from "@/api/query";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { v4 as uuidv4 } from "uuid";

const disAbledFlag = ref(false);
const codeListMap = ref<any>({});
provide('codeListMap', codeListMap.value);
// 添加一个标志位来标识是否通过funcadd方法调用

const isFuncAddCalled = ref(false);
const allTermMap = [
'00425000281','00425000282','00425000283','00425000277','00425000279',
'00425000278','00425000092','00425000280'
];

const cAddTermNo = ref('');

watch(() => cAddTermNo.value, (val) => {
  if(allTermMap.includes(val)){
    const tgt = opertaor.getTableRefByKey('tgt');
    if(tgt){
      tgt.change403009(val);
    }
    const insured = opertaor.getTableRefByKey('insured');
    if(insured){
      insured.change403009(val);
    }
  }
})
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const parparam = opertaor.getParam();
const terconfig = terConfig();
terconfig.configInit(); // 条款配置数据初始化

const tremTemplateRefs = ref<any>({});

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
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
const planData = ref<{ [key: string]: { [key: string]: any } }>({});
const hiddenFlag = ref<any[]>([]);
const showTitleMap = ref<{ [key: string]: string }>({});

function updateTitle() {
  Object.keys(planData.value).forEach((k: any) => {
    if (parparam.cProdNo === "043009" || parparam.cProdNo === "040003" || parparam.cProdNo === "042003") {
      const terms = planData.value[k];
      // 获取模版字符串
      let str = prodTemple.value.default;
      if(parparam.cProdNo === "040003"){
        str = prodTemple.value.allPrm;
      }
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
        sumPrm: sumprm.toFixed(2),
        sumObjs: sumobj,
      });
      showTitleMap.value[k] = filledString;
    }
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
  formconfig11.titleClass = 'card-title-style';
  Object.assign(cardconfig.value, formconfig11);
  if (parparam.pageType === "app") {
    addAndinitData();
  }
  
});

function hiddenBtn(){
  Object.keys(btnItem.value).forEach((k: any) => {
    btnItem.value[k].hidden = true;
  });
}

function addAndinitData() { 
    const pl = addPlanMethod();
    const param = {
      cProdNo: parparam.cProdNo,
      cTermNo: parparam.cTermNo,
      cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}')?.companyId
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
            "Term.cPlanNo":pl,
            "Term.cDeductibleMethod": "01",
            riskList: riskList,
          };
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          cAddTermNo.value = item.cUniqueTermNo;
          initTermData(item,data);
          plans.push(data);
        });
        refushData(pl, plans);
        // 仅在通过funcadd方法调用时显示提示信息
        if (isFuncAddCalled.value) {
          ElMessage.success(`方案${pl}添加成功`);
        }
      } else {
        ElMessage.error(msg);
      }
    });
}

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
      if(t){
        btnItem.value[k].hidden = false;
      }
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
    isFuncAddCalled.value = true;
    addAndinitData();
  },
};

/** 判断删除按钮是否显示 */
function showPlanDelete(pl: any){
  let r =  !btnItem.value.delPlan.hidden;
  if(parparam.cRsnCde === '09'){    // 增加条款时,如果新增的条款, 可以正常显示删除按钮
    if(planData.value[pl]['m']){
      const rowId = planData.value[pl]['m'][0]['Term.cRowId'];
      if(!rowId){     // 如果不存在rowId,则是新增条款,正常显示删除按钮
        r = true;
      }
    }
  }
  return r;
}
function addPlanMethod() {
    let maxindex = 0;
      const l = Object.keys(planData.value).forEach((k: any) => {
      const numberPart = parseInt(k.replace(/\D/g, ""), 10);
      if (numberPart > maxindex) {
        maxindex = numberPart;
      }
    });
    const planKey = "P" + (maxindex + 1);
    planData.value[planKey] = [];
    return planKey;
}

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
  let parmdata = {
    cProdNo: param.cProdNo,
    isselectData: seld,
  }
  if(allTermMap.includes(cAddTermNo.value)){
    parmdata.cTermNo = cAddTermNo.value;
  }
  dialog.value?.open(
    "addtremView",
    {
      type: "show",
      data: parmdata,
    },
    {
      isOk: (selectdata: any) => {
        let plans: any[] = [];
        selectdata.forEach((item: any, index:number) => {
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
              "Term.cUniqueTermNo": item.cUniqueTermNo,
              "Term.NSeqNo": index+1,
              "Term.cPlanNo":PlanNo,
            };
          }
          data.riskList = riskList;
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
            // data["Term.cClaiminclude"] = '0';
          }
          initTermData(item,data);
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
		item['&rowId'] = uuidv4();  // 用作组件id标记,用于刷新组件
    pd[key].push(item);
  });
  // 强制刷新组件,对数据进行更新
  delete planData.value[planNo];

  setTimeout(() => {
    planData.value[planNo] = pd;
    // nextTick(() => {
    //   showFlush();
    // });
    updateTitle();
    
    // 仅在通过funcadd方法调用时执行滚动操作
    if (isFuncAddCalled.value) {
      // 在数据更新完成后执行滚动操作
      nextTick(() => {
        // 延迟一小段时间确保DOM完全渲染后再执行滚动
        setTimeout(() => {
          // 使用方案的特定键值来定位元素，更加精确
          const element = document.querySelector(`.planInfo[data-plan-key="${planNo}"]`);
          if (element) {
            // 滚动到元素位置，使用scrollIntoView
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
            
            // 添加偏移量以避免被顶部固定元素遮挡
            const offset = 100;
            window.scrollBy(0, -offset);
          } else {
            // 备用方案：滚动到最后一个.planInfo元素
            const lastElement = document.querySelector('.planInfo:last-child');
            if (lastElement) {
              lastElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
              });
              
              // 添加偏移量以避免被顶部固定元素遮挡
              const offset = 100;
              window.scrollBy(0, -offset);
            }
          }
          
          // 滚动完成后重置标志位
          isFuncAddCalled.value = false;
        }, 100);
      });
    }
  }, 100);
}
function deletePlan(plan: string) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    if (parparam.cEdrType) {

      const rowId = planData.value[plan]['m'][0]['Term.cRowId'];
      if(!rowId){   //如果不存在行RowId,则是新增条款,直接删除即可
        delete planData.value[plan];
      }else{
        Object.keys(planData.value[plan]).forEach((item) => {
          for (let i = 0; i < planData.value[plan][item].length; i++) {
            if(item === 'a1' || item === 'm'){
              tremTemplateRefs.value[plan+item+i].setCancel();
            }else{
              if(planData.value[plan][item] && planData.value[plan][item].length > 0){
                planData.value[plan][item].forEach(e => {
                  e['Term.cCancelMrk'] = '1';
                });
              }
            }
          }
        });
      }
    }else{
      delete planData.value[plan];
    }
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
        if (parparam.cEdrType && planData.value[plan][item][i]['Term.cRowId']) {
          if( planData.value[plan][item][i]['Term.cRdrTyp'] !== '0' && planData.value[plan][item][i]['Term.cClauseCategory'] !== '1'){
            planData.value[plan][item][i]['Term.cCancelMrk'] = '1';
          }else{
            tremTemplateRefs.value[plan+item+i].setCancel();
          }
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
    let idex = 1;
    Object.keys(planData.value[plan]).forEach((item) => {
      planData.value[plan][item].forEach((d: any) => {
        const i = JSON.parse(JSON.stringify(d));
        i["Term.cPlanNo"] = plan;
        i["Term.nSeqNo"] = idex++;
				delete i["&rowId"]; // 删除标记rowId字符串
        if (i["riskList"]) {
          let risk_index = 1;
          i["Term.riskList"] = i["riskList"].map((m: any) => {
          m['TermRisktgt.nSeqNo'] = risk_index++;
          return m;
        });
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
    tremTemplateRefs.value[item].dataFlash();
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
    tremTemplateRefs.value[item]?.setDisabledAll();
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

function calcCheck(){
  let r = true;
  let m = "";
  Object.keys(planData.value).forEach((k)=>{
    if(planData.value[k].length === 0){
      r = false;
      m = k;
    }
  });
  let res = {};
  res['res'] = r;
  res['msg'] = '验证通过';
  if(!r){
    res['msg'] =m + '方案未添加条款!请先添加条款!';
  }
  return res;
}

function initTermData(item: any,data:any){
  if(data.riskList && data.riskList.length > 0){
    data.riskList.forEach((r)=>{
      r['TermRisktgt.cDeductibleMethod'] = '01';
    })
  }
}

function getPlanNo(){
    const resultArray = Object.keys(planData.value).map((key, index) => ({
        label: key,
        value: key, 
    }));
    return resultArray;
}

function setTermData(param: any, value: any){
  const planNo: string = param.planNo;
  const prop: string = param.factorProp;
  const termNo: string = param.termNo;
  const riskNo: string = param.riskNo;
  const formData = planData.value[planNo];
    formData&&Object.keys(formData).forEach((item) => {
        formData[item].forEach((d: any) => {
          if(d['Term.cUniqueTermNo'] === termNo || d['Term.cClauseCode'] === termNo){
            if(!prop.startsWith('TermRisktgt')){
              d[prop] = value;
            }
            if (d.riskList && d.riskList.length > 0) {
              d.riskList.forEach((r: any)=>{
                if(r['TermRisktgt.cLiabCode'] === riskNo){
                  r[param.factorProp] = value;
                }
              })
            }
          }
        });
      });

  // Object.keys(formData).forEach((item) => {
  //   formData[item].forEach((d: any) => {
  //     if(!prop.startsWith('TermRisktgt')){
  //       d[prop] = value;
  //     }
  //     if (d.riskList && d.riskList.length > 0) {
  //       d.riskList.forEach((r: any)=>{
  //         if(r['TermRisktgt.cLiabCode'] === riskNo){
  //           r[param.factorProp] = value;
  //         }
  //       })
  //     }
  //   });
  // });
  console.log(planData.value);
  showFlush();
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
  setTermData,
  getPlanNo,
  updateTitle,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important;
  height: auto;
}

::v-deep .el-card__header {
   /* padding: 10px 16px !important; */
 }

::v-deep .el-card__body {
   padding: 0px 10px !important;
 }

:deep(.planCard > .el-card__header:first-child) {
  //background: #FAFAFA;
}
</style>
