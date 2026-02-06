<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialog"></comDialog>
<!--  <input-->
<!--      type="file"-->
<!--      ref="fileInputRef"-->
<!--      style="display: none"-->
<!--      @change="handleFileChange"-->
<!--  />-->
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { checkCdeptByCdptCde, getNmeByCde } from "@/api/prod/index";
import { queryEcargoDetails } from "@/api/cargo";
import { formInit } from "@/shared/from-init";
import { codeListViewStore,dataOpertaor, useProductStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
const dzmodal = useDzModal();
const { getRules } = useValidator();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
import { useRoute } from "vue-router";
import {getBsnsTypList,getChaTypeList,getChaSubtypList,} from "@/api/code-list-service";
import dayjs from "dayjs";
import { getDeptOptions } from "@/api/dept";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const route = useRoute();
const fileInputRef = ref(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const user = idxParam?.user;
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const subDptCde = ref(); //所属分公司
const initFlag = computed(() => formPage.init);
const cIntroDptCnm = ref()
onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(async() => {
    setFormItem('ECargoBase.cCiOprRel',{ rules: [getRules("contactInformation", {})] })
    // setFormItem('ECargoBase.cCiMrk',{hidden:true})
    initComp();
    // 查询承保机构所属分公司和项目类别大类数据
    getCheckCdeptByCdptCde();
    //回显出单机构
		let label = param.cDptCnm
		if (!param.cDptCnm) {
			const response = await getDeptOptions(param.cDptCde);
			if (response.data.length>0) {
				label = response.data[0]["label"]
			}
		}
    setFormItem("ECargoBase.cDptCde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${label || ''}` },
      ],
    });
    setValue("ECargoBase.cDptCde", param.cDptCde);
    //回显服务机构数据
    setFormItem("ECargoBase.cIntroDptcde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${label || ''}` },
      ],
    });
  })
});


// 组件初始化方法
function initComp() {
  //业务来源大类下拉数据
  getBsnsTypList({ CDptCde: user.companyId, CKindNo: '02'}).then((res:any) => {
    if (null != res && null != res["code"]) {
      if (res["code"] === 200) {
        baseEditRef.value?.addCodeListMap({
          code: 'ECargoBase.cBsnsTyp',
          list: res.data
        });
      }
    }
  });
}
function getDaysBetweenDates(dateStr1, dateStr2) {
  // 提取日期部分（忽略时间）
  const extractDate = (str) => {
    const datePart = str.split(' ')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // 转换为Date对象
  const date1 = extractDate(dateStr1);
  const date2 = extractDate(dateStr2);

  // 计算时间差（毫秒）
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());

  // 转换为天数
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}
//给表单下拉项赋值
// 绑定方法
const method = {
  //服务机构ICON事件
  saleDptFunc: () => {
    dzmodal.open(DepartmentTree, {}).then((res) => {
      if (res.type === "ok") {
        console.log("选中的回显", res);
        if (res.body) {
          const selectObj = res.body;
          let obj = {
            loadData: [
              {
                label: `${selectObj.id}${selectObj.name}`,
                value: selectObj.id,
              },
            ],
          };
          setFormItem("ECargoBase.cIntroDptcde", obj);
          setValue("ECargoBase.cIntroDptcde", selectObj.id);
          cIntroDptCnm.value = selectObj.name
        }
      }
    });
  },
  // 服务机构业务员ICON事件
  dptSaleNoFunc: () => {
    const cDptCde = getValue("ECargoBase.cIntroDptcde") || ''
    const cDptCnm = cIntroDptCnm.value
    dialog.value?.open(
        "agentWorker",
        {
          type: "show",
          data: {
            // CDptCde: sessionData.value?.cDptCde,
            cDptCde,
            cDptCnm
          },
          method: {
            getSelected: (params) => {
              setFormValue({
                "ECargoBase.cIntroSalecde": params.CSlsNme, //业务员员工号
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
                    console.log("业务员=-==", res);
                    if (res && res.code == 200) {
                      const codeValData = res.data;
                      if (codeValData) {
                        // 服务机构业务员下拉和显示的值
                        setFormItem("ECargoBase.cIntroSalecde", {
                          loadData: codeValData,
                        });
                        setValue("ECargoBase.cIntroSalecde", params.CSlsCde);
                      }
                    }
                  });
              dialog.value?.handleClose();
            },
          },
        },
        {
          isOk: (selectdata: any) => {
            console.log("a", selectdata);
          },
        },
        { title: "业务员", width: 85 }
    );
  },
  tInsrncBgnTmChange:(val:any)=>{
    if(getValue('ECargoBase.tInsrncBgnTm') && getValue('ECargoBase.tInsrncEndTm')){
      if(new Date(getValue('ECargoBase.tInsrncBgnTm') ) > new Date(getValue('ECargoBase.tInsrncEndTm'))){
        setValue('ECargoBase.tInsrncBgnTm','')
        ElMessage.warning("协议开始时间不能晚于结束时间");
        return
      }else{
        const startDate = dayjs(getValue('ECargoBase.tInsrncBgnTm')); // 新的开始时间（v是用户选择的开始时间）
        let endDate = dayjs(getValue('ECargoBase.tInsrncEndTm')).format("YYYY-MM-DD 23:59:59")  // 结束时间
        // let days = Number(getValue('ECargoBase.cTmSysCde')); // 天数
        // const isDaysEmpty = isNaN(days) || days <= 0;
        // 计算新的结束时间
        // let newEndDate;
        // if (!isDaysEmpty) {
        //   newEndDate = startDate.add(days, 'day').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // } else if (!endDate) {
        //   newEndDate = startDate.add(1, 'year').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // } else {
        //   newEndDate = dayjs(endDate).subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // }
        // setValue('ECargoBase.tInsrncEndTm',newEndDate)
        const days = dayjs(endDate).add(1, 'second').diff(startDate, 'day');
        setValue( 'ECargoBase.cTmSysCde' ,days)
      }
    }
  },
  tInsrncEndTmChange:(val:any)=>{
    if(getValue('ECargoBase.tInsrncBgnTm') && getValue('ECargoBase.tInsrncEndTm')){
      if(new Date(getValue('ECargoBase.tInsrncBgnTm') ) > new Date(getValue('ECargoBase.tInsrncEndTm'))){
        setValue('ECargoBase.tInsrncEndTm','')
        ElMessage.warning("协议结束时间不能早于开始时间");
        return
      }else {
        const startDate = dayjs(getValue('ECargoBase.tInsrncBgnTm')); // 新的开始时间（v是用户选择的开始时间）
        let endDate = dayjs(getValue('ECargoBase.tInsrncEndTm')).format("YYYY-MM-DD 23:59:59") // 结束时间
        // let days = Number(getValue('ECargoBase.cTmSysCde')); // 天数
        // const isDaysEmpty = isNaN(days) || days <= 0;
        // 计算新的结束时间
        // let newEndDate;
        // if (!isDaysEmpty) {
        //   newEndDate = startDate.add(days, 'day').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // } else if (!endDate) {
        //   newEndDate = startDate.add(1, 'year').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // } else {
        //   newEndDate = dayjs(endDate).subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
        //   days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
        // }
        const days = dayjs(endDate).add(1, 'second').diff(startDate, 'day');
        setValue('ECargoBase.tInsrncEndTm',endDate)
        setValue( 'ECargoBase.cTmSysCde' ,days)
      }
    }
  },
  // func demo
  funcquery: () => {},

  cCiMrkChange: (val: string) => {
    if(val == "0" || val == "3" || val =="4"){
      idxParam.ciJiMrk = val;
      const ciAgreementECargo = formPage.getComponentRefById('AgreementCiTcp');
      if(ciAgreementECargo) {
        ciAgreementECargo.cCiMrkChangeFun({cCiMrk: val})
      }
      if (!!val && !initFlag.value) {
        const cargoCiRef = formPage.getComponentRefById('AgreementCi');
        if (!!cargoCiRef) {
          cargoCiRef.initCiInfo({
            cCiMrk: val
          });
        }
      }
      // 当val为'0'时隐藏ECargoBase.nCiOwnRmbPrm和ECargoBase.nCiOwnRmbAmt，否则显示
      if (val === '0') {
        formPage.getComponentRefById("AgreementFeeWarn").setFormItem('ECargoBase.nCiOwnRmbPrm', { hidden: true });
        formPage.getComponentRefById("AgreementFeeWarn").setFormItem('ECargoBase.nCiOwnRmbAmt', { hidden: true });
      } else {
        formPage.getComponentRefById("AgreementFeeWarn").setFormItem('ECargoBase.nCiOwnRmbPrm', { hidden: false });
        formPage.getComponentRefById("AgreementFeeWarn").setFormItem('ECargoBase.nCiOwnRmbAmt', { hidden: false });
      }
    }else{
      ElMessage.error("所选联共保类型暂时不支持出单业务");
      setValue("ECargoBase.cCiMrk","")
      return false;
    }
		// 两个从共---联共保主协议信息单证打印方式-默认值-按共保比例打印（602002）
    if (!!val && !initFlag.value) {
			setTimeout(() => {
				if (val == '2' || val == '4') {
					formPage.getComponentRefById("AgreementCiTcp")?.setValue("ECargoBase.cCiPriTyp", '602002')
				} else {
					formPage.getComponentRefById("AgreementCiTcp")?.setValue("ECargoBase.cCiPriTyp", null)
				}
			}, 2000);
		}
    // idxParam.ciJiMrk = val;
    // const ciAgreementECargo = formPage.getComponentRefById('AgreementCiTcp');
    // if(ciAgreementECargo) {
    //   ciAgreementECargo.cCiMrkChangeFun({cCiMrk: val})
    // }
    // const cargoCiRef = formPage.getComponentRefById('AgreementCi');
    // if (!!cargoCiRef) {
    //   cargoCiRef.initCiInfo({
    //     cCiMrk: val
    //   });
    // }
  },
  getcDptCde:(val:any)=>{
    dzmodal
        .open(DepartmentTree, { type: "Issuer", data: {} ,isXY:true})
        .then((res:any) => {
          if (res.body) {
            const selectObj = res.body;
            if(!(selectObj.cSignDptMrk) ||  selectObj.cSignDptMrk === '' || selectObj.cSignDptMrk === null || selectObj.cSignDptMrk === undefined || selectObj.cSignDptMrk === '0'){
              return 	ElMessage.warning("所选机构不是出单机构");
            }
            baseEditRef.value?.setValue("ECargoBase.cDptCde", selectObj.id);
            baseEditRef.value?.setValue("ECargoBase.cIntroDptcde", selectObj.id);
            baseEditRef.value?.addCodeListMap({
              code:"ECargoBase.cIntroDptcde", list:[
                {
                  label: `${selectObj.id}${selectObj.name}`,
                  value: selectObj.id,
                },
              ],
            })
            baseEditRef.value?.setValue("ECargoBase.cDptCnm", selectObj.name);
            baseEditRef.value?.addCodeListMap({
              code:"ECargoBase.cDptCde", list:[
                {
                  label: `${selectObj.id}${selectObj.name}`,
                  value: selectObj.id,
                },
              ],
            })
          }
        });
  },
  //业务来源大类change事件
  businessKindFunc: (val:any) => {
    if (!formPage.init) {
      setValue("ECargoBase.cChaType", "");
      setValue("ECargoBase.cChaSubtype", "");
    }
    if (val) {
      getChaTypeList({ BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }).then(
        (res:any) => {
          if (null != res && null != res["code"]) {
            if (res["code"] === 200) {
              baseEditRef.value?.addCodeListMap({
                code: 'ECargoBase.cChaType',
                list: res.data
              });
            }
          }
        }
      );
      nextTick(() => {
        const cargoCiRef = formPage.getComponentRefById('AgreementCi');
        if (val === "19002" || val === "19003") {
          if (cargoCiRef) {
            const ciData = cargoCiRef.getFormValue();
            ciData.forEach((row: any) => {
              cargoCiRef.setValueByRowKey("ECargoCi.cSlsId", row._dataId, "");
              cargoCiRef.setValueByRowKey("ECargoCi.cSlsNme", row._dataId, "");
            });
          }
          //代理业务 | 经纪业务
          const obj = {
            rules: [getRules("required", {})],
            btnItems: {
              disabled: false,
            },
          };
          setFormItem("ECargoBase.cBrkrCde", {...obj,disabled:0}); //代理(经纪)人
          setFormItem("ECargoBase.cBrkSlsCde", obj); //代理业务员
          setFormItem("ECargoBase.cAgtAgrNo", { rules: [getRules("required", {})] }); //代理合作协议
          setFormItem("ECargoBase.cBrkrCde", { rules: [getRules("required", {})] }); //代理合作协议
          setFormItem("ECargoBase.cBrkSlsCde", { rules: [getRules("required", {})] }); //代理业务员
        } else {
          // 直销业务：清空代理业务员和代理经纪人
          if (cargoCiRef) {
            const ciData = cargoCiRef.getFormValue();
            ciData.forEach((row: any) => {
              cargoCiRef.setValueByRowKey("ECargoCi.cBrkrCde", row._dataId, "");
              cargoCiRef.setValueByRowKey("ECargoCi.cBrkSlsCde", row._dataId, "");
            });
          }
          const obj = {
            rules: [],
            disabled: true,
            btnItems: {
              disabled: true,
            },
          };
          setFormItem("ECargoBase.cBrkrCde", obj); //代理(经纪)人
          setFormItem("ECargoBase.cBrkSlsCde", obj); //代理业务员
          setFormItem("ECargoBase.cBrkrCde", { rules: null }); //代理合作协议
          setFormItem("ECargoBase.cBrkSlsCde", { rules: null }); //代理业务员
          setFormItem("ECargoBase.cAgtAgrNo", { rules: null }); //代理合作协议
          if (!formPage.init) {
            setValue("ECargoBase.cBrkrCde", "");
            setValue("ECargoBase.cBrkSlsCde", "");
            setValue("ECargoBase.cAgtAgrNo", "");
          }
          nextTick(() => {
            baseEditRef.value?.clearValidate("ECargoBase.cBrkSlsCde");
          });
        }
        if (!!cargoCiRef) {
          cargoCiRef.valideRequired();
        }
      });
    }
  },
    //业务来源中类
  businessFunc: (val) => {
    if (!formPage.init) {
      setValue("ECargoBase.cChaSubtype", "");
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
            disabled: true,
          },
        };
        if (!formPage.init) {
          // setFormItem("ECargoBase.cSlsId", obj); //业务员工号
        }
        // setFormItem("ECargoBase.cSlsId", { rules: null }); //业务员工号
        setValue("ECargoBase.cSlsId", "");
      } else {
        const obj = {
          rules: [getRules("required", {})],
          btnItems: {
            disabled: false,
          },
        };
        if (!formPage.init) {
          setFormItem("ECargoBase.cSlsId", obj); //业务员工号
        }
        setFormItem("ECargoBase.cSlsId", { rules: [getRules("required", {})] }); //业务员工号
      }

      getChaSubtypList(params).then((res) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            baseEditRef?.value?.addCodeListMap({
              code: 'ECargoBase.cChaSubtype',
              list: res.data
            })
            // const obj = {
            //   loadData: res.data,
            // };
            // setFormItem("ECargoBase.cChaSubtype", obj);
          }
        }
      });
    }
  },
  //业务来源子类
  businessSubFunc: (val) => {
    // 清除代理(经纪)人、代理业务员的值
    if (!initFlag.value) {
      setValue("ECargoBase.cBrkrCde", "");
      setValue("ECargoBase.cBrkSlsCde", "");
    }
  },
  //代理(经纪)人icon事件
  agentFunc: () => {
		if(!getValue("ECargoBase.cDptCde")){
			ElMessage.warning("请先选择机构部门");
			return
		}
    if (getValue("ECargoBase.cBsnsTyp") && getValue("ECargoBase.cBsnsTyp") !== "19001") {
      dialog.value?.open(
        "agentPre",
        {
          type: "show",
          data: {
            // CProdNo: sessionData.value?.cProdNo, //产品
						CDptCde: getValue("ECargoBase.cDptCde"), //机构
          	cDptCnm: getValue("ECargoBase.cDptCnm"),
            cBsnsTyp: getValue("ECargoBase.cBsnsTyp"), //业务来源大类
            cChaType: getValue("ECargoBase.cChaType"), //业务来源中类
            cChaSubtype: getValue("ECargoBase.cChaSubtype"), //业务来源子类
          },
          method: {
            getSelected: (params:any) => {
              setFormItem("ECargoBase.cBrkrCde", {
                loadData: [{ value: params.CChaCde, label:params.CChaCde + params.CChaNme }],
              });
              setValue("ECargoBase.cBrkrCde", params.CChaCde);
              setValue("ECargoBase.cAgtAgrNo", params.CAgtAgrNo);
              const ciRef = formPage.getComponentRefById('AgreementCi');
              if (!!ciRef) {
                ciRef.intiAgentBroker({
                  CChaCde: params.CChaCde, //代理经纪人代码
                  CChaNme: params.CChaNme, //代理经纪人名称
                  loadData:[{value:  params["CChaCde"],label:params["CChaCde"] + params['CChaNme']}],
                });
              }
              dialog.value?.handleClose();
            },
          },
        },
        {
          isOk: (selectdata: any) => {
          },
        },
        { title: "代理查询", width: 85 }
      );
    } else {
      ElMessage.warning("渠道分类--请选择非直销业务!");
    }
  },
  cBrkSlsCdeChange: (value: any) =>{
    const p = opertaor.getParam();
    if (p.initFlag) {
      if(value && value != '') {
        codeListStore.queryCodeList({
          codeListName: "WEB_ORG_SALES_BY_ID",
          codeListParam: {value: value}
        }).then((res) => {
          plyBaseEditRef.value?.addCodeListMap({
            code: "Base.cBrkSlsCde",
            list: res,
          });
        });
      }
    }
  },
    //代理业务员icon事件
  agentSaleFuncA: () => {
		if(!getValue("ECargoBase.cDptCde")){
			ElMessage.warning("请先选择机构部门");
			return
		}
    if (!getValue("ECargoBase.cBrkrCde")) {
      ElMessage.warning("请先选择代理(经济)人！");
      return;
    }
    let cslstyp = "";
    if (getValue("ECargoBase.cChaType") === "1900201") {
      // 个人代理时
      cslstyp = "020003";
    } else if (
      getValue("ECargoBase.cBsnsTyp") !== "19001" &&
      getValue("ECargoBase.cChaType") !== "1900201"
    ) {
      // 非直销且非个人代理
      cslstyp = "020004";
    };
    
    dialog.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {
          CDptCde: getValue("ECargoBase.cDptCde"),
          cDptCnm: getValue("ECargoBase.cDptCnm"),
          cBsnsTyp: getValue("ECargoBase.cBsnsTyp"),
          cChaType: getValue("ECargoBase.cChaType"),
          cChaSubtype: getValue("ECargoBase.cChaSubtype"),
          CSlsId: getValue("ECargoBase.CSlsId"), //业务员员工号
          CBrkrCde: getValue("ECargoBase.CBrkrCde"), //代理(经纪)人
          CDptAttr: getValue("ECargoBase.CDptAttr"), //投保单业务归属部门的部门类型(angular上被hidden的,逻辑赋值angular：guide.component.ts【324行】)
          // CSlsTyp: cslstyp,
          leading: "CBrkSlsCde",
        },
        method: {
          getSelected: (params:any) => {
            // setFormValue({
            //   // "ECargoBase.cBrkSlsCde": params.CSlsCde, //代理业务员
            //   "ECargoBase.cCertfNo": params.CCtfctNo, //代理业务执业证号
            //   "ECargoBase.cBrkrDptcde": params.CDptCde, //代理业务员机构代码
            // });

            setFormItem("ECargoBase.cBrkSlsCde", {
							loadData: [
								{
									value:  params["CSlsCde"],
									label:params["CSlsCde"] + params['CSlsNme'],
								},
							],
						});
            const ciRef = formPage.getComponentRefById('AgreementCi');
            if (!!ciRef) {
              ciRef.initProxySales({
                cSlsId: params.CSlsCde, //业务员员工号
                cSlsNme: params.CSlsNme, //业务员名称
                loadData:[{value:  params["CSlsCde"],label:params["CSlsCde"] + params['CSlsNme']}],
              });
            }
          	setValue("ECargoBase.cBrkSlsCde", params.CSlsCde);
            dialog.value?.handleClose();
          },
        },
      },
			{
				isOk: (selectdata: any) => {
					console.log("a", selectdata);
				},
			},
      { title: "业务员", width: 85 },
    );
  },
  // 业务员工号ICON事件
  saleNoFunc: () => {
		if(!getValue("ECargoBase.cDptCde")){
			ElMessage.warning("请先选择机构部门");
			return
		}
    let cslstyp = "";
    if (getValue("ECargoBase.cChaType") === "1900201") {
      // 个人代理时
      cslstyp = "020003";
    } else if (
      getValue("ECargoBase.cBsnsTyp") !== "19001" &&
      getValue("ECargoBase.cChaType") !== "1900201"
    ) {
      // 非直销且非个人代理
      cslstyp = "020004";
    }
    dialog.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {
          CDptCde: getValue("ECargoBase.cDptCde"),
          cDptCnm: getValue("ECargoBase.cDptCnm"),
          cBsnsTyp: getValue("ECargoBase.cBsnsTyp"),
          cChaType: getValue("ECargoBase.cChaType"),
          cChaSubtype: getValue("ECargoBase.cChaSubtype"),
          CSlsId: getValue("ECargoBase.CSlsId"), //业务员员工号
          CBrkrCde: getValue("ECargoBase.CBrkrCde"), //代理(经纪)人
          CDptAttr: getValue("ECargoBase.CDptAttr"), //投保单业务归属部门的部门类型(angular上被hidden的,逻辑赋值angular：guide.component.ts【324行】)
          CSlsTyp: cslstyp,
          leading: "CSlsId",
        },
        method: {
          getSelected: (params:any) => {
            setFormValue({
              "ECargoBase.cSlsId": params.CSlsCde, //业务员员工号
              "ECargoBase.cSlsNme": params.CSlsNme, //业务员名称
              "ECargoBase.cSlsCde": params.CCtfctNo, //业务员执业证号
              "ECargoBase.cSlsTel": params.CMobile, //业务员电话
              "ECargoBase.cSlsDptcde": params.CDptCde, //业务员机构代码
              "ECargoBase.cIntroDptcde": "", //清空服务机构值
            });
            const ops = {
              code: "orgDpt",
              val: params["CDptCde"],
            };
            getNmeByCde(ops).then((res:any) => {
              if (res && res.code == 200) {
                const codeValData = res.data;
                if (codeValData) {
                  setFormItem("ECargoBase.cIntroDptcde", {
                    loadData: [
                      {
                        value: params["CDptCde"],
                        label: codeValData["data"],
                      },
                    ],
                  });
                  setValue("ECargoBase.cIntroDptcde", params.CDptCde);
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
              .then((res:any) => {
                if (res && res.code == 200) {
                  const codeValData = res;
                  if (codeValData) {
                    setFormItem("ECargoBase.cIntroSalecde", {
                      loadData: codeValData,
                    });
										const ciRef = formPage.getComponentRefById('AgreementCi');
                    if (!!ciRef) {
                      ciRef.initcbusiner({
                        cSlsId: params.CSlsCde, //业务员员工号
                        cSlsNme: params.CSlsNme, //业务员名称
                        loadData:codeValData,
                      });
                    }
                    // 当选择了业务员时，服务机构业务员默认为业务员
                    setValue("ECargoBase.cIntroSalecde", params.CSlsCde);
                  }
                }
              });
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "业务员", width: 85 }
    );
  },
  //项目类别大类change事件
  cPrjCtgTypChange: (val:any) => {
    if (!initFlag.value) {
      setValue("ECargoBase.cPrjCtgMidTyp", "");
      setValue("ECargoBase.cPrjCtgSubTyp", "");
    }
    if (val) {
      // Base.cPrjCtgMidTyp
      // setFormItem("ECargoBase.cPrjCtgMidTyp", { rules: null, disabled: true });
      codeListStore
        .queryCodeList({
          codeListName: "CPrjCtgTyp_List",
          codeListParam: {
            CRangeCde: subDptCde.value,
            CParCde: val,
            cLev: "2",
          },
        })
        .then((res) => {
          if (res) {
            baseEditRef?.value?.addCodeListMap({
              code: 'ECargoBase.cPrjCtgMidTyp',
              list: res
            })
            // setFormItem("ECargoBase.cPrjCtgMidTyp", {
            //   loadData: res,
            //   rules: [getRules("required", {})],
            // });
          }
        });
    }
  },
  //项目类别中类change事件
  cPrjCtgMidTypChange: (val:any) => {
    if (!initFlag.value) {
      setValue("ECargoBase.cPrjCtgSubTyp", "");
    }
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "CPrjCtgTyp_List",
          codeListParam: {
            CRangeCde: subDptCde.value,
            CParCde: val,
            cLev: "3",
          },
        })
        .then((res) => {
          if (res) {
            baseEditRef?.value?.addCodeListMap({
              code: 'ECargoBase.cPrjCtgSubTyp',
              list: res
            })
            // setFormItem("ECargoBase.cPrjCtgSubTyp", { loadData: res });
          }
        });
    }
  },
};


function getCheckCdeptByCdptCde() {
  // const CDptCde = getValue("Base.cDptCde");
  const CDptCde = JSON.parse(sessionStorage.getItem("user")).companyId;
  if (CDptCde) {
    // 查询承保机构所属分公司
    checkCdeptByCdptCde({ dptCde: CDptCde }).then(
      (res:any) => {
        if (res["code"] === 200) {
          if (res.data) {
            subDptCde.value = res.data;
            //查询项目类别大类数据
            codeListStore
              .queryCodeList(
                {
                  codeListName: "CPrjCtgTyp_List",
                  codeListParam: {
                    CRangeCde: subDptCde.value,
                    // CParCde: "",
                    cLev: "1",
                  },
                },
                false,
                false
              )
              .then((res) => {
                if (res) {
                  baseEditRef.value?.addCodeListMap({
                    code: "ECargoBase.cPrjCtgTyp",
                    list: res,
                  })
                  // setFormItem("Base.cPrjCtgTyp", { loadData: res });
                }
              })
              .catch((err) => {
                  baseEditRef.value?.addCodeListMap({
                    code: "ECargoBase.cPrjCtgTyp",
                    list: [],
                  })
                // setFormItem("ECargoBase.cPrjCtgTyp", { loadData: [] });
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


function getFormValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

function getFormConfig(){
  return formconfig1;
}

function getFormBtn() {
  return baseEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  baseEditRef?.value?.setDisabledAll(isDisabled);
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {formBtn[key].hidden = isDisabled;})
  }
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
//         } else {
//           Object.assign(item, obj);
//         }
//       }
//     });
//   }
// }
function recursiveSetFormItem(items: FormItem[], targetKey: string, obj: Record<string, any>) {
  items.forEach((item) => {
    // 1. 如果当前项是分组（含groupList），先递归处理子项
    if (item.inputtype === 'rtinputgroup' && item.groupList && Array.isArray(item.groupList)) {
      recursiveSetFormItem(item.groupList, targetKey, obj);
    }

    // 2. 匹配到目标prop，执行赋值
    if (item.prop === targetKey) {
      if (item.btnItems && obj.btnItems) {
        Object.entries(obj.btnItems).forEach(([btnKey, value]) => {
          if (item.btnItems!.hasOwnProperty(btnKey)) {
            item.btnItems![btnKey] = value;
          }
        });
      }

      // 处理其他属性（包括rules必填规则）
      const { btnItems: _, ...otherProps } = obj;
      Object.assign(item, otherProps);
      if (otherProps.rules) {
        item.rules = otherProps.rules;
      }
    }
  });
}


function setFormItem(key: string, obj: Record<string, any>): void {
  if (!key || !obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return;
  }

  if (!formconfig1.fromSchema || !Array.isArray(formconfig1.fromSchema)) {
    return;
  }

  // 调用递归方法处理所有项（包括嵌套的groupList）
  recursiveSetFormItem(formconfig1.fromSchema, key, obj);
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  baseEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormBtn,
  getFormConfig,
  setDisabledAll,
  addProvide
});
</script>

<style scoped></style>
