<!-- 特别约定组件 -->
<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <el-form ref="specialAgr" :model="formData" :inline-message="true">
        <rttable
            v-model="formData"
            :item="tableconfig"
            ref="rttableFrom"
          />
      </el-form>
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
const specialAgr = ref("specialAgr");
const formData = ref<any[]>([]);
const dzmodal = useDzModal();
const dialog = ref<DialogMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const cardconfig = ref(creatCardConfig({}));
const moveUpTimer = ref(null)
const moveDownTimer = ref(null)
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
    align: 'left',
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row) => {
          if(!row.b.includes('****')) return true
        },
        tableClick: (row) => {
          console.log(row);
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
          const i = list.findIndex((item) => item.id === row.id);
          if (i !== -1) list.splice(i, 1);
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
          if(row.index == 1) return true
        },
        tableClick: (row) => {
          moveUp(row.index - 1)
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
          if(row.index == formData.value.length) return true
        },
        tableClick: (row) => {
          moveDown(row.index -1)
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
        prop: "c",
        inputtype: "rttag",
        title: "Tag",
        width: 110,
        loadData: [
            {
              label: "必选",
              value: "0",
            },
            {
              label: "自定义录入",
              value: "1",
            },
        ],
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "特约名称",
        width: 180,
      },
      {
        prop: "b",
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
  // 获取列表数据
  handleQuery(true);
  formData.value = [
    { id: 12, index: "ss", b: "包含可编辑****的内容",c: "",d: 'test' },
    { id: 11, index: "asdas", b: "43", c: '1',d: 'test' },
    { id: 11, index: "asdas", b: "43242323", c: '',d: 'test' },
  ]
  formData.value.forEach((item, index) => {
    item.index = index+1
  })
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
      type: "show",
      data: {
        cProdNo: param.cProdNo,
        selectedData:formData.value
      },
    },
    {
      isOk: (selectdata: any) => {
        selectdata.forEach((item: any) => {
          formData.value.push(item);
        });
      },
    },
    { title: "添加特约", width: 85 }
  );
  }
};
// 绑定特殊验证器
const exRules = {};

// 上移一行
const moveUp = async(index) => {
  const tableData = formData.value
  if (index > 0) {
    [tableData[index], tableData[index - 1]] = [tableData[index - 1], tableData[index]];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if(moveUpTimer.value) {
    clearTimeout(moveUpTimer.value)
  }
  moveUpTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1
    })
  }, 0)
};

// 下移一行
const moveDown = (index) => {
  const tableData = formData.value
  if (index < tableData.length - 1) {
    [tableData[index], tableData[index + 1]] = [tableData[index + 1], tableData[index]];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if(moveDownTimer.value) {
    clearTimeout(moveDownTimer.value)
  }
  moveDownTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1
    })
  }, 0)
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
function getFromValue () {
  return formData.value;
}
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
