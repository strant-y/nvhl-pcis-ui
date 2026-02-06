<template>
  <div class="search-select">
    <el-select
      v-model="selectValue"
      :multiple="multiple"
      :placeholder="placeholder"
      :remote-method="remoteMethod"
      :loading="loading"
      @change="change"
      reserve-keyword
      filterable
      remote
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
      <template #loading>
        <el-icon class="is-loading">
          <svg class="circular" viewBox="0 0 20 20" v-if="'four-dot' === loadingIcon">
            <g
              class="path2 loading-path"
              stroke-width="0"
              style="animation: none; stroke: none"
            >
              <circle r="3.375" class="dot1" rx="0" ry="0" />
              <circle r="3.375" class="dot2" rx="0" ry="0" />
              <circle r="3.375" class="dot4" rx="0" ry="0" />
              <circle r="3.375" class="dot3" rx="0" ry="0" />
            </g>
          </svg>
          <svg class="circular" viewBox="0 0 50 50" v-if="'circle' === loadingIcon">
            <circle class="path" cx="25" cy="25" r="20" fill="none" />
          </svg>
        </el-icon>
      </template>
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {codeListViewStore} from "@/store";

const props = defineProps({
  modelValue: {
    type: [String],
    default: undefined,
  },
  // 下拉列表数据
  optionList: {
    type: Array,
    default: undefined,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  // circle | four-dot
  loadingIcon: {
    type: String,
    default: 'circle',
  },
  // codelist编码
  typeCode: {
    type: String,
    default: undefined,
  }
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const list = computed(()=> {
  if(!!props.typeCode){
    return codeListStore.getCacheCodeListByCode(props.typeCode); // codelist缓存
  }else if(!!props.optionList){
    return props.optionList; // 父组件传入的
  }else{
    return [];
  }
});
const options = ref<OptionType[]>([]);
const selectValue = ref<string[] | string | number>([]);
const loading = ref(false)

const emits = defineEmits(["update:modelValue","confirm"]);
const codeResult = useVModel(props, "modelValue", emits);

const change = (value)=> {
  emits('confirm',value);
  codeResult.value = value;
};

onMounted(()=>{
  init(props.modelValue);
});
watch(()=>props.modelValue,(newVal)=>{
  init(newVal);
});

// 数据回填处理
const init = (val)=>{
  if(!!val){
    selectValue.value = val;
    options.value = [list.value.find(item=>item.value === val)];
  }
};

// 筛选符合的数据
const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = list.value.filter((item) => {
        return item.label.includes(query)
      });
    }, 500)
  } else {
    options.value = []
  }
};

</script>

<style>
.search-select{
  width: 100%;
}

.el-select-dropdown__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 20px;
}

.circular {
  display: inline;
  height: 30px;
  width: 30px;
  animation: loading-rotate 2s linear infinite;
}
.path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-color-primary);
  stroke-linecap: round;
}
.loading-path .dot1 {
  transform: translate(3.75px, 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
}
.loading-path .dot2 {
  transform: translate(calc(100% - 3.75px), 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.4s;
}
.loading-path .dot3 {
  transform: translate(3.75px, calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 1.2s;
}
.loading-path .dot4 {
  transform: translate(calc(100% - 3.75px), calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.8s;
}
@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
@keyframes custom-spin-move {
  to {
    opacity: 1;
  }
}
</style>
