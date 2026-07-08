<!-- 用户管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />

    <el-affix
      style="right: 25px; position: fixed; z-index: 1000"
      v-if="compareList?.length > 0"
    >
      <div
        style="
          border: 2px dashed var(--el-border-color);
          width: 150px;
          background-color: var(--el-border-color-extra-light);
        "
      >
        <el-row style="margin: 5px">
          <template v-for="item in compareList" :key="item.cComponentKey">
            <el-col :span="21">
              <el-text type="primary">{{ item.cComponentName }}</el-text>
            </el-col>
            <el-col :span="2" style="align-items: center">
              <rtIcon
                style="margin-top: 4px"
                :item="{
                  icon: 'CloseBold',
                  iconColor: '#8b8b8b',
                  func: () => {
                    // 从compareList中删除该元素
                    compareList = compareList.filter(
                      (t) => t.cComponentKey !== item.cComponentKey
                    );
                  },
                }"
              />
            </el-col>
          </template>
          <el-col :span="2"> </el-col>
          <el-col :span="13">
            <el-button type="info" size="small" @click="compareList = []"
              >清空</el-button
            >
          </el-col>
          <el-col :span="9">
            <el-button type="primary" size="small" @click="showCompare"
              >比较</el-button
            >
          </el-col>
        </el-row>
      </div>
    </el-affix>
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />

    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import { formatActionTitle } from "@/utils/action-title";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { DialogMethod } from "../../common/dzmodel/ComDialogConf";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  getComponentViewByKey,
  getComponentList,
  querySelectorList,
  releaseByComptype,
} from "@/api/prod";

const tableRef = ref<AppTableMethod | null>(null);
const dialog = ref<DialogMethod | null>(null);
const compareList = ref<any>([]);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "组件配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "根据tab全量更新组件",
        type:'success',
        func: () => {
          const k = freeEditRef.value?.getValue('cComponentTab');
          if(!k){
            ElMessage.error('请选择要更新的组件tab!');
            return ;
          }
          

          ElMessageBox.confirm(
            '确认是否执行组件'+k+'的全量更新吗?',
            '提示',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'info',
            }
          ).then(() => {
            releaseByComptype({
              cComponentCode: k,
            }).then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("更新成功");
              }else{
                console.log(res);
                ElMessage.error("更新失败");
              }
            });
          })
        },
      }),
    ],
    fromSchema: [
      {
        prop: "componentId",
        inputtype: "rtinput",
        title: "组件主键",
        clearable: true,
      },
      {
        prop: "componentName",
        inputtype: "rtinput",
        title: "组件名称",
        clearable: true,
      },
      {
        prop: "cComponentTab",
        inputtype: "rtselect",
        title: "所属tab",
        clearable: true,
        typeCode: "tablist",
      },
    ],
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: function () {
          dialog.value?.open(
            "componentEdit",
            { type: "add", data: {} },
            {
              isOk: (res: any) => {
                console.log(res);
                if (res.type === "ok") {
                  handleQuery();
                }
              },
            },
            { title: formatActionTitle("add", "组件设计"),draggable :false }
          );
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 250,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {

          dialog.value?.open(
            "componentEdit",
            {
              type: "edit",
              data: { componentKey: row.cComponentKey },
            },
            {
              isOk: (res: any) => {
                console.log(res);
                if (res.type === "ok") {
                  handleQuery();
                }
              },
            },
            { title: formatActionTitle("edit", "组件设计"),draggable :false }
          );
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        func: function () {},
      }),
      createFreeButtonBase({
        id: "score",
        type: "primary",
        tooltip: "预览",
        icon: "View",
        link: true,
        tableClick: function (row) {
          showView("view", row.cComponentKey);
        },
      }),
      createFreeButtonBase({
        id: "score",
        iconColor: "#02D05F",
        tooltip: "复制",
        icon: "DocumentCopy",
        link: true,
        tableClick: function (row) {
          dialog.value?.open(
            "componentEdit",
            {
              type: "copy",
              data: { componentKey: row.cComponentKey },
            },
            {
              isOk: (res: any) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              },
            },
            { title: formatActionTitle("copy", "组件设计"), draggable: false }
          );
        },
      }),
      createFreeButtonBase({
        id: "score",
        tooltip: "对比",
        icon: "menu",
        link: true,
        tableClick: (row: any) => {
          if (compareList.value.length < 2) {
            const com = compareList.value.find(
              (item: any) => item.cComponentKey === row.cComponentKey
            );
            if (!com) {
              compareList.value.push(row);
            }
          } else {
            ElMessage({
              message: "仅支持同时两个组件的对比",
              type: "warning",
            });
          }
        },
      }),
      createFreeButtonBase({
        id: "refresh",
        tooltip: "组件刷新",
        icon: "Refresh",
        link: true,
        tableClick: (row: any) => {
          console.log(row);
          ElMessageBox.confirm(
            '确认是否执行组件'+row.cComponentName+'的更新操作吗?',
            '提示',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'info',
            }
          ).then(() => {
            releaseByComptype({
              cComponentCode: row.cComponentTab,
              cComponentKey: row.cComponentKey,
            }).then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("更新成功");
              }else{
                console.log(res);
                ElMessage.error("更新失败");
              }
            });
          })
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cComponentKey",
        inputtype: "rtinput",
        title: "组件主键",
      },
      {
        prop: "cComponentName",
        inputtype: "rtinput",
        title: "组件名称",
      },
      {
        prop: "cComponentTab",
        inputtype: "rtselect",
        title: "归属tab",
        typeCode: "tablist",
      },
    ],
  })
);

onMounted(async () => {});
function showView(type: string, cComponentKey: any) {
  getComponentViewByKey({
    componentKey: cComponentKey,
  }).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      dialog.value?.open(
        "componentView",
        { type: type, data: data, conKey: cComponentKey },
        {
          isOk: () => {
            handleQuery();
          },
        },
        { title: type === "copy" ? "组件复制" : "组件预览" }
      );
    }
  });
}

async function showCompare() {
  if (compareList.value.length != 2) {
    ElMessage({
      message: "2个组件才能进行对比",
      type: "warning",
    });
    return;
  }
  const comList = compareList.value.map((item: any) => {
    return item.cComponentKey;
  });
  getComponentViewByKey({
    componentKeys: comList,
  }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      dialog.value?.open(
        "componentCompare",
        { type: "compare", data: data },
        {
          isOk: () => {
            handleQuery();
          },
        },
        { title: "组件对比", width: "95" }
      );
    }
  });
}

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
function handleQuery(type?: boolean) {
  const r = tableRef.value?.getPartnerPage(type); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getComponentList(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = res.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>
