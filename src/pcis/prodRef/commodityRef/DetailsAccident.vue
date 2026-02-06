<template>
  <div>
    <el-tabs  type="card" class="demo-tabs">
      <el-tab-pane label="合同约定的事故预防服务项目" >
        <div class="totalBox">已选择 {{ selected.length }} 项</div>
        <el-table
            ref="multipleTableRef"
            :data="list"
            style="width: 100%"
            row-key="value"
            @selection-change="handleSelectionChange"
        >
          <el-table-column
              type="selection"
              width="55"
          />
          <el-table-column property="value" label="事故预防服务项目" />
          <el-table-column property="label" label="事故预防服务项目" />
        </el-table>
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
import {codelistQuery} from "@/api/dict";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
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
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const emits = defineEmits(["handleClose"]);
const multipleTableRef = ref<MyTableMethod | null>(null);
const selected = ref([]);
const list = ref([]);
const addTableData = reactive([]); //添加其他特约
const tableRowClassName = ({ row, rowIndex }) => {
  let sty = "";
  selected.value.forEach((item) => {
    if (item["codeKind"] == row["codeKind"]) {
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
    codeListName: "project_details",
  }
  // 查询列表数据
  codelistQuery(param).then((response) => {
    if (response.code === 200) {
      list.value = response.data;
      nextTick(() => {
        setSelected();
      });
    } else {
      ElMessage.error(response.msg);
    }
  });
};

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
    let tempData = multipleTableRef.value.getSelectionRows();
    props.method.getSelected(tempData);
    close();
};
const close = () => {
  emits("handleClose");
};

function setSelected() {
  const lastSelected = props.data.selectedData;
  if (lastSelected && lastSelected.length) {
    const sarr = lastSelected.split(',');
    list.value.forEach(f => {
      if(sarr.includes(f["value"])){
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
