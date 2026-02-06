<template>
  <el-cascader
    v-model="selectedValue"
    style="width: 100%"
    placeholder="机构"
    :options="options"
    filterable
    :clearable="clearable"
    :show-all-levels="false"
    :props="dpetData"
    @change="instChange"
    ref="refCascader"
    :collapse-tags="props.collapseTags"
  />
</template>

<script setup lang="ts">
import { listDepts, listChrDepts, deptLists } from "@/api/dept";
import { DeptQuery } from "@/api/dept/types";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  collapseTags: {
    type: Boolean,
    default: false,
  },
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const emits = defineEmits(["update:modelValue", "selectedItem"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | undefined>();

// 默认获取机构1级的数据
const options = computed(() =>
  codeListStore.getCacheCodeListByCode("QueryFormDeptType")
 
);

const listDeptsParams = reactive<DeptQuery>({});

const refCascader = ref<any>("");

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  selectedValue.value = newModelValue;
});

onMounted(async () => {

  console.log(
    "当前登录用户信息", 
    JSON.parse(sessionStorage.getItem("user")).companyId
  );

  if (
    props.modelValue &&
    JSON.parse(sessionStorage.getItem("user")).companyId != props.modelValue
  ) {
    getDownLists(props.modelValue);
  }
  selectedValue.value = props.modelValue;
});

async function getDownLists(dpt: string) {
  const { data, code } = await deptLists(dpt);
  if (code === 200) {
    const dpts = data.cDptRelCde;
    const d = dpts.split(";");
    let dmap = [];
    let dstr = "";
    for (let i = d.length - 1; i >= 0; i--) {
      const t = d[i];
      let l = await setDpt(t);
      l.forEach((e) => {
        if (e.value === dstr) e.children = dmap;
      });
      dmap = l;
      dstr = t;
    }
    options.value.forEach((e) => {
      if (e.value === JSON.parse(sessionStorage.getItem("user")).companyId)
        e.children = dmap;
    });
  }
}

async function setDpt(t) {
  const { data, code } = await listChrDepts({cDptCde: t});
  if (code == 200) {
    let newLsit = data.map((item) => ({
      value: item.cDptCde,
      label: item.cDptCde+item.cDptCnm,
      children: [], // 初始时，所有项都没有子项
    }));
    return newLsit;
  }
}

const dpetData = {
  checkStrictly: true,
  emitPath: false,
  lazy: true,
  multiple: props.multiple,
  lazyLoad: (node, resolve) => {
    let result = node.data;
    if (result) {
      if (node.level != 4) {
        listChrDepts({cDptCde: result.value}).then((res:any) => {
          if (res.code == 200) {
            let newLsit = res.data.map((item) => ({
              value: item.cDptCde,
              label: item.cDptCde+item.cDptCnm,
              children: [],
              leaf: item.leaf,
            }));
            resolve(newLsit);
          } else {
            ElMessage.error(res.msg);
          }
        });
      } else {
        resolve(null);
      }
    }
  },
};

//根据value获取item，用于录单页回显机构部门
function findItemInTree(tree, value) {
  // 遍历树的每一个节点
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    // 检查当前节点的值是否等于目标值
    if (item.value === value) {
      return {
        label: item.value+item.label,
        value: item.value,
      };
    }
    // 如果当前节点有子节点
    if (item.children && item.children.length > 0) {
      // 递归调用 findItemInTree 函数在子节点中查找
      const found = findItemInTree(item.children, value);
      if (found) {
        return {
          label: found.value+found.label,
          value: found.value,
        };
      }
    }
  }
  // 如果没有找到匹配的节点，返回 null
  return null;
}

function instChange(val) {
  console.log('dept', options.value)
  emits("update:modelValue", val);
  const currentItem = findItemInTree(options.value, val);
  console.log("currentItem", currentItem);
  emits("selectedItem", currentItem);
  if (!props.multiple) {
    refCascader.value.togglePopperVisible(false);
  }
}
</script>
