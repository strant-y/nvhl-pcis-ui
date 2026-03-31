<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="75%" :title="`选择${labelNm}`">
    <el-row gutter="10">
      <el-col :span="12" class="col-md-12">
        <el-card :bordered="false" class="index-blk">
          <div
              style="
              height: 20rem;
              width: 100%;
              overflow: scroll;
              overflow-x: scroll;
            "
          >
            <el-input
                v-model="filterText"
                style="width: 500px"
                :placeholder="`请输入${labelNm}名称`"
            />
            <el-tree
                ref="treeRef"
                class="custom-re-tree"
                :data="nodes"
                :props="defaultProps"
                @current-change="getCurrentNode"
                @check="checkChange"
                node-key="searchKey"
                :default-checked-keys="defaultCheckedKeys"
                :show-line="true"
                :highlight-current="true"
                :filter-node-method="filterNode"
                :show-checkbox="props.data.type === 10"
                @node-click="onEvent"
            >
              <template #default="{ node, data }">
                <span>
                  <el-icon><icon-name /></el-icon>
                  {{ data.value }} ( {{ data.code }} )
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="col-md-12">
        <CustomRecordingInfo
            v-if="listShow"
            :datas="datas"
            :pNode="pNode"
            :termList="props.termList"
            :type="props.data.type"
            :voType="props.data.voType"
            @updateTerm="updateTermlist"
        />
      </el-col>
    </el-row>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
          :item="{
          type: 'primary',
          label: '确认',
          func: () => {
            confirm();
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const filterText = ref("");
import { ref } from "vue";

import {
  AppTableConfig,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getProdEnableList } from "./custom-recording.service";
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const treeRef = ref<InstanceType<typeof ElTree>>();
const formconfig1 = ref({
  name: "",
});
const labelNm = ref("条款")
// 条款树
const nodes = ref<Array<any>>([]);
const defaultProps = {
  children: "list",
  label: "value",
  isLeaf: (data: any) => !data.list || data.list.length === 0, // 判断是否叶子节点
  disabled: (data: any) => !(!data.list || data.list.length === 0), // 最后一级才支持选择
};
const datas = ref<any>([]);
const pNode = ref<any>([]);
const listShow = ref(false);
const CustomRecordingInfo = defineAsyncComponent(
    () => import("./CustomRecordingInfo.vue")
);
// 初始化默认选中的数据
const defaultCheckedKeys = computed(() => {
  const keys = props.selectedList?.map((item: any) => item.searchKey);
  return keys;
});
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  termList: {
    type: Array,
    required: true,
  },
  selectedList: {
    type: Array,
    required: false,
  },
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
      isPage: false,
      showSelection: true,
      maxHeight: 350,
      fromSchema: [
        {
          prop: "cNmeCn",
          inputtype: "rtinput",
          title: "选择项",
          minWidth: 180,
        },
      ],
    })
);

onMounted(async () => {
  loadTree(props.data.type);
  if(props.data.type === 1) {
    labelNm.value = "条款"
  }else if(props.data.type === 5) {
    labelNm.value = "方案"
  }else if(props.data.type === 10) {
    labelNm.value = "产品"
  }
});

watch(
    () => props.data,
    (newTableConfig) => {},
    { deep: true }
);

watch(filterText, (val) => {
  treeRef.value.filter(val);
});
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.searchKey?.includes(value);
};

function addSearchKey(node, path = "") {
  const currentKey = (node.code || "") + (node.value || "");
  const fullPath = path + "_" + currentKey;
  node.searchKey = fullPath;
  if (Array.isArray(node.list)) {
    node.list.forEach(child => addSearchKey(child, fullPath));
  }
  if (Array.isArray(node)) {
    node.forEach(child => addSearchKey(child, fullPath));
  }
}

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 获取条款列表
function loadTree(type: number) {
  nodes.value = [];
  const param = {
    name: formconfig1.value.name,
    level: 2,
		type: type == 5 ? 2 : 1,
		cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
		cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
	};
  getProdEnableList(param).then((res: any) => {
    if (res.code === 200) {
      const nodesData = res.data.map((item: any) => ({
        ...item,
        list: item.list.map((child: any) => ({
          ...child,
          list: child.list.map((grandChild: any) => ({
            ...grandChild,
            isPlan: props.data.type === 5,
          }))
        })),
      }));
      addSearchKey(nodesData);
      if(props.data.type === 10) {
        // 组合出单添加意健险产品数据
        nodesData.push({
          code: '06',
          value: '意健险',
          searchKey: '_06意健险',
          list: [
            {
              code: 'P26000176',
              value: '陕西秦科保团体人身意外伤害保险',
              searchKey: '__06意健险_060030团体人身意外伤害保险_P26000176陕西秦科保团体人身意外伤害保险',
              isDutyFree: "0",
              isPlan: true
            },
          ],
        })
        console.log('nodesData', nodesData)
      }
      nodes.value = nodesData;
      nextTick(() => {
        if(props.selectedList && props.selectedList.length > 0) {
          checkChange();
        }
      });
    } else {
      ElMessage.error(res.msg);
    }
  });
}
const getCurrentNode = (data: any) => {
  if(props.data.type === 10) {
    return;
  }
  if (data.list.length !== 0) {
    listShow.value = true;
    datas.value = [];
  }
};
const selectedNode = ref<any>(null);
const onEvent = (data: any, node: any) => {
  if(props.data.type === 10) {
    return;
  }
  if ([1, 2,5,7].includes(props.data.type) && data.list.length == 0) {
    if(props.data.type === 5 && !data.isPlan) {
      listShow.value = true;
      datas.value = [];
      return
    }
    listShow.value = true;
    datas.value = [data];
    pNode.value = node;
    // emits("ok", node);
    selectedNode.value = node;
  } else {
    selectedNode.value = null;
  }
};

function checkChange(data: any) {
  const list = treeRef.value?.getCheckedNodes(true, false);
  listShow.value = true;
  datas.value = list;
}

// 保存
function confirm() {
  dialogVisible.value = false;
  if([1, 2,5,7].includes(props.data.type) && selectedNode.value) {
    emits("ok", selectedNode.value);
  }else if(props.data.type === 10 && datas.value) {
    emits("ok", datas.value);
  }
}
function updateTermlist() {
  props.data.updateQuery();
}
</script>

<style lang="scss" scoped>
.custom-re-tree >>> .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ffaaa64d;
}
/* 核心样式：只在最后一级（叶子节点）显示复选框 */
::v-deep .custom-re-tree {
  .el-tree-node .el-checkbox .is-disabled {
    display: none !important;
  }
  .el-tree-node .el-checkbox {
    margin-right: -10px !important;
  }
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
