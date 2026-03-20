<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @row-dblclick="dbClick"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
} from "element-plus";
// import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useUserStore } from "@/store/modules/user";

const emits = defineEmits(["ok"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const dialogVisible = ref(true);
const formData = ref(freeEditRef.value?.getFromValue());
const userStore = useUserStore();
const user = ref<any>(userStore.user);
// const policyService = new PolicyService();

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CSlsCde",
        inputtype: "rtinput",
        title: "业务员工号",
        clearable: true,
      },
      {
        prop: "CSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
        clearable: true,
      },
    ],
  })
);

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
      CSlsCde: "123",
      CSlsNme: "名字",
    },
  ];
}, 2000);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "CSlsCde",
        inputtype: "rtinput",
        title: "业务员员工号",
      },
      {
        prop: "CSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
      },
      {
        prop: "CSlsTyp",
        inputtype: "rtinput",
        title: "人员分类",
      },
      {
        prop: "CDptName",
        inputtype: "rtinput",
        title: "所在部门",
      },
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "所在部门代码",
      },
      {
        prop: "CMobile",
        inputtype: "rtinput",
        title: "联系电话",
      },
      {
        prop: "CEmail",
        inputtype: "rtinput",
        title: "邮箱",
      },
    ],
  })
);

const handleQuery = (flag) => {
  refreshData(flag);
};

const refreshData = (reset = false) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      ElMessage.warning("表单验证不通过，请检查！");
      return;
    }
    const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
    const s = freeEditRef.value?.getFromValue();
    const params = Object.assign(s, r, obj);
    const obj = {
      CurrentUser: user.value ? user.value["opCde"] : "",
      CurrentUserOrg: user.value ? user.value["companyId"] : "",
      CBsnsTyp: formData.value["CBsnsTyp"],
      CDptCde: formData.value["CDptCde"],
      CBrkrCde: formData.value["CBrkrCde"],
      CSlsTyp: formData.value["CSlsTyp"],
      CChaType: formData.value["CChaType"],
			CChaSubtype: formData.value['cChaSubtype'],
      CDptAttr: formData.value["CDptAttr"],
      CSlsCde: formData.value["CSlsCde"],
      subSidiary: formData.value["subSidiary"],
      leading: formData.value["leading"],
    };

    policyService.getWebOrgSelsList(params).then((res: any) => {
      if (res && res["code"] === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageresult.list = pageData.result;
        }
      }
    });
  });
};

const dbClick = (data: any) => {
  dialogVisible.value = false;
  emits("ok", data);
};

onMounted(() => {
  refreshData(true);
});
</script>

<style scoped lang="scss">
.actived {
  background: #a6dbed;
}

th {
  text-align: center;
}

.hideItem {
  display: none;
}
</style>
