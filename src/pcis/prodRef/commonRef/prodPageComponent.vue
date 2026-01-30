<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <div>
      <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
      <div
        style="margin-top: 10px; margin-right: 20px"
        :style="{ textAlign: 'end' }"
      >
        <rt-button :item="saveBtn" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  getComponentList,
  queryPageComponents,
  savePageComonent,
  saveInquiryPageComponent,
  queryInquiryPageComponents,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const emits = defineEmits(["ok", "cancel"]);
const props = defineProps({
  data: Object,
  component: String,
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
let dataList = ref<any[]>([]);
let componentTable = ref();
interface MyTableMethod {
  addRow: (arg: any) => any;
  getSelectRow: () => any;
  updateOption: (rowId: string, propKey: string, newOption: Array<any>) => void;
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  getTableValue(): () => any;
  removeRow: (dataId: string) => any;
  setValueByRowKey: (props: string, dataId: string, value: any) => void;
}
// 定义表格数据
const tableRef = ref<MyTableMethod | null>(null);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 100,
    tableBtnPosition: "right",
    title: "组件绑定关系",
    editFlag: true,
    isPage:false,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        tooltip: "删除",
        link: true,
        iconColor: "#FF0000",
        icon: "DeleteFilled",
        tableClick: (r) => {
          tableRef.value?.removeRow(r._dataId);
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "primary",
        tooltip: "预览",
        icon: "View",
        link: true,
        func: function () {},
      }),
    ],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        type: "primary",
        label: "新增",
        icon: "Plus",
        func: () => {
          tableRef.value?.addRow({});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        dragFlag: true,
        tableBtnWidth: 50,
      },
      {
        prop: "cComponentTab",
        inputtype: "rtselect",
        title: "归属tab",
        typeCode: "tablist",
        func: (v: any,r: any) => {
          const sdata = r;
          const params = {
            cComponentTab: v,
          };
          updateOption(params, sdata._dataId, "cComponentKey");
        },
      },
      {
        prop: "cComponentKey",
        inputtype: "rtselect",
        title: "绑定组件",
        func: (v) => {
          // const sdata = tableRef.value?.getSelectRow();

          // codeListStore
          //   .queryCodeList(
          //     {
          //       codeListName: "getComponentByKey",
          //       codeListParam: { value: v },
          //     },
          //     false,
          //     false
          //   )
          //   .then((res) => {
          //     if (res.length > 0) {
          //       const label = res[0]["label"];
          //       tableRef.value?.setValueByRowKey(
          //         "cComponentTable",
          //         sdata._dataId,
          //         label
          //       );
          //     }
          //   })
          //   .catch((err) => {});
        },
      },
      {
        prop: "cComponentName",
        inputtype: "rtinput",
        title: "组件别名",
      },
      {
        prop: "cComponentIcon",
        inputtype: "rtinput",
        title: "组件图标",
        type: "icon",
      },
      {
        prop: "cComponentTable",
        inputtype: "rtinput",
        title: "组件目标VO",
      },
    ],
  })
);
const dialogVisible = ref(true);
const saveBtn = createFreeButtonBase({
  type: "primary",
  label: "保存",
  func: () => {
    const param = tableRef.value?.getFromValue();
    const params = Object.assign(props.data, {
      pageComponents: param,
    });
    if(props.component === "priceComponent") {
      saveInquiryPageComponent(params)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            ElMessage.success("保存成功");
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    } else {
      savePageComonent(params)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            ElMessage.success("保存成功");
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    }
  },
});
function updateOption(params: any, dataId: string, props: string) {
  getComponentList(params)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        let newOption: any[] = [];
        if (data) {
          dataList = data;
          Object.keys(data).forEach((item) => {
            newOption.push({
              label: data[item].cComponentKey + " " + data[item].cComponentName,
              value: data[item].cComponentKey,
              data: data[item],
            });
          });
          tableRef.value?.updateOption(dataId, props, newOption);
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

onMounted(() => {
  if(props.component === "priceComponent") {
    queryInquiryPageComponents(props.data)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          tableRef.value?.setFormValue(data);
          setTimeout(() => {
            const tabData = tableRef.value?.getFromValue();
            Object.keys(tabData).forEach((key) => {
              const sdata = tabData[key];
              const params = {
                cComponentTab: sdata.cComponentTab,
              };
              updateOption(params, sdata._dataId, "cComponentKey");
            });
          }, 100);
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  } else {
    queryPageComponents(props.data)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          tableRef.value?.setFormValue(data);
          setTimeout(() => {
            const tabData = tableRef.value?.getFromValue();
            Object.keys(tabData).forEach((key) => {
              const sdata = tabData[key];
              const params = {
                cComponentTab: sdata.cComponentTab,
              };
              updateOption(params, sdata._dataId, "cComponentKey");
            });
          }, 100);
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  }
});
</script>
