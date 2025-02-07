<!--险别配置--关联附加险弹框-->
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
import { qryProdRelCvrgList } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const RelatedAdditionalInsModal = defineAsyncComponent(
  () => import("./RelatedAdditionalInsModal.vue")
);
import { getCvrgRelList, delCvrgRel } from "@/api/prod";
const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联附加险",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "大类代码",
      },
      {
        prop: "cCvrgNo",
        inputtype: "rtinput",
        title: "险别代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "关联附加险",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cCvrgNo == null) {
            ElMessage.error("请完善基本信息后操作!");
            return;
          } else {
            dzmodal
              .open(RelatedAdditionalInsModal, { type: "add", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          handleDelete(row.index, row);
          // delCvrgRel(row)
          //   .then((res) => {
          //     const { code, data, msg } = res;
          //     if (200 === code) {
          //       ElMessage.success("删除成功");
          //       handleQuery();
          //     } else {
          //       ElMessage.error(msg);
          //     }
          //   })
          //   .finally(() => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "大类代码",
        inputtype: "rtinput",
      },
      {
        prop: "cCvrgNo",
        title: "险别代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
        inputtype: "rtinput",
      },
    ],
  })
);

const handleEdit = (index: number, row: any) => {
  // 编辑逻辑
  console.log("编辑", row);
};

const handleDelete = (index: number, row: any) => {
  ElMessageBox.confirm("此操作将永久删除该条款, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      delCvrgRel(row)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            ElMessage.success("删除成功");
            handleQuery();
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    })
    .catch(() => {
      // 取消删除
    })
    .catch(() => {
      // 取消删除
    });
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
  const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
  if (tabref.getFromValue().cCvrgNo == null) {
    ElMessage.error("请完善基本信息后在操作!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, {
      cCvrgNo: tabref.getFromValue().cCvrgNo,
    });
    qryProdRelCvrgList(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          pageresult.list = data.result;
          pageresult.total = data.total;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  }
}
onMounted(() => {
  if (param.type === "edit") {
    setTimeout(() => {
      handleQuery();
    }, 200);
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

<style scoped>
/* 确保样式与现有组件一致 */
</style>
