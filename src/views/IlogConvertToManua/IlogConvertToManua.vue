<!-- ILOG强制转人工 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />
    <app-free-edit :freeEditConfig="formconfig2" ref="freeEditRef2" />
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

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getEfcManual, setEfcManual } from "@/api/prod";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const user = JSON.parse(sessionStorage.getItem("user") || "{}");
// const departmentTree = defineAsyncComponent(
//   () => import("@/components/common/DepartmentTree.vue")
// );
const departmentTree = defineAsyncComponent(() => import('@/pcis/prodRef/commodityRef/DepartmentTree.vue'))
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "ILOG强制转人工核保申请",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "提交",
        func: async () => {
          freeEditRef1.value?.validate().then((isValid: boolean) => {
            if (isValid) {
              submit();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "转人工投保单\批改单号",
        labelWidth: 200,
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "cEfcManual",
        inputtype: "rtselect",
        title: "转人工状态",
        clearable: true,
        rules: [getRules("required", {})],
        loadData :[
          { label:'是',value:'1' },
          { label:'否',value:'0' },
        ]
      },
    ],
  })
);

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "ILOG强制转人工核保查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          freeEditRef2.value?.validate().then((isValid: boolean) => {
            if (isValid) {
              handleQuery();
            } else {
              ElMessage.error("请填写必填项");
            }
          });
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          setFormItem("cDptCde", {
            loadData: [
              {
                value: user.companyId,
                label: user.companyId + " " + user.companyCnm,
              }
            ]
          });
          freeEditRef2.value?.setFormValue({
            cDptCde: user.companyId,
            sub: "0",
            cAppNo: "",
            tm: [
              dayjs().subtract(30, 'day').format("YYYY-MM-DD 00:00:00"),
              dayjs().format("YYYY-MM-DD 23:59:59"),
            ],
          });
        },
      }),
    ],
    fromSchema: [
    {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "承保机构",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {})],
        disabled: true,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          btnStyle: {width: '100%'},
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res:any) => {
                if (res.type === "ok") {
                  setFormItem("cDptCde", {
                    loadData: [
                      {
                        value: res.body.id,
                        label: res.body.name,
                      }
                    ]
                  });
                  setValue("cDptCde", res.body.id);
                }
              });
          },
        },
      },
      {
        prop: "sub",
        inputtype: 'rtcheckbox',
        title: '包含下级机构',
        keymap: {
          y: '1',
          n: '0'
        }
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "转人工申请日期",
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
        itemWidth: 1,
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
    editFlag: true,
    editList: ["cStatus"],

    fromSchema: [
      {
        prop: "cAppTyp",
        inputtype: "rtselect",
        title: "单据类型",
        fixed: 'left',
        loadData: [
          { label: '投保单', value: 'A' },
          { label: '批单', value: 'E' },
          { label: '询价单', value: 'I' },
        ]
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cEfcManual",
        inputtype: "rtselect",
        title: "是否转人工状态",
        loadData: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ]
      },
      {
        prop: "tUpdTm",
        inputtype: "rtinput",
        title: "修改时间",
      },
      {
        prop: "cUpdCde",
        inputtype: "rtinput",
        title: "修改人",
      },
      {
        prop: "tCrtTm",
        inputtype: "rtinput",
        title: "创建时间",
      },
      {
        prop: "cCrtCde",
        inputtype: "rtinput",
        title: "创建人",
      },
    ],
  })
);

onMounted(async () => {
  setValue("sub", "0");
  setFormItem("cDptCde", {
    loadData: [
      {
        value: user.companyId,
        label: user.companyId + " " + user.companyCnm,
      }
    ]
  });
  setValue("cDptCde", user.companyId);
  setValue("tm", [
    dayjs().subtract(30, 'day').format("YYYY-MM-DD 00:00:00"),
    dayjs().format("YYYY-MM-DD 23:59:59"),
  ]);
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
    const r = freeEditRef1.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/** 查询 */
async function handleQuery(flag?: boolean) {
  const s = freeEditRef2.value?.getFromValue(); //获取表单数据
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const params = {
    ...s,
    ...r,
  }
  if(params.tm && params.tm.length > 1){
    params.tBgnTm = params.tm[0];
    params.tEndTm = params.tm[1];
  }
  delete params.tm;
  getEfcManual(params).then((res:any) => {
    const { code, msg } = res;
    if (200 === code) {
      pageresult.list = [];
      pageresult.list = res.res;
    } else {
      ElMessage.error(msg);
    }
  }).catch((error) => {
    ElMessage.error(error.msg);
  });
}

/* 提交 */
function submit() {
  const s = freeEditRef1.value?.getFromValue(); //获取表单数据
  const params = {
    ...s,
    cDptCde: user.companyId,
    cCrtCde: user.opCde,
    tCrtTm: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    cUpdCde: user.opCde,
    tUpdTm: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  }
  setEfcManual(params).then((res:any) => {
    const { code, msg } = res;
    if (200 === code) {
      ElMessage.success("提交成功");
      freeEditRef1.value?.setFormValue({
        cAppNo: "",
        cEfcManual: "",
      });
    } else {
      ElMessage.error(msg);
    }
  }).catch((error) => {
    ElMessage.error(error.msg);
  });
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig2.fromSchema?.forEach(item => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key]
          }
        } else {
          Object.assign(item, obj)
        }
      }
    })
  }
}

function setValue(key: string, value: any) {
  freeEditRef2?.value?.setValue(key, value);
}

</script>

<style scoped></style>
