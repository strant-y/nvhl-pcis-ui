<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
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
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保任务查询",
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
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "归属机构",
        btnWidth: 10,
        itemWidth: 2,
        rules: [{ type: "required" }],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
      },
      {
        prop: "cStatus",
        inputtype: "rtradio",
        title: "包含下级机构",
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "产品",
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "核保级别",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "协议号",
        clearable: true,
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "提交时间",
        clearable: true,
        type: "daterange",
      },
      {
        prop: "tm",
        inputtype: "rtradio",
        title: "核保状态",
        clearable: true,
        loadData: [
          { label: "核保待处理", value: 1 },
          { label: "暂存", value: 2 },
          { label: "核保通过", value: 3 },
        ],
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
    showSelection: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "批量返回修改",
        type: "primary",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "批量删除",
        type: "warning",
        func: function () {
          handleDelete();
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
          console.log(row);
          dzmodal.open(kindEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "接受任务",
        type: "info",
        size: "large",
        icon: "Message",
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "释放任务",
        type: "info",
        size: "large",
        icon: "Message",
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除任务",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          handleDelete(row.id);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "业务归属机构",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "投保人名称",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "被保险人",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "险种名称",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "申请单号",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "协议号",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "提交人",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "提交日期",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "核保级别",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "核保状态",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "核保人",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "保额",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "保费",
        minWidth: 180,
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
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}

/** 删除用户 */
function handleDelete(id?: string) {
  const userIds = [id || removeIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除数据?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {});
}
</script>

<style scoped></style>
