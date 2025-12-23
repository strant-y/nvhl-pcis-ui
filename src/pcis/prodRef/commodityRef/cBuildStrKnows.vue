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
          title: "结构",
        },
        {
          prop: "reason",
          inputtype: "rtinput",
          title: "说明",
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
		response.data = [
			{cPkId: 1,country: "钢混结构", reason: "住宅、办公楼、商场等"},
			{cPkId: 2,country: "钢、钢筋混凝土结构", reason: "高层地标建筑等"},
			{cPkId: 3,country: "砖混结构", reason: "老旧小区，老旧楼宇等"},
			{cPkId: 4,country: "混合结构", reason: "墙体是水泥且屋顶是钢，工业厂房、仓库等"},
			{cPkId: 5,country: "钢结构", reason: "墙体和屋顶都是钢，工业厂房、仓库等"},
			{cPkId: 6,country: "砖木结构", reason: "墙体砖墙，屋顶木材"},
			{cPkId: 7,country: "砖砌结构", reason: "墙体和屋顶都是砖"},
		]
    if (response.code === 200) {
      pageresult.list = response.data;
			pageresult.total = response.data.length;
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
