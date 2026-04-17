<template>
  <div>
    <el-tabs v-model="activeName" type="card" class="demo-tabs">
      <el-tab-pane label="添加特约" name="first">
        <div class="totalBox">已选择 {{ selected.length }} 项</div>
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
            width="40"
          />
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column label="是否可选" width="80">
            <template #default="scope">
              <el-tag type="primary">{{
                scope.row["cIfMust"] == "1" ? "必选" : "可选"
              }}</el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column
            property="cSpecialCode"
            label="特约代码"
            width="160"
          /> -->
          <el-table-column property="cSpecialContent" label="特别约定内容">
            <template #default="scope">
              <div>{{ checkedLanguage[0] === "en-US" && scope.row["cSpecialContentEn"] ? scope.row["cSpecialContentEn"] : scope.row["cSpecialContent"] }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="添加其他特约" name="second">
        <el-table
          ref="multipleTableOtherRef"
          :data="addTableData"
          style="width: 100%"
        >
          <el-table-column property="addIndex" label="序号" width="55" />
          <!-- <el-table-column property="cSpecialCode" label="特约代码" width="300">
            <template #default="scope">
              <el-input
                v-model="scope.row['cSpecialCode']"
                disabled="true"
              ></el-input>
            </template>
          </el-table-column> -->
          <el-table-column property="cSpecialContent" label="特别约定内容">
            <template #default="scope">
              <!-- 历史数据补全带过来的特约信息不可编辑 -->
              <el-tooltip :content="scope.row['cSpecialContent']" placement="top" v-if="scope.row['cTransMrk'] === '1'">
                <div style="white-space: nowrap">{{ scope.row['cSpecialContent'] }}</div>
              </el-tooltip>
              <el-input v-model="scope.row['cSpecialContent']" v-else></el-input>
            </template>
          </el-table-column>
        </el-table>
        <el-button @click="add" class="addSty" :icon="Plus">新增一行</el-button>
      </el-tab-pane>
      <div class="languageCheckbox">
        <el-checkbox-group v-model="checkedLanguage" @change="languageChange">
          <el-checkbox label="中文" value="zh-CN" />
          <el-checkbox label="英文" value="en-US" />
        </el-checkbox-group>
      </div>
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
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { codeListViewStore } from "@/store";
import { getpSpecialAgreement } from "@/api/prod";
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
const checkedLanguage = ref(['zh-CN']);
const languageChange = (val:any) => {
  if(val.length > 1) {
    checkedLanguage.value = val.slice(-1)
  } else if(val.length < 1) {
    checkedLanguage.value = ['zh-CN']
  }
}
const pageresult = reactive<Pageresult>({
  /** 数据列表 */
  list: [],
});
const addTableData = reactive([]); //添加其他特约
const activeName = ref("first");
const selectable = (row) => row["cIfMust"] != "1" && row["cSpecialCode"] != '34201122' && row["cSpecialCode"] != '34201123'; //这里调用是把必选的置灰
const tableRowClassName = ({ row, rowIndex }) => {
  let sty = "";
  selected.value.forEach((item) => {
    if (item["cSpecialCode"] == row["cSpecialCode"]) {
      sty = "checkedSty";
    }
  });
  return sty;
};
const handleSelectionChange = (selection) => {
  selected.value = selection;
};


// 查询列表数据
const refreshData = () => {
  console.log('props.data', props.data)
  const cProdNo = props.data.cProdNo;
  const cDptCde = props.data.cDptCde || '';
  const cProdList = props.data.cProdList;
  const cCombinationPlanNo = props.data.cCombinationPlanNo;
  const tAppTm = props.data.tAppTm;
  pageresult.list = []
  const getResult = (result: any[], prodNo: string) => {
    result.forEach((item, index) => {
      pageresult.list.push({
        cSpecialCode: item.cSpecialCode,
        cSpecialContent: item.cSpecialContent,
        cSpecialContentEn: item.cSpecialContentEn,
        cProdNo: prodNo,
        // cNmeEn: item.cNmeEn,
        cIfMust: item.cIfMust, //是否必选
        cIfEdit: item.cIfEdit, //是否可修改
        cIfFix: "1", //是否固定特约，接口查出来的1，自定义添加的为0
      });
    });
  }
  const reqParam: any = {
    cDptCde: cDptCde,
    pageNum: 1,
    pageSize: 999,
    tAppTm: tAppTm
  }
  if(cProdList && cProdList.length > 0) { // 组合出单用
    reqParam.cProdNos = cProdList;
    reqParam.cCombinationPlanNo = cCombinationPlanNo;
  } else {
    reqParam.cProdNo = cProdNo;
  }
  getpSpecialAgreement(reqParam).then((res) => {
    if (res.data?.result) {
      getResult(res.data.result, cProdNo)

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
        multipleTableRef.value.toggleRowSelection(row, true);
      }
    });
  }
};

function add() {
  addTableData.push({
    addIndex: addTableData.length + 1, //序号
    cSpecialCode: "",
    cSpecialContent: "",
    cIfEdit: "1", //是否可修改
    cIfMust: "2", //是否必选
    cIfFix: "0", //是否固定特约，查寻特约模板接口查出来的1，自定义添加的为0
  });
}

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
  let selectedData = props.data.selectedData.map((item:any) => ({...item, cLanguageCode: checkedLanguage.value[0]}));

  let tempData = multipleTableRef.value.getSelectionRows().map((item:any) => ({...item, cLanguageCode: checkedLanguage.value[0]}));
  if(addTableData) {
    for (const item of addTableData) {
      tempData.push(item);
    }
  }

//   const processedNewItems = tempData.map(item2 => {
//       const matchedItem1 = selectedData.find(item1 => 
//             item1.cIfEdit === '1' && item1.cSpecialCode === item2.cSpecialCode
//       );
//       return matchedItem1 ? matchedItem1 : item2;
//     });
// debugger

  const processedNewItems = tempData.map(item2 => {
    const matchedItem1 = selectedData.find(item1 => {
      if (item1.cIfEdit !== '1') return false;
      const [code1, code2] = [item1.cSpecialCode, item2.cSpecialCode];
      // 非空code优先匹配，否则用addIndex（排除空值匹配）
      return code1 && code2 && code1 !== '' && code2 !== ''
        ? code1 === code2
        : item1.addIndex && item2.addIndex && item1.addIndex === item2.addIndex;
    });
    return matchedItem1 || item2;
  });

  const oldFenqiItem = selectedData.find(item => item.cSpecialCode === 'fenqi01');
  const result = oldFenqiItem
    ? [...processedNewItems, oldFenqiItem]  // 包含fenqi01
    : processedNewItems;
  props.method.getSelected(result);
  close();
};

const close = () => {
  emits("handleClose");
};

function setSelected() {
  const lastSelected = props.data.selectedData;
  if (lastSelected && lastSelected.length) {
    lastSelected.forEach((item) => {
      pageresult.list.forEach((item2) => {
        if (item["cSpecialCode"] === item2["cSpecialCode"]) {
          item2["checked"] = true;
          multipleTableRef.value.toggleRowSelection(item2, true);
        }
      });
    });
  }
}

onMounted(() => {
    let selectedData = props.data.selectedData;
    const addList = selectedData.filter(item => item.cIfFix == 0 in item);
    if(addList.length >0){
        addList.forEach((item,index) => {
            item.addIndex = index+1;
            addTableData.push(item);
        });
    }
    if(selectedData[0]?.cLanguageCode === "en-US") {
      checkedLanguage.value = ["en-US"]
    }
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
.languageCheckbox {
  position: absolute;
  top: 4px;
  right: 0;
  .el-checkbox {
    margin-right: 10px;
  }
}
</style>
