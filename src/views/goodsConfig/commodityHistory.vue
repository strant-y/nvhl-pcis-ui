<!-- 历史记录 -->
<template>
  <div class="app-container">
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

    fromSchema: [
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "险种大类",
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "险种名称",
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "cFactorTab",
        inputtype: "rtselect",
        title: "商品名称",
      },
      {
        prop: "cFactorTab",
        inputtype: "rtselect",
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
