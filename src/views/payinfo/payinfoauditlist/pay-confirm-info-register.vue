<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
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

const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '缴费信息登记',
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "登记",
        func: async () => {
          console.log("登记")
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "提交审核",
        func: async () => {
          console.log("提交审核")
        },
      }),
    ],
    fromSchema: [
    {
				prop: "CDptCde",
				inputtype: "rtselect",
				title: "业务机构",
        typeCode: "PLYDPT_LIST",
				
				param: { 'CDptCde': '' }, //待添加
			},
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        
      },
      {
        prop: "CAppTyp",
        inputtype: "rtselect",
        title: "申请类型",
        
        loadData :[
          { label:'投保',value:"A" },
          { label:'批改',value:"E" },
        ]
      },
      {
        prop: "CCurrency",
        inputtype: "rtselect",
        title: "币种",
        typeCode: "CURRENCY_LIST"
      },
      {
        prop: 'CPlyNo',
        title: '生成保批单号',
        inputtype: "rtinput",
      },
      {
        prop: 'NTax',
        title: '车船税',
        inputtype: "rtinput",
      },
      {
        prop: 'NPayAmt',
        title: '实收金额',
        inputtype: "rtinput",
      },
      {
        prop: '',
        title: '支票(票据)收款人',
        inputtype: "rtinput",
      },
      {
        prop: '',
        title: '出票人账号',
        inputtype: "rtinput",
      },
      {
        prop: 'TBgnTm',
        title: '保险起期',
        inputtype: "rtdatepicker",
        type: "daterange",
        
      },
      {
        prop: 'TEndTm',
        title: '保险止期',
        inputtype: "rtdatepicker",
        type: "daterange",
        
      },
      {
        prop: 'TUdrTm',
        title: '核保时间',
        inputtype: "rtdatepicker",
        type: "daterange",
        
      },
      {
        prop: 'TPlEdrMakeTm',
        title: '保批单生成时间',
        inputtype: "rtdatepicker",
        type: "daterange",
        
      },
      {
        prop: 'TPlyedrPrnTm',
        title: '打印时间',
        inputtype: "rtdatepicker",
        type: "daterange",
        
      },
      {
        prop: '',
        title: '支票（收据）金额',
        inputtype: "rtinput",
      },
      {
        prop: 'CPlyNo',
        title: '生成保批单号',
        inputtype: "rtinput",
      },
      {
        prop: 'CUniqueNo',
        title: '收据流水号',
        inputtype: "rtinput",
      },
      {
        prop: 'CCardNo',
        title: '卡号',
        inputtype: "rtinput",
      },
      {
        prop: 'CChqueNo',
        title: '支票号',
        inputtype: "rtinput",
      },
      {
        prop: 'NPrm',
        title: '实收保费',
        inputtype: "rtinput",
      },
      {
        prop: 'TPayConfTm',
        title: '缴费确认时间',
        inputtype: "rtinput",
      },
      {
        prop: 'CAppNo',
        title: '投保单号',
        inputtype: "rtinput",
      },
    ]
  })
);
onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});

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
</script>

<style scoped></style>
