<template>
  <div>
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @selection-change="handleSelectionChange" />
      <div class="btnSty">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="returnData">确定</el-button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  method: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const emits = defineEmits(['handleClose'])
const tableRef = ref<MyTableMethod | null>(null);
const selected = ref([])
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: 'false',
    // showSelection: true,
    fromSchema: [
      {
        prop: "PrdFixSpec.checked",
        inputtype: 'rtcheckbox',
        title: "是否选中",
        width: 130,
      },
      {
        prop: "PrdFixSpec.CSpecNo",
        inputtype: 'rtinput',
        title: "特别约定代码",
        width: 150,
      },
      {
        prop: "PrdFixSpec.CNmeCn",
        inputtype: 'rtinput',
        title: "特约内容",
      },
      {
        prop: "PrdFixSpec.CNmeEn",
        inputtype: 'rtinput',
        title: "英文名",
      },
    ],
  })
);

const handleSelectionChange = (selection) => {
  
  selected.value = selection
}

const refreshData = () => {
  // 查询列表数据
  codeListStore.queryCodeList({
    codeListName: 'FIX_SPEC_LIST',
    codeListParam: {
      'cProdNo': props.data.data.cProdNo
    }
  }, false, true).then(res => {
    if (res) {
      pageresult.list = []
      res.forEach(item => {
        pageresult.list.push({
          'PrdFixSpec.CSpecNo': item.cSpecNo,
          'PrdFixSpec.CNmeCn': item.cNmeCn,
          'PrdFixSpec.CNmeEn': item.cNmeEn,
          "PrdFixSpec.checked": false
        })
      })
      nextTick(() => {
        setSelected()
      })
    }
  });
};

//点击确定按钮时把选中的数据派发给父组件
const returnData = () => {
  let tempData = []
  pageresult.list.forEach(item => {
    if(item['PrdFixSpec.checked']) {
      tempData.push(item)
    }
  })
  props.data.method.getSelected(tempData)
}
const close = () => {
  emits('handleClose')
}

function setSelected() {
  const lastSelected = props.data.data.fixSpecData
  if(lastSelected && lastSelected.length) {
    lastSelected.forEach(item => {
      pageresult.list.forEach(item2 => {
        if(item['PrdFixSpec.CSpecNo'] === item2['PrdFixSpec.CSpecNo']) {
          item2['PrdFixSpec.checked'] = true
        }
      })
    })
  }
}

onMounted(() => {
  refreshData()
});
</script>

<style scoped lang="scss">
.btnSty {
  text-align: right;
  margin-top: 10px;
}
</style>