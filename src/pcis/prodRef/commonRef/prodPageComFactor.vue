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
  savePageFactorConfig,
  queryPageFactorConfig,
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
            // 保存页面要素配置（默认值+JSON+正则）
            const factorConfigParam = {
              cProdNo: props.data?.pageSelect?.cProdNo || "",
              cPageCode: props.data?.pageSelect?.cPkId || "",
              cComponentCode: (selectConItem.value as any).cComponentKey || "",
              factorConfigs: checkList.map((row: any) => ({
                cFactorKey: row.c_pk_id || "",
                cFactorDefault: row.c_factor_default || "",
                cFactorJson: row.c_factor_json || "",
                cFactorRegex: row.c_factor_regex || "",
              })),
            };
            savePageFactorConfig(factorConfigParam).then((cfgRes) => {
              if (cfgRes.code !== 200 && cfgRes.code !== "0") {
                ElMessage.error({ message: cfgRes.msg || cfgRes.message, duration: 1000 });
              }
            });
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
    // 点击行进入编辑态, 仅默认值/json/正则三列可输入
    editFlag: true,
    editList: ["c_factor_default", "c_factor_json", "c_factor_regex"],
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
      {
        prop: "c_factor_default",
        inputtype: "rtinput",
        title: "默认值",
        placeholder: "可输入",
      },
      {
        prop: "c_factor_json",
        inputtype: "rtinput",
        title: "json",
        placeholder: "可输入",
        rules: [
          {
            validator: (rule: any, value: any, callback: any) => {
              if (value === null || value === undefined || String(value).trim() === "") {
                callback();
                return;
              }
              try {
                JSON.parse(String(value));
                callback();
              } catch (e) {
                callback(new Error("请输入正确的JSON格式"));
              }
            },
            trigger: "blur",
          },
        ],
      },
      {
        prop: "c_factor_regex",
        inputtype: "rtinput",
        title: "正则",
        placeholder: "可输入",
        rules: [
          {
            validator: (rule: any, value: any, callback: any) => {
              if (value === null || value === undefined || String(value).trim() === "") {
                callback();
                return;
              }
              try {
                new RegExp(String(value));
                callback();
              } catch (e) {
                callback(new Error("请输入正确的正则表达式"));
              }
            },
            trigger: "blur",
          },
        ],
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
        // 查询页面要素配置，回显默认值、JSON和正则
        const cfgParam = {
          cProdNo: props.data?.pageSelect?.cProdNo || "",
          cPageCode: props.data?.pageSelect?.cPkId || "",
          cComponentCode: item.cComponentKey || "",
        };
        queryPageFactorConfig(cfgParam)
          .then((cfgRes) => {
            const cfgCode = cfgRes.code;
            if ((cfgCode === 200 || cfgCode === "0") && cfgRes.data && data) {
              const configMap = new Map(
                (cfgRes.data as any[]).map((c: any) => [c.cFactorKey, c])
              );
              data.forEach((row: any) => {
                const cfg = configMap.get(row.c_pk_id);
                if (cfg) {
                  row.c_factor_default = cfg.cFactorDefault || "";
                  row.c_factor_json = cfg.cFactorJson || "";
                  row.c_factor_regex = cfg.cFactorRegex || "";
                }
              });
            }
          })
          .finally(() => {
            tableRef.value?.setFormValue(data);
          });
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
