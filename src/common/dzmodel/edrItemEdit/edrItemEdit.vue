<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5">
        <div>组件列表</div>
        <el-menu>
          <el-menu-item
            v-for="(item, index) in componentList"
            :key="index"
            @click="selectComponent(item)"
            class="component-item"
            :class="
              selectConItem.cComponentKey === item.cComponentKey
                ? 'com_active'
                : ''
            "
          >
            <template #title>
              {{ item.cComponentName }}
            </template>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="19">
        <template v-if="selectConItem.cComponentTab !== 'cvrg'">
          <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
        </template>
        <template v-else>
          <div>
            <termEdrItemEditView
              :data="data"
              :selectConItem="selectConItem"
              ref="termEdrItemEditViewRef"
            />
          </div>
        </template>
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
  </div>
</template>

<script setup lang="ts">
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
import termEdrItemEditView from "@/components/common/TermEdrItemEditView.vue";
const emits = defineEmits(["handleClose"]);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});

import { inputtype } from "@/utils/utilKey";
const componentList = ref<any[]>([]);
interface MyTableMethod {
  addRow: (arg: any) => any;
  getSelectRow: () => any;
  updateOption: (rowId: string, propKey: string, newOption: Array<any>) => void;
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  getTableValue(): () => any;
  removeRow: (dataId: string) => any;
  setValueByRowKey: (props: string, rowId: any, value: any) => void;
}

interface EdrItemEditViewRef {
  getselectCol: () => any;
  getselectKey: () => any;
}

const termEdrItemEditViewRef = ref<EdrItemEditViewRef | null>(null);

const clickBtn = ref<Array<FreeButtonBase>>([
  createFreeButtonBase({
    type: "primary",
    label: "保存",
    icon: "Select",
    func: async () => {
      let ds = [];
      const newparam: any = {};

      if (selectConItem.value["cComponentTab"] === "cvrg") {
        ds = termEdrItemEditViewRef.value?.getselectCol();
        const key = termEdrItemEditViewRef.value?.getselectKey();
        if (!key["cKeyNo"]) {
          ElMessage.warning("请先选择需要操作的条款/责任!再进行保存操作!");
          return;
        }
        newparam["cKeyNo"] = key["cKeyNo"];
      } else {
        ds = tableRef.value?.getFromValue();
      }

      const checkList = ds.filter((e: any) => {
        return e.isChecked === "1";
      });
      const param = Object.assign(selectConItem.value, {
        selectFactor: checkList,
      });
      const sel = JSON.parse(JSON.stringify(param));

      newparam["CProdNo"] = sel["c_prod_no"];
      newparam["CComponentKey"] = sel["cComponentKey"];
      newparam["CRsnCde"] = props.data.cRsnCde;
      newparam["items"] = [];
      sel["selectFactor"].forEach((v: any, key: any) => {
        const obj: any = {};
        obj["CGroup"] = v.cGroup;
        obj["CFactorKey"] = v["c_pk_id"];
        obj["CEdrItem"] = v["c_factor_prop"];
        obj["CFactorTitle"] = v["c_factor_title"];
        obj["COperTyp"] = v["c_factor_inputtype"] === "btn" ? "B" : "M"; // 按钮类型的话,则设置为按钮类型
        obj["CSortingNo"] = key + 1;
        obj["CRsnCde"] = props.data.cRsnCde;
        newparam["items"].push(obj);
      });
      saveProdEdrRsnItemList(newparam)
        .then((res: any) => {
          const { code, data, msg } = res;
          if (200 === code) {
            selectComponent(selectConItem.value);
            ElMessage.success("保存成功");
            if (selectConItem.value["cComponentTab"] !== "cvrg") {
              emits("handleClose");
            }
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    },
  }),
]);
// 定义表格数据
const tableRef = ref<MyTableMethod | null>(null);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "配置明细",
    fromSchema: [
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "2",
        },
        tableBtnWidth: 40,
        func: (d: any, row: any) => {
          if (!row["c_factor_prop"] && d === "1") {
            ElMessage.error("请先维护按钮id后,再配置该批改项!");
            tableRef.value?.setValueByRowKey("isChecked", row["_dataId"], "2");
          }
        },
      },
      {
        prop: "c_factor_inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: [{ label: "button", value: "btn" }, ...inputtype],
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
const selectConItem = ref<any>({});
function selectComponent(item: any) {
  selectConItem.value = item;
  if (item.cComponentTab === "cvrg") {
    // 条款数据,直接在批改项内部实现查询
    return;
  }
  const param = {
    CComponentKey: item.cComponentKey,
    cComponentTab: item.cComponentTab,
    CProdNo: item["c_prod_no"],
    CRsnCde: props.data.cRsnCde,
  };
  initProdEdrRsnItemList(param)
    .then((res: any) => {
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
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        let coms: any[] = [];
        if (data && data.length > 0) {
          data.forEach((el: any) => {
            coms.push(el);
          });
        }
        componentList.value = coms;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
});
const handleCancel = () => {
  props.method?.isOk();
};

const handleVisibleUpdate = (value: boolean) => {
  props.method?.isOk();
};
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
