<template>
  <div>
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import SysUsrRoleEdit from "./sys-usr-role-edit/sys-usr-role-edit.vue";
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery(true);
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            COperId: "",
            CDptCde: "",
          });
          handleQuery(true);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cOpgrpCde",
        inputtype: "rtinput",
        title: "角色代码",
        clearable: true,
      },
      {
        prop: "cOpgrpCnm",
        inputtype: "rtinput",
        title: "角色名称",
        clearable: true,
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 2,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    isRadio: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "配置",
        type: "primary",
        func: function () {
          console.log("props.getOperator", props.getOperator._value.cOperId);
          dzmodal
            .open(SysUsrRoleEdit, {
              COperId: props.getOperator._value.cOperId,
              CDptCde: props.getOperator._value.cOwnDptCde,
              RoleData: pageresult.list,
            })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery(true);
              }
            });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          delRole(row.cOpgrpCde);
        },
      }),
    ],

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
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "角色描述",
      },
    ],
  })
);

const tableRef = ref<AppTableMethod | null>(null);

const props = defineProps({
  getOperator: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(["getOpgrpCde"]);

const selected = ref([]);
const displayData = ref("");

const sysOperatorMgrService = new SysOperatorMgrService();

const handleQuery = (flag) => {
  refreshData(flag);
};

const handleSelectionChange = (selection) => {
  if (selection.length) {
    selected.value = selection;
    displayData.value = selected.value[0].cOpgrpCde;
    emits("getOpgrpCde", selected.value[0].cOpgrpCde);
  }
};

const refreshData = (reset = false) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign({}, s, r, {
    COperId: props.getOperator._value.cOperId,
    CDptCde: props.getOperator._value.cOwnDptCde,
  });

  sysOperatorMgrService.qryUsrRoleList(param).then((res: any) => {
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = pageData.result;
      }
    }
  });
};

const delRole = (id: string) => {
  ElMessageBox.confirm("确认要删除吗？该数据删除之后将无法恢复。", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const param = {
      COpgrpCde: id,
      COperId: props.getOperator._value.cOperId,
      CDptCde: props.getOperator._value.cOwnDptCde,
    };
    sysOperatorMgrService.delUsrRoleInfo(param).then((res: any) => {
      if (res.code === 200) {
        const data = res.data;
        if (data.code === "1") {
          // 保存成功
          ElMessage.success(data.message);
          refreshData(true);
        } else {
          ElMessage.error(data.message);
        }
      }
    });
  });
};

onMounted(() => {
  refreshData(true);
});
</script>

<style scoped lang="scss">
.actived {
  background-color: #f0f9eb;
}

.fc-table-icons {
  .el-button {
    margin-right: 10px;
  }
}
</style>
