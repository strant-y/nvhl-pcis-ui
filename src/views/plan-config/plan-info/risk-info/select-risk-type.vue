<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" @selection-change="selectChange" />
    <div style="text-align: right;margin-top: 20px;">
      <el-button type="primary" @click="sure">确定</el-button>
      <el-button @click="close">返回</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

const props = defineProps({
  someProp: {
    type: String,
    required: false
  }
})
const emits = defineEmits(['ok'])
const dialogVisible = ref(true)
const selected = ref([])

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

setTimeout(() => {
  pageresult.list = [
  {
    _dataId: '1',
    type: '主险',
    code: '060601',
    name: '主险名称',
    children: [
      {
        _dataId: '1-1',
        type: '附加险',
        code: '060601-1',
        name: '附加险名称'
      }
    ]
  },
  {
    _dataId: '2',
    type: '主险2',
    code: '060602',
    name: '主险名称'
  }
]
}, 2000)

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    title: '不同主险下的相同附加险只允许选择一条',
    fromSchema: [
      {
        prop: "type",
        inputtype: 'rtinput',
        title: "险别类型",
      },
      {
        prop: "code",
        inputtype: 'rtinput',
        title: "险别显示码",
      },
      {
        prop: "cOperCnm",
        inputtype: 'rtinput',
        title: "险别名称",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "责任编码",
      },
      {
        prop: "tPwdStrtTm",
        inputtype: 'rtinput',
        title: "责任名称",
      },
      {
        prop: "tPwdEndTm",
        inputtype: 'rtinput',
        title: "关联产品",
      },
    ],
  })
);

const selectChange = (selection) => {
  console.log('selection', selection);
  selected.value = selection
}

const sure = () => {
  if (!selected.value.length) {
    ElMessage.warning('至少选择一条数据！')
    return
  }
  const returnData = []
  selected.value.forEach(item => {
    if(item.children) {
      delete item.children
    }
    returnData.push(item)
  })
  emits('ok', returnData)
  dialogVisible.value = false
}
const close = () => {
  dialogVisible.value = false
}

onMounted(() => {
});

</script>

<style scoped lang="scss"></style>
