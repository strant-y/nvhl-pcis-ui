<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
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
import { SysRolechatsMgrService } from "../service/sys-rolechats-mgr.service";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const sysRolechatsMgrService = new SysRolechatsMgrService();
const dzmodal = useDzModal();
const chatsMgrEdit = defineAsyncComponent(() => import("./chats-mgr-edit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            COpgrpCde: "",
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "COpgrpCde",
        inputtype: "rtselect",
        title: "角色代码",
        typeCode: "ROLE_LIST",
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cStatus"],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: function () {
          dzmodal.open(chatsMgrEdit, { type: "add" }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          dzmodal
            .open(chatsMgrEdit, { type: "update", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          console.log(row);
          ElMessageBox.confirm(
            "确认要删除吗？该数据删除之后将无法恢复。",
            "提示",
            {
              confirmButtonText: "删除",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              sysRolechatsMgrService
                .delRoleChatsById({ cPkId: row.cPkId })
                .then((res: any) => {
                  if (res.code === 200) {
                    ElMessage.success(res.msg);
                    handleQuery();
                  } else {
                    ElMessage.error(res.msg);
                  }
                });
            })
            .catch((err) => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cOpgrpCnm",
        inputtype: "rtinput",
        title: "角色名称",
      },
      {
        prop: "cName",
        inputtype: "rtinput",
        title: "图表名称",
      },
      {
        prop: "cType",
        inputtype: "rtinput",
        title: "图表类型",
      },
      {
        prop: "cCode",
        inputtype: "rtinput",
        title: "参数代码",
      },
    ],
  })
);
onMounted(async () => {});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  sysRolechatsMgrService
    .getRoleChatsList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.data;
        pageresult.total = data.total;
      } else {
        //ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>
