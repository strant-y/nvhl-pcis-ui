<template>
  <el-dialog v-model="dialogVisible" width="90%" class="system-dialog-scroll">
    <div style="margin-top: 1rem; margin-bottom: 1rem" align="left" v-if="propData">
      操作员: <b>{{ propData.cOperCnm }}[{{ propData.cOperId }}]</b> 操作机构：<b>{{ propData.cDptCnm }}[{{
        propData.cDptDispCde }}]</b>
    </div>
    <sys-usr-role-info @getOpgrpCde="setOpgrpCde" :getOperator="props.operatorData"></sys-usr-role-info>
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import { SysRoleMgrService } from '@/views/sys-right-basic/service/sys-role-mgr.service';
import SysUsrRoleInfo from './sys-usr-role-info/SysUsrRoleInfo.vue';

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

const props = defineProps({
  operatorData: {
    required: true,
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
    title: '角色操作权限',
    fromSchema: [
      {
        prop: "cOpgrpCde",
        inputtype: 'rtinput',
        title: "角色代码",
      },
      {
        prop: "cOpgrpCnm",
        inputtype: 'rtinput',
        title: "角色名称",
      },
      {
        prop: "cOpCnm",
        inputtype: 'rtinput',
        title: "操作名称",
      },
    ],
  })
);
const handleQuery = (flag) => {
  refreshData(flag);
};

const propData = ref(props.operatorData)
const tableRef = ref<AppTableMethod | null>(null);
const dialogVisible = ref(true);
const _cOpgrpCde = ref(''); // 角色代码

const sysRoleMgrService = new SysRoleMgrService();

const setOpgrpCde = (OpgrpCde: string) => {
  if (OpgrpCde) {
    _cOpgrpCde.value = OpgrpCde;
    refreshData(true);
  }
};
const refreshData = (reset = false) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const params = Object.assign({}, { COpgrpCde: _cOpgrpCde.value }, r);
  sysRoleMgrService.qrySysRoleOpList(params).then((res: any) => {
    if (res && res.code) {
      if (res.code === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageresult.list = pageData.result;
        }
      }
    }
  });
};
</script>

<style scoped lang="scss">
/* Add your styles here */
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>
