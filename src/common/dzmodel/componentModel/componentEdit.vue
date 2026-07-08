<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="2">
        <el-text class="mx-1" type="primary" :size="'large'">标题按钮:</el-text>
      </el-col>
      <el-col :span="22">
        <div class="show-btn" v-for="(btn, index) in titleBtns" :key="index">
          <rt-button @click="editBtn(btn, index, 'title')" :item="btn" />
        </div>
        <div class="show-btn">
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
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="2">
        <el-text class="mx-1" type="primary" :size="'large'">尾部按钮:</el-text>
      </el-col>
      <el-col :span="22">
        <div class="show-btn" v-for="(btn, index) in endBtns" :key="index">
          <rt-button :item="btn" @click="editBtn(btn, index, 'end')" />
        </div>
        <div class="show-btn">
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
        </div>
      </el-col>
    </el-row>
    <template v-if="showEditBtnFlag">
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="2">
          <el-text class="mx-1" type="primary" :size="'large'"
            >行内编辑按钮:</el-text
          >
        </el-col>
        <el-col :span="22">
          <div class="show-btn" v-for="(btn, index) in editBtns" :key="index">
            <rt-button :item="btn" @click="editBtn(btn, index, 'edit')" />
          </div>
          <div class="show-btn">
            <rt-button
              :item="{
                type: 'primary',
                circle: true,
                icon: 'CirclePlus',
                iconSize: '18',
                func: () => {
                  const params = {
                    type: 'primary',
                    link: '1',
                    icon: 'Edit',
                  };
                  editBtns.push(params);
                },
              }"
            />
          </div>
        </el-col>
      </el-row>
    </template>

    <rt-mytable
      v-if="showFactorList"
      :tableConfig="tableconfig"
      :pageresult="pageresult"
      ref="tableRef"
      @pageChange="pageQuerySelect(false)"
    />

    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { componentType, position, showLocation } from "@/utils/utilKey";
const { getRules } = useValidator();
const dialog = ref<DialogMethod | null>(null);
import { ref, defineProps } from "vue";
const emits = defineEmits(["ok", "cancel"]);

const dialogVisible = ref(true);

const showFactorList = ref(false);
const tableRef = ref<MyTableMethod | null>(null);

const titleBtns = ref<Array<any>>([]);
const endBtns = ref<Array<any>>([]);
const editBtns = ref<Array<any>>([]);

const showEditBtnFlag = ref(false);

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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { title } from "process";
import { DialogMethod } from "../ComDialogConf";
const dzmodal = useDzModal();
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);
const showLocationList = ref<any[]>(showLocation);
const copyFromComponentKey = ref<string | null>(null);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  handleQuery: {
    type: Function,
    required: false,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});

function editBtn(btn: any, index: any, sw: any) {
  dialog.value?.open(
    "buttonEdit",
    { data: btn },
    {
      isOk: (res: any) => {
        if (sw === "title") {
          if (res.type === "success") {
            titleBtns.value[index] = res.data;
          } else {
            titleBtns.value.splice(index, 1);
          }
        } else if (sw === "edit") {
          if (res.type === "success") {
            editBtns.value[index] = res.data;
          } else {
            editBtns.value.splice(index, 1);
          }
        } else {
          if (res.type === "success") {
            endBtns.value[index] = res.data;
          } else {
            endBtns.value.splice(index, 1);
          }
        }
      },
    },
    { title: "按钮配置" }
  );
}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "组件配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        id: "DistFactorBtn",
        type: "primary",
        label: "编辑清单表单要素",
        hidden: true,
        func: () => {
          formconfig1.fromSchema?.forEach((e) => {
            if (e.prop === "componentKey") {
              if (!e.disabled) {
                ElMessage.warning("请先保存组件,再绑定表单要素!");
                return;
              }
              const ck = freeEditRef.value?.getValue("componentKey");
              dialog.value?.open("distFactorMap", { componentKey: ck }, null, {
                title: "表单信息关联",
              });
            }
          });
        },
      }),
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
        disabled: props.data.type === "edit" ? true : false,
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
        func: (val: string) => {
          if(val) {
            showLocationList.value = [];
          }
          if(val === 'free') {
            const list = [showLocation[1], showLocation[2]];
            showLocationList.value.push(...list);
          }
          if(val === 'grid') {
            showLocationList.value.push(...showLocation);
          }
          if(val === 'custom') {
            const list = [showLocation[2]];
            showLocationList.value.push(...list);
          }
        }
      },
      {
        prop: "componentTab",
        inputtype: "rtselect",
        title: "所属tab",
        typeCode: "tablist",
        rules: [getRules("required", {})],
        func: (index: any) => {
          const ct = freeEditRef.value?.getValue("componentType");
          if (ct === "custom") {
            return;
          }
          showFactorList.value = true;
          pageQuerySelect(true);

          if (["dist", "ECargoInsured", "ECargoTransportDist", "ECargoGoodsTgt", "insuredDist", "yjxGrpMember"].includes(index)) {
            showEditBtnFlag.value = true;
          } else {
            showEditBtnFlag.value = false;
          }
          formconfig1.endBtns?.forEach((e: any) => {
            if (e.id === "DistFactorBtn") {
              if (["dist", "insuredDist", "yjxGrpMember"].includes(index)) {
                // 清单信息时,可以额外录入清单编辑按钮
                e.hidden = false;
              } else {
                e.hidden = true;
              }
            }
          });

          tableconfig.fromSchema?.forEach((e: any) => {
            // if (e.prop === "cShowLocation") {
            //   if (["dist", "ECargoInsured", "ECargoTransportDist", "ECargoGoodsTgt"].includes(index)) {
            //     e.isShow = true;
            //   } else {
            //     e.isShow = false;
            //   }
            // }
          });
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
              .then((res: any) => {
                if (res.type === "ok") {
                  freeEditRef.value?.setValue("componentGroup", res.body);
                }
              });
          },
        }),
      },
      {
        prop: "componentTable",
        inputtype: "rtinput",
        title: "所属表VO",
      },
    ],
    superFromShow: "要素详情",
    superFromClose: "要素详情",
    showSuperior: true,
    superFromSchema: [],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cGroup", "cExpand", "cShowLocation","cTableWidth"],
    showEdit: true,
    formconfig: {
      fromSchema: [
        {
          prop: "cFactorKey",
          inputtype: "rtinput",
          title: "要素key",
        },
        {
          prop: "cFactorTitle",
          inputtype: "rtinput",
          title: "要素名称",
        },
      ],
    },
    titleBtns:[
      createFreeButtonBase({
        link:true,
        type: "primary",
        label:"查询", 
        icon: "Search",
        func: () => {
          pageQuerySelect(true);
        },
      }),
    ],
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
      {
        prop: "cShowLocation",
        inputtype: "rtselect",
        title: "显示位置",
        loadData: showLocationList,
      },
      {
        prop: "cTableWidth",
        inputtype: "rtinput",
        title: "要素宽度",
      },
      {
        prop: "cSysConfig",
        inputtype: "rtmultiple",
        title: "可操作域",
        multipleshow:"select",
        placeholder:"有效",
        nullValue:"0",
        loadData: [
          {
            label: "有效",
            value: "0",
          },
          {
            label: "无验证",
            value: "1",
          },
          {
            label: "无效",
            value: "2",
          },
        ],
        multipletitle:[
          {
            title:'核心',
            width:80
          },{
            title:'询价',
            width:80
          },{
            title:'移动',
            width:80
          }
        ]
      },
    ],
  })
);

onMounted(async () => {
  if (props.data.type === "edit" || props.data.type === "copy") {
    getComponentByKey({
      componentKey: props.data.data?.componentKey,
    }).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        copyFromComponentKey.value = data.cComponentKey;
        const param = {
          componentKey: data.cComponentKey,
          componentName: data.cComponentName,
          componentTab: data.cComponentTab,
          componentType: data.cComponentType,
          componentCol: data.cComponentCol,
          componentGroup: data.cComponentGroup,
          componentMyFromBtm: data.cComponentMyFromBtm,
          componentPosition: data.cComponentPosition,
          componentTable: data.cComponentTable,
        };
        freeEditRef.value?.setFormValue(param);

        // 初始化显示按钮内容
        const btns = data.btns;
        const titlebtn = btns["title"];
        const endbtn = btns["end"];
        const editbtn = btns["edit"];
        if (titlebtn && titlebtn.length > 0) {
          let title = [];
          for (let i = 0; i < titlebtn.length; i++) {
            let b: any = {};
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
            let b: any = {};
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
        if (editbtn && editbtn.length > 0) {
          let edits = [];
          for (let i = 0; i < editbtn.length; i++) {
            let b: any = {};
            Object.keys(editbtn[i]).forEach((k) => {
              if (k.startsWith("cButton")) {
                let key = k.replace("cButton", "");
                key = key.charAt(0).toLowerCase() + key.slice(1);
                b[key] = editbtn[i][k];
              }
            });
            edits.push(b);
          }
          editBtns.value = edits;
        }
        if (data.cComponentType !== "custom") {
          showFactorList.value = true;
          nextTick(() => {
            pageQuerySelect(true);
          });
        }
        if (props.data.type === "copy") {
          nextTick(() => {
            freeEditRef.value?.setValue("componentKey", "");
          });
        }
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
  if (tableRef.value && s.componentType !== "custom") {
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
    editBtns: editBtns.value,
  });
  saveComponent(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        // emits("ok", {});
        ElMessage.success("保存成功");
        formconfig1.fromSchema?.forEach((e) => {
          if (e.prop === "componentKey") {
            e.disabled = true;
          }
        });

        const ct = freeEditRef.value?.getValue("componentType");
        if (ct !== "custom") {
          showFactorList.value = true;
          pageQuerySelect(true);
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

function showView(cComponentKey: any) {
  getComponentViewByKey({
    componentKey: cComponentKey,
  }).then((res: any) => {
    const { code, data, msg } = res;
    console.log(data);
    if (200 === code) {
      dialog.value?.open(
        "componentView",
        { type: "show", data: data, conKey: cComponentKey },
        null,
        { title: "组件预览" }
      );
    }
  });
}

function pageQuerySelect(isPage: boolean = true) {
  const paraParam = tableRef.value?.getPartnerPage(isPage);

  const fromp = tableRef.value?.getFormData();
  const currentKey = freeEditRef.value?.getValue("componentKey");
  const ck = currentKey || copyFromComponentKey.value;
  const tb = freeEditRef.value?.getValue("componentTab");
  showFactorList.value = true;
  const param = {
    componentKey: ck,
    componentTab: tb,
  };

  const p = Object.assign({}, paraParam, param, fromp);
  querySelector(p);
}
function querySelector(param: any) {
  querySelectorList(param).then((res: any) => {
    const { code, data, msg, total } = res;
    if (200 === code) {
      Object.keys(data).forEach((i) => {
        if (data[i].factorPkId) {
          data[i].isChecked = "1";
        }
      });
      tableRef.value?.setFormValue(data);
      pageresult.total = total;
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
.show-btn {
  display: inline-block;
  margin-left: 10px;
}
</style>
