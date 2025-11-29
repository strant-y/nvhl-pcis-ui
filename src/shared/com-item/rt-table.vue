<template>
  <el-form
    ref="tableFormfef"
    :model="tableDatas"
    :inline-message="true"
    :size="formUi.size"
    :label-position="formUi.labelPosition"
  >
    <el-table
      ref="tableRef"
      :data="tableDatas"
      style="width: 100%"
      :default-sort="item.defaultSort"
      :border="item.border || item.border === false ? item.border : true"
      :fit="item.fit ? item.fit : true"
      :stripe="item.stripe === undefined ? true : item.stripe"
      :size="item.size ? item.size : 'default'"
      :show-header="item.showHeader ? item.showHeader : true"
      @row-click="rowClick"
      @row-dblclick="rowDblclick"
      :row-key="(row) => row._dataId"
      :expand-row-keys="expandRowKeys"
      @expand-change="expandChange"
      @selection-change="handleSelectionChange"
      @status-change="handleStatusChange"
      :show-summary="item.showSummary ? item.showSummary : false"
      :sum-text="item.sumText ? item.sumText : '合计'"
			empty-text="暂无数据"
      :summary-method="item.summaryMethod ? item.summaryMethod : null"
      :span-method="objectSpanMethod"
      @current-change="currentChange"
      :cell-style="getCellStyle"
      :header-cell-style="{color: '#000', fontWeight: 450, padding: '2px 2px'}"
      class="custom-table"
      :preserve-expanded-content="item.preserveExpandedContent ? item.preserveExpandedContent : false"
    >
      <!-- 其他列定义 -->
      <el-table-column
        type="index"
        :index="indexMethod"
        v-if="item.showIndex ? item.showIndex : false"
        :align="item.align ? item.align : 'center'"
      />
      <el-table-column
        type="expand"
        :index="indexMethod"
        v-if="item.showExpand"
        :align="item.align ? item.align : 'center'"
      >
        <template #default="props">
          <div style="margin: -5px 5px -5px 5px;background-color: rgba(228,204,164,0.2);padding-right: 2%">
            <el-row :gutter="10">
              <template v-for="(i, index) in getfromSchema()" :key="index">
                <el-col
                    :span="i.itemWidth ? i.itemWidth * formUi.span : formUi.span"
                    style="margin-top: 2px"
                    v-if = 'formItems[props.row._dataId][i.prop].hidden !== true'
                    v-show="formItems[props.row._dataId][i.prop].cShowLocation !== '2'"
                >
                  <el-form-item
                      :prop="[props.$index, i.prop]"
                      :rules="formItems[props.row._dataId][i.prop].rules ? formItems[props.row._dataId][i.prop].rules : undefined"
                      :label="i.title"
                      :label-position="
                        i.inputtype === 'table' ? 'top' : formUi.labelPosition // table 组件,默认标题显示在top上
                      "
                      :label-width="calculatedLabelWidth()"
                  >
                    <div style="display: flex; width: 100%;" :class="{'show-right-btn': formItems[props.row._dataId][i.prop].showExBtn && editIndex === props.row._dataId}">
                      <div
                          :style="{
                            width:
                              // 显示组件尾部按钮 - table 组件不显示尾部按钮 、 非当前选中行不显示尾部按钮
                              formItems[props.row._dataId][i.prop].showExBtn &&
                              formItems[props.row._dataId][i.prop].inputtype !== 'rttable' &&
                              editIndex === props.row._dataId
                                ? (formItems[props.row._dataId][i.prop].btnWidth
                                    ? 100 -
                                      formItems[props.row._dataId][i.prop].btnWidth
                                    : 75) + '%'
                                : '100%',
                            display: 'flex',
                            alignItems: 'flex-start',
                          }"
                      >
                        <from-item
                            v-model="props.row[i.prop]"
                            :item="formItems[props.row._dataId][i.prop]"
                            :showLabel=" item.editFlag ? (editIndex !== props.row._dataId ? true : false) : 
                            editIndex !== props.row._dataId ? true : (item.editList && item.editList.length > 0 ? !item.editList?.includes(i.prop) : true) && (editIndex === props.row._dataId) "
                            :row="props.row"
                        />
                      </div>
                      
                      <!---       显示组件尾部按钮       --->
                      <template
                          v-if="formItems[props.row._dataId][i.prop].showExBtn && editIndex === props.row._dataId"
                      >
                        <rt-button
                            v-if="
                        formItems[props.row._dataId][i.prop].inputtype !==
                        'rttable'
                      "
                            :style="{
                        width:
                          (formItems[props.row._dataId][i.prop].btnWidth
                            ? formItems[props.row._dataId][i.prop].btnWidth
                            : 25) + '%',
                        height: '100%',
                      }"
                            :item="formItems[props.row._dataId][i.prop].btnItems"
                        />
                      </template>
                    </div>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="item.tableBtnTitle"
        v-if="
          item.tableBtn &&
          item.tableBtn.length > 0 &&
          item.tableBtnPosition === 'left'
        "
        :width="item.tableBtnWidth ? item.tableBtnWidth : 100"
        :fixed="
          item.fixed
            ? typeof item.fixed === 'boolean'
              ? item.fixed
                ? 'left'
                : null
              : item.fixed === '1'
                ? 'left'
                : null
            : null
        "
        :align="item.align ? item.align : 'center'"
      >
        <template #default="scope">
            <div class="methodColumn">
          <template v-for="(btn, index) in item.tableBtn" :key="index">
              <template v-if="item.tableBtnType === 'text'">
                <a @click="item.func ? item.tableClick(scope.row) : () => {}">{{
                  btn.label
                }}</a>
              </template>
              <template v-if="item.tableBtnType === 'btn'">
                <el-tooltip
                  :disabled="btn.tooltip ? false : true"
                  :content="btn.tooltip"
                  placement="top"
                  effect="light"
                >
                  <rtButton
                    @click="btn.tableClick ? btn.tableClick(scope.row) : () => {}"
                    :item="btn"
                  />
                </el-tooltip>
              </template>
              <template v-if="item.tableBtnType === 'icon'">
                <el-tooltip
                  :disabled="btn.tooltip ? false : true"
                  :content="btn.tooltip"
                  placement="top"
                  effect="light"
                >
                  <a>
                    <rtIcon :item="btn" />
                  </a>
                </el-tooltip>
              </template>
              <template v-if="index !== item.tableBtn.length - 1">
                <!-- <el-divider direction="vertical" /> -->
              </template>
          </template>
            </div>
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        @change="handleSelectionChange"
        v-if="item.showSelection ? item.showSelection : false"
        :align="item.align ? item.align : 'center'"
        width="30"
      />
      <template v-for="(i, index) in item.fromSchema" :key="index">
        <template v-if="i.isShow !== false">
          
          <el-table-column
            v-if="!i.expand"
            :prop="i.prop"
            :label="i.title"
            :fixed="i.fixed ? i.fixed : null"
            :align="item.align ? item.align : i.align ? i.align : 'center'"
            :min-width="getColumnWidth(i.title,i.prop,tableDatas,i.minWidth,i.width, i.maxWidth || item.maxWidth, i)"
            :width="getColumnWidth1(i.title,i.prop,tableDatas,i.minWidth,i.width, i.maxWidth || item.maxWidth, i, item.columnWidthByCalc)"
            :sortable="i.sortable"
          >
            <template #header="header">
              <el-text
                v-if="isrequired(i)"
                class="mx-1"
                style="margin-right: 2px"
                type="danger"
                >*</el-text
              >
              {{ header.column.label }}
            </template>
            <template #default="scope">
              <template v-if="i.inputtype === 'rtmultiple'">
                <template v-for="(p,inx) in i.multipletitle" :key="inx">
                  <el-table-column :label="p.title" :width="p.width">
                      <template #default="scope_col">
                        <rtSelectV2 :item="i" :wvalue="scope_col.row[i.prop]?scope_col.row[i.prop][inx]:null"
                        @valueChange="(r)=>{
                          const d = multipleget(scope_col.row,i,r,inx);
                          scope_col.row[i.prop] = d;
                        }" />
                      </template>
                  </el-table-column>
                </template>
              </template>
              <template v-else-if="i.slotName">
                <slot :name="`column-${i.slotName}`" v-bind="scope" />
              </template>
              <template v-else-if="item.editFlag">
                
                <el-form-item
                  :prop="[scope.$index, i.prop]"
                  :rules="i.rules ? i.rules : undefined"
                >
                  <div :style="{
                      width:
                        // 显示组件尾部按钮 - table 组件不显示尾部按钮 、 非当前选中行不显示尾部按钮
                        formItems[scope.row._dataId][i.prop].showExBtn &&
                        formItems[scope.row._dataId][i.prop].inputtype !== 'rttable' &&
                        editIndex === scope.row._dataId
                          ? (formItems[scope.row._dataId][i.prop].btnWidth
                              ? 100 -
                                formItems[scope.row._dataId][i.prop].btnWidth
                              : 75) + '%'
                          : '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                    }" >
                    <from-item
                      v-model="scope.row[i.prop]"
                      :item="formItems[scope.row._dataId][i.prop]"
                      :showLabel="formItems[scope.row._dataId][i.prop]?.disableColEdit || editIndex !== scope.row._dataId"
                      :row="scope.row"
                  />
                </div>
                  <!---       显示组件尾部按钮       --->
                  <template
                      v-if="formItems[scope.row._dataId][i.prop].showExBtn && editIndex === scope.row._dataId"
                  >
                    <rt-button
                        v-if=" formItems[scope.row._dataId][i.prop].btnItems "
                        :style="{ width:
                      (formItems[scope.row._dataId][i.prop].btnWidth
                        ? formItems[scope.row._dataId][i.prop].btnWidth
                        : 25) + '%', height: '100%', }"
                        :item="formItems[scope.row._dataId][i.prop].btnItems"
                    />
                  </template>
                </el-form-item>
              </template>
              <template v-else-if="i.formatter">
                <el-text
                    class="mx-1 rt-table-formatter-text" truncated
                    @click="checkIfTruncated($event, i.formatter(scope.row[i.prop], scope.row))"
                >
                  {{ i.formatter(scope.row[i.prop], scope.row) }}
                </el-text>
              </template>
              <template v-else>
                <el-form-item
                  :prop="[scope.$index, i.prop]"
                  :rules="i.rules ? i.rules : undefined"
                >
                  <from-item
                    v-model="scope.row[i.prop]"
                    :item="formItems[scope.row._dataId][i.prop]"
                    :showLabel="
                      formItems[scope.row._dataId][i.prop]?.disableColEdit ||
                      !(props.item.editList && props.item.editList.length > 0
                        ? props.item.editList?.includes(i.prop)
                        : false)
                    "
                    :row="scope.row"
                  />
                </el-form-item>
              </template>
            </template>
          </el-table-column>
        </template>
      </template>
      <el-table-column
        :label="item.tableBtnTitle"
        v-if="!isHidden(item) && item.tableBtnPosition !== 'left'"
        :width="item.tableBtnWidth ? item.tableBtnWidth : 100"
        :align="item.align ? item.align : 'center'"
        :fixed="
          item.fixed
            ? typeof item.fixed === 'boolean'
              ? item.fixed
                ? 'right'
                : null
              : item.fixed === '1'
                ? 'right'
                : null
            : null
        "
      >
        <template #default="scope">
              <div class="methodColumn">
          <template v-for="(btn, index) in item.tableBtn" :key="index">
            <template v-if="btn.hidden !== true">
                <template v-if="item.tableBtnType === 'text'">
                  <a @click="btn.func ? btn.tableClick(scope.row) : () => {}">{{
                    btn.label
                  }}</a>
                </template>
                <template v-if="item.tableBtnType === 'btn'">
                  <el-tooltip
                    :disabled="btn.tooltip ? false : true"
                    :content="btn.tooltip"
                    placement="top"
                    effect="light"
                  >
                    <rtButton
                      @click="
                        btn.tableClick ? btn.tableClick(scope.row) : () => {}
                      "
                      :item="btn"
                      :disabled="btn.disabled ? btn.disabled(scope.row) : false"
                      v-if="!btn.hideBtns?.(scope.row) ?? false"
                    />
                  </el-tooltip>
                </template>
                <template v-if="item.tableBtnType === 'icon'">
                  <el-tooltip
                    :disabled="btn.tooltip ? false : true"
                    :content="btn.tooltip"
                    placement="top"
                    effect="light"
                  >
                    <a
                      ><rtIcon
                        @click="
                          btn.tableClick ? btn.tableClick(scope.row) : () => {}
                        "
                        :item="btn"
                    /></a>
                  </el-tooltip>
                </template>
                <template
                  v-if="
                    index !== item.tableBtn.length - 1 &&
                    !btn.hideBtns?.(scope.row) &&
                    item.tableBtn.length > 1
                  "
                >
                  <!-- <el-divider direction="vertical" /> -->
                </template>
            </template>
          </template>
              </div>
        </template>
      </el-table-column>
    </el-table>
    <el-button
        v-if="props.item.bottomBtn && !props.item.bottomBtn.hidden"
        class="mt-4"
        :type="props.item.bottomBtn.type ? props.item.bottomBtn.type : 'info'"
        :plain="props.item.bottomBtn.plain"
        :style="props.item.bottomBtn.style ? props.item.bottomBtn.style : {width: '100%'}"
        @click="props.item.bottomBtn.click"
    >
      {{props.item.bottomBtn.label}}
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import Validator from "async-validator";
import { ref, reactive, watch, onMounted, handleError } from "vue";
import { ElTable } from "element-plus";
import {checkIfTruncated, updateLabelWidth} from "@/utils/common";

// 定义要触发的事件
const emits = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
  (e: "selection-change", rows: any[]): void;
  (e: "status-change", row: any): void;
  (e: "rowClick", row: any): void;
}>();

const expandFromItem = ref<Record<string, any>>({});
// 编辑行id
const editIndex = ref("");
const props = defineProps({
  modelValue: {
    type: [Array<any>],
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
});

const maxLabelWidth = computed(() => updateLabelWidth()); // 默认值

// 计算label宽度
const calculatedLabelWidth = () => {
  let originalWidth;
  if (formUi.labelWidth && formUi.labelWidth !== 'auto') {
    originalWidth = formUi.labelWidth.includes('px')
        ? formUi.labelWidth
        : `${formUi.labelWidth}px`;
  } else {
    originalWidth = maxLabelWidth.value;
  }
  const widthValue = parseFloat(originalWidth);
  const finalValue = Math.max( widthValue, 0);
  return `${finalValue}px`;
};


/**
 * 单元格样式
 * @param row
 */
const getCellStyle = (row: Record<string, any>) => {
  if(!props.item.editFlag) {
    return {
      padding: '1px 1px'
    }
  }else {
    return {
      padding: '2px'
    }
  }
};

const indexMethod = (index: number) => {
  return index !== undefined ? index + 1 : 0;
};

/**
 *  表单组件,用来写table表格的验证等方法的引用
 */
const tableDatas = ref<any[]>([]);
const schamaconf = ref<{ [key: string]: any }>({});
const tableRef = ref();
const formItems = ref<{ [key: string]: any }>({});
creatSchama();
const tableFormfef = ref<InstanceType<typeof ElTable>>();
watch(
  [() => props.item],
  ([newitemValue]) => {
    creatSchama();
    formItems.value = {};
    tableDatas.value?.forEach((data) => {
      formItems.value[data._dataId] = creatItem(schamaconf.value);
    });
  },
  { deep: true }
);
watch([() => props.modelValue], ([newModelValue]) => {
  tableDatas.value = [];
  formItems.value = {};
  tableDatas.value = newModelValue ? newModelValue : [];
  tableDatas.value?.forEach((data) => {
    // 初始化行数字Id
    data._dataId = getuuid();
    formItems.value[data._dataId] = creatItem(schamaconf.value);
  });
});
watch(
  () => props.parentFromUi,
  (newFromUi) => {
    initUI();
  }
);

function multipleget(row,item,newdata,index){
  let d = row[item.prop];
  let nd = '';
  item.multipletitle.forEach((p,i)=>{
    if(i === index){
      nd += newdata;
    }else{
      if(d && d[i]){
        nd += d[i];
      }else{
        nd += item.nullValue;
      }
    }
  })
  return nd;
}
function setFormValue(data: any) {
  tableDatas.value = [];
  formItems.value = {};
  tableDatas.value = data ? data : [];
  tableDatas.value?.forEach((data) => {
    // 初始化行数字Id
    data._dataId = getuuid();
    formItems.value[data._dataId] = creatItem(schamaconf.value);
  });
}

function creatSchama() {
  if (props.item.fromSchema && props.item.fromSchema.length > 0) {
    props.item.fromSchema.forEach((item: any) => {
      schamaconf.value[item.prop] = item;
    });
  }
}
function creatItem(d: any) {
  let sc: any = JSON.parse(JSON.stringify(schamaconf.value));
  // 将方法回填到item中
  Object.keys(schamaconf.value).forEach((k: any) => {
    Object.keys(schamaconf.value[k]).forEach((k2: any) => {
      if(k2 === "btnItems"){
        Object.keys(schamaconf.value[k]['btnItems']).forEach((k3: any) => {
          if  (typeof schamaconf.value[k]['btnItems'][k3] === "function") {
            sc[k]['btnItems'][k3] = schamaconf.value[k]['btnItems'][k3];
          }
        });
        if(!props.item.editFlag){
          schamaconf.value[k]['btnItems']['disabled'] = true;
        }
      }else if (typeof schamaconf.value[k][k2] === "function") {
        sc[k][k2] = schamaconf.value[k][k2];
      }
    });
  });
  return sc;
}
function handleSelectionChange(selectedRows: any[]) {
  emits("selection-change", selectedRows);
}
function rowClick(row: any, _column: any, _event: Event) {
  // if (props.item.editFlag && props.item.editFlag === true) {
  //   if (tableDatas.value) {
  //     editIndex.value = row._dataId;
  //   }
  // }
  if (tableDatas.value) {
      editIndex.value = row._dataId;
    }
  emits("rowClick", row);
}

function rowDblclick(row: any) {
  props.item.rowDbClickFun?.(row);
}

// 解决扩展页,由于编辑之后触发数据更新,页面重绘而折叠全部关闭的问题
const expandRowKeys = ref([]);
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
function expandChange(_val: any, expandedRows: any) {
  expandRowKeys.value = [];
  expandFromItem.value = {};
  expandedRows.forEach((e: any) => {
    expandRowKeys.value.push(e._dataId);
  });
}

// 判断控制域按钮,是否隐藏
function isHidden(item: any) {
  let r = true;

  if (!item.tableBtn || item.tableBtn.length === 0) {
    return true;
  }

  for (const key in item.tableBtn) {
    r = r && item.tableBtn[key].hidden;
  }
  return r;
}

function getfromSchema() {
  const expands = props.item.fromSchema.filter((s: any) => s.expand === true && s.isShow !== false );
  // console.log(expands);
  return expands;
}
const formUi = reactive<Record<string, any>>({});

/**
 *  样式初始化,对于未设置的参数进行初始化
 * */
function initUI() {
  if (props.item.fromUi) {
    Object.keys(props.item.fromUi).forEach((key) => {
      if (key === "cols") {
        if (props.item.fromUi[key]) {
          formUi["span"] = 24 / props.item.fromUi[key];
        } else {
          formUi["span"] = 8;
        }
      } else {
        formUi[key] = props.item.fromUi[key];
      }
    });
  } else {
    Object.assign(formUi, props.parentFromUi);
  }
  if (!formUi["span"]) {
    formUi["span"] = 8;
  }
  if (!formUi["itemWidth"]) {
    //默认item宽度为自动
    formUi["itemWidth"] = "auto";
  }
  if (!formUi["labelPosition"]) {
    formUi["labelPosition"] = "right";
  }
  if (!formUi["size"]) {
    formUi["size"] = "default";
  }
}

/**
 * 表格数据验证函数
 * 该函数用于验证表格中的数据是否符合规定的规则
 * 主要通过遍历表格数据和规则，对每行数据进行验证
 *
 * @returns {Promise[]} 返回一个包含每个行数据验证结果的Promise数组
 */
function validate() {
  // 存储每个行数据验证结果的数组
  let proList = [];

  // 检查是否有表格数据需要验证
  if (tableDatas.value?.length > 0) {

    // 遍历表格数据，对每行数据进行验证
    for (const rowNum in tableDatas.value) {
      // 当前行的数据
      const rowData = tableDatas.value[rowNum];
      // 存储验证规则的对象
      let rules = <any>{};
      const itemSchama = formItems.value[rowData._dataId];
      for (const schama in itemSchama) {
        // 如果当前列有验证规则，则将其添加到规则对象中
        if (itemSchama[schama].rules) {
          let rul = itemSchama[schama].rules;
          if (
            itemSchama[schama].inputtype === "rtnumber" ||
            (itemSchama[schama].inputtype === "rtinput" &&
              itemSchama[schama].type === 'number')
          ) {
            if (rul && rul.length > 0) {
              rul.forEach((item: any) => {
                item.type = "number";
              });
            }
          }
          if(itemSchama[schama].inputtype === "rtcascader"){
            if (rul && rul.length > 0) {
              rul.forEach((item: any) => {
                item.type = "array";
              });
            }
          }
          rules[itemSchama[schama].prop] = rul;
        }
      }
      // 创建验证器实例
      const validator = new Validator(rules);

      // 创建一个新的Promise用于处理当前行数据的验证
      const p = new Promise((resolve) => {
        // 执行验证操作
        validator.validate(rowData, (data: any) => {
          // 根据验证结果进行处理
          if (data) {
            // 输出错误信息 进行错误信息内容展示操作
            expandRowKeys.value.push(rowData._dataId);

            setTimeout(() => {
              tabValidate();
            }, 200);
            resolve(data);
          } else {
            // 验证通过
            resolve(true);
          }
        });
      });

      // 将当前行数据的验证结果Promise添加到结果数组中
      proList.push(p);
    }
  }

  // 返回所有行数据验证结果的Promise数组
  return proList;
}

const validateFlag = ref(false);
function tabValidate() {
  if (validateFlag.value) {
    return;
  }
  validateFlag.value = true;
  setTimeout(() => {
    const t = tableFormfef.value?.validate((valid: boolean, fields) => {
      if (valid) {
        console.log("tablesubmit!");
      } else {
        console.log("tableerror submit!", fields);
      }
    });
    t.then(() => {
      validateFlag.value = false;
    });
  }, 200);
}

onMounted(() => {
  tableDatas.value = props.modelValue ? props.modelValue : [];
  tableDatas.value?.forEach((data) => {
    if (!data) {
      console.error("Invalid data item:", data);
      return;
    }
    // 初始化行数字Id
    data._dataId = getuuid();
    formItems.value[data._dataId] = creatItem(schamaconf.value);
  });
  if (props.item.fromSchema) {
    initUI();
  }
});

async function tableExvalidate() {
  tabValidate();
  const pro = validate();
  let res: any[] = [];
  if (pro) {
    res = await Promise.all(pro);
  }
  let reb = true;
  if (res) {
    res.forEach((item) => {
      if (item && item.length > 0) {
        reb = reb && false;
      }
    });
  }
  return reb;
}

// 预留,解决将来处理codelist数据
function getValue(row: any, item: any) {
  if (item.inputtype === "rtinput") {
    return row[item.prop];
  }
}

function addRow() {
  const rowId = getuuid();
  tableDatas.value?.push({ _dataId: rowId });
  formItems.value[rowId] = creatItem(schamaconf.value);
  editIndex.value = rowId;
}

function delRow(editIndex: any) {
  for (let i = tableDatas.value.length - 1; i >= 0; i--) {
    const element = tableDatas.value[i];
    if (element["_dataId"] == editIndex) {
      tableDatas.value.splice(i, 1);
    }
  }
}

function addRowByData(data: any) {
  const rowId = getuuid();
  tableDatas.value?.push({ _dataId: rowId, ...data });
  formItems.value[rowId] = creatItem(schamaconf.value);
  editIndex.value = rowId;
}

function spliceTableData(index: number, delCount: number, list: any[]) {
  const addNum = !!list ? list.length : 0;
  if(addNum > 0) {
    const keys = Object.keys(formItems.value);
    for (let i = 0; i < addNum; i ++) {
      const rowData = list[i];
      const nextIdx = index + i;
      const delNum = i < delCount ? 1 : 0;
      if(rowData['_dataId'] && keys.includes(rowData['_dataId'])) {
        // 行id已存在直接替换数据
        tableDatas.value?.splice(nextIdx, delNum, rowData);
      } else {
        const rowId = getuuid();
        rowData['_dataId'] = rowId;
        tableDatas.value?.splice(nextIdx, delNum, rowData);
        formItems.value[rowId] = creatItem(schamaconf.value);
      }
    }
  }
  if(delCount > addNum) {
    tableDatas.value?.splice(index + addNum, delCount - addNum);
  }
  return tableDatas.value;
}

function getSelectRow() {
  const sele = tableDatas.value?.find((item) => {
    if (item._dataId === editIndex.value) {
      return item;
    }
  });
  return sele;
}
function handleStatusChange(row: any) {
  emits("status-change", row); // 触发事件并传递行对象
}

function setFormSchema(rowId: string, props: any, schama: any, value: any) {
  formItems.value[rowId][props][schama] = value;
}
function setValueByRowKey(props: string, rowId: any, value: any) {
  tableDatas.value?.forEach((data) => {
    if (data._dataId === rowId) {
      data[props] = value;
    }
  });
}
function setRowFieldProp(
  rowId: string,
  field: string,
  prop: string,
  value: any
) {
  if (formItems.value[rowId] && formItems.value[rowId][field]) {
    // 使用 Vue.set 确保响应式更新
    formItems.value[rowId][field] = {
      ...formItems.value[rowId][field],
      [prop]: value,
    };
  } else {
    console.warn(`Field ${field} or row ${rowId} not found.`);
  }
}
function getRowById(rowId: any) {
  return tableDatas.value?.find((item) => {
    if (item._dataId === rowId) {
      return item;
    }
  });
}
// function getItemsRowId(rowId: any){
//   return formItems.value[rowId]
// }
function getselectionData() {
  if (props.item.showSelection) {
    return tableRef.value?.getSelectionRows();
  } else {
    return null;
  }
}

function getColumnWidth(label: string, prop: any, tableData: any[], itemMinWidth: number, itemWidth: number, itemMaxWidth: number = 800, i:any) {
  //label表头名称
  //prop对应的内容
  //tableData表格数据
  const width = itemWidth || 0 // 列表属性宽度
  const minWidth = itemMinWidth || 80 // 最小宽度
  const padding = 4 // 列内边距
  let arr = tableData.map(item => i.formatter ? i.formatter(item[prop], item) : item[prop])
  arr.push(label)//拼接内容和表头数据
  const contentWidths = arr.map(item => {
    const value = item ? String(item) : ''
    const textWidth = getTextWidth(value)
    return textWidth + padding
  })
  if(itemWidth > 0) {
    // 如果配置了列宽度且内容长度超出了配置的宽度就用配置的数据
    const width2 = Math.max(...contentWidths)
    return width2 > itemWidth ? itemWidth : width2;
  }
  const maxWidth = Math.max(...contentWidths) > itemMaxWidth ? itemMaxWidth : Math.max(...contentWidths)
  return Math.max(minWidth, maxWidth, width)
}

function getColumnWidth1(label: string, prop: any, tableData: any[], itemMinWidth: number, itemWidth: number, itemMaxWidth: number, iProp: any, columnWidthByCalc?: any) {
  //label表头名称
  //prop对应的内容
  //tableData表格数据
  const width = itemWidth || 0 // 列表属性宽度
  const minWidth = itemMinWidth || 0 // 最小宽度
  const padding = 4 // 列内边距
  let arr = tableData.map(item => iProp.formatter ? iProp.formatter(item[prop], item) : item[prop])
  arr.push(label)//拼接内容和表头数据
  let contentWidths = arr.map(item => {
    const value = item ? String(item) : ''
    const textWidth = getTextWidth(value)
    return textWidth + padding
  })
  const lengthNumArray = [];
  let lengthNumWidth = 0;
  if(iProp.lengthNum && iProp.lengthNum > 0) {
    for(let i = 0; i < iProp.lengthNum; i ++) {
      iProp.lengthIsNumber ? lengthNumArray.push('8') : lengthNumArray.push('汉');
    }
    lengthNumWidth = getTextWidth(lengthNumArray.toString().replaceAll(',',''), label.length === iProp.lengthNum || tableData.length < 1);
  }

  if(columnWidthByCalc) {
    if(lengthNumWidth > 0) {
      contentWidths = [lengthNumWidth + padding]
    } 
  } else if(iProp.lengthNum) {
    contentWidths = [getTextWidth(lengthNumArray.toString().replaceAll(',',''), label.length === iProp.lengthNum || tableData.length < 1)]
  }
  {/* if(itemWidth > 0) {
    // 如果配置了列宽度且内容长度超出了配置的宽度就用配置的数据
    const width2 = Math.max(...contentWidths)
    return width2 > itemWidth ? itemWidth : width2;
  } */}
  const maxWidth = Math.max(...contentWidths) > itemMaxWidth ? itemMaxWidth : Math.max(...contentWidths)
  return !itemMinWidth && !itemWidth && !itemMaxWidth && !iProp.lengthNum && !columnWidthByCalc ? "auto" : Math.max(minWidth, maxWidth, width)
}

function getTextWidth(text:string, isFix?: boolean) {
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.position = 'absolute'
  span.style.top = '-9999px'
  span.style.whiteSpace = 'nowrap'
  span.style.fontSize = 'var(--rt-form-content-font-size)'
  span.style.display = 'inline-block'
  span.innerText = text
  document.body.appendChild(span)
  /* const width = span.offsetWidth + 40 */
  const width = isFix ? span.offsetWidth + 9 : span.offsetWidth + 7
  document.body.removeChild(span)
  return width
}

const objectSpanMethod = (object: any) => {
  if(props.item && props.item.spanMethod && typeof props.item.spanMethod === 'function') {
    const res = props.item.spanMethod(object, expandRowKeys.value)
    return res
  }
  return { rowspan: 1, colspan: 1 }
};
const currentChange = (currentRow: any, oldCurrentRow: any) => {
  if(props.item && props.item.currentChange && typeof props.item.currentChange === 'function') {
    return props.item.currentChange(currentRow, oldCurrentRow)
  }
}
/**
 * 获取指定行所有列组件的ref
 * @param id 行id
 */
function getRowAllItemRefById(id: string) {
  return formItems.value[id];
}

function clearSelection() {
  tableRef.value?.clearSelection();
}

function toggleRowSelection(row: any, selected: boolean) {
  tableRef.value?.toggleRowSelection(row, selected);
}
function getTableValues() { 
  return tableDatas.value;
}

defineExpose({
  tableExvalidate,
  addRow,
  delRow,
  addRowByData,
  setFormValue,
  getSelectRow,
  setFormSchema,
  setValueByRowKey,
  getRowById,
  getselectionData,
  getRowAllItemRefById,
  clearSelection,
  toggleRowSelection,
  setRowFieldProp,
  spliceTableData,
  getTableValues,
  // getItemsRowId
});
function isrequired(i: any) {
  if (i.rules) {
    for (let j = 0; j < i.rules.length; j++) {
      if (i.rules[j].required) {
        return true;
      }
    }
  }
  return false;
}
</script>
<style lang="scss" scoped>
@import "@/styles/custom-index";
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}

:deep(.el-table .cell) {
  /* white-space: nowrap; */
  line-height: 16px;
  padding: 0 2px;
}

:deep(.el-table td.el-table__cell div.cell) {
  white-space: normal;
}
:deep(.el-form-item--default .el-form-item__content) {
  line-height: 18px;
  justify-content: center;
  align-items: center;
}
:deep(.el-table__empty-block){
  min-height: 30px !important;
}
:deep(.el-table__empty-text){
  line-height: 30px !important;
}
/* 表头居中对齐 */
:deep(.el-table th.is-left div.cell) {
  text-align: center;
}
.methodColumn {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
:deep(.methodColumn .el-button+.el-button) {
  margin-left: 0;
}
:deep(.el-table__body tr.hover-row>td.el-table__cell),:deep(.el-table__body tr.el-table__row--striped.hover-row>td.el-table__cell) {
  background-color: #e1e8f2;
}
</style>
