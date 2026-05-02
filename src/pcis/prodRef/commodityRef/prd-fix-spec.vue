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
				<el-form label-position="top">
					<el-form-item label="示例：1.保险公司服务xxx2.我公司最近季度的综合偿付能力充足率xxxx——(请使用 1.分隔) :">
						<!-- 输入框 -->
						<el-input
							v-model="rawInput"
							type="textarea"
							:rows="4"
							placeholder="「粘贴识别」或输入文本，智能拆分特约信息"
							@blur="handleSplit"
						/>
					</el-form-item>
				</el-form>
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
					<el-table-column label="操作" width="55">
						<template #default="scope">
							<el-button
								size="small" link
								type="danger"
								@click="handleDeleteClick(scope.$index, scope.row)"
							>
							<i-ep-delete />
							</el-button>
						</template>
					</el-table-column>
        </el-table>
        <el-button @click="add" class="addSty" :icon="Plus">新增一行</el-button>
      </el-tab-pane>
      <div v-if="activeName != 'second'" class="languageCheckbox">
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
	let param = props.data.param
	if (param.cAppNo.length > 18 && (param.pageType === "EDR_APP_NEW_SCENE" || (param.pageType === "TEMPORARY_DEPOSIT" && param.cTransMrk !=='1')) && param.cRsnCde == "FZ") {
		return false
	}
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

// 删除行处理函数
const handleDeleteClick = (index: number, row: any) => {
  ElMessageBox.confirm(
    '确定要删除这条特约吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 用户点击确定，执行删除
      addTableData.splice(index, 1);
      // 重新计算序号
      addTableData.forEach((item, i) => {
        item.addIndex = i + 1;
      });
    })
    .catch(() => {
      // 用户点击取消，不执行操作
    });
};

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
	// 1. 准备数据源
  // selectedData: 父组件传来的原始数据（包含旧的、可能被删除的行）
  let selectedData = props.data.selectedData.map((item:any) => ({...item, cLanguageCode: checkedLanguage.value[0]}));

  // tempData: 弹窗表格当前选中的数据（左侧表格）
  let tempData = multipleTableRef.value.getSelectionRows().map((item:any) => ({...item, cLanguageCode: checkedLanguage.value[0]}));

  // 2. 核心修复：清洗 selectedData
  // 问题根源：selectedData 里包含了 addTableData 的旧数据。
  // 如果用户在 addTableData 删除了行，selectedData 里还有，就会导致“复活”。
  // 我们需要把 selectedData 里属于“自定义添加”（即存在于 addTableData 逻辑中）的数据剔除。
  // 假设自定义数据的特征是 cSpecialCode 为空 或者 cIfFix === '0' (根据你的业务调整)
  const cleanedSelectedData = selectedData.filter(item => {
    // 如果是标准库里的特约（有代码），保留
    if (item.cSpecialCode && item.cSpecialCode !== '') return true;
    // 如果是自定义特约（无代码），在 selectedData 中丢弃，因为我们将以 addTableData 为准
    return false;
  });

  // 3. 合并“左侧选中” + “右侧自定义”
  // 注意：这里直接用 cleanedSelectedData，不要用原始的 selectedData
  // 这样就不会把 addTableData 里已删除的旧行带进来了
  const combinedData = [...tempData, ...addTableData];

  // 4. 处理分期逻辑 (fenqi01)
  // 先找出分期项
  const fenqiItem = cleanedSelectedData.find(item => item.cSpecialCode === 'fenqi01');

  // 如果存在分期项，且 combinedData 里没有（防止重复），则加到最后
  // 注意：这里要检查 combinedData 是否已经有了 fenqi01，避免重复添加
  const hasFenqiInCombined = combinedData.some(item => item.cSpecialCode === 'fenqi01');

  const result = hasFenqiInCombined
    ? combinedData
    : (fenqiItem ? [...combinedData, fenqiItem] : combinedData);

  // 5. 强制重置序号 (关键步骤，防止父组件渲染错乱)
  result.forEach((item, index) => {
    item.index = index + 1;
    // 如果父组件依赖 addIndex，也同步更新
    if (item.addIndex) item.addIndex = index + 1;
  });

  // 6. 提交数据
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
		addTableData.push({
			addIndex: addTableData.length + 1, //序号
			cSpecialCode: "",
			cSpecialContent: item,
			cIfEdit: "1", //是否可修改
			cIfMust: "2", //是否必选
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
.languageCheckbox {
  position: absolute;
  top: 4px;
  right: 0;
  .el-checkbox {
    margin-right: 10px;
  }
}
</style>
