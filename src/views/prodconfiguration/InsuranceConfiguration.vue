<!-- 用户管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig" ref="freeEditRef" />
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
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getProdList, qryProdTermList, changeStatus } from "@/api/prod";
import { clear } from "console";

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const formData = ref({
  cKindNo: "",
  cTermNo: "",
  cNmeCn: "",
  cRdrTyp: "",
  cEnableFlag: "",
});
function resetFields() {
  formData.value = {
    cKindNo: "",
    cTermNo: "",
    cNmeCn: "",
    cRdrTyp: "",
    cEnableFlag: "",
  };
}
defineExpose({
  resetFields,
});
const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    editFlag: true,
    editList: ["cStatus"],
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
          freeEditRef.value.setFormValue({
            cKindNo: "",
            cNmeCn: "",
            cTermNo: "",
            cRdrTyp: "",
            cEnableFlag: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        placeholder: "大类代码",
        title: "大类代码",
        typeCode: "KIND_LIST_ALL",
        params: { cStatus: "1" },
        clearable: true,
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        itemWidth: 1,
        title: "条款代码",
        clearable: true,
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        itemWidth: 1,
        title: "条款名称",
        clearable: true,
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        placeholder: "条款标志",
        title: "条款标志",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "RdrTyp" },
        clearable: true,
      },
      {
        prop: "cEnableFlag",
        inputtype: "rtselect",
        title: "启用标识",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
    ],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editList: ["cEnableFlag"],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "增加条款",
        type: "success",
        icon: "Plus",
        func: () => {
          router.push({
            path: "/prodconfiguration/insuranceConInfo",
            query: {
              param: JSON.stringify({
                type: "add",
              }),
            },
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
        tooltip: "编辑",
        link: true,
        type: "success",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/insuranceConInfo",
            query: {
              param: JSON.stringify({
                type: "edit",
                cPkId: row.cPkId,
              }),
            },
          });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   iconColor: "#02D05F",
      //   tooltip: "复制",
      //   icon: "DocumentCopy",
      //   link: true,
      //   func: function () {},
      // }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "险类代码",
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
      },
      // {
      //   prop: "orgCode",
      //   inputtype: "rtinput",
      //   title: "机构代码",
      // },
      // {
      //   prop: "productCode",
      //   inputtype: "rtinput",
      //   title: "产品代码",
      // },
      // {
      //   prop: "effectiveStartDate",
      //   inputtype: "rtdatetime",
      //   title: "有效起期",
      // },
      // {
      //   prop: "effectiveEndDate",
      //   inputtype: "rtdatetime",
      //   title: "有效止期",
      // },
      // {
      //   prop: "groupIndividualFlag",
      //   inputtype: "rtselect",
      //   title: "团个单标识",
      // },
      // {
      //   prop: "validFlag",
      //   inputtype: "rtselect",
      //   title: "有效标志",
      // },
      {
        prop: "cEnableFlag",
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
            cTermNo: row.cTermNo,
            cStatus: val,
          }).then((res) => {
            if (res.code === 200) {
              handleQuery();
            }
          });
        },
      },
    ],
  })
);
function setDisa() {
  formconfig.fromSchema?.forEach((e) => {
    if (e.prop === "cTermNo") {
      e.disabled = true;
    }
  });
}
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

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  qryProdTermList(param)
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
