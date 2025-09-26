<template>
  <template v-if="planData['m'] && planData['m'].length > 0">
    <tremTemplate
      v-for="(i, index) in planData['m']"
      :key="index"
      :rowIndex="i['Term.cPlanNo']"
      v-model="planData['m'][index]"
      :disabled-flag="disableflg"
      @delete="
        (r) => {
          deleteData(r);
        }
      "
      :faters="faters"
      :showConf="{ showHeader: false, showTerm: false }"
      :ref="
        (res) => {
          tremTemplateRefs['m' + index] = res;
        }
      "
    />
  </template>
  <template v-if="planData['a1'] && planData['a1'].length > 0">
    <el-form ref="cvrgFormfef" :model="planData['a1']" :inline-message="true">
      <tremTemplate
        v-for="(i, index) in planData['a1']"
        :key="index"
        :rowIndex="i['Term.cPlanNo']"
        v-model="planData['a1'][index]"
        :disabled-flag="disableflg"
        @delete="
          (r) => {
            deleteData(r);
          }
        "
        :faters="faters"
        :ref="
          (res) => {
            tremTemplateRefs['a1' + index] = res;
          }
        "
      />
    </el-form>
  </template>
  <template v-if="planData['a2'] && planData['a2'].length > 0">
    <tremAddTemplate2
      :planData="planData['a2']"
      :disabled-flag="disableflg"
      @delete="
        (r) => {
          deleteData(k, r);
        }
      "
      :ref="
        (res) => {
          tremTemplateRefs['a2'] = res;
        }
      "
    />
  </template>
  <template v-if="planData['a3'] && planData['a3'].length > 0">
    <tremAddTemplate3
      :planData="planData['a3']"
      :disabled-flag="disableflg"
      @delete="
        (r) => {
          deleteData(k, r);
        }
      "
      :ref="
        (res) => {
          tremTemplateRefs['a3'] = res;
        }
      "
    />
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  disabledFlag: {
    type: Boolean,
    default: false,
  },
  faters: {
    type: Object,
  },
});

import { dataOpertaor } from "@/store/modules/data-opertaor";
import {
  idxParamKey,
  IdxParamProps,
  useIdxParam,
} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const parparam = opertaor.getParam();
const planData = ref<{ [key: string]: { [key: string]: any } }>({}); //私有数据
const tremTemplateRefs = ref<any>({});
const disableflg = toRef(props,'disabledFlag');
const tremTemplate = defineAsyncComponent(() => import("./trem-template.vue"));
const tremAddTemplate2 = defineAsyncComponent(
  () => import("./trem-add2-template.vue")
);
const tremAddTemplate3 = defineAsyncComponent(
  () => import("./trem-add3-template.vue")
);

const emit = defineEmits(["update:modelValue"]);

const hiddenFlag = ref<any[]>([]);
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

function deleteData(term: any) {
  ElMessageBox.confirm("是否继续删除?", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTermByNo(term["Term.cClauseCode"]);
    ElMessage({
      type: "success",
      message: "删除成功",
    });
  });
}

function deleteTermByNo(t: any) {
  Object.keys(planData.value).forEach((item) => {
    let deleindex: any = null;
    for (const i in planData.value[item]) {
      if (planData.value[item][i]["Term.cClauseCode"] === t) {
        // 批改的情况下，标记该单为删除状态
        if (parparam.cEdrType && planData.value[item][i]["Term.cRowId"]) {
          if (
            planData.value[item][i]["Term.cRdrTyp"] !== "0" &&
            planData.value[item][i]["Term.cClauseCategory"] !== "1"
          ) {
            // 规范类，限制类，退保状态只标记
            planData.value[item][i]["Term.cCancelMrk"] = "1";
          } else {
            tremTemplateRefs.value[item + i].setCancel();
          }
        } else {
          deleindex = i;
        }
      }
      if (deleindex != null) {
        planData.value[item].splice(deleindex, 1);
        deleindex = null;
      }
    }
  });
}

function showFlush() {
  Object.keys(tremTemplateRefs.value).forEach((item: any) => {
    if (tremTemplateRefs.value[item]) {
      tremTemplateRefs.value[item].dataFlash();
    }
  });
  // updateBtn();
}

onMounted(() => {
  planData.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newv, oldv) => {
    planData.value = newv;
    // nextTick(()=>{
    //   showFlush();
    // })
  },
  { deep: true }
);
defineExpose({
  showFlush,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
</style>
