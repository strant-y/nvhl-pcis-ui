<template>
  <template v-if="planData['m'] && planData['m'].length > 0">
    <tremTemplate
      v-for="(i, index) in planData['m']"
      :key="i['Term.cClauseCode']"
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
          if(res) tremTemplateRefs['m' + i['Term.cClauseCode']] = res;
        }
      "
    />
  </template>
  <template v-if="planData['a1'] && planData['a1'].length > 0">
    <el-form ref="cvrgFormfef" :model="planData['a1']" :inline-message="true">
      <tremTemplate
        v-for="(i, index) in planData['a1']"
        :key="i['Term.cClauseCode']"
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
						if(res) tremTemplateRefs['a1' + i['Term.cClauseCode']] = res;
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
  Object.keys(planData.value).forEach((itemKey) => {
    const list = planData.value[itemKey];
    if (!list) return;

    // 找到要删除的项
    const targetIndex = list.findIndex(item => item["Term.cClauseCode"] === t);
    if (targetIndex === -1) return;
    
    const targetItem = list[targetIndex];

    // 批改模式：标记或调用方法，不删除
    if (parparam.cEdrType && targetItem["Term.cRowId"]) {
      if (
        targetItem["Term.cRdrTyp"] !== "0" &&
        targetItem["Term.cClauseCategory"] !== "1"
      ) {
        targetItem["Term.cCancelMrk"] = "1";
      } else {
        const refKey = itemKey + targetItem["Term.cClauseCode"];
        tremTemplateRefs.value[refKey]?.setCancel();
      }
    } else {
      // 非批改模式：直接删除
      list.splice(targetIndex, 1);
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
