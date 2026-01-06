<template>
  <el-dialog v-model="dialogVisible" title="" width="80%">
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="handleCancel">返回</el-button>
      </span>
    </template>
  </el-dialog>
	<comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
// import { ElMessage } from "element-plus";
import { savePlanCiInfo } from "@/api/prod"; // api接口
import { useValidator } from "@/typings/useValidator";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const props = defineProps<{
  data: Object;
  type: string;
  visible: boolean;
}>();

// const props = defineProps<{
//   data: Object;
//   type: string;
// }>();
const dialogVisible = ref(true);
const dialogRef = ref<DialogMethod | null>(null);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
let para = []; //银行大类 list

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "方案共保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        rules: [getRules("required", { change: true }), getRules("maxLength", {len: 20})],
      },
      {
        prop: "nSeqNo",
        inputtype: "rtnumber",
				title: "序号",
				precision: 0,
				max: 99999999,
				min: 0,
				rules: [getRules("required", { change: true })],
      },
      {
        prop: "cCiAgrmntNo",
        inputtype: "rtinput",
        title: "共保协议号",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cMajorAgrmntMrk",
        inputtype: "rtselect",
        title: "主从协议标志",
        readOnly: true,
        loadData: [
          { value: '0', label: '主协议' }, { value: '1', label: '从协议' }
        ],
        defaultValue: "0",
      },
      {
        prop: "cCoinsurerCde",
        inputtype: "rtselect",
        typeCode: 'Comm_Code_LIST',
        codeParam: { 'CParCde': '327' },
        title: "共保人",
        rules: [getRules("required", { change: true })],
        func: (val: any) => {
          if (!val) {
            return;
          }
          ciSubCompOnChangeHandle(val)
        }
      },
      {
        prop: "cCiSubComp",
        inputtype: "rtselect",
        title: "共保子公司",
        func: (val: any) => {
          console.log(val)
          // {"codeListName":"CDptCde_List","codeListParam":{"CDptCde":"0237020000000","cParCde":"0237020000000"}}
          if (val) {
            //   setFormItem("cDptCde", {
            //   // readOnly
            //   // clearable: false,
            //   // readOnly: true,

            // })

            setFormItem("cDptCde", {
              disabled: false,
              typeCode: 'CDptCde_List_Cache',
              codeParam: { "CDptCde": val, cParCde: val },
            });


            // 【出单机构】设置为 只读

          }
        }
        // rules: [getRules("required", { change: true })],   // 处理完这块code  注释解开 必填项这是
      },
      {
        prop: "cChiefMrk",
        inputtype: "rtselect",
        title: "主共标志",
        typeCode: 'WEB_SYS_STA_DICT',
        codeParam: { 'cParCde': 'yes_no' },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIssueMrk",
        inputtype: "rtselect",
        title: "出单标志",
        rules: [getRules("required", { change: true })],
        loadData: [
          {
            label: "启用",
            value: "1",
          },
          {
            label: "禁用",
            value: "0",
          },
        ],
      },
      {
        prop: "nCiShare",
        inputtype: "rtnumber",
        precision: 6,
        title: "共保比例",
				max: 1,
				min: 0,
				rules: [getRules("required", { change: true })],
      },
      {
        prop: "nPlyFeeRate",
        inputtype: "rtnumber",
        precision: 6,
				title: "出单费率",
				max: 1,
				min: 0,
        // rules: [getRules("required", { change: true })],
      },
			{
        prop: "cSelfMrk",
        inputtype: "rtselect",
        title: "本公司标志",
				typeCode: 'WEB_SYS_STA_DICT',
        codeParam: { 'cParCde': 'yes_no' },
        rules: [getRules("required", { change: true })],
      },

      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "出单机构",
        typeCode: 'cDptCde_List',
        // param: { 'cParCde': 'yes_no' },
      },
      {
        prop: "cJiMrk",
        inputtype: "rtselect",
        title: "主从联标识",
        loadData: [{ value: '1', label: '主联' }, { value: '0', label: '从联' }],
			},
      {
        prop: "nComm",
        inputtype: "rtnumber",
        precision: 2,
				title: "代理经纪费",
				max: 999999999999,
				min: 0,
      },
      {
        prop: "nCommVar",
        inputtype: "rtnumber",
        precision: 2,
				title: "代理经纪费变化",
				max: 999999999999,
				min: 0,
      },
      {
        prop: "cBrkrCde",
        inputtype: "rtselect",
				title: "代理(经纪)人",
				btnWidth: 10,
				showExBtn: true,
				readonly: true,
				typeCode: "Agent_List",
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						console.log("代理(经纪)人icon事件");
						if (!!getValue("cDptCde")) {
							dialogRef.value?.open(
								"agentPre",
								{
									type: "show",
									data: {
										CDptCde: getValue("cDptCde"), //机构
										// CProdNo: sessionData.value?.cProdNo || param.cProdNo, //产品
										// cBsnsTyp: getValue("Base.cBsnsTyp"), //业务来源大类
										// cChaType: getValue("Base.cChaType"), //业务来源中类
										// cChaSubtype: getValue("Base.cChaSubtype"), //业务来源子类
									},
									method: {
										getSelected: (params) => {
											setFormItem("cBrkrCde", {
												loadData: [{ value: params.CChaCde, label:params.CChaCde + params.CChaNme }],
											});
											setValue("cBrkrCde", params.CChaCde);
											setValue("cAgtAgrNo", params.CAgtAgrNo);
											dialogRef.value?.handleClose();
										},
									},
								},
								{
									isOk: (selectdata: any) => {
										console.log("a", selectdata);
									},
								},
								{ title: "代理查询", width: 85 }
							);
						} else {
							ElMessage.warning("请先选择出单机构！");
						}
					},
				},
			},
			{
        prop: "cBrkSlsCde",
        inputtype: "rtselect",
				title: "代理业务员代码",
				btnWidth: 10,
				showExBtn: true,
				readonly: true,
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						console.log("代理业务员icon事件");
						if (!!getValue("cDptCde")) {
							dialogRef.value?.open("agentWorker", {
									type: "show",
									data: {
										CDptCde: getValue('cDptCde'), //机构
										CSlsId: getValue("CSlsId"), //业务员员工号
										CBrkrCde: getValue("cBrkrCde"), //代理(经纪)人
										leading: "CBrkSlsCde",
									},
									method: {
										getSelected: (params) => {
											console.log("代理业务员回显", params);
											setFormItem("cBrkSlsCde", {
												loadData: [
													{
														value:  params["CSlsCde"],
														label:params["CSlsCde"] + params['CSlsNme'],
													},
												],
											});
											setValue("cBrkSlsCde", params.CSlsCde);
											dialogRef.value?.handleClose();
										},
									},
								},
								{ title: "业务员", width: 85 }
							);
						} else {
							ElMessage.warning("请先选择出单机构！");
						}
					},
				},
			},
			{
        prop: "cSlsId",
        inputtype: "rtselect",
				title: "业务员代码",
				btnWidth: 10,
				showExBtn: true,
				readonly: true,
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						console.log("代理业务员icon事件");
						if (!!getValue("cDptCde")) {
							dialogRef.value?.open("agentWorker", {
									type: "show",
									data: {
										CDptCde: getValue('cDptCde'), // 承保机构
										CSlsId: getValue("cSlsId"), // 业务员员工号
										CBrkrCde: getValue("cBrkrCde"), // 代理(经纪)人
										leading: "CSlsId",
									},
									method: {
										getSelected: (params) => {
											console.log("代理业务员回显", params);
											setFormItem("cSlsId", {
												loadData: [
													{
														value:  params["CSlsCde"],
														label:params["CSlsCde"] + params['CSlsNme'],
													},
												],
											});
											setValue("cSlsId", params.CSlsCde);
											dialogRef.value?.handleClose();
										},
									},
								},
								{ title: "业务员", width: 85 }
							);
						} else {
							ElMessage.warning("请先选择出单机构！");
						}
					},
				},
			},
			{
        prop: "cAgtAgrNo",
        inputtype: "rtinput",
        title: "代理协议号",
      },
      {
        prop: "cAcctNo",
        inputtype: "rtinput",
        title: "账号",
        func: (val: any) => {
					if (!!val) {
							// this.setBankInfoNotNull();
					} else {
							// this.clearBankInfoValidators();
					}
        }
      },
      {
        prop: "cAcctNme",
        inputtype: "rtinput",
        title: "账户名",
        func: (val: any) => {
					if (!!val) {
							// this.setBankInfoNotNull();
					} else {
							// this.clearBankInfoValidators();
					}
        }
      },
      {
        prop: "cBankRelTyp",
        inputtype: "rtselect",
        typeCode: 'CBankRelTypList',
        clearable: true,
        title: "收款银行大类",
        func: (val: any) => {
          if (!val) {
            return false
          }
          para = val.split('_');
          const bankname = para[1];  	// 银行名称
          const isdefault = para[2]; 	// 是否默认值
          const banktype = para[3];  	// 银行大类
          console.log(para)
          if (val == null || val == undefined) {
            return
          }
          // 1直连银行 开户行 省、市、对公对私必填   0是非直联，开户行 省、市、区/县、开户行、对公对私必填
          //   setFormItem("cBankPro", {
          //   rules: [getRules("required", {})],
          // });
          // return false
          // setValue("cBankPro", '')
          // setValue("cBankArea", '')
          // setValue("cBankCounty", '')

          if (isdefault === '1') {
            setFormItem("cBankPro", {
              disabled: false,
              rules: [getRules("required", {})],
            });
            setFormItem("cBankArea", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCounty", {
              disabled: true,
              rules: null,
            });

            setFormItem("cBankCde", {
              // disabled: true,
              rules: null,
            });


          } else {
            setFormItem("cBankPro", {
              rules: [getRules("required", {})],
            });
            setFormItem("cBankArea", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCounty", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCde", {
              disabled: true,
              rules: [getRules("required", {})],
            });



            // setFormItem("cPubPri", {
            //   rules: [getRules("required", {})],
            // });
          }

          // 清空开户行

          // setValue("cBankPro",'')
          // setValue("cBankArea",'')
          // setValue("cBankCounty",'')
          setFormItem("cBankCde", {
            disabled: true,
          });
        },
        // }
      },
      {
        prop: "cBankPro",
        inputtype: "rtselect",
        title: "开户行省",
        typeCode: "CBankProList",
        disabled: true,
        func: (val: any) => {

          setFormItem("cBankArea", {
            disabled: false,
            // typeCode: 'CBankAreaList',
            codeParam: { 'areaprovince': val },
            // rules: [getRules("required", {})],
          });
          // setValue("cBankArea", null)
          // setValue("cBankCounty", null)
        }
      },
      {
        prop: "cBankArea",
        inputtype: "rtselect",
        typeCode: 'CBankAreaList',
        title: "开户行市",
        disabled: true,
        func: (val: any) => {
          if (val) {
            setFormItem("cBankCounty", {

              // typeCode: 'CBankCountyList',
              codeParam: { 'areaname': val },
              disabled: false,
              // rules: [getRules("required", {})],
            });
          }

        }
      },
      {
        prop: "cBankCounty",
        inputtype: "rtselect",
        typeCode: 'CBankCountyList',
        title: "开户行县",
        disabled: true,
        func: (val: any) => {
          if (val) {
            setFormItem("cBankCde", {
              disabled: false,
              typeCode: 'CBankCdeList',
              codeParam: { 'banktypecod': para[3], 'areacode': val },
              // rules: [getRules("required", {})],
            });
          }
        }
      },
      {
        prop: "cBankCde",
        inputtype: "rtselect",
        disabled: true,
        title: "开户银行",
      },
      {
        prop: "cBankAddr",
        inputtype: "rtinput",
        title: "开户行地址",
      },
      {
        prop: "cBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号",
      },
      {
        prop: "cGroupId",
        inputtype: "rtinput",
        title: "共同代理人",
      },
      {
        prop: "cCiMrk",
        inputtype: "rtselect",
				title: "联共保业务",
				loadData: [
					{value: '0', label: '非共保业务' },
					{value: '1', label: '外部共保我方主共_主联'},
					{value: '2', label: '外部共保我方从共_主联'},
					{value: '3', label: '外部共保我方主共_无联保'},
					{value: '4', label: '外部共保我方从共_无联保'},
					{value: '5', label: '司内联保_主联'},
					{value: '6', label: '司内联保_从联' },
				],
        defaultValue: '0'
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
				loadData: [
					{ value: '1', label: '有效' },
					{ value: '0', label: '无效' },
				],
        defaultValue: '1',
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = () => {

  const formData = freeEditRef.value?.getFromValue();
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
			try {
				console.log('保存数据', formData);
				formData['cDataSrc'] = "UI"
				savePlanCiInfo(formData).then((res) => {
					if (res.data.code == '1') {
						ElMessage.success("保存成功");
        		emits("ok", {formData});
        		dialogVisible.value = false;
					} else {
						ElMessage.error(res.data.message || '保存失败');
					}
				}); // 调用保存接口
      } catch (error) {
        ElMessage.error("保存失败");
      }
    }

  })


};

const handleCancel = () => {
	emits("cancel");
  dialogVisible.value = false;
};


const ciSubCompOnChangeHandle = (value: string) => {
   // 若选择的是我司
  if ('327001' === value) {
    //  共保子公司 根据内容查询
    setFormItem("cCiSubComp", {
      typeCode: 'Comm_Code_LIST',
      // "CParCde":"subdpt","cParCde":"327001"}
      // codeParam
      codeParam: { "CParCde": "subdpt", cParCde: "327001" },
    });
    // 【出单机构】设置为 只读
    setFormItem("cDptCde", {
      typeCode: '',
      disabled: false,
    })
  } else {
    // 共保子公司 设置为其他
    setValue('cCiSubComp', '')
    setFormItem("cCiSubComp", {
      // typeCode: "Cvrg_LIST",
      loadData: [{ value: '1', label: '其他' }]
    });

    // 【出单机构】设置为 只读
    setValue('cDptCde', '')
    setFormItem("cDptCde", {
      // readOnly
      // clearable: false,
      // readOnly: true,
      disabled: true,
    })
  }
}

// 设置银行账户信息非空
// const setBankInfoNotNull = () => {
// 	const CAcctNoControl = getValue('cAcctNo'); // 账号
// 	const CAcctNmeControl = getValue('cAcctNme'); // 账户名
// 	const CBankRelTypControl = getValue('cBankRelTyp'); // 收款银行大类

// 	if (!!CAcctNoControl || !!CAcctNmeControl || !!CBankRelTypControl) {

// 				setFormItem("cAcctNo", {
// 					disabled: false,
// 					rules: [getRules("required", {}),getRules("bankNum", {})],
// 				});

// 				setFormItem("cAcctNme", {
// 					disabled: false,
// 					rules: [getRules("required", {}),getRules("bankNum", {})],
// 				});

// 			if (!CAcctNmeControl.isRequired) {
// 					CAcctNmeControl.readOnly = false;
// 					CAcctNmeControl.setValidators([Validators.required, BaseCheck.maxCharLength(50)]);
// 					CAcctNmeControl.markAsDirty();
// 					CAcctNmeControl.updateValueAndValidity();
// 			}

// 			if (!CBankRelTypControl.isRequired) {
// 					CBankRelTypControl.readOnly = false;
// 					CBankRelTypControl.setValidators([Validators.required, BaseCheck.maxCharLength(50)]);
// 					CBankRelTypControl.markAsDirty();
// 					CBankRelTypControl.updateValueAndValidity();
// 			}
// 	}
// }

onMounted(async () => {
	if (props.type === "edit" && props.data) {
		props.data['cStatus'] = props.data['cStatus'] || '1'
		props.data['cCiMrk'] = props.data['cCiMrk'] || '0'
		props.data['cMajorAgrmntMrk'] = props.data['cMajorAgrmntMrk'] || '0'
		props.data['nPlyFeeRate'] = props.data['nPlyFeeRate'] || 0
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
	} else if (props.type === "add") {
		let data = {
			cStatus: '1',
			cCiMrk: '0',
			cMajorAgrmntMrk: '0',
			nPlyFeeRate: 0,
		}
    setTimeout(() => {
      freeEditRef.value?.setFormValue(data);
    }, 50);
	}
});


//给表单下拉项赋值
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
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
function getFormconfig() {
  return formconfig;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
