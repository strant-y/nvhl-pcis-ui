<template>
  <el-row>
    <el-col  :span="6" class="col-md-6">
      <el-card v-if="nodes" :bordered="false" class="index-blk">
        <div style="height: 35rem; width: 100%; overflow: scroll; overflow-x: scroll;">
          <el-tree
            :data="nodes"
            :props="defaultProps"
            :show-line="true"
            lazy
            :expand-on-click-node="false"
            :load="getChildren"
            @node-click="onEvent"
          ></el-tree>
        </div>
      </el-card>
    </el-col>
    <el-col :span="18" class="col-md-18">
      <SysOrgDptInfo :getDptCde="CDptCde" @refreshDptTree="refreshDptTreeList"  @cleanCheck="cleanCheck"></SysOrgDptInfo>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { ElCard, ElTree } from 'element-plus';
import SysOrgDptInfo from './sys-org-dpt-info/SysOrgDptInfo.vue';
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
import { ElMessage } from 'element-plus';
import { log } from 'console';
export default defineComponent({
  components: {
    ElCard,
    ElTree,
    SysOrgDptInfo
  },
  setup() {
    const nodes = ref<Array<any>>([]);
    const CDptCde = ref<string>('');
    const sysOperatorMgrService = new SysOperatorMgrService();

    const defaultProps = {
      children: 'children',
      label: 'name',
      isLeaf: 'leaf',
    };

    const initDptTreeList = () => {
      getDptTreeList();
    };

    const refreshDptTreeList = () => {
      initDptTreeList();
    };

    const getDptTreeList = () => {
      const params = {
        pId: '0200000000000'
      };
      sysOperatorMgrService.getOrgDptTreeNodeById(params).then((res: any) => {
        if (res && res.data) {
          //if (!nodes.value) {
            nodes.value = [];
          //}
          if (res.data) {
            nodes.value.push({
              id: '0200000000000',
              name: res.data.name,
              leaf: !res.data.hasChildren
            });
          }
        }
      }, (error: any) => {
        console.error('出错了', error);
        console.error('后台服务异常,请联系管理员');
      });
    };
    // 懒加载函数
    const getChildren = (node, resolve) => {
      if (node.level === 0) return resolve([])
      sysOperatorMgrService.getOrgDptTreeListByPid({
        cDptCde: node.data.id,
      })
      .then(result => {
          const dto = [];
          if (200 !== result['code']) {
            ElMessage.error(result['msg']); 
          } else {
            ElMessage.success(result['msg']); 
          }
          if (Array.isArray(result['data']) && result['data'].length > 0) {
              for (const row of result['data']) {
                  dto.push({
                      id: row['id'],
                      name: row['id'] + '-' + row['name'],
                      //parentId: row['parentId'],
                      leaf: !row['hasChildren'],
                  });
              }
          }
          resolve(dto);
      }, error => {
          console.log('出错了', error);
          ElMessage.error('后台服务异常,请联系管理员'); 
      });
    };
    const onEvent = (data: any) => {
      CDptCde.value = data.id;
    };
    const cleanCheck = () => {
      CDptCde.value = ""
    }
    onMounted(() => {
      initDptTreeList();
    });
    return {
      nodes,
      CDptCde,
      defaultProps,
      initDptTreeList,
      refreshDptTreeList,
      getDptTreeList,
      onEvent,
      cleanCheck,
      getChildren
    };
  }
});
</script>

<style scoped>
.row {
  display: flex;
}
.col-md-6, .col-md-18 {
  padding: 10px;
}
.index-blk {
  margin-bottom: 20px;
}
</style>
