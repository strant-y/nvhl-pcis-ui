<template>
  <div>
    <el-table
        ref="multipleTableRef"
        :data="pageresult.list"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        @selection-change="handleSelectionChange"
    >
      <el-table-column
          type="selection"
          :selectable="selectable"
          width="55"
      />
      <el-table-column property="DistECargo.nSeqNo" label="序号" width="55" />
      <el-table-column property="DistECargo.cGoodsNo" label="货物名称"/>
      <el-table-column property="DistECargo.cGoodsType" label="货物类型"/>
      <el-table-column property="DistECargo.nGoodsValue" label="货物价值"/>
      <el-table-column property="DistECargo.nNum" label="货物数量"/>
    </el-table>
    <div class="btnSty">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="returnData">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {FormPage} from "@/views/protocolManagement/utils/form-page";

const idxParam = inject('idxParam');
const formPage: FormPage = idxParam?.formPage;


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
const selectable = (row) => !row["disabled"];//这里调用是把必选的置灰
const tableRowClassName = ({ row, rowIndex }) => {
  let sty = "";
  selected.value.forEach((item) => {
    if (item["DistECargo.nSeqNo"] == row["DistECargo.nSeqNo"]) {
      sty = "checkedSty";
    }else if(item["disabled"]) {
      sty = "disabledSty";
    }
  });
  return sty;
};

onMounted(() => {
  const dataList = formPage.getComponentRefById('AgreementDistGoods').getFormValue();
  pageresult.list.push(...dataList)
  nextTick(() => {
    toggleSpecificRow(); //这里调用是把必选的选中
    setSelected();
  });
});

const handleSelectionChange = (selection: any) => {
  selected.value = selection;
};

// 切换指定行的选中状态
const toggleSpecificRow = () => {
  if (multipleTableRef.value) {
    // 假设要切换 id 为 2 的行的选中状态
    pageresult.list.forEach((row) => {
      if (row["cIfMust"] == "1") {
        multipleTableRef.value.toggleRowSelection(row, true);
      }
    });
  }
};


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
  if(lastSelected && lastSelected['Term.nCargoSeq']) {
    const nCargoSeqList = lastSelected['Term.nCargoSeq'].split(",")
    nCargoSeqList.forEach((item) => {
      pageresult.list.forEach((item2) => {
        if (item === item2["DistECargo.nSeqNo"] + '') {
          item2["checked"] = true;
          multipleTableRef.value.toggleRowSelection(item2, true);
        }
      });
    });
  }
  const selectList = props.data.selectList;
  if(selectList) {
    pageresult.list.forEach((item2) => {
      const f = selectList.find( f => f === item2["DistECargo.nSeqNo"]+'' );
      item2["disabled"] = !!f;
    });
  }
}

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
:deep .el-table .disabledSty {
  background-color: rgb(228, 223, 223);
}
.addSty {
  border: 1px dashed #ccc;
  width: 100%;
  margin-top: 10px;
}
</style>
