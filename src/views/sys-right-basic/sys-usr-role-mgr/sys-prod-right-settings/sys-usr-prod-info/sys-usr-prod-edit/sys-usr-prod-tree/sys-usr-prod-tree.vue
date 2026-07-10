<template>
  <el-dialog v-model="dialogVisible" width="80%" class="system-dialog-scroll">
    <el-tree class="menu-tree" v-if="nodes && nodes.length" ref="treeRef" :data="nodes" show-checkbox node-key="id" :props="defaultProps"
      :default-expanded-keys="expandedKeys" :default-checked-keys="checkedKeys" :check-strictly="false"></el-tree>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false"> 返回 </el-button>
        <el-button type="primary" @click="confirmDialog"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { isLeaf } from 'element-plus/es/utils';
import { defineComponent, ref, onMounted, watch } from 'vue';
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
import { useUserStore } from "@/store/modules/user";
const emits = defineEmits(["ok", "cancel"]);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  getOperator: {
    required: true,
  },
});
const userStore = useUserStore();
const user = ref<any>({});
user.value = userStore.user;
const sysOperatorMgrService = new SysOperatorMgrService();
const treeRef = ref(null)
const dialogVisible = ref(true)
const nodes = ref<any[]>([]);
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const COperId = ref<string>('');
const CDptCde = ref<string>('');
const _selectedSet = ref<Map<string, any>>(new Map());
const saveNodeData = ref<Array<any>>([]);
const defaultProps = ref({
  label: 'name',
  children: 'children',
  isLeaf: 'hasChildren'
})

const sendData = () => {
  const selectData = treeRef.value.getCheckedNodes()
  console.log('selectData', selectData);
  return selectData
}


//dialog弹框确定事件
const confirmDialog = () => {
  const result = sendData()
  handleConfirm(result)
}
const handleConfirm = (result) => {
  console.log('参数',result)

  if (result.length > 0) {
    result.forEach(item => {
      item.cProdNo = item.id
      item.COperId = COperId
      item.CDptCde = CDptCde
      if (item['children'] && item['children'].length > 0) {
          // 大类
          item['CNmeCn'] = item['name'] + '(大类)';
          item['CProdCat'] = '1';
      } else {
          // 险别
          item['CNmeCn'] = item['name'];
          item['CProdCat'] = '0';
      }
    });
    sysOperatorMgrService.saveUsrProdList({
      CCrtCde: user.value.opCde,
      COperId: props.getOperator.cOperId,
      CDptCde: props.getOperator.cOwnDptCde,
      items: result,
    }).then((saveRes: any) => {
      if (saveRes && saveRes.code === 200) {
        ElMessage.success(saveRes.data.message);
        dialogVisible.value = false
        emits("ok", {});
      }
    });
  }
};

onMounted(() => {
  if (props.data) {
    console.log('newData', props.data);
    if (props.data) {
      nodes.value = props.data;
    }
    if (props.getOperator) {
      COperId.value = props.getOperator.cOperId;
    }
    if (props.getOperator) {
      CDptCde.value = props.getOperator.cOwnDptCde;
    }
    initExpandedKeys()
    checkedKeys.value = getDefaultCheckedKeys(nodes.value)

    console.log( checkedKeys.value )
  }

  // setTimeout(()=>{
  //   nodes.value = [{name:'张三---',children:[{name:'张三---11'},{name:'张三---12'}] },{name:'张三---2'}]
  // },2000)
});

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      nodes.value = newData;
      
    }
  }
);
// 选中节点
const getDefaultCheckedKeys= (data)=> {
      // 根据条件提取要展开的节点的 keys
      let checkedKeys = [];
      
      // 递归遍历节点
      data.forEach(item => {
        if (item.checked) { // 假设数据中有 isChecked 字段
          checkedKeys.push(item.id); // 如果节点被选中，添加其 id
        }
        
        // 如果节点有子节点，递归处理子节点
        if (item.children && item.children.length > 0) {
          checkedKeys = checkedKeys.concat(getDefaultCheckedKeys(item.children));
        }
      });
      
      return checkedKeys;
    }

// 展开节点
const initExpandedKeys = ()=> {
    nodes.value.forEach(item => {
        expandedKeys.value.push(item.id); // 将每个节点的 id 添加到数组中。
        if (item.children) { // 如果节点有子节点，递归处理子节点。
          expandChildren(item.children);
        }
      });
    }
   const expandChildren = (children)=> { // 递归函数，用于处理所有子节点。
      children.forEach(child => {
        expandedKeys.value.push(child.id); // 将子节点的 id 也添加到数组中。
        if (child.children) { // 如果子节点还有子节点，继续递归。
          expandChildren(child.children);
        }
      });
    }

</script>

<style scoped lang="scss">
/* Add your styles here */
.menu-tree {
  max-height: 400px;
  overflow: auto;
}

:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
