<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <div>
        <el-form ref="cvrgFormfef" :model="formData" :inline-message="true">
          <tremTemplate
            v-for="(i, index) in formData"
            :key="index"
            :form-data="i"
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
import { DialogMethod } from "@/views/dzmodel/ComDialogConf";
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
    dialog.value?.open(
      "addtremView",
      { type: "show", data: {} },
      {
        isOk: () => {
          formData.value.push({
            termNme: "条款名",
            riskNo: "040001",
            termNo: "00623000031",
            'cvrg.termCde':"001524",
            cvrgType: "1",
            rigeNme: "责任名",
          });
        },
      },
      { title: "添加条款", width: 70 }
    );
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {}

function setFormValue(value: any) {}

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
