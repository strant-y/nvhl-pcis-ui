<template>
  <div class="searchbar">
    <div class="table_overflow_x">
      <el-form ref="tableFormRef" :model="tableDatas" :inline-message="true">
        <table style="width: 100%">
          <thead>
            <tr class="table-title">
              <th>层级名称</th>
              <th>限额类别</th>
              <th>限额值</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(i, index) in tableDatas" :key="index">
              <tr v-if="index !== tableDatas.length - 1">
                <td>
                  <el-form-item
                    :rules="
                      getItemByProp('TermRisktgt.cExcessLayer').rules
                        ? getItemByProp('TermRisktgt.cExcessLayer').rules
                        : undefined
                    "
                    :prop="[index, 'TermRisktgt.cExcessLayer']"
                  >
                    <from-item
                      v-model="i['TermRisktgt.cExcessLayer']"
                      :item="getItemByProp('TermRisktgt.cExcessLayer')"
                    />
                  </el-form-item>
                </td>
                <td>
                  <el-text
                    v-if="isrequired('TermRisktgt.nInsuranceAmount')"
                    class="mx-1"
                    style="margin-right: 2px"
                    type="danger"
                    >*</el-text
                  >
                  {{ getItemByProp("TermRisktgt.nInsuranceAmount")["title"] }}
                </td>
                <td>
                  <el-form-item
                    :rules="
                      getItemByProp('TermRisktgt.nInsuranceAmount').rules
                        ? getItemByProp('TermRisktgt.nInsuranceAmount').rules
                        : undefined
                    "
                    :prop="[index, 'TermRisktgt.nInsuranceAmount']"
                  >
                    <from-item
                      v-model="i['TermRisktgt.nInsuranceAmount']"
                      :item="getItemByProp('TermRisktgt.nInsuranceAmount')"
                    />
                  </el-form-item>
                </td>
              </tr>
              <template v-if="index === tableDatas.length - 1">
                <tr v-for="(item, idx) in getItems()">
                  <td :rowspan="getrowspan()" v-if="idx === 0">
                    <from-item
                      v-model="tableDatas[index]['TermRisktgt.cExcessLayer']"
                      :item="getItemByProp('TermRisktgt.cExcessLayer')"
                    />
                  </td>
                  <td>
                    <el-text
                      v-if="isrequired(item.prop)"
                      class="mx-1"
                      style="margin-right: 2px"
                      type="danger"
                      >*</el-text
                    >
                    {{ item.title }}
                  </td>
                  <td>
                    <el-form-item
                      :rules="item.rules ? item.rules : undefined"
                      :prop="[index, item.prop]"
                    >
                      <from-item v-model="i[item.prop]" :item="item" />
                    </el-form-item>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  gridEditConfig: {
    type: Object as () => AppGridEditConfig,
    required: true,
  },
  termCode: {
    type: String,
  },
});
import { v4 as uuidv4 } from "uuid";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { ElTable } from "element-plus";
const tableFormRef = ref<InstanceType<typeof ElTable>>();
const tableRef = ref();
import {
  idxParamKey,
  IdxParamProps,
  useIdxParam,
} from "@/views/pcis/support/useIdxParam";
import { queryTermRiskRelList } from "@/api/prod";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const parparam = opertaor.getParam();

const tableDatas = ref([]);
const exDatas = ref({});
const excessLayer = ref([]);

function setexcessLayer(layer: any) {
  excessLayer.value = layer;
}

// 定义要触发的事件
const emits = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
  (e: "updateDatas", rows: any[]): void;
}>();

const riskNo = ref("");

onMounted(() => {
  const r = props.gridEditConfig.fromSchema.find(
    (item: any) => item.prop === "TermRisktgt.cExcessLayer",
  );
  excessLayer.value = r["loadData"];

  console.log(props.termCode);
  const param = {
    pageNum: 1,
    pageSize: 999,
    cTermNo: props.termCode,
  };
  queryTermRiskRelList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if(data.result && data.result.length > 0){
          riskNo.value = data.result[0].cRiskNo;
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
});

watch(
  [() => tableDatas.value],
  ([newFormData]) => {
    if (!notFlush.value) {
      // 增加不允许刷新机制,如果从上层下来的数据,不进行数据刷新
      emits("updateDatas", newFormData);
    }
  },
  {
    deep: true,
  },
);
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
function getTableValue() {
  return tableDatas.value;
}
function getItems() {
  const r = props.gridEditConfig.fromSchema.filter(
    (item: any) => item.prop !== "TermRisktgt.cExcessLayer",
  );
  return r;
}
const getItemByProp = (prop: string) => {
  const r = props.gridEditConfig.fromSchema.find(
    (item: any) => item.prop === prop,
  );
  return r;
};

const getrowspan = () => {
  const s = props.gridEditConfig.fromSchema.length - 1;
  return s;
};

function isrequired(prop: string) {
  let b = false;
  const r = props.gridEditConfig.fromSchema.find(
    (item: any) => item.prop === prop,
  );
  if (r.rules && r.rules.length > 0) {
    r.rules.forEach((item: any) => {
      if (item.required) {
        b = true;
      }
    });
  }
  return b;
}
function setRiskData(data: any,exdata: any, olddata: any) {
  let newList = [];
  Object.keys(excessLayer.value).every((key: any) => {
    const rowId = getuuid();
    let newData = {
      _dataId: rowId,
      "TermRisktgt.cExcessLayer": excessLayer.value[key]["value"],
      "TermRisktgt.cLiabCode":riskNo.value
    }
    if(olddata && olddata.length > 0){
      const od = olddata.find((item: any) => item['TermRisktgt.cExcessLayer'] === excessLayer.value[key]["value"]);
      if(od){
        newData['TermRisktgt.nInsuranceAmount'] = od['TermRisktgt.nInsuranceAmount'];

        if(od['TermRisktgt.cPkId']){  // 回填PkId
          newData['TermRisktgt.cPkId'] = od['TermRisktgt.cPkId'];
        }
        if(od['TermRisktgt.cRowId']){ // 回填RowId
          newData['TermRisktgt.cRowId'] = od['TermRisktgt.cRowId'];
        }
      }
    }
    let r = true;
    if (excessLayer.value[key].value === data) {
      newData = {
        ...newData,
        ...exdata,
      };
      r = false;
    }
    newList.push(newData);
    return r;
  });
  tableDatas.value = [...newList];
}

const notFlush = ref(false);
function setFormValue(data: any) {
  notFlush.value = true;
  let newData = [];
  if(data && data.length > 0){
    data.forEach((item: any) => { 
      const rowId = getuuid();
      item['_dataId'] = rowId;
      newData.push(item);
    });
  }
  tableDatas.value = newData;
  nextTick(() => {
    notFlush.value = false;
  });
}
function setValueByRowKey() {}
function delRow() {}
function setFormSchema() {}

defineExpose({
  getTableValue,
  setRiskData,
  setFormValue,
  setValueByRowKey,
  delRow,
  setFormSchema,
  setexcessLayer,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
.table_overflow_x {
  width: 100%;
  overflow-x: auto;
}
.table-title {
  th {
    text-align: center;
    background: var(--cvrg-group-header-bg-color);
    white-space: wrap;
    max-width: 150px;
    min-width: 80px;
    font-size: var(--rt-form-content-font-size);
    font-weight: 450;
    color: var(--el-text-color);
  }
}
table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%;
}
table,
th,
td {
  border: 1px solid var(--el-border-color-lighter); /* 设置边框样式 */
  padding: 2px;
  text-align: left;
  font-size: var(--rt-form-content-font-size);
  font-weight: var(--rt-form-content-font-weight);
  color: var(--el-text-color);
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
.table tr:hover {
  background-color: var(--el-color-primary);
  cursor: pointer;
}
</style>
