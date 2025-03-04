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
import { SysRolechatsMgrService } from "@/views/sys-right-basic/service/sys-rolechats-mgr.service";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const sysRolechatsMgrService = new SysRolechatsMgrService();
const dzmodal = useDzModal();
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const finEdit = defineAsyncComponent(() => import("./fin-edit.vue"));
const finCheck = defineAsyncComponent(() => import("./fin-check.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "审核",
        func: async () => {
          dzmodal.open(finCheck, { type: "check" }).then((res) => {
            if (res.type === "ok") {
              console.log("审核");
            }
          });
        },
      }),
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
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "业务机构",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {})],
        param: { CDptCde: "" }, //待添加
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
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "CEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "TUnTmStart",
        inputtype: "rtdatepicker",
        title: "退票日期起",
      },
      {
        prop: "TUnTmEnd",
        inputtype: "rtdatepicker",
        title: "退票日期止",
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
        label: "修改",
        type: "success",
        func: function () {
          dzmodal.open(finEdit, { type: "add" }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CCustSeq",
        inputtype: "rtinput",
        title: "业务唯一流水号",
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "CEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "CStatus",
        inputtype: "rtinput",
        title: "状态",
      },
      {
        prop: "CDepartmentCode",
        inputtype: "rtinput",
        title: "业务部门代码",
      },
      {
        prop: "CCustomerNameCn",
        inputtype: "rtinput",
        title: "收款客户名称",
      },
      {
        prop: "CCustAccountNo",
        inputtype: "rtinput",
        title: "收款客户账号",
      },
      {
        prop: "CBankProvince",
        inputtype: "rtinput",
        title: "开户行省",
      },
      {
        prop: "CBankCity",
        inputtype: "rtinput",
        title: "开户行市",
      },
      {
        prop: "CBankName",
        inputtype: "rtinput",
        title: "开户行名称",
      },
      {
        prop: "CIspayPublic",
        inputtype: "rtinput",
        title: "对公对私",
      },
      {
        prop: "CResult",
        inputtype: "rtinput",
        title: "退票原因",
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
  //模拟数据
  pageresult.list = [
    {
      cOpgrpCnm: "角色名称",
      cName: "图表名称",
      cType: "1",
      cCode: "1",
    },
  ];
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  sysRolechatsMgrService
    .getRoleChatsList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        //ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>
