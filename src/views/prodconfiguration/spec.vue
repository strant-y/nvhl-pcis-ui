<!-- 特约配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      :loading="loading"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref, nextTick } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  deleteFactorBykey,
  getFactorList,
  qryProdFixSpecList,
  changeSpecStatus,
  savePrdFixSpecInfo,
} from "@/api/prod";
const dzmodal = useDzModal();

const specEdit = defineAsyncComponent(() => import("./specEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const loading = ref(false);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "特约配置",
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
            cSpecNo: "",
            cNmeEn: "",
            cNmeCn: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
        clearable: true,
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
        clearable: true,
        loadData: inputtype,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "特约内容",
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: function () {
          dzmodal.open(specEdit, { type: "add", data: {} }).then((res) => {
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
          dzmodal.open(specEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
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
        tableClick: (row) => {
          dzmodal.open(specEdit, { type: "copy", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   type: "danger",
      //   tooltip: "删除",
      //   icon: "Delete",
      //   link: true,
      //   tableClick: (row) => {
      //     deleteFactorBykey(row)
      //       .then((res) => {
      //         const { code, data, msg } = res;
      //         if (200 === code) {
      //           ElMessage.success("删除成功");
      //           handleQuery();
      //         } else {
      //           ElMessage.error(msg);
      //         }
      //       })
      //       .finally(() => {});
      //   },
      // }),
    ],
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
				title: "英文名",
				align: "left",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        type: "textarea",
        title: "特约内容",
        loadData: inputtype,
				align: "left",
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
          const res = await savePrdFixSpecInfo(row);
          if (res.code == 200) {
            ElMessage.success("修改成功");
          }
          hendleQuery();
        },
      },
    ],
  })
);

onMounted(() => {
  nextTick(() => {
    handleQuery();
  });
});

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
  loading.value = true;
const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
const s = freeEditRef.value?.getFromValue(); //获取表单数据
const param = Object.assign(s, r);
qryProdFixSpecList(param)
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
    .finally(() => {
    loading.value = false;
  });
}
</script>

<style scoped></style>
