<template>
  <div>
    <rt-mytable
      :tableConfig="tableconfig"
      ref="tableRef"
    />
  </div>
</template>

<script setup lang="ts">
import { getInputGroupList, querySelectorList, saveDistfrom } from '@/api/prod';
import { AppTableConfig, createTableEditConfig, MyTableMethod } from '@/shared/app-table-config';
import { createFreeButtonBase } from '@/shared/button-config';
import { yesOrNo, size, inputtype, freeCol } from "@/utils/utilKey";
const tableRef = ref<MyTableMethod | null>(null);
const emits = defineEmits(["handleClose"]);
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
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
          n: "2",
        },
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
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
    titleBtns:[
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: () => {
          savedistfrom();
        },
      }),
      createFreeButtonBase({
        label: "关闭",
        func: () => {
          emits("handleClose");
        },
      }),
    ]
  })
);

onMounted(() => {
  query();
})

function query(){
  const param = {
    parentKey:props.data.componentKey,
    factorTab:'distfromconfig',
  }
  getInputGroupList(param).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      Object.keys(data).forEach((i) => {
        if (data[i].cFactorParentKey) {
          data[i].isChecked = "1";
        }
      });
      tableRef.value?.setFormValue(data);
    } else {
      ElMessage.error(msg);
    }
  });
}

function savedistfrom(){
  const maps = tableRef.value?.getFromValue();
  let selectList = maps.filter((item: any) => item.isChecked === "1");
  saveDistfrom({
    parentKey:props.data.componentKey,
    selectList: selectList
  }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      ElMessage.success("保存成功");
      query();
    } else {
      ElMessage.error(msg);
    }
  });
}
</script>

<style scoped>
</style>
