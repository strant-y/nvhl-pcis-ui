<template>
  <el-dialog
    v-model="dialogVisible"
    title="操作机构"
    custom-class="custom-dialog"
    width="85%"
  >
    <el-divider></el-divider>
    <el-tree
      ref="treeRef"
      :data="nodes"
      show-checkbox
      :props="defaultProps"
      node-key="id"
      :check-strictly="false"
      :check-on-click-node="true"
      @check-change="handleCheckChange"
    >
      <template #default="{ node, data }">
        <span>
          <el-icon><icon-name /></el-icon>
          {{ data.value }} ( {{ data.code }} )
        </span>
      </template>
    </el-tree>
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
import { getProdEnableList } from "@/api/prod";
import { useUserStore } from "@/store/modules/user";
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";
import { debug } from "console";
const sysOperatorMgrService = new SysOperatorMgrService();
interface Tree {
  [key: string]: any;
}

const user = ref<any>(useUserStore.user);
const _nodes = ref([]);
const dialogVisible = ref(true);
const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const selectedNode = ref<Tree | null>();
const formconfig1 = ref({
  name: "",
});
const arrData = ref<Tree[]>([]);
const nodes = ref<Array<any>>([]);
const defaultProps = {
  children: "list",
  isLeaf: "leaf",
  label: "value",
};
// const defaultProps = {
//   children: "children",
//   label: "name",
//   isLeaf: "leaf",
// };
const props = defineProps({
  cUndrClsCde: {
    type: String,
    required: false,
  },
})

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
};
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleCheckChange = (
  data: any,
  checked: boolean,
  indeterminate: boolean
) => {
  arrData.value = treeRef.value.getCheckedNodes();
};
const handleSave = () => {
  if (arrData.value.length) {
    emits("ok", arrData.value);
  }
  dialogVisible.value = false;
};
// 获取条款列表
function loadTree() {
  nodes.value = [];
  const param = {
    name: formconfig1.value.name,
    level: 1,
		cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
		cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
    cUndrClsCde: props.cUndrClsCde
  };
  getProdEnableList(param).then((res: any) => {
    if (res.code === 200) {
      nodes.value = res.data.map((item: any) => ({
        ...item,
        list: item.list.map((child: any) => ({
          ...child,
          parentCode: item.code,
          parentValue: item.value,
        })),
      }));
    } else {
      ElMessage.error(res.msg);
    }
  });
}
// const initDptTreeList = () => {
//   let root = "0200000000000";
//   if (user.value && user.value.companyId) {
//     root = user.value.companyId;
//   }
//   const params = {
//     pId: root,
//   };
//   sysOperatorMgrService
//     .getOrgDptTreeNodeById(params)
//     .then((res) => {
//       if (res && res["data"]) {
//         if (_nodes.value.length === 0) {
//           _nodes.value = [];
//         }
//         const data = res["data"];
//         if (res["data"]) {
//           _nodes.value.push({
//             id: root,
//             name: res["data"]["name"],
//             leaf: false,
//           });
//         }
//       }
//     })
//     .catch((error) => {
//       ElMessage.error("后台服务异常,请联系管理员");
//     });
// };

const loadNode = (node, resolve) => {
  if (node.level === 0) {
    return resolve([]);
  }
  const params = {
    cDptCde: node.data.id,
  };
  // sysOperatorMgrService
  //   .getOrgDptTreeListByPid(params)
  //   .then((result) => {
  //     const dto = [];
  //     if (200 !== result["code"]) {
  //       ElMessage.error(result["msg"]);
  //     } else {
  //       ElMessage.success(result["msg"]);
  //     }
  //     if (result["data"] && result["data"].length > 0) {
  //       result["data"].forEach((item) => {
  //         dto.push({
  //           id: item["id"],
  //           name: item["name"],
  //           leaf: !item.hasChildren,
  //         });
  //       });
  //     }
  //     resolve(dto);
  //   })
  //   .catch((error) => {
  //     console.log("出错了", error);
  //     ElMessage.error("后台服务异常,请联系管理员");
  //   });
};
onMounted(() => {
  loadTree();
  // initDptTreeList();
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
</style>
