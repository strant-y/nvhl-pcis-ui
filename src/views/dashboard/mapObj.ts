const cCheckStsList = [
  {value: '00', label: '待缴费'},
  {value: '0', label: '待登记'},
  {value: '1', label: '待审核'},
  {value: '2', label: '待修改'},
  {value: '3', label: '审核通过'},
  {value: '4', label: '缴费成功'},
  {value: '5', label: '刷卡成功待重复确认'},
  {value: '6', label: '待确认'},
  {value: '7', label: '已登记'},
  {value: '9', label: '重复投保'},
];
const statusList = [
  { label: "待核保任务", value: "1" },
  { label: "暂存任务", value: "2" },
  { label: "已上报任务", value: "3" },
  { label: "核保退回任务", value: "4" },
  { label: "核保通过任务", value: "5" },
]
                
export const tableObj:any = {
  // 出单--暂存任务
  notWaitObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        align: "left",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
        align: "left",
        lengthNum: 13,
        lengthIsNumber: true,
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        align: "left",
        lengthNum: 12,
        lengthIsNumber: true,
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起止期",
        align: "left",
        lengthNum: 36,
        lengthIsNumber: true,
        formatter:(val:any,row:any) => {
          return val + ' - ' + row.tInsrncEndTm
        }
      },
    ],
  },
  // 出单--已提交任务
  submittedObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因",
        align: "left",
        lengthNum: 8,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "tInsrncTm",
        inputtype: "rtinput",
        title: "保险期间",
        lengthNum: 36,
        lengthIsNumber: true,
				formatter: (val, row)=>{
				  return row.tInsrncBgnTm+' - '+row.tInsrncEndTm;
				}
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        align: "left",
        lengthNum: 12,
        lengthIsNumber: true,
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
      },
      {
        prop: "taskStatus",
        inputtype: "rtinput",
        title: "任务状态",
        align: "left",
        lengthNum: 4,
      },
      {
        prop: "hasReceived",
        inputtype: "rtinput",
        title: "是否接收",
        lengthNum: 4,
      },
    ]
  },
  // 出单--待修改任务
  notReviseObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因",
        align: "left",
        lengthNum: 8,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "tInsrncTm",
        inputtype: "rtinput",
        title: "保险期间",
        lengthNum: 36,
        lengthIsNumber: true,
				formatter: (val, row)=>{
				  return row.tInsrncBgnTm+' - '+row.tInsrncEndTm;
				}
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        align: "left",
        lengthNum: 12,
        lengthIsNumber: true,
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
      },
    ],
  },

  //出单-待续保
  waitObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        showCopyIcon: true,
        slotName: "cPlyNo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cMobile",
        inputtype: "rtinput",
        title: "投保人联系电话",
        align: "left",
        lengthNum: 7,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "endInsuranceCountdown",
        inputtype: "rtinput",
        title: "终保倒计时(天)",
        align: "left",
        lengthNum: 7,
      },
    ],
  },
  // 出单-待缴费
  waitPayObj: {
    stripe: false,
    fromSchema: [
			{
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "申请单号",
        slotName: "cAppNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
			},
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
			{
				prop: "cAppNme",
				inputtype: "rtinput",
				title: "投保人名称",
        align: "left",
        lengthNum: 12,
			},
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
			{
				prop: "cPayTyp",
				inputtype: "rtselect",
				title: "缴费类型",
        typeCode: "CHARGE_TYPE_CACHE",
        param: {'cCde': [ '2', '3', '5',  '99']},
        align: "left",
        lengthNum: 9,
				// formatter: (val)=>{
				//   const result = cPayTypList.value.find(item => item.value === val);
				//   return result ? result.label : val;
				// }
			},
			{
				prop: "nPrm",
				inputtype: "rtinput",
				title: "保费金额",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
			},
			{
				prop: "nPayAmt",
				inputtype: "rtinput",
				title: "应缴金额",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left",
        formatter:(val:any) => {
          return val?.toLocaleString()
        }
			},
			{
				prop: "tInsrncBgnTm",
				inputtype: "rtinput",
				title: "保险起止期",
        align: "left",
        lengthNum: 36,
        lengthIsNumber: true,
        formatter:(val:any,row:any) => {
          return val + ' - ' + row.tInsrncEndTm
        }
			},
			{
				prop: "cCheckSts",
				inputtype: "rtselect",
				title: "处理状态",
        align: "left",
        lengthNum: 9,
				loadData:cCheckStsList,
				formatter: (val)=>{
				  const result = cCheckStsList.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
    ]
  },
  //核保员-待核保任务
  unUdrObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        align: "left",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any) => {
          if(val?.split("分公司").length > 1) {
            return val?.split("分公司")[0]
          } else {
            return val?.slice(0,2)
          }
        }
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
        align: "left",
        lengthNum: 15,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        width: 151,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
        align: "left",
        lengthNum: 5,
      },
    ],
  },
  //核保员-暂存任务
  udrStagingObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        align: "left",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any) => {
          if(val?.split("分公司").length > 1) {
            return val?.split("分公司")[0]
          } else {
            return val?.slice(0,2)
          }
        }
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
        align: "left",
        lengthNum: 15,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
        align: "left",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
        align: "left",
        lengthNum: 5,
      },
    ],
  },
  //核保员-核保退回任务
  udrReturnObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
        lengthNum: 4,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any) => {
          if(val?.split("分公司").length > 1) {
            return val?.split("分公司")[0]
          } else {
            return val?.slice(0,2)
          }
        }
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
        align: "left",
        lengthNum: 15,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
        align: "left",
        lengthNum: 5,
      },
    ]
  },
  // 核保员-核保通过任务
  udrPassedObj: {
    stripe: false,
    fromSchema: [
      {
        prop: "cInquiryNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cInquiryNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "申请单号/保单号",
        slotName: "cPlyNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批改申请单号/批单号",
        slotName: "cEdrNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any) => {
          if(val?.split("分公司").length > 1) {
            return val?.split("分公司")[0]
          } else {
            return val?.slice(0,2)
          }
        }
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
        align: "left",
        lengthNum: 15,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        align: "left",
        lengthNum: 25,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        align: "left",
        lengthNum: 12,
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "核保通过时间",
        lengthNum: 17,
        lengthIsNumber: true,
      },
    ]
  }
}
// 出岗 tab
export const tab1 = [{
  name: '暂存任务',
  refName: 'stagingList',
  tableObj: 'notWaitObj',
  url: '/pcis-new-udr-list/orderProcessing',
},
{
  name: '已提交任务',
  refName: 'submittedList',
  tableObj: "submittedObj",
  url: '/pcis-new-udr-list/orderProcessing',
},
{
  name: '待修改任务',
  refName: 'reviseList',
  tableObj: "notReviseObj",
  url: '/pcis-new-udr-list/orderProcessing',
},
{
  name: '待缴费',
  refName: 'pendingPaymentList',
  tableObj: 'waitPayObj',
  url: '/payinfoManagement/payinfohandle',
},
{
  name: '待续保',
  refName: 'renewalList',
  tableObj: 'waitObj',
  url: '/pcis-new-udr-list/orderProcessing',
},
]

// 核保tab
export const tab2 = [{
  name: '待核保任务',
  refName: 'unUdrList',
  tableObj: 'unUdrObj',
  url: '/pcis-new-udr-list/PendUdrListQuery',
  udrType: "0",
},
{
  name: '暂存任务',
  refName: 'udrStagingList',
  tableObj: "udrStagingObj",
  url: '/pcis-new-udr-list/PendUdrListQuery',
  udrType: "1",
},
{
  name: '核保退回任务',
  refName: 'udrReturnList',
  tableObj: "udrReturnObj",
  url: '/pcis-new-udr-list/PendUdrListQuery',
  udrType: "3",
},
{
  name: '核保通过任务',
  refName: 'udrPassedList',
  tableObj: "udrPassedObj",
  url: '/pcis-new-udr-list/PendUdrListQuery',
  udrType: "4",
}
]