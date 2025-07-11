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
  //核保员-暂存任务
  saveObj: {
    fromSchema: [
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
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      }
    ],
  },
  //核保员-修改单
  editObj: {
    fromSchema: [
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "险种",
      },
      {
        prop: "cAppStatus",
        inputtype: "rtinput",
        title: "状态",
      }
    ],
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
}
]