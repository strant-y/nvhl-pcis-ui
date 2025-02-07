<template>
    <el-select v-model="props.modelValue" :disabled="true">
      <el-option
        v-for="(item, index) in cAffiliatedUnitList"
        :key="index"
        :value="item.value"
        :label="item.label"
      />
    </el-select>
</template>

<script setup lang="ts">
import { selectExpertAffiliatedUnitList } from "@/api/partner";

const cAffiliatedUnitList = ref([]); // 所属单位下拉数据源
const selectedValue = ref<string>();

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  }
});


/** 查询 所属单位下拉框*/
function selectAffiliatedUnit() {
  selectExpertAffiliatedUnitList({}).then(({ data }) => {
    cAffiliatedUnitList.value = data.data;
  });
}

onMounted(() => {
  selectAffiliatedUnit()
});

</script>
