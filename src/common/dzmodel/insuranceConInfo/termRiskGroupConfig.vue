<template>
  <div>
    <el-row>
      <el-col :span="14">
        <rt-mytable
          :tableConfig="groupconfig"
          ref="groupRef"
          @rowselect="groupSelect"
        />
      </el-col>
      <el-col :span="10">
        <rt-mytable :tableConfig="titleconfig" ref="titleRef" />
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
import {
  getGroupInfo,
  getTitleInfoByGroup,
  getTRFactorList,
  querySelectorList,
  saveGroupInfo,
  saveTermColByTerm,
  saveTRFactorList,
} from "@/api/prod";
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

const groupData = ref<any[]>([]);

function groupSelect(row: any) {
  getTitleInfoByGroup({ groupId: row.cPkId }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      titleRef.value?.setFormValue(data);
    } else {
      ElMessage.error(msg);
    }
  });
}

function savegroupinfo() {
  const rowall = groupRef.value?.getFromValue();
  const selectata = rowall.filter((item: any) => item.isChecked === '1');
  
  saveTermColByTerm({ cTermNo: props.data.data.cTermNo, selectata: selectata }).then(
    (res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        ElMessage.success("保存成功");
        selectData();
      } else {
        ElMessage.error(msg);
      }
    }
  );
}

onMounted(() => {
  selectData();
});

function selectData(){
  getGroupInfo({ cTermNo: props.data.data.cTermNo }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      groupData.value = data;
    } else {
      ElMessage.error(msg);
    }
    groupRef.value?.setFormValue(groupData.value);
  });
}

const groupconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title:"分组选择",
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
        func: (v: any) => {},
      },
      {
        prop: "cGroupType",
        inputtype: "rtselect",
        title: "分组类型",
        width: 80,
        loadData: [
          {
            label: "表格",
            value: "grid",
          },
          {
            label: "表单",
            value: "free",
          },
        ],
        func: (v: any) => {},
      },
      {
        prop: "cGroupName",
        inputtype: "rtinput",
        title: "分组名",
        width: 80,
        func: (v: any) => {},
      },
      {
        prop: "cGroupTitle",
        inputtype: "rtinput",
        title: "分组标题",
        func: (v: any) => {},
      },
    ],
  })
);

const titleconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title:"列信息预览",
    fromSchema: [
      {
        prop: "cColTitle",
        inputtype: "rtinput",
        title: "标题",
        func: (v: any) => {},
      },
      {
        prop: "cColWidth",
        inputtype: "rtnumber",
        title: "宽度",
        func: (v: any) => {},
      },
    ],
  })
);
</script>

<style scoped></style>
