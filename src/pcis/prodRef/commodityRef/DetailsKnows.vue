<template>
   <div>
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
               @page-change="refreshData(false)" />
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from "vue";
import {codelistQuery, sanctionCountry} from "@/api/dict";
import {AppTableConfig, AppTableMethod, createTableEditConfig} from "@/shared/app-table-config";
const emits = defineEmits(["handleClose"]);
const multipleTableRef = ref<MyTableMethod | null>(null);
const list = ref([]);

const tableRef = ref<AppTableMethod | null>(null);
const dialogVisible = ref(true);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
      tableBtnType: "btn",
      tableBtnWidth: 220,
      tableBtnPosition: "right",
      isPage:'true',
      fromSchema: [
        {
          prop: "cPkId",
          inputtype: "rtinput",
          title: "序号",
        },
        {
          prop: "country",
          inputtype: "rtinput",
          title: "国家/地区",
        },
        {
          prop: "reason",
          inputtype: "rtinput",
          title: "受制裁说明",
        }
      ]
    })
);
const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = {
    codeListName: "project_details",
  }
  const param = Object.assign(s, r);
  // 查询列表数据
  sanctionCountry(param).then((response) => {
    if (response.code === 200) {
      pageresult.list = response.data;
      pageresult.total = response.total
    } else {
      ElMessage.error(response.msg);
    }
  });
};
const handleCancel = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped lang="scss">
.btnSty {
  text-align: right;
  margin-top: 10px;
}
.totalBox {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
  background: var(--cvrg-sub-header-bg-color);
  border: var(--rt-border);
  margin-bottom: 10px;
}
:deep .el-table .checkedSty {
  background-color: var(--rt-select-row-bg-color);
}
.addSty {
  border: 1px dashed #ccc;
  width: 100%;
  margin-top: 10px;
}
</style>
