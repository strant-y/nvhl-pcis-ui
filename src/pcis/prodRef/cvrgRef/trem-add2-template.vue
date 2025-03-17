<template>
  <div>
    <table style="width: 100%">
      <thead>
        <tr class="table-title">
          <th>序号</th>
          <th>附加条款名称</th>
          <th>费率(主险费率的百分比)</th>
          <th>保费</th>
          <th>备注</th>
          <th style="width: 100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, k) in props.planData" :key="k">
          <td>
            {{ k + 1 }}
          </td>
          <td>
            <from-item
              v-model="item['Term.cClauseCode']"
              :item="{
                inputtype: 'rttag',
                typeCode: 'TermCodeTag',
              }"
            />
          </td>
          <td>
            <from-item
              v-model="item['Term.nMainRate']"
              :item="{
                inputtype: 'rtnumber',
                suffix: '‰',
              }"
            />
          </td>
          <td>
            <from-item
              v-model="item['Term.nInsuranceFee']"
              :item="{
                inputtype: 'rtnumber',
                suffix: '元',
              }"
            />
          </td>
          <td>
            <from-item
              v-model="item['Term.cRemarkInfo']"
              :item="{
                inputtype: 'rtinput',
              }"
            />
          </td>
          <td>
            <rtButton
              @click="
                () => {
                  emit('delete', item);
                }
              "
              :item="{
                label: '删除',
              }"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
const emit = defineEmits(["update:modelValue", "delete"]);
const opertaor = dataOpertaor();

const terconfig = terConfig();

const props = defineProps({
  planData: {
    type: Object,
    required: true,
  },
});
onMounted(() => {
});

defineExpose({});

defineOptions({
  name: "tremAddTemplate2",
  inheritAttrs: false
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
</style>
