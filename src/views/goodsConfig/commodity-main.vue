<!-- 用户管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const router = useRouter();
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { formatActionTitle } from "@/utils/action-title";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { delUndrClsById, qryCommodityBasePage } from "@/api/prod";
const dzmodal = useDzModal();

const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "商品配置列表",
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
        func: () => {
          freeEditRef.value?.resetFields();
          // handleQuery();
        }, 
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品名称",
        typeCode: "PROD_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        clearable: true,
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
        clearable: true,
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        clearable: true,
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: {
          cParCde: "commodity_status",
        },
      },
      {
        prop: "factorTab",
        inputtype: "rtselect",
        title: "商品类型",
        clearable: true,
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: {
          cParCde: "commodity_type",
        },
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
        clearable: true,
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
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "add",
              }),
              title: formatActionTitle("add", "商品配置"),
            },
          });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row: any) => {
            // &&    param.editType !== "edit" 
          if ( row.cStatus === '0' ||row.cStatus === '3' || row.cStatus === '6' ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "edit",
                cCommodityNo: row.cCommodityNo,
              }),
              title: formatActionTitle("edit", "商品配置"),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "提交审核",
        type: "success",
        size: "large",
        icon: "Upload",
        hideBtns: (row: any) => {
          if ( row.cStatus === '2' ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "upload",
                cCommodityNo: row.cCommodityNo,
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "view",
                cCommodityNo:row.cCommodityNo,
              }),
              title: formatActionTitle("view", "商品配置"),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "copy",
        iconColor: "#02D05F",
        tooltip: "复制",
        icon: "DocumentCopy",
        link: true,
        hideBtns: (row: any) => {
          if (row.cStatus === "0" || row.cStatus === "3" || row.cStatus === "6") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "copy",
                cCommodityNo: row.cCommodityNo,
              }),
              title: formatActionTitle("copy", "商品配置"),
            },
          });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   type: "danger",
      //   tooltip: "删除",
      //   icon: "Delete",
      //   link: true,
      //   tableClick: (row) => {
      // delUndrClsById(row)
      //   .then((res) => {
      //     const { code, data, msg } = res;
      //     if (200 === code) {
      //       ElMessage.success("删除成功");
      //       handleQuery();
      //     } else {
      //       ElMessage.error(msg);
      //     }
      //   })
      //   .finally(() => {});
      //   },
      // }),


   
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        title: "产品大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品名称",
        typeCode: "PROD_LIST_GRT",
                codeParam: {
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
      },
      {
        prop: "cIsOpenCommodity",
        inputtype: "rtselect",
        title: "是否全国性商品",
           loadData:[
          {value: '0',label:'否'},
          { value: "1",  label: "是" },
        ]
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        // codeListName: '',
        // codeListParam: 
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: {
          cParCde: 'commodity_status'
          // cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          // cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },

        // loadData:[
        //   {value: '0',label:'禁用'},
        //   { value: "1",  label: "启用" },
        // ]
      },
      {
        prop: "cEnableStatus",
        inputtype: "rtselect",
        title: "启用状态",
        loadData:[
          {value: '0',label:'禁用'},
          { value: "1",  label: "启用" },
        ]
      },
      {
        prop: "tCrtTm",
        inputtype: "rtinput",
        title: "启用时间",
      },
    ],
  })
);

onMounted(async () => {});

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
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  qryCommodityBasePage(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>
