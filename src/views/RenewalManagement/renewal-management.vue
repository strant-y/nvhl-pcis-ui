<!-- 续保管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
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

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {deleteFactorBykey, exportRenewalInsurance, findRenewalInsurance, getBasicKindList, getPolicy} from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
import { useUserStore } from "@/store/modules/user";
import {saveAs} from "file-saver";
import {useRouter} from "vue-router";
import dayjs from "dayjs";
import moment from "moment/moment";
const router = useRouter();
const userStore = useUserStore();
const user = ref(userStore.user);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "续保管理",
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
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {
          exportExcel()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {
          trigger: 'change'
        })],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
                .open(DepartmentTree, { type: "Issuer", data: {} })
                .then((res) => {
                  if (res.body) {
                    const selectObj = res.body;
                    freeEditRef.value?.setValue("cDptCde", selectObj.id);
                    setFormItem("cDptCde", {
                      loadData: [
                        {
                          label: selectObj.name,
                          value: selectObj.id,
                        },
                      ],
                    });
                  }
                });
          },
        },
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        clearable: true,
        params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
        func: (val: any) => {
          // 更新产品下拉选
          setFormItem("cProdNo", {
            codeParam: {
              cParCde: val,
              cOperId: user.value?.opCde,
              cDptCde: user.value?.companyId,
            },
          });
          freeEditRef.value?.setValue("cProdNo", null);
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "条款",
        typeCode: "TERM_LIST_IN_GUIDE_NEW",
        clearable: true,
        params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "tAppTm",
        inputtype: "rtdatepicker",
        title: "保险止期",
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
        func: (val) => {
          if(val){
            handleDateChange(val);
          }
        },
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
const handleDateChange = (value) => {
  let startDate,
      endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD 00:00:00");
  endDate = moment(new Date(value[1]))
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
};
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 140,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "一键续保",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {
           getRenewal(row)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cDptNameL2",
        inputtype: "rtinput",
        title: "二级机构",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "cDptNameL3",
        inputtype: "rtinput",
        title: "三级机构",
        minWidth: 180,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人姓名",
        minWidth: 180,
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款",
        minWidth: 180,
      },
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
        minWidth: 180,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
        minWidth: 180,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
        minWidth: 180,
      },
    ],
  })
);
onMounted(async () => {
  freeEditRef.value?.setFormValue({
    tAppTm: [
      moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
          "YYYY-MM-DD 00:00:00"
      ),
      moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ],
    cDptCde: "0200000000000",
    cLoadSub:1
  });
  setFormItem("cDptCde", {
    loadData: [
      {
        label: JSON.parse(sessionStorage.getItem("user")).companyCnm,
        value: JSON.parse(sessionStorage.getItem("user")).companyId,
      },
    ],
  });
});
const handleArray = (obj:any)=>{
  // 创建一个新的对象，并移除"Base."前缀
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 通过字符串操作去掉前缀
      let newKey = key.replace('Base.', '');
      newObj[newKey] = obj[key];
    }
  }
  return newObj
}

const getRenewal = (row:any)=>{
   console.log('一键续保。。。',row.cPlyNo)
  getPolicy({cPlyNo:row.cPlyNo,queryTyp: "orig"})
      .then((res) => {
        const { code, res:data, msg } = res;
        if (200 === code) {
          router.push({
            path: "/pcis/my-page",
            query: {
              param: JSON.stringify({ ...handleArray(data.composition.plyBase[0] ),...{cDptCnm:row.cDptCnm,cTermNme:row.cTermNme,cTermNo:row.cTermNo}, ...{ pageType: "orig" } }),
            },
          });
          sessionStorage.setItem(
              "toMyPageData",
              JSON.stringify({
                ...JSON.parse(sessionStorage.getItem("toMyPageData")),
                ...{ pageType: "orig" },
              })
          );
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
}

//导出
const exportExcel = () => {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, {tInsrncBgnTm:s.tAppTm[0],tInsrncEndTm:s.tAppTm[1]});
  if ( (Date.parse(param.tInsrncEndTm) - Date.parse(param.tInsrncBgnTm)) >= (180 * 1000 * 60 * 60 * 24)) {
    ElMessage.warning("保险起止日期范围请控制在半年以内");
    return;
  }
 exportRenewalInsurance(param).then((res) => {
    if (res.size <= 0) {
      ElMessage.error({ message: "导出出错", duration: 3000 });
      return;
    }
   const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
    const blob = new Blob([res.data], {
      responseType:res.headers["content-type"]
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
    });
    saveAs(blob, fileName);
  })
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

const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid) => {
    if(isValid) {
      refreshData(flag)
    } else {
      ElMessage.error("请填写必填项");
    }
  })
}

/** 查询 */
function refreshData(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  param.tInsrncBgnTm = param.tAppTm[0]
  param.tInsrncEndTm = param.tAppTm[1]
  if ( (Date.parse(param.tInsrncEndTm) - Date.parse(param.tInsrncBgnTm)) >= (180 * 1000 * 60 * 60 * 24)) {
    ElMessage.warning("保险起止日期范围请控制在距离当前时间半年以内");
    return;
  }
  console.log('param)))))))))))))))))))',param)
  findRenewalInsurance(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log('selection',selection)
  removeIds.value = selection.map((item: any) => item.cPkId);
}
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
</script>

<style scoped></style>
