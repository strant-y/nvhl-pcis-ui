<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="6">
        <div class="gutter-row">
					<div class="tree-wrapper">
          	<!-- <el-tree :data="_nodes" :props="defaultProps" :load="loadNode" :show-line="true" :expand-on-click-node="false"
            lazy accordion @node-click="handleNodeClick"></el-tree> -->
            <dept-tree v-model="CDptCde" @confirm="handleNodeClick" />
					</div>
        </div>
      </el-col>
      <el-col :span="18">
        <sys-org-operator-info :getDptCde="CDptCde" @cleanCheck="cleanCheck"></sys-org-operator-info>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
import { AppKey } from '@/constants/api';
import { useUserStore } from "@/store/modules/user";

const sysOrgOperatorInfo = defineAsyncComponent(() => import("./sys-org-operator-info/sys-org-operator-info.vue"));

const userStore = useUserStore();
const _nodes = ref<any[]>([]);
const CDptCde = ref<string>('');
const user = ref<any>({});
const defaultProps = {
  children: 'children',
  label: 'name',
  isLeaf: 'leaf',
};

const sysOperatorMgrService = new SysOperatorMgrService();

user.value = userStore.user;

const initDptTreeList = () => {
  let root = '020000000000';
  if (user.value && user.value.companyId) {
    root = user.value.companyId;
  }
  const params = {
    pId: root,
  };
  sysOperatorMgrService.getOrgDptTreeNodeById(params).then((res) => {
    if (res && res['data']) {
      if (_nodes.value.length === 0) {
        _nodes.value = [];
      }
      const data = res['data'];
      if (res['data']) {
        _nodes.value.push({
          id: root,
          name: root + '-' + res['data']['name'],
          leaf: false,
        });
      }
    }
  }).catch((error) => {
    ElMessage.error('后台服务异常,请联系管理员');
  });
};

const loadNode = (node, resolve) => {
  console.log(233,node.data.id)
  if (node.level === 0) {
    return resolve([]);
  }
  const params = {
    cDptCde: node.data.id,
  };


  sysOperatorMgrService.getOrgDptTreeListByPid(params).then((result) => {
    const dto = [];
    if (200 !== result['code']) {
      ElMessage.error(result['msg']);
    } else {
      ElMessage.success(result['msg']);
    }
    if (result['data'] && result['data'].length > 0) {
      result['data'].forEach(item => {
        dto.push({
          id: item['id'],
          name: item['id'] + '-' + item['name'],
          leaf: !item.hasChildren,
        });
      })
    }

    resolve(dto);
  }).catch((error) => {
    ElMessage.error('后台服务异常,请联系管理员');
  });
};

// const handleNodeClick = (data) => {
//   CDptCde.value = data.id
// };

const cleanCheck = () => {
  CDptCde.value = ""
}

onMounted(() => {
  initDptTreeList();
});

</script>

<style scoped lang="scss">
.gutter-row {
  background: var(--el-fill-color-blank);
	height: 100%;
  width: 100%;
  overflow-x: auto; /* 允许横向滚动 */
  overflow-y: auto; /* 纵向也需要滚动 */
  position: relative;
}

/* 关键：让 tree-wrapper 宽度由内容撑开 */
.tree-wrapper {
  display: inline-block;
  min-width: 100%; /* 至少占满容器 */
}

:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
