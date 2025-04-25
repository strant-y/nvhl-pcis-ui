<!-- 特别约定组件 -->
<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <rttable v-model="formData" :item="tableconfig" ref="rttableFrom" />
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const opertaor = dataOpertaor();
const formData = ref<any[]>([]);
const dzmodal = useDzModal();
const dialog = ref<DialogMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const specEdit = defineAsyncComponent(
  () => import("@/pcis/prodRef/commodityRef/prd-fix-spec-edit.vue")
);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // title: "特约信息",
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
          if (!row.cSpecialName.includes("**")) return true;
        },
        tableClick: (row) => {
          dzmodal.open(specEdit, { type: "view", data: row }).then((res) => {
            if (res.type === "ok") {
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
          if (i !== -1) list.splice(i, 1);
          formData.value.forEach((item, index) => {
            item.cIndex = index + 1;
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
      // {
      //   prop: "cIfEdit",
      //   inputtype: "rttag",
      //   title: "是否可编辑",
      //   width: 100,
      //   loadData: [
      //     {
      //       label: "可编辑",
      //       value: "0",
      //     },
      //     {
      //       label: "不可编辑",
      //       value: "1",
      //     },
      //   ],
      // },
      {
        prop: "cIfMust",
        inputtype: "rttag",
        title: "Tag",
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
      {
        prop: "cSpecialCode",
        inputtype: "rtinput",
        title: "特约代码",
        width: 180,
      },
      {
        prop: "cSpecialName",
        inputtype: "rtinput",
        title: "特约内容",
      },
    ],
  })
);

onMounted(async () => {
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
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
  //获取特约按钮
  getSpecialAgree: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "prdFixSpec",
      {
          cProdNo: param.cProdNo,
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        },
      {
        getSelected(selectdata: any) {
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
      { title: "添加特约", width: 85 }
    );
  },
};
const handleSelectedData = (selectdata: any[]) => {
  selectdata.forEach((item: any) => {
    formData.value.push({
      index: formData.value.length + 1,
      cIfMust: "0", // 默认值，根据实际情况调整
      cSpecialCode: item['PrdFixSpec.CSpecNo'],
      cSpecialName: item['PrdFixSpec.CNmeCn'],
    });
  });
  formData.value.forEach((item, index) => {
    item.index = index + 1;
  });
};
// 绑定特殊验证器
const exRules = {};

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
/** 查询 */
function handleQuery(flag?: boolean) {
  // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  // const param = Object.assign(r);
  // getBasicKindList(param)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       formData.value = [];
  //       formData.value = data.result;
  //       pageresult.total = data.total;
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => {});
}
function getFromValue() {
  return formData.value.map((item) => {
    const prefixedItem: { [key: string]: any } = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        prefixedItem[`SpecialAgreement.${key}`] = item[key];
      }
    }
    return prefixedItem;
  });
}
// function getFromValue() {
//   return formData.value;
// }
function setFormValue(value: any) {
  Object.assign(formData.value, value);
}
function validate() {}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
});
</script>

<style scoped></style>
