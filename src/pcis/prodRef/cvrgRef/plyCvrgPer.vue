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
              titleClass: 'mainTitle',
              showInTitle: true,
            }"
          >
            <tremTemplate
              v-for="(i, index) in formData['m']"
              :key="index"
              :rowIndex="index"
              v-model="formData['m'][index]"
              :disabled-flag="disAbledFlag"
              :faters="faters"
              :addr-seq-array="addrSeqArray"
              @delete="
                (r) => {
                  if(formData['m'].length === 1 && parparam.cTransMrk !== '1'){
                    ElMessage.error('仅剩1条主条款时,不能删除!');
                    return ;
                  }else{
                    deleteData(index,r);
                  }
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
                :rowIndex="index"
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
import { mutualExclusionClause } from "./mutualExclusionClause.ts";

const tremTemplate = defineAsyncComponent(() => import("./trem-template.vue"));
import { v4 as uuidv4 } from "uuid";

const tremAddTemplate2 = defineAsyncComponent(
  () => import("./trem-add2-template.vue")
);
const tremAddTemplate3 = defineAsyncComponent(
  () => import("./trem-add3-template.vue")
);
const selectTgtFix = defineAsyncComponent(
  () => import("./selectTgt.vue")
);
const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { codeListViewStore } from "@/store";
import {qryProdRelTermRiskList, selectDist} from "@/api/prod";
import { getEdrRsnTermItem } from "@/api/query";
import { terConfig } from "@/store/modules/term-config";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const codeListStore = codeListViewStore();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const parparam = opertaor.getParam();
const termConfig = terConfig();
const {selectedRow} = storeToRefs(termConfig);
const cAppNo = computed(() => opertaor.getDataAll()['plyBase']['Base.cAppNo']);
const cInquiryNo = computed(() => opertaor.getDataAll()['plyBase']['Base.cInquiryNo']);
const pageName = computed(() => opertaor.getParam()['pageName']);
const emit = defineEmits(['savePlyInfo']);
const addrSeqArray = ref([]);
const exli = ref(['010001','010002','010003','010004','010020']);

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
const codeListMap = ref<any>({});
provide('codeListMap', codeListMap.value);

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  let deleteId = 0 ;
  if(formconfig11.titleBtns){
    formconfig11.titleBtns.forEach((item: any,index :number) => {
      if(item.id === 'selectGoods'){
        deleteId = index;
      }
    });
  }
  if(!parparam.cProdNo.startsWith("02") && deleteId > 0){ // 只有货运险,需要选择获取按钮
    formconfig11.titleBtns?.splice(deleteId,1);
  }
  formconfig11.titleClass = 'card-title-style';
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
              "TermRisktgt.cDeductibleMethod": "01",
            });
          });
          let data: { [key: string]: any } = {
              "Term.cClauseCode": item.cTermNo,
              "Term.cRdrTyp": item.cRdrTyp,
              "Term.cUniqueTermNo": item.cUniqueTermNo,
              "Term.nSeqNo":1,
              "Term.cPlanNo":'P1',
              "Term.cDeductibleMethod": "01",
          };
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          if(item.cUniqueTermNo && item.cPrimaryMrk === '1'){
            // 部分条款责任互斥,所以互斥条款,不再加载对应的责任信息
            data.riskList = [];
          }else{  
            data.riskList = riskList;
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
  selectTgt: () => {
    if(!selectedRow.value || !selectedRow.value.data) {
      ElMessage.warning('请先选择一行条款数据!');
      return;
    }

    /* cDistPkId（去重） */
    const existPkId = [];
    Object.values(formData.value).flat().forEach((row:any)=>{
        if(row['Term.cDistPkId']){
            existPkId.push(row['Term.cDistPkId'])
        }
        if(row.riskList){
            row.riskList.forEach((item:any)=>{
                if(item['TermRisktgt.cDistPkId']){
                    existPkId.push(item['TermRisktgt.cDistPkId'])
                }
            })
        }
    })
    const uniqueArr = Array.from(new Set(existPkId));
    console.log(uniqueArr);

    dialog.value?.open(
        selectTgtFix,
        {
          selectedData: selectedRow.value.data, //需要把自定义的过滤掉，只传过去从模板中选择的
          selectList : uniqueArr,   // 已选 cpkId 数组, 去重
          cProdNo: parparam.cProdNo,
          cTermNo: parparam.cTermNo,
        },
        {
          getSelected(selectdata: any, amount: string) {
            if(selectdata && selectdata.length > 0) {
              const ids = selectdata.map(item => item['Dist.nSeqNo']).join(',');
              const codeNos = selectdata.map(item => item['Dist.cCodeNo']).join(',');
              const cPkIds = selectdata.map(item => item['Dist.cPkId']).join(',');
              setCargoSeq(codeNos, cPkIds, amount);
            }else {
              setCargoSeq('');
            }
            tremTemplateRefs.value['m0'].dataFlash();
            dialog.value?.handleClose()
          }
        },
        {title: '选择货物',  width: 65 }
    );
  }
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
        cEcAgrNo:param?.cEcAgrNo || ''
      },
    },
    {
      isOk: (selectdata: any) => {
        let plans: any[] = [];
        selectdata.forEach((item: any, index:number) => {
          let riskList: { [key: string]: any }[] = [];
          const se = iss.filter(
            (em) => em["Term.cClauseCode"] === item.cTermNo
          );
          if(item.cRiskType === 'grid'){
            if (se.length > 0) {
              riskList = se[0].riskList;
            }
          }else{
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
          }
          let data: { [key: string]: any } = {};
          if (se.length > 0) {
            data = se[0];
          } else {
            data = {
              "Term.cClauseCode": item.cTermNo,
              "Term.cRdrTyp": item.cRdrTyp,
              "Term.cUniqueTermNo": item.cUniqueTermNo,
              "Term.nSeqNo": index+1,
              "Term.cPlanNo":'P1',
            };
          }
          if (item.cRdrTyp === "1") {
            data["Term.cClauseCategory"] = item.cClauseCategory;
          }
          // 043002增加附加条款时，如果标的信息中的投保司乘人员座位总数有值则添加到条款中
          const nInsuredcompanySeats = opertaor.getDataAll()?.['tgt']?.['Tgt.nInsuredcompanySeats']
          if (parparam.cProdNo === "043002" && nInsuredcompanySeats) {
            data["Term.nInsuredcompanySeats"] = nInsuredcompanySeats;
          }
          // 数据初始化
          initTermData(item,data);
          data.riskList = riskList;
          plans.push(data);
        });
        refushData(plans);
      },
    },
    { title: "添加条款", width: 85 }
  );
}

function initTermData(item: any,data:any){
  if(item.cUniqueTermNo === "00425000137" || item.cUniqueTermNo === "00425000134"){
    data["Term.nAdjustFactor"] = 100;
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
        if (parparam.cEdrType && formData.value[item][i]['Term.cRowId'] ) {
          if(formData.value[item][i]['Term.cRdrTyp'] !== '0' && formData.value[item][i]['Term.cClauseCategory'] !== '1'){ // 规范类，限制类，退保状态只标记
            formData.value[item][i]['Term.cCancelMrk'] = '1';
          }else{
            tremTemplateRefs.value[item+i].setCancel();
          }
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

function refushCvrgInfo() {
  if(!(parparam.cProdNo.startsWith("02") || exli.value.filter(item => item.cProdNo === parparam.cProdNo).length > 0 )) {
    return;
  }
  const selData: any = {
    cComponentTable: 'Term',
  };
  if(pageName.value === "priceInquiry") {
    selData['cInquiryNo'] = cInquiryNo.value;
  }else {
    selData['cAppNo'] = cAppNo.value;
  }
  selectDist(selData).then((termRes: any) => {
    if (termRes.code === 200) {
      const termList = termRes.data.data;
      selectDist({...selData, cComponentTable: 'TermRisktgt'}).then((termRisktgtRes: any) => {
        if (termRisktgtRes.code === 200) {
          const termRisktgtList = termRisktgtRes.data.data;
          for (const term of termList) {
            const riskList = termRisktgtList.filter((e: any) => e['TermRisktgt.cClauseCode'] === term['Term.cClauseCode']);
            if(riskList) {
              term['Term.riskList'] = [...riskList];
            }
          }
          setFormValue(termList);
        }
      });
    }
  });
}

function getAddrSeqOptions() {
  const selData: any = {
    pageNum: 1,
    pageSize: 9999,
    cProdNo: parparam.cProdNo,
    cClauseCode: parparam.cTermNo,
    cComponentTable: "PropertyaddressDist",
  };
  if(pageName.value === "priceInquiry") {
    selData['cInquiryNo'] = cInquiryNo.value;
  }else {
    selData['cAppNo'] = cAppNo.value;
  }
  selectDist(selData).then((addrRes: any) => {
    if (addrRes.code === 200) {
        const addrList = addrRes.data.data || [];
        addrSeqArray.value  = addrList.map(item => ({
            label: String(item['Dist.cCodeNo']),
            value: String(item['Dist.cCodeNo']),
            id: String(item['Dist.cPkId']),
        }));
        sessionStorage.setItem("getAddrSeqData", JSON.stringify(addrSeqArray.value));
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
  let idex = 1;
  Object.keys(formData.value).forEach((item) => {
    formData.value[item].forEach((d: any) => {
      const i = JSON.parse(JSON.stringify(d));
      i["Term.nSeqNo"] = idex++;
      if (i["riskList"]) {
        i["Term.riskList"] = i["riskList"].map((m: any) => {
          return m;
        });
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
      tremTemplateRefs.value[item].dataFlash();
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

const getRowId = () :string => {
  return uuidv4().replace(/-/g, "")
};

function setTermData(param: any, value: any){
  const prop: string = param.factorProp;
  const termNo: string = param.termNo;
  const riskNo: string = param.riskNo;
  Object.keys(formData.value).forEach((item) => {
    formData.value[item].forEach((d: any) => {
      if(d['Term.cUniqueTermNo'] === termNo){
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
  showFlush();
}
const faters = ref({
  getndisAbleConfig: getndisAbleConfig,
  setTermData:setTermData
});


function calcCheck(){
  return {
    res: true,
    msg: "验证通过",
  };
}
const setCargoSeq = (value: string, pkId: string, amount: string) => {
  const {index, data} = selectedRow.value;
  if(formData.value['m'] && formData.value['m'].length > 0) {
    if(data['Term.cClauseCode']) {
      formData.value['m'][index]['Term.cDistCodeNo'] = value;
      formData.value['m'][index]['Term.cDistPkId'] = pkId;
      formData.value['m'][index]['Term.nInsuranceAmount'] = amount;
      selectedRow.value.data = formData.value['m'][index];
    }else {
      formData.value['m'][index]['riskList'].forEach((item: any) => {
        if(item['TermRisktgt.cLiabCode'] === data['TermRisktgt.cLiabCode']) {
          item['TermRisktgt.cDistCodeNo'] = value;
          item['TermRisktgt.cDistPkId'] = pkId;
          item['TermRisktgt.nInsuranceAmount'] = amount;
          selectedRow.value.data = item;
        }
      });
    }
  }
  emit('savePlyInfo');
};

function getPlanNo() {
  let plans:any = [];
  if (formData.value["m"] && formData.value["m"].length > 0) {
    formData.value["m"].forEach((e) => {
      let d = { label: e["Term.cPlanNo"], value: e["Term.cPlanNo"] };
      plans.push(d);
    });
  }
  return plans;
}

onActivated(() => {
  console.log('keep-alive -> onActivated')
});
onDeactivated(() => {
  console.log('keep-alive -> onDeactivated')
});
onUnmounted(() => {
  sessionStorage.getItem('getAddrSeqData') && sessionStorage.removeItem('getAddrSeqData');
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
  refushCvrgInfo,
  getAddrSeqOptions,
  getPlanNo,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important;
}
</style>
