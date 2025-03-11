<template>
  <div>
    <el-row>
      <el-col :span="24">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      </el-col>
      <el-col :span="24">
        <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="21"> </el-col>
      <el-col :span="3">
        <el-button @click="savegroupinfo" type="primary">保存</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { VueDraggable } from "vue-draggable-plus";
import {
  getGroupInfo,
  getTermFactorInfo,
  getTRFactorList,
  querySelectorList,
  saveGroupInfo,
  saveTermFactorInfo,
  saveTRFactorList,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { iconPropType } from "element-plus/es/utils";
import { inputtype, showtype, yesOrNo } from "@/utils/utilKey";
import { styleType } from "element-plus/es/components/table-v2/src/common";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const { getRules } = useValidator();

const tableRef = ref<MyTableMethod | null>(null);
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
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
const emits = defineEmits(["handleClose"]);

const factorList = ref<any>([]);

onMounted(() => {
  getDictFormData();
  freeEditRef.value?.setFormValue({ cFactorTabType: "free" });
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromSchema: [
      {
        prop: "cFactorTabType",
        inputtype: "rtselect",
        title: "数据样式",
        loadData: [
          {
            label: "表单",
            value: "free",
          },
          {
            label: "平铺表格",
            value: "table",
          },
          {
            label: "表格",
            value: "grid",
          },
        ],
        func: (val: any) => {
          let h = false;
          if (val === "free" || val === "table") {
            h = true;
          }
          formconfig1.fromSchema?.forEach((item) => {
            if (
              item.prop === "cFactorTabTitle" ||
              item.prop === "cFactorTabValue"
            ) {
              item.hidden = h;
            }
          });
        },
      },
      {
        prop: "cFactorTabTitle",
        inputtype: "rtinput",
        title: "组件标题",
        rules: [getRules("required", {})],
        hidden: true,
      },
      {
        prop: "cFactorTabValue",
        inputtype: "rtinput",
        title: "组件值列",
        rules: [getRules("required", {})],
        hidden: true,
      },
    ],
  })
);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
function getDictFormData() {
  getTermFactorInfo({ termNo: props.data.data.cTermNo, tabKey: "cvrg" }).then(
    (res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (data.datalist) {
          data.datalist.forEach((e: any) => {
            if (e.cPkId) {
              e.isChecked = "1";
            }
          });
        }
        tableRef.value?.setFormValue(data.datalist);
        if (data.confs) {
          const conf = data.confs;
          const c = JSON.parse(conf.CCnm);
          freeEditRef.value?.setFormValue(c);
        }
        console.log(data);
      } else {
        ElMessage.error(msg);
      }
    }
  );
}

function savegroupinfo() {
  const select = tableRef.value?.getFromValue();
  let selectList = select?.filter((node: any) => node.isChecked === "1");
  freeEditRef.value?.validate().then((res: any) => {
    if (res) {
      const t = freeEditRef.value?.getFromValue();
      saveTermFactorInfo({
        termNo: props.data.data.cTermNo,
        selectList: selectList,
        titleConf:t
      }).then((res: any) => {
        const { code, data, msg } = res;
        if (200 === code) {
          ElMessage.success("保存成功");
          getDictFormData();
        } else {
          ElMessage.error(msg);
        }
      });
    }
  });
}

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cPorpRequired","cFactorShowtitle"],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        width: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 40,
        func: (v: any,row: any) => {
          if (v !== "1") {
            if(row.cFactorShowtitle === '1'){
              tableRef.value?.setValueByRowKey("cFactorShowtitle", row._dataId, '0');
            }
         }
        },
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "cPorpRequired",
        inputtype: "rtswitch",
        title: "是否必填",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {},
      },
      {
        prop: "cPorpShowtitle",
        inputtype: "rtcheckbox",
        title: "显示在标题栏",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any,row: any) => {
          if(v === '1'){
            if(row.isChecked !== '1'){
              ElMessage.warning("该数据未选中,不能加入标题栏!");
              tableRef.value?.setValueByRowKey("cFactorShowtitle", row._dataId, '0');
            }
            const t = tableRef.value?.getFromValue();
            const f = t.filter((node: any) => node.cFactorShowtitle === '1');
            if(f.length > 2){
              ElMessage.warning("最多只允许2个要素加入标题栏!");
              tableRef.value?.setValueByRowKey("cFactorShowtitle", row._dataId, '0');
            }
          }
        },
      },
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "要素名称",
      },
    ],
  })
);
</script>

<style scoped></style>
