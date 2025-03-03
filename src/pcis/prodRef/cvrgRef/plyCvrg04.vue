<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <el-form ref="cvrgFormfef" :model="formData" :inline-message="true">
          <tremTemplate
            v-for="(i, index) in formData"
            :key="index"
            v-model="formData[index]"
          />
        </el-form>
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
          let adddata: any [] = [];
          selectdata.forEach((item: any) => {
            let riskList: { [key: string]: any; }[] = [];
            item.children?.forEach((e: any) => {
              riskList.push({
                "TermRisktgt.cLiabCode": e.cRiskNo
              });
            });
            let data = {
              cTermNo:item.cTermNo,
              riskList:riskList,
            };
            formData.value.push(data);
          });
        },
      },
      { title: "添加条款", width: 85 }
    );
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
    const tableobj={}
    const delformData=JSON.parse(JSON.stringify(formData.value))
    delformData.forEach((item: any) => {
        item['Term.cClauseNumber']=item['cTermNo'];
        item["Term.riskList"]=item['riskList']
        delete item["cTermNo"];
        delete item["riskList"];
        item['Term.riskList'].forEach((e: any) => {
            e['TermRisktgt.cLiabCode']=e["cvrg.cRiskNo"];
            delete e["cvrg.cRiskNo"]
            for (let key in e) {
                const k=key.split('.')[1];
                e[k]=e[key]
                delete e[key]
            }
        });
    });
    tableobj['items']=delformData;
    return tableobj
}

function setFormValue(value: any) {
     value.forEach((item: any) => {
            item['cTermNo']=item['Term.cClauseNumber'];
            item['riskList']=item["Term.riskList"]
            delete item["Term.cClauseNumber"];
            delete item["Term.riskList"];
            item['riskList'].forEach((e: any) => {
                for (let key in e) {
                    const k='TermRisktgt.'+key
                    e[k]=e[key]
                    delete e[key]
                }
                e["cvrg.cRiskNo"]=e['TermRisktgt.cLiabCode']
                delete e["TermRisktgt.cLiabCode"]
            });
        });
    formData.value=value
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

<style scoped></style>
