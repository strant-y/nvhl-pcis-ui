<template>
  <div>
    <el-tabs v-model="activeName" type="card" class="demo-tabs">
      <el-tab-pane label="添加免赔条件" name="first">
        <div class="totalBox">已选择 {{ selected.length }} 项</div>
        <el-table
          ref="multipleTableRef"
          :data="pageresult.list"
          style="width: 100%"
          row-key="cDeductibleCode"
          :row-class-name="tableRowClassName"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            :selectable="selectable"
            width="55"
          />
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column label="是否可选" width="100">
            <template #default="scope">
              <el-tag type="primary">{{
                scope.row["cIfMust"] == "1" ? "必选" : "可选"
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column property="cDeductibleContent" label="免赔条件内容" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="添加其他免赔条件" name="second">
        <el-table
          ref="multipleTableRef"
          :data="addTableData"
          style="width: 100%"
        >
          <el-table-column property="addIndex" label="序号" width="55" />
          <el-table-column property="cDeductibleContent" label="免赔内容">
            <template #default="scope">
              <el-input v-model="scope.row['cDeductibleContent']"></el-input>
            </template>
          </el-table-column>
        </el-table>
        <el-button @click="add" class="addSty" :icon="Plus">新增一行</el-button>
      </el-tab-pane>
    </el-tabs>
    <div class="btnSty">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="returnData">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { codeListViewStore } from "@/store";
import { getPrdDeductible } from "@/api/prod";
const codeListStore = codeListViewStore();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  method: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(["handleClose"]);
const multipleTableRef = ref<MyTableMethod | null>(null);
const selected = ref([]);
const pageresult = reactive<Pageresult>({
  /** 数据列表 */
  list: [],
});
const addTableData = reactive([]); //添加其他特约
const activeName = ref("first");
const selectable = (row) => row["cIfMust"] != "1"; //这里调用是把必选的置灰
const tableRowClassName = ({ row, rowIndex }) => {
  let sty = "";
  selected.value.forEach((item) => {
    if (item["cDeductibleCode"] == row["cDeductibleCode"]) {
      sty = "checkedSty";
    }
  });
  return sty;
};
const handleSelectionChange = (selection) => {
  selected.value = selection;
};

const refreshData = () => {
  const param = {
    cProdNo: props.data.cProdNo,
    pageNum: 1,
    pageSize: 999,
  }
  // 查询列表数据
  getPrdDeductible(param).then((res) => {
    if (res.data.result) {
      pageresult.list = [];
      res.data.result.forEach((item, index) => {
        pageresult.list.push({
          cDeductibleCode: item.cDeductibleCode,
          cDeductibleContent: item.cDeductibleContent,
          cStatus: item.cStatus, //是否必选
          cIfMust: item.cIfMust, //是否必选
          cIfEdit: item.cIfEdit, //是否可修改
          cIfFix: "1", 
        });
      });
      nextTick(() => {
        toggleSpecificRow(); //这里调用是把必选的选中
        setSelected();
      });
    }
  });
};

// 切换指定行的选中状态
const toggleSpecificRow = () => {
  if (multipleTableRef.value) {
    // 假设要切换 id 为 2 的行的选中状态
    pageresult.list.forEach((row) => {
      if (row["cIfMust"] == "1") {
        multipleTableRef.value.toggleRowSelection(row, true, true);
      }
    });
  }
};

function add() {
  addTableData.push({
    addIndex: addTableData.length + 1, //序号
    cDeductibleCode: "", 
    cDeductibleContent: "",
    cStatus: "",
    cIfEdit: "1", // 是否可修改
    cIfMust: "", // 是否必选
    cYuliu1: "",
  });
}

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
  if (activeName.value == "first") {
    let tempData = multipleTableRef.value.getSelectionRows();
    props.method.getSelected(tempData);
  } else {
    console.log("addTableData", addTableData);
    props.method.getSelected(addTableData);
  }
  close();
};
const close = () => {
  emits("handleClose");
};

function setSelected() {
  const lastSelected = props.data.selectedData;
  if (lastSelected && lastSelected.length) {
    const sarr = lastSelected.map( (f: any) => f["cDeductibleCode"]);
    pageresult.list.forEach(f => { 
      if(sarr.includes(f["cDeductibleCode"])){
        multipleTableRef.value!.toggleRowSelection(f, true, true);
      }
    })
  }
}

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
  background: #fefce7;
  border: 1px solid #f3e4b9;
  margin-bottom: 10px;
}
:deep .el-table .checkedSty {
  background-color: #ffe8e6;
}
.addSty {
  border: 1px dashed #ccc;
  width: 100%;
  margin-top: 10px;
}
</style>
