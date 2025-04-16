<!-- 核保任务查询 费用信息 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="费用信息">
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      :isPage="false"
    />
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
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
  checkFeeWindowType,
  getAppFee,
  saveAppFeeInfo_new,
  updateIIogFee,
  gettypflag,
} from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { useFormLabelWidth } from "element-plus/es/components/form/src/utils";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
opertaor.init();

const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const isDisabled = ref(true); //判断表单是否可编辑
const dialogVisible = ref(true);
const props = defineProps({
  data: Object,
  type: String,
});
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
      },
      {
        prop: "nFeePropSum",
        inputtype: "rtnumber",
        title: "比例合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "nPrmSum",
        inputtype: "rtnumber",
        title: "金额合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "A1_value",
        inputtype: "rtnumber",
        title: "总公司下发二级机构费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "B1_value",
        inputtype: "rtnumber",
        title: "二级机构下发三级机构的费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "费用信息",
    editFlag: true,
    editList: ["cTypCde","nFeeProp","nFee","cFeeFlag"],
    fromSchema: [
      {
        prop: "cTypCde",
        inputtype: "rtinput",
        title: "费用类型",
        minWidth: 180,
        disabled: true,
      },
      {
        prop: "nFeeProp",
        inputtype: "rtinput",
        title: "比例(%)",
        minWidth: 180,
      },
      {
        prop: "nFee",
        inputtype: "rtinput",
        title: "金额",
        minWidth: 180,
      },
      {
        prop: "cFeeFlag",
        inputtype: "rtselect",
        title: "ILOG系统费用计算提示信息",
        clearable: true,
        minWidth: 260,
        loadData:  [{ value: 0, label: '成功' }, { value: 1, label: '无规则匹配' }, { value: 9, label: '规则引擎异常' }]
      },
    ],
  })
);

onMounted(async () => {
  handleQuery();
  //onFeePropKeyDown()
  findFeeBetween(); // 承包 查询 手续费 区间信息
  findIlogC1(); // 查询ilog原始C1值
  readOnlyAB();
  checktype();
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
let params: any;
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
function sumMoney(flag_to_alert: any) {
  //const items = this.gridEdit.gridForm.controls.items as FormArray;
  const items = pageresult.list;
    if (items.length > 0) {
      const my_length = items.length;
      let my_rate = 0;
      let my_sum = 0;
      let my_node_name = '';
      const fee = params['nPrm'];
      for (const item of items) {
        my_node_name = item['cTypCde'].value;
        my_rate = my_rate + parseFloat(item['nUpdFeeProp'].value);
        my_sum = my_sum + parseFloat(item['nUpdFee'].value);
        const appTyp = params['appTyp'];
        if (flag_to_alert && my_node_name === '手续费/佣金：') {
          const targetRate = parseFloat(item['nUpdFeeProp'].value);
          if (targetRate > my_max_value.value || targetRate < my_min_value.value) {
            if (my_max_value.value === my_min_value.value) {
              ElMessage.error('手续费(佣金)比率 输入错误！\n应为：[ ' + my_max_value.value + ' ]');
            } else {
              ElMessage.error('手续费(佣金)比率 输入错误！\n应为： ' + my_min_value.value + ' 到 ' + my_max_value.value + '  之间的比率！');
            }
            item['CTypCde'][item.editIndex]['nUpdFeeProp']='0.00'
            savenFeeValue();
            if (my_min_value.value !== 0) {
              sumMoney(false); // 是否要再次检查 手续费 区间
            } else {
              sumMoney(true);
            }
            return false;
          }
          else if (targetRate > freeEditRef.value?.getValue("ilog_c1") && appTyp !== 'E' && typ_flag === '01') {
            ElMessage.error('手续费(佣金)比率 不可高于默认值！,请重新输入！');
            items[item.editIndex]['nUpdFeeProp'] = '0.00'
            
            //this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFeeProp'].setValue('0.00');
            return false;
          }

        }
      }
      if (my_rate && my_rate > 100) {
        ElMessage.error('费用比例合计不能大于100');
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            items[i]['nUpdFeeProp'] = '0.00'
            items[i]['nUpdFee']='0.00'
            // this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].setValue('0.00');
            // this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFee'].setValue('0.00');
          }
          freeEditRef.value?.setValue("nFeePropSum", formartNum(0.00));
          freeEditRef.value?.setValue("nPrmSum",formartNum(0.00));
          //this.freeEdit.controls['NFeePropSum'].setValue(this.formartNum(0.00));
          //this.freeEdit.controls['NPrmSum'].setValue(this.formartNum(0.00));
          sumMoney(true);
          return false;
        } else {
          items[0]['nUpdFeeProp'] = '0.00'
          items[0]['nUpdFee']='0.00'
          // this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFeeProp'].setValue('0.00');
          // this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFee'].setValue('0.00');
          sumMoney(true);
          return false;
        }
      } else {
        freeEditRef.value?.setValue("nFeePropSum", my_rate);
        freeEditRef.value?.setValue("nPrmSum",my_sum);
      }
    }
}

  /**
   * 只允许输入手续费比例
   */
function  readCheck() {
    const readOnle_flag = this.params['isReadOnly'];
    const updFlag = this.params['updFlag'];
    const appTyp = this.params['appTyp'];
    if (readOnle_flag === '0' || readOnle_flag === '1') {  // --- 批改系列操作 均设为只读
      // 保费
      for (let i = 0; i < this.gridEdit.gridForm.controls.items['controls'].length; i++) {
        this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFee'].readOnly = true;
        if (appTyp === 'E') {
          this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = true;
        } else {
          if (updFlag === '1') {
            const feetyp1 = this.gridEdit.gridForm.controls.items['controls'][i]['controls']['CFeetypCde'].value;
            const bsnsTyp1 = this.params['bsnsTyp'];
            if (bsnsTyp1 === '19001' && (feetyp1 === 'C1' || feetyp1 === 'C23')) {
              this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = true; // 比例
            } else {
              this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = false; // 比例
            }
            // 从2015年1月1日,C23停用,add 2014,12,17
            // Calendar fixDate = Calendar.getInstance();
            // fixDate.set(2015, 0, 1, 0, 0, 0);
            // String isStop_C23 = (fixDate.getTime().getTime() - (new Date()).getTime() < 0)?"1":"0";
            // const isStop_C23 = 0;
            // if ((feetyp1 === 'C23' && isStop_C23 === 1)  || (feetyp1 === 'C22' && isStop_C23 === 1)) {
            //     this.gridEdit.items.controls[i]['controls']['NUpdFeeProp'].readOnly = true; // 比例
            // } else {
            //     this.gridEdit.items.controls[i]['controls']['NUpdFeeProp'].readOnly = false; // 比例
            // }
            this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = false; // 比例

          } else {
            this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = true; // 比例
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
    const CCardBsnsTyp =opertaor.getTableRefs()["BASE"].getFromValue()["Base.CCardBsnsTyp"];
    const appTyp = params['appTyp'];
    //this.freeEdit.controls['A1_value'].readOnly = true;
    //this.freeEdit.controls['B1_value'].readOnly = true;
    if (CCardBsnsTyp == null && appTyp !== 'E') {
      if (company === '0200000000000') {
        //this.freeEdit.controls['A1_value'].readOnly = false;
      } else {
        //this.freeEdit.controls['B1_value'].readOnly = false;
      }
    }
  }
  /*
  * 投保给手续费比例赋默认值
  */
  function savenFeeValue() {
    const bsnsTyp = params['bsnsTyp'];
    const items = pageresult.list;
    if ((items.length > 0)) {
      let my_node_name = '';
      for (const item of items) {
        for (let i = 0; i < item.length; i++) {
          const fee = params['nPrm'];
          const n_fee = my_min_value.value * fee * 0.01;
          my_node_name = item['cTypCde'].value;
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
              item['nUpdFee'].setValue('0.00');
              item['nUpdFeeProp'].setValue('0.00');
            } else {
              item['nUpdFee'].setValue(gotFee);
              item['nUpdFeeProp'].setValue(my_min_value.value);
              freeEditRef.value?.setValue("nFeePropSum", my_min_value.value);
              freeEditRef.value?.setValue("nPrmSum",gotFee);
            }
          }
        }
      }

    }



}
  
  function saveFeeInfo() {
    const res = [];
    const items = pageresult.list;
    if (items.length > 0) {
      let my_node_name = '';
      for (const item of items) {
        const nfee = item['nUpdFee'].value;
        my_node_name = item['cTypCde'].value;
        if (my_node_name === '手续费/佣金：' && (nfee === 0.00 || nfee === 0)) {
          continue
          //const confirmRes = await this.openModel('手续费为零确定保存吗？');
          // if (confirmRes) {
          //   continue;
          // } else {
          //   return;
          // }
        }
      }
    }
    for (const row of pageresult.list) {
      const obj:any = {};
      for (const k in row) {
        obj[k] = row[k];
      }
      res.push(obj);
    }
    const paramStr = {
      feeList: res
    };
    console.log(paramStr)
    saveAppFeeInfo_new(paramStr)
    .then((res:any) => {
      if (null != res && null != res.code ) {
        if (res.code === 200) {
          ElMessage.success('费用信息保存:' + res['msg']);
          const paramStr2 = {
            appNo: '237022504000000316',
            A1_value: freeEditRef.value?.getValue("A1_value"),
            B1_value: freeEditRef.value?.getValue("B1_value"),
            Coper: JSON.parse(sessionStorage.getItem("user")).opCde,
          };
          updateIIogFee(paramStr2)
          .then((res1:any) => {
            if (null != res1 && null != res1['code']) {
              if (res1['code'] === 200) {
                ElMessage.error('iLog费用信息同步:' + res1['msg'],);
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
}

//查询费用信息中的费率上下限
function findFeeBetween() {
    getAppFeeBetwNew({ appNo: "237022504000000316" })
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
                        my_max_value.value = tool_fix(values[1] * 1, 3);    // 后台查询出来的是小数！ 应 乘以 100
                        my_min_value.value  = tool_fix(values[0] * 1, 3);    // 手续费的 输入区间  如果后台没查询到 默认为 0.00  【区间】
                        A1_value.value   = tool_fix(values[2] * 1, 3);
                        B1_value.value   = tool_fix(values[3] * 1, 3);
                        A_value.value   = tool_fix(values[4] * 1, 3);
                        B_value.value = tool_fix(values[5] * 1, 3);
                        freeEditRef.value?.setValue("max_value", my_max_value.value);
                        freeEditRef.value?.setValue("min_value", my_min_value.value);
                        freeEditRef.value?.setValue("A1_value", A1_value.value);
                        freeEditRef.value?.setValue("B1_value", B1_value.value);
                        // this.freeEdit.controls['max_value'].setValue(this.my_max_value);
                        // this.freeEdit.controls['min_value'].setValue(this.my_min_value);
                        // this.freeEdit.controls['A1_value'].setValue(this.A1_value);
                        // this.freeEdit.controls['B1_value'].setValue(this.B1_value);
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
    getIlogC1({ appNo: "237022504000000316" })
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
  // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  // const s = freeEditRef.value?.getFromValue(); //获取表单数据
  // const s = props.data;
  // const param = Object.assign(s, r);
  console.log("999999999", props.data);
  // const param = {
  //   appNo: props.data?.appNo
  // }
  //费用信息接口调用
  getAppFeeInfoNewUrl({ appNo: "237022504000000316" })
    .then((res:any) => {
      if (res.code == 200) {
        let result = JSON.parse(res.data);
        console.log("000000", result);
        pageresult.list = [];
        pageresult.list = result.FeeInfoList;
        pageresult.total = result.FeeInfoList.length;
      } else {
        ElMessage.error(res.msg);
      }
    })
    .finally(() => { });

    //根据申请单号获取费用信息 
    getAppFee({ appNo: "237022504000000316" })
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
function  onFeePropKeyDown() {
    const appTyp = params['appTyp'];
    const bsnsTyp = params['bsnsTyp'];
    const subDptCde = params['subDptCde'];
    if (this.gridEdit.editIndex !== -1) {
      const feetypCde = this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['CFeetypCde'].value;
      if (bsnsTyp === '19001' && feetypCde === 'C1') {
        this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFeeProp'].readOnly = true;
        // for (let i = 0; i < this.gridEdit.gridForm.controls.items['controls'].length; i++) {
        //     this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = true;
        // }
      } else if (feetypCde === 'C27') {
        this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFeeProp'].readOnly = true;
      } else if (feetypCde === 'C33') {
        this.gridEdit.gridForm.controls.items['controls'][this.gridEdit.editIndex]['controls']['NUpdFeeProp'].readOnly = true;
      } else if (appTyp === 'E') {
        for (let i = 0; i < this.gridEdit.gridForm.controls.items['controls'].length; i++) {
          this.gridEdit.gridForm.controls.items['controls'][i]['controls']['NUpdFeeProp'].readOnly = true;
        }
      }
    }

    // 如果是直销业务的时候 要不要去掉河南机构的此控制？20140428
    // else if(bsnsTyp!='19001' && feetypCde=='C1' && subDptCde== '0241010000000'){
    // event.returnValue = false;
    // }
  }
</script>

<style scoped></style>
