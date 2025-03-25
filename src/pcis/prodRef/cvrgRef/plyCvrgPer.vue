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
              @delete="
                (r) => {
                  deleteData(r);
                }
              "
              :ref="
                (res) => {
                  tremTemplateRefs[index] = res;
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
                @delete="
                  (r) => {
                    deleteData(r);
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
        <template v-if="formData['a2'] && formData['a2'].length > 0">
          <myCard
            :cardConfig="{
              title: '限制类附加条款信息',
              showInTitle: true,
            }"
          >
            <tremAddTemplate2
              :planData="formData['a2']"
              @delete="
                (r) => {
                  deleteData(r);
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
              @delete="
                (r) => {
                  deleteData(r);
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
import tremTemplate from "./trem-template.vue";
import tremAddTemplate2 from "./trem-add2-template.vue";
import tremAddTemplate3 from "./trem-add3-template.vue";
const dialog = ref<DialogMethod | null>(null);
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const opertaor = dataOpertaor();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const cardconfig = ref(creatCardConfig({}));
const tremTemplateRefs = ref<any[]>([]);
const cvrgFormfef = ref("cvrgFormfef");
const formData = ref<{ [key: string]: { [key: string]: any } }>({});

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
        isselectData: formData.value,
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
        
        refushData(plans);
      },
    },
    { title: "添加条款", width: 85 }
  );
}

function deleteData(term: any) {
  deleteTermByNo(term["Term.cClauseCode"]);
  if (term.cRdrTyp === "0") {
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
}

function deleteTermByNo(t: any) {
  let deleindex = null;
  Object.keys(formData).forEach((item) => {
    let deleindex = null;
    for (let i = 0; i < formData.value[item].length; i++) {
      if (formData.value[item][i]["Term.cClauseCode"] === t) {
        deleindex = i;
      }
    }
    if (deleindex != null) {
      formData.value[item].splice(deleindex, 1);
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
  formData.value = pd;
}

function getFromValue() {
  let tableobj: { [key: string]: any } = {};
  let redata: any[] = [];
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
  tableobj["items"] = redata;
  return tableobj;
}

function setFormValue(value: any) {
  Object.assign(formData.value, {});
  let plandata: any[] = [];
  value.forEach((item: any) => {
    let creData = JSON.parse(JSON.stringify(item));
    creData["riskList"] = creData["Term.riskList"];
    delete creData["Term.riskList"];
    plandata.push(creData);
  });
  refushData(plandata);
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
