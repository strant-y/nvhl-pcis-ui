<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <div v-for="(v,k) in planData" :key="k" class="planInfo">
          <el-card>
            <template #header >
              <el-row :gutter="16">
                <el-col :span="4">
                  <a style="margin-right: 5px" @click="changeHidden(k)">
                    <el-icon v-if="!isHidden(k)"><ArrowUpBold /></el-icon>
                    <el-icon v-if="isHidden(k)"><ArrowDownBold /></el-icon>
                  </a>
                  {{k}}方案</el-col>
                <el-col :span="16">
                  {{ showTitleMap[k]?showTitleMap[k]:"" }}
                </el-col>
                <el-col :span="4">
                  <rt-button :item="{
                    label:'添加条款',
                    icon:'CirclePlus',
                    type:'primary',
                    size:'small',
                    func:()=>{
                      addTermData(k);
                    }
                  }"/>
                  <rt-button :item="{
                    icon:'Delete',
                    type:'danger',
                    size:'small',
                    func:()=>{
                      deletePlan(k);
                    }
                  }"/>
                </el-col>
              </el-row>
            </template>
            <template v-if="isHidden(k)">
              <el-form ref="cvrgFormfef" :model="planData[k]" :inline-message="true">
                <tremTemplate
                  v-for="(i, index) in planData[k]"
                  :key="index"
                  v-model="planData[k][index]"
                  @delete="(data)=>{ deleteData(k, index, data)}"
                  :ref="(res)=>{ tremTemplateRefs[index] = res } "
                />
              </el-form>
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
const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { prodTemple } from "./titleTemple";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
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
const formData = ref<any[]>([]);
let planData = reactive<{ [key: string] : any[] }>({});
const hiddenFlag = ref<any[]>([]);

const showTitleMap = ref<{ [key: string] : string }>({});

function updateTitle(){
  Object.keys(planData).forEach((k: any) => {
  const str = prodTemple.value.default;
  const filledString = fillTemplate(str, { sumPrm:0 ,sumObjs:0 });
  showTitleMap.value[k] = filledString;
  })
}

function fillTemplate(template: string, params: { [key: string]: any }): string {
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
    const l = Object.keys(planData).forEach((k: any) => {
      const numberPart = parseInt(k.replace(/\D/g, ''), 10);
      if(numberPart>maxindex){
        maxindex = numberPart;
      }
});
    const planKey = 'P'+(maxindex+1);
    planData[planKey] = [];
    updateTitle();
  },
};

function isHidden(pl: any){
  return hiddenFlag.value.indexOf(pl)==-1;
}
function changeHidden(pl: any){
  const index = hiddenFlag.value.indexOf(pl);
  if(index==-1){
    hiddenFlag.value.push(pl);
  }else{
    hiddenFlag.value.splice(index,1);
  }
}
// 绑定特殊验证器
const exRules = {};

function addTermData(PlanNo: string){
  const param = opertaor.getParam();
    dialog.value?.open(
      "addtremView",
      {
        type: "show",
        data: {
          cProdNo: param.cProdNo,
          isselectData:planData[PlanNo]
        },
      },
      {
        isOk: (selectdata: any) => {
          selectdata.forEach((item: any) => {
            let riskList: { [key: string]: any; }[] = [];
            item.children?.forEach((e: any) => {
              riskList.push({
                "TermRisktgt.cLiabCode": e.cRiskNo
              });
            });
            let data = {
              'Term.cClauseCode':item.cTermNo,
              riskList:riskList,
            };
            planData[PlanNo].push(data);
          });
        },
      },
      { title: "添加条款", width: 85 }
    );
}

function deleteData(plan: string, index: number, term: any) {
  planData[plan].splice(index, 1);
  if(term.cRdrTyp === '0'){
    codeListStore.queryCodeList(
          {
            codeListName: 'MainTermlist',
            codeListParam: { cTermNo:term.cTermNo },
          },
          false,
          false
        )
        .then((res) => {
          if(res && res.length>0){
            res.forEach(r=>{
              deleteTermByNo(plan,r);
            })
          }
        })
        .catch((err) => {
          console.error(err);
        });
  }
}

function deleteTermByNo(plan:any, t:any){
  let deleindex = null;
  planData[plan].forEach((item: any,index :any) => {
    if(item['Term.cClauseCode'] === t['RdrTerm']){
      deleindex = index;
    }
  });
  if(deleindex !== null ){
    planData[plan].splice(deleindex, 1);
  }
}

function getFromValue() {
    let tableobj:{[key:string]: any}={};
    let redata:any[] = [];
    Object.keys(planData).forEach((key) => {
        planData[key].forEach((item: any) => {
          const i = JSON.parse(JSON.stringify(item));
          i['Term.cPlanNo']=key;
          i['riskList'].forEach((e: any) => {
              for (let key in e) {
                const k=key.split('.')[1];
                e[k]=e[key]
                delete e[key]
              }
            });
            i['Term.riskList']=i["riskList"]
            delete i["riskList"];
            redata.push(i);
        })
    })
    tableobj['items']=redata;
    return tableobj
}

function setFormValue(value: any) {
  planData = {};
  value.forEach((item: any) => {
    const planKey = item['Term.cPlanNo'];
    let creData = JSON.parse(JSON.stringify(item));
    creData['riskList']=creData["Term.riskList"]
    delete creData["Term.riskList"];
    creData['riskList'].forEach((e: any) => {
        for (let key in e) {
            const k='TermRisktgt.'+key
            e[k]=e[key]
            delete e[key]
        }
    });
    if(planData[planKey]){
      planData[planKey].push(creData);
    }else{
      let newrisk:any[]=[];
      newrisk.push(creData);
      planData[planKey]=newrisk;
    }
  });
  updateTitle();
}

function validate() {}
function showFlush(){
  tremTemplateRefs.value.forEach((item)=>{
    item.dataInit()
  })
}
function getTableValue(rowId: number, key: string) {}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  showFlush
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";

::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important; 
}
</style>
