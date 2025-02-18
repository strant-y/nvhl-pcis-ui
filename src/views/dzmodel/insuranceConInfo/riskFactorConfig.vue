<template>
  <div>
    <el-row>
      <el-col :span="21"> </el-col>
      <el-col :span="3">
        <el-button @click="addTitle" type="primary">新增标题</el-button>
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
      <el-col :span="6">
        <VueDraggable
          v-model="colList"
          :animation="150"
          target=".el-table"
          handle=".handle"
        >
          <table class="col_table">
            <thead>
              <th style="width: 40px">排序</th>
              <th>标题</th>
              <th style="width: 80px">宽度</th>
              <th style="width: 40px">操作</th>
            </thead>
            <tbody class="el-table">
              <tr
                :class="[
                  'handle cursor-move',
                  'col_title',
                  col.id === selectKey ? 'selected' : '',
                ]"
                v-for="col in colList"
                :key="col.id"
                @click="select(col)"
              >
                <td :class="'handle cursor-move'" style="text-align: center">
                  <rtIcon
                    :item="{
                      icon: 'Rank',
                    }"
                  />
                </td>
                <template v-if="col.id !== selectKey">
                  <td>{{ col.title }}</td>
                  <td>{{ col.width }}</td>
                  <!-- <td>{{ "" }}</td> -->
                </template>
                <template v-else>
                  <td>
                    <el-input
                      v-model:="col.title"
                      placeholder="请输入标题内容"
                    />
                  </td>
                  <td>
                    <el-input-number
                      v-model:="col.width"
                      :controls="false"
                      placeholder="输入宽度"
                    />
                  </td>
                </template>
                <td>
                  <rtButton
                    :item="{
                      type: 'danger',
                      tooltip: '删除',
                      icon: 'Delete',
                      link: true,
                      func:()=>{
                        const i = colList.findIndex(  e => e.id === col.id);
                        colList.splice(i, 1);
                      }
                    }"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </VueDraggable>
        <!-- <div :class="['col_title', item.id === selectKey ? 'selected' : '' ]" @click="select(item)" v-for="(item, i) in colList" :key="i">
                    {{ item }}
                    <template v-if="item.id !== selectKey">
                        {{ item.title }}
                    </template>
                    <template v-else>
                        <el-input style="width: 60%" v-model:="item.title" placeholder="请输入标题内容" />
                    </template>
                </div> -->
      </el-col>
      <el-col :span="18">
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
import { getTRFactorList, querySelectorList, saveTRFactorList } from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { iconPropType } from "element-plus/es/utils";
import { styleType } from "element-plus/es/components/table-v2/src/common";
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

const selectKey = ref<String>("");

const factorList = ref<any>([]);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["c_porp_type","c_porp_required"],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        tableBtnWidth: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        tableBtnWidth: 40,
        func: (v: any) => {
          getFactorConf();
        },
      },
      {
        prop: "c_factor_inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "c_porp_required",
        inputtype: "rtswitch",
        title: "是否必填",
        keymap:{
            y: "1",
            n: "0",
        },
        func: (v: any) => {
          getFactorConf();
        },
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
        prop: "c_factor_title",
        inputtype: "rtinput",
        title: "要素名称",
      },
    ],
  })
);
function select(item: any) {
  selectKey.value = item.id;
  // 绘制新的list给页面渲染
  const newSelectl: any[] = [];
  item.selectFactorList?.forEach((element: any) => {
    const se = factorList.value?.find(
      (e: any) => element.c_pk_id === e.c_pk_id
    );
    se.isChecked = element.isChecked;
    se.c_porp_type = element.c_porp_type;
    se.c_porp_required = element.c_porp_required;
    newSelectl.push(se);
  });
  factorList.value.forEach((element: any) => {
    const se = item.selectFactorList?.find(
      (e: any) => element.c_pk_id === e.c_pk_id
    );
    if (!se) {
      element.isChecked = "0";
      element.c_porp_type = null;
      element.c_porp_required = '0';
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
        }));
      e.selectFactorList = selectData1;
    }
  });
}
function addTitle() {
  colList.value.push({
    title: "",
    width: null,
    id: getuuid(),
  });
}
function saveTitleFactor(){
    console.log(colList.value);
    saveTRFactorList({
        colInfo:colList.value,
        riskNo:props.data.riskObj.cRiskNo,
        termNo:props.data.termObj.cCvrgNo
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
    componentTab: "cvrg",
    riskNo:props.data.riskObj.cRiskNo,
    termNo:props.data.termObj.cCvrgNo
  };
  getTRFactorList(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      colList.value = data.data;
      // tableRef.value?.setFormValue(data.data);
    } else {
      ElMessage.error(msg);
    }
  });
  querySelectorList(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      factorList.value = data.data;
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
