<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="handleCancel">返回</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
// import { ElMessage } from "element-plus";
import { savePrdTermInfo } from "@/api/prod"; // api接口

const props = defineProps<{
  visible: boolean;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "方案共保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "nSeqNo",
        inputtype: "rtselect",
        title: "序号",
      },
      {
        prop: "cCiAgrmntNo",
        inputtype: "rtinput",
        title: "共保协议号",
      },
      {
        prop: "cMajorAgrmntMrk",
        inputtype: "rtinput",
        title: "主从协议标志",
      },
      {
        prop: "cCoinsurerCde",
        inputtype: "rtselect",
        title: "共保人",
      },
      {
        prop: "cCiSubComp",
        inputtype: "rtselect",
        title: "共保子公司",
      },
      {
        prop: "cChiefMrk",
        inputtype: "rtselect",
        title: "主共标志",
      },
      {
        prop: "cIssueMrk",
        inputtype: "rtselect",
        title: "出单标志",
        loadData: [
          {
            label: "启用",
            value: "1",
          },
          {
            label: "禁用",
            value: "0",
          },
        ],
      },
      {
        prop: "nCiShare",
        inputtype: "rtinput",
        title: "共保比例",
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "出单机构",
      },
      {
        prop: "cJiMrk",
        inputtype: "rtinput",
        title: "主从联标识",
      },
      {
        prop: "cAcctNo",
        inputtype: "rtinput",
        title: "账号",
      },
      {
        prop: "cAcctNme",
        inputtype: "rtinput",
        title: "账户名",
      },
      {
        prop: "cBankRelTyp",
        inputtype: "rtselect",
        title: "收款银行大类",
      },
      {
        prop: "cBankPro",
        inputtype: "rtselect",
        title: "开户行省",
      },
      {
        prop: "cBankArea",
        inputtype: "rtselect",
        title: "开户行市",
      },
      {
        prop: "cBankCounty",
        inputtype: "rtselect",
        title: "开户行县",
      },
      {
        prop: "cBankCde",
        inputtype: "rtselect",
        title: "开户银行",
      },
      {
        prop: "cBankAddr",
        inputtype: "rtinput",
        title: "开户行地址",
      },
      {
        prop: "cBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号",
      },
      // {
      //   prop: "CUseDpt",
      //   inputtype: "rtinput",
      //   title: "共同代理人",
      // },
      // {
      //   prop: "CUseDpt",
      //   inputtype: "rtselect",
      //   title: "联共保业务",
      // },
      {
        prop: "CStatus",
        inputtype: "rtselect",
        title: "状态",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await savePrdTermInfo(formData); // 调用保存接口
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
