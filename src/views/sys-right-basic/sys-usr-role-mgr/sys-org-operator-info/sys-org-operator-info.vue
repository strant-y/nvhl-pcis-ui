<template>
  <div>
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";
import { getListByCode } from "@/api/code-list-service";
import SysOperateRightSettings from "../sys-operate-right-settings/sys-operate-right-settings.vue";
import SysProdRightSettings from "../sys-prod-right-settings/sys-prod-right-settings.vue";
import { watch } from "vue";

import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
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
  getDptCde: {
    type: String,
    required: true,
  },
});
const emits = defineEmits(["cleanCheck"]);
const { getRules } = useValidator();
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
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
          emits("cleanCheck");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "COperId",
        inputtype: "rtinput",
        title: "操作员代码",
        clearable: true,
      },
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "机构代码",
        disabled: true,
        rules: [getRules("required", {})],
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 2,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    isRadio: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "设置操作权限",
        type: "primary",
        func: function () {
          if (operatorData.value) {
            dzmodal
              .open(SysOperateRightSettings, { operatorData: operatorData })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          } else {
            ElMessage.warning("请先选定操作员,再进行操作!");
          }
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "设置产品权限",
        type: "primary",
        func: function () {
          if (operatorData.value) {
            dzmodal
              .open(SysProdRightSettings, { operatorData: operatorData })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          } else {
            ElMessage.warning("请先选定操作员,再进行操作!");
          }
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cOperId",
        inputtype: "rtinput",
        title: "操作员代码",
      },
      {
        prop: "cOperCnm",
        inputtype: "rtinput",
        title: "操作员名称",
      },
      {
        prop: "cSrc",
        inputtype: "rtinput",
        title: "操作员来源",
      },
      {
        prop: "cRelCde",
        inputtype: "rtinput",
        title: "关联代码",
      },
      {
        prop: "cDptDispCde",
        inputtype: "rtinput",
        title: "机构显示码",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "操作机构",
      },
    ],
  })
);

const tableRef = ref<AppTableMethod | null>(null);

const displayData = ref("");
const operatorData = ref([]);
const codeListMap = ref<any>({});

const sysOperatorMgrService = new SysOperatorMgrService();

const handleQuery = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    }
  });
};
function handleSelectionChange(selection: []) {
  console.log("selection", selection[0]);
  operatorData.value = selection[0];
}

const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue();
  const params = Object.assign(s, r);
  sysOperatorMgrService.qryGrtOperatorList(params).then(
    (res: any) => {
      if (res && res.code === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageresult.list = pageData.result;
        }
      }
    },
    (error) => {
      console.log("出错了", error);
      ElMessage.error("后台服务异常,请联系管理员");
    }
  );
};

//table操作员来源这一列的format方法
const formatSource = (row) => {
  return codeListMap.value.CSrc ? codeListMap.value.CSrc[row.cSrc] : "";
};

watch(
  () => props.getDptCde,
  (newVal) => {
    if (newVal) {
      freeEditRef.value?.setValue("CDptCde", newVal);
      refreshData(true);
    }
  }
);

onMounted(() => {
  // 操作员来源 数据字典枚举值
  getListByCode("WEB_SYS_STA_DICT", { cParCde: "opersrc" }).then(
    (res) => {
      if (res && res.data) {
        codeListMap.value.CSrc = res.data;
      }
    },
    (error) => {
      console.log("出错了", error);
      ElMessage.error("后台服务异常,请联系管理员");
    }
  );
});
</script>

<style scoped lang="scss">
/* Add your styles here */
</style>
