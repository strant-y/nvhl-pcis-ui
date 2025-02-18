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
        <template v-if="showRiskInfo">
          <div v-if="foldRiskInfo">
            <table style="width: 100%">
              <thead>
                <tr class="table-title">
                  <th
                    v-for="(i, index) in tempConfig?.factorConfig
                      ?.factorGroupId"
                    :key="index"
                    :width="i.width ? i.width : null"
                  >
                    {{ i.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(i, index) in Array.from(
                    { length: tempConfig?.factorConfig?.rowNum || 0 },
                    (_, i) => i
                  )"
                  :key="index"
                >
                  <template
                    v-for="(j, jndex) in tempConfig?.factorConfig
                      ?.factorGroupId"
                    :key="jndex"
                  >
                    <td
                      v-if="j?.factorlist[i]"
                      :rowspan="
                        j?.factorlist[i]?.type === 'rowspan'
                          ? tempConfig?.factorConfig?.rowNum
                          : null
                      "
                    >
                      <template v-if="j?.factorlist[i]?.type === 'text'">
                        <span>{{ j.factorlist[i].factoritem.text }} </span>
                      </template>
                      <template v-else>
                        <from-item
                          v-if="!!j.factorlist[i]"
                          v-model="props.formData[j.factorlist[i].factorKey]"
                          :item="j.factorlist[i].factoritem"
                        />
                      </template>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
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

const tempConfig = ref({});
const showData = ref(true);
const showRiskInfo = ref(true);
const foldRiskInfo = ref(true);

onMounted(async () => {
  const param = {
    riskNo: props.formData.riskNo,
    termNo: props.formData.termNo,
  };
  getTRFactorJson(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      console.log(data.data);
      tempConfig.value = data.data;
    } else {
      ElMessage.error(msg);
    }
  });
  // tempConfig.value = JSON.parse(str);
  console.log(tempConfig);
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
