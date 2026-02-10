<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
		@selection-change="handleSelectionChange" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getPageList } from "@/api/prod";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { codeListViewStore } from "@/store";
import cargoApi from "@/api/cargo";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const { getRules } = useValidator();
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const emits = defineEmits(["handleClose"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    // title: "关联被保险人",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
         // handleQuery();
           freeEditRef.value?.validate().then((isValid) => {
             if (isValid) {
               handleQuery();
             } /*else {
               ElMessage.error("请填写必填项");
             }*/
           });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtselect",
        // rules: [getRules("required", {'message':'请选择方案号'})],
        title: "方案号",
        clearable:true,
				typeCode: "cPlanType",
				disabled: true,
        // codeParam: { cParCde: "hangyefenlei2" },
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "客户名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // editList: ["cStatus"],
    // tableBtnType: "btn",
    // tableBtnWidth: 220,
    // tableBtnPosition: "right",
		
    showSelection: true,
		titleBtns: [
      createFreeButtonBase({
        id: "add-relatedTerms",
        label: "确定",
        type: "success",
        func: function () {
          handleSave()
        },
      }),
    ],
    fromSchema: [
		{
			prop: "InsuredDist.cPlanNo",
			inputtype: "rtSelectV2",
			title: "方案号",
			typeCode: "cPlanType"
			},
      {
        prop: "InsuredDist.cInsuredNme",
        inputtype: "rtinput",
        title: "客户名称",
      },
      {
				prop: "InsuredDist.cClntMrk",
				codeParam: "{\"cParCde\":\"clnt_mrk\"}",
				inputtype: "rtSelectV2",
				title: "被保人性质",
				typeCode: "INSURE_NATURE_CACHE",
			},
			{
				prop: "InsuredDist.cCertfCls",
				codeParam: "{\"C_PAR_CDE\":\"120\"}",
				inputtype: "rtSelectV2",
				title: "证件类型",
				typeCode: "NATURAL_CERTIFICATE_CACHE",
			},
			{
				prop: "InsuredDist.cCertfCde",
				inputtype: "rtinput",
				title: "证件号码",
			},
			{
				prop: "InsuredDist.cClntAddr",
				inputtype: "rtinput",
				title: "常住地址",
			},
			{
				prop: "InsuredDist.cRegisteredcapDre",
				inputtype: "rtinput",
				title: "注册地址",
			},
    ],
  })
);
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

/** 查询 */
function handleQuery(flag?: boolean) {
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const cAppNo = props.data.data.cAppNo
	let param = Object.assign({
		cComponentTable:"GrpMember",
		cAppNo: cAppNo || '',
		InsuredDist: s,
		fromSchema: formconfig1.fromSchema,
		insuredOption: '1', // 被保人清单查询-不查已被选中的
	}, r);
	cargoApi.selectDistNew(param).then((res: any) => {
		if(res.code === 200) {
			if(res.data.data.length > 0 ){
				pageresult.list = res.data.data
				pageresult.total = res.data.total
			} else {
				pageresult.list = []
				pageresult.total = 0
			}
			nextTick(() => {
        setSelected();
      });
		}else {
			ElMessage.success(res.msg);
		}
	})
}

function setSelected() {
  const lastSelected = props.data.data.selectedData;
  if (lastSelected && lastSelected.length) {
    // const sarr = lastSelected.map((f: any) => f["cDeductibleClass"]);
    pageresult.list.forEach(f => {
      if (lastSelected.includes(f["InsuredDist.cPkId"])) {
        tableRef.value!.toggleRowSelection(f, true, true);
      }
    })
  }
}

// 多选事件
let selValue = ref([])
const handleSelectionChange = (selection: any) => {
  selValue.value = selection
}

// 保存
const handleSave = async () => {
	if (selValue.value.length == 0) {
		ElMessage.error('请选择被保人信息');
		return false;
	}
	props.data.method?.getdbClickData(selValue);
};

onMounted(() => {
	setValue('cPlanNo',props.data.data.cPlanNo)
	handleQuery()
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
