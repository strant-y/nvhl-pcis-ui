<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <el-form ref="cvrgFormfef" :model="formData" :inline-message="true">
          <tremTemplate
            v-for="(i, index) in formData"
            :key="index"
            v-model="formData[index]"
            @delete="deleteData(k, index)"
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
    addTermData();
  },
};

// 绑定特殊验证器
const exRules = {};

function addTermData() {
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
          let riskList: { [key: string]: any }[] = [];
          item.children?.forEach((e: any) => {
            riskList.push({
              "TermRisktgt.cLiabCode": e.cRiskNo,
            });
          });
          let data = {
            "Term.cClauseNumber": item.cTermNo,
            riskList: riskList,
          };
          formData.value.push(data);
        });
      },
    },
    { title: "添加条款", width: 85 }
  );
}

function deleteData(plan: string, index: number) {
  formData.value.splice(index, 1);
}

function getFromValue() {
  let tableobj: { [key: string]: any } = {};
  let redata: any[] = [];
  formData.value.forEach((item: any) => {
    const i = JSON.parse(JSON.stringify(item));
    i["riskList"].forEach((e: any) => {
      for (let key in e) {
        const k = key.split(".")[1];
        e[k] = e[key];
        delete e[key];
      }
    });
    redata.push(i);
  });
  tableobj["items"] = redata;
  return tableobj;
}

function setFormValue(value: any) {
  formData.value = [];
  value.forEach((item: any) => {
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
    formData.value.push(creData);
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
