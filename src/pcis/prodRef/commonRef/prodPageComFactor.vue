<template>
  <div>
    <el-dialog v-model="dialogVisible" width="90%">
      <el-row :gutter="20">
        <el-col :span="6">
          <div>组件列表</div>
          <el-menu>
            <el-menu-item
              v-for="(item, index) in componentList"
              :key="index"
              class="component-item"
              :class="
                selectConItem.cComponentKey === item.cComponentKey
                  ? 'com_active'
                  : ''
              "
              @click="selectComponent(item)"
            >
              <template #title>{{ item.cComponentName }}</template>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="18">
          <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div
            style="margin-top: 20px"
            :style="{ textAlign: 'center' }"
            v-if="clickBtn.length > 0"
          >
            <template v-for="(item, index) in clickBtn" :key="index">
              <rt-button :item="item" />
            </template>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  queryFactorListByComCode,
  queryPageComponentList,
  releasePage,
  SaveComponentFactors,
  releaseInquiryPage,
  queryInquiryPageComponentList,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
const emits = defineEmits(["ok", "cancel"]);
import { inputtype } from "@/utils/utilKey";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const prodPageView = defineAsyncComponent(() => import("./prodPageView.vue"));
const dialog = ref<DialogMethod | null>(null);

const props = defineProps({
  data: Object,
  component: String,
});
const componentList = ref([]);
interface MyTableMethod {
  addRow: (arg: any) => any;
  getSelectRow: () => any;
  updateOption: (rowId: string, propKey: string, newOption: Array<any>) => void;
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  getTableValue(): () => any;
  removeRow: (dataId: string) => any;
}

const clickBtn = ref<Array<FreeButtonBase>>([
  createFreeButtonBase({
    type: "primary",
    label: "保存",
    icon: "Select",
    func: async () => {
      const lists = tableRef.value?.getFromValue();
      const checkList = lists.filter((e: any) => {
        return e.isChecked === "1";
      });
      const param = Object.assign(selectConItem.value, {
        selectFactor: checkList,
      });

      SaveComponentFactors(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            emits("ok", {});
            ElMessage.success("保存成功");
            dialogVisible.value = false;
          } else {
            ElMessage.error({ message: msg, duration: 1000 });
          }
        })
        .finally(() => {});
    },
  }),
  createFreeButtonBase({
    type: "primary",
    label: "预览",
    icon: "Monitor",
    func: async () => {
      dialog.value?.open(
        "componentPageView",
        {
          param: {
            CprodNo: props.data?.pageSelect.cProdNo,
            CPageCde: props.data?.pageSelect.cPkId,
          },
        },
        {},
        { title: "页面预览", width: "95" }
      );
    },
  }),
  createFreeButtonBase({
    type: "primary",
    label: "发布",
    icon: "MessageBox",
    func: async () => {
      console.log(props.data);
      const param = Object.assign(props.data, selectConItem.value);
      if(props.component === "priceComponent") {
        releaseInquiryPage(param)
          .then((res) => {
            const { code, data, msg } = res;
            if (200 === code) {
              emits("ok", {});
              ElMessage.success("保存成功");
              dialogVisible.value = false;
            } else {
              ElMessage.error({ message: msg, duration: 1000 });
            }
          })
          .finally(() => {});
      } else {
        releasePage(param)
          .then((res) => {
            const { code, data, msg } = res;
            if (200 === code) {
              emits("ok", {});
              ElMessage.success("保存成功");
              dialogVisible.value = false;
            } else {
              ElMessage.error({ message: msg, duration: 1000 });
            }
          })
          .finally(() => {});
      }
    },
  }),
]);

// 定义表格数据
const tableRef = ref<MyTableMethod | null>(null);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "配置明细",
    fixedHeader: true,
    isPage: false,
    maxHeight: "400px",
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        tableBtnWidth: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "2",
        },
        tableBtnWidth: 40,
      },
      {
        prop: "c_factor_inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "c_factor_tab",
        inputtype: "rtselect",
        title: "所属tab",
        typeCode: "tablist",
      },
      {
        prop: "c_factor_prop",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "c_factor_title",
        inputtype: "rtinput",
        title: "要素名称",
      },
    ],
  })
);
const dialogVisible = ref(true);
// 这里将就的先用一下,将来还是可能要替换的
const selectConItem = ref({});
function selectComponent(item: any) {
  selectConItem.value = item;
  queryFactorListByComCode(item)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (data && data.length > 0) {
          data.forEach((element: any) => {
            if (element.factorPkId) {
              element.isChecked = "1";
            } else {
              element.isChecked = "2";
            }
          });
        }
        console.log(data);
        tableRef.value?.setFormValue(data);
      } else {
        ElMessage.error({ message: msg, duration: 1000 });
      }
    })
    .finally(() => {});
}
onMounted(() => {
  if(props.component === "priceComponent") {
    queryInquiryPageComponentList(props.data)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          componentList.value = data;
        } else {
          ElMessage.error({ message: msg, duration: 1000 });
        }
      })
      .finally(() => {});
  } else {
    queryPageComponentList(props.data)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          componentList.value = data;
        } else {
          ElMessage.error({ message: msg, duration: 1000 });
        }
      })
      .finally(() => {});
  }
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
.component-item {
  height: 30px;
}
.com_active {
  background-color: #72ffff;
}
</style>
