<template>
  <myCard :cardConfig="cardconfig">
    <rttable v-model="formData" :item="tableconfig" ref="rttableFrom" />
  </myCard>
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {getPrdDeductible} from "@/api/prod/index";
import { useRoute } from "vue-router";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";

import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const route = useRoute();
const opertaor = dataOpertaor();
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const deductibleFixEdit = defineAsyncComponent(() => import("@/pcis/prodRef/commodityRef/DeductibleFixEdit.vue"));


const formconfig1 = reactive(createAppGridEditConfig({}));
const dialog = ref<DialogMethod | null>(null);
const formData = ref<any[]>([]);
const rttableFrom = ref<any>(null);
const cardconfig = ref(creatCardConfig({}));
const moveUpTimer = ref(null);
const moveDownTimer = ref(null);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

onMounted(()=>{
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
  formData.value = [];
  formData.value.forEach((item, index) => {
    item.index = index + 1;
  });
})

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // title: "免赔信息",
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    align: "left",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row) => {
          if (!row.cDeductibleContent.includes("**")) return true;
        },
        tableClick: (row) => {
          dzmodal.open(deductibleFixEdit, { 
            type: "view", 
            data: row , 
            callback: (res: any) => {
              if (res.type === "ok") {
                row.cDeductibleContent = res.data.cDeductibleContent
              }
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          const list = formData.value;
          const i = list.findIndex((item) => item.cSpecNo === row.cSpecNo);
          rttableFrom.value.delRow(row._dataId);
          // if (i !== -1) list.splice(i, 1);
          formData.value.forEach((item, index) => {
            item.index = index + 1;
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "上移",
        type: "success",
        size: "large",
        icon: "Top",
        hideBtns: (row) => {
          if (row.index == 1) return true;
        },
        tableClick: (row) => {
          moveUp(row.index - 1);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "下移",
        type: "success",
        size: "large",
        icon: "Bottom",
        hideBtns: (row) => {
          if (row.index == formData.value.length) return true;
        },
        tableClick: (row) => {
          moveDown(row.index - 1);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "index",
        inputtype: "rtinput",
        title: "序号",
        width: 100,
      },
      {
        prop: "cIfMust",
        inputtype: "rttag",
        title: "是否可选",
        width: 110,
        loadData: [
          {
            label: "可选",
            value: "0",
          },
          {
            label: "必选",
            value: "1",
          },
          {
            label: "自定义",
            value: "2",
          },
        ],
      },
      // {
      //   prop: "cPkId",
      //   inputtype: "rtinput",
      //   title: "免赔条件ID",
      //   width: 180,
      // },
      {
        prop: "cDeductibleContent",
        inputtype: "rtinput",
        title: "免赔内容",
      },
    ],
  })
);



// 上移一行
const moveUp = async (index) => {
  const tableData = formData.value;
  if (index > 0) {
    [tableData[index], tableData[index - 1]] = [
      tableData[index - 1],
      tableData[index],
    ];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if (moveUpTimer.value) {
    clearTimeout(moveUpTimer.value);
  }
  moveUpTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1;
    });
  }, 0);
};

// 下移一行
const moveDown = (index) => {
  const tableData = formData.value;
  if (index < tableData.length - 1) {
    [tableData[index], tableData[index + 1]] = [
      tableData[index + 1],
      tableData[index],
    ];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if (moveDownTimer.value) {
    clearTimeout(moveDownTimer.value);
  }
  moveDownTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1;
    });
  }, 0);
};


// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcdeDuctiadd: () => {
  },
  //获取免赔
  getDuductible: () => {

  },
  //查询免赔
  queryDeductible: () => {

    dialog.value?.open('deductibleFix', {
          cProdNo: route.params.param.cProdNo,
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        }, 
        { getSelected(selectdata: any) {
                let len = formData.value.length;
                let sel : any[] = [];
                selectdata.forEach((item: any,index:number) => {
                  item.index = len + 1;
                  sel.push(item);
                  len++;
                });
                sel.forEach((item) => {
                  rttableFrom.value.addRowByData(item);
                });
              },
        }, 
        { title: "添加免赔条件", width: 85 });
  },
  funcpaydel: () => {
  },
};

// 绑定特殊验证器
const exRules = {};

function getFormconfig() {
  return formconfig1;
}

defineExpose({
  getFormconfig,
});
</script>

<style scoped></style>
