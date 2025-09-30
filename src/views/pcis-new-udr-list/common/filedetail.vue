<!-- 影像附件 -->
<template>
  <el-dialog v-model="dialogVisible" width="70%" title="影像上传">
    <div>
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />

    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const dialogVisible = ref(true);
const dzmodal = useDzModal();

const tableRef = ref<AppTableMethod | null>(null);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "已上传附件",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "上传",
        type: "success",
        func: () => {
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "查看",
        type: "success",
        func: () => {
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除",
        type: "warning",
        func: () => {
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "影像类型",
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "影像文件名",
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "上传人",
        minWidth: 120,
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "上传时间",
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "影像描述",
      },
    ],
  })
);




onMounted(async () => {});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};


/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const param = Object.assign(r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

</script>

<style scoped></style>
