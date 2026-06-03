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
.tree {
  height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
}

/* 让 tree-wrapper 宽度跟随父容器 */
.tree-wrapper {
  width: 100%;
  min-width: 0; /* 防止内容撑破容器 */
}

:deep(.select-tree) {
  width: 100%;
  min-width: 100%; /* 至少占满容器宽度 */
  .el-tree-node {
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
    return formatDataWithIdLabel(codeListStore.getCacheCodeListByCode('TreeFormDeptType'));
  }else{
    return formatDataWithIdLabel(queryList.value);
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

async function queryDpt(param: any){
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


/**
 * 通用数据格式化函数：将数据中的 label 修改为 id_label 格式
 * 兼容：单层数组结构 和 多层树形结构
 * @param {Array|Object} data - 原始数据 (可能是数组，也可能是树对象)
 * @returns {Array|Object} 处理后的数据
 */
 function formatDataWithIdLabel(data: any[] | undefined) {
    // 1. 处理数组情况 (即接口直接返回列表，或递归遍历子节点列表)
    if (Array.isArray(data)) {
        return data.map(item => {
            // 对每一项进行处理
            const newItem = { ...item };
            
            // 核心修改：拼接 label
            newItem.label = `${newItem.value}_${newItem.label}`;
            
            // 关键判断：只有当 children 存在且是数组时才递归
            // 这样即使 children 是 [] (空数组)，也不会报错，直接跳过
            if (Array.isArray(newItem.children)) {
                newItem.children = formatDataWithIdLabel(newItem.children);
            }
            
            return newItem;
        });
    } 
    
    // 2. 处理单个对象情况 (即树的根节点对象)
    else if (data && typeof data === 'object') {
        const node = { ...data };
        node.label = `${node.value}_${node.label}`;
        
        // 同样的逻辑：检查 children 是否为数组
        if (Array.isArray(node.children)) {
            node.children = formatDataWithIdLabel(node.children);
        }
        
        return node;
    }
    
    // 3. 其他情况直接返回
    return data;
}

</script>
<style scoped>
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
