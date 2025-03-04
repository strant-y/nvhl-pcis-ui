<template>
  <el-row>
    <el-col :span="6" class="col-md-6">
      <el-card :bordered="false" class="index-blk">
        <div style="height: 35rem; width: 100%; overflow: scroll; overflow-x: scroll;">
          <el-tree :data="nodes" :props="defaultProps" :show-line="true" :expand-on-click-node="false"
            @node-click="onEvent"></el-tree>
        </div>
      </el-card>
    </el-col>
    <el-col :span="18" class="col-md-18">
      <sys-op-info :getDptCde="CDptCde" @cleanCheck="cleanCheck" @refreshTree="refreshTree" />
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { ElCard, ElTree, ElMessage } from 'element-plus';
import { SysOpMgrService } from '@/views/sys-right-basic/service/sys-op-mgr.service'
import sysOpInfo from '@/views/sys-right-basic/sys-op-mgr/sys-op-info.vue';

export default defineComponent({
  components: {
    ElCard,
    ElTree,
    sysOpInfo,
  },
  props: {
    isIeSls: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const nodes = ref<Array<any>>([]);
    const defaultProps = {
      children: 'children',
      label: 'cOpCnm',
      value: 'cOpCde',
    };
    const CDptCde = ref<string>('');
    const sysOpMgrService = new SysOpMgrService()
    const initDptTreeList = () => {
      const params = {
        cOpCde: '0'
      };
      sysOpMgrService.initOpTreeList(params).then((res: any) => {
        nodes.value = [];
        if (res && res.data) {
          if (res.data && res.data.data) {
            nodes.value = [res.data.data]
          }
        }
      }).catch(() => {
        ElMessage.error('后台服务异常,请联系管理员');
      });
    };
    const onEvent = (data: any) => {
      CDptCde.value = data.cOpCde
    };

    const cleanCheck = () => {
      CDptCde.value = ""
    }

    const refreshTree = () => {
      initDptTreeList()
    }

    onMounted(() => {
      initDptTreeList();

    });

    return {
      CDptCde,
      nodes,
      defaultProps,
      onEvent,
      cleanCheck,
      refreshTree,
    };
  },
});
</script>

<style scoped>
.row {
  display: flex;
}

.col-md-6,
.col-md-18 {
  padding: 10px;
}

.index-blk {
  margin-bottom: 20px;
}
</style>
