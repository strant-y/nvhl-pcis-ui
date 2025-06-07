<template>
  <div>
    <el-row>
      <el-col :span="24">
        <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <div>
          <el-text size="large">标题信息</el-text>
        </div>
      </el-col>
      <el-col :span="16"> </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="3">
        <table class="col_table">
          <thead>
            <th>标题</th>
          </thead>
          <tbody class="el-table">
            <tr
              :class="['col_title', col.id === selectKey ? 'selected' : '']"
              v-for="col in colList"
              :key="col.id"
              @click="select(col)"
            >
              <td style="text-align: center">{{ col.title }}</td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="21">
        <rt-mytable
          :tableConfig="tableconfig"
          ref="tableRef"
          @indexupdate="getFactorConf()"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="21"> </el-col>
      <el-col :span="3">
        <el-button @click="saveTitleFactor()" type="primary">保存</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { inputtype, showtype } from "@/utils/utilKey";
import { VueDraggable } from "vue-draggable-plus";
import {
  getTRFactorList,
  querySelectorList,
  saveTRFactorList,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { iconPropType } from "element-plus/es/utils";
import { styleType } from "element-plus/es/components/table-v2/src/common";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
const emits = defineEmits(["handleClose"]);

// 标题列信息
const colList = ref<any>([]);
// 缓存条款信息
const cTermNo = props.data.termObj.cTermNo;

const selectKey = ref<String>("");

const factorList = ref<any>([]);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "条款基本信息",
    fromSchema: [
      {
        prop: "cRiskNo",
        inputtype: "rtselect",
        title: "责任选择",
        typeCode: "term_risk_list",
        rules: [getRules("required", {})],
        codeParam: {
          cTermNo: cTermNo,
        },
        func: () => {
          getTitle();
        },
      },
      {
        prop: "cGroupId",
        inputtype: "rtselect",
        title: "分组信息",
        typeCode: "term_group_rel_list",
        rules: [getRules("required", {})],
        codeParam: {
          cTermNo: cTermNo,
        },
        func: () => {
          getTitle();
        },
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
      showMessage: "0",
    }),
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["c_porp_type", "c_porp_required","c_porp_disabled"],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        width: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 40,
        func: (v: any) => {
          getFactorConf();
        },
      },
      {
        prop: "c_factor_title",
        inputtype: "rtinput",
        title: "要素名称",
      },
      {
        prop: "c_factor_inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "c_porp_type",
        inputtype: "rtselect",
        title: "显示类型",
        loadData: showtype,
        func: (v: any) => {
          getFactorConf();
        },
      },
      {
        prop: "c_factor_prop",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "c_porp_required",
        inputtype: "rtswitch",
        title: "是否必填",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {
          getFactorConf();
        },
      },
      {
        prop: "c_porp_disabled",
        inputtype: "rtswitch",
        title: "是否只读",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {
          getFactorConf();
        },
      },
    ],
  })
);

function getTitle() {
  const value = freeEditRef.value?.validate();
  value.then((res) => {
    if (res) {
      const param = freeEditRef.value?.getFromValue();
      getTRFactorList(param).then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          colList.value = data.data;
        } else {
          ElMessage.error(msg);
        }
        tableRef.value?.setFormValue([]);
      });
    }
  });
}
function select(item: any) {
  selectKey.value = item.id;
  // 绘制新的list给页面渲染
  const newSelectl: any[] = [];
  item.selectFactorList?.forEach((element: any) => {
    const se = factorList.value?.find(
      (e: any) => element.c_pk_id === e.c_pk_id
    );
    if (se) {
      se.isChecked = element.isChecked;
      se.c_porp_type = element.c_porp_type;
      se.c_porp_required = element.c_porp_required;
      se.c_porp_disabled = element.c_porp_disabled;
      newSelectl.push(se);
    }
  });
  factorList.value.forEach((element: any) => {
    const se = item.selectFactorList?.find(
      (e: any) => element.c_pk_id === e.c_pk_id
    );
    if (!se) {
      element.isChecked = "0";
      element.c_porp_type = null;
      element.c_porp_required = "0";
      element.c_porp_disabled = '0';
      newSelectl.push(element);
    }
  });
  tableRef.value?.setFormValue(newSelectl);
}

function getFactorConf() {
  colList.value.forEach((e: any) => {
    if (e.id === selectKey.value) {
      const selectData = tableRef.value?.getFromValue();
      const selectData1 = selectData
        .filter((element: any) => element.isChecked === "1")
        ?.map((element: any) => ({
          c_pk_id: element.c_pk_id,
          isChecked: element.isChecked,
          c_porp_type: element.c_porp_type,
          c_porp_required: element.c_porp_required,
          c_porp_disabled: element.c_porp_disabled,
        }));
      e.selectFactorList = selectData1;
    }
  });
}
function saveTitleFactor() {
  const fromValue = freeEditRef.value?.getFromValue();

  const param = {
    colInfo: colList.value,
    ...fromValue,
  };
  saveTRFactorList({
    colInfo: colList.value,
    ...fromValue,
  }).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(msg);
    }
  });
}
onMounted(() => {
  const param = {
    componentTab: "TermRisktgt",
    selectall:'1'
  };
  // 一次性初始化所有险别要素信息,不用多次获取
  querySelectorList(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      factorList.value = data;
      // tableRef.value?.setFormValue(data.data);
    } else {
      ElMessage.error(msg);
    }
  });
});
</script>

<style scoped>
.col_title {
  width: 100%;
  height: 30px;
}
.col_title:hover {
  background-color: #ffbc57;
  cursor: pointer;
}
.col_title.selected {
  background-color: #3affff;
  font-weight: bold;
}
.col_table {
  width: 100%;
  border-collapse: collapse; /* 合并边框 */
}
.col_table th {
  text-align: center;
}
.col_table td {
  border: 1px solid #e2e2e2; /* 设置边框样式 */
}
.el-input-number {
  width: 100% !important;
}
</style>
