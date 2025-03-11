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
              <el-tag type="danger">{{
                term.cRdrTyp === "0" ? "主" : "附加"
              }}</el-tag>
              <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
            </el-col>
            <el-col :span="12"> </el-col>
            <el-col :span="2">
              <rtButton
                @click="
                  () => {
                    emit('delete', null);
                  }
                "
                :item="{
                  label: '删除',
                }"
              />
            </el-col>
          </el-row>
        </div>
      </template>

      <div v-if="showData">
        <template v-if="termTitleConf.cFactorTabType === 'grid'">
          <table style="width: 100%">
            <thead>
              <tr class="table-title">
                <th>{{ termTitleConf.cFactorTabTitle }}</th>
                <th>{{ termTitleConf.cFactorTabValue }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item, k) in termFactormap" :key="k">
                <tr>
                  <td>
                    <span>{{ item.title }}</span>
                  </td>
                  <td>
                    <from-item
                      v-model="termdata[item.prop]"
                      @update:modelValue="update()"
                      :item="item"
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
        <template v-else-if="termTitleConf.cFactorTabType === 'table'">
          <table style="width: 100%">
            <thead>
              <tr class="table-title">
                <template v-for="(item, k) in termFactormap" :key="k">
                  <th>
                    {{ item.title }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr>
                <template v-for="(item, k) in termFactormap" :key="k">
                  <td>
                    <from-item
                      v-model="termdata[item.prop]"
                      @update:modelValue="update()"
                      :item="item"
                    />
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <app-free-edit
            :freeEditConfig="formconfig1"
            ref="termRef"
            @updateDatas="update"
          />
        </template>
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
                      <tr
                        v-for="n in riskdata.maxNum"
                        :key="`${ginfo.cGroupId}-${k}-${n}`"
                      >
                        <template
                          v-for="colinfo in riskdata.col"
                          :key="`${ginfo.cGroupId}-${k}-${n}-${colinfo.cColId}`"
                        >
                          <template
                            v-if="
                              riskdata.rowConfig[colinfo.cColId] &&
                              riskdata.rowConfig[colinfo.cColId][n - 1]
                            "
                          >
                            <td
                              :rowspan="
                                riskdata.rowConfig[colinfo.cColId][n - 1]
                                  ?.cPorpType === 'rowspan'
                                  ? riskdata.maxNum
                                  : null
                              "
                            >
                              <template
                                v-if="
                                  riskdata.rowConfig[colinfo.cColId][n - 1]
                                    .cPorpType === 'text'
                                "
                              >
                                <span
                                  >{{
                                    riskdata.rowConfig[colinfo.cColId][n - 1]
                                      .factorItem.title
                                  }}
                                </span>
                              </template>
                              <template v-else>
                                <from-item
                                  v-model="
                                    riskList[
                                      riskdata.rowConfig[colinfo.cColId][n - 1]
                                        .cRiskNo
                                    ][
                                      riskdata.rowConfig[colinfo.cColId][n - 1]
                                        .factorItem?.prop
                                    ]
                                  "
                                  @update:modelValue="update()"
                                  :item="
                                    riskdata.rowConfig[colinfo.cColId][n - 1]
                                      .factorItem
                                  "
                                />
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
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { terConfig } from "@/store/modules/term-config";
import { init } from "echarts";
const terconfig = terConfig();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "delete"]);
const termRef = ref<AppFreeEditMethod | null>(null);
const groupconf = ref<{ [key: string]: any }>({}); // 渲染数据分离,解决因为数据变更,导致触发重新渲染

const termdata = ref({});
const riskList = ref<{ [key: string]: any }>({});

const pageInit = ref(false);

watch(
  () => props.modelValue,
  (newVal) => {
    dataInit();
    initData(props.modelValue);
  }
);
function update() {
  let newData;

  if (
    termTitleConf.value.cFactorTabType === "grid" ||
    termTitleConf.value.cFactorTabType === "table"
  ) {
    newData = termdata.value;
  } else {
    newData = termRef.value?.getFromValue();
  }
  const list = JSON.parse(JSON.stringify(riskList.value));
  let ril: any[] = [];
  Object.keys(riskList.value).forEach((k: any) => {
    ril.push(riskList.value[k]);
  });
  newData.riskList = ril;
  emit("update:modelValue", newData);
}
function initData(data: any) {
  const newData = JSON.parse(JSON.stringify(data));
  // 缓存条款数据
  const termData = JSON.parse(JSON.stringify(data));
  termData.riskList = null;
  termdata.value = termData;
  // 缓存条款责任数据
  let riskData: { [key: string]: any } = {};
  newData.riskList.forEach((v: any) => {
    let cRiskNo = v["TermRisktgt.cLiabCode"];
    riskData[cRiskNo] = {
      ...v,
    };
  });
  riskList.value = riskData;
  nextTick(() => {
    if (termTitleConf.value.cFactorTabType !== "grid") {
      termRef.value?.setFormValue(termdata.value);
    }
  });
}

const groupInfo = ref<{ [key: string]: any }>({});
const colInfo = ref([]);
const factormap = ref<{ [key: string]: any }>({});
const termFactormap = ref([]);
const collist = ref([]);
const term = ref<{ [key: string]: any }>({});
const termTitleConf = ref<{ [key: string]: any }>({});

const formconfig1 = reactive(
  createAppFreeEditConfig({
    fromUi: {
      cols: 2,
      showTitleBar: false,
    },
  })
);

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
  const risks = riskList.value || {}; // 初始化为一个空对象以防 undefined
  Object.keys(risks).forEach((riskNo) => {
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
    (acc, item: { [key: string]: any }) => {
      const key = item["cColId"];
      if (!acc[key]) {
        acc[key] = [];
      }
      let colconfig = Object.assign({}, item);
      colconfig["factorItem"] = getProp(item);
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
  dataInit();
  initData(props.modelValue);
});

function dataInit() {
  let queryList: { [k: string]: any }[] = [];
  let queryKey = props.modelValue["Term.cClauseCode"];
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
      if (newKey === "cLiabCode") {
        p["cRiskNo"] = v;
      } else {
        p[newKey] = v;
      }
      queryKey += v;
    });
    queryList.push(p);
  });
  const param = {
    cTermNo: props.modelValue["Term.cClauseCode"],
    riskList: queryList,
  };
  const d = terconfig.getConfig(queryKey);
  if (d) {
    collist.value = d.collist;
    factormap.value = d.factormap;
    colInfo.value = d.colInfo;
    groupInfo.value = d.groupInfo;
    term.value = d.term;
    termFactormap.value = d.termFactormap;
    formconfig1.fromSchema = d.termFactormap;
    if (d.termTitleConf?.CCnm) {
      termTitleConf.value = JSON.parse(d.termTitleConf.CCnm);
    }
    initshowConfig();
  } else {
    getTRFactorJson(param).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        collist.value = data.data.collist;
        factormap.value = data.data.factormap;
        colInfo.value = data.data.colInfo;
        groupInfo.value = data.data.groupInfo;
        term.value = data.data.term;
        termFactormap.value = data.data.termFactormap;
        formconfig1.fromSchema = data.data.termFactormap;
        if (data.data.termTitleConf?.CCnm) {
          termTitleConf.value = JSON.parse(data.data.termTitleConf.CCnm);
        }
        terconfig.addConfig(queryKey, data.data);
        initshowConfig();
      } else {
        ElMessage.error(msg);
      }
    });
  }
}

function initshowConfig() {
  let grouplist: { [k: string]: any } = {};
  if (groupInfo.value) {
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
  }
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
