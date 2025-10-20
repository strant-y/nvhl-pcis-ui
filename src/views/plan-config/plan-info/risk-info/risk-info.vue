<template>
  <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getListByCode } from '@/api/code-list-service';
import { Search } from '@element-plus/icons-vue'
import { SessionStoreService } from '@/api/session-store.service';
import { AppKey } from '@/constants/api';

import selectRiskType from './select-risk-type.vue';

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const props = defineProps({
  someProp: {
    type: String,
    required: false
  },
  isAdd: {
    type: Boolean,
    required: true
  }
})
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});


const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: '选择险别',
    editFlag: true,
    editList: ["code", "cOperCnm", "cDptCnm", "tPwdStrtTm", "tPwdEndTm", "tPwdEndTm2"],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增险别",
        disabled: props.isAdd,
        type: "success",
        func: function () {
          dzmodal.open(selectRiskType, { }).then((res) => {
            if (res.type === "ok") {
              const seenIds = new Set(pageresult.list.map(item => item.code));
              pageresult.list = [...pageresult.list, ...res.body.filter(item => !seenIds.has(item.code))]
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除所有",
        disabled: props.isAdd,
        type: "danger",
        func: function () {
          resetTableData()
        },
      }),
    ],
    tableBtnPosition: 'left',
    tableBtnFixed: 'left',
    tableBtn: [
    createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "新增",
        disabled: props.isAdd,
        type: "success",
        size: "large",
        icon: "Plus",
        tableClick: (row) => {
          console.log(row);
          add(row)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        disabled: props.isAdd,
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          handlerDelete(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "type",
        inputtype: 'rtinput',
        title: "险别类型",
        width: '55',
        showIndex: true,
      },
      {
        prop: "code",
        inputtype: 'rtinput',
        title: "产品编码",
        disabled: props.isAdd,
      },
      {
        prop: "cOperCnm",
        inputtype: 'rtinput',
        title: "险别代码",
        disabled: props.isAdd,
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "责任",
        disabled: props.isAdd,
      },
      {
        prop: "tPwdStrtTm",
        inputtype: 'rtinput',
        title: "保额(每人保额)",
        disabled: props.isAdd,
      },
      {
        prop: "tPwdEndTm",
        inputtype: 'rtinput',
        title: "费率(%)",
        disabled: props.isAdd,
      },
      {
        prop: "tPwdEndTm2",
        inputtype: 'rtinput',
        title: "保费(每人保费)",
        disabled: props.isAdd,
      },
    ],
  })
);

//删除所有
const resetTableData = () => {
  pageresult.list = []
}

//table操作列add
const add = (row) => {
  //add逻辑
}

//删除单行
const handlerDelete = (row) => {
  let index = null
  pageresult.list.forEach((item, i) => {
    if(item.code == row.code) {
      index = i
    }
  });
  index !== null && pageresult.list.splice(index, 1)
}

onMounted(() => {
  
});

</script>

<style scoped lang="scss">
.disabledIcon {
  pointer-events: none;
  /* 可选：添加一些视觉上的提示，比如灰度效果或降低透明度 */
  opacity: 0.5;
  cursor: not-allowed;
  /* 改变鼠标光标为禁止符号 */
}
</style>
