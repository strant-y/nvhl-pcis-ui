<!-- 商品审核 -->
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
import { deleteFactorBykey, queryCommodityUndrList } from "@/api/prod";
const dzmodal = useDzModal();

const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "商品审核列表",
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
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "险种大类",
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "险种名称",
        clearable: true,
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
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "view",
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
    ],
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "score",
    //     label: "审核历史",
    //     type: "success",
    //     icon: "Plus",
    //     func: function () {},
    //   }),
    // ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "险种大类",
      },
      {
        prop: "cProdNo",
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
        prop: "cStatus",
        inputtype: "rtswitch",
        title: "状态",
      },
    ],
  })
);

onMounted(async () => {});

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
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
