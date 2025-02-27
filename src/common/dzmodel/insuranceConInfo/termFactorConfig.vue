<template>
  <div>
    <el-row>
      <el-col :span="24">
        <rt-mytable
          :tableConfig="tableconfig"
          ref="tableRef"
          @indexupdate="getFactorConf()"
        />
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
import { inputtype, showtype } from "@/utils/utilKey";
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
  saveGroupInfo({groupinfo:groupData.value,termNo:props.data.data.cTermNo}).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
        ElMessage.success("保存成功");
    } else {
        ElMessage.error(msg);
    }
  })
}

onMounted(() => {
  getGroupInfo({termNo:props.data.data.cTermNo}).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      groupData.value = data;
    } else {
        ElMessage.error(msg);
    }
    groupRef.value?.setFormValue(groupData.value);
  })
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["c_porp_type", "c_porp_required"],
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
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {
        },
      },
      {
        prop: "c_porp_type",
        inputtype: "rtselect",
        title: "显示类型",
        loadData: showtype,
        func: (v: any) => {
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

</script>

<style scoped>

</style>
