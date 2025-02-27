<template>
  <div>
    <el-row>
      <el-col :span="14">
        <rt-mytable
        :tableConfig="groupconfig"
        ref="groupRef"
        @indexupdate="gruopUpdate"
        @rowselect="groupSelect"
      />
      </el-col>
      <el-col :span="10">
        <rt-mytable
        :tableConfig="titleconfig"
        ref="titleRef"
        @indexupdate="titleUpdate"
      />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="21"> </el-col>
      <el-col :span="3">
          <el-button @click="savegroupinfo" type="primary">保存</el-button>
      </el-col>
  </el-row>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { VueDraggable } from "vue-draggable-plus";
import { getGroupInfo, getTRFactorList, querySelectorList, saveGroupInfo, saveTRFactorList } from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { iconPropType } from "element-plus/es/utils";
import { styleType } from "element-plus/es/components/table-v2/src/common";
import { createFreeButtonBase } from "@/shared/button-config";
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

const groupRef = ref<MyTableMethod | null>(null);
const titleRef = ref<MyTableMethod | null>(null);

const groupData = ref<any []>([]);

function gruopUpdate(){
  const groupdata = groupRef.value?.getFromValue();
  groupData.value = groupdata;
}

function titleUpdate(){
  const titledata = titleRef.value?.getFromValue();
  const sel = groupRef.value?.getSelectRow();
  setTimeout(() => {
    if(sel){
      groupData.value.forEach(e => {
      if(e.cPkId === sel.cPkId){
        e.titledatas = titledata;
      }
    });
    }else{
      titleRef.value?.setFormValue([]);
    }
  }, 10);
  
  
}

function groupSelect(row: any){
  if(row.titledatas){
    titleRef.value?.setFormValue(row.titledatas);
  }else{
    titleRef.value?.setFormValue([]);
  }
}

function savegroupinfo(){
  saveGroupInfo({groupinfo:groupData.value,termNo:props.data.data.cTermNo}).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
        ElMessage.success("保存成功");
    } else {
        ElMessage.error(msg);
    }
  })
}

onMounted(() => {
  getGroupInfo({termNo:props.data.data.cTermNo}).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      groupData.value = data;
    } else {
        ElMessage.error(msg);
    }
    groupRef.value?.setFormValue(groupData.value);
  })
});

const groupconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns:[
      createFreeButtonBase({
        type: "primary",
        icon: "Plus",
        label: "新增分组",
        func: (v: any) => {
          groupRef.value?.addRow({cPkId:getuuid(),cGroupType:'grid'});
          gruopUpdate();
        },
      })
    ],
    tableBtnType: "btn",
    tableBtnWidth: 40,
    tableBtnPosition: "right",
    tableBtn:[
      createFreeButtonBase({
        icon: "Delete",
        link: true,
        tableClick: (v: any) => {
          groupRef.value?.removeRow(v._dataId);
          titleUpdate();
        },
      })
    ],
    editFlag: true,
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
        prop: "cGroupType",
        inputtype: "rtselect",
        title: "分组类型",
        width:80,
        loadData:[
          {
            label: "表格",
            value: "grid",
          },
          {
            label: "表单",
            value: "free",
          },
        ],
        func: (v: any) => {
          gruopUpdate();
        },
      },
      {
        prop: "cGroupName",
        inputtype: "rtinput",
        title: "分组名",
        width:80,
        func: (v: any) => {
          gruopUpdate();
        },
      },
      {
        prop: "cGroupTitle",
        inputtype: "rtinput",
        title: "分组标题",
        func: (v: any) => {
          gruopUpdate();
        },
      },
    ],
  })
);

const titleconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns:[
      createFreeButtonBase({
        type: "primary",
        icon: "Plus",
        label: "新增标题信息",
        func: (v: any) => {
          const r = groupRef.value?.getSelectRow();
          if (!r) {
            ElMessage.error("请选择要编辑的分组数据!");
            return;
          }
          titleRef.value?.addRow({cPkId:getuuid()});
          titleUpdate();
        },
      })
    ],
    editFlag: true,
    tableBtnType: "btn",
    tableBtnWidth: 40,
    tableBtnPosition: "right",
    tableBtn:[
      createFreeButtonBase({
        icon: "Delete",
        link: true,
        tableClick: (v: any) => {
          titleRef.value?.removeRow(v._dataId);
        },
      })
    ],
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
        prop: "cColTitle",
        inputtype: "rtinput",
        title: "标题",
        func: (v: any) => {
          titleUpdate();
        },
      },
      {
        prop: "cColWidth",
        inputtype: "rtnumber",
        title: "宽度",
        func: (v: any) => {
          titleUpdate();
        },
      },
    ],
  })
);

</script>

<style scoped>

</style>
