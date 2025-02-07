<!-- 用户管理 -->
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
const router = useRouter();
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import { useDzModal } from "@/views/dzmodel/DzModalService";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { delUndrClsById, qryCommodityBasePage } from "@/api/prod";
const dzmodal = useDzModal();

const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "商品配置列表",
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
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNme",
        inputtype: "rtselect",
        title: "险种大类",
        typeCode: "KIND_LIST_GRT",
        params: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        clearable: true,
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "险种名称",
        typeCode: "PROD_LIST_GRT",
        params: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        clearable: true,
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
        clearable: true,
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        clearable: true,
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        params: {
          cParCde: "commodity_status",
        },
      },
      {
        prop: "factorTab",
        inputtype: "rtselect",
        title: "商品类型",
        clearable: true,
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        params: {
          cParCde: "commodity_type",
        },
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: function () {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "add",
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
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "edit",
                cCommodityNo: row.cCommodityNo,
              }),
            },
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
      // delUndrClsById(row)
      //   .then((res) => {
      //     const { code, data, msg } = res;
      //     if (200 === code) {
      //       ElMessage.success("删除成功");
      //       handleQuery();
      //     } else {
      //       ElMessage.error(msg);
      //     }
      //   })
      //   .finally(() => {});
      //   },
      // }),
    ],
    fromSchema: [
      {
        prop: "cKindNme",
        inputtype: "rtinput",
        title: "险种大类",
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "险种名称",
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtselect",
        title: "商品名称",
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtselect",
        title: "平台名称",
      },
      {
        prop: "cIsOpenCommodity",
        inputtype: "rtselect",
        title: "是否全国性商品",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
      },
      {
        prop: "cEnableStatus",
        inputtype: "rtselect",
        title: "启用状态",
      },
      {
        prop: "tCrtTm",
        inputtype: "rtdatetime",
        title: "启用时间",
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
  qryCommodityBasePage(param)
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
