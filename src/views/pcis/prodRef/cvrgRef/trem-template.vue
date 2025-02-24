<template>
  <div>
    <el-card class="cvrg-info">
      <template #header>
        <div class="cvrg-hearder">
          <el-row>
            <el-col :span="2">
              <a style="margin-right: 5px" @click="showData = !showData">
                <el-icon v-if="!showData"><ArrowUpBold /></el-icon>
                <el-icon v-if="showData"><ArrowDownBold /></el-icon>
              </a>
              <el-tag type="warning">{{
                formData.cvrgType === "1" ? "主险" : "附加险"
              }}</el-tag>
            </el-col>
            <el-col :span="20">
              <span>{{ formData.rigeNme }}</span>
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
        <template v-for="(ginfo, k) in groupInfo" :key="k">
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
          <el-row>
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
                <template
                  v-for="risk in props.formData.riskList"
                  :key="risk"
                >
                  <template
                    v-if="(colObj = getcolConfig(ginfo.cGroupId, risk['cvrg.cRiskNo']))"
                  >
                    <template v-if="colObj.maxNum > 0">
                      <tr v-for="n in colObj.maxNum" :key="n">
                        <template
                          v-for="colinfo in colObj.col"
                          :key="colinfo.cColId"
                        >
                          <template
                            v-if="
                              (factor = colObj.rowConfig[colinfo.cColId][n - 1])
                            "
                          >
                            <td
                              :rowspan="
                                factor?.cPorpType === 'rowspan'
                                  ? colObj.maxNum
                                  : null
                              "
                            >
                              <template v-if="factor.cPorpType === 'text'">
                                <span>{{ getText(factor) }} </span>
                              </template>
                              <template v-else>
                                <template v-if="(factorConf = getProp(factor))">
                                  <from-item 
                                  v-model="risk[factorConf.prop]"
                                  :item="getProp(factor)" />
                                </template>
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

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const groupInfo = ref({});
const colInfo = ref([]);
const factormap = ref({});
const collist = ref([]);

const showData = ref(true);
const showRiskInfo = ref(true);
const foldRiskInfo = ref(true);

function getColinfo(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

const getcolConfig = computed(() => {
  return (groupId: string, riskNo: string) => {
    const conf = {
      col: getcol(groupId),
      maxNum: maxNum(groupId, riskNo),
      rowConfig: getRowConfig(groupId, riskNo),
    };
    return conf;
  };
});
function getcol(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

function getRowConfig(groupId: string, riskNo: string) {
  const all = collist.value.filter(
    (v: any) => v.cGroupId === groupId && v.cRiskNo === riskNo
  );

  const colMap = all.reduce(
    (acc, item) => {
      const key = item["cColId"];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
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

const getProp = computed(() => {
  return (col: any) => {
    const factorId = col["cFactorId"];
    const fact = factormap.value[factorId];
    return fact;
  };
});

onMounted(async () => {
  let queryList: { [k: string]: any; }[] = [];
  props.formData.riskList.forEach((item: any) => {
    let p: { [k: string]: any } = {};
    Object.keys(item).forEach((key) => {
      const v = item[key];
      let newKey  = '';
      if(key.indexOf('.')){
        newKey = key.split('.')[1];
      }else{
        newKey = key;
      }
      p[newKey] = v;
    });
    queryList.push(p);
  });
  const param = {
    cTermNo: props.formData.cTermNo,
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
    } else {
      ElMessage.error(msg);
    }
  });
});
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
