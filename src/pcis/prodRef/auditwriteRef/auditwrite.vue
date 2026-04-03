<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="underwriteEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { idxParamKey, useIdxParam } from "@/views/pcis/support/useIdxParam";
const idxParam = inject(idxParamKey, useIdxParam());
const params = idxParam.param;
const { getRules } = useValidator();
const { ecargoGetCUndrMrk, ecargoGetBackClsList } = NewUdrListService();
const undrOpnMap = {
  "0": "经过审核，同意承保该业务。",
  "1": "经过审核，该业务缺少如下必要信息，请补充后再提交：",
  "2": "经过审核，该业务必须修改如下承保条件：",
  "3": "经过核算，该业务的前线费用已经超出我司规定的上限，请将费用控制在        %以内。",
  "4": "经过审核，我司决定放弃该业务，原因如下：",
  "5":
    "此业务已经超出本级别核保权限，提交上级核保。" +
    "\n" +
		"初步审核意见如下：",
	"6": "经过审核，同意承保该业务。",
};
const underwriteEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user"));
const cUndrMrkOptions = ref([])
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cUndrMrk",
        inputtype: "rtselect",
        title: "核保选项",
				loadData: [
					{value: 'audit', label: '同意'},
          {value: 'report', label: '上报'},
          {value: 'bounced', label: '退回给出单员'},
          {value: 'back', label: '退回至指定核保级别人员'}
        ],
        rules: [getRules("required", {})],
        clearable: true,
				func: (v: string) => {
					setValue("cUndrOpnList", "");
					if ("audit" === v) {
            if ("E" === params["cAppTyp"]) {
              setFormItem("cUndrOpnList", {
                loadData: [{ label: "审核通过", value: "6" }],
              });
              setValue("cUndrOpnList", "6");
            } else {
              setFormItem("cUndrOpnList", {
                loadData: [{ label: "审核通过", value: "0" }],
              });
              setValue("cUndrOpnList", "0");
            }
          } else if ("report" === v) {
            setFormItem("cUndrOpnList", {
              loadData: [{ label: "提交上级", value: "5" }],
            });
            setValue("cUndrOpnList", "5");
          } else if(!v) {
            setFormItem("cUndrOpnList", {
              loadData: [],
            });
          } else {
            setFormItem("cUndrOpnList", {
              loadData: [
                { label: "缺少必要信息", value: "1" },
                { label: "修改承保条件", value: "2" },
                { label: "费用超标", value: "3" },
                { label: "拒绝承保", value: "4" },
                { label: "录入错误", value: "7" },
                { label: "资料不全", value: "8" },
                { label: "其他", value: "9" },
              ],
            });
            setValue("cUndrOpnList", "9");
          }
          if ("back" === v) {
            setValue("cBckOp", "");
            setFormItem("cBckOp", {
              hidden: false,
              rules: [getRules("required", {})],
						});
            const param = {
              usrDptCde: user["companyId"],
              operId: user["opCde"],
              prodNo: '029900',
              appNo: params.cEcAgrAppNo,
							dptCde: params.cDptCde,
            };
            console.log(param);
            getBackClsListUrlFn(param);
          } else {
            setFormItem("cBckOp", {
              hidden: true,
              rules: "",
            });
            setValue("cBckOp", "");
          }
        },
      },
      {
        prop: "cUndrOpnList",
        inputtype: "rtselect",
        title: "核保意见选项",
        loadData: [
          { label: "审核通过", value: "0" },
          { label: "缺少必要信息", value: "1" },
          { label: "修改承保条件", value: "2" },
          { label: "费用超标", value: "3" },
          { label: "拒绝承保", value: "4" },
          { label: "提交上级", value: "5" },
        ],
        rules: [getRules("required", {})],
        itemWidth: 1,
        valueSpan: 10,
        clearable: true,
        func: (val: any) => {
          const data = val ? undrOpnMap[val] : "";
          underwriteEditRef.value?.setValue("undrOpn", data);
        },
      },
      {
        prop: "undrOpn",
        inputtype: "rtinput",
        type: "textarea",
        title: "核保意见",
        rows: 3,
        itemWidth: 2,
			},
			{
        prop: "cBckOp",
        inputtype: "rtselect",
        title: "退回核保级别",
        loadData: [],
				clearable: true,
				hidden: true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
  })
);

// 查询核保选项下拉值
function getCUndrMrkUrlFn(prarm) {
  ecargoGetCUndrMrk(prarm).then((r: any) => {
    console.log(prarm);
    if (r.code == 200) {
      cUndrMrkOptions.value = r["data"];
      setFormItem("cUndrMrk", {
        loadData: r["data"],
      });
    }
  });
}

// 核保选项为【退回至指定核保级别人员】时，查询退回核保级别
function getBackClsListUrlFn(prarm) {
  ecargoGetBackClsList(prarm).then((r: any) => {
    console.log(prarm);
    if (r.code !== 200) {
      ElMessage.error({ message: r.msg, duration: 6000 });
    } else {
      setFormItem("cBckOp", {
        loadData: r["data"],
      });
      if(r["data"]?.length === 1) {
        setValue("cBckOp", r["data"][0]["value"]);
      }
    }
  });
}
onMounted(()=>{
	nextTick(() => {
		console.log(cUndrMrkOptions)
    const param = {
      cProdNo: '029900',
      opCde: user.opCde,
      companyId: user.companyId,
			cAppNo: params.cEcAgrAppNo,
    };
    // 获取核保选项
    getCUndrMrkUrlFn(param);
  });
})

function getFromValue() {
  return underwriteEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  underwriteEditRef?.value?.setFormValue(value);
}

function validate() {
  return underwriteEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  underwriteEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return underwriteEditRef?.value?.getValue(key);
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>
<style lang="scss" scoped>
// :deep(form .el-col:nth-child(1) .el-form-item__content div) {
//   width: 400px !important;
// }
// :deep(form .el-col:nth-child(2) .el-form-item__content div) {
//   width: 200px !important;
// }
</style>
