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
      label: "color",
      value: "color",
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
  {
    label: "cascaderarea",
    value: "rtcascaderarea",
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
};
