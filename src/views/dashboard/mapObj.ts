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
                
export const tableObj = {
  // 出单--暂存任务
  notWaitObj: {
    stripe: false,
    border: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
      },
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称"
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期"
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称"
      },
    ],
  },
  // 出单--已提交任务
  submittedObj: {
    stripe: false,
    border: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因"
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称"
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期"
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称"
      },
      {
        prop: "tInsrncTm",
        inputtype: "rtinput",
        title: "保险期间",
        minWidth: 310,
				formatter: (val, row)=>{
				  return row.tInsrncBgnTm+' - '+row.tInsrncEndTm;
				}
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费"
      },
      {
        prop: "taskStatus",
        inputtype: "rtinput",
        title: "任务状态"
      },
      {
        prop: "hasReceived",
        inputtype: "rtinput",
        title: "是否接收"
      },
    ]
  },
  // 出单--待修改任务
  notReviseObj: {
    stripe: false,
    border: false,
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "任务类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因"
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称"
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请日期"
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称"
      },
      {
        prop: "tInsrncTm",
        inputtype: "rtinput",
        title: "保险期间",
        minWidth: 310,
				formatter: (val, row)=>{
				  return row.tInsrncBgnTm+' - '+row.tInsrncEndTm;
				}
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费"
      },
    ],
  },

  //出单-待续保
  waitObj: {
    stripe: false,
    border: false,
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        showCopyIcon: true,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "cMobile",
        inputtype: "rtinput",
        title: "投保人联系电话",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
      },
      {
        prop: "endInsuranceCountdown",
        inputtype: "rtinput",
        title: "终保倒计时(天)",
      },
    ],
  },
  // 出单-待缴费
  waitPayObj: {
    stripe: false,
    border: false,
    fromSchema: [
			{
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "申请单号",
        showCopyIcon: true,
			},
			{
				prop: "cAppNme",
				inputtype: "rtinput",
				title: "投保人名称",
			},
			{
				prop: "cPayTyp",
				inputtype: "rtselect",
				title: "缴费类型",
        typeCode: "CHARGE_TYPE_CACHE",
        param: {'cCde': [ '2', '3', '5',  '99']},
				// formatter: (val)=>{
				//   const result = cPayTypList.value.find(item => item.value === val);
				//   return result ? result.label : val;
				// }
			},
			{
				prop: "nPrm",
				inputtype: "rtinput",
				title: "保费金额",
			},
			{
				prop: "nPayAmt",
				inputtype: "rtinput",
				title: "应缴金额",
			},
			{
				prop: "cCheckSts",
				inputtype: "rtselect",
				title: "处理状态",
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
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "申请单类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        minWidth: 180,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "分公司",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
      },
    ],
  },
  //核保员-暂存任务
  udrStagingObj: {
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "申请单类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        minWidth: 180,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "分公司",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
      },
    ],
  },
  //核保员-核保退回任务
  udrReturnObj: {
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        title: "申请单类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cAppNoInfo",
        minWidth: 180,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "分公司",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "提核时间",
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务提交人",
      },
    ]
  },
  // 核保员-核保通过任务
  udrPassedObj: {
    fromSchema: [
      {
        prop: "cInquiryNo",
        inputtype: "rtinput",
        title: "申请单号/询价单号",
        slotName: "cInquiryNoInfo",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "申请单号/保单号",
        slotName: "cPlyNoInfo",
        minWidth: 180,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批改申请单号/批单号",
        slotName: "cEdrNoInfo",
        minWidth: 180,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "分公司",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "核保通过时间",
      },
    ]
  }
}
// 出岗 tab
export const tab1 = [{
  name: '暂存任务',
  refName: 'stagingList',
  tableObj: 'notWaitObj',
  url: '/query/application-querys',
},
{
  name: '已提交任务',
  refName: 'submittedList',
  tableObj: "submittedObj",
  url: '/query/application-querys',
},
{
  name: '待修改任务',
  refName: 'reviseList',
  tableObj: "notReviseObj",
  url: '/query/application-querys',
},
{
  name: '待缴费',
  refName: 'pendingPaymentList',
  tableObj: 'waitPayObj',
  url: '/RenewalManagement/renewal-management',
},
{
  name: '待续保',
  refName: 'renewalList',
  tableObj: 'waitObj',
  url: '/RenewalManagement/renewal-management',
},
]

// 核保tab
export const tab2 = [{
  name: '待核保任务',
  refName: 'unUdrList',
  tableObj: 'unUdrObj',
  url: '/pcis-new-udr-list/PendUdrList',
  udrType: "0",
},
{
  name: '暂存任务',
  refName: 'udrStagingList',
  tableObj: "udrStagingObj",
  url: '/pcis-new-udr-list/PendUdrList',
  udrType: "1",
},
{
  name: '核保退回任务',
  refName: 'udrReturnList',
  tableObj: "udrReturnObj",
  url: '/pcis-new-udr-list/PendUdrList',
  udrType: "3",
},
{
  name: '核保通过任务',
  refName: 'udrPassedList',
  tableObj: "udrPassedObj",
  url: '/pcis-new-udr-list/PendUdrList',
  udrType: "4",
}
]