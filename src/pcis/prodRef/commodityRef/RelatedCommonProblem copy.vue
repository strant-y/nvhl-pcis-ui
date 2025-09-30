<!--商品配置-常见问题配置-关联公共问题-->
<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { getPlanBasePage } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
// const privateProblem = defineAsyncComponent(
//   () => import("./PrivateProblem.vue")
// );
import { query, getRiskList, saveCvrgRiskRel } from "@/api/prod";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
const dzmodal = useDzModal();

import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联公共问题",
    endBtnsPosition: "left",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "",
        func: function () {
          // dzmodal
          //   .open(privateProblem, { type: "add", data: {} })
          //   .then((res) => {
          //     if (res.type === "ok") {
          //       handleQuery();
          //     }
          //   });
        },
      }),
    ],
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "add-planConf",
        label: "公共问题新增",
        type: "success",
        // func: function () {
        //   dzmodal
        //     .open(AddPlanConfigurationModal, { type: "add", data: {} })
        //     .then((res) => {
        //       if (res.type === "ok") {
        //         handleQuery();
        //       }
        //     });
        // },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [],
    fromSchema: [
      {
        prop: "cPlanCn",
        title: "问题",
      },
      {
        prop: "cProdNme",
        title: "答案",
      },
    ],
  })
);
const responsibilities = ref([
  { name: "责任A", code: "001" },
  { name: "责任B", code: "002" },
]);

const handleResponsibilityModalConfirm = (payload: any) => {
  if (payload.action === "confirm") {
    console.log("选中的责任:", payload.rows);
    saveSelectedResponsibilities(payload.rows);
  } else if (payload.action === "delete") {
    console.log("删除的责任:", payload.row);
  }
};
const handleSave = () => {
  handleQuery(); // 刷新table列表
};
// 保存选中的责任
const saveSelectedResponsibilities = (rows: Array<any>) => {
  {
    // 调用 saveCvrgRiskRel 接口
    saveCvrgRiskRel(rows)
      .then((res) => {
        const { code, data, msg } = res;
        if (code === 200) {
          ElMessage.success("保存成功");
          handleQuery(); // 刷新父组件的列表
        } else {
          ElMessage.error(msg);
        }
      })
      .catch((err) => {
        ElMessage.error("保存失败");
      });
  }
};
function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getPlanBasePage(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.data;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
  }
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
