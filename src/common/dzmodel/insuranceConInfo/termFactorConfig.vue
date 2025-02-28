<template>
  <div>
    <el-row>
      <el-col :span="24">
        <rt-mytable
          :tableConfig="tableconfig"
          ref="tableRef"
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
import { getGroupInfo, getTermFactorInfo, getTRFactorList, querySelectorList, saveGroupInfo, saveTermFactorInfo, saveTRFactorList } from "@/api/prod";
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

const factorList = ref<any>([]);

onMounted(() => {
  getDictFormData();
});

function getDictFormData(){
  getTermFactorInfo({termNo:props.data.data.cTermNo,tabKey:'cvrg'}).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      if(data){
        data.forEach((e: any) =>{
          if(e.cPkId){
            e.isChecked = '1';
          }
        })
      }
      tableRef.value?.setFormValue(data);
    } else {
        ElMessage.error(msg);
    }
  })
}

function savegroupinfo(){
  const select = tableRef.value?.getFromValue();
  let selectList = select?.filter((node: any) => node.isChecked === "1");
  saveTermFactorInfo({
    termNo:props.data.data.cTermNo,
    selectList: selectList,
  }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      ElMessage.success("保存成功");
      getDictFormData();
    } else {
        ElMessage.error(msg);
    }
  });
}

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cPorpRequired"],
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
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "cPorpRequired",
        inputtype: "rtswitch",
        title: "是否必填",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {
        },
      },
      // {
      //   prop: "cPorpType",
      //   inputtype: "rtselect",
      //   title: "显示类型",
      //   loadData: showtype,
      //   func: (v: any) => {
      //   },
      // },
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "要素名称",
      },
    ],
  })
);

</script>

<style scoped>

</style>
