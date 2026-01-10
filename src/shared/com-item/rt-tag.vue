<template>
  <template v-if="selectedValue">
    <el-tag
      ref="tagRef"
      :size="item.size"
      :color="getColor"
      :effect="item.effect ? item.effect : 'dark'"
      :type="getType"
      :round="item.round ? item.round : false"
    >
      {{ getValueLabel }}
    </el-tag>
  </template>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const props = defineProps({
  modelValue: {
    type: [String],
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  row: {
    // 新增属性，用于接收当前行的数据
    type: Object as () => Record<string, any>,
    required: false,
  },
});

const selectedValue = ref<string>();
interface OptionTypeBySelect extends OptionType {
  color?: string;
  type?: "primary" | "success" | "warning" | "info" | "danger" | undefined;
}

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

watch([() => props.modelValue], ([newModelValue]) => {
  if(newModelValue){
    selectedValue.value = newModelValue;
  }else if(props.item.nullvalue){
    selectedValue.value = props.item.nullvalue;
  }else{
    selectedValue.value = newModelValue;
  }
  getOptions();
});

watch(
  () => props.item,
  (newValue, oldValue) => {
    if(!selectedValue.value){
      return ;
    }
  }
);

function getOptions(){
  if (props.item.loadData) {
      options.value = props.item.loadData;
    }
    if (props.item.typeCode) {
      codeListStore
        .queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: {value:selectedValue.value ,...props.item.codeParam},
          },
          false,
          props.item.cache ? props.item.cache : true
        )
        .then((res) => (options.value = res))
        .catch((err) => {
          console.error(err);
          options.value = [];
        });
    }
}

const getValueLabel = computed(() =>{
  const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.label;
  }
});

const getType = computed(() =>{
  const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.type ? option.type : "primary";
  }
});

const getColor = computed(() =>{
const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.color ? option.color : undefined;
  }
});

onMounted(() => {
  if(!selectedValue.value && props.item.nullvalue){
    selectedValue.value = props.item.nullvalue;
  }
  getOptions();
});
</script>
