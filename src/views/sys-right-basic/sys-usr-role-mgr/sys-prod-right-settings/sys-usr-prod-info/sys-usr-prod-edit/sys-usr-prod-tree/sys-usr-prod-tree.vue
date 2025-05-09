<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <el-tree v-if="nodes && nodes.length" ref="treeRef" :data="nodes" show-checkbox node-key="id" :props="defaultProps"
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
  }

  setTimeout(()=>{
    nodes.value = [{name:'张三---',children:[{name:'张三---11'},{name:'张三---12'}] },{name:'张三---2'}]
  },2000)
});

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      nodes.value = newData;
    }
  }
);

</script>

<style scoped lang="scss">
/* Add your styles here */
</style>
