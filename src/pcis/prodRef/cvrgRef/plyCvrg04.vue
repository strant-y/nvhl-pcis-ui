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
                <el-col :span="16"></el-col>
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
                  @delete="deleteData(k,index)"
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
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const opertaor = dataOpertaor();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const cardconfig = ref(creatCardConfig({}));

const cvrgFormfef = ref("cvrgFormfef");
const formData = ref<any[]>([]);
const planData = ref<{ [key: string] : any[] }>({});
const hiddenFlag = ref<any[]>([]);;

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
});

// 绑定方法
const method = {
  funcadd: () => {
    let maxindex = 0;
    const l = Object.keys(planData.value).forEach((k: any) => {
      const numberPart = parseInt(k.replace(/\D/g, ''), 10);
      if(numberPart>maxindex){
        maxindex = numberPart;
      }
});
    const planKey = 'P'+(maxindex+1);
    planData.value[planKey] = [];
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
            planData.value[PlanNo].push(data);
          });
        },
      },
      { title: "添加条款", width: 85 }
    );
}

function deleteData(plan: string, index: number) {
  planData.value[plan].splice(index, 1);
}

function deletePlan(plan: string) {
  delete planData.value[plan];
}

function getFromValue() {
    let tableobj:{[key:string]: any}={};
    let redata:any[] = [];
    Object.keys(planData.value).forEach((key) => {
        planData.value[key].forEach((item: any) => {
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
  planData.value = {};
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
    if(planData.value[planKey]){
      planData.value[planKey].push(creData);
    }else{
      let newrisk:any[]=[];
      newrisk.push(creData);
      planData.value[planKey]=newrisk;
    }
  });
}

function validate() {}

function getTableValue(rowId: number, key: string) {}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
});
</script>

<style scoped>
::v-deep .planInfo .el-card__header {
  padding: 2px 15px !important; 
}
</style>
