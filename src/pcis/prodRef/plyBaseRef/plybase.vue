<template>
  <div>
    <app-free-edit :freeEditConfig="formconfig1" ref="plyBaseEditRef" />
    <comDialog ref="dialogRef"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import {
  getBsnsTypList,
  getChaTypeList,
  getChaSubtypList,
} from "@/api/code-list-service";
import { checkCdeptByCdptCde, getNmeByCde, coverageHint } from "@/api/prod/index";
import moment from "moment";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useValidator } from "@/typings/useValidator";
import DepartmentTree from "../commodityRef/DepartmentTree.vue";
import { codeListViewStore, dataOpertaor, useProductStore } from "@/store";
import {PolicyService} from "@/views/pcis-main/service/my-page/policy.service";
const productStore = useProductStore();
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { getDeptOptions } from "@/api/dept";
const route = useRoute();
const query = ref(route.query);
const params = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const codeListStore = codeListViewStore();
const { getRules } = useValidator();
const dzmodal = useDzModal();
const dialogRef = ref<DialogMethod | null>(null);

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const param = opertaor.getParam();
const policyService = new PolicyService();
const sessionData = ref(null);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

const plyBaseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const user = JSON.parse(sessionStorage.getItem("user") || '{}');
console.log("user", user);
const subDptCde = ref(); //所属分公司所属分公司
let insuranceCoverageFlag = false;

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  // 20251013 这块代码先注释
  // const p = opertaor.getParam();
  // if(p.sysDist === 'PRICE'){
  //   formconfig11.fromSchema.forEach((item:any) => {
  //     if( item.prop === "Base.cRemark" ) {
  //       item.group = 'group_3';
  //     }
  //   })
  // }
  // 隐藏保单来源、是否互联网、手工出单标志
  formconfig11.fromSchema.forEach((item:any) => {
    if( item.prop === "Base.cIsNet" || item.prop === "Base.cManualMrk") {
      item.hidden = true
    }
    if(item.prop === "base.cIsFollowUp") {
      item.hidden = ['010001','010002','010003'].includes(param.cProdNo) ? false : true;
    }
    // 是否后续出营业中断险
    if(item.prop === "Base.cIsFollowUp") {
      item.hidden = ['010001','010002','010003'].includes(param.cProdNo) ? false : true;
    }
  })
  // 保单基本信息累计保额按钮 059015 只在核保页面展示
  formconfig11.titleBtns?.forEach((item:any) => {
    if(item.id === "insurance_coverage") {
      if(param.pageType === "PLY_UW_PROCESS_SCENE" && param?.pageName !== "priceInquiry") {
        item.hidden = false
      } else {
        item.hidden = true
      }
    }
  })

  Object.assign(formconfig1, formconfig11);
  nextTick(async() => {
    setForSelectFilterable(); //给下拉框设置可搜索
    //录单人联系方式  默认操作员的
    if (user.phoneNO !== null && user.phoneNO !== "") {
    } else {
      setFormItem("Base.cCiOprRel", {
        readonly: false,
        rules: [getRules("contactPhone", {})],
      });
    }

    // 查询承保机构所属分公司和项目类别大类数据
    getCheckCdeptByCdptCde();
		//回显机构部门数据
		let label = param.cDptCnm
		 if (!param.cDptCnm) {
			const response = await getDeptOptions(param.cDptCde);
			if (response.data.length>0) {
				label = response.data[0]["label"]
			}
		}
    setFormItem("Base.cDptCde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${label|| ''}` },
      ],
    });
    //禁用不见费出单原因
    setFormItem("Base.cCanclfeersnCde", { disabled: true });
    // 服务机构默认值
    setFormItem("Base.cIntroDptcde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${label || ''}` },
      ],
    });

    const data = JSON.parse(sessionStorage.getItem("toMyPageData"));
    //将联共保业务默认值设置为0并存到store中
    productStore.setcCiMrk("0");
    if (sessionStorage.getItem("toMyPageData") && !param.cAppNo) {
      if (data.pageType && data.pageType === "app") {
        //新保时，续保单号隐藏
        setFormItem("Base.cOrigPlyNo", { hidden: true });
        setFormItem("Base.cPlyNo", { hidden: false });
      }else if(data.pageType && data.pageType === "orig") {
        //续保时，保单号隐藏
        setFormItem("Base.cOrigPlyNo", { hidden: false });
        setValue('Base.cOrigPlyNo',param?.cPlyNo)
      }
      sessionData.value = data;
    }
    //业务来源大类下拉数据
    const params = {
      CDptCde: param.cDptCde,
      CKindNo: param.cKindNo,
    };
    getBsnsTypList(params).then((res) => {
      if (null != res && null != res["code"]) {
        if (res["code"] === 200) {
          const obj = {
            loadData: res.data,
          };
          setFormItem("Base.cBsnsTyp", obj);
        }
      }
    });
    // 涉农标志除了169001、169002两个产品，其他产品都不可编辑
    if(param.cProdNo !== '169001' && param.cProdNo !== '169002') {
      setFormItem('Base.cAgriMrk',{
        disabled:  true
      })
		}
		// 080002-家用管道燃气综合险、080003-家庭财产综合保险，基本信息中增加是否普惠型家财险，下拉选框“是”“否”，若选择是，则展示文本框，录单人员需在文本框填写项目名称，文本框为必录；
    if(param.cProdNo !== '080002' && param.cProdNo !== '080003') {
      setFormItem('Base.cIsHomeInsurance',{ hidden:  true })
		}
		setFormItem('Base.cProjectName',{ hidden:  true })
    // 添加处理 Base.cCiMrk 值为 6 时显示"从联单"的逻辑
    
    // 询价录单 联共保业务暂时固定非共保业务，不允许选择联共保
    // if(param.pageName === "priceInquiry") {
    //   setFormItem('Base.cCiMrk',{
    //     disabled:  true
    //   })
    // }
  });

});
// 添加处理联共保标识显示逻辑的函数
const handleCiMrkDisplay = () => {
  setTimeout(() => {
    nextTick(() => {
      const ciMrkValue = getValue("Base.cCiMrk");
      if (ciMrkValue === "6") {
        // 当值为6时，设置下拉选项显示为"从联单"
        setFormItem("Base.cCiMrk", {
          loadData: [
            { value: "0", label: "非共保业务" },
            { value: "1", label: "外部共保我方主共_主联" },
            { value: "2", label: "外部共保我方从共_主联" },
            { value: "3", label: "外部共保我方主共_无联保" },
            { value: "4", label: "外部共保我方从共_无联保" },
            { value: "5", label: "司内联保_主联" },
            { value: "6", label: "联保单" } // 添加值为6时的显示文本
          ]
        });
      }
    });
  }, 500);
  
};
// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },
  //联共保下拉change
  cCiMrkChange: (val:any) => {
    // 对于询价单场景，不执行联共保菜单显示和信息初始化
  if (params.pageName === "priceInquiry") {
    productStore.setcPriceCiMrk(val)
     setFormItem("Base.cRemark", { rules: [getRules("required", {})], });
  } else {
    setFormItem("Base.cRemark", { rules: [], });
    // 非询价单场景保持原有逻辑
    productStore.setcCiMrk(val);
    if (!!val && !opertaor.getParam().initFlag) {
      const ciRef = opertaor.getTableRefs()['ci'];
      if (!!ciRef) {
        ciRef.initCiInfo({
          cCiMrk: val
        });
      }
    }
    // 从共主联、从共无联保，条款中的保费可以修改
    if(['2','4'].includes(val)) {
      opertaor.getTableRefByKey('cvrg')?.showFlush()
    }
  }

    // 录单人联系方式
    if(val=='1'|| val=='2'||val=='5'){
          setFormItem("Base.cCiOprRel", { hidden: false, rules: [getRules("required", {}),getRules("contactPhone", {})] }); 
    }else{
           setFormItem("Base.cCiOprRel", { hidden: true, rules: [getRules("contactPhone", {})] });
    }

  },
  //业务来源大类
  businessKindFunc: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cChaType", "");
      setValue("Base.cChaSubtype", "");
    }
    if (val) {
      getChaTypeList({ BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }).then(
        (res) => {
          if (null != res && null != res["code"]) {
            if (res["code"] === 200) {
              const obj = {
                loadData: res.data,
              };
              setFormItem("Base.cChaType", obj);
            }
          }
        }
      );

      if(p.cTransMrk !== '1'){
        if (val === "19002" || val === "19003" ) {
            const obj = {
              rules: [getRules("required", {})],
              btnItems: {
                disabled: false,
              },
            };
            setFormItem("Base.cBrkrCde", {...obj,disabled:false}); //代理(经纪)人
            setFormItem("Base.cBrkSlsCde", obj); //代理业务员
            setFormItem("Base.cAgtAgrNo", { rules: [getRules("required", {})] }); //代理合作协议

        } else {
            const obj = {
              rules: [],
              disabled: true,
              btnItems: {
                disabled: true,
              },
            };
            setFormItem("Base.cBrkrCde", obj); //代理(经纪)人
            setFormItem("Base.cBrkSlsCde", obj); //代理业务员

            setFormItem("Base.cAgtAgrNo", { rules: null }); //代理合作协议
            if (!p.initFlag) {
              setValue("Base.cBrkrCde", "");
              setValue("Base.cBrkSlsCde", "");
              setValue("Base.cAgtAgrNo", "");
            }
            nextTick(() => {
              plyBaseEditRef.value?.clearValidate("Base.cBrkSlsCde");
            });
        }
      }
      nextTick(() => {
        const ciRef = opertaor.getTableRefs()['ci'];
        if (val === "19002" || val === "19003") {
          // 非直销业务：清空业务员
          if (ciRef) {
            const ciData = ciRef.getFromValue();
            ciData.forEach((row: any) => {
              ciRef.setValueByRowKey("Ci.cSlsId", row._dataId, "");
              ciRef.setValueByRowKey("Ci.cSlsNme", row._dataId, "");
            });
          }
          //代理业务 | 经纪业务
          const obj = {
            rules: [getRules("required", {})],
            btnItems: {
              disabled: false,
            },
          };
        } else {
          // 直销业务：清空代理业务员和代理经纪人
          if (ciRef) {
            const ciData = ciRef.getFromValue();
            ciData.forEach((row: any) => {
              ciRef.setValueByRowKey("Ci.cBrkrCde", row._dataId, "");
              ciRef.setValueByRowKey("Ci.cBrkSlsCde", row._dataId, "");
            });
          }
        }
        if (!!ciRef) {
          ciRef.valideRequired();
        }
      });
    }
  },
  //业务来源中类
  businessFunc: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cChaSubtype", "");
    }

    if (val) {
      const params = {
        CChaType: val,
        flag: 1,
        scene: "PLY_APP_NEW_SCENE",
      };
      if (val === "1900201") {
        //个人代理
        const obj = {
          rules: null,
          btnItems: {
            disabled: false,
          },
        };
        if (!p.initFlag) {
          setFormItem("Base.cSlsId", obj); //业务员工号
          setValue("Base.cSlsId", "");
          setValue("Base.cSlsNme", "");
        }
        setFormItem("Base.cSlsId", { rules: null }); //业务员工号
      } else {
        const obj = {
          rules: [getRules("required", {})],
          btnItems: {
            disabled: false,
          },
        };
        if (!p.initFlag) {
          setFormItem("Base.cSlsId", obj); //业务员工号
        }
        setFormItem("Base.cSlsId", { rules: [getRules("required", {})] }); //业务员工号
      }

      getChaSubtypList(params).then((res) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            const obj = {
              loadData: res.data,
            };
            setFormItem("Base.cChaSubtype", obj);
          }
        }
      });
    }
  },
  //业务来源子类
  businessSubFunc: (val) => {
    // 清除代理(经纪)人、代理业务员的值
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cBrkrCde", "");
      setValue("Base.cBrkSlsCde", "");
      // 非个人代理业务，清空业务员信息
      if (getValue("Base.cBsnsTyp") != '19002' && getValue("Base.cChaType") != '1900201' && val != '1900201001') {
        setFormItem("Base.cSlsId", {disabled: false,btnItems: {disabled: false}});
        setFormItem("Base.cIntroSalecde", {loadData: [], btnItems: { disabled: false } });
        setValue("Base.cSlsId", null); // 业务员员工号
        setValue("Base.cSlsNme", null); // 业务员名称
        setValue("Base.cSlsTel", null); // 业务员电话
        setValue("Base.cSlsDptcde", null); // 业务员机构代码
        setValue("Base.cSlsCde", null); // 业务员执业证号
        setValue("Base.cIntroSalecde", null); // 服务机构业务员
      }
		}
  },
  //代理(经纪)人change事件
  agentChange: (value: string) => {
    // 清除代代理业务员的值
    const p = opertaor.getParam();
    if (p.initFlag) {
      if(value && value != '') {
        codeListStore.queryCodeList({
          codeListName: 'WEB_CUS_CHA_BY_ID',
          codeListParam: {
            value: value,
          }
        }).then((res) => {
          plyBaseEditRef.value?.addCodeListMap({
            code: "Base.cBrkrCde",
            list: res
          });
        });
      }
    }else {
      setValue("Base.cBrkSlsCde", "");
    }
  },
  updateSlsId: (v: any) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cIntroSalecde", v);
    }
  },
  //代理(经纪)人icon事件
  agentFunc: () => {
    console.log("代理(经纪)人icon事件");
    if (getValue("Base.cBsnsTyp") && getValue("Base.cBsnsTyp") !== "19001") {
      dialogRef.value?.open(
        "agentPre",
        {
          type: "show",
          data: {
            CDptCde: sessionData.value?.cDptCde || param.cDptCde, //机构
            CProdNo: sessionData.value?.cProdNo || param.cProdNo, //产品
            cBsnsTyp: getValue("Base.cBsnsTyp"), //业务来源大类
            cChaType: getValue("Base.cChaType"), //业务来源中类
            cChaSubtype: getValue("Base.cChaSubtype"), //业务来源子类
          },
          method: {
            getSelected: (params) => {
              setFormItem("Base.cBrkrCde", {
                loadData: [{ value: params.CChaCde, label:params.CChaCde + params.CChaNme }],
              });
              setValue("Base.cBrkrCde", params.CChaCde);
              setValue("Base.cAgtAgrNo", params.CAgtAgrNo);
              const ciRef = opertaor.getTableRefs()['ci'];
              if (!!ciRef) {
                ciRef.intiAgentBroker({
                  CChaCde: params.CChaCde, //代理经纪人代码
                  CChaNme: params.CChaNme, //代理经纪人名称
                  loadData:[{value:  params["CChaCde"],label:params["CChaCde"] + params['CChaNme']}],
                });
							}
							// 个人代理业务获取业务员信息
							if (getValue("Base.cBsnsTyp") == '19002' && getValue("Base.cChaType") == '1900201' && getValue("Base.cChaSubtype") == '1900201001') {
								setFormItem("Base.cSlsId", {disabled: true,btnItems: {disabled: true}});
								setFormItem("Base.cIntroSalecde", {btnItems: {disabled: true}});
								policyService.getPrivateSelsList({cUserCode: params.CUserCode}).then((res) => {
									if (res["code"] === 200) {
										setValue("Base.cSlsId", res.data.cSlsCde); // 业务员员工号
										setValue("Base.cSlsNme", res.data.cSlsNme); // 业务员名称
										setValue("Base.cSlsTel", res.data.cTel); // 业务员电话
										setValue("Base.cSlsDptcde", res.data.cDptCde); // 业务员机构代码
										setValue("Base.cSlsCde", res.data.cCtfctNo); // 业务员执业证号
										codeListStore.queryCodeList({codeListName: "CSaleCde_List",codeListParam: {CSlsCde: res.data["cSlsCde"],},},false,false).then((res1) => {
											console.log("业务员=-==", res1);
											if (res1 && res1.length > 0) {
												const codeValData = res1;
												if (codeValData) {
													// 服务机构业务员下拉和显示的值
													setFormItem("Base.cIntroSalecde", {
														loadData: codeValData,
													});
													setValue("Base.cIntroSalecde", res.data.cSlsCde); // 服务机构业务员
												}
											}
										});
									}
								})
								.catch((err) => {
								});
							}
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
      ElMessage.warning("渠道分类--请选择非直销业务!");
    }
  },
  cBrkSlsCdeChange: (value: any, row: any, item: any) =>{
    const p = opertaor.getParam();
    console.log('cBrkSlsCdeChange-value', value)
    console.log('cBrkSlsCdeChange-item', item)
    // if (p.initFlag) {
      if(value && value != '') {
        codeListStore.queryCodeList({
          codeListName: "WEB_ORG_SALES_BY_ID",
          codeListParam: {value: value}
        }).then((res) => {
          plyBaseEditRef.value?.addCodeListMap({
            code: "Base.cBrkSlsCde",
            list: res,
          });

          const codeMap = plyBaseEditRef.value?.getCodeListMap();
          console.log('cBrkSlsCdeChange-codeMap', codeMap)
        });
      }
    // }
  },
  //代理业务员icon事件
  agentSaleFuncA: () => {
    console.log("代理业务员icon事件");
    if (!getValue("Base.cBrkrCde")) {
      ElMessage.warning("请先选择代理(经济)人！");
      return;
    }
    let cslstyp = "";
    if (getValue("Base.cChaType") === "1900201") {
      // 个人代理时
      cslstyp = "020003";
    } else if (
      getValue("Base.cBsnsTyp") !== "19001" &&
      getValue("Base.cChaType") !== "1900201"
    ) {
      // 非直销且非个人代理
      cslstyp = "020004";
    };
    
    console.log('sessionData',sessionData.value)
    console.log('Base.cDptCde',getValue('Base.cDptCde'))
    dialogRef.value?.open("agentWorker", {
        type: "show",
        data: {
          // CDptCde: sessionData.value?.cDptCde,
          // CDptCde: sessionData.value?.cDptCde || param.cDptCde, //机构
          CDptCde: getValue('Base.cDptCde') || param.cDptCde, //机构
          cBsnsTyp: getValue("Base.cBsnsTyp"),
          CChaType: getValue("Base.cChaType"),
          cChaSubtype: getValue("Base.cChaSubtype"),
          CSlsId: getValue("Base.CSlsId"), //业务员员工号
          CBrkrCde: getValue("Base.cBrkrCde"), //代理(经纪)人
          CDptAttr: getValue("Base.CDptAttr"), //投保单业务归属部门的部门类型(angular上被hidden的,逻辑赋值angular：guide.component.ts【324行】)
          CSlsTyp: cslstyp,
          leading: "CBrkSlsCde",
        },
        method: {
          getSelected: (params) => {
            console.log("代理业务员回显", params);
            setFormValue({
              // "Base.cBrkSlsCde": params.CSlsCde, //代理业务员
              "Base.cCertfNo": params.CCtfctNo, //代理业务执业证号
              "Base.cBrkrDptcde": params.CDptCde, //代理业务员机构代码
            });
              setFormItem("Base.cBrkSlsCde", {
              loadData: [
                {
                  value:  params["CSlsCde"],
                  label:params["CSlsCde"] + params['CSlsNme'],
                },
              ],
            });
            const ciRef = opertaor.getTableRefs()['ci'];
            if (!!ciRef) {
              ciRef.initProxySales({
                cSlsId: params.CSlsCde, //业务员员工号
                cSlsNme: params.CSlsNme, //业务员名称
                loadData:[{value:  params["CSlsCde"],label:params["CSlsCde"] + params['CSlsNme']}],
              });
            }
            setValue("Base.cBrkSlsCde", params.CSlsCde);
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "业务员", width: 85 }
    );
  },
  // 业务员工号ICON事件
  saleNoFunc: () => {
    let cslstyp = "";
    if (getValue("Base.cChaType") === "1900201") {
      // 个人代理时
      cslstyp = "020003";
    } else if (
      getValue("Base.cBsnsTyp") !== "19001" &&
      getValue("Base.cChaType") !== "1900201"
    ) {
      // 非直销且非个人代理
      cslstyp = "020004";
    }
    dialogRef.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {
          CDptCde: sessionData.value?.cDptCde || getValue("Base.cDptCde"),
          cBsnsTyp: getValue("Base.cBsnsTyp"),
          cChaType: getValue("Base.cChaType"),
          cChaSubtype: getValue("Base.cChaSubtype"),
          CSlsId: getValue("Base.CSlsId"), //业务员员工号
          CBrkrCde: getValue("Base.CBrkrCde"), //代理(经纪)人
          CDptAttr: getValue("Base.CDptAttr"), //投保单业务归属部门的部门类型(angular上被hidden的,逻辑赋值angular：guide.component.ts【324行】)
          CSlsTyp: cslstyp,
          leading: "CSlsId",
        },
        method: {
          getSelected: (params) => {
            setFormValue({
              "Base.cSlsId": params.CSlsCde, //业务员员工号
              "Base.cSlsNme": params.CSlsNme, //业务员名称
              "Base.cSlsCde": params.CCtfctNo, //业务员执业证号
              "Base.cSlsTel": params.CMobile, //业务员电话
              "Base.cSlsDptcde": params.CDptCde, //业务员机构代码
              "Base.cIntroDptcde": "", //清空服务机构值
            });
            const ops = {
              code: "orgDpt",
              val: params["CDptCde"],
            };
            getNmeByCde(ops).then((res) => {
              if (res && res.code == 200) {
                const codeValData = res.data;
                if (codeValData) {
                  setFormItem("Base.cIntroDptcde", {
                    loadData: [
                      {
                        value: params["CDptCde"],
                        label: codeValData["data"],
                      },
                    ],
                  });
                  setValue("Base.cIntroDptcde", params.CDptCde);
                }
              }
            });
            codeListStore
              .queryCodeList(
                {
                  codeListName: "CSaleCde_List",
                  codeListParam: {
                    CSlsCde: params["CSlsCde"],
                  },
                },
                false,
                false
              )
              .then((res) => {
                console.log("业务员返回值",res)
                if (res) {
                  const codeValData = res;
                  if (codeValData) {
                    setFormItem("Base.cIntroSalecde", {
                      loadData: codeValData,
                    });
                    const ciRef = opertaor.getTableRefs()['ci'];
                    if (!!ciRef) {
                      ciRef.initcbusiner({
                        cSlsId: params.CSlsCde, //业务员员工号
                        cSlsNme: params.CSlsNme, //业务员名称
                        loadData:codeValData,
                      });
                    }
                    console.log("业务员下拉值",codeValData)
                    // 当选择了业务员时，服务机构业务员默认为业务员
                    setValue("Base.cIntroSalecde", params.CSlsCde);
                  }
                }
              });
              
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "业务员", width: 85 }
    );
  },
  //服务机构ICON事件
  saleDptFunc: () => {
    dzmodal.open(DepartmentTree, {type: "Issuer", data: {} ,isXY:true}).then((res) => {
      if (res.type === "ok") {
        console.log("选中的回显", res);
        if (res.body) {
          const selectObj = res.body;
          if(!(selectObj.cSignDptMrk) ||  selectObj.cSignDptMrk === '' || selectObj.cSignDptMrk === null || selectObj.cSignDptMrk === undefined || selectObj.cSignDptMrk === '0'){
              return 	ElMessage.warning("所选机构不是出单机构");
            }
          let obj = {
            loadData: [
              {
                label:   +selectObj.id + "" +selectObj.name  ,
                value: selectObj.id,
              },
            ],
          };
          setFormItem("Base.cIntroDptcde", obj);
          setValue("Base.cIntroDptcde", selectObj.id);
        }
      }
    });
  },
  // 服务机构业务员ICON事件
  dptSaleNoFunc: () => {
    console.log('获取服务--',getValue("Base.cIntroDptcde"))
    let CDptCde =getValue("Base.cIntroDptcde")
    dialogRef.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {
          // CDptCde: sessionData.value?.cDptCde,
         CDptCde, //服务机构
        },
        method: {
          getSelected: (params) => {
            // setFormValue({
            //   "Base.cIntroSalecde": params.CSlsNme, //业务员员工号
            // });
            codeListStore
              .queryCodeList(
                {
                  codeListName: "CSaleCde_List",
                  codeListParam: {
                    CSlsCde: params["CSlsCde"],
                  },
                },
                false,
                false
              )
              .then((res) => {
                console.log("业务员=-==", res);
                if (res && res.length > 0) {
                  const codeValData = res;
                  if (codeValData) {
                    // 服务机构业务员下拉和显示的值
                    setFormItem("Base.cIntroSalecde", {
                      loadData: codeValData,
                    });
                    setValue("Base.cIntroSalecde", params.CSlsCde);
                  }
                }
              });
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "业务员", width: 85 }
    );
  },
  //特殊不见费出单change事件
  specSalesFunc: (val:any) => {
    // 修改不见费出单原因校验
    // const p = opertaor.getParam();
    // if (val == 1) {
    //   setFormItem("Base.cCanclfeersnCde", {
    //     rules: [getRules("required", {})],
    //     disabled: false,
    //   });
    //   const CDptCde = getValue("Base.cDptCde");
    //   if (CDptCde.startsWith('0253')) {
    //     setFormItem("Base.cCanclfeersnCde", { typeCode: 'YN_NV_NoPayseeMoeny' });
    //   }
    // } else {
    //   setFormItem("Base.cCanclfeersnCde", { rules: null, disabled: true });
    //   if (!p.initFlag) {
    //     setValue("Base.cCanclfeersnCde", "");
    //   }
    // }
  },
  //项目类别大类change事件
  cPrjCtgTypChange: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cPrjCtgMidTyp", "");
      setValue("Base.cPrjCtgSubTyp", "");
    }
    if (val) {
      // Base.cPrjCtgMidTyp
      // setFormItem("Base.cPrjCtgMidTyp", { rules: null, disabled: true });
      codeListStore
        .queryCodeList({
          codeListName: "CPrjCtgTyp_List",
          codeListParam: {
            // CRangeCde: subDptCde.value,
            CParCde: val,
            cLev: "2",
          },
        })
        .then((res) => {
          if (res) {
            setFormItem("Base.cPrjCtgMidTyp", {
              loadData: res,
              rules: [getRules("required", {})],
            });
          }
        });
    }else{
       setFormItem("Base.cPrjCtgMidTyp", { rules: null });
    }
  },
  //项目类别中类change事件
  cPrjCtgMidTypChange: (val) => {
    const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cPrjCtgSubTyp", "");
    }
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "CPrjCtgTyp_List",
          codeListParam: {
            // CRangeCde: subDptCde.value,
            CParCde: val,
            cLev: "3",
          },
        })
        .then((res) => {
          if (res) {
            setFormItem("Base.cPrjCtgSubTyp", { loadData: res });
          }
        });
    }
  },
  // change
  cAgriMrkChange:(val:any)=>{
  },
  // 是否见费出单
  cNeedfeeFlagChange:(val:any)=>{
    // 选择是 隐藏不见费出单原因、特殊不见费出单
    if(val === '1') {
      // setValue("Base.cCanclfeeFlg", 0)
      nextTick(() => {
        setFormItem("Base.cCanclfeersnCde", { hidden: true });
        setFormItem("Base.cCanclfeeFlg", { hidden: true });
      })
    } else {// 选择否 不见费出单原因必填，隐藏特殊不见费出单
      setFormItem("Base.cCanclfeersnCde", { hidden: false, rules: [getRules("required", {})], disabled: false });
      setFormItem("Base.cCanclfeeFlg", { hidden: true });
    }
  },
  // 保单号
  cPlyNoChange:(val:any)=>{
    if(val?.length === 23) {
      opertaor.getTableRefs().base?.setFormItem("Base.cRatioTyp", {
        loadData: [
          { label: "按月", value: "1" },
          { label: "按日", value: "2" },
          { label: "不计", value: "3" },
        ],
      })
    }
  },
  // 录单人
  cOprCdeChange:(val:any) => {
    if(val) {
      setFormItem("Base.cOprCde", {
        codeParam: { 'cOperId': val },
      });
    }
  },
  // 累计保额按钮
  insuranceCoverageFunc:() => {
    if(!insuranceCoverageFlag) {
      insuranceCoverageFlag = true
      coverageHint({cAppNo: param.cAppNo}).then((res:any) => {
        if(res.code == '1') {
          ElMessage.warning({ message: res.message, duration: 3000 });
        } else {
          ElMessage.error(res.message)
        }
        insuranceCoverageFlag = false
      }).catch((err:any) => {
        ElMessage.error(err.message)
        insuranceCoverageFlag = false
      })
    }
	},
	// 是否普惠型家财险
	cIsHomeInsuranceChange: (val) => {
		const p = opertaor.getParam();
    if (!p.initFlag) {
      setValue("Base.cProjectName", "");
    }
		if (val == "1") {
			setFormItem('Base.cProjectName',{ hidden: false, rules: [getRules("required", {})] })
		} else {
			setFormItem('Base.cProjectName',{ hidden: true })
		}
	}
};

// 绑定特殊验证器
const exRules = {};

function getCheckCdeptByCdptCde() {
  // const CDptCde = getValue("Base.cDptCde");
  const CDptCde = JSON.parse(sessionStorage.getItem("user")).companyId;
  if (CDptCde) {
    // 查询承保机构所属分公司
    checkCdeptByCdptCde({ dptCde: CDptCde }).then(
      (res) => {
        if (res["code"] === 200) {
          if (res.data) {
            subDptCde.value = res.data;
            //查询项目类别大类数据
            codeListStore
              .queryCodeList(
                {
                  codeListName: "CPrjCtgTyp_List",
                  codeListParam: {
                    // CRangeCde: subDptCde.value,
                    CRangeCde: ['0200000000000', subDptCde.value],
                    CParCde: '-1',
                    cLev: "1",
                  },
                },
                false,
                false
              )
              .then((res) => {
                if (res) {
                  setFormItem("Base.cPrjCtgTyp", { loadData: res });
                }
              })
              .catch((err) => {
                setFormItem("Base.cPrjCtgTyp", { loadData: [] });
              });
          }
        } else {
          ElMessage.error("根据机构编码查询分公司出现异常！");
        }
      },
      (error) => {
        ElMessage.error("根据机构编码查询分公司出现异常！");
      }
    );
  }
}

function getFromValue() {
  return plyBaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  plyBaseEditRef?.value?.setFormValue(value);
  setTimeout(() => {
    const policySource = param?.pageType === "copy" 
    ? "8" 
    : (param?.cPolicySource ?? param?.cRecordType);
  setValue("Base.cPolicySource", policySource);
  handleCiMrkDisplay();
  }, 1000);
  
}

function validate() {
  return plyBaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  plyBaseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return plyBaseEditRef?.value?.getValue(key);
}

//给表单下拉项赋值
// function setFormItem(key: any, obj: any) {
//   if (obj && Object.keys(obj).length) {
//     formconfig1.fromSchema?.forEach((item) => {
//       if (item.prop === key) {
//         //控制尾部按钮的
//         if (item.btnItems && obj.btnItems) {
//           for (let key in obj.btnItems) {
//             item.btnItems[key] = obj.btnItems[key];
//           }
//         }else{
//           Object.assign(item, obj);
//         }
//       }
//     });
//   }
// }
function setFormItem(key: string, obj: Record<string, any>) {
  if (!obj || !formconfig1.fromSchema) return;

  formconfig1.fromSchema.forEach((item) => {
    if (item.prop === key) {
      // 单独处理 btnItems
      if (obj.btnItems && item.btnItems) {
        for (let k in obj.btnItems) {
          item.btnItems[k] = obj.btnItems[k];
        }
      }

      // 清除已有属性再赋值，避免残留
      const propsToCopy = [
        "rules",
        "readonly",
        "disabled",
        "hidden",
        "loadData",
        "placeholder",
        "filterable",
      ];
      propsToCopy.forEach((prop) => {
        if (prop in obj) {
          item[prop] = obj[prop];
        }
      });

      // 其他非特定属性通过 assign 补充
      const extraProps = Object.keys(obj).filter(
        (k) => !propsToCopy.includes(k) && k !== "btnItems"
      );
      if (extraProps.length > 0) {
        Object.assign(item, ...extraProps.map((k) => ({ [k]: obj[k] })));
      }
    }
  });
}

//设置select的可搜索
function setForSelectFilterable() {
  formconfig1.fromSchema?.forEach((item) => {
    if (item.inputtype == "rtSelectV2" || item.inputtype == "rtSelect") {
      item.filterable = true;
    }
  });
}

function getFormconfig() {
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  plyBaseEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  addProvide
});
</script>

<style scoped></style>
