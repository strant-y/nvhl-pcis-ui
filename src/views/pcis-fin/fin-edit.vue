<template>
  <el-dialog v-model="dialogVisible" width="90%" title="账户信息修改">
    <div>
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
        @page-change="handleQuery(false)" />
      <!-- <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button :item="{
          type: 'primary',
          label: '保存',
          func: () => {
            save();
          },
        }" />
      </div> -->
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
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
import { FinService } from './service/fin.service';
import { useUserStore } from "@/store/modules/user";
import { cloneDeep } from "lodash-es";
import { getAppPolicy } from "../../api/query/index";
const userStore = useUserStore();
const user = ref(userStore.user);
const finService = new FinService();
const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);
let para = []; //银行大类 list

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
// 绑定方法
const method = {
  func1: () => {
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '账户信息修改',
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "读取银行卡",
        position: 'btn-left',
        func: async () => {
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "提交审核",
        func: async () => {
          saveSubmit('commit');
        },
      })
    ],
    fromSchema: [
      {
        prop: "cAcctNme",
        inputtype: "rtinput",
        // typeCode: "",
        title: "收款人姓名",
        rules: [getRules("required", {})],
      },
      {
        prop: 'cAcctNo',
        title: '收款人账号',
        inputtype: "rtinput",
        rules: [getRules("required", {})],
      },
      {
        prop: "cBankRelTyp",
        inputtype: "rtselect",
        typeCode: 'CBankRelTypList',
        clearable: true,
        title: "收款银行大类",
        rules: [getRules("required", {})],
        func: (val: any) => {
          if (!!val) {
            setValue('cBankCde','');
            setValue('cBankPro','');
            let bankRelTyp = val;
            const para = bankRelTyp.split('_');
            const directcode = para[0]; // 直连编号
            const bankname = para[1];  // 银行名称
            const isdefault = para[2]; // 是否默认值
            const banktype = para[3];  // 银行大类
            if (isdefault === '0') {    // 非直连银行
              bankRelTyp = banktype;
            }
            changeBank()
          }
        },
      },
      {
        prop: "cBankPro",
        inputtype: "rtselect",
        title: "开户行省",
        typeCode: "CBankProList",
        // disabled: true,
        func: (val: any) => {
          setValue('cBankArea', '');
          setFormItem("cBankArea", {
            typeCode: 'CBankAreaList',
            codeParam: { 'areaprovince': val },
          });
        }
      },
      {
        prop: "cBankArea",
        inputtype: "rtselect",
        typeCode: 'CBankAreaList',
        title: "开户行市",
        // disabled: true,
        func: (val: any) => {
          if (val) {
            setValue('cBankCounty', '');
            setFormItem("cBankCounty", {
              typeCode: 'CBankCountyList',
              codeParam: val ? { 'areaprovince': getValue('cBankPro'), 'areaname': val } : { 'areaprovince': '', 'areaname': '' },
            });
          }

        }
      },
      {
        prop: "cBankCounty",
        inputtype: "rtselect",
        // typeCode: 'CBankCountyList',
        title: "开户行县",
        // disabled: true,
        func: (val: any) => {
          if (val) {
            setValue('cBankCde', '');
            let bankRelTyp = getValue('cBankRelTyp');
            if (!!bankRelTyp) {
              const para = bankRelTyp.split('_');
              const directcode = para[0]; // 直连编号
              const bankname = para[1];  // 银行名称
              const isdefault = para[2]; // 是否默认值
              const banktype = para[3];  // 银行大类
              if (isdefault === '0') {    // 非直连银行
                bankRelTyp = banktype;
              }
              const cParCde = {'banktypecod': bankRelTyp, 'areacode': val};
              if (!!val) {
                codeListStore.queryCodeList({
                  codeListName: "CBankCdeList",
                  codeListParam: { 'banktypecod': bankRelTyp, 'areacode': val },
                }).then((res:any) => {
                  if(res.length > 0 ){
                    setFormItem('cBankCde', { loadData: res });
                  }
                }).catch((err:any) => {
                  ElMessage.error(err.message)
                });
              }
            }
          }
        }
      },
      {
        prop: "cBankCde",
        inputtype: "rtselect",
        // disabled: true,
        title: "开户银行",
        func: (val:any)=>{
          if ( val !== null && val !== '' && val !== 'undefined') {
            const arrayCBankCde = val.split('_');
            const codeCBankCde = arrayCBankCde[0];
            const nameCBankCde = arrayCBankCde[1];
            setValue('cBankAddr',nameCBankCde);
            setValue('cBankCnaps',codeCBankCde);
          }else {
            const bankRelTyp = getValue('cBankRelTyp');
            if ( bankRelTyp !== null  && bankRelTyp !== '' && bankRelTyp !== 'undefined') {
              const para = bankRelTyp.split('_');
              const directcode = para[0]; // 直连编号
              const bankname = para[1];  // 银行名称
              const isdefault = para[2]; // 是否默认值
              const banktype = para[3];  // 银行大类
              if (isdefault === '0') {    // 非直连银行
                setValue('cBankAddr','');
                setValue('cBankCnaps','');
              }
            }
          }
        }
      },
   
      {
        prop: "cBankCnaps",
        inputtype: "rtnumber",

             disabled: true,
        title: "CNAPS号",
      },
      {
        prop: "cBankAddr",
        inputtype: "rtinput",
        rules: [getRules("required", {})],
           disabled: true,
        title: "开户行地址",
      },
      {
        prop: 'cPubPri',
        title: '对公对私',
        rules: [getRules("required", {})],
        inputtype: "rtselect",
        loadData: [
          { label: "对公", value: "1" },
          { label: "对私", value: "2" },
        ],
      }
    ]
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
    title: "审核修改记录",
    isPage: false,
    fromSchema: [
      {
        prop: "cCustSeq",
        inputtype: "rtinput",
        title: "业务唯一流水号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "cAcctNme",
        inputtype: "rtinput",
        title: "账户名",
      },
      {
        prop: "cAcctNo",
        inputtype: "rtinput",
        title: "账户",
      },
      {
        prop: "cCrtCde",
        inputtype: "rtinput",
        title: "提交人",
      },
      {
        prop: "tCrtTm",
        inputtype: "rtinput",
        title: "提交时间",
      },
      {
        prop: "tOprTyp",
				inputtype: "rtselect",
				title: "操作类型",
				loadData:[
					{label: '未申请修改',value: "0"},
					{label: "提交",value :"1"},
					{label: '已通过',value: "2"},
					{label: '已退回', value: '3'}
				]
      },
      {
        prop: "cCheckOpn",
        inputtype: "rtinput",
        title: "审批意见",
      }
    ],
  })
);
onMounted(async () => {
	if (props.type === "update" && props.data) {
		// getPlyPolicyFun(props.data)
    nextTick(() => {
      freeEditRef.value?.setFormValue(props.data);

      setValue('cAcctNme',props.data.cCustomerNameCn)
      setValue('cAcctNo',props.data.cCustAccountNo)
      setValue('cBankRelTyp',props.data.cBankType)
      setValue('cBankPro',props.data.cBankProvince)

      setValue('cBankArea',props.data.cBankCity)
      setValue('cBankCounty',props.data.cBankCounty)
      setValue('cBankCde',props.data.cBankName)
      setValue('cBankCnaps',props.data.cBankCnaps)
      setValue('cBankAddr',props.data.cBankAddr)
      setValue('cPubPri',props.data.cIspayPublic)

      handleQuery(true);
    });
  }
});
/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  //const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign({}, r, {
    currentUser: user.value['opCde'],
    currentUserOrg: user.value['companyId'],
    cId: props.data['cId'],
    cCustSeq: props.data['cCustSeq'],
  });
  finService.getEditFinReback(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}


/** 提交审核 */
function saveSubmit(obj) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
      const prm = obj + '|' + props.data['cCustSeq'];
      if (obj === 'commit') {
        const saveFormData = Object.assign(s,{ cStatus: '1' });
        const returnData = finService.saveFinReback({ param: prm, banckTraVOList: [saveFormData] });
        returnData.then((res: any) => {
          if (null != res && null != res['code']) {
            if (res['code'] === 200) {
              
              emits("ok", {});
              ElMessage.success(res['msg']);
              dialogVisible.value = false;
            } else {
              ElMessage.warning(res['msg']);
            }
          }
        }, error => {
          ElMessage.error('后台服务异常,请联系管理员');
        });
      }
    } else {
      ElMessage.error("请填写必填项");
    }
  })
}
/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  // if (showBtnConfig.value) {
  //   s["showExBtn"] = "1";
  // } else {
  //   s["showExBtn"] = "0";
  // }
  if (s) {
    const param = Object.assign(s);
    // if (props.type === "edit") {
    //   param["cPkId"] = props.data.cPkId;
    // }
    // if (freeEditRefBtn.value) {
    //   let btnjson = freeEditRefBtn.value?.getFromValue();
    //   btnjson.initid = uuidv4().replace(/-/g, "");
    //   param["btn"] = btnjson;
    // }
    // if (tableRef.value) {
    //   const tabjson = tableRef.value?.getFromValue();
    //   let selectList = tabjson.filter((item: any) => item.isChecked === "1");
    //   param["tabjson"] = selectList;
    // }
    return param;
  }
}

function changeBank() {
  const CBankRelTyp = getValue('cBankRelTyp');	// 银行大类
  const CBankPro = getValue('cBankPro');	// 开户行省
  const CBankArea = getValue('cBankArea');	// 开户行省
  const CBankCounty = getValue('cBankCounty');	// 银行县
  const CBankCde = getValue('cBankCde');	// 开户行
  const CBankAddr = getValue('cBankAddr');	// 开户地址
  const CBankCnaps = getValue('cBankCnaps');	// 直连编号
  if (CBankRelTyp === '') {
    return;
  }
  setValue('cBankCnaps','');
  const para = CBankRelTyp.split('_');
  const bankname = para[1];  	// 银行名称
  const isdefault = para[2]; 	// 是否默认值
  const banktype = para[3];  	// 银行大类
  // console.log('changeBank', para[1], para[2], para[3]);
  if (isdefault === '1') {     // 直连银行
    setFormItem('cBankPro',{rules: [getRules("required", {})]})
    setFormItem('cBankArea',{rules: [getRules("required", {})]})
    setFormItem('cBankCounty',{rules: [], disabled: true})
    setFormItem('cBankCde',{rules: [], disabled: true})

    setValue('cBankCounty', null)
    setValue('cBankCde', null)
    setValue('cBankAddr', bankname)

    setFormItem('cBankCnaps',{disabled: true})

  }else if ( isdefault === '0') {// 非直连银行
    setFormItem('cBankCounty',{rules: [getRules("required", {})]})
    setFormItem('cBankCde',{rules: [getRules("required", {})]})  
    setValue('cBankAddr', null)

    if ( CBankCde !== null && CBankCde !== '' && CBankCde !== 'undefined') {
      const arrayCBankCde = CBankCde.split('_');
      const codeCBankCde = arrayCBankCde[0];
      const nameCBankCde = arrayCBankCde[1];
      setValue('cBankAddr', nameCBankCde);
      setValue('cBankCnaps', codeCBankCde);
    }
    setFormItem('cBankCounty',{disabled: false})
    setFormItem('cBankCde',{disabled: false})
    setFormItem('cBankCnaps',{disabled: true})
  }

  codeListStore.queryCodeList({
    codeListName: "CBankCdeList",
    codeListParam: { 'banktypecod': para[3], 'areacode': CBankRelTyp },
  }).then((res:any) => {
    if(res.length > 0 ){
      setFormItem('cBankCde', { loadData: res });
    }
  }).catch((err:any) => {
    ElMessage.error(err.message)
  });
}

// 判断当前单能否满足反洗钱条件，不能修改账户人名称
function getPlyPolicyFun(data) {
	const param = {
		scene: "EDR_APP_NEW_SCENE",
		CPlyNo: data.cPlyNo,
	};
	getAppPolicy(param).then((res: any) => {
		console.log("投保单明细", res);
		if (res["code"] == "200") {
			let plyBaseData = res["res"]["composition"]["plyBase"][0]
			const cPrmCur = plyBaseData['Base.cPrmCur']; // 保费币种
			const nPrmRmbExch = plyBaseData['Base.nPrmRmbExch']; // 总保费汇率
			const nPrmVar = plyBaseData['Base.nPrmVar']; // 退费金额，退费时为负数

			// 如果不是退费（>=0），不触发
			if (nPrmVar >= 0) {
				return false;
			}

			// 取退费的绝对值（正数）
			const refundAmount = Math.abs(nPrmVar);

			// 人民币：退费 >= 10,000
			if (cPrmCur === 'CNY' && refundAmount >= 10000) {
				setFormItem('cAcctNme', { disabled: true })
				return true
			}

			// 美元：退费 >= 1,000
			if (cPrmCur === 'USD' && refundAmount >= 1000) {
				setFormItem('cAcctNme', { disabled: true })
				return true
			}

			// 其他外币：需折算为人民币
			if (cPrmCur !== 'CNY' && cPrmCur !== 'USD') {
				if (nPrmRmbExch != null) {
					const refundInCNY = refundAmount * nPrmRmbExch;
					if (refundInCNY >= 10000) {
						setFormItem('cAcctNme', { disabled: true })
						return true
					}
				}
			}
		}
	});
};

//给表单下拉项赋值
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
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
