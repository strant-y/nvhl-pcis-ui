<template>
  <div>
    <el-card class="cvrg-info">
      <template #header>
        <div class="cvrg-hearder">
          <el-row>
            <el-col :span="10">
              <a style="margin-right: 5px" @click="showData = !showData">
                <el-icon v-if="!showData"><ArrowUpBold /></el-icon>
                <el-icon v-if="showData"><ArrowDownBold /></el-icon>
              </a>
              <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
            </el-col>
            <el-col :span="12">
              <!-- <span>{{ formData.rigeNme }}</span> -->
            </el-col>
            <el-col :span="2">
              <rtButton
                @click="() => {}"
                :item="{
                  label: '删除',
                }"
              />
            </el-col>
          </el-row>
        </div>
      </template>

      <div v-if="showData">
        <template v-for="(ginfo, gk) in groupInfo" :key="gk">
          <el-row>
            <el-col :span="22">
              <a
                style="margin-right: 5px"
                @click="ginfo.hidden = !ginfo.hidden"
              >
                <el-icon v-if="!ginfo.hidden"><ArrowUpBold /></el-icon>
                <el-icon v-if="ginfo.hidden"><ArrowDownBold /></el-icon>
              </a>
              <span>
                {{ ginfo.cGroupTitle }}
              </span>
            </el-col>
          </el-row>
          <el-row v-if="!ginfo.hidden">
            <table style="width: 100%">
              <thead>
                <tr class="table-title">
                  <th
                    v-for="col in getColinfo(ginfo.cGroupId)"
                    :key="col.cColId"
                    :width="col.width ? col.width : null"
                  >
                    {{ col.cColTitle }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="groupconf[ginfo.cGroupId]">
                  <template
                    v-for="(riskdata, k) in groupconf[ginfo.cGroupId].riskList"
                    :key="k"
                  >
                    <template v-if="riskdata.maxNum > 0">
                      <tr v-for="n in riskdata.maxNum" :key="`${ginfo.cGroupId}-${k}-${n}`">
                        <template
                          v-for="colinfo in riskdata.col"
                          :key="`${ginfo.cGroupId}-${k}-${n}-${colinfo.cColId}`"
                        >
                          <template v-if="riskdata.rowConfig[colinfo.cColId] && riskdata.rowConfig[colinfo.cColId][n - 1]">
                            <td
                              :rowspan="
                              riskdata.rowConfig[colinfo.cColId][n - 1]?.cPorpType === 'rowspan'
                                  ? riskdata.maxNum
                                  : null
                              "
                            >
                              <template v-if="riskdata.rowConfig[colinfo.cColId][n - 1].cPorpType === 'text'">
                                <span>{{ riskdata.rowConfig[colinfo.cColId][n - 1].factorItem.title }} </span>
                              </template>
                              <template v-else>
                                <from-item 
                                        v-model="formdata.riskList[riskdata.rowConfig[colinfo.cColId][n - 1].cRiskNo][riskdata.rowConfig[colinfo.cColId][n - 1].factorItem?.prop]"
                                        @update:modelValue="update()"
                                        :item="riskdata.rowConfig[colinfo.cColId][n - 1].factorItem" />
                              </template>
                            </td>
                          </template>
                        </template>
                      </tr>
                    </template>
                  </template>
                </template>
              </tbody>
            </table>
          </el-row>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getTRFactorJson } from "@/api/prod";
import { init } from "echarts";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const groupconf = ref<{ [key: string]: any }>({}); // 渲染数据分离,解决因为数据变更,导致触发重新渲染

const formdata = ref({});
formdata.value = initData(props.modelValue);

function update(){
  const list = JSON.parse(JSON.stringify(formdata.value));
  let ril: any[] = [];
  Object.keys(list.riskList).forEach((k: any) => {
    ril.push(list.riskList[k])
  });
  list.riskList = ril;
  emit('update:modelValue', list);
}
function initData(data: any) {
  const newData = JSON.parse(JSON.stringify(data));
  let riskData : { [key: string]: any } = {};
  newData.riskList.forEach((v: any) => {
    let cRiskNo = v["cvrg.cRiskNo"];
    riskData[cRiskNo] = {
      ...v,
    };
  });
  newData.riskList = riskData;
  return newData;
}

const groupInfo = ref<{ [key: string]: any }>({});
const colInfo = ref([]);
const factormap = ref<{ [key: string]: any }>({});
const collist = ref([]);
const term = ref<{ [key: string]: any }>({});

const showData = ref(true);
const showRiskInfo = ref(true);
const foldRiskInfo = ref(true);

function getColinfo(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

function getcolConfig(groupId: string, riskNo: string) {
  const conf = {
    col: getcol(groupId),
    maxNum: maxNum(groupId, riskNo),
    rowConfig: getRowConfig(groupId, riskNo),
  };
  return conf;
}

function getRisk(groupId: string) {
  let risklist: { [key: string]: any } = {};
  // 确保 riskList 是 formdata.value 的一个属性
  const riskList = formdata.value.riskList || {}; // 初始化为一个空对象以防 undefined
  Object.keys(riskList).forEach((riskNo) => {
    risklist[riskNo] = {
      ...getcolConfig(groupId, riskNo),
    };
  });
  return risklist;
}
function getcol(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

function getRowConfig(groupId: string, riskNo: string) {
  const all = collist.value.filter(
    (v: any) => v.cGroupId === groupId && v.cRiskNo === riskNo
  );

  const colMap = all.reduce(
    (acc, item :{ [key: string]: any }) => {
      const key = item["cColId"];
      if (!acc[key]) {
        acc[key] = [];
      }
      let colconfig = Object.assign({}, item);
      colconfig['factorItem'] = getProp(item);
      acc[key].push(colconfig);
      return acc;
    },
    {} as { [key: string]: any[] }
  );
  return colMap;
}

function maxNum(groupId: string, riskNo: string) {
  let sumKey: { [key: string]: number } = {};
  collist.value.forEach((v) => {
    if (v["cGroupId"] === groupId && v["cRiskNo"] === riskNo) {
      const colId = v["cColId"];
      if (sumKey[colId]) {
        sumKey[colId] += 1;
      } else {
        sumKey[colId] = 1;
      }
    }
  });
  let max = Math.max(...Object.values(sumKey));
  return max;
}

const getText = computed(() => {
  return (col: any) => {
    const factorId = col["cFactorId"];
    const fact = factormap.value[factorId];
    return fact.title;
  };
});

function getProp(col: any) {
  const factorId = col["cFactorId"];
  const fact = factormap.value[factorId];
  return fact;
}

onMounted(async () => {
  let queryList: { [k: string]: any }[] = [];
  props.modelValue.riskList.forEach((item: any) => {
    let p: { [k: string]: any } = {};
    Object.keys(item).forEach((key) => {
      const v = item[key];
      let newKey = "";
      if (key.indexOf(".")) {
        newKey = key.split(".")[1];
      } else {
        newKey = key;
      }
      p[newKey] = v;
    });
    queryList.push(p);
  });
  const param = {
    cTermNo: props.modelValue.cTermNo,
    riskList: queryList,
  };
  getTRFactorJson(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      console.log(data.data);
      collist.value = data.data.collist;
      factormap.value = data.data.factormap;
      colInfo.value = data.data.colInfo;
      groupInfo.value = data.data.groupInfo;
      term.value = data.data.term;
    } else {
      ElMessage.error(msg);
    }
    initshowConfig();
  });
});

function initshowConfig() {
  let grouplist: { [k: string]: any } = {};
  Object.keys(groupInfo.value).forEach((g: any) => {
    const gt = groupInfo.value[g];
    let ngdata = {
      cGroupId: gt.cGroupId,
      cGroupName: gt.cGroupName,
      cGroupType: gt.cGroupType,
      riskList: getRisk(gt.cGroupId),
    };
    grouplist[g] = ngdata;
  });
  console.log(grouplist);
  groupconf.value = grouplist;
}
</script>
<style lang="scss" scoped>
.cvrg-info {
  :deep(.el-card__header) {
    background-color: #eff3f5;
    padding: 5px 10px;
  }
  :deep(.el-card__body) {
    padding: 5px 10px;
  }
}
.table-title {
  background-color: #f5f5f5;
}
table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%;
}

table,
th,
td {
  border: 1px solid #f5f5f5; /* 设置边框样式 */
  padding: 2px;
  text-align: left;
}
</style>
