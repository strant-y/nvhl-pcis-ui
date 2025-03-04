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
    title: "数据处理开关",
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
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "申请单号",
        labelWidth: 200,
        clearable: true,
        loadData: [
          { value: "1", label: "终保后批改" },
          { value: "2", label: "一般退保倒签" },
          { value: "3", label: "注销倒签" },
          { value: "4", label: "一般退保手动修改退保总保费" },
          { value: "5", label: "投保手动修改保费" },
          { value: "6", label: "一般批改手动修改险别保费" },
          { value: "7", label: "取消免费延期校验" },
        ],
      },
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "保单号",
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "业务申请类型",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "OA标题",
        clearable: true,
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "业务申请时间",
        clearable: true,
        type: "daterange",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "业务申请人",
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
        label: "打开开关",
        type: "primary",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "关闭开关",
        type: "primary",
        func: function () {},
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
    ],

    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "单据单号",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "保险日期",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "保险止期",
        minWidth: 180,
      },
      {
        prop: "cStatus",
        inputtype: "rtswitch",
        title: "开关状态",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: "启用",
        inactiveText: "禁用",
        inlinePrompt: true,
        change: (val) => {
          console.log(val);
        },
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
</script>

<style scoped></style>
