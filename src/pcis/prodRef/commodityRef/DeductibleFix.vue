<template>
  <div>
    <el-tabs v-model="activeName" type="card" class="demo-tabs">
      <el-tab-pane label="添加免赔条件" name="first">
        <div class="totalBox">已选择 {{ selected.length }} 项</div>
        <el-table ref="multipleTableRef" :data="pageresult.list" style="width: 100%" row-key="cDeductibleClass"
          :row-class-name="tableRowClassName" @selection-change="handleSelectionChange">
          <el-table-column type="selection" :selectable="selectable" width="40" />
          <el-table-column type="index" label="序号" width="55" />
          <!-- <el-table-column property="cDeductibleClass" label="ID" width="100"/> -->
          <el-table-column label="是否可选" width="80">
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
				<el-form label-position="top">
					<el-form-item label="请输入所有免赔条件 (使用 1.,2.形式 分隔):">
						<!-- 输入框 -->
						<el-input
							v-model="rawInput"
							type="textarea"
							:rows="4"
							placeholder="示例：1.免赔条件A2.免赔条件B3.免赔条件C..."
							@blur="handleSplit"
						/>
					</el-form-item>
				</el-form>
        <el-table ref="multipleTableOtherRef" :data="addTableData" style="width: 100%">
          <el-table-column property="index" label="序号" width="55" />
          <!-- <el-table-column property="cDeductibleClass" label="ID" width="100"/> -->
          <el-table-column property="cDeductibleContent" label="免赔内容">
            <template #default="scope">
              <el-input v-model="scope.row['cDeductibleContent']"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="55">
            <template #default="{ row }">
              <el-button type="danger" link size="small" @click="delAdd(row)"><i-ep-delete />
              </el-button>
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
import { ref, reactive, onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { codeListViewStore } from "@/store";
import { getPrdDeductible } from "@/api/prod";
import { MyTableMethod } from "@/shared/app-table-config";
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
const multipleTableOtherRef = ref<MyTableMethod | null>(null);
const selected = ref([]);
const pageresult = reactive<Pageresult>({
  /** 数据列表 */
  list: [],
});
const addTableData = ref<Array<any>>([]); //添加其他特约
// const addTableData = reactive([]); //添加其他特约 //添加其他免赔
const activeName = ref("first");
const selectable = (row) => row["cIfMust"] != "1"; //这里调用是把必选的置灰
const tableRowClassName = ({ row, rowIndex }) => {
  let sty = "";
  selected.value.forEach((item) => {
    if (item["cDeductibleClass"] == row["cDeductibleClass"]) {
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
          cDeductibleClass: item.cDeductibleCode,
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
  const idx = addTableData.value.length + 1;
  addTableData.value.push({
    index: idx, //序号
    cDeductibleClass: (idx < 10 ? "other_0" : "other_") + idx,
    cDeductibleContent: "",
    cStatus: "",
    cIfEdit: "0", // 是否可修改
    cIfMust: "9", // 是否必选 9 其他
    cYuliu1: "",
    cIfFix: "0", //是否固定特约，查寻特约模板接口查出来的1，自定义添加的为0
  });
}

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
  let selectedData = props.data.selectedData;
  let tempData = multipleTableRef.value.getSelectionRows();
  let newAddTable = Object.assign([],addTableData.value)
  if (newAddTable) {
    for (const item of newAddTable) {
      tempData.push(item);
    }
  }

  const processedNewItems = tempData.map(item2 => {
    const matchedItem1 = selectedData.find(item1 =>
      item1.cIfEdit === '1' && item1.cDeductibleClass === item2.cDeductibleClass
    );
    return matchedItem1 ? matchedItem1 : item2;
  });
  props.method.getSelected(processedNewItems);
  close();
};
const close = () => {
  emits("handleClose");
};

function setSelected() {
  const lastSelected = props.data.selectedData;
  if (lastSelected && lastSelected.length) {
    const sarr = lastSelected.map((f: any) => f["cDeductibleClass"]);
    pageresult.list.forEach(f => {
      if (sarr.includes(f["cDeductibleClass"])) {
        multipleTableRef.value!.toggleRowSelection(f, true, true);
      }
    })
  }
  addTableData.value = lastSelected.filter(f => f['cIfMust'] === '9');
}

function delAdd(row: any) {
  const list = addTableData.value.filter(f => f['cDeductibleClass'] !== row['cDeductibleClass']);
  const newAddList = list.map((m,idx) => {
    // const idx = list.length;
    return {
      ...m,
      ...{
        index: idx+1,
        // cDeductibleClass: (idx < 10 ? "other_0" : "other_") + idx +1,
      }
    }
  });

  // if(newAddList){
      // addTableData.length = 0; // 清空原有内容（保持响应式引用）
      addTableData.value=newAddList; // 展开新数组，批量添加
  // }

  // addTableData.value = newAddList;
}

onMounted(() => { 
  
    let selectedData = props.data.selectedData;
    const addList = selectedData.filter(item => item.cIfFix==0 in item);
    if(addList.length >0){
        addList.forEach((item,index) => {
            item.addIndex = index+1;
            addTableData.value.push(item);
        });
    }
  
  refreshData();
});

// 1. 绑定输入框的内容
const rawInput = ref('') 

// 2. 处理分割逻辑
const handleSplit = () => {
  if (!rawInput.value) {
    return
  }
	// 按照 || 分割、去除首尾空格、过滤空字符串
	// const arr = rawInput.value.split('||').map(item => item.trim()).filter(item => item !== '') 
	// 按照 数字加点 分割、去除首尾空格、过滤空字符串
	const arr = rawInput.value.split(/\d+\.\s*/).map(item => item.trim()).filter(item => item !== '');


		
	arr.forEach((item) => {
		const idx = addTableData.value.length + 1;
		addTableData.value.push({
			index: idx, //序号
			cDeductibleClass: (idx < 10 ? "other_0" : "other_") + idx,
			cDeductibleContent: item,
			cStatus: "",
			cIfEdit: "0", // 是否可修改
			cIfMust: "9", // 是否必选 9 其他
			cYuliu1: "",
			cIfFix: "0", //是否固定特约，查寻特约模板接口查出来的1，自定义添加的为0
		});
	})

	rawInput.value = ''
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
