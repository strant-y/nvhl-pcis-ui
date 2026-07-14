<template>
  <el-dialog v-model="dialogVisible" width="90%" class="system-dialog-scroll">
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
        @page-change="loadData(false)"
      @selection-change="handleSelectionChange"
    />
    <div
      style="margin-top: 1rem; margin-bottom: 1rem; margin-right: 2rem"
      align="right"
    >
      <el-button type="primary" style="margin-right: 10px" @click="saveData">
        保存
      </el-button>
      <el-button @click="goback"> 返回 </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";
import { AppKey } from "@/constants/api";
import { getListByCode } from "@/api/code-list-service";
import { useUserStore } from "@/store/modules/user";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";

import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

const props = defineProps({
  COperId: {
    type: String,
    required: true,
  },
  CDptCde: {
    type: String,
    required: true,
  },
  RoleData: {
    type: Array,
    required: true,
  },
});
const emits = defineEmits(["ok"]);
const dialogVisible = ref(true);
const userStore = useUserStore();
const sysOperatorMgrService = new SysOperatorMgrService();

const user = userStore.user || {};
const roles = userStore.user.roles || [];

const _selectDataSet = ref(new Map<string, any>());
const _roleLevl = ref("");
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "操作权限-本次新增角色",
    isPage: false,
    showSelection: true,
    maxHeight: "380px",
    fromSchema: [
      {
        prop: "cOpgrpCde",
        inputtype: "rtinput",
        title: "角色代码",
      },
      {
        prop: "cOpgrpCnm",
        inputtype: "rtinput",
        title: "角色名称",
      },
    ],
  })
);

const goback = () => {
  dialogVisible.value = false;
};

const saveData = () => {
  const roleCdeBox = [];
  _selectDataSet.value.forEach((item) => {
    roleCdeBox.push({ COpgrpCde: item["cOpgrpCde"] });
  });
  sysOperatorMgrService
    .saveUsrRoleList({
      CCrtCde: user.opCde,
      CDptCde: props.CDptCde,
      userId: props.COperId,
      items: roleCdeBox,
    })
    .then((res: any) => {
      if (res && res.code === 200) {
        const data = res.data;
        if (data.code === "1") {
          ElMessage.success(data.message);
          emits("ok");
          goback();
        } else {
          ElMessage.error(data.message);
        }
      }
    });
};

const loadData = (flag = true) => {
     const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    let param = Object.assign({
     userId: props.COperId,
      CDptCde: props.CDptCde,
      CRoleLevl: _roleLevl.value
  }, r);
  sysOperatorMgrService
    .getUserAssociateRoles(param)
    .then((res: any) => {
      if (res && res.code === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.list = pageData['data'];
          pageresult.total = pageData['total'];
        
        }
      }
    });
};

const handleSelectionChange = (val: any[]) => {
  _selectDataSet.value.clear();
  val.forEach((item: any) => {
    _selectDataSet.value.set(item.cOpgrpCde, item);
  });
};
onMounted(() => {
  let roleCde = "";
  roles.forEach((res: any) => {
    roleCde = roleCde === "" ? res : roleCde + "," + res;
  });
  getListByCode("getRoleLevl", {
    cOperId: user.opCde,
    cDptCde: user.companyId,
  }).then(
    (res: any) => {
      if (res.code === 200 && res.data && res.data.length > 0) {
        _roleLevl.value = res.data[0].roleLevl;
        loadData();
      }
    },
    (error: any) => {
      console.log("出错了", error);
      ElMessage.error("后台服务异常,请联系管理员");
    }
  );
});
</script>

<style lang="scss">
.system-dialog-scroll .el-dialog__body {
  max-height: 550px;
   overflow-y: auto;
  overflow-x: hidden;
}
</style>
