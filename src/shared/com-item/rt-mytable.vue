<template>
  <el-card shadow="never" class="table-container">
    <template #header>
      <el-row justify="space-between">
        <el-col :span="9" v-if="!tableConfig.production">
          {{ tableConfig.title }}
        </el-col>
        <el-col :span="9" v-if="tableConfig.production">
          <el-tooltip :content="tableConfig.productionTitle">
            {{ tableConfig.title }}
          </el-tooltip>
        </el-col>
        <el-col
          :span="15"
          style="text-align: right"
          v-if="tableConfig.titleBtns && tableConfig.titleBtns.length > 0"
        >
          <el-button-group>
            <template
              v-for="(item, index) in tableConfig.titleBtns"
              :key="index"
            >
              <rt-button :item="item" />
            </template>
          </el-button-group>
        </el-col>
      </el-row>
      <!-- <template v-for="(item, index) in tableConfig.titleBtns" :key="index">
        <rt-button :item="item" />
      </template> -->
    </template>
    <div class="form-inner">
      <VueDraggable
        v-model="dataList"
        :animation="150"
        target=".el-table"
        handle=".handle"
        @update="updateOptionAll"
      >
        <el-form
          ref="tableFormfef"
          :model="dataList"
          :inline-message="true"
          :label-width="formUi.labelWidth"
          :size="formUi.size"
          :label-position="formUi.labelPosition"
        >
          <table style="width: 100%">
            <thead>
              <tr>
                <th
                  v-if="appgrideditConfig.tableBtnPosition === 'left'"
                  :style="{
                    width:
                      (appgrideditConfig.tableBtnWidth
                        ? appgrideditConfig.tableBtnWidth
                        : 150) + 'px',
                    textAlign: 'center',
                  }"
                >
                  {{ appgrideditConfig.tableBtnTitle }}
                </th>
                <th
                  v-for="(i, index) in appgrideditConfig.fromSchema"
                  :key="index"
                  :width="i.width ? i.width : 100"
                >
                  {{ i.title }}
                </th>
                <th
                  v-if="appgrideditConfig.tableBtnPosition === 'right'"
                  :style="{
                    width:
                      (appgrideditConfig.tableBtnWidth
                        ? appgrideditConfig.tableBtnWidth
                        : 150) + 'px',
                    textAlign: 'center',
                  }"
                >
                  {{ appgrideditConfig.tableBtnTitle }}
                </th>
              </tr>
            </thead>
            <tbody class="el-table">
              <tr
                v-for="(i, j) in dataList"
                :key="j"
                :class="[appgrideditConfig.dragFlag ? 'handle cursor-move' : null,
                selectIndex === i._dataId ? 'highlight':''
                ]
                "
                :style="{
                  textAlign: 'center',
                }"
                @click="rowClick(i)"
                @dblclick="dblclick(i)"
              >
                <td v-if="appgrideditConfig.tableBtnPosition === 'left'">
                  <template
                    v-for="(btn, index) in appgrideditConfig.tableBtn"
                    :key="index"
                  >
                    <template v-if="appgrideditConfig.tableBtnType === 'text'">
                      <a
                        @click="btn.tableClick ? btn.tableClick(i) : () => {}"
                        >{{ btn.label }}</a
                      >
                    </template>
                    <template v-if="appgrideditConfig.tableBtnType === 'btn'">
                      <el-tooltip
                        :disabled="btn.tooltip ? false : true"
                        :content="btn.tooltip ? btn.tooltip : undefined"
                        placement="top"
                        effect="light"
                      >
                        <rtButton
                          @click="btn.tableClick ? btn.tableClick(i) : () => {}"
                          :item="btn"
                        />
                      </el-tooltip>
                    </template>
                    <template v-if="appgrideditConfig.tableBtnType === 'icon'">
                      <el-tooltip
                        :disabled="btn.tooltip ? false : true"
                        :content="btn.tooltip ? btn.tooltip : undefined"
                        placement="top"
                        effect="light"
                      >
                        <a
                          ><rtIcon
                            @click="
                              btn.tableClick ? btn.tableClick(i) : () => {}
                            "
                            :item="btn"
                        /></a>
                      </el-tooltip>
                    </template>
                    <template
                      v-if="index !== appgrideditConfig.tableBtn.length - 1"
                    >
                      <el-divider direction="vertical" />
                    </template>
                  </template>
                </td>
                <td
                  v-for="(t, ts) in appgrideditConfig.fromSchema"
                  :key="ts"
                  :class="
                    !appgrideditConfig.dragFlag && t.dragFlag
                      ? 'handle cursor-move'
                      : null
                  "
                  :style="{
                    textAlign: 'center',
                  }"
                >
                  <el-form-item
                    :prop="`${j}.${t.prop}`"
                    :rules="t.rules ? t.rules : undefined"
                  >
                    <div
                      :style="{
                        width:
                          t.showExBtn && t.inputtype !== 'rttable' // 显示组件尾部按钮 table 组件不显示尾部按钮
                            ? (t.btnWidth ? 100 - t.btnWidth : 75) + '%'
                            : '100%',
                      }"
                    >
                      <from-item
                        v-model="i[t.prop]"
                        :item="t"
                        :showLabel="
                          editIndex !== i._dataId ||
                          (appgrideditConfig.editList &&
                          appgrideditConfig.editList.length > 0
                            ? !appgrideditConfig.editList?.includes(t.prop)
                            : false)
                        "
                        :ref="
                          (re) => {
                            if (formRefs[i._dataId]) {
                              formRefs[i._dataId][t.prop] = re;
                            } else {
                              formRefs[i._dataId] = {};
                              formRefs[i._dataId][t.prop] = re;
                            }
                          }
                        "
                      />
                    </div>
                    <!---       显示组件尾部按钮       --->
                    <template
                      v-if="
                        t.showExBtn &&
                        !(
                          editIndex !== i._dataId ||
                          (appgrideditConfig.editList &&
                          appgrideditConfig.editList.length > 0
                            ? !appgrideditConfig.editList?.includes(t.prop)
                            : false)
                        )
                      "
                    >
                      <rt-button
                        v-if="t.inputtype !== 'rttable'"
                        :style="{
                          width: (t.btnWidth ? t.btnWidth : 25) + '%',
                          height: '100%',
                        }"
                        :item="t.btnItems"
                        @closepopover="(rev) => setPopover(rev, i, t)"
                      />
                    </template>
                  </el-form-item>
                </td>
                <td v-if="appgrideditConfig.tableBtnPosition === 'right'">
                  <template
                    v-for="(btn, index) in appgrideditConfig.tableBtn"
                    :key="index"
                  >
                    <template v-if="appgrideditConfig.tableBtnType === 'text'">
                      <a
                        @click="btn.tableClick ? btn.tableClick(i) : () => {}"
                        >{{ btn.label }}</a
                      >
                    </template>
                    <template v-if="appgrideditConfig.tableBtnType === 'btn'">
                      <el-tooltip
                        :disabled="btn.tooltip ? false : true"
                        :content="btn.tooltip ? btn.tooltip : undefined"
                        placement="top"
                        effect="light"
                      >
                        <rtButton
                          @click="btn.tableClick ? btn.tableClick(i) : () => {}"
                          :item="btn"
                        />
                      </el-tooltip>
                    </template>
                    <template v-if="appgrideditConfig.tableBtnType === 'icon'">
                      <el-tooltip
                        :disabled="btn.tooltip ? false : true"
                        :content="btn.tooltip ? btn.tooltip : undefined"
                        placement="top"
                        effect="light"
                      >
                        <a
                          ><rtIcon
                            @click="
                              btn.tableClick ? btn.tableClick(i) : () => {}
                            "
                            :item="btn"
                        /></a>
                      </el-tooltip>
                    </template>
                    <template
                      v-if="index !== appgrideditConfig.tableBtn?.length - 1"
                    >
                      <el-divider direction="vertical" />
                    </template>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </el-form>
      </VueDraggable>
      <div
        style="margin-top: 20px"
        :style="{ textAlign: tableConfig.endBtnsPosition }"
        v-if="tableConfig.endBtns && tableConfig.endBtns.length > 0"
      >
        <template v-for="(item, index) in tableConfig.endBtns" :key="index">
          <rt-button :item="item" />
        </template>
      </div>
    </div>
  </el-card>
</template>
<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { VueDraggable } from "vue-draggable-plus";
import { AppTableConfig } from "../app-table-config";
import { AppGridEditConfig } from "../app-grid-edit-config";

const emits = defineEmits(["indexupdate","rowselect"]); // 告知父类,组件顺序变更

const appgrideditConfig = reactive<AppGridEditConfig>({
  editFlag: false, //是否可以编辑
});
const dataList = ref<any[]>([]);

const formRefs = ref<any>([]);

const props = defineProps({
  tableConfig: {
    type: Object as () => AppTableConfig,
    required: true,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  row: {
    // 新增属性，用于接收当前行的数据
    type: Object as () => Record<string, any>,
    required: false,
  },
});
watch(
  () => props.tableConfig,
  (newTableConfig) => {
    Object.assign(appgrideditConfig, newTableConfig);
  },
  { deep: true }
);
// 编辑行id
const editIndex = ref(-1);
// 选中行id
const selectIndex = ref(-1);

const formUi = reactive<Record<string, any>>({});

function rowClick(row: any) {
  if (appgrideditConfig.editFlag) {
    editIndex.value = row._dataId;
  }
    selectIndex.value = row._dataId;
    emits("rowselect",row);
}
function dblclick(row: any) {
   appgrideditConfig.rowDbClickFun?.(row);
}
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
onMounted(() => {
  Object.assign(appgrideditConfig, props.tableConfig);
});

function addRow(data: any = {}) {
  const uuid = getuuid();
  data._dataId = uuid;
  dataList.value.push(data);
  editIndex.value = uuid;
  emits("rowselect",data);
}
function getformRef() {
  return formRefs.value;
}
const codeListMap = ref<Record<string, any>>({});

function updateOptionAll(e: any) {
  emits("indexupdate", null);
  setTimeout(() => {
    Object.keys(codeListMap.value).forEach((key) => {
      Object.keys(codeListMap.value[key]).forEach((propKey) => {
        if (codeListMap.value[key][propKey]) {
          formRefs.value[key][propKey].updateOption(
            codeListMap.value[key][propKey]
          );
        } else {
          formRefs.value[key][propKey].updateOption([]);
        }
      });
    });
  }, 50);
}
function updateOption(rowId: string, propKey: string, newOption: any) {
  setTimeout(() => {
    if (formRefs.value[rowId][propKey]) {
      formRefs.value[rowId][propKey].updateOption(newOption);
      if (!codeListMap.value[rowId]) {
        codeListMap.value[rowId] = {};
      }
      codeListMap.value[rowId][propKey] = newOption;
    }
  }, 50);
}
function getSelectRow() {
  const sele = dataList.value?.find((item) => {
    if (item._dataId === editIndex.value) {
      return item;
    }
  });
  return sele;
}
function setPopover(v: any, i: any, item: any) {
  dataList.value?.forEach((d) => {
    if (d._dataId === i._dataId) {
      d[item.prop] = v;
    }
  });
}

function getFromValue() {
  return dataList.value;
}
function setValueByRowKey(props:string , rowId: any, value:any){
  dataList.value?.forEach((data) => {
      // 初始化行数字Id
      if (data._dataId === rowId) {
        data[props] = value;
      }
    });
}

function setFormValue(data: any) {
  dataList.value = data;
  if(data){
      dataList.value?.forEach((data) => {
      // 初始化行数字Id
      data._dataId = getuuid();
    });
  }
}
function removeRow(dataId: string) {
  dataList.value = dataList.value.filter((item) => item._dataId !== dataId);
  emits("indexupdate", null);
}

defineExpose({
  addRow,
  getformRef,
  updateOption,
  getSelectRow,
  getFromValue,
  setFormValue,
  removeRow,
  setValueByRowKey,
});
</script>

<style scoped>
::v-deep .el-form-item__content {
  justify-content: center !important;
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
.table-container .form-inner {
  max-height: 500px; /* 设置最大高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
  display: block; /* 将表格转换为块级元素以应用滚动条 */
  width: 100%; /* 使表格占满父容器的宽度 */
}
.table-container table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%; /* 使表格占满父容器的宽度 */
}
.table-container table th,
.table-container table td {
  border: 1px solid #dcdfe6; /* 添加边框 */
  padding: 0px;
  text-align: center; /* 文本居中 */
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
}

.table-container table th {
  background-color: #f5f7fa; /* 表头背景颜色 */
  color: #303133; /* 表头文字颜色 */
  height: 40px;
}
/* 高亮选中行的样式 */
.highlight {
  background-color: #dcf9fd; /* 高亮背景颜色 */
}
.el-table tr:hover {
  background-color: #ecfcf3; /* 修改为你想要的颜色 */
}
</style>
