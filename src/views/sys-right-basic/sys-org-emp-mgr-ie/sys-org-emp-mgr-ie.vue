<template>
  <el-row>
    <el-col :span="6" class="col-md-6">
      <el-card :bordered="false" class="index-blk">
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
      <sys-org-emp-info :getDptCde="CDptCde"  @cleanCheck="cleanCheck"/>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { ElCard, ElTree, ElMessage } from 'element-plus';
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
import SysOrgEmpInfo from '@/views/sys-right-basic/sys-org-emp-mgr-ie/edit/sys-org-emp-info/sys-org-emp-info.component.vue';

export default defineComponent({
  components: {
    ElCard,
    ElTree,
    SysOrgEmpInfo,
  },

  setup(props) {
    const nodes = ref<Array<any>>([]);
    const CDptCde = ref<string>('');


    const defaultProps = {
      children: 'children',
      label: 'name',
      isLeaf: 'leaf',
    };

    const sysOperatorMgrService = new SysOperatorMgrService();
    const initDptTreeList = () => {
      const params = {
        pId: '0200000000000',
      };
      sysOperatorMgrService.getOrgDptTreeNodeById(params).then((res: any) => {
        if (res && res.data) {
          if (!nodes.value) {
            nodes.value = [];
          }
          if (res.data) {
            nodes.value.push({
              id: '0200000000000',
              name: res.data.name,
              leaf: false,
            });
          }
        }
      }, (error: any) => {
        console.log('出错了', error);
        ElMessage.error('后台服务异常,请联系管理员');
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

    onMounted(() => {
      initDptTreeList();
    });
    const cleanCheck = () => {
      CDptCde.value = ""
    }
    return {
      nodes,
      CDptCde,
      defaultProps,
      onEvent,
      cleanCheck,
      getChildren
    };
  },
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
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
