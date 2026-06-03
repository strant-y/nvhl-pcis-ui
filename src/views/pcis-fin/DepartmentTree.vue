<template>
  <el-dialog
    v-model="dialogVisible"
    title="机构部门"
    custom-class="custom-dialog"
    width="85%"
  >
    <el-divider></el-divider>
    <el-input
      v-model="filterText" 
      style="width: 500px"
      placeholder="输入机构代码或者机构名称查询"
    />
    <el-tree
      ref="treeRef"
      style="max-width: 500px"
      class="filter-tree"
      :data="_nodes"
      lazy
      :load="loadNode"
      :props="defaultProps"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      :highlight-current="true"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" class="custom-button">取消</el-button>
        <el-button type="primary" @click="handleSave" class="custom-button"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { ElTree } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";
const sysOperatorMgrService = new SysOperatorMgrService();
interface Tree {
  [key: string]: any;
}
const userStore = useUserStore();
const user = ref(userStore.user);
const _nodes = ref([]);
const dialogVisible = ref(true);
const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const selectedNode = ref<Tree | null>();

const defaultProps = {
  children: "children",
  label: "name",
  isLeaf: "leaf",
};

const emits = defineEmits(["ok"]);

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.name.includes(value);
};
const handleNodeClick = (data: Tree) => {
  selectedNode.value = data;
    emits("ok", selectedNode.value);
    dialogVisible.value = false;
};
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleSave = () => {
  if (selectedNode.value) {
    console.log("选中的节点", selectedNode.value);
    emits("ok", selectedNode.value);
  }
  dialogVisible.value = false; 
};

const initDptTreeList = () => {
  let root = user.value['companyId'];
  // if (user.value && user.value.companyId) {
  //   root = user.value.companyId;
  // }
  const params = {
    pId: root,
  };
  sysOperatorMgrService
    .getOrgDptTreeNodeById(params)
    .then((res) => {
      if (res && res["data"]) {
        if (_nodes.value.length === 0) {
          _nodes.value = [];
        }
        const data = res["data"];
        if (res["data"]) {
          _nodes.value.push({
            id: root,
            name: root + '-' + res["data"]["name"],
            leaf: false,
          });
        }
      }
    })
    .catch((error) => {
      ElMessage.error("后台服务异常,请联系管理员");
    });
};

const loadNode = (node, resolve) => {
  if (node.level === 0) {
    return resolve([]);
  }
  const params = {
    cDptCde: node.data.id,
  };
  sysOperatorMgrService
    .getOrgDptTreeListByPid(params)
    .then((result) => {
      const dto = [];
      // if (200 !== result["code"]) {
      //   ElMessage.error(result["msg"]);
      // } else {
      //   ElMessage.success(result["msg"]);
      // }
      if (result["data"] && result["data"].length > 0) {
        result["data"].forEach((item) => {
          dto.push({
            id: item["id"],
            name: item["id"] + '-' + item["name"],
            leaf: !item.hasChildren,
          });
        });
      }
      resolve(dto);
    })
    .catch((error) => {
      console.log("出错了", error);
      ElMessage.error("后台服务异常,请联系管理员");
    });
};
onMounted(() => {
  initDptTreeList();
});
</script>
<style scoped>
filter-tree {
  padding: 10px;
  border-right: 1px solid #ccc;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}

/* .custom-dialog {
  padding: 20px;
}

.custom-input {
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-tree {
  margin-top: 10px;
}

.custom-tree .el-tree-node__content:hover {
  background-color: #1a310e; 
}

.custom-tree .el-tree-node.is-current .el-tree-node__content {
  background-color: #e1f3d8; 
}

.custom-button {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
} */
</style>


<!-- <template>
  <el-dialog
    v-model="dialogVisible"
    title="机构部门"
    custom-class="custom-dialog"
    width="80%"
  >
    <el-divider></el-divider>
    <el-input
      v-model="filterText"
      style="width: 500px"
      placeholder="输入机构代码或者机构名称查询，机构名称查询不得少于5个字符"
    />
    <el-tree
      ref="treeRef"
      style="max-width: 500px"
      class="filter-tree"
      :data="data"
      :default-expand-all="true"
      :props="defaultProps"
      default-expand-all
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      :highlight-current="true"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" class="custom-button">取消</el-button>
        <el-button type="primary" @click="handleSave" class="custom-button"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from "vue";
import { ElTree } from "element-plus";
interface Tree {
  [key: string]: any;
}
const dialogVisible = ref(true);
const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const selectedNode = ref<Tree | null>();
const props = defineProps({
  data: Object,
  type: String,
});
const defaultProps = {
  children: "children",
  label: "label",
};

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};
const handleNodeClick = (data: Tree) => {
  selectedNode.value = data;
};
const handleCancel = () => {
  dialogVisible.value = false;
};

const handleSave = () => {
  if (selectedNode.value) {
    console.log("选中的节点", selectedNode.value);
    // emits("ok", selectedNode.value);
  }
  dialogVisible.value = false;
};
onMounted(async () => {
  console.log("qqqqqqqqqqqqqqqqqq", props)
 });
const data: Tree[] = [
  {
    id: 1,
    label: "软通动力总公司",
    children: [
      {
        id: 4,
        label: "湖北分公司",
        children: [
          {
            id: 9,
            label: "十堰中支公司",
            children: [
              {
                id: 11,
                label: "软通动力十堰中支公司车商团队1",
              },
            ],
          },
          {
            id: 10,
            label: "分公司销售团队15",
          },
          {
            id: 12,
            label: "分公司销售团队16",
          },
        ],
      },
      {
        id: 5,
        label: "河北分公司",
        children: [
          {
            id: 10,
            label: "软通动力石家庄中心支公司",
            children: [
              {
                id: 12,
                label: "软通动力石家庄团队管理部",
              },
            ],
          },
          {
            id: 11,
            label: "软通动力廊坊中心支公司",
          },
          {
            id: 13,
            label: "软通动力邯郸中心支公司",
          },
        ],
      },
    ],
  },
];
</script>
<style scoped>
filter-tree {
  padding: 10px;
  border-right: 1px solid #ccc;
}

/* .custom-dialog {
  padding: 20px;
}

.custom-input {
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-tree {
  margin-top: 10px;
}

.custom-tree .el-tree-node__content:hover {
  background-color: #1a310e; 
}

.custom-tree .el-tree-node.is-current .el-tree-node__content {
  background-color: #e1f3d8; 
}

.custom-button {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
} */
</style> -->
