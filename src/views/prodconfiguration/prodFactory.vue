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
    
    <!-- 全产品组件更新弹窗 -->
    <el-dialog
      v-model="releaseDialogVisible"
      title="全产品组件更新"
      width="300px"
    >
      <el-radio-group v-model="cGrpMrk">
        <el-radio label="0">个单</el-radio>
        <el-radio label="1">团单</el-radio>
        <el-radio label="9">全部</el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="releaseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReleaseAll">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const router = useRouter();

import { onBeforeUnmount, ref } from "vue";
import {
  AppFreeEditConfig,
  createAppFreeEditConfig,
  AppFreeEditMethod,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { formatActionTitle } from "@/utils/action-title";
const releaseDialogVisible = ref(false);
const cGrpMrk = ref("9"); // 默认选择"全部"
const statusDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getProFactoryList, changeStatus, auditSubmit, releaseAllPage } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";

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
      createFreeButtonBase({
        type: "success",
        label: "全产品组件更新",
        func: async () => {
          releaseDialogVisible.value = true;
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        placeholder: "产品大类",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        placeholder: "产品编码",
        itemWidth: 1,
        title: "产品编码",
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
              title: formatActionTitle("add", "产品配置"),
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
        hideBtns: (row) =>
          row.cAuditStatus === "audit",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "edit",
                prod: row,
                prodNo: row.cProdNo,
              }),
              title: formatActionTitle("edit", "产品配置"),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "view",
        link: true,
        tooltip: "查看",
        type: "primary",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                type: "approve",
                editType: "view",
                prod: row,
                prodNo: row.cProdNo,
              }),
              title: formatActionTitle("view", "产品配置"),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "check",
        tooltip: "提交审核",
        link: true,
        type: "primary",
        icon: "Check",
        hideBtns: (row) =>
          row.cAuditStatus == "audit" ||
          row.cAuditStatus == "submit" ||
          row.cStatus == "0" ||
          row.cStatus == 0,
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
      }),
      createFreeButtonBase({
        id: "copy",
        iconColor: "#02D05F",
        tooltip: "复制",
        icon: "DocumentCopy",
        link: true,
       
        tableClick: function (row) {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "copy",
                prod: row,
                prodNo: row.cProdNo,
              }),
              title: formatActionTitle("copy", "产品配置"),
            },
          });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
      },
      {
        prop: "cKindNme",
        inputtype: "rtinput",
        title: "产品大类名称",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编码",
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
        func: (val, row) => {
          debounceChangeStatus(row, val);
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
// 缁戝畾鐗规畩楠岃瘉鍣?
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
function debounceChangeStatus(row: any, val: string) {
  const key = row?.cProdNo;
  if (!key) {
    return;
  }
  const timer = statusDebounceTimers.get(key);
  if (timer) {
    clearTimeout(timer);
  }
  const nextTimer = setTimeout(async () => {
    statusDebounceTimers.delete(key);
    const res = await changeStatus({
      cProdNo: row.cProdNo,
      cStatus: val,
    });
    if (res.code === 200) {
      handleQuery();
    }
  }, 300);
  statusDebounceTimers.set(key, nextTimer);
}

onBeforeUnmount(() => {
  statusDebounceTimers.forEach((timer) => clearTimeout(timer));
  statusDebounceTimers.clear();
});
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

/** 全产品组件更新确认 */
function handleReleaseAll() {
  releaseDialogVisible.value = false;
  ElNotification.closeAll();
  ElNotification({
    message: '产品发布中,请稍后~',
    type: 'info',
    title: '温馨提示',
    duration: 0,
    showClose: true,
  });
  releaseAllPage({ cGrpMrk: cGrpMrk.value }).then((res) => {
    ElNotification.closeAll();
    if (res.code === 200) {
      ElNotification({
        message: '全量发布成功',
        type: 'info',
        title: '温馨提示',
        duration: 3000,
        showClose: true,
      });
    }
  });
}
</script>

<style scoped></style>
