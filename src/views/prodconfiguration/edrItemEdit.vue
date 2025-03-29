<template>
  <!--<el-dialog-->
  <!--v-model="dialogVisible"-->
  <!--title=""-->
  <!--width="80%"-->
  <!--@update:model-value="handleVisibleUpdate"-->
  <!--&gt;-->
  <!--<app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />-->
  <!--<template #footer>-->
  <!--<span class="dialog-footer">-->
  <!--<el-button type="primary" @click="handleSave">保存</el-button>-->
  <!--<el-button @click="handleCancel">取消</el-button>-->
  <!--</span>-->
  <!--</template>-->
  <!--</el-dialog>-->
  <div>
    <el-dialog v-model="dialogVisible" width="90%">
      <el-row :gutter="20">
        <el-col :span="6">
          <div>组件列表</div>
          <el-menu>
            <el-menu-item
              v-for="(item, index) in componentList"
              :key="index"
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
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import {
  savePrdTermInfo,
  queryPageComponentList,
  initProdEdrRsnItemList,
  saveProdEdrRsnItemList,
} from "@/api/prod"; // api接口
import {
  AppTableConfig,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";

const props = defineProps<{
  visible: boolean;
  data: Object;
}>();
const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
}>();
import { inputtype } from "@/utils/utilKey";
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
// const freeEditRef = ref<AppFreeEditMethod | null>(null);
//
// const formconfig = reactive<AppFreeEditConfig>(
//   createAppFreeEditConfig({
//     title: "增加批改项",
//     endBtnsPosition: "right",
//     fromSchema: [
//       {
//         prop: "CKindNo",
//         inputtype: "rtselect",
//         title: "产品大类",
//       },
//       {
//         prop: "CCvrgTyp",
//         inputtype: "rtinput",
//         title: "批改原因编号",
//       },
//       {
//         prop: "CTermNo",
//         inputtype: "rtinput",
//         title: "批改原因名称",
//       },
//       {
//         prop: "CNmeCn",
//         inputtype: "rtselect",
//         title: "批改原因类别",
//       },
//       {
//         prop: "CNmeEn",
//         inputtype: "rtselect",
//         title: "是否计算保费",
//       },
//       {
//         prop: "CFilingNo",
//         inputtype: "rtselect",
//         title: "是否团单",
//       },
//       {
//         prop: "CRegisteredNo",
//         inputtype: "rtselect",
//         title: "是否个单",
//       },
//       {
//         prop: "CEnableFlag",
//         inputtype: "rtselect",
//         title: "启用标志",
//         loadData: [
//           {
//             label: "启用",
//             value: "1",
//           },
//           {
//             label: "禁用",
//             value: "0",
//           },
//         ],
//       },
//       {
//         prop: "CDesc",
//         inputtype: "rtinput",
//         type: "textarea",
//         btnWidth: 20,
//         itemWidth: 3,
//         rows: 4,
//         title: "批文模板",
//       },
//     ],
//     fromUi: createFromUiConfig({
//       cols: 3,
//     }),
//   })
// );
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
      const sel = JSON.parse(JSON.stringify(param));
      const newparam = {};
      newparam["CProdNo"] = sel["c_prod_no"];
      newparam["CComponentKey"] = sel["cComponentKey"];
      newparam["CRsnCde"] = props.data.cRsnCde;
      newparam["items"] = [];
      console.log("0000", newparam);
      sel["selectFactor"].forEach((v, key) => {
        const obj = {};
        obj["CGroup"] = v.cGroup;
        obj["CFactorKey"] = v["c_pk_id"];
        obj["CEdrItem"] = v["c_factor_prop"];
        obj["COperTyp"] = "M";
        obj["CSortingNo"] = key + 1;
        obj["CRsnCde"] = props.data.cRsnCde;
        newparam["items"].push(obj);
      });
      saveProdEdrRsnItemList(newparam)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            // emits("ok", {});
            selectComponent(selectConItem.value);
            ElMessage.success("保存成功");
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    },
  }),
  // createFreeButtonBase({
  //     type: "primary",
  //     label: "预览",
  //     icon: "Monitor",
  //     func: async () => {
  //         // dialog.value?.open(
  //         //     "componentPageView",
  //         //     {
  //         //         param: {
  //         //             CprodNo: props.data?.pageSelect.cProdNo,
  //         //             CPageCde: props.data?.pageSelect.cPkId,
  //         //         },
  //         //     },
  //         //     {},
  //         //     { title: "页面预览", width: "95" }
  //         // );
  //     },
  // }),
  // createFreeButtonBase({
  //     type: "primary",
  //     label: "发布",
  //     icon: "MessageBox",
  //     func: async () => {
  //         // console.log(props.data);
  //         // const param = Object.assign(props.data, selectConItem.value);
  //         // releasePage(param)
  //         //     .then((res) => {
  //         //         const { code, data, msg } = res;
  //         //         if (200 === code) {
  //         //             // emits("ok", {});
  //         //             ElMessage.success("保存成功");
  //         //         } else {
  //         //             ElMessage.error(msg);
  //         //         }
  //         //     })
  //         //     .finally(() => {});
  //     },
  // }),
]);
// 定义表格数据
const tableRef = ref<MyTableMethod | null>(null);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "配置明细",
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
// const handleSave = async () => {
//   const formData = freeEditRef.value?.getFromValue();
//   if (formData) {
//     try {
//       await savePrdTermInfo(formData); // 调用保存接口
//       ElMessage.success("保存成功");
//       emit("save");
//       handleVisibleUpdate(false);
//     } catch (error) {
//       ElMessage.error("保存失败");
//     }
//   }
// };
const selectConItem = ref({});
function selectComponent(item: any) {
  selectConItem.value = item;
  const param = {
    CComponentKey: item.cComponentKey,
    cComponentTab: item.cComponentTab,
    CProdNo: item["c_prod_no"],
    CRsnCde: props.data.cRsnCde,
  };
  initProdEdrRsnItemList(param)
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
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {
  queryPageComponentList({
    pageSelect: { cProdNo: props.data.cProdNo, cRsnCde: props.data.cRsnCde },
  })
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        componentList.value = data;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
});
const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
