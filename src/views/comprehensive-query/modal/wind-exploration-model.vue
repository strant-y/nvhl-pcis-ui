<!-- 发起风勘-编辑 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="80%" title="人工发起风勘">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { defineComponent, ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { defineEmits, onMounted } from "vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
const opertaor = dataOpertaor();

const emits = defineEmits(["ok", "cancel"]);
const pcisQueryService = new PcisQueryService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();
const maindialogVisible = ref(true);
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {{
      return {};
    }},
  },
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "发起",
        func: async () => {
          // loadData()

          windSave();
        },
      }),
      createFreeButtonBase({
        type: "info",
        label: "返回",
        func: async () => {
          handleReturn();
        },
      }),
    ],

    fromSchema: [
      {
        prop: "tSurveyStart",
        inputtype: "rtdatepicker",
        title: "开始时间",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        rules: [getRules("required", {})],
        type: "datetime",
        itemWidth: 1.5,
				disabledDate: (time: Date) => {
					const today = new Date();
					today.setHours(0, 0, 0, 0); // 清除时间部分

					const selected = new Date(time);
					selected.setHours(0, 0, 0, 0);

					return selected < today;
        },
				func: (v: string|number|Date) => {
          const tRepStopExtEndTm = freeEditRef?.value?.getValue("tSurveyEnd")
					if(v && tRepStopExtEndTm && new Date(v).getTime() > new Date(tRepStopExtEndTm).getTime()) {
            ElMessage.warning("开始时间不能晚于结束时间")
            freeEditRef?.value?.setValue("tSurveyStart", null)
          }
        },
      },
      {
        prop: "tSurveyEnd",
        inputtype: "rtdatepicker",
        title: "结束时间",
        format: "YYYY-MM-DD 23:59:59",
        valueFormat: 'YYYY-MM-DD 23:59:59',
        type: "datetime",
        rules: [getRules("required", {})],
        itemWidth: 1.5,
				disabledDate: (time: Date) => {
					const today = new Date();
					today.setHours(0, 0, 0, 0); // 清除时间部分

					const selected = new Date(time);
					selected.setHours(0, 0, 0, 0);

					return selected < today;
        },
				func: (v: string|number|Date) => {
          const tRepStopExtBgnTm = freeEditRef?.value?.getValue("tSurveyStart")
					if(v && tRepStopExtBgnTm && new Date(v).getTime() < new Date(tRepStopExtBgnTm).getTime()) {
            ElMessage.warning("结束时间不能早于开始时间")
            freeEditRef?.value?.setValue("tSurveyEnd", null)
          }
        },
      },
      {
        prop: "cRespondent",
        inputtype: "rtinput",
        itemWidth: 1.5,
        title: "联系人",
        rules: [getRules("required", {})],
      },
      {
        prop: "cRespondentPon",
        inputtype: "rtinput",
        title: "联系电话",
        itemWidth: 1.5,
        rules: [getRules("required", {})],
      },
      {
        prop: "cNotes",
        inputtype: "rtinput",
        title: "备注",
        type: "textarea",
        rows: 4,
        itemWidth: 3,
      },
    ],
  })
);

// cInquiryNumber	String	255	Y		询价单号
// tSurveyStart	Date	255	Y		发起时间
// tSurveyEnd	Date	255	Y		结束时间
// cRespondent	String	255	N		联系人
// cRespondentPon	String	255	N		联系人电话
// cNotes String	255	N		备注

onMounted(() => {
	// 根据保存数据填值
	console.log('propspropspropsprops',props.data);
  nextTick(() => {
		freeEditRef.value?.setFormValue({
			cInquiryNumber: props.data.plyBase['Base.cInquiryNo'],
			tSurveyStart: moment().format("YYYY-MM-DD 00:00:00"),
			tSurveyEnd: "",
			cRespondent: props.data.insured? props.data.insured['Insured.cInsuredNme'] : "",
			cRespondentPon: props.data.insured? props.data.insured['Insured.cMobile'] : "",
			cNotes: "",
		});
	});
});

// 请求接口
const windSave = async () => {
	const r = await freeEditRef.value?.validate();
	if (r) {
		let params = freeEditRef.value?.getFromValue(); //获取表单数据
		console.log("params", params);
		pcisQueryService.sendTaskCreat(params).then((res: any) => {
			console.log("数据---‘", res);
			if (res.code == 200) {
				if(res.data !== null){
					maindialogVisible.value = false;
					ElMessage.success(res.msg)
				}else{
					ElMessage.warning(res.msg)
				}
			} else {
				ElMessage.error({ message: res.msg, duration: 3000 });
			}
		});
	} else {
		ElMessage.warning("请检查表单！");
	}
};

const handleReturn = () => {
  maindialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.demo-form-inline {
  margin-bottom: 20px;
}

.tabsSty {
  margin-top: 10px;
}

.tableBtn {
  text-align: right;
  margin-bottom: 10px;
}
</style>
