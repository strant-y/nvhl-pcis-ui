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
    fromSchema: [
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cAppTyp",
        inputtype: "rtselect",
        title: "类型",
        loadData: [
          { value: "A", label: "投保单" },
          { value: "E", label: "批单" },
        ],
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保日期",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "cOperCnm",
        inputtype: "rtinput",
        title: "操作员",
      },
      // {
      //   prop: "cAppStatus",
      //   title: "状态",
      //   inputtype: "rtselect",
      //   typeCode: "RECEIVE_BANK_CATEGORY",
      //   codeParam: { cParCde: "shenqingdanzhuangtai" },
      // },
    ],
  },
  // 出单--待修改任务
  notReviseObj: {
    fromSchema: [
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "bsType",
        inputtype: "rtselect",
        title: "类型",
        loadData: [
          { value: "A", label: "投保单" },
          { value: "E", label: "批单" },
        ],
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "投保日期",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "operName",
        inputtype: "rtinput",
        title: "操作员",
      },
      // {
      //   prop: "cAppStatus",
      //   title: "状态",
      //   inputtype: "rtselect",
      //   typeCode: "RECEIVE_BANK_CATEGORY",
      //   codeParam: { cParCde: "shenqingdanzhuangtai" },
      // },
    ],
  },

  //出单-待续保
  waitObj: {
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
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
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "终保倒计时(天)",
      },
    ],
  },
  // 出单-待缴费
  waitPayObj: {
    fromSchema: [
			{
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "投保单号",
			},
			{
				prop: "cAppNmeInvest",
				inputtype: "rtinput",
				title: "投保人名称",
			},
			{
				prop: "cPayTyp",
				inputtype: "rtselect",
				title: "缴费类型",
        typeCode: "CHARGE_TYPE_CACHE",
        param: {'cCde': [ '2', '3', '5',  '99']},
				formatter: (val)=>{
				  const result = cPayTypList.value.find(item => item.value === val);
				  return result ? result.label : val;
				}
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
  //核保员-暂存任务
  saveObj: {
    fromSchema: [
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "条款",
      },
    ],
  },
  //核保员-修改单
  editObj: {
    fromSchema: [
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "条款",
      },
      {
        prop: "cAppStatus",
        inputtype: "rtinput",
        title: "状态",
      }
    ],
  },
  //核保员-已核保单
  udrObj: {
    fromSchema: [
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "条款",
      },
      {
        prop: "cAppStatus",
        inputtype: "rtinput",
        title: "状态",
				formatter: (val)=>{
				  const result = statusList.find(item => item.value === val);
				  return result ? result.label : val;
				}
      }
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
  name: '待修改任务',
  refName: 'reviseList',
  tableObj: "notReviseObj",
  url: '/query/application-querys',
},
{
  name: '待续保',
  refName: 'renewalList',
  tableObj: 'waitObj',
  url: '/RenewalManagement/renewal-management',
},
{
  name: '待缴费',
  refName: 'pendingPaymentList',
  tableObj: 'waitPayObj',
  url: '/RenewalManagement/renewal-management',
}
]

// 核保tab
export const tab2 = [{
  name: '暂存任务',
  refName: 'udrStagingList',
  tableObj: 'saveObj',
  url: '/pcis-new-udr-list/PendUdrList',
},
{
  name: '待修改任务',
  refName: 'udrReturnList',
  tableObj: "editObj",
  url: '/pcis-new-udr-list/PendUdrList',
},
{
  name: '已核保任务',
  refName: 'underwritingAlreadyList',
  tableObj: "udrObj",
  url: '/pcis-new-udr-list/PendUdrList',
}
]