<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="2">
        <el-text class="mx-1" type="primary" :size="'large'">标题按钮:</el-text>
      </el-col>
      <el-col :span="2" v-for="(btn, index) in titleBtns" :key="index">
        <rt-button @click="editBtn(btn, index, 'title')" :item="btn" />
      </el-col>
      <el-col :span="2">
        <rt-button
          :item="{
            type: 'primary',
            circle: true,
            icon: 'CirclePlus',
            iconSize: '18',
            func: () => {
              const params = {
                type: 'primary',
                label: '按钮',
              };
              titleBtns.push(params);
            },
          }"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="2">
        <el-text class="mx-1" type="primary" :size="'large'">尾部按钮:</el-text>
      </el-col>
      <el-col :span="2" v-for="(btn, index) in endBtns" :key="index">
        <rt-button :item="btn" @click="editBtn(btn, index, 'end')" />
      </el-col>
      <el-col :span="2">
        <rt-button
          :item="{
            type: 'primary',
            circle: true,
            icon: 'CirclePlus',
            iconSize: '18',
            func: () => {
              const params = {
                type: 'primary',
                label: '按钮',
              };
              endBtns.push(params);
            },
          }"
        />
      </el-col>
    </el-row>
    <rt-mytable
      v-if="showFactorList"
      :tableConfig="tableconfig"
      ref="tableRef"
    />
  </el-dialog>
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { componentType, position } from "@/utils/utilKey";
const { getRules } = useValidator();
const dialog = ref<DialogMethod | null>(null);
import { ref, defineProps } from "vue";
const emits = defineEmits(["ok", "cancel"]);

const props = defineProps({
  data: Object,
  type: String,
});

const dialogVisible = ref(true);

const showFactorList = ref(false);
const tableRef = ref<MyTableMethod | null>(null);

const titleBtns = ref<Array<any>>([]);
const endBtns = ref<Array<any>>([]);

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype, freeCol } from "@/utils/utilKey";
import {
  getComponentByKey,
  getComponentViewByKey,
  querySelectorList,
  saveComponent,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { useDzModal } from "@/views/dzmodel/DzModalService";
import { title } from "process";
import { DialogMethod } from "../dzmodel/ComDialogConf";
const dzmodal = useDzModal();
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/views/dzmodel/jsonArrayEdit.vue")
);
const buttonEdit = defineAsyncComponent(() => import("./buttonEdit.vue"));

function editBtn(btn: any, index: any, sw: any) {
  console.log(btn, "=====");
  dzmodal
    .open(buttonEdit, {
      data: btn,
    })
    .then((res) => {
      if (res.type === "ok") {
        if (sw === "title") {
          if (res.body.type === "success") {
            titleBtns.value[index] = res.body.data;
          } else {
            titleBtns.value.splice(index, 1);
          }
        } else {
          if (res.body.type === "success") {
            endBtns.value[index] = res.body.data;
          } else {
            endBtns.value.splice(index, 1);
          }
        }
      }
    });
}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "组件配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: () => {
          save();
        },
      }),
      createFreeButtonBase({
        type: "success",
        label: "预览",
        func: () => {
          const ck = freeEditRef.value?.getValue("componentKey");
          showView(ck);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "componentKey",
        inputtype: "rtinput",
        title: "组件主键",
        placeholder: "请输入主键",
        disabled: props.type === "edit" ? true : false,
        rules: [getRules("required", {})],
      },
      {
        prop: "componentName",
        inputtype: "rtinput",
        title: "组件名称",
      },
      {
        prop: "componentType",
        inputtype: "rtselect",
        title: "组件类型",
        loadData: componentType,
      },
      {
        prop: "componentTab",
        inputtype: "rtselect",
        title: "所属tab",
        typeCode: "tablist",
        rules: [getRules("required", {})],
        func: (index: any) => {
          const ck = freeEditRef.value?.getValue("componentKey");
          showFactorList.value = true;
          const param = {
            componentKey: ck,
            componentTab: index,
          };
          querySelector(param);
        },
      },
      {
        prop: "componentCol",
        inputtype: "rtselect",
        title: "组件列",
        loadData: freeCol,
      },
      {
        prop: "componentMyFromBtm",
        inputtype: "rtselect",
        title: "是否允许折叠",
        loadData: yesOrNo,
      },
      {
        prop: "componentPosition",
        inputtype: "rtselect",
        title: "尾部按钮位置",
        loadData: position,
      },
      {
        prop: "componentGroup",
        inputtype: "rtinput",
        title: "分组信息",
        type: "textarea",
        itemWidth: 2,
        showExBtn: true,
        btnWidth: 10,
        readonly: true,
        btnItems: createFreeButtonBase({
          icon: "Edit",
          func: () => {
            const ck = freeEditRef.value?.getValue("componentGroup");
            dzmodal
              .open(jsonArrayEdit, {
                data: ck,
                inititle: ["id", "title"],
              })
              .then((res) => {
                if (res.type === "ok") {
                  freeEditRef.value?.setValue("componentGroup", res.body);
                }
              });
          },
        }),
      },
    ],
    superFromShow: "要素详情",
    superFromClose: "要素详情",
    showSuperior: true,
    superFromSchema: [],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cGroup", "cExpand"],
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
      },
      {
        prop: "c_factor_inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
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
        prop: "cGroup",
        inputtype: "rtinput",
        title: "分组",
      },
      {
        prop: "cExpand",
        inputtype: "rtselect",
        title: "折叠内容",
        loadData: yesOrNo,
      },
    ],
  })
);

onMounted(async () => {
  if (props.type === "edit") {
    getComponentByKey({
      componentKey: props.data?.componentKey,
    }).then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        const param = {
          componentKey: data.data.cComponentKey,
          componentName: data.data.cComponentName,
          componentTab: data.data.cComponentTab,
          componentType: data.data.cComponentType,
          componentCol: data.data.cComponentCol,
          componentGroup: data.data.cComponentGroup,
          componentMyFromBtm: data.data.cComponentMyFromBtm,
          componentPosition: data.data.cComponentPosition,
        };
        freeEditRef.value?.setFormValue(param);

        // 初始化显示按钮内容
        const btns = data.data.btns;
        const titlebtn = btns["title"];
        const endbtn = btns["end"];
        if (titlebtn && titlebtn.length > 0) {
          let title = [];
          for (let i = 0; i < titlebtn.length; i++) {
            let b = {};
            Object.keys(titlebtn[i]).forEach((k) => {
              if (k.startsWith("cButton")) {
                let key = k.replace("cButton", "");
                key = key.charAt(0).toLowerCase() + key.slice(1);
                b[key] = titlebtn[i][k];
              }
            });
            title.push(b);
          }
          titleBtns.value = title;
        }
        if (endbtn && endbtn.length > 0) {
          let ends = [];
          for (let i = 0; i < endbtn.length; i++) {
            let b = {};
            Object.keys(endbtn[i]).forEach((k) => {
              if (k.startsWith("cButton")) {
                let key = k.replace("cButton", "");
                key = key.charAt(0).toLowerCase() + key.slice(1);
                b[key] = endbtn[i][k];
              }
            });
            ends.push(b);
          }
          endBtns.value = ends;
        }
        showFactorList.value = true;
        querySelector(param);
      }
    });
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/** 查询 */
function save() {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  let selectList = Array<any>();
  if (tableRef.value) {
    const all = tableRef.value?.getFromValue();
    all.forEach((item: any) => {
      if (item.isChecked === "1") {
        selectList.push(item);
      }
    });
  }

  const param = Object.assign(s, {
    selectFactor: selectList,
    titleBtns: titleBtns.value,
    endBtns: endBtns.value,
  });
  saveComponent(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        // emits("ok", {});
        ElMessage.success("保存成功");
        formconfig1.fromSchema?.forEach((e) => {
          if (e.prop === "componentKey") {
            e.disabled = true;
          }
        });

        const ck = freeEditRef.value?.getValue("componentKey");
        const tb = freeEditRef.value?.getValue("componentTab");
        showFactorList.value = true;
        const param = {
          componentKey: ck,
          componentTab: tb,
        };
        querySelector(param);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

function showView(cComponentKey: any) {
  getComponentViewByKey({
    componentKey: cComponentKey,
  }).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      dialog.value?.open(
        "componentView",
        { type: "show", data: data?.data, conKey: cComponentKey },
        null,
        { title: "组件预览" }
      );
    }
  });
}

function querySelector(param: any) {
  querySelectorList(param).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      Object.keys(data.data).forEach((i) => {
        if (data.data[i].factorPkId) {
          data.data[i].isChecked = "1";
        }
      });
      tableRef.value?.setFormValue(data.data);
    } else {
      ElMessage.error(msg);
    }
  });
}
</script>

<style scoped>
.container {
  width: 300px; /* 设置固定宽度 */
  height: 250px; /* 设置固定高度 */
  overflow-y: auto; /* 开启垂直滚动条 */
}
.drag-container {
  height: 100%; /* 让列表填充整个容器高度 */
}
.list-item {
  border: 1px solid #ccc; /* 设置列表项边框 */
  padding: 10px; /* 设置列表项内边距 */
  margin-top: 5px; /* 设置列表项间的间隔 */
  background-color: #fff; /* 设置列表项背景色 */
  cursor: move; /* 设置移动指针样式 */
}
</style>
