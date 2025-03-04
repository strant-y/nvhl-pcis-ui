<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDoubleClick"
      @sort-change="sortChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import {
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElSwitch,
  ElCascader,
  ElInput,
  ElDatePicker,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";
import OrgDptModel from "@/components/common/DepartmentTree.vue";
import ChangeImageUploadModeComponent from "./change-image-upload-mode.vue";
import { PcisEdrQueryService } from "./service/pcis-edr-query-service";
import { getListByCode } from "@/api/code-list-service";
import { useUserStore } from "@/store/modules/user";
import { AppKey } from "@/constants/api";
import {
  DEFERRED_CORRECTION,
  SCENE_EDR_APP_NEW,
  SCENE_PLY_APP_READ,
} from "@/constants/tab-constants";

import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const { getRules } = useValidator();
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref(userStore.user);

const props = defineProps({
  activeName: {
    type: String,
    required: true,
  },
});
const router = useRouter();
const route = useRoute();
const pcisEdrQueryService = new PcisEdrQueryService();

const CIESence = ref(false);
const routeData = route.query || route.params;
//todo 假数据，为了让按钮展示出来
routeData.rsnTyp = "1";

if (routeData["CIESence"]) {
  CIESence.value = true;
}

const form = reactive(freeEditRef.value?.getFromValue()); //获取表单数据

const rules = reactive({
  CDptCde: [
    { required: !CIESence.value, message: "请选择机构部门", trigger: "change" },
  ],
  CCommodityNo: [
    { required: CIESence.value, message: "请选择商品", trigger: "change" },
  ],
});

const sortField = ref(null);
const sortOrder = ref(null);
const selected = ref({});
const rsnCde = ref({});
const rsnDetail = ref({});
const codeListMap = ref({});
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogComponent = ref(null);
const dialogData = ref({});

const orgDptOptions = ref<any>([]);
const commodityOptions = ref<any>([]);
const kindOptions = ref<any>([]);
const prodOptions = ref<any>([]);

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
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "归属机构名称",
        showExBtn: true,
        disabled: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal.open(OrgDptModel, {}).then((res) => {
              if (res.type === "ok") {
                if (results && results.body) {
                  const cde = results.body.id;
                  freeEditRef.value?.setValue("CDptCde", cde); //获取表单数据
                }
              }
            });
          },
        },
      },
      {
        prop: "CLoadSub",
        inputtype: "rtradio",
        title: "是否包含下级",
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "CKindNo",
        inputtype: "rtcascader",
        title: "产品大类",
        clearable: true,
        typeCode: "KIND_LIST_GRT",
        param: {
          cOperId: user.value["opCde"],
          cDptCde: user.value["companyId"],
        },
      },
      {
        prop: "CProdNo",
        inputtype: "rtcascader",
        title: "条款",
        clearable: true,
        typeCode: "PROD_LIST_GRT",
        param: {
          cParCde: "",
          cOperId: user.value["opCde"],
          cDptCde: user.value["companyId"],
        },
      },
      {
        prop: "CInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "TAppTm",
        inputtype: "rtdatepicker",
        title: "投保日期",
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        func: (val) => {
          handleDateChange(val);
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

const editList = ref([]);
const editListData = ref([]);
if (!CIESence.value) {
  editList.value = ["id", "iddetail"];
  editListData.value = [
    {
      prop: "id",
      inputtype: "rtinput",
      title: "批改原因",
    },
    {
      prop: "iddetail",
      inputtype: "rtinput",
      title: "批改原因详细",
    },
  ];
} else {
  editList.value = [];
  editListData.value = [];
}

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: false,
    editFlag: true,
    editList: editList.value,
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
        tableClick: (row) => {
          openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "详情",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          showDetails(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保日期",
        sortable: "custom",
      },
      {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtinput",
        title: "是否团单",
      },
      ...editListData.value,
    ],
  })
);

const handleDateChange = (value) => {
  let startDate,
    endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD");
  endDate = moment(new Date(value[1])).format("YYYY-MM-DD");
  console.log("时间", startDate, endDate);
};

const handleQuery = (flag = true) => {
  submitForm(flag);
};

const submitForm = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      ElMessage.warning("表单验证不通过，请检查！");
    }
  });
};

const refreshData = (reset = true) => {
  const formData = freeEditRef.value?.getFromValue();
  if (!formData.CPlyNo) {
    const startTemp =
      formData.TAppTm && formData.TAppTm.length > 1 ? formData.TAppTm[0] : null;
    if (null == startTemp || undefined === startTemp) {
      ElMessage.warning("投保起期不能为空");
      return;
    }
    const start = Date.parse(startTemp);
    const endTemp =
      formData.TAppTm && formData.TAppTm.length > 1 ? formData.TAppTm[1] : null;
    if (null == endTemp || undefined === endTemp) {
      ElMessage.warning("投保止期不能为空");
      return;
    }
    const end = Date.parse(endTemp);
    if (start - end > 0) {
      ElMessage.warning("投保起期不能大于投保止期");
      return;
    }
    if (end - start >= 7 * 1000 * 60 * 60 * 24) {
      ElMessage.warning("投保时间范围请控制在7天以内");
      return;
    }
  }
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (s.CLoadSub) {
    s.CLoadSub = "1";
  }
  const obj = {
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    CurrentUser: user["opCde"],
    CurrentUserOrg: user["companyId"],
    CCommodityType: CIESence.value ? "3" : null,
  };
  const params = Object.assign(s, r, obj);
  sessionStorage.setItem(AppKey.query.pcis_query_endorse, params);

  pcisEdrQueryService.qryEndorseList(params).then((res: any) => {
    if (null != res && null != res["code"]) {
      if (res["code"] === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageData.result.forEach((item) => {
            changeRsnValue(item);
          });
          pageresult.list = pageData.result;
        }
      }
    }
  });
};

const handleRowClick = (row) => {
  selected.value = row;
};

const handleRowDoubleClick = (row) => {
  openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
};

const sortChange = (column, prop, order) => {
  console.log(column, prop, order);
};

const changeRsn = (rsnCde, appNo, rsnDetail) => {
  if (appNo) {
    rsnCde.value[appNo] = rsnCde;
    rsnDetail.value[appNo] = rsnDetail;
  }
};

const getDetailRsn = (item) => {
  const grpMrk = item["cGrpMrk"].toString();
  const prodNo = item["cProdNo"];
  const isGrp = grpMrk !== "0" ? "1" : null;
  const isPer = grpMrk === "0" ? "1" : null;
  const rsnTyp = routeData["rsnTyp"];
  const detail = [];
  if (item["id"] === "FZ") {
    getListByCode("EDR_RSN_LIST", {
      prodNo: prodNo,
      rsnTyp: rsnTyp,
      isGrp: isGrp,
      isPer: isPer,
      calcMrk: "0",
      ZH: "ZH",
      FZ: "FZ",
    }).then(
      (cde2Res) => {
        if (!codeListMap.value[prodNo + item["id"] + grpMrk]) {
          codeListMap.value[prodNo + item["id"] + grpMrk] = cde2Res["data"];
        }
        detail.push(cde2Res["data"][0]["value"]);
        setTimeout(() => {
          item["iddetail"] = detail;
          changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
        }, 5);
      },
      (error) => {
        console.log("出错了", error);
        ElMessage.error("后台服务异常,请联系管理员");
      }
    );
  } else {
    if (!codeListMap.value[prodNo + item["id"] + grpMrk]) {
      codeListMap.value[prodNo + item["id"] + grpMrk] =
        codeListMap.value[prodNo + grpMrk];
    }
    detail.push(item["id"]);
    setTimeout(() => {
      item["iddetail"] = detail;
      changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
    }, 5);
  }
};

const changeRsnValue = (item) => {
  const detail = [];
  const rsnTyp = routeData["rsnTyp"];
  selected.value = item;
  const grpMrk = item["cGrpMrk"].toString();
  const prodNo = item["cProdNo"];
  const isGrp = grpMrk !== "0" ? "1" : null;
  const isPer = grpMrk === "0" ? "1" : null;
  if (
    undefined === codeListMap.value[prodNo + grpMrk] ||
    null === codeListMap.value[prodNo + grpMrk]
  ) {
    if (rsnTyp === "1") {
      getListByCode("EDR_RSN_LIST", {
        prodNo: prodNo,
        kindNo: prodNo.substring(0, 2),
        rsnTyp: rsnTyp,
        isGrp: isGrp,
        isPer: isPer,
      }).then(
        (cdeRes) => {
          if (cdeRes && cdeRes["data"] && cdeRes["data"].length > 0) {
            if (!codeListMap.value[prodNo + grpMrk]) {
              codeListMap.value[prodNo + grpMrk] = cdeRes["data"];
            }
            item["id"] = cdeRes["data"][0]["value"];
            getDetailRsn(item);
          }
        },
        (error) => {
          console.log("出错了", error);
          ElMessage.error("后台服务异常,请联系管理员");
        }
      );
    } else {
      getListByCode("EDR_RSN_LIST_KIND", {
        kindNo: prodNo.substring(0, 2),
        rsnTyp: rsnTyp,
      }).then(
        (cdeRes) => {
          if (!!cdeRes && !!cdeRes["data"] && cdeRes["data"].length > 0) {
            if (!codeListMap.value[prodNo + grpMrk]) {
              codeListMap.value[prodNo + grpMrk] = cdeRes["data"];
            }
            item["id"] = cdeRes["data"][0]["value"];
            getDetailRsn(item);
          }
        },
        (error) => {
          console.log("出错了", error);
          ElMessage.error("后台服务异常,请联系管理员");
        }
      );
    }
  } else {
    item["id"] = item["id"]
      ? item["id"]
      : codeListMap.value[prodNo + grpMrk][0]["value"];
    if (
      undefined === codeListMap.value[prodNo + item["id"] + grpMrk] ||
      null === codeListMap.value[prodNo + item["id"] + grpMrk]
    ) {
      getDetailRsn(item);
    } else {
      if (item["id"] === "FZ") {
        detail.push(
          codeListMap.value[prodNo + item["id"] + grpMrk][0]["value"]
        );
        setTimeout(() => {
          item["iddetail"] = detail;
          changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
        }, 5);
      } else {
        detail.push(item["id"]);
        setTimeout(() => {
          item["iddetail"] = detail;
          changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
        }, 5);
      }
    }
  }
};

const showDetails = (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
  if (null == selected.value[cPlyNo] || "" === selected.value[cPlyNo]) {
    ElMessage.warning("请选择一条记录");
    return;
  }
  if (!selected.value[cPlyNo]) return;
  const en = JSON.stringify({
    scene: SCENE_PLY_APP_READ,
    CAppNo: selected.value["cAppNo"],
    COrgAppNo: cAppNo,
    CCiMrk: selected.value["cCiMrk"],
    CProdNo: selected.value["cProdNo"],
    CAppTyp: selected.value["cAppTyp"],
    CGrpMrk: selected.value["cGrpMrk"],
    CDptCde: selected.value["cDptCde"],
  });

  router.push({
    path: "/index/endorse/detail",
    query: {
      data: en,
    },
  });
};

const openEdr = (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
  handleRowClick(data);
  if (null == selected.value[cPlyNo] || "" === selected.value[cPlyNo]) {
    ElMessage.warning("请选择一条记录");
    return;
  }
  if (
    null == rsnCde.value[selected.value[cPlyNo]] ||
    "" === rsnCde.value[selected.value[cPlyNo]]
  ) {
    ElMessage.warning("请选择批改原因");
    return;
  }
  if (
    DEFERRED_CORRECTION === rsnCde.value[selected.value[cPlyNo]] &&
    "020027" === cProdNo
  ) {
    ElMessage.warning("此产品暂不支持延期批改，请选择通用批改");
    return;
  }
  if (CIESence.value) {
    const en = JSON.stringify({
      scene: SCENE_EDR_APP_NEW,
      CAppNo: selected.value[cPlyNo],
      COrgAppNo: cAppNo,
      CRsnCde: rsnCde.value[selected.value[cPlyNo]],
      CRsnDetailCde: transferRsnDetail(rsnDetail.value[selected.value[cPlyNo]]),
      CProdNo: selected.value["cProdNo"],
      CCiMrk: selected.value["cCiMrk"],
      CGrpMrk: selected.value["cGrpMrk"],
      CDptCde: selected.value["cDptCde"],
      CEdrType: routeData["rsnTyp"],
      CIESence: CIESence.value,
    });
    router.push({
      path: "/index/endorse/surrenderEdit",
      query: {
        data: en,
      },
    });
  } else {
    const param = {
      plyNo: cPlyNo,
      edrType: routeData["rsnTyp"],
      prodNo: cProdNo,
      edrRsnCde: rsnCde.value[selected.value[cPlyNo]],
    };
    pcisEdrQueryService.validEndorse(param).then(
      async (result) => {
        if (200 !== result["code"]) {
          ElMessage.error(result["msg"]);
        } else {
          if (result["data"]) {
            if ("DZ" === rsnCde.value[selected.value[cPlyNo]]) {
              modifyImageUploadMode(cPlyNo);
              return;
            } else if ("2" === routeData["rsnTyp"]) {
              const en = JSON.stringify({
                scene: SCENE_EDR_APP_NEW,
                CAppNo: selected.value[cPlyNo],
                COrgAppNo: cAppNo,
                CRsnCde: rsnCde.value[selected.value[cPlyNo]],
                CRsnDetailCde: transferRsnDetail(
                  rsnDetail.value[selected.value[cPlyNo]]
                ),
                CProdNo: selected.value["cProdNo"],
                CCiMrk: selected.value["cCiMrk"],
                CGrpMrk: selected.value["cGrpMrk"],
                CDptCde: selected.value["cDptCde"],
                CEdrType: routeData["rsnTyp"],
              });
              router.push({
                path: "/index/endorse/cancelEdit",
                query: {
                  data: en,
                },
              });
            } else if ("3" === routeData["rsnTyp"]) {
              const en = JSON.stringify({
                scene: SCENE_EDR_APP_NEW,
                CAppNo: selected.value[cPlyNo],
                COrgAppNo: cAppNo,
                CRsnCde: rsnCde.value[selected.value[cPlyNo]],
                CRsnDetailCde: transferRsnDetail(
                  rsnDetail.value[selected.value[cPlyNo]]
                ),
                CProdNo: selected.value["cProdNo"],
                CCiMrk: selected.value["cCiMrk"],
                CGrpMrk: selected.value["cGrpMrk"],
                CDptCde: selected.value["cDptCde"],
                CEdrType: routeData["rsnTyp"],
                CIESence: CIESence.value,
              });
              router.push({
                path: "/index/endorse/surrenderEdit",
                query: {
                  data: en,
                },
              });
            } else if ("1" === routeData["rsnTyp"]) {
              const en = JSON.stringify({
                scene: SCENE_EDR_APP_NEW,
                CAppNo: selected.value[cPlyNo],
                COrgAppNo: cAppNo,
                CRsnCde: rsnCde.value[selected.value[cPlyNo]],
                CRsnDetailCde: transferRsnDetail(
                  rsnDetail.value[selected.value[cPlyNo]]
                ),
                CProdNo: selected.value["cProdNo"],
                CCiMrk: selected.value["cCiMrk"],
                CGrpMrk: selected.value["cGrpMrk"],
                CJiMrk: selected.value["cJiMrk"],
                CDptCde: selected.value["cDptCde"],
                CEdrType: routeData["rsnTyp"],
              });
              router.push({
                path: "/index/endorse/edit",
                query: {
                  data: en,
                },
              });
            }
          } else {
            ElMessage.success(result["msg"]);
          }
        }
      },
      (error) => {
        console.log("err: ", error);
        ElMessage.error("连接失败！" + error);
      }
    );
  }
};

const modifyImageUploadMode = (plyNo) => {
  dzmodal
    .open(ChangeImageUploadModeComponent, { parameter: { plyNo } })
    .then((res) => {
      if (res.type === "ok") {
      }
    });
};

const transferRsnDetail = (rsnDetail) => {
  let str = "";
  rsnDetail.forEach((item) => {
    str = str ? str + "," + item : item;
  });
  return str;
};

const openModel = (info) => {
  return new Promise((resolve) => {
    ElMessageBox.confirm(info, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

const myCode = (value, args) => {
  if (null == value || null == args) {
    return null;
  }

  const res = args.filter((val) => {
    return null !== val["value"] && value === val["value"];
  });

  return null != res && res.length > 0 ? res[0]["label"] : value;
};

onMounted(() => {
  // const param = sessionStorage.getItem(AppKey.query.pcis_query_endorse);
  // if (param) {
  //   Object.assign(form, param);
  // }
  handleQuery();
});

watch(dialogVisible, (newValue) => {
  if (!newValue) {
    dialogComponent.value = null;
    dialogData.value = {};
  }
});
</script>

<style scoped lang="scss">
.actived {
  background: #a6dbed;
}

.fc-table-icons {
  i {
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
