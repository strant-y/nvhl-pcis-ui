<template>
  <div>
    <el-row>
      <el-col :span="8">
        <div class="search-btn">
          <span style="font-size: 16px">选择条款/责任</span>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="search-btn">
          <span style="font-size: 16px">选择批改要素</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div style="height: 180px; border: 1px solid #f3f3f3; overflow-y: auto">
          <el-tree
            ref="mainRef"
            style="max-height: 600px"
            :props="dataprops"
            node-key="cKeyNo"
            :check-strictly="true"
            :data="data1"
            show-checkbox
            :checkStrictly="true"
            @nodeClick="selectNode"
          />
        </div>
      </el-col>
      <el-col :span="16">
        <div>
          <rt-mytable :tableConfig="factorconfig" ref="factorRef" />
        </div>
      </el-col>
      <el-col :span="24">
        <rt-mytable :tableConfig="tableconfig" ref="tableRef" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  getFactorTermByProd,
  getPrdTermByProd,
  initProdEdrRsnItemList,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { inputtype } from "@/utils/utilKey";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);
const isFree = ref(true);
const isCopy = ref(false);
const showMsg = ref("组件预览");
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  selectConItem: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});

const dataprops = {
  children: "riskRelList",
  label: "cNmeCn",
  id: "cKeyNo",
  disabled: "disabled",
};

const tableRef = ref<MyTableMethod | null>(null);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 50,
        func: (v: any, b: any) => {
          const res = factorRef.value?.getFromValue();
          const s = res.find(
            (item: any) => item.cFactorProp === b.c_factor_prop
          );
          if (s) {
            factorRef.value?.setValueByRowKey("isChecked", s._dataId, v);
          }
        },
      },
      {
        prop: "c_factor_inputtype",
        title: "要素类型",
        inputtype: "rtselect",
        loadData: [{ label: "button", value: "btn" }, ...inputtype],
      },
      {
        prop: "c_factor_prop",
        title: "要素key",
        inputtype: "rtinput",
      },
      {
        prop: "c_factor_title",
        title: "要素名称",
        inputtype: "rtinput",
      },
    ],
  })
);

const factorRef = ref<MyTableMethod | null>(null);

const factorconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    maxHeight: "180px",
    fromSchema: [
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 50,
        func: (v: any, b: any) => {
          const res = tableRef.value?.getFromValue();
          const s = res.find(
            (item: any) => item.c_factor_prop === b.cFactorProp
          );

          if (v === "1") {
            if (s) {
              tableRef.value?.setValueByRowKey("isChecked", s._dataId, v);
            } else {
              let keyNo = selectNodeObj.value["cKeyNo"];

              let k1 = keyNo;
              let k2 = null;
              if (selectNodeObj.value.ctype === "2") {
                const termNo = sn.value["parent"]["data"]["cKeyNo"];
                k1 = termNo;
                k2 = keyNo;
              }
              tableRef.value?.addRow({
                c_factor_inputtype: b.cFactorInputtype,
                c_factor_prop: b.cFactorProp,
                c_factor_title: b.cFactorTitle,
                c_pk_id: b.cPkId,
                cGroup: k1,
                cFldId: k2,
                isChecked: "1",
              });
            }
          } else {
            if (s) {
              tableRef.value?.deleteByRowKey(s._dataId);
            }
          }
        },
      },
      {
        prop: "cFactorInputtype",
        title: "要素类型",
        inputtype: "rtselect",
        loadData: inputtype,
      },
      {
        prop: "cFactorProp",
        title: "要素key",
        inputtype: "rtinput",
      },
      {
        prop: "cFactorTitle",
        title: "要素名称",
        inputtype: "rtinput",
      },
    ],
  })
);

const data1 = ref([]);
const mainRef = ref<InstanceType<typeof ElTree>>();
const additionalRef = ref<InstanceType<typeof ElTree>>();
const data2 = ref([]);

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

const planBtn = [
  {
    c_factor_inputtype: "btn",
    c_factor_prop: "delPlan_btn",
    c_factor_title: "删除方案",
  },
  {
    c_factor_inputtype: "btn",
    c_factor_prop: "addPlan_btn",
    c_factor_title: "增加条款",
  },
];

const tempBtn = [
  {
    c_factor_inputtype: "btn",
    c_factor_prop: "delete_btn",
    c_factor_title: "删除条款",
  },
  {
    c_factor_inputtype: "btn",
    c_factor_prop: "addrisk_btn",
    c_factor_title: "增加责任",
  },
  {
    c_factor_inputtype: "btn",
    c_factor_prop: "delrisk_btn",
    c_factor_title: "删除责任",
  },
];


onMounted(async () => {
  queryEdrConfig();
  initSelectData();
});

async function queryEdrConfig() {
  const param = props.data;
  const res = await getPrdTermByProd(param).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      if (data.data && data.data.length > 0) {
        data.data.forEach((item: any) => {
          item.disabled = true;
          if (item.riskRelList && item.riskRelList.length > 0) {
            item.riskRelList.forEach((e: any) => {
              e.disabled = true;
            });
          }
        });
      }
      data1.value = data.data;
    } else {
      ElMessage.error(msg);
    }
  });
}

async function initSelectData() {
  const item = props.selectConItem;
  let param: any = {
    CComponentKey: item.cComponentKey,
    cComponentTab: item.cComponentTab,
    CProdNo: item["c_prod_no"],
    CRsnCde: props.data.cRsnCde,
  };

  if (selectNodeObj.value["cKeyNo"]) {
    param["updateKey"] = getselectKey();
  }
  const res: any = await initProdEdrRsnItemList(param);
  const { code, data, msg } = res;
  if (200 === code) {
    let addData: any[] = [];
    if (item.cComponentKey === "webPlyCvrg04") {
      planBtn.forEach((e: any) => {
        const r = data.filter((d: any) => d.c_factor_prop === e.c_factor_prop);
        if (r && r.length === 0) {
          addData.push(e);
        }
      });
    }
    tempBtn.forEach((e: any) => {
      const r = data.filter((d: any) => d.c_factor_prop === e.c_factor_prop);
      if (r && r.length === 0) {
        addData.push(e);
      }
    });

    if (data && data.length > 0) {
      data.forEach((element: any) => {
        if (element.factorPkId) {
          element.isChecked = "1";
        } else {
          element.isChecked = "2";
        }
        planBtn.forEach((e: any) => {
          if (e.c_factor_prop === element.c_factor_prop)
            element.c_factor_title = e.c_factor_title;
        });
        tempBtn.forEach((e: any) => {
          if (e.c_factor_prop === element.c_factor_prop)
            element.c_factor_title = e.c_factor_title;
        });
        addData.push(element);
      });
    }
    tableRef.value?.setFormValue(addData);
  } else {
    ElMessage.error(msg);
  }
}

const selectNodeObj = ref<any>({});
const sn = ref<any>({});
async function selectNode(a: any, b: any) {
  selectNodeObj.value = a;
  sn.value = b;
  await initSelectData();
  mainRef.value?.setCheckedKeys([a.cKeyNo], false);
  let parm = Object.assign({}, a);
  if (a.ctype === "2") {
    const termNo = b["parent"]["data"]["cKeyNo"];
    parm = Object.assign({}, parm, { cTermNo: termNo });
  }
  getFactorTermByProd(parm).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      const res = tableRef.value?.getFromValue();
      data.data.forEach((element: any) => {
        const s = res.find(
          (item: any) => item.c_factor_prop === element.cFactorProp
        );
        if (s) {
          element.isChecked = "1";
        } else {
          element.isChecked = "2";
        }
      });
      factorRef.value?.setFormValue(data.data);
    } else {
      ElMessage.error(msg);
    }
  });
}

function getselectCol() {
  return tableRef.value?.getFromValue();
}

function getselectKey() {
  const cKeyNo = selectNodeObj.value["cKeyNo"];
  let par: any = { cKeyNo: cKeyNo, ctype: selectNodeObj.value.ctype };
  if (selectNodeObj.value.ctype === "2") {
    const termNo = sn.value["parent"]["data"]["cKeyNo"];
    par["termNo"] = termNo;
  }

  return par;
}
function fail() {
  emits("handleClose");
}

defineExpose({
  getselectCol,
  getselectKey,
});
</script>

<style scoped>
.inline-block-div {
  display: inline-block;
}
.search-btn {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f3f3;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
