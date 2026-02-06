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
      placeholder="输入机构代码或者机构名称查询，机构名称查询不得少于5个字符"
			@keyup.enter="handleSearch(true)"
     >
          <template #append>
            <el-button icon="Search" @click="handleSearch(true)" />
          </template>
    </el-input>
    <el-tree
      ref="treeRef"
      style="max-width: 500px"
      class="filter-tree"
			node-key="id"
      :data="_nodes"
      lazy
      :load="loadNode"
      :props="defaultProps"
      :filter-node-method="filterNode"
    
      @node-click="handleNodeClick"
      :highlight-current="true"
    />
      <!-- :default-expanded-keys="defaultExpandedKeys" -->
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
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
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
const props = defineProps({
  isXY: {
    type: Boolean,
    default: false,
  }
});
const emits = defineEmits(["ok"]);
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.name.includes(value);
};
const handleNodeClick = (data: Tree) => {
 
    selectedNode.value = data;
    if( selectedNode.value.id ==='search'){
      // ElMessage.warning('请选择实际机构节点')
      return false;
    }
    emits("ok", selectedNode.value);
    dialogVisible.value = false;
};
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleSave = () => {
  if(selectedNode.value && selectedNode.value.id ==='search'){
      ElMessage.warning('请选择实际机构节点')
      return false;
    }
  if (selectedNode.value) {
    emits("ok", selectedNode.value);
  } 
  dialogVisible.value = false; 
};   

// 搜索按钮
const handleSearch = ()=>{
      if (!filterText.value.trim()) {
        if(_nodes.value[0].id ==="0200000000000")
        return false;
        _nodes.value = [];
        initDptTreeList();
        return;
      }else if(filterText.value.trim().length<5){
            ElMessage.warning('查询条件不得少于五个字符！');
            return;
      }
      if(props.isXY){
        try {
					_nodes.value = []
          // 调用搜索接口
          const params = {
            SCDptCnm: filterText.value.trim(),
            CDptCde:"0200000000000",
            signDptMrk:"1",
            dptCls:"2"
          };


          codeListStore
              .queryCodeList(
                  {
                    codeListName: "CDptCde_List_base",
                    codeListParam: params ,
                  },
              )
              .then((res) => {
                const searchResultNode = {
                  id: 'search',
                  name: `搜索结果（${res.length}个）`,
                  leaf: false,
                  children: res.map(item => ({
                    id: item.id,
                    name: item.name,
                    leaf: !item.hasChildren,
                    children: [],
                    expanded: true, // 确保搜索结果节点展开
                    cSignDptMrk:'1'
                  })),
                  expanded: true,// 确保根节点展开
                  cSignDptMrk:'1'
                };

								_nodes.value.push(searchResultNode);
								nextTick(() => {
									const tree = treeRef.value;
									if (tree && tree.store.nodesMap['search']) {
										tree.store.nodesMap['search'].expand();
									}
								});
              });
        } catch (error) {
          ElMessage.error('搜索失败，请稍后再试');

        } finally {
        }
      }else {
        try {
					_nodes.value = []
          // 调用搜索接口
          const params = {
            SCDptCnm: filterText.value.trim(),
            CDptCde:"0200000000000"
          };


          codeListStore
              .queryCodeList(
                  {
                    codeListName: "CDptCde_List_base",
                    codeListParam: params ,
                  },
              )
              .then((res) => {
                const searchResultNode = {
                  id: 'search',
                  name: `搜索结果（${res.length}个）`,
                  leaf: false,
                  children: res.map(item => ({
                    id: item.id,
                    name: item.name,
                    leaf: !item.hasChildren,
                    children: [],
                    expanded: true // 确保搜索结果节点展开
                  })),
                  expanded: true // 确保根节点展开
                };

								_nodes.value.push(searchResultNode);
								nextTick(() => {
									const tree = treeRef.value;
									if (tree && tree.store.nodesMap['search']) {
										tree.store.nodesMap['search'].expand();
									}
								});
              });
        } catch (error) {
          ElMessage.error('搜索失败，请稍后再试');

        } finally {
        }
      }

 
}

const initDptTreeList = () => {
  let root = user.value['companyId'];
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
          const rootNode = {
            id: root,
            name: res["data"]["name"],
            leaf: false,
            expanded: true,
            children: [], // 确保有 children 属性用于存放子节点
            cSignDptMrk:data?.cSignDptMrk || ''
          };
          
          _nodes.value.push(rootNode);
          nextTick(()=>{
              expandRootNode();
          })
          }
      }
    })
    .catch((error) => {
      ElMessage.error("后台服务异常,请联系管理员1");
    });
};

// 只加载直接子节点（第二级）
const loadChildNodes = (parentNode: any) => {
  // 创建模拟节点对象（level 为 1 表示根节点的子节点）
  const mockNode = {
    level: 1,
    data: parentNode,
    childNodes: []
  };
  
  // 调用 loadNode 加载子节点
  loadNode(mockNode, (children) => {
    // 将子节点添加到父节点
    parentNode.children = children;
    
    // 为子节点添加 children 属性，确保结构一致性
    children.forEach(child => {
      child.children = [];
    });
  });
};

// 展开根节点并触发子节点加载
const expandRootNode = () => {
  const rootNode = treeRef.value.getNode(_nodes.value[0] );
  if (rootNode) {
    rootNode.expanded = true;
    // 等待子节点加载完成后执行后续操作
    setTimeout(() => {
      loadChildNodes(_nodes.value[0]);
    }, 100); // 根据接口响应时间调整
  }
};

const loadNode = (node, resolve) => {
  console.log('node0',node.data)
  if(node.data.id ==='search'){

     return resolve(node.data.children);

  }
  if (   node.level === 0) {
    return resolve([]);
  }
  const params = {
    cDptCde: node.data.id || '0200000000000'
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
            cSignDptMrk:item["cSignDptMrk"],
            id: item["id"],
            name: item["name"],
            leaf: !item.hasChildren,
            expanded: true // 关
          });
        });
      }
      console.log( _nodes.value)
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
</style>
