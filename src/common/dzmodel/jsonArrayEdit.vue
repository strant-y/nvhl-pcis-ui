<template>
  <el-dialog v-model="dialogVisible" width="500px">
    <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
    <el-row>
      <el-col :span="10"> 请输入需要新增的key名: </el-col>
      <el-col :span="6">
        <el-input v-model="inputData" />
      </el-col>
      <el-col :span="3">
        <rt-button
          :item="{
            type: 'primary',
            label: '增加一列',
            func: () => {
              if (!inputData) {
                return;
              }
              const params = {
                prop: inputData,
                inputtype: 'rtinput',
                title: inputData,
              };
              tableconfig.fromSchema?.push(params);
              inputData = '';
            },
          }"
        />
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";

const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const props = defineProps({
  data: String,
  inititle: Array,
});
const tableRef = ref<MyTableMethod | null>(null);
const inputData = ref("");

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "icon",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    editFlag: true,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "primary",
        label: "删除",
        icon: "DeleteFilled",
        tableClick: (r) => {
          tableRef.value?.removeRow(r._dataId);
        },
      }),
    ],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        type: "primary",
        label: "新增行",
        icon: "Plus",
        func: () => {
          tableRef.value?.addRow({});
        },
      }),
    ],
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: () => {
          const data = tableRef.value?.getFromValue();
          if (data && data.length > 0) {
            data.forEach((e) => {
              delete e._dataId;
            });
          }
          let jsonData = null;
          if(data && data.length !== 0 ){
            jsonData = JSON.stringify(data);
          }
          emits("ok", jsonData);
          dialogVisible.value = false;
        },
      }),
    ],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        dragFlag: true,
      },
      // {
      //   prop: "cComponentKey",
      //   inputtype: "rtselect",
      //   title: "绑定组件",
      // },
    ],
  })
);

onMounted(() => {
  if (props.data) {
    const obj = JSON.parse(props.data);
    if (obj && obj.length > 0) {
      Object.keys(obj[0]).forEach((o) => {
        const params = {
          prop: o,
          inputtype: "rtinput",
          title: o,
        };
        tableconfig.fromSchema?.push(params);
      });
      setTimeout(() => {
        tableRef.value?.setFormValue(obj);
      }, 40);
    }else{
      initdata();
    }
  } else {
    initdata();
  }
});

function initdata(){
if (props.inititle && props.inititle.length > 0) {
      props.inititle.forEach((e) => {
        const params = {
          prop: e,
          inputtype: "rtinput",
          title: e,
        };
        tableconfig.fromSchema?.push(params);
      });
    }
}
defineExpose({});
</script>

<style scoped></style>
