<!-- 综合查询-单据打印 -->
<template>
  <el-dialog v-model="dialogVisible" width="800px" title="单据打印">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
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
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";

const pcisQueryService = new PcisQueryService();
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);
const user = JSON.parse(sessionStorage.getItem("user") || "{}");

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
const isflag = ref(false); // 是否有服务卡险别
const _PrnTemplate = ref<any>(null); // 打印模板
const CResId = ref<string | null>(null); // 打印模板资源ID
const flag = ref(false); // 服务卡销号
const flagCancle = ref(false); // 撤销服务卡销号

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "预览",
        func: async () => {
          const formData = freeEditRef.value?.getFromValue();
          // if (flag.value) {
          //   if (formData.cPrnType === "P") {
          //     checkUseCard();
          //   }
          //   if (formData.cPrnType === "E") {
          //     checkEdrCard();
          //   }
          // } else if (flagCancle.value) {
          //   checkEdrCard();
          // } else {
          //   smartbipreview();
          // }
          smartbipreview();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPrnType",
        inputtype: "rtselect",
        title: "单据类型",
        rules: [getRules("required", {})],
        itemWidth: 3,
        func: (value: any) => {

          setFormItem('cPrnNo',{btnItems:{ disabled:true,}})
          console.log(value)
          const CPrnNo = freeEditRef.value?.getValue("cPrnNo");
          const CPlyType = freeEditRef.value?.getValue("cPlyType");
          if (!!CPrnNo) {
            freeEditRef.value?.setValue("cPrnNo", "");
          }
          if (!!CPlyType) {
            freeEditRef.value?.setValue("cPlyType", "");
					}
					// 缴费通知书查询缴费期数并展示供选择
					if (value == 'W') {
						const param = { CPrnType: value, cAppNo: props.data?.cAppNo };
						pcisQueryService
							.getgetNTms(param)
							.then((res: any) => {
								if (res.code === 200) {
									if (res.data > 1) {
										let loadData = generateTimesOptions(res.data)
										setFormItem('nTms', { hidden: false, loadData })
									}
									setPrnTemplate(res.data);
								} else {
									ElMessage.error(res.msg);
								}
							})
							.catch((err) => {
								ElMessage.error(err);
							});
					} else {
						setFormItem('nTms', { hidden: true, loadData: [] })
						setPrnTemplate();
					}
          /*服务卡号使用条件限定：
              1.单据大类必须为保单（前台校验即可）
              2.产品必须为060030
              3.保单不能为重打
              4.不能为从联单
              5.使用机构必须为“永安保险盘龙营销服务部 0253350000000”并且
              投保人必须为“昆明公交集团有限责任公司“或”昆明公交城乡巴士有限责任公司“。*/
          if (
            "060030" === props.data?.cProdNo &&
            "025335000" === user.companyId.substring(0, 9) &&
            props.data?.cCiMrk !== "6" &&
            "1" === props.data?.cGrpMrk &&
            ("昆明公交集团有限责任公司" === props.data?.cAppNme ||
              "昆明公交城乡巴士有限责任公司" === props.data?.cAppNme)
          ) {
            if ("P" === value) {
              // 服务卡销号开始
              flag.value = true;
                setFormItem('cPrnNo',{btnItems:{  disabled:false,}})
              // 服务卡结束
            } else if ("E" === value) {
                setFormItem('cPrnNo',{btnItems:{  disabled:false,}})
              if (
                props.data?.cEdrRsnBundleCde === "Z1" ||
                props.data?.cEdrRsnBundleCde === "22"
              ) {
                flag.value = true;
              }
              if (
                props.data?.cEdrRsnBundleCde === "J1" ||
                props.data?.cEdrRsnBundleCde === "22"
              ) {
                //撤销服务卡销号开始
                flagCancle.value = true;
                //撤销服务卡销号结束
              }
            }
          } else {
            flag.value = false;
            flagCancle.value = false;
            if ("P" === value) {
                setFormItem('cPrnNo',{btnItems:{  disabled:false,}})
            } else if ("E" === value) {
                setFormItem('cPrnNo',{btnItems:{  disabled:false,}})
            }
          }
          check060024FlagCancle(value);
        },
			},
			{
        prop: "nTms",
        inputtype: "rtselect",
        title: "缴费期次",
        loadData: [],
				itemWidth: 3,
				rules: [getRules("required", {})],
				hidden: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保(批改申请)单号",
        rules: [getRules("required", {})],
        itemWidth: 3,
        disabled: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保(批)单号",
        rules: props.data?.cInquiryNo ? [] : [getRules("required", {})], 
        itemWidth: 3,
        disabled: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
        itemWidth: 3,
        disabled: true,
      },
      {
        prop: "cPrnFmp",
        inputtype: "rtselect",
        title: "打印模板",
        loadData: [],
        itemWidth: 3,
        func: (value: any) => {
          if (!!value) {
            const CPrnNo = freeEditRef.value?.getValue("cPrnNo");
            if (!!CPrnNo) {
              freeEditRef.value?.setValue("cPrnNo", "");
            }
            if (!!freeEditRef.value?.getValue("cPlyType")) {
              freeEditRef.value?.setValue("cPlyType", "");
            }
            const CFmpType = _PrnTemplate.value[value]?.cFmpType;
            if (
              CFmpType === "2" &&
              freeEditRef.value?.getValue("cPrnType") === "P"
            ) {
              setFormItem("cPlyType", {
                title: "保单类型",
                type: "radio",
                hidden: false,
                rules: [getRules("required", {})],
              });
            } else {
              setFormItem("cPlyType", {
                title: null,
                hidden: true,
                rules: [],
              });
            }
            CResId.value = _PrnTemplate.value[value].cResId;
          } else {
            setFormItem("cPlyType", {
              title: null,
              hidden: true,
              rules: [],
            });
          }
        },
      },
      {
        prop: "cPrnNo",
        inputtype: "rtinput",
        title: "印刷号",
        itemWidth: 3,
        showExBtn: true,
        btnWidth: 30,
        btnItems: {
        
          label: "获取最小印刷号",
          type: "plain",
          func: () => {
            const formData = freeEditRef.value?.getFromValue();
            if (!formData.cPrnType) {
              ElMessage.error("请选择单据类型");
              return;
            }
            if (!formData.cPrnFmp) {
              ElMessage.error("请选择打印模板");
              return;
            }
            const param = {
              CDptCde: user.companyId,
              CProdNo: props.data?.cProdNo,
              COperId: user.opCde,
              CPrnFmp: formData.cPrnFmp,
              CPrnType: formData.cPrnType,
            };
            pcisQueryService
              .getMinPrnNo(param)
              .then((res: any) => {
                if (res.data) {
                  freeEditRef.value?.setValue("cPrnNo", res.data);
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((err) => {
                ElMessage.error(err);
              });
          },
        },
      },
      {
        prop: "cPrnTarget",
        inputtype: "rtselect",
        title: "打印目的",
        loadData: [
          { value: "0", label: "打印正本" },
          { value: "1", label: "打印副本" },
          { value: "2", label: "打印抄件" },
        ],
        defaultValue: "0",
        disabled: true,
        itemWidth: 3,
      },
      {
        prop: "cLanguage",
        inputtype: "rtradio",
        title: "打印格式",
        loadData: [{ label: "中文", value: "C" }],
        rules: [getRules("required", {})],
        itemWidth: 3,
      },
      {
        prop: "cPlyType",
        inputtype: "rtradio",
        title: "保单类型",
        loadData: [
          { label: "原始保单", value: "0" },
          { label: "最新保单", value: "1" },
        ],
        itemWidth: 3,
        hidden: true,
      },
      {
        prop: "nEdrPrjNo",
        inputtype: "rtinput",
        title: "cEdrPrjNo",
        itemWidth: 3,
        defaultValue: '0',
        hidden: true
      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);

onMounted(async () => {
  if (props.data) {
    nextTick(() => {
      getPrnTypeOptions();
      freeEditRef.value?.setFormValue({...props.data, cLanguage: "C"});
    });
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
// 获取单据类型下拉选项
function getPrnTypeOptions() {
  pcisQueryService
    .getPrnType({
      CLanguage: "C",
      CProdNo: props.data?.cProdNo,
      CPrnType: "W",
      CAppNo: props.data?.cAppNo,
      CTypeCode: props.data?.taskTyp
    })
    .then((res: any) => {
			if (res.code === 200) {
				// 打印只有已出单(5)状态展示保单/缴费通知书类型,展示保（批）单号字段
				if (props.data.cAppStatus == "5") {
					setFormItem("cPrnType", { loadData: res.data });
					setFormItem('cPlyNo', { hidden: false})
				} else {
					setFormItem('cPlyNo', { hidden: true })
					let data = res.data.filter(item => item.value != "P")
					setFormItem("cPrnType", { loadData: data });
				}
        
      }
    });
}
// 获取打印模板下拉选项
function getPrnFmpOptions(val: any) {
  if (val) {
    pcisQueryService
      .getPrintBeanTemplate({
        CLanguage: "C",
        CProdNo: props.data?.cProdNo,
        CDptCde: user.companyId,
        CPlyNo: props.data?.cPlyNo,
        CAppTyp: props.data?.cAppTyp,
        plyNo: props.data?.cPlyNo,
        CPrnType: val,
      })
      .then((res: any) => {
        if (res.code === 200) {
          setFormItem("cPrnFmp", {
            loadData: res.codelist,
          });
        }
      });
  } else {
    setFormItem("cPrnFmp", { loadData: [] });
  }
}

// 预览
function smartbipreview() {
  freeEditRef.value?.validate().then((res:Boolean) => {
    if(res) {
      if (!freeEditRef.value?.getValue('cPrnFmp')) {
        if (!getFormItem('CPrnFmp','loadData') || getFormItem('CPrnFmp','loadData').length === 0) {
          ElMessage.warning('根据传入的参数未获取到相应的打印模板,请核对检查！');
          return;
        } else {
          ElMessage.warning('打印模板不能为空，请核对检查！');
          return;
        }
      }
      const formData = freeEditRef.value?.getFromValue();
      const param = {
        CDptCde: user.companyId,
        CDptCnm: user.companyCnm,
        COperId: user.opCde,
        COperCnm: user.opCnm,
        CProdNo: props.data?.cProdNo,
        CAppTyp: props.data?.cAppTyp,
        CResId: CResId.value,
        CPlyType: formData?.cPlyType,
        CPrnNo: formData?.cPrnNo,
        CEdrNo: props.data?.cEdrNo,
        plyNo: props.data?.cPlyNo,
        CPrnType: formData?.cPrnType,
        CAppNo: props.data?.cAppNo,
        CPlyNo: props.data?.cPlyNo,
        CAppNme: props.data?.cAppNme,
        CPrnFmp: formData?.cPrnFmp,
        CPrnTarget: formData?.cPrnTarget,
        CLanguage: formData?.cLanguage,
        nTms: formData?.nTms || '1',
        CEdrPrjNo: props.data?.nEdrPrjNo,
      };
      pcisQueryService
        .smartbipreview(param)
        .then((res: any) => {
          if (res.code === 200 && res.data) {
            const url = res.data;
            window.open(url, "_blank");
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    }
  })
}

// 设置打印模板
function setPrnTemplate(time) {
  setYNCvrg(props.data?.cAppNo);
  freeEditRef.value?.setValue("cPrnFmp", null);
  setFormItem("cPrnFmp", { loadData: [] });
  _PrnTemplate.value = null;
  const param = {
    CProdNo: props.data?.cProdNo,
    CDptCde: user.companyId, // 操作机构
    CLanguage: "C",
    CPlyNo: props.data?.cPlyNo,
    CAppTyp: props.data?.cAppTyp,
    plyNo: props.data?.cPlyNo,
    CPrnType: freeEditRef.value?.getFromValue().cPrnType,
  };
  pcisQueryService
    .getPrintBeanTemplate(param)
    .then((result: any) => {
      if (result.code === 200) {
        _PrnTemplate.value = result.data;
				if (result["codelist"].length > 0) {
					// 选择缴费通知书 如果有大于1的期次，打印模板展示分期类，反之展示相反的
					if (param.CPrnType == "W") {
						if (time == 1) {
							result.codelist = result.codelist.filter(item => {
  							return !['FQJFTZS', 'CJFQJFTZS'].includes(item.value);
							});
							freeEditRef.value?.setValue("cPrnFmp", 'JFTZS')
						} else if (time > 1) {
							result.codelist = result.codelist.filter(item => {
  							return !['JFTZS', 'CJJFTZS'].includes(item.value);
							});
							freeEditRef.value?.setValue("cPrnFmp", 'FQJFTZS')
						}
					}
          if (props.data?.cProdNo === "060024") {
            let index = null;
            if ("0253" == param.CDptCde.substring(0, 4) && isflag.value) {
              setFormItem("cPrnFmp", { loadData: result.codelist });
            } else {
              for (let i = 0; i < result["codelist"].length; i++) {
                if (
                  result["codelist"][i]["value"] === "PC060030_3rd_newnpcis"
                ) {
                  index = i;
                }
              }
              if (index !== null) {
                result["codelist"].splice(index, 1);
              }
              setFormItem("cPrnFmp", { loadData: result.codelist });
            }
          } else {
            setFormItem("cPrnFmp", { loadData: result.codelist });
          }
          if (result["codelist"].length === 1) {
            freeEditRef.value?.setValue(
              "cPrnFmp",
              result["codelist"][0]["value"]
            );
          }
        } else {
          setFormItem("cPrnFmp", { loadData: [] });
          ElMessage.warning(
            "根据传入的参数未获取到相应的打印模板,请核对检查！"
          );
          return;
        }
      } else {
        setFormItem("cPrnFmp", { loadData: [] });
        ElMessage.error(result["msg"]);
      }
    })
    .catch((error) => {
      ElMessage.error("后台服务异常,请联系管理员");
    });
}

/**
 * 获取投保险种
 * @param appNo
 */
function setYNCvrg(appNo: any) {
  const param = { appNo: appNo };
  pcisQueryService
    .getCvrgByAppNo(param)
    .then((res: any) => {
      if (res.code === 200) {
        const data = res["data"];
        for (let i = 0; i < data.length; i++) {
          console.log("查询到的险别信息为" + data[i]);
          if (
            data[i]["CCvrgNo"] === "060386" ||
            data[i]["CCvrgNo"] === "060387" ||
            data[i]["CCvrgNo"] === "060388"
          ) {
            isflag.value = true;
          }
        }
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
}

function check060024FlagCancle(CPrnType: any) {
  if (
    "060024" === props.data?.cProdNo &&
    "025335000" === user.companyId.substring(0, 9) &&
    props.data?.cCiMrk !== "6" &&
    "1" === props.data?.cGrpMrk &&
    "昆明公交集团有限责任公司" === props.data?.cAppNme
  ) {
    if ("P" === CPrnType) {
      // 服务卡销号开始
      flag.value = true;
      // 服务卡结束
    } else if ("E" === CPrnType) {
      if (
        props.data?.cEdrRsnBundleCde === "Z1" ||
        props.data?.cEdrRsnBundleCde === "22"
      ) {
        flag.value = true;
      }
      if (
        props.data?.cEdrRsnBundleCde === "J1" ||
        props.data?.cEdrRsnBundleCde === "22"
      ) {
        //撤销服务卡销号开始
        flagCancle.value = true;
        //撤销服务卡销号结束
      }
    }
  }
}

//给表单下拉项赋值
// function setFormItem(key, obj) {
//   if (obj && Object.keys(obj).length) {
//     formconfig1.fromSchema?.forEach((item) => {
//       if (item.prop === key) {
//         Object.assign(item, obj);
//       }
//     });
//   }
// }

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

function getFormItem(key:any, prop:any) {
  const item = formconfig1.fromSchema?.find((item) => item.prop === key);
  return item ? item[prop] : null;
}

/**
 * 根据传入的数字生成指定长度的 {label, value} 数组
 * @param {number} n - 要生成的次数（必须为正整数）
 * @returns {{label: string, value: number}[]} 生成的选项数组
 */
function generateTimesOptions(n) {
  // 安全处理：确保 n 是正整数
  const count = Math.max(0, Math.floor(Number(n) || 0));
  
  return Array.from({ length: count }, (_, index) => {
    const value = index + 1;
    return {
      label: `${value}期`,
      value: value.toString()
    };
  });
}
</script>

<style scoped></style>
