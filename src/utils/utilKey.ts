const typeMap = reactive<Record<string, Array<any>>>({
  rtinput: [
    {
      label: "text",
      value: "text",
    },
    {
      label: "textarea",
      value: "textarea",
    },
    {
      label: "password",
      value: "password",
    },
    {
      label: "desensitization",
      value: "desensitization",
    },
    {
      label: "color",
      value: "color",
    },
    {
      label: "number",
      value: "number",
    },
    {
      label: "%",
      value: "percent",
    },
    {
      label: "‰",
      value: "permill",
    },
  ],
  rtradio: [
    {
      label: "defult",
      value: "defult",
    },
    {
      label: "button",
      value: "button",
    },
  ],
  rtcheckboxgroup: [
    {
      label: "defult",
      value: "defult",
    },
    {
      label: "button",
      value: "button",
    },
  ],
  rttag: [
    {
      label: "primary",
      value: "primary",
    },
    {
      label: "success",
      value: "success",
    },
    {
      label: "info",
      value: "info",
    },
    {
      label: "warning",
      value: "warning",
    },
    {
      label: "danger",
      value: "danger",
    },
  ],
  rtdatepicker: [
    {
      label: "month",
      value: "month",
    },
    {
      label: "year",
      value: "year",
    },
    {
      label: "date",
      value: "date",
    },
    {
      label: "datetime",
      value: "datetime",
    },
  ],
});

const yesOrNo = [
  {
    label: "是",
    value: "1",
  },
  {
    label: "否",
    value: "0",
  },
];
const showLocation = [
  {
    label: "表格中",
    value: "1",
  },
  {
    label: "表单中",
    value: "0",
  },
  {
    label: "隐藏",
    value: "2",
  },
  {
    label: "折叠栏",
    value: "3",
  },
];
const position = [
  {
    label: "left",
    value: "left",
  },
  {
    label: "right",
    value: "right",
  },
  {
    label: "center",
    value: "center",
  },
];
const freeCol = [
  {
    label: "1列",
    value: 1,
  },
  {
    label: "2列",
    value: 2,
  },
  {
    label: "3列",
    value: 3,
  },
  {
    label: "4列",
    value: 4,
  },
  {
    label: "6列",
    value: 6,
  },
  {
    label: "8列",
    value: 8,
  },
  {
    label: "12列",
    value: 12,
  },
];
const size = [
  {
    label: "large",
    value: "large",
  },
  {
    label: "default",
    value: "default",
  },
  {
    label: "small",
    value: "small",
  },
];
const componentType = [
  {
    label: "表单",
    value: "free",
  },
  {
    label: "表格",
    value: "grid",
  },
  {
    label: "自定义",
    value: "custom",
  },
];
const showtype = [
  {
    label: "合并整列",
    value: "rowspan",
  },
  {
    label: "显示要素名",
    value: "text",
  },
  {
    label: "显示组件",
    value: "prop",
  },
]
const inputtype = [
  {
    label: "input",
    value: "rtinput",
  },
  {
    label: "select",
    value: "rtselect",
  },
  {
    label: "selectV2",
    value: "rtSelectV2",
  },
  {
    label: "cascader",
    value: "rtcascader",
  },
  {
    label: "number",
    value: "rtnumber",
  },
  {
    label: "datepicker",
    value: "rtdatepicker",
  },
  {
    label: "switch",
    value: "rtswitch",
  },
  {
    label: "radio",
    value: "rtradio",
  },
  {
    label: "tag",
    value: "rttag",
  },
  {
    label: "checkbox",
    value: "rtcheckbox",
  },
  {
    label: "checkboxgroup",
    value: "rtcheckboxgroup",
  },
  {
    label: "inputgroup",
    value: "rtinputgroup",
  },
  {
    label: "table",
    value: "rttable",
  },
];
const dateType = [
  {
    label: "日",
    value: "date",
  },
  {
    label: "时间",
    value: "datetime",
  },
  {
    label: "年",
    value: "year",
  },
  {
    label: "月",
    value: "month",
  },
];

const JBPMState = [
{
  value: "0",
  label: "未接收",
},
{
  value: "1",
  label: "已接收",
},
{
  value: "2",
  label: "暂存",
},
{
  value: "3",
  label: "已完成",
},
{
  value: "4",
  label: "已撤回",
},
{
  value: "5",
  label: "已解除接收",
},
{
  value: "6",
  label: "已退回",
},
{
  value: "7",
  label: "已申请改派",
},
{
  value: "8",
  label: "已委托",
},
{
  value: "10",
  label: "已重做",
},
{
  value: "11",
  label: "已上报",
},
];
export {
  yesOrNo,
  size,
  inputtype,
  componentType,
  typeMap,
  freeCol,
  dateType,
  position,
  showtype,
  showLocation,
  JBPMState,
};
