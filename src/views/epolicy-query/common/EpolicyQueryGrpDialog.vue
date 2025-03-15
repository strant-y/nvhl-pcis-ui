<!-- 团单个打 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="团单个打">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @selection-change="handleSelectionChange"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '生成电子保单',
            func: () => {
              groupSingleFight();
            },
          }"
        />
        <rt-button
          :item="{
            type: 'primary',
            label: '电子保单下载',
            func: () => {
              downloadXLS();
            },
          }"
        />
        <rt-button
          :item="{
            type: 'primary',
            label: '返回',
            func: () => {
              dialogVisible = false;
            },
          }"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  getButtonByFacKey,
  getFactorList,
  getInputGroupList,
  saveFactor,
  saveKindInfo,
} from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const policyService = new PolicyService();
const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);
const selectedRows = ref<any[]>([]);
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();
const EpolicyGrpDialog = defineAsyncComponent(() => import("./EpolicyGrpDialog.vue"));
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const appTableShow = ref(false);

function fromUpdata(newData: any) {
  const jsonObj = getFrom();
  if (jsonObj) {
    jsonObj.func = null;
    if (jsonObj.loadData) {
      jsonObj.loadData = JSON.parse(jsonObj.loadData);
    }
    if (jsonObj.showExBtn === "1") {
      jsonObj.showExBtn = true;
      jsonObj.btnItems = createFreeButtonBase(jsonObj.btn);
      jsonObj.btnWidth = jsonObj.btn?.btnWidth;
    } else {
      jsonObj.showExBtn = false;
    }
    if (jsonObj.required === "1") {
      jsonObj.rules = [getRules("required", {})];
    }
    if (
      jsonObj.inputtype === "rtinputgroup" ||
      jsonObj.inputtype === "rttable"
    ) {
      return;
    }
    jsonObj.func = null; // 方法去掉,不让预览触发事件
  }
}
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

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
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "NSeqNo",
        inputtype: "rtinput",
        title: "被保人序号",
        clearable: true,
      },
      {
        prop: "CNme",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
    ],
    showSuperior: true,
    superFromSchema: [],
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
    showSelection: true,
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "单据打印",
        type: "success",
        size: "large",
        icon: "Printer",
        tableClick: (row) => {
         console.log('单据打印')
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        defaultValue: props.data?.cPlyNo,
      },
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "被保人序号",
      },
      {
        prop: "cTgtObjTxtFld1",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "cTgtObjTxtFld29",
        inputtype: "rtinput",
        title: "子团单号",
      },
    ],
  })
);

onMounted(async () => {
  handleQuery(true)
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
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
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

// 生成电子保单
function groupSingleFight() {
  if(selectedRows.value.length==0) {
    ElMessage.warning('请选择一条记录');
    return;
  }
}

// 下载电子保单
function downloadXLS() {
  if(selectedRows.value.length==0) {
    ElMessage.warning('请选择一条记录');
    return;
  }
  const data = {
    CPlyNo: selectedRows.value[0].cPlyNo,
    CEdrNo: selectedRows.value[0].cEdrNo,
    cTgtObjTxtFld29: selectedRows.value[0].cTgtObjTxtFld29,
    plyTy: props.data.plyTy,
  };

  policyService.downloadElePolicy(data).then((res: any) => {
    if (res.size <= 0) {
      ElMessage.warning({ message: '个人电子保单未生成', duration: 3000 });
      return;
    }
    const fileName = `${selectedRows.value[0].cTgtObjTxtFld29}.pdf`;
    // saveAs(res, decodeURI(fileName));
  }).catch((err: any) => {
    ElMessage.error({ message: '下载出错', duration: 3000 });
  });
}

/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (showBtnConfig.value) {
    s["showExBtn"] = "1";
  } else {
    s["showExBtn"] = "0";
  }
  if (s) {
    const param = Object.assign(s);
    if (props.type === "edit") {
      param["cPkId"] = props.data.cPkId;
    }
    if (freeEditRefBtn.value) {
      let btnjson = freeEditRefBtn.value?.getFromValue();
      btnjson.initid = uuidv4().replace(/-/g, "");
      param["btn"] = btnjson;
    }
    if (tableRef.value) {
      const tabjson = tableRef.value?.getFromValue();
      let selectList = tabjson.filter((item: any) => item.isChecked === "1");
      param["tabjson"] = selectList;
    }
    return param;
  }
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign({
        sortField: 'name',
        // sortOrder: sortValue.value,
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
      },s, r);
      // 获取接口
      policyService.queryTgtObjectList(param).then((res: any) => {
        if (res.code === 200) {
          const pageData = res.data;
          if (pageData) {
            pageresult.list = pageData.list;
            pageresult.total = pageData.total;
          }
        }
      }).catch((error: any) => {
        ElMessage.error({ message: '后台服务异常,查询失败', duration: 3000 });
      });
    }
  });
}
</script>

<style scoped></style>
