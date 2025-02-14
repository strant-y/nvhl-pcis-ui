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
          <!-- <div>
            <a style="margin-right: 5px" @click="foldRiskInfo = !foldRiskInfo">
              <el-icon v-if="!foldRiskInfo"><ArrowUpBold /></el-icon>
              <el-icon v-if="foldRiskInfo"><ArrowDownBold /></el-icon>
            </a>
            <span> 责任限额信息 </span>
          </div>
           -->
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
                      v-if="j?.factorList[i]"
                      :rowspan="
                        j?.factorList[i]?.type === 'rowspan'
                          ? tempConfig?.factorConfig?.rowNum
                          : null
                      "
                    >
                      <!-- {{ j.factorList[i] }} -->
                      <template v-if="j?.factorList[i]?.type === 'text'">
                        <span>{{ j.factorList[i].factoritem.text }} </span>
                      </template>
                      <template v-else>
                        <from-item
                          v-if="!!j.factorList[i]"
                          v-model="props.formData[j.factorList[i].factorKey]"
                          :item="j.factorList[i].factoritem"
                        />
                      </template>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <!-- <template v-if="showDisclaimer">
          <div>
            <a
              style="margin-right: 5px"
              @click="foldDisclaimer = !foldDisclaimer"
            >
              <el-icon v-if="!foldDisclaimer"><ArrowUpBold /></el-icon>
              <el-icon v-if="foldDisclaimer"><ArrowDownBold /></el-icon>
            </a>
            <span> 免赔信息 </span>
          </div>
          <div v-if="foldDisclaimer">
            <table style="width: 100%">
              <thead>
                <tr class="table-title">
                  <th>责任</th>
                  <th>免赔方式</th>
                  <th>免赔类型</th>
                  <th>免赔额/免赔率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(i, index) in fromDisclaimerSchema" :key="index">
                  <td
                    width="150"
                    :rowspan="fromDisclaimerSchema.length"
                    v-if="index === 0"
                  >
                    <el-tag type="warning">{{ formData.rigeNme }}</el-tag>
                  </td>
                  <td :rowspan="fromDisclaimerSchema.length" v-if="index === 0">
                    <rtselect
                    v-model="disclaimer"
                      :item="{
                        loadData: [
                          { value: '1', label: '绝对' },
                          { value: '2', label: '部分' },
                        ],
                      }"
                    />
                  </td>
                  <td>{{ i.label }}</td>
                  <td><rtnumber :item="{ suffix: i.append }" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template> -->
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
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
const showDisclaimer = ref(true);
const foldDisclaimer = ref(true);

const fromRiskSchema = ref([
  {
    label: "累计紧急运输费用责任限额",
    isEx: "1",
    prop: "rigeNme",
    append: "元",
  },
  {
    label: "每次事故赔偿限额",
    isEx: "0",
    prop: "rigeNmf",
    append: "元",
  },
]);

const disclaimer = ref("1");
const fromDisclaimerSchema = ref([
  {
    label: "每次事故医疗基用免赔额",
    isEx: "1",
    prop: "rigeNme",
    append: "元",
  },
  {
    label: "每次事鼓医疗费用免赔率",
    isEx: "0",
    prop: "rigeNmf",
    append: "%",
  },
]);

onMounted(async () => {
  console.log(props.formData);
  const param = await fetch("/param/plancvrg.json");
  const str = await param.text();
  tempConfig.value = JSON.parse(str);
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
