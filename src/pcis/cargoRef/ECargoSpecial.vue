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
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { ref } from "vue";
import { getpSpecialAgreement } from "@/api/prod";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";

const formData = ref<any[]>([]);
const dzmodal = useDzModal();
const dialog = ref<DialogMethod | null>(null);
const specEdit = defineAsyncComponent(
  () => import("@/pcis/prodRef/commodityRef/prd-fix-spec-edit.vue")
);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});
import { FormPage } from "@/views/protocolManagement/utils/form-page";
import router from "@/router";

const rttableFrom = ref<any>(null);


import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const query = ref(route.query);
const params = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const idxParam = inject('idxParam');
const formPage: FormPage = idxParam?.formPage;
const param = idxParam.param;

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

const originalData = ref<any[]>([]);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "特约信息",
    tableBtnType: "btn",
    tableBtnWidth: 160,
    tableBtnPosition: "right",
    fixed: true,
    // align: "left",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "default",
        icon: "Edit",
        hideBtns: (row) => {
          // if (!row.cSpecialContent.includes("*")) return true;
          return row.cIfEdit !== '1';
        },
        tableClick: (row) => {
          if (originalData.value.length == 0) {
            originalData.value = deepClone(formData.value)
          }
          let param = {};
          if (row['cIfMust'] !== '9') {

            let rid = row.cSpecialCode || row.cSpecialCode
            const f = originalData.value.find(f => rid === f.cSpecialCode);
            // cSpecialContent
            Object.assign(param, f);

          } else {
            Object.assign(param, row)
          }

          if (row.editList && row.editList.length > 0) {
            param['editList'] = row.editList
          }
          dzmodal.open(specEdit, {
            type: "view", data: param,
            callback: (res: any) => {
              if (res.type === "ok") {
                // row.cSpecialContent = res.data.cSpecialContent
                // row['editList']= res.data['editList']

                let list = formData.value;
                const index = list.findIndex(
                  item => item.cSpecialCode === row.cSpecialCode
                );
                if (index !== -1) {
                  nextTick(() => {
                    list[index]['cSpecialContent'] = res.data.cSpecialContent;
                    list[index]['editList'] = res.data['editList']
                    formData.value = list
                  })
                }
              }
            }
          })
        },
      }),
      // createFreeButtonBase({
      //   id: "edit",
      //   link: true,
      //   tooltip: "编辑",
      //   type: "success",
      //   size: "large",
      //   icon: "Edit",
      //   hideBtns: (row) => {
      //     if (!row.cSpecialContent.includes("**")) return true;
      //   },
      //   tableClick: (row) => {
      //     dzmodal.open(specEdit, { type: "view", data: row }).then((res) => {
      //       if (res.type === "ok") {
      //       }
      //     });
      //   },
      // }),
      createFreeButtonBase({
        id: "delete",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        hideBtns: (row) => {
          if (row.cIfMust == '1') return true;
        },
        tableClick: (row) => {
          ElMessageBox.confirm("此操作将删除该特约, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            const list = formData.value;
            const i = list.findIndex((item) => item.cSpecNo === row.cSpecNo);
            rttableFrom.value.delRow(row._dataId);
            // if (i !== -1) list.splice(i, 1);
            formData.value.forEach((item, index) => {
              item.index = index + 1;
            });
          })
            .catch(() => {
              // 取消删除
            });
        },
      }),
      createFreeButtonBase({
        id: "top",
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
        id: "bottom",
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
        width: 35,
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
        width: 80,
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
      //   prop: "cSpecialCode",
      //   inputtype: "rtinput",
      //   title: "特约代码",
      //   width: 180,
      // },
      {
        prop: "cSpecialContent",
        inputtype: "rtinput",
				title: "特约内容",
				align: "left"
      },
    ],
  })
);


// 获取默认信息

const addData = () => {
  // 等于江苏分公司加上此条跳跃
  if (params.dptCde !== "0232010000000") return;
  let obj = [];
  let isAdd = true;
  formData.value.forEach((item) => {
    if (item.cSpecialCode === "fenqi02") {
      isAdd = false;
    }
  })
  if (isAdd) {
    //  ElMessage.warning("分期付费业务，需在特别约定中增加及时缴纳保费的提示信息");
    obj = [...formData.value, {
      addIndex: 1,
      cIfEdit: "0",
      cIfFix: "1",
      cIfMust: "1",
      cSpecialCode: "fenqi02",
      isAdd: true,
      cSpecialContent: "尊敬的客户，如有疑问或问题，您可拨打公司客户服务（咨询、投诉）电话95502，也可向江苏保险行业协会（投诉受理热线：4008012378）反映，必要时还可以根据合同约定，申请仲裁或向法院起诉。",
      // index: formData.value.length+1
    }]
    setFormValue(obj)
  }
}


const refreshData = () => {

  const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
  const cProdNo = '029900';
  const cDptCde = agreementBaseRef.getValue('ECargoBase.cDptCde')

  // 查询列表数据
  getpSpecialAgreement({
    cProdNo: cProdNo,
    // cDptCde: cDptCde,
    cDptCde:params.cDptCde,
    pageNum: 1,
    pageSize: 999,
  }).then((res) => {
    if (res.data?.result) {
      let len = 0;
      let sel: any[] = [];
      res.data.result.forEach((item: any, index: number) => {
        if (item["cIfMust"] == "1") {
          item.index = len + 1;
          sel.push(item);
          len++;
        }
      });
      originalData.value = deepClone(sel)
      formData.value = sel


      // addData();
      // res.data.result.forEach((item: any, index: number) => {
      //   if (item["cIfMust"] == "1") {
      //     item.index = len + 1;
      //     sel.push(item);
      //     len++;
      //   }
      // });
      // // originalData.value =    deepClone(sel)
      // formData.value = sel
    }
  });
};




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
	if (param.type != 'orig') {
		refreshData();
	}


  console.log('router', params)
  console.log('formPage', route.query)


});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
  //获取特约按钮
  getSpecialAgree: () => {
    let sessionSpecialAgreement = JSON.parse(sessionStorage.getItem('AgreementSpecial'));
    console.log(sessionSpecialAgreement)
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    // if (!agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo')) {
    //   return ElMessage.warning('请先保存投保单');
    // }
    dialog.value?.open(
      "prdFixSpec",
      {
        cProdNo: '029900',
        selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        cDptCde: agreementBaseRef.getValue('ECargoBase.cDptCde') || ''
      },
      {
        getSelected(selectdata: any) {
          let len = formData.value.length;
          let sessionSpecialAgreement = JSON.parse(sessionStorage.getItem('AgreementSpecial')) || [];
          const result = mergeArrays(sessionSpecialAgreement, selectdata, 'cSpecialCode', ['cSpecialContent']);


          result.forEach((item: any, index: number) => {
            item.index = index + 1;

            len++;
          });

          originalData.value = deepClone(result)
          formData.value = result
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
      cSpecialContent: item['PrdFixSpec.CNmeCn'],
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


// 复制数据处理
const mergeArrays = (oldArr, newArr, key, fields) => {
  const isSameItem = (oldItem, newItem, key) => {
    if (key != null && key !== undefined && key !== '') {
      const oldValue = oldItem[key];
      const newValue = newItem[key];
      if (oldValue != null && oldValue !== "" && newValue != null && newValue !== "") {
        return oldValue == newValue;
      }
    }

    if (oldItem.cPkId != null && oldItem.cPkId !== undefined && oldItem.cPkId !== '' &&
      newItem.cPkId != null && newItem.cPkId !== undefined && newItem.cPkId !== '') {
      return oldItem.cPkId == newItem.cPkId;
    }

    if (oldItem.cRowId != null && oldItem.cRowId !== undefined && oldItem.cRowId !== '' &&
      newItem.cRowId != null && newItem.cRowId !== undefined && newItem.cRowId !== '') {
      return oldItem.cRowId == newItem.cRowId;
    }
    return false;
  };

  // 1. 以新数组为基准构建新数组
  return newArr.map(newItem => {
    const oldItem = oldArr.find(item => isSameItem(item, newItem, key));
    if (oldItem) {
      // 2. 左右都存在：左边数据为基础，用右边指定字段覆盖
      const mergedItem = { ...oldItem };
      fields.forEach(field => {
        if (newItem.hasOwnProperty(field)) {
          mergedItem[field] = newItem[field];
        }
      });
      return mergedItem;
    } else {
      // 3. 右边独有：直接返回右边项
      return { ...newItem };
    }
  });
}


function validate() {
  return new Promise(resolve => {
    if (!formData.value || formData.value.length === 0) {
      resolve(false);
    }
    resolve(true);
  })
}

function getFormValue() {
  return formData.value.map((item) => {
    const prefixedItem: { [key: string]: any } = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        prefixedItem[`ECargoSpecialAgreement.${key}`] = item[key];
      }
    }
    return prefixedItem;
  });
}
// function getFromValue() {
//   return formData.value;
// }
function setFormValue(value: any) {
  if (value && value.length > 0) {
    let ind = 1;
    value.forEach(e => {
      Object.keys(e).forEach(key => {
        const newKey = key.replace('ECargoSpecialAgreement.', '');
        const v = e[key];
        delete e[key];
        e[newKey] = v;
      })
      e['index'] = ind++;
    });
  }
  rttableFrom?.value?.setFormValue(value);
  // Object.assign(formData.value, value);
  formData.value = value;
}

function getFormBtn() {
  const r = ref({});
  if (cardconfig.value.titleBtns) {
    cardconfig.value.titleBtns.forEach((item: any) => r.value[item.id] = item);
  }
  return r.value;
}
function getFormConfig() {
  return tableconfig;
}
function setDisabledAll(isDisabled: boolean, noSet: string[] = []) {
  const tableBtn = tableconfig.tableBtn;
  if (tableBtn && tableBtn.length > 0) {
    tableBtn.forEach((btn: any) => {
      if (!noSet.includes(btn.id)) {
        btn.hidden = isDisabled;
      }
    });
  }
  const formBtn = getFormBtn();
  if (formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {
      if (!noSet.includes(key)) {
        formBtn[key].hidden = isDisabled;
      }
    });
  }
}
// 深拷贝
const deepClone = (obj: any) => {
  // 处理原始值和 null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // 处理数组
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  // 处理普通对象
  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }

  return clone;
}
function getTableBtn() {
  return tableconfig.tableBtn;
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  getFormBtn,
  setDisabledAll,
  getFormConfig,
  getTableBtn
});
</script>

<style scoped></style>
