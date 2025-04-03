<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="plyBaseEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {
  getBsnsTypList,
  getChaTypeList,
  getChaSubtypList,
} from "@/api/code-list-service";
import { checkCdeptByCdptCde, getNmeByCde } from "@/api/prod/index";
import moment from "moment";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useValidator } from "@/typings/useValidator";
import DepartmentTree from "../commodityRef/DepartmentTree.vue";
import { codeListViewStore } from "@/store";
import { useRoute } from "vue-router";
import { get } from "lodash";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const codeListStore = codeListViewStore();
const { getRules } = useValidator();
const dzmodal = useDzModal();
const dialogRef = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();

const sessionData = ref(null);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const plyBaseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const user = JSON.parse(sessionStorage.getItem("user"));
console.log("user", user);
const subDptCde = ref(); //所属分公司

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    setForSelectFilterable(); //给下拉框设置可搜索
    // 录单日期、签单日期默认值
    setValue("Base.tOprTm", moment(new Date()).format("YYYY-MM-DD"));
    setValue("Base.tIssueTm", moment(new Date()).format("YYYY-MM-DD"));
    // 是否见费出单 默认值
    setValue("Base.cNeedfeeFlag", "1");
    //是否可疑交易，默认否
    setValue("Base.cSusBusiness", "0");
    //录单人 默认系统操作员
    setValue("Base.cOprCde", user.userName);
    //录单人联系方式  默认操作员的
    setValue("Base.cCiOprRel", user.phoneNO);
    // 查询承保机构所属分公司和项目类别大类数据
    getCheckCdeptByCdptCde();
    //回显机构部门数据
    setFormItem("Base.cDptCde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` },
      ],
    });
    console.log(param, "param.cDptCde");
    setValue("Base.cDptCde", param.cDptCde);
    // 服务机构默认值
    setFormItem("Base.cIntroDptcde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` },
      ],
    });
    setValue("Base.cIntroDptcde", param.cDptCde);
  });

  if (sessionStorage.getItem("toMyPageData")) {
    const data = JSON.parse(sessionStorage.getItem("toMyPageData"));
    if (data.pageType && data.pageType === "app") {
      //新保时，续保单号隐藏
      setFormItem("Base.cOrigPlyNo", { hidden: true });
    }
    console.log(param.cDptCde, "机构部门");
    // nextTick(() => {
    //   setFormValue(data);
    // });

    console.log(getValue("Base.cIntroDptcde"), "000000000");
    sessionData.value = data;
    //业务来源大类下拉数据
    const params = {
      CDptCde: data["cDptCde"],
      CKindNo: data["cKindNo"],
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
  }
});

// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },
  //业务来源大类
  businessKindFunc: (val) => {
    setValue("Base.cChaType", "");
    setValue("Base.cChaSubtype", "");
    if (val) {
      getChaTypeList({ BsnsTyp: val }).then((res) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            const obj = {
              loadData: res.data,
            };
            setFormItem("Base.cChaType", obj);
          }
        }
      });
      nextTick(() => {
        if (val === "19002" || val === "19003") {
          //代理业务 | 经纪业务
          const obj = {
            rules: [getRules("required", {})],
            btnItems: {
              disabled: false,
            },
          };
          setFormItem("Base.cBrkrCde", obj); //代理(经纪)人
          setFormItem("Base.cBrkSlsCde", obj); //代理业务员
          setFormItem("Base.cAgtAgrNo", { rules: [getRules("required", {})] }); //代理合作协议
        } else {
          const obj = {
            rules: null,
            btnItems: {
              disabled: true,
            },
          };
          setFormItem("Base.cBrkrCde", obj); //代理(经纪)人
          setFormItem("Base.cBrkSlsCde", obj); //代理业务员
          setFormItem("Base.cAgtAgrNo", { rules: null }); //代理合作协议
          setValue("Base.cBrkrCde", "");
          setValue("Base.cBrkSlsCde", "");
          setValue("Base.cAgtAgrNo", "");
        }
      });
    }
  },
  //业务来源中类
  businessFunc: (val) => {
    setValue("Base.cChaSubtype", "");
    if (val) {
      const params = {
        CChaType: val,
        flag: 1,
      };
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
      nextTick(() => {
        if (val === "1900201") {
          //个人代理
          const obj = {
            rules: null,
            btnItems: {
              disabled: true,
            },
          };
          setFormItem("Base.cSlsId", obj); //业务员工号
          setValue("Base.cSlsId", "");
        } else {
          const obj = {
            rules: [getRules("required", {})],
            btnItems: {
              disabled: false,
            },
          };
          setFormItem("Base.cSlsId", obj); //业务员工号
        }
      });
    }
  },
  //业务来源子类
  businessSubFunc: (val) => {
    // 清除代理(经纪)人、代理业务员的值
    setValue("Base.cBrkrCde", "");
    setValue("Base.cBrkSlsCde", "");
  },
  //代理(经纪)人change事件
  agentChange: () => {
    // 清除代代理业务员的值
    setValue("Base.cBrkSlsCde", "");
  },
  //代理(经纪)人icon事件
  agentFunc: () => {
    if (getValue("Base.cBsnsTyp") && getValue("Base.cBsnsTyp") !== "19001") {
      dialogRef.value?.open(
        "agentPre",
        {
          type: "show",
          data: {
            CDptCde: sessionData.value?.cDptCde, //机构
            CProdNo: sessionData.value?.cProdNo, //产品
            cBsnsTyp: getValue("Base.cBsnsTyp"), //业务来源大类
            cChaType: getValue("Base.cChaType"), //业务来源中类
            cChaSubtype: getValue("Base.cChaSubtype"), //业务来源子类
          },
          method: {
            getSelected: (params) => {
              console.error("22222222222", params);
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
  //代理业务员icon事件
  agentSaleFunc: () => {
    // if(!getValue('Base.cBrkrCde')) {
    //   ElMessage.warning('请先选择代理(经济)人！');
    //   return
    // }
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
          CDptCde: sessionData.value?.cDptCde,
          cBsnsTyp: getValue("Base.cBsnsTyp"),
          cChaType: getValue("Base.cChaType"),
          cChaSubtype: getValue("Base.cChaSubtype"),
          CSlsId: getValue("Base.CSlsId"), //业务员员工号
          CBrkrCde: getValue("Base.CBrkrCde"), //代理(经纪)人
          CDptAttr: getValue("Base.CDptAttr"), //投保单业务归属部门的部门类型(angular上被hidden的,逻辑赋值angular：guide.component.ts【324行】)
          CSlsTyp: cslstyp,
          leading: "CBrkSlsCde",
        },
        method: {
          getSelected: (params) => {
            setFormValue({
              "Base.cBrkSlsCde": params.CSlsCde, //代理业务员
              "Base.cCertfNo": params.CCtfctNo, //代理业务执业证号
              "Base.cBrkrDptcde": params.CDptCde, //代理业务员机构代码
            });
            dialogRef.value?.handleClose();
          },
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
          CDptCde: sessionData.value?.cDptCde,
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
                if (res && res.code == 200) {
                  const codeValData = res.data;
                  if (codeValData) {
                    setFormItem("Base.cIntroSalecde", {
                      loadData: codeValData,
                    });
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
          console.log("a", selectdata);
        },
      },
      { title: "业务员", width: 85 }
    );
  },
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
                label: selectObj.name,
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
    dialogRef.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {
          CDptCde: getValue("Base.CIntroDptcde"), //服务机构
        },
        method: {
          getSelected: (params) => {
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
                if (res && res.code == 200) {
                  const codeValData = res.data;
                  if (codeValData) {
                    // 服务机构业务员下拉和显示的值
                    setFormItem("Base.cIntroSalecde", {
                      loadData: codeValData,
                    });
                    setValue("Base.cIntroSalecde", params.CSlsCde);
                  }
                }
              });
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
  //特殊不见费出单change事件
  specSalesFunc: (val) => {
    // 修改不见费出单原因校验
    if (val == 1) {
      setFormItem("Base.cCanclfeersnCde", {
        rules: [getRules("required", {})],
        disabled: false,
      });
    } else {
      setFormItem("Base.cCanclfeersnCde", { rules: null, disabled: true });
      setValue("Base.cCanclfeersnCde", "");
    }
  },
  //项目类别大类change事件
  cPrjCtgTypChange: (val) => {
    setValue("Base.cPrjCtgMidTyp", "");
    setValue("Base.cPrjCtgSubTyp", "");
    if (val) {
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
            setFormItem("Base.cPrjCtgMidTyp", { loadData: res });
          }
        });
    }
  },
  //项目类别中类change事件
  cPrjCtgMidTypChange: (val) => {
    setValue("Base.cPrjCtgSubTyp", "");
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
            setFormItem("Base.cPrjCtgSubTyp", { loadData: res });
          }
        });
    }
  },
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
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          let newBtnItems = null;
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
          newBtnItems = item.btnItems;
          newBtnItems && (obj.btnItems = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
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
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped></style>
