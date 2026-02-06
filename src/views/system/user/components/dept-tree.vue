<!-- 部门树 -->
<template>
  <el-card shadow="never" >
    <template #header>
      <div>
        <span>机构信息</span>
      </div>
    </template>
    <el-input
      v-model="searchParam"
      style="width: 100%"
      placeholder="机构名称、代码"
      prefix-icon="Search"
      clearable
      @clear="isQuery = false"
      @keyup.enter="queryDpt"
      @blur="queryDpt"
    />
    <div class="tree" v-loading="loading">
			<div class="tree-wrapper">
				<el-tree
					ref="deptTreeRef"
					class="mt-2 select-tree"
					:data="deptList"
					:props="{ children: 'children', label: 'label', disabled: '' }"
					:expand-on-click-node="false"
					:filter-node-method="handleFilter"
					:render-after-expand="true"
					:default-expand-all="false"
					highlight-current
					@node-click="handleNodeClick"
				/>
			</div>
    </div>
  </el-card>
</template>
<style lang="scss" scoped>
.tree{
  height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
}

/* 关键：让 tree-wrapper 宽度由内容撑开 */
.tree-wrapper {
  display: inline-block;
  min-width: 100%; /* 至少占满容器 */
}
:deep(.select-tree){
  margin-right: 30px;
  .el-tree-node{
    width: 100%;
  }
}
</style>
<script setup lang="ts">
import { getDeptOptions } from "@/api/dept";
import {codeListViewStore} from "@/store";
import {onBeforeMount} from "vue";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  modelValue: {
    type: [String],
    default: undefined,
  },
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const loading = ref(false);
const queryList = ref<OptionType[]>(); // 部门列表
const deptTreeRef = ref(ElTree); // 部门树
const searchParam = ref(); // 机构树查询参数
const deptName = ref(); // 部门名称
const isQuery = ref<boolean>(false);

const emits = defineEmits(["update:modelValue","confirm"]);

const companyId = useVModel(props, "modelValue", emits);

const deptList = computed(()=> {
  if(!isQuery.value) {
    return codeListStore.getCacheCodeListByCode('TreeFormDeptType');
  }else{
    return queryList.value;
  }
});

watchEffect(
  () => {
    deptTreeRef.value.filter(deptName.value);
  },
  {
    flush: "post", // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/** 部门筛选 */
function handleFilter(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
}

/** 部门树节点 Click */
function handleNodeClick(data: { [key: string]: any }) {
  companyId.value = data.value;
  emits('confirm', data)
}

async function queryDpt(param){
  if(!searchParam.value) {
    isQuery.value = false;
    return;
  }
  loading.value = true;
  isQuery.value = true;
  const response = await getDeptOptions(searchParam.value);
  queryList.value = response.data;
  loading.value = false;
}

</script>
<style scoped>
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
