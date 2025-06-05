<!--商品审核--》 商品发布 -->
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const historyProduct = defineAsyncComponent(
  () => import("./historyProduct.vue")
);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, queryCommodityUndrList } from "@/api/prod";

const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "商品发布列表",
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
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "factortitle",
        inputtype: "rtselect",
        title: "险种大类",
        clearable: true,
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
      },
      {
        prop: "factorinputtype",
        inputtype: "rtselect",
        title: "险种名称",
        clearable: true,
        typeCode: "PROD_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
        clearable: true,
        typeCode: "tablist",
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
        clearable: true,
        typeCode: "tablist",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        clearable: true,
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { "cParCde": "commodity_status"},
        defaultValue: '5',
        disabled: true,
       
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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
    createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "处理",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "handle",
                cCommodityNo:row.cCommodityNo,
                cPkId: row.cPkId
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "view",
                cCommodityNo:row.cCommodityNo,
                cPkId: row.cPkId
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "审核历史",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {
          dzmodal
            .open(historyProduct, { type: "edit", data: {} })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险种大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "险种名称",
        typeCode: "PROD_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
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
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { "cParCde": "commodity_status"},
      },
    ],
  })
);

onMounted(async () => {});

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据

  //  状态 改成待发布  根据意健险相同
  const param = Object.assign(s, r,{cStatus:'5'});
  console.log('参数',param)
  queryCommodityUndrList(param)
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
