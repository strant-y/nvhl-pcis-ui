<template>
  <div class="app-container">
    <div class="left-container">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        :load="loadNode" 
        :show-line="true"
        :expand-on-click-node="false"
            lazy accordion
        @node-click="handleNodeClick"
        ref="treeRef"
        class="tree-container"
      />
    </div>
    <div class="right-container">
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      <div class="table-wrapper">
        <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
          ref="tableRef"
          @page-change="handleQuery(false)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveProdInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { SysOperatorMgrService } from '@/views/sys-right-basic/service/sys-operator-mgr.service';
const dzmodal = useDzModal();
const goodsRuleEdit = defineAsyncComponent(() => import("./goodsRuleEdit.vue"));
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import {
  qryProdRuleList,
  getOrgDptTreeNodeById,
  delProdRuleById,
} from "@/api/prod";
import { inputtype } from "@/utils/utilKey";

const sysOperatorMgrService = new SysOperatorMgrService();
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const treeNodeId = ref("");
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref<any>({});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    // title: "联共保信息配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
        func: () => {},
      }),
    ],

    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        // inputtype: "rtselect",
        // title: "机构代码",
        // typeCode: "PLYDPT_LIST_1",
        // codeParam: { cIsValid: "1", userOrg: "0200000000000" },
        title: "机构代码",
        disabled: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "cRuleCde",
        inputtype: "rtinput",
        title: "规则名称",
      },
      {
        prop: "cPrd",
        inputtype: "rtselect",
        typeCode: "KIND_LIST_CACHE",
        codeParam: { codeListParam: "" },
        child: "cProdNo",
        title: "产品大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        typeCode: "PROD_LIST",
        codeParam: { cParCde: "" },
        title: "产品",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "add-goodsRule",
        label: "增加",
        type: "success",
        func: function () {
          const cDptCde = freeEditRef.value?.getValue("cDptCde");
          if(!cDptCde) {
            ElMessage.error("请先选择机构");
            return;
          }
          dzmodal.open(goodsRuleEdit, { type: "add", data: {cDptCde} }).then((res:any) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "edit-goodsRule",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log(row);
          dzmodal
            .open(goodsRuleEdit, { type: "edit", data: row })
            .then((res) => {
             
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "del-goodsRule",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          delProdRuleById(row)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("删除成功");
                handleQuery();
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        title: "机构代码",
        inputtype: "rtinput",
      },
      {
        // prop: "cProdNo",
        // title: "产品名称",
        // typeCode: "PROD_LIST_GRT",
        inputtype: "rtinput",
        // inputtype: "rtselect",


        prop: "cProdNo",
        // inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        // params: {
        //   cParCde: "",
        //   cOperId: user.value.opCde,
        //   cDptCde: user.value.companyId,
        // },
        // loadData: [],
        // clearable: true,
      },
      {
        prop: "cRuleCde",
        title: "规则名称",
        inputtype: "rtinput",
      },
      {
        prop: "cRuleValue",
        title: "规则值",
        inputtype: "rtinput",
      },
      {
        prop: "tCrtTm",
        title: "生效时间",
        inputtype: "rtdatepicker",
      },
      {
        prop: "tEndTm",
        title: "失效时间",
        inputtype: "rtdatepicker",
      },
      {
        prop: "cRuleTyp",
        title: "是否临时规则",
        inputtype: "rtselect",
        loadData: [
          {label: "是", value: "1"},
          {label: "否", value: "0"},
        ]
      },
    ],
  })
);

const showRelatedTermsModal = ref(false);
const showAddTermModal = ref(false);

const treeData = ref<any[]>([]);

// ref([
//   // {
//   //   label: "永安保险总公司",
//   //   id: "0200000000000",
//   //   children: [
//   //     {
//   //       label: "陕西西安分公司",
//   //       id: "0200000000001",
//   //       children: [
//   //         {
//   //           label: "碑林区分公司",
//   //         },
//   //       ],
//   //     },
//   //   ],
//   // },
// ]);

// const defaultProps = {
//   children: "children",
//   label: "label",
// };
const defaultProps = {
  children: 'children',
  label: 'name',
  isLeaf: 'leaf',
};

const handleNodeClick = (data: any) => {
  // treeNodeId.value = 123;
  setValue('cDptCde',data.id)
  handleQuery()
  // tableRef.value?.setQuery({
  //   orgCode: data.id,
  // });
  // getOrgDptTreeList();
};

const handleEdit = (index: number, row: any) => {
  // 编辑逻辑
  console.log("编辑", row);
};

const handleDelete = (index: number, row: any) => {
  ElMessageBox.confirm("此操作将永久删除该条款, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 删除逻辑
      console.log("删除", row);
      // 可以在这里调用 API 删除数据
    })
    .catch(() => {
      // 取消删除
    });
};



function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}



function getOrgDptTreeList() {
  let root = '020000000000';
  if (treeNodeId.value == "" || treeNodeId.value == undefined) {
    treeNodeId.value = "0200000000000";
  } else {
    treeNodeId.value = treeNodeId.value;
  }
  const param = { pId: treeNodeId.value };
  getOrgDptTreeNodeById(param)
    .then((res) => {
      const { code, data, msg } = res;
      const dto = [];
      if (200 === code) {
        console.log(data, "data+++++++++++++++++++++++++==");
        // treeData.value = data;
        // treeData.value.push({
        //                   label:data.name,
        //                   id: data.id ,
        //                   children: [
        //                       {
        //                         label: "陕西西安分公司",
        //                         id: "0200000000001",
        //                         children: [
        //                           {
        //                             label: "碑林区分公司",
        //                           },
        //                         ],
        //                       },
        //                     ],
        //                 });   const dto = [];
        treeData.value.push({
          id: data.id,
          name: root + '-' + data.name,
          leaf: false,
        });

        // data.forEach(item => {
        //   treeData.value.push({
        //         id: item['id'],
        //         name: item['id'] + '-' + item['name'],
        //         leaf: !item.hasChildren,
        //       })
        // })
   
          // data.forEach(item => {
          //     dto.push({
          //       id: item['id'],
          //       name: item['id'] + '-' + item['name'],
          //       leaf: !item.hasChildren,
          //     });
          //   })
     

 
          // resolve(dto);


                                 // id: res['data']['id'],
                            // name: res['data']['name'],
                            // hasChildren: res['data']['hasChildren']
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}


const initDptTreeList = () => {
  // let root = '020000000000';
  // if (user.value && user.value.companyId) {
  //   root = user.value.companyId;
  // }
  // const params = {
  //   pId: root,
  // };
  let root = '0200000000000';
  if (treeNodeId.value == "" || treeNodeId.value == undefined) {
    treeNodeId.value = "0200000000000";
  } else {
    treeNodeId.value = treeNodeId.value;
  }
  // const param = { pId: treeNodeId.value };
  const param = { pId:"0200000000000" };
  sysOperatorMgrService.getOrgDptTreeNodeById(param).then((res) => {
    if (res && res['data']) {
      if (treeData.value.length === 0) {
        treeData.value = [];
      }
      const data = res['data'];
      if (res['data']) {
        treeData.value.push({
          id: data.id,
          name: data.id + '-' + res['data']['name'],
          leaf: false,
        });
      }
    }
  }).catch((error) => {
    ElMessage.error('后台服务异常,请联系管理员');
  });
};

const loadNode = (node, resolve) => {
 
  if (node.level === 0) {
    return resolve([]);
  }
  const params = {
    cDptCde:  node.data.id,
    // cDptCde: '0200000000000',
              // 0200000000000
              // 0200000000000
  };
  console.log(111,params)
 console.log(233,node.data.id.length)
  sysOperatorMgrService.getOrgDptTreeListByPid(params).then((result) => {
    const dto = [];
    if (200 !== result['code']) {
      ElMessage.error(result['msg']);
    } else {
      ElMessage.success(result['msg']);
    }
    if (result['data'] && result['data'].length > 0) {
      result['data'].forEach(item => {
        dto.push({
          id: item['id'],
          name: item['id'] + '-' + item['name'],
          leaf: !item.hasChildren,
        });
      })
    }

    console.log('----------',resolve)
    resolve(dto);
  }).catch((error) => {
    console.log('出错了', error);
    ElMessage.error('后台服务异常,请联系管理员');
  });
};
// const handleQuery = (flag) => {
//   console.log('操作权限----1',flag)
//   freeEditRef.value?.validate().then((isValid) => {
//     if (isValid) {
//       refreshData(flag);
//     }
//   })
// };
/** 查询 */
function handleQuery(flag?: boolean) {
  console.log( getFromValue().cDptCde)
 

  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
    

    // if(getFromValue())
  
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r);
    qryProdRuleList(param)
      .then((res:any) => {
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
  })
}
onMounted(() => {
  initDptTreeList()
  // getOrgDptTreeList();
  if (param.editType === "edit") {
    setDisa();
  }
});

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
.app-container {
  display: flex;
  /* height: calc(100vh - 100px); */
  height: 100%;
}

.left-container {
  flex: 1;
  padding: 10px;
  border-right: 1px solid #ccc;
  overflow: auto; /* 添加滚动条 */
}

.right-container {
  flex: 3;
  padding: 10px;
}

.tree-container {
  width: 100%;
  height: 100%;
}
</style>
