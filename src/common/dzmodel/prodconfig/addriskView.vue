<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div style="background-color: var(--cvrg-sub-header-bg-color);line-height: 32px;margin: 0px 0 3px 0;">
          <span style="font-size: 14px; margin-left: 12px">
            必须选择至少一项责任
          </span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn" style="margin: 0px 0 3px 0;">
          <div class="search-btn-item">
            <rtinput
                v-model="query.main"
                :item="{ placeholder: '请输入责任名称或编码' }"
            />
            <rtButton
                :item="{
                icon: 'Search',
                func: () => {
                  mainRef.filter(query.main);
                },
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="height: 250px; border: var(--rt-border); overflow-y: auto">
          <el-tree
            ref="mainRef"
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            show-checkbox
            :check-strictly="true"
            :filter-node-method="mainfilterNode"
            @check-change="selectmainMethod"
            :data="data1"
          />
        </div>
      </el-col>
      <el-col :span="24">
        <div style="float: right;">
          <rtButton
            :item="{
              icon: 'RefreshLeft',
              label: '取消',
              func: () => {
                emits('handleClose');
              },
            }"
          />
          <rtButton
            :item="{
              icon: 'Pointer',
              label: '确定',
              type: 'primary',
              func: () => {
                selectOne();
              },
            }"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { queryTermRiskRelList } from "@/api/prod";
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
const emits = defineEmits(["handleClose"]);
const isFree = ref(true);
const isCopy = ref(false);
const showMsg = ref("组件预览");
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});

const dataprops = {
  children: "children",
  label: "label",
  disabled: "disabled",
};

const query = ref({
  main: "",
});

const data1 = ref([]);
const mainRef = ref<InstanceType<typeof ElTree>>();
const expandedKeys = ref<string[]>([]);

const selectNodeId = ref("");

// 存储选中的节点ID
const selectedNodeIds = ref<Set<string>>(new Set());

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

onMounted(async () => {
  const param = { 
    pageNum:1,pageSize:999,
    ...props.data.data };
  queryTermRiskRelList(param)
      .then((res) => {
        data1.value = [];
        const { code, data, msg } = res;
        if (200 === code) {
          if(data.result && data.result.length > 0){
            data.result.forEach((item: any) => {
            data1.value.push({
              id: item.cRiskNo,
              label: item.cNmeCn,
            });
          });
          }
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
});

function selectmainMethod(data: any, checked: boolean, indeterminate: boolean) {
  selectNodeId.value = data.id;
  
  if (checked) {
    // 获取当前节点的父节点
    data1.value.forEach((sibling: any) => {
      if ( sibling.id !== selectNodeId.value ) {
        // 取消选中同级节点
        mainRef.value?.setChecked(sibling.key, false, false);
      }
    });
  }
}

const mainfilterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};

async function selectOne() {
  props.method.isOk(selectNodeId.value);
  // 传递选中的节点数据给父组件
  emits("handleClose");
}

function fail() {
  emits("handleClose");
}
</script>

<style lang="scss" scoped>
@import "src/styles/custom-index";

:deep(.search-btn) {
  background: var(--cvrg-sub-header-bg-color);
  .search-btn-item {
    height: 32px;
    display: flex;
    align-items: center;
    @extend .rt-input__btn;
    @extend .rt-custom-input;
  }
}
.custom-tree-node {
  display: flex;
  align-items: center;
  position: relative;
}

.tree-indent {
  width: 24px;
  height: 1px;
}

.tree-line {
  position: absolute;
  left: 0;
  top: 50%;
  width: 24px;
  height: 1px;
  border-top: 1px solid #ccc;
}

.tree-line-vertical {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  border-left: 1px solid #ccc;
}

.node-label {
  margin-left: 8px;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>