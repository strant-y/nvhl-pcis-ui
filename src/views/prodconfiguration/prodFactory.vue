<!-- User management -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const router = useRouter();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  createAppFreeEditConfig,
  AppFreeEditMethod,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
const dialog = ref<DialogMethod | null>(null);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getProFactoryList, changeStatus, auditSubmit } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "../../common/dzmodel/ComDialogConf";

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
        func: () => {
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cProdNo: "",
            cNmeCn: "",
            cStatus: "",
            cAuditStatus: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        placeholder: "产品大类",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        codeParam: { codeListParam: "" },
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        placeholder: "产品代码",
        itemWidth: 1,
        title: "产品代码",
        clearable: true,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        placeholder: "产品名称",
        title: "产品名称",
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        placeholder: "启用标识",
        title: "启用标识",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "cAuditStatus",
        inputtype: "rtselect",
        title: "审核状态",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "PROD_AUDIT_STATUS" },
        clearable: true,
      },
    ],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: () => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "add",
              }),
            },
          });
        },
      }),
    ],
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "edit",
        tooltip: "编辑",
        link: true,
        type: "success",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "edit",
                prod: row,
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "submit",
        tooltip: "提交审核",
        link: true,
        type: "danger",
        icon: "Check",
        tableClick: async (row) => {
          await auditSubmit({
            cProdNo: row.cProdNo,
            cStatus: row.cStatus,
            cAuditStatus: "submit",
          }).then((res) => {
            if (res.code === 200) {
              ElMessage.success(res.data.message);
              handleQuery();
            }
          });
        },
        // visible: row.cAuditStatus !== "2",
      }),
      createFreeButtonBase({
        id: "copy",
        iconColor: "#02D05F",
        tooltip: "复制",
        icon: "DocumentCopy",
        link: true,
        tableClick: function (row) {
          copy(row.cProdNo);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "大类编号",
      },
      {
        prop: "cKindNme",
        inputtype: "rtinput",
        title: "大类名称",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编号",
      },
      {
        prop: "cDispCde",
        inputtype: "rtinput",
        title: "产品显示码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "cStatus",
        inputtype: "rtswitch",
        title: "启用标识",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: "启用",
        inactiveText: "禁用",
        inlinePrompt: true,
        func: async (val, row) => {
          await changeStatus({
            cProdNo: row.cProdNo,
            cStatus: val,
          }).then((res) => {
            if (res.code === 200) {
              handleQuery();
            }
          });
        },
      },
      {
        prop: "cAuditStatus",
        inputtype: "rttag",
        title: "审核状态",
        loadData: [
          {
            label: "已提交",
            value: "submit",
            color: "#67C23A",
          },
          {
            label: "未提交",
            value: "unsubmit",
            color: "#14CCCC",
          },
          {
            label: "已审核",
            value: "audit",
            color: "##409EFF",
          },
        ],
      },
    ],
  })
);
onMounted(() => {});
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value.getFromData();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};
function copy(cProdNo: string) {
  dialog.value?.open(
    "prodCopy",
    { prodNo: cProdNo },
    {
      isOk: () => {
        // handleQuery();
      },
    },
    { title: "产品复制确认" }
  );
}
/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getProFactoryList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>
