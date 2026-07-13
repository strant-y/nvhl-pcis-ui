<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElTable, ElTableColumn, ElPagination, ElDialog, ElMessage, ElMessageBox } from 'element-plus';
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
import { useUserStore } from "@/store/modules/user";
import { AppKey } from '@/constants/api';
import SysUsrProdTree from './sys-usr-prod-edit/sys-usr-prod-tree/sys-usr-prod-tree.vue';
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
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const props = defineProps({
  getOperator: {
    required: true,
  },
});
const userStore = useUserStore();
const sysOperatorMgrService = new SysOperatorMgrService()
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const multipleSelection = ref([]);
const treeData = ref([]);
const treeRef = ref(null)
const user = userStore.user;

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
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
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编码",
        clearable: true,
      },
      {
        prop: "cProdCat",
        inputtype: "rtselect",
        title: "产品类型",
        loadData: [
          { value: '0', label: '产品' },
          { value: '1', label: '产品大类' }
        ],
        clearable: true,
      },
    ],
  })
);

const handleQuery = (flag = true) => {
  refreshData(flag)
}

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    editFlag: true,
    maxHeight: "280px",
    editList: ["cStatus"],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "配置",
        type: "primary",
        func: function () {
          // console.log(222,multipleSelection.value.length)
          // if(multipleSelection.value.length){
            addGrtProd()
          // }else{
          //   ElMessage.warning('请先选择产品,再进行操作!')
          // }
         
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "批量删除",
        type: "danger",
        func: function () {
          delMultiGrtProd()
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          delGrtProd(row.cProdNo)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "cProdCat",
        inputtype: "rtinput",
        title: "产品类型",
      }
    ]
  })
);

const search = () => {
  refreshData(true)
}

const refreshData = (reset = false) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign({}, s, r, {
    // COperId: props.getOperator._value.cOperId,
    cOperId: props.getOperator._value.cOperId,
    // CDptCde: props.getOperator._value.cOwnDptCde,
    cDptCde: props.getOperator._value.cOwnDptCde,
  });
  sysOperatorMgrService.getUsrProdList(param).then((res: any) => {
    if (res && res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        pageData.result.forEach(item => {
          item.cProdCat = item.cProdCat == '1' ? '产品大类' : '产品'
        })
        pageresult.total = pageData.total;
        pageresult.list = pageData.result;
      }
    }
  }, (error: any) => {
    console.log('出错了', error);
    ElMessage.error('后台服务异常,请联系管理员');
  });
};

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val;
};


const addGrtProd = () => {
 
  console.log( props.getOperator._value.cOperId,     props.getOperator._value.cOwnDptCde,)


  sysOperatorMgrService.getUsrProdByUsrAndDpt({
    COperId: props.getOperator._value.cOperId,
    CDptCde: props.getOperator._value.cOwnDptCde,
  }).then((res: any) => {


    if (res && res.data) {
      treeData.value = [res.data];
      console.log('treeData.value', treeData.value);
      
      //打开配置弹框
      dzmodal.open(SysUsrProdTree, { data: treeData.value, getOperator: props.getOperator._value}).then((res) => {
        if (res.type === "ok") {
          refreshData(true);
        }
      });
    }
  });
};

const delGrtProd = (id: string) => {
  ElMessageBox.confirm('确认要删除吗？该数据删除之后将无法恢复。', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const param = {
      CProdNo: id,
      COperId: props.getOperator._value.cOperId,
      CDptCde: props.getOperator._value.cOwnDptCde,
    };
    sysOperatorMgrService.delUsrProdInfo(param).then((res: any) => {
      if (res && res.code === 200) {
        ElMessage.success(res.data.message);
        refreshData(true);
      }
    });
  }).catch(() => {
    //防止报错
  })
};

const delMultiGrtProd = () => {
  if (multipleSelection.value.length > 0) {
    ElMessageBox.confirm('确认要删除吗？该数据删除之后将无法恢复。', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      const items = multipleSelection.value.map((item: any) => ({
        ...item,
        CCrtCde: user.value ? user.value.opCde : '',
        COperId: props.getOperator._value.cOperId,
        CDptCde: props.getOperator._value.cOwnDptCde,
      }));
      sysOperatorMgrService.delUsrProdList({ items }).then((res: any) => {
        if (res && res.code === 200) {
          ElMessage.success(res.data.message);
          refreshData(true);
        }
      });
    }).catch(() => {
      //防止报错
    })
  } else {
    ElMessage.warning('请先选择要删除的产品权限列表');
  }
};


//dialog弹框确定事件
// const confirmDialog = () => {
//   const result = treeRef.value.sendData()
//   handleConfirm(result)
// }
// const handleConfirm = (result) => {
//   if (result.size > 0) {
//     sysOperatorMgrService.saveUsrProdList({
//       CCrtCde: user.value.opCde,
//       COperId: props.getOperator.cOperId,
//       CDptCde: props.getOperator.cOwnDptCde,
//       items: result,
//     }).then((saveRes: any) => {
//       if (saveRes && saveRes.code === 200) {
//         ElMessage.success(saveRes.data.message);
//         refreshData();
//       }
//     });
//   }
// };

onMounted(() => {
  refreshData(true);
});

</script>

<style scoped>
/* Add your styles here */
</style>
