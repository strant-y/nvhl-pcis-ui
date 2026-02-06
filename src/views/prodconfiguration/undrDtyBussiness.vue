<!--核保人批量配置-业务员-员工信息--->
<template>
  <div>
    <el-dialog v-model="dialogVisible" title="" width="80%">
      <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
import { codeListViewStore } from "@/store";

const dzmodal = useDzModal();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import { descryptParameter, encryptParameter } from "@/utils/encipher";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo } from "@/api/prod";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps<{
  data: {
    type: Object;
    default: () => {};
  };
}>();
const emit = defineEmits(["row-click"]);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "业务员-员工信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (!isValid) return false;
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码",
      },
      {
        prop: "cEmpCnm",
        inputtype: "rtinput",
        title: "员工名称",
        // rules: [getRules("required", { change: true })],
      },
      {
        prop: "dptCde",
        inputtype: "rtselect",
        title: "员工所属机构",
        // rules: [getRules("required", { change: true })],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal.open(DepartmentTree, {}).then((res) => {
              if (res.body) {
                const selectObj = res.body;
                let obj = {
                  loadData: [
                    {
                      label: selectObj.name,
                      value: selectObj.id,
                    },
                  ],
                };
                freeEditRef.value?.setValue("dptCde", selectObj.id);
              }
            });
          },
        },
        clearable: true,
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
      await saveRiskInfo(formData); //保存接口调用
      ElMessage.success("保存成功");
      emit("save");
      // dialogVisible(false);
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "add-responsibility",
    //     label: "公共问题新增",
    //     type: "success",
    //     func: function () {
    //       dzmodal.open(publicProblem, { type: "add", data: {} }).then((res) => {
    //         if (res.type === "ok") {
    //           handleQuery();
    //         }
    //       });
    //     },
    //   }),
    // ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    // tableBtn: [
    //   createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "删除",
    //     icon: "Delete",
    //     link: true,
    //     tableClick: (row) => {},
    //   }),
    // ],
    fromSchema: [
      // {
      //   prop: "cBsnsTyp",
      //   title: "编号",
      //   inputtype: "rtinput",
      // },
      {
        prop: "cEmpCde",
        title: "员工代码",
        inputtype: "rtinput",
      },
      {
        prop: "cEmpCnm",
        title: "员工名称",
        inputtype: "rtinput",
      },
      {
        prop: "cDptCde",
        title: "所属机构",
        inputtype: "rtselect",
      },
    ],
    rowDbClickFun(rowData) {
      emit("ok", rowData);
      dialogVisible.value = false;
      // props.data.method?.getdbClickData(rowData);
    },
  })
);
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  codeListStore
    .queryCodeList({
      codeListName: "Sales_Emp_Qry_List",
      codeListParam: param,
    })
    .then((res) => {
      if (res.length) {
        pageresult.list = res;
      }
    });
}
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
