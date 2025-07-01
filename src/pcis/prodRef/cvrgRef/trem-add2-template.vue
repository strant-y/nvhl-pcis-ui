<template>
  <el-form ref="templateRef" :model="props.planData" :inline-message="true">
    <table style="width: 100%">
      <thead>
        <tr class="table-title">
          <th style="width: 80px">序号</th>
          <th v-for="(item, k) in formcof"
            :key="k" 
            :style="{ width: item.width ? item.width + 'px' : null }"
          >
            <el-text
              v-if="isrequired(item)"
              class="mx-1"
              style="margin-right: 2px"
              type="danger"
              >*</el-text
            >
            {{
              item.title +
              (k === "nMainRate" || k === "nDeductibleRate" ? item.suffix : "")
            }}
          </th>
          <th v-if="checkShowBtn" style="width: 100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, k) in props.planData" :key="k">
          <td>
            {{ k + 1 }}
          </td>
          <td v-for="(it, kk) in formcof" :key="kk">
            <el-form-item
              :prop="[k, item.prop]"
              :rules="isrequired(item) ? getRequired() : undefined"
            >
              <from-item v-model="item['Term.' + kk]" :item="it" />
            </el-form-item>
          </td>
          <td v-if="checkShowBtn" >
            <rtButton
              v-if="!btnConf.delete.hidden"
              @click="
                () => {
                  emit('delete', item);
                }
              "
              :item="btnConf.delete"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </el-form>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { useValidator } from "@/typings/useValidator";

const emit = defineEmits(["update:modelValue", "delete"]);
const opertaor = dataOpertaor();
const param = opertaor.getParam();
const terconfig = terConfig();
const { getRules } = useValidator();

const props = defineProps({
  planData: {
    type: Object,
    required: true,
  },
  disabledFlag: {
    type: Boolean,
    default: false,
  },
});

function getRequired() {
  return getRules("required", {});
}

const notList = ["040019", "047002", "049025", "043002", "040005", "040006"];
onMounted(() => {
  if (param.cProdNo.startsWith("04")) {
    if (!notList.includes(param.cProdNo)) {
      formcof.value.nMainRate.suffix = "%";
      formcof.value.nMainRate.required = true;
    }
  }
  if (param.cProdNo === "059002" || param.cProdNo === "059003") {
    formcof.value.nMainRate.suffix = "%";
  }
});

const btnConf = ref<{ [key: string]: { [key: string]: any } }>({
  delete: {
    label: "删除",
  },
});

const formcof = ref<{ [key: string]: { [key: string]: any } }>({
  cClauseCode: {
    inputtype: "rttag",
    typeCode: "TermCodeTag",
    title: "附加条款名称",
    width: 300,
  },
  nMainRate: {
    inputtype: "rtnumber",
    suffix: "‰",
    title: "费率",
  },
  nInsuranceFee: {
    inputtype: "rtnumber",
    suffix: "元",
    title: "保费",
  },
  cRemarkInfo: {
    inputtype: "rtinput",
    title: "备注",
  },
});

if (param.cProdNo.startsWith("02")) {
  formcof.value = {
    cClauseCode: {
      inputtype: "rttag",
      typeCode: "TermCodeTag",
      title: "附加条款名称",
      width: 200,
    },
    nInsuranceAmount: {
      inputtype: "rtnumber",
      title: "赔偿限额/保额",
      width: 120,
    },
    nMainRate: {
      inputtype: "rtnumber",
      suffix: "‰",
      title: "费率",
    },
    nInsuranceFee: {
      inputtype: "rtnumber",
      suffix: "元",
      title: "保费",
    },
    nDeductibleAmount: {
      inputtype: "rtnumber",
      title: "免赔额",
    },
    nDeductibleRate: {
      inputtype: "rtnumber",
      title: "免赔率",
      suffix: "%",
    },
    cDeductibleNote: {
      inputtype: "rtinput",
      title: "免赔说明",
    },
    cRemarkInfo: {
      inputtype: "rtinput",
      title: "备注",
    },
  };
}

function setDisabledAll() {
  Object.keys(formcof.value).forEach((k: any) => {
    formcof.value[k].disabled = true;
  });
  Object.keys(btnConf.value).forEach((k: any) => {
    btnConf.value[k].hidden = true;
  });
}
function isrequired(i: any) {
  if (
    i.required === "1" || i.required === 1 || i.required === true || i.cPropRequired === "1" ||
    i.cPropRequired === 1 || i.cPropRequired === true
  ) {
    return true;
  }
  return false;
}
function isdisabled(i: any) {
  if (
    i.disabled === "1" || i.disabled === 1 || i.disabled === true || i.cPropDisabled === "1" ||
    i.cPropDisabled === 1 || i.cPropDisabled === true
  ) {
    return true;
  }
  return false;
}

function dataInit() {}

function setCancel() {
  props.planData["Term.cCancelMrk"] = "1";
}
const checkShowBtn = computed(()=>{ 
  let r = true;
  Object.keys(btnConf.value).forEach((k: any) => {
    r = r && !btnConf.value[k].hidden;
  });
  return r;
}) ;

function changeBtn() { 
  Object.keys(formcof.value).forEach((k: any) => {
    formcof.value[k].disabled = props.disabledFlag;
  });
  Object.keys(btnConf.value).forEach((k: any) => {
    btnConf.value[k].hidden = props.disabledFlag;
  });
}

watch(() => props.disabledFlag, (val) => { 
  changeBtn();
});

onMounted(() => { 
  changeBtn();
});

defineExpose({
  dataInit,
  setDisabledAll,
  setCancel,
});

defineOptions({
  name: "tremAddTemplate2",
  inheritAttrs: false,
});
</script>
<style lang="scss" scoped>
table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%;
}
.show_title {
  margin-bottom: 0px;
}
table,
th,
td {
  border: 1px solid #f5f5f5; /* 设置边框样式 */
  padding: 2px;
  text-align: left;
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
</style>
