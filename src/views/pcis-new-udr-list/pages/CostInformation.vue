<!-- 核保任务查询 费用信息 -->
<template>
  <el-dialog v-model="dialogVisible" width="50%" title="费用信息">
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
    />
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
        :tableConfig="tableconfig1"
        v-model:pageresult="pageresult1"
        ref="tableRef1"
    >
      <template #column-cChgVal="{ row, column, index }">
        <div style="display: flex; align-items: center;">
          <span>{{ row.cChgVal }}</span>
          <el-icon v-if="row.cChgVal && parseFloat(row.cChgVal) > 0" style="margin-left: 5px; color: #ef4747;">
            <Top />
          </el-icon>
          <el-icon v-else-if="row.cChgVal && parseFloat(row.cChgVal) < 0" style="margin-left: 5px; color: #00b19d;">
            <Bottom />
          </el-icon>
        </div>
      </template>
    </app-table>
		<app-table
        :tableConfig="tableconfig2"
        v-model:pageresult="pageresult2"
        ref="tableRef2"
    >
      <template #column-cChgVal="{ row, column, index }">
        <div style="display: flex; align-items: center;">
          <span>{{ row.cChgVal }}</span>
          <el-icon v-if="row.cChgVal && parseFloat(row.cChgVal) > 0" style="margin-left: 5px; color: #ef4747;">
            <Top />
          </el-icon>
          <el-icon v-else-if="row.cChgVal && parseFloat(row.cChgVal) < 0" style="margin-left: 5px; color: #00b19d;">
            <Bottom />
          </el-icon>
        </div>
      </template>
    </app-table>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '比较',
          func: () => {
            compareAppFee('0');
          },
        }"
      />
      <rt-button
        :item="{
          type: 'primary',
          label: '保存',
          func: () => {
            saveFeeInfo();
          },
        }"
      />
      <rt-button
        :item="{
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  getAppFeeInfoNewUrl,
  getAppFeeBetwNew,
  getIlogC1,
  getAppFee,
  saveAppFeeInfo_new,
  updateIIogFee,
  gettypflag,
  compareAppFeeInfo,
  getDpt,
	getCompareAppFeeInfo,
} from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { useFormLabelWidth } from "element-plus/es/components/form/src/utils";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { number } from "echarts";

const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);
const isDisabled = ref(true); //判断表单是否可编辑
const dialogVisible = ref(true);
const props = defineProps({
  data: Object,
  type: String,
  idxParam: Object
});
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
opertaor.init();
const userInfo = JSON.parse(sessionStorage.getItem("user") || '{}');
const DPT = userInfo.companyId?.substring(0,6);
const dptTyp = ref("0"); // 0其他  1总共 2二级机构
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "投保单费用信息",
    endBtnsPosition: "right",
    fromUi: {
      cols: 2,
    },
    fromSchema: [
      {
        prop: "ilog_c1",
        inputtype: "rtnumber",
        title: "ilog手续费比例",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled:true,
      },
      {},
      {
        prop: "max_value",
        inputtype: "rtnumber",
        title: "销售手续费比例上限",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled:true,
      },
      {
        prop: "min_value",
        inputtype: "rtnumber",
        title: "销售手续费比例下限",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled:true,
      },
      {
        prop: "nFeePropSum",
        inputtype: "rtinput",
        title: "比例合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled:true,
      },
      {
        prop: "nPrmSum",
        inputtype: "rtinput",
        title: "金额合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled:true,
      },
      {
        prop: "A1_value",
        inputtype: "rtnumber",
        title: "总公司下发二级机构费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        precision: 2,
        // func: (v: any) => {
        //   if (Number(v) > Number(A_value.value)) {
        //     ElMessage.error('此费用比例不可大于总公司下发二级机构的费用政策比例' + A_value.value + '重新输入!');
        //     freeEditRef.value?.setValue("A1_value", A1_value.value);
        //    }
        // }
        func: (v:any) => {
          changeUpdValue('A1_value')
        }
      },
      {
        prop: "B1_value",
        inputtype: "rtnumber",
        title: "二级机构下发三级机构的费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        precision: 2,
        // func: (v: any) => {
        //   if (Number(v) > Number(B_value.value)) {
        //     ElMessage.error('此费用比例不可大于二级机构下发三级机构的费用政策比例' + B_value.value + '重新输入!');
        //     freeEditRef.value?.setValue("B1_value", B1_value.value);
        //    }
        // }
        func: (v:any) => {
          changeUpdValue('B1_value')
        }
      },
      {
        prop: "A6_value",
        inputtype: "rtnumber",
        title: "事故预防费用(A6)",
        itemWidth: 1,
        clearable: true,
				precision: 2,
				func: (v:any) => {
					if(!/^(\-|\+)?(\d+.?)\d{0,2}$/.test(v)){
						ElMessage.error('只能输入数字，小数点后只能保留两位');
						freeEditRef.value?.setValue('A6_value', A6_value.value)
						return ;
					}
					
					if(parseFloat(v)<parseFloat(0)){
						ElMessage.error("事故预防费用(A6)不能小于零！");
						freeEditRef.value?.setValue('A6_value', A6_value.value)
						return ;
					}
        }
      }
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

//更改比较表格数据参数
const pageresult1 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

//上次更改比较表格数据参数
const pageresult2 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "费用信息",
    editFlag: true,
    isPage: false,
    editList: ["nUpdFeeProp","nUpdFee","cFeeFlag"],
    fromSchema: [
      {
        prop: "cTypCde",
        inputtype: "rtinput",
        title: "费用类型",
        minWidth: 40,
        formatter: (val:any, row:any) => {
          return `${row.cTypCde}(${row.cFeetypCde})`
        },
      },
      {
        prop: "nUpdFeeProp",
        inputtype: "rtnumber",
				title: "比例(%)",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        clearable: true,
        minWidth: 80,
        func: (v: any,row:any) => {
          getNFeeList(row)
          //onFeePropKeyDown(row)
        },
      },
      {
        prop: "nUpdFee",
        inputtype: "rtinput",
        title: "金额",
        minWidth: 80,
        disabled:true,
      },
      {
        prop: "cFeeFlag",
        inputtype: "rtselect",
        title: "ILOG系统费用计算提示信息",
        clearable: true,
        minWidth: 100,
        disabled:true,
        loadData:  [{ value: 0, label: '成功' }, { value: 1, label: '无规则匹配' }, { value: 9, label: '规则引擎异常' }]
      },
    ],
  })
);

//更改比较表格项
const tableconfig1 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "更改比较",
    editFlag: true,
    isPage: false,
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "序号",
        minWidth: 30,
      },
      {
        prop: "cFldNme",
        inputtype: "rtinput",
        title: "批改对象",
        minWidth: 140,
      },
      {
        prop: "cRelTableNme",
        inputtype: "rtinput",
        title: "批改项目",
        // minWidth: 100,
      },
      {
        prop: "cRelFldNme",
        inputtype: "rtinput",
        title: "类型",
        minWidth: 100,
      },
      {
        prop: "cOldVal",
        inputtype: "rtinput",
        title: "原值",
        clearable: true,
        minWidth: 100,
      },
      {
        prop: "cNewVal",
        inputtype: "rtinput",
        title: "新值",
        clearable: true,
        minWidth: 100,
      },
      {
        prop: "cChgVal",
        inputtype: "rtinput",
        title: "变化值",
        clearable: true,
        minWidth: 100,
        slotName: "cChgVal"
      }
    ],
  })
);

//上次更改比较表格项
const tableconfig2 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "上次更改比较",
    editFlag: true,
    isPage: false,
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "序号",
        minWidth: 30,
      },
      {
        prop: "cFldNme",
        inputtype: "rtinput",
        title: "批改对象",
        minWidth: 140,
      },
      {
        prop: "cRelTableNme",
        inputtype: "rtinput",
        title: "批改项目",
        // minWidth: 145,
      },
      {
        prop: "cRelFldNme",
        inputtype: "rtinput",
        title: "类型",
        minWidth: 100,
      },
      {
        prop: "cOldVal",
        inputtype: "rtinput",
        title: "原值",
        clearable: true,
        minWidth: 100,
      },
      {
        prop: "cNewVal",
        inputtype: "rtinput",
        title: "新值",
        clearable: true,
        minWidth: 100,
      },
      {
        prop: "cChgVal",
        inputtype: "rtinput",
        title: "变化值",
        clearable: true,
        minWidth: 100,
        slotName: "cChgVal"
      }
    ],
  })
);

onMounted(async () => {
  handleQuery();
  findFeeBetween(); // 承包 查询 手续费 区间信息
  findIlogC1(); // 查询ilog原始C1值
	checktype();
	setTimeout(() => {
		getCompareAppFeeInfoquery()
	}, 2000);
});
let param = {
      pagePos: '',
      pageSize: '',
      CurrentUser: '',
      CurrentUserOrg: '',
      appNo: '',
      prodNo: '',
      dptCde:'',
      CAgtAgrNo: '',
      readOnle: '',
      CPlyNo: '',
      A1_value: '',
      B1_value: '',
      Coper: ''
};
const user: any = ref('');
    // 绩效工资的默认比例 上下限
let minPerformancePayValue = 0.00;
let maxPerformancePayValue = 100.00;
const my_min_value: any= ref('');
const my_max_value: any= ref('');
const A_value: any= ref('');
const B_value: any= ref('');
const A1_value: any= ref('');
const B1_value: any = ref('');
const A6_value: any = ref('');
let params: any = {
      typeFlag: 1,
      scene: props.data?.pageType,//  场景
      appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo,
      prodNo: props.data?.cProdNo,
      dptCde: props.data?.cDptCde,
      bsnsTyp: '19001',
      nPrm: props.data?.nPrm,
      isReadOnly: props.data?.pageType === "PLY_UW_PROCESS_SCENE" ? "2" : "1",// 核保页面打开的isReadOnly值为2
      updFlag: '1',
      appTyp: props.data?.cAppTyp,
  }
let typ_flag: any;

function numComparison(num1: any, num2: any) {
    return Number.parseFloat(num1) === Number.parseFloat(num2);
};
function tool_fix(num: any, prec: any) {
    num = (Math.round(num * Math.pow(10, prec)) / Math.pow(10, prec)) + '';
    const index = num.indexOf('.');
    if (index !== -1) {
        const dgt = num.substring(index + 1);
        if (dgt.length < prec) {
            for (let i = 0; i < prec - dgt.length; i++) {
                num += '0';
            }
        }
    } else {
        num += '.';
        for (let i = 0; i < prec; i++) {
            num += '0';
        }
    }
    return num;
};

// 根据输入手续费比例计算出相应金额
function getNFeeList(row:any) {
			if (row.nFeeProp == '' || row.nFeeProp == null || row.nFeeProp == undefined) {
				row.nFeeProp = 0
			}
      const feeProp = row.nUpdFeeProp * 1;
      let feePropSum = freeEditRef.value?.getValue("nFeePropSum") * 1;
      let prmSum = freeEditRef.value?.getValue("nPrmSum") * 1;
      const fee = params['nPrm'];
      const temp = feeProp * fee * 0.01;
      const gotPrm = formartNum(temp);
      feePropSum = formartNum(feeProp);
      prmSum = formartNum(gotPrm);
      tableRef.value?.setValueByRowKey('nUpdFee', row._dataId, gotPrm);
      freeEditRef.value?.setValue("nFeePropSum", feePropSum);
      freeEditRef.value?.setValue("nPrmSum", prmSum);
      sumMoney(true,row);
  }
// 截取两位小数 （不进行 四舍五入） 公共方法
function formartNum(obj: any) {
    if (typeof (obj) !== 'undefined' && (obj !== '0' || isNaN(obj))) {
      obj = obj + '';
      if (obj.indexOf('.') > 0) {
        return Number(tool_fix(obj, 2));
      } else {  // 不包含小数
        return Number(obj + '.00');
      }
    } else {
      return 0.00; // 非数字
    }
  }
function sumMoney(flag_to_alert: any,row:any) {
  const items = pageresult.list;
    if (items.length > 0) {
      const my_length = items.length;
      let my_rate = 0;
      let my_sum = 0;
      let my_node_name = '';
      const fee = params['nPrm'];
      for (const item of items) {
        my_node_name = row.cTypCde;
        my_rate = my_rate + parseFloat(item['nUpdFeeProp']);
        my_sum = my_sum + parseFloat(item['nUpdFee']);
        const appTyp = params['appTyp'];
        if (flag_to_alert && my_node_name === '手续费/佣金：') {
          const targetRate = parseFloat(row.nUpdFeeProp);
          if (targetRate > my_max_value.value || targetRate < my_min_value.value) {
            if (my_max_value.value === my_min_value.value) {
              ElMessage.error('手续费(佣金)比率 输入错误！\n应为：[ ' + my_max_value.value + ' ]');
            } else {
              ElMessage.error('手续费(佣金)比率 输入错误！\n应为： ' + my_min_value.value + ' 到 ' + my_max_value.value + '  之间的比率！');
            }
            tableRef.value?.setValueByRowKey('nUpdFeeProp', row._dataId, '0.00');
            savenFeeValue();
            // if (my_min_value.value !== 0) {
            //   sumMoney(false,row); // 是否要再次检查 手续费 区间
            // } else {
            //   sumMoney(true,row);
            // }
            return false;
          }
          else if (targetRate > freeEditRef.value?.getValue("ilog_c1") && appTyp !== 'E' && typ_flag === '01') {
            ElMessage.error('手续费(佣金)比率 不可高于默认值！,请重新输入！');
            tableRef.value?.setValueByRowKey('nUpdFeeProp', item._dataId, '0.00');
            return false;
          }

        }
      }
      if (my_rate && my_rate > 100) {
        ElMessage.error('费用比例合计不能大于100');
        my_rate=0
        my_sum=0
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            tableRef.value?.setValueByRowKey('nUpdFeeProp', items[i]._dataId, '0.00');
            tableRef.value?.setValueByRowKey('nUpdFee', items[i]._dataId, '0.00');
          }
         freeEditRef.value?.setValue("nFeePropSum", formartNum(0.00));
         freeEditRef.value?.setValue("nPrmSum",formartNum(0.00));
          //sumMoney(true,row);
          return false;
        } else {
          tableRef.value?.setValueByRowKey('nUpdFeeProp', row._dataId, '0.00');
          tableRef.value?.setValueByRowKey('nUpdFee',row._dataId, '0.00');
          //sumMoney(true,row);
          return false;
        }
      }
      freeEditRef.value?.setValue("nFeePropSum", formartNum(my_rate));
      freeEditRef.value?.setValue("nPrmSum", formartNum(my_sum));
    }
}

  /**
   * 只允许输入手续费比例
   */
function  readCheck() {
    const readOnle_flag = params['isReadOnly'];
    const updFlag = params['updFlag'];
    const appTyp = params['appTyp'];
    if (readOnle_flag === '0' || readOnle_flag === '1') {  // --- 批改系列操作 均设为只读
      // 保费
      for (let i = 0; i < pageresult.list.length; i++) {
        tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFee", 'disabled',true);
        if (appTyp === 'E') {
          tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFeeProp", 'disabled',true);
        } else {
          if (updFlag === '1') {
            const feetyp1 = pageresult.list[i]['cFeetypCde'];
            const bsnsTyp1 = params['bsnsTyp'];
            if (bsnsTyp1 === '19001' && (feetyp1 === 'C1' || feetyp1 === 'C23')) {
              tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFeeProp", 'disabled',true);  // 比例
            } else {
              tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFeeProp", 'disabled',false); // 比例
            }
            tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFeeProp", 'disabled',false);
          } else {
            tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "nUpdFeeProp", 'disabled',true);
          }
        }
      }

    }
  }

function checktype() {
    const paramStr = {
      prodNo: params['prodNo'],
  };
  gettypflag(paramStr)
    .then((res:any) => {
      if (null != res && null != res['code']) {
        if (res['code'] === 200) {
          const msg = res.data;
          typ_flag = msg;
        } else {
          ElMessage.error('未获取到产品标识');
        }
      }
    })
    .finally(() => { });
}
  
function readOnlyAB() {
  const company = user['companyId']; // 操作机构
  //const CCardBsnsTyp = opertaor.getTableRefs()["BASE"].getFromValue()["Base.CCardBsnsTyp"];
  const CCardBsnsTyp=null
    const appTyp = params['appTyp'];
    formconfig1.fromSchema?.forEach((e) => {
        if (e.prop === "A1_value" || e.prop === "B1_value") {
          e.disabled = true;
        }
      })
    if (CCardBsnsTyp == null && appTyp !== 'E') {
      if (company === '0200000000000') {
        formconfig1.fromSchema?.forEach((e) => {
          if (e.prop === "A1_value") {
            e.disabled = true;
          }
        })
      } else {
        formconfig1.fromSchema?.forEach((e) => {
          if (e.prop === "B1_value") {
            e.disabled = true;
          }
        })
      }
    }
  }
  /*
  * 投保给手续费比例赋默认值
  */
  function savenFeeValue() {
    const bsnsTyp = params['bsnsTyp'];
    const item = pageresult.list;
    if ((item.length > 0)) {
      let my_node_name = '';
      
        for (let i = 0; i < item.length; i++) {
          const fee = params['nPrm'];
          const n_fee = my_min_value.value * fee * 0.01;
          my_node_name = item[i].cTypCde;
          let gotFee = formartNum(n_fee);
          if (my_min_value.value === 0.00) {
            gotFee = 0.00;
          }
          const n_fee_pay = minPerformancePayValue * fee * 0.01;
          let gotFeePay = formartNum(n_fee_pay);
          if (minPerformancePayValue === 0.00) {
            gotFeePay = 0.00;
          }
          if (my_node_name === '手续费/佣金') {
            if (bsnsTyp === '19001') {
              tableRef.value?.setValueByRowKey('nUpdFee', item[i]._dataId, '0.00');
              tableRef.value?.setValueByRowKey('nUpdFeeProp', item[i]._dataId, '0.00');
            } else {
              tableRef.value?.setValueByRowKey('nUpdFee', item[i]._dataId, gotFee);
              tableRef.value?.setValueByRowKey('nUpdFeeProp', item[i]._dataId, my_min_value.value);
              freeEditRef.value?.setValue("nFeePropSum", my_min_value.value);
              freeEditRef.value?.setValue("nPrmSum",gotFee);
            }
          }
        
      }

    }



}
//比较接口
async function compareAppFee(saveFlag:any) {
	tableRef1.value?.setPartnerPage({ pageNum: 1, pageSize: 50 });
  let requstFlag = false;
  const paramStr = {
    appNo: params['appNo'],//保单号
    nPrm: String(params['nPrm']),  
    saveFlag:saveFlag,
    feeList: pageresult.list,
    nUpdRateA:String(freeEditRef.value?.getValue("A1_value") || ""),
    nUpdRateB: String(freeEditRef.value?.getValue("B1_value") || ""),
    allFeeProp: String(freeEditRef.value?.getValue("nFeePropSum") || ""),
    allFee:String(freeEditRef.value?.getValue("nPrmSum") || ""),
    nRateA6: String(freeEditRef.value?.getValue("A6_value") || ""),
  };
  await compareAppFeeInfo(paramStr)
    .then((res:any) => {
      if (res.code == 200) {
        //let result = JSON.parse(res.data);
        console.log("000000", res.data);
        requstFlag = true;
        pageresult1.list = [];
        pageresult1.list = res.data || [];
        pageresult1.total = res.data?.length;
        pageresult1.list.forEach((item, index) => {
          item.nSeqNo = index + 1;
        });
      } else {
        ElMessage.error(res.msg);
      }
    })
    return requstFlag;
    //pageresult1.list
}
//保存按钮
async function saveFeeInfo() {
  const items = pageresult.list;

  const formData = freeEditRef.value?.getFromValue();
  const appFeeInfo = Object.assign({ type: props.type }, formData);

  const paramStr = {
    feeList: items,
    appFeeInfo: appFeeInfo
  };
  if (items.length > 0) {
    let my_node_name = '';
    for (let i = 0; i < items.length; i++) { // 改用普通 for 循环
      const item = items[i];
      const nfee = item['nUpdFee'];
      my_node_name = item['cFeetypCde'];
      if (my_node_name === 'C1' && (nfee == 0.00 || nfee == 0)) {
        ElMessageBox.confirm('手续费为零确定保存吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const compareAppFeeFunc = await compareAppFee('1');
          if(compareAppFeeFunc !== true) {
            return;
          }
          saveAppFeeInfo_new(paramStr)
          .then((res:any) => {
            if (null != res && null != res.code ) {
              if (res.code === 200) {
                ElMessage.success('费用信息保存:' + res['msg']);
                const paramStr2 = {
                  appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo,
                  A1_value:String(freeEditRef.value?.getValue("A1_value")),
                  B1_value:String(freeEditRef.value?.getValue("B1_value")),
                  A6_value:String(freeEditRef.value?.getValue("A6_value")),
                  Coper: JSON.parse(String(sessionStorage.getItem("user"))).opCde,
                };
                updateIIogFee(paramStr2)
                .then((res1:any) => {
                  if (null != res1 && null != res1['code']) {
                    if (res1['code'] === 200) {
                      ElMessage.success('iLog费用信息同步:' + res1['msg'],);
											dialogVisible.value = false;
                    } else {
                      ElMessage.error('iLog费用信息同步失败');
                    }
                  }
                })
                .finally(() => { });

              } else {
                ElMessage.error('费用信息保存失败');
              }
            }
          })
          .finally(() => { });
        }).catch(() => {
          // 取消时，可根据需求决定是否跳出循环（如直接 return 退出整个函数）
          return;
        });
      } else {
        const compareAppFeeFunc = await compareAppFee('1');
        if(compareAppFeeFunc !== true) {
          return;
        }
        saveAppFeeInfo_new(paramStr)
          .then((res:any) => {
            if (null != res && null != res.code ) {
              if (res.code === 200) {
                ElMessage.success('费用信息保存:' + res['msg']);
                const paramStr2 = {
                  appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo,
                  A1_value:String(freeEditRef.value?.getValue("A1_value")),
                  B1_value:String(freeEditRef.value?.getValue("B1_value")),
									A6_value:String(freeEditRef.value?.getValue("A6_value")),
                  Coper: JSON.parse(String(sessionStorage.getItem("user"))).opCde,
                };
                updateIIogFee(paramStr2)
                .then((res1:any) => {
                  if (null != res1 && null != res1['code']) {
                    if (res1['code'] === 200) {
                      ElMessage.success('iLog费用信息同步:' + res1['msg'],);
											dialogVisible.value = false;
                    } else {
                      ElMessage.error('iLog费用信息同步失败');
                    }
                  }
                })
                .finally(() => { });

              } else {
                ElMessage.error('费用信息保存失败');
              }
            }
          })
      }
      return;
    }
  }
}

//查询费用信息中的费率上下限
function findFeeBetween() {
    getAppFeeBetwNew({ appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo})
    .then((res:any) => {
      if (null != res && null != res.code) {
                if (res.code === 200) {
                    const msg = res.data;
                    if (msg && msg.length > 0) {
                        const values = msg.split('=');
                        if (numComparison(values[0], '0')) {
                            my_min_value.value = '0.00';
                        }
                        if (numComparison(values[1], '0')) {
                            my_max_value.value = '0.00';
                        }
                        if (numComparison(values[2], '0')) {
                            A1_value.value = '0.00';
                        }
                        if (numComparison(values[3], '0')) {
                            B1_value.value = '0.00';
                        }
                        if (numComparison(values[4], '0')) {
                            A_value.value = '0.00';
                        }
                        if (numComparison(values[5], '0')) {
                            B_value.value = '0.00';
                        }
                        if (numComparison(values[8], '0')) {
                            A6_value.value = '0.00';
                        }
                        my_max_value.value = tool_fix(values[1] * 1, 2);    // 后台查询出来的是小数！ 应 乘以 100
                        my_min_value.value  = tool_fix(values[0] * 1, 2);    // 手续费的 输入区间  如果后台没查询到 默认为 0.00  【区间】
                        A1_value.value   = tool_fix(values[2] * 1, 2);
                        B1_value.value   = tool_fix(values[3] * 1, 2);
												const num = parseFloat(values[8]);
												A6_value.value  = !isNaN(num) && isFinite(num) ? tool_fix(num * 1, 2) : 0.00;;
                        A_value.value   = tool_fix(values[4] * 1, 2);
                        B_value.value = tool_fix(values[5] * 1, 2);
                        freeEditRef.value?.setValue("max_value", my_max_value.value);
                        freeEditRef.value?.setValue("min_value", my_min_value.value);
                        freeEditRef.value?.setValue("A1_value", A1_value.value);
                        freeEditRef.value?.setValue("B1_value", B1_value.value);
                        freeEditRef.value?.setValue("A6_value", A6_value.value);

                        const appTyp = params.appTyp;
                        if(appTyp=='A'){
                          const readOnle_flag = params.isReadOnly;
                          let butA = true;
                          let butB = true;
                          // 核保页面可以编辑
                          if(readOnle_flag=='2'){
                            if("false"==values[6]){
                              butA=false;
                              dptTyp.value = '1';
                            }
                            if("false"==values[7]){
                              butB=false;
                              dptTyp.value = '2';
                            }
                            formconfig1.fromSchema?.forEach((e) => {
                              if (e.prop === "A1_value") {
                                e.disabled = butA;
                              }
                              if (e.prop === "B1_value") {
                                e.disabled = butB;
                              }
                            })
                          }
                        }
                    } else {
                      ElMessage.error('获取费用信息手续费区间失败！');
                    }
                }
            }
    })
    .finally(() => { });
}

//根据申请单号获取获取ilog原始C1 
function findIlogC1(){  
    getIlogC1({ appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo })
    .then((res:any) => {
      if (null != res && null != res.code) {
              if (null != res && null != res.code) {
                  if (res.code === 200) {
                      const msg = res.data;
                    freeEditRef.value?.setValue("ilog_c1", my_max_value.value);
                  }else {
                    freeEditRef.value?.setValue("ilog_c1", 0.00);
                    ElMessage.error('未获取ilog原始C1');
                  }
            }
        }
    })
    .finally(() => { });
}

/** 查询 */
function handleQuery(flag?: boolean) {
  const param = {...params}
  delete param.nPrm
  //费用信息接口调用
  getAppFeeInfoNewUrl(param)
    .then((res:any) => {
      if (res.code == 200) {
        let result = JSON.parse(res.data);
        pageresult.list = [];
        pageresult.list = result.FeeInfoList;
        pageresult.total = result.FeeInfoList.length;
        sumMoney(false, pageresult.list)
        setTimeout(() => {
          readCheck();
          //readOnlyAB();
        }, 100);
      
      } else {
        ElMessage.error(res.msg);
      }
    })
    .finally(() => { });

    //根据申请单号获取费用信息 
    getAppFee({ appNo: props.data?.pageName === 'priceInquiry' ? props.data?.cInquiryNo : props.data?.cAppNo })
    .then((res:any) => {
      if (null != res && null != res.code) {
          if (res.code=== 200) {
            const pageData = res.data;
            if (!!pageData && pageData === true) {
              savenFeeValue();
            }
          }
      } else {
        ElMessage.error('获取费用信息失败');
        }
    })
    .finally(() => { });
}

  // 设置当销售渠道为直销业务时  手续费比例不允许输入
function  onFeePropKeyDown(row:any) {
    const appTyp = params['appTyp'];
    const bsnsTyp = params['bsnsTyp'];
    const subDptCde = params['subDptCde'];
    const feetypCde = row.cFeetypCde;
  if (bsnsTyp === '19001' && feetypCde === 'C1') {
    tableRef.value?.setFormSchema(row._dataId, "nUpdFeeProp", 'disabled',true);
  } else if (feetypCde === 'C27') {
    tableRef.value?.setFormSchema(row._dataId, "nUpdFeeProp", 'disabled',true);
  } else if (feetypCde === 'C33') {
    tableRef.value?.setFormSchema(row._dataId, "nUpdFeeProp", 'disabled',true);
  } else if (appTyp === 'E') {
    for (let i = 0; i < pageresult.list.length; i++) {
      tableRef.value?.setFormSchema(row._dataId[i], "nUpdFeeProp", 'disabled',true);
    }
  }
    // 如果是直销业务的时候 要不要去掉河南机构的此控制？20140428
    // else if(bsnsTyp!='19001' && feetypCde=='C1' && subDptCde== '0241010000000'){
    // event.returnValue = false;
    // }
  }

function changeUpdValue(value:string){
  const dptCde = params.dptCde;
	let num =0.00;
	var valueNme="总公司下发二级机构的费用政策比例";
	let orgnum = A_value.value;

	if('B1_value'==value){
		valueNme='二级机构下发三级机构的费用政策比例';
		orgnum = B_value.value;
	} 
	num = freeEditRef.value?.getValue(value);
	if(!/^(\-|\+)?(\d+.?)\d{0,2}$/.test(num)){
		ElMessage.error('只能输入数字，小数点后只能保留两位');
    freeEditRef.value?.setValue(value, orgnum)
		return ;
	}
	
	if(parseFloat(num)<parseFloat(0)){
		ElMessage.error(valueNme+"不能小于零！");
    freeEditRef.value?.setValue(value, orgnum)
		return ;
	}
  getDpt({ dpt: DPT }).then((res:any) => {
    if(res.code === 200 && dptTyp.value !== '1') {
      // 修改B费用不能大于A的值，此提示目前适用于江苏、上海、广东，其他机构管控提示不能大于修改之前的值
      if(res.data && (res.data.indexOf('江苏') > 0 || res.data.indexOf('上海') > 0 || res.data.indexOf('广东') > 0) && (parseFloat(freeEditRef.value?.getValue('B1_value')) > parseFloat(freeEditRef.value?.getValue('A1_value')))){
        ElMessageBox.confirm(
          "二级机构下发三级机构的费用政策比例不能大于总公司下发二级机构的费用政策比例",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
            showCancelButton: false
          }
        )
        freeEditRef.value?.setValue('B1_value', freeEditRef.value?.getValue('A1_value'))
				return ;
			}
    }
    if(parseFloat(num)>parseFloat(orgnum)){
      ElMessageBox.confirm(
        valueNme+"不能大于"+orgnum,
        "提示",
        {
          confirmButtonText: "确定",
          type: "warning",
          showCancelButton: false
        }
      )
      freeEditRef.value?.setValue(value, orgnum)
      return ;
    }
  })
}

/**
 * 查询上次比较数据
 */
function getCompareAppFeeInfoquery(flag?: boolean) {
	tableRef2.value?.setPartnerPage({ pageNum: 1, pageSize: 50 });
	pageresult2.list = [];
  const param = {cAppNo:params.appNo}
  //费用信息接口调用
  getCompareAppFeeInfo(param)
    .then((res:any) => {
      if (res.code == 200) {
        pageresult2.list = res.data;
				pageresult2.total = res.data.length;
				pageresult2.list.forEach((item, index) => {
          item.nSeqNo = index + 1;
        });
      } else {
        ElMessage.error(res.msg);
      }
    })
    .finally(() => { });
}
</script>

<style scoped></style>
