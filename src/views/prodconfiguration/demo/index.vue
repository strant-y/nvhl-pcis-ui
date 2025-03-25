<!-- 用户管理 -->
<template>
  <div class="app-container">
    <!-- <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" /> -->
    <app-free-edit :freeEditConfig="formconfig" ref="freeEditRef" />
    <!-- <app-grid-edit :gridEditConfig="gridconfig" ref="gridEditRef" /> -->
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
defineOptions({
  name: "User",
  inheritAttrs: false,
});
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
  GridFromUiConfig,
} from "@/shared/app-grid-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const gridEditRef = ref<AppGridEditMethod | null>(null);

const checkgroup11input = (rule: any, value: any, callback: any) => {
  const r = freeEditRef.value?.getFromValue();
  if (r["group11input"]) {
    callback();
  } else {
    callback("请输入分组1-1");
  }
};

const gridcheck = (rule: any, value: any, callback: any) => {
  const r = gridEditRef.value?.getFromValue();
  if (r && r.length > 0) {
    callback();
  } else {
    callback("请选择需要的数据");
  }
};

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "用户信息",
    production: true,
    productionTitle: "提示",
    showMyfromBtm: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "按钮",
        func: () => {},
      }),
    ],
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          const r = await freeEditRef.value.validate();
          console.log(r);
          console.log(freeEditRef.value?.getFromValue());
        },
      }),
      createFreeButtonBase({
        label: "取消",
        buttonColor: "#774ef7",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "name",
        inputtype: "rtinput",
        title: "这是input",
        showExBtn: true,
        btnWidth: 30,
        rules: [getRules("required", {})],
        btnItems: createFreeButtonBase({
          label: "测试塞值",
          buttonColor: "#774ef7",
          func: function () {
            freeEditRef.value?.setFormValue({
              name: "test",
              tableName: [
                {
                  name: "test",
                  date: "2022-01-01",
                  number: 100,
                  select: "1",
                  tag1: "2",
                },
                {
                  name: "test",
                  date: "2022-01-01",
                  number: 123,
                  selectInput: "10",
                  select: "2",
                  tag1: "1",
                },
                {
                  name: "test2",
                  date: "2022-01-02",
                  number: 223,
                },
              ],
            });
          },
        }),
      },
      {
        inputtype: "rtinputgroup",
        title: "这是inputgroup",
        itemWidth: 2,
        groupList: [
          {
            prop: "g-select1",
            inputtype: "rtselect",
            typeCode: "cIndustryTyp",
            func: (v: any, p: any) => {
              console.log(v, p);
            },
            persent: 3,
          },
          {
            prop: "g-select2",
            inputtype: "rtselect",
            typeCode: "cIndustryTyp",
            func: (v: any, p: any) => {
              console.log(v, p);
            },
            persent: 3,
          },
          {
            prop: "g-select3",
            inputtype: "rtselect",
            typeCode: "cIndustryTyp",
            func: (v: any, p: any) => {
              console.log(v, p);
            },
            persent: 3,
          },
          {
            prop: "g-select4",
            inputtype: "rtselect",
            typeCode: "cIndustryTyp",
            func: (v: any, p: any) => {
              console.log(v, p);
            },
            persent: 3,
          },
          {
            prop: "g-group12input",
            inputtype: "rtinput",
            title: "分组1-2",
            rules: [{ validator: checkgroup11input, trigger: "blur" }], // 自定义校验事例
            group: "group1",
            persent: 4,
          },
        ],
      },
      {
        prop: "cascaderarea",
        inputtype: "rtcascader",
        title: "这是cascader",
        // rules: [required()],
        typeCode:'getarealist',
        // codeParam:{cParCde:'0',value:'1'},
        loadData:[{"label":"中国","value":"1"},{"label":"日本","value":"2"}],
        cascaderprops:['Contry','Prod','City','Town'],
        showExBtn: true,
        maxlevel:3,
        btnWidth: 30, 
        btnItems: createFreeButtonBase({
          label: "测试塞值",
          func: function () {
            // freeEditRef.value?.setValue('cascaderarea',['1', '120000', '120102', '120102']);
            const t = freeEditRef.value?.getFromValue();
            console.log(t);
          },
        }),
      },
      {
        prop: "tableName",
        inputtype: "rttable",
        title: "这是一个可编辑的表格",
        // showSelection: true,  // 是否显示多选框
        editFlag: true,
        showExpand: true, // 是否显示扩展折叠按钮
        fromUi: createFromUiConfig({
          cols: 2,
        }),
        fromSchema: [
          {
            prop: "name",
            inputtype: "rtinput",
            title: "这是input",
            rules: [{ validator: checkgroup11input, trigger: "blur" }],
          },
          {
            prop: "select",
            inputtype: "rtSelectV2",
            title: "这是select",
            tag: true,
            loadData: [
              {
                label: "主险",
                value: "1",
                color: "#FF6600",
              },
              {
                label: "附加险",
                value: "2",
                color: "#14CCCC",
              },
            ],
          },
          {
            prop: "tag1",
            inputtype: "rttag",
            title: "显示tag",
            loadData: [
              {
                label: "主险",
                value: "1",
                color: "#FF6600",
              },
              {
                label: "附加险",
                value: "2",
                color: "#14CCCC",
              },
            ],
          },
          {
            prop: "date",
            inputtype: "rtdatepicker",
            title: "这是datepicker",
            // rules: [required()],
            expand: true,
          },
          {
            prop: "kaiguan",
            inputtype: "rtswitch",
            title: "这是编辑表格内的",
            inactiveText: "否",
            activeText: "是",
            expand: true,
          },
          {
            prop: "selectInput",
            inputtype: "rtselect",
            typeCode: "cIndustryTyp",
            title: "这是select",
            expand: true,
          },
          {
            prop: "cvrgType",
            inputtype: "rtselect",
            title: "险别类型",
            tag: true,
            loadData: [
              {
                label: "主险",
                value: "1",
                color: "#FF6600",
              },
              {
                label: "附加险",
                value: "2",
                color: "#14CCCC",
              },
            ],
            expand: true,
          },
          {
            prop: "grouinput",
            inputtype: "rtcheckbox",
            title: "单选框",
            type: "button",
            group: "group2",
            keymap: {
              y: "1",
              n: "2",
            },
            showExBtn: true,
            btnWidth: 20,
            btnItems: createFreeButtonBase({
              label: "测试",
              buttonColor: "#774ef7",
              func: () => {},
            }),
            expand: true,
          },
          {
            prop: "number",
            inputtype: "rtnumber",
            title: "这是number",
            prefix: "$",
            suffix: "元",
          },
          {
            prop: "otherdatepicker",
            inputtype: "rtdatepicker",
            type: "datetime",
            // type: "daterange", //时间组件,可以直接选择时间区间
            title: "这是时间组件",
            disabledDate: (time: Date) => {
              return time.getTime() > Date.now();
            },
            shortcuts: [
              {
                text: "今天",
                value: new Date(),
              },
              {
                text: "昨天",
                value: () => {
                  const date = new Date();
                  date.setTime(date.getTime() - 3600 * 1000 * 24);
                  return date;
                },
              },
              {
                text: "一周前",
                value: () => {
                  const date = new Date();
                  date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                  return date;
                },
              },
            ],
          },
          {
            prop: "radiogro1",
            inputtype: "rtradio",
            title: "单选框",
            expand: true,
            loadData: [
              {
                label: "单选1",
                value: "1",
              },
              {
                label: "单选2",
                value: "2",
              },
              {
                label: "单选3",
                value: "3",
              },
              {
                label: "单选4",
                value: "4",
              },
            ],
          },
          {
            prop: "cgrp23",
            inputtype: "rtcheckboxgroup",
            title: "多选框",
            group: "group2",
            expand: true,
            loadData: [
              {
                label: "多选1",
                value: "1",
              },
              {
                label: "多选2",
                value: "2",
              },
              {
                label: "多选3",
                value: "3",
              },
              {
                label: "多选4",
                value: "4",
              },
              {
                label: "多选5",
                value: "5",
              },
              {
                label: "多选6",
                value: "6",
              },
            ],
          },
        ],
      },
      {
        prop: "select1",
        inputtype: "rtselect",
        title: "这是select",
        itemWidth: 1.5,
        // rules: [validorMap()required()],
        typeCode: "cIndustryTyp",
        func: (v: any, p: any) => {
          console.log(v, p);
        },
        // 如果想给输入框增加后置按钮,可这样新增,input组件同样支持
        // showExBtn: true,
        // btnItems: createFreeButtonBase({
        //   label: "取消",
        //   buttonColor: "#774ef7",
        //   func: () => {},
        // }),
      },
      {
        prop: "email",
        inputtype: "rtnumber",
        title: "这是number",
        prefix: "$",
        suffix: "元",
        precision: 2,
        step: 0.5,
      },
      {
        prop: "cascader",
        inputtype: "rtcascader",
        title: "这是cascader",
      },
      {
        prop: "iconinput",
        inputtype: "rtinput",
        type: "icon",
        title: "这是icon选择器",
      },
      {
        prop: "phone",
        inputtype: "rtdatepicker",
        //type: "daterange", 时间组件,可以直接选择时间区间
        title: "这是时间组件",
        disabledDate: function (time: Date) {
          return time.getTime() > Date.now();
        },
        // rules: [required()],
        shortcuts: [
          {
            text: "今天",
            value: new Date(),
          },
          {
            text: "昨天",
            value: () => {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              return date;
            },
          },
          {
            text: "一周前",
            value: () => {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              return date;
            },
          },
        ],
      },
      {
        prop: "ggafea",
        inputtype: "rtdatepicker",
        type: "datetime",
        title: "还没想好名字",
      },
      {
        prop: "kaiguan",
        inputtype: "rtswitch",
        title: "这是开关",
        inactiveText: "否",
        activeText: "是",
        // inlinePrompt: true,  显示文本是否显示在内部
      },
      {
        prop: "group11input",
        inputtype: "rtradio",
        title: "分组1-1",
        size: "small",
        // type: "button",
        loadData: [
          {
            label: "单选1",
            value: "1",
          },
          {
            label: "单选2",
            value: "2",
          },
          {
            label: "单选3",
            value: "3",
          },
          {
            label: "单选4",
            value: "4",
          },
          {
            label: "单选5",
            value: "5",
          },
          {
            label: "单选6",
            value: "6",
          },
        ],
        group: "group1",
      },
      {
        prop: "group12input",
        inputtype: "rtinput",
        title: "分组1-2",
        rules: [{ validator: checkgroup11input, trigger: "blur" }], // 自定义校验事例
        group: "group1",
      },
      {
        prop: "group21input",
        inputtype: "rtcheckbox",
        title: "分组2-1",
        type: "button",
        group: "group2",
        keymap: {
          y: "1",
          n: "2",
        },
        showExBtn: true,
        btnWidth: 20,
        btnItems: createFreeButtonBase({
          label: "测试",
          buttonColor: "#774ef7",
          func: () => {
            freeEditRef.value?.setValue("group21input", "1");
          },
        }),
      },
      {
        prop: "group22input",
        inputtype: "rtinput",
        title: "分组2-2",
        group: "group2",
        func: () => {
          freeEditRef.value?.setValue("group21input", "1");
        },
      },
      {
        prop: "group23input",
        inputtype: "rtcheckboxgroup",
        title: "分组2-3",
        group: "group2",
        // type: "button",
        loadData: [
          {
            label: "多选1",
            value: "1",
          },
          {
            label: "多选2",
            value: "2",
          },
          {
            label: "多选3",
            value: "3",
          },
          {
            label: "多选4",
            value: "4",
          },
          {
            label: "多选5",
            value: "5",
          },
          {
            label: "多选6",
            value: "6",
          },
        ],
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
      groupBy: [
        { id: "group1", title: "基本信息1" },
        { id: "group2", title: "基本信息2" },
      ],
    }),
    superFromShow: "高级查询",
    superFromClose: "高级查询",
    superFromSchema: [
      {
        prop: "name",
        inputtype: "rtinput",
        title: "姓名",
        type: "password",
        showPassword: true,
        prefixIcon: "Message",
        suffixIcon: "Check",
      },
      {
        prop: "age",
        inputtype: "rtinput",
        type: "textarea",
        title: "这是文本域",
        rows: 3,
      },
      {
        prop: "email",
        inputtype: "rtinput",
        title: "邮箱",
        appendIcon: "Check",
        prependIcon: "Message",
      },
      {
        prop: "phone",
        inputtype: "rtinput",
        title: "电话",
        // rules: [required(), phoneNo()],
      },
    ],
    // 如需额外设置form表单样式,可在这里新增 /如果不设置,为了保持样式一致性,与from表单,使用一样的样式配置,默认使用from表单样式
    // superFromUi: createFromUiConfig({
    //   cols: 2,
    //   labelWidth: "100px",
    // }),
  })
);

const gridconfig = reactive<AppGridEditConfig>(
  createAppGridEditConfig({
    title: "险别信息",
    production: true,
    productionTitle: "提示",
    showMyfromBtm: true,
    // showSelection: true,  // 是否显示多选框
    editFlag: true, //是否可以编辑
    showExpand: true, // 是否显示扩展折叠按钮
    tableBtnType: "icon",
    tableBtnWidth: "200",
    tableBtnPosition: "left",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "按钮",
        func: function () {
          gridEditRef.value?.setFormValue([
            {
              name: "test",
              date: "2022-01-01",
              number: 100,
              select: "1",
              tag1: "2",
            },
            {
              name: "test",
              date: "2022-01-01",
              number: 123,
              selectInput: "10",
              select: "2",
              tag1: "1",
            },
            {
              name: "test2",
              date: "2022-01-02",
              number: 223,
            },
          ]);
        },
      }),
    ],
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async function () {
          const r = await gridEditRef.value.validate();
          console.log(r);
          console.log(gridEditRef.value.getFromData());
        },
      }),
      createFreeButtonBase({
        label: "取消",
        buttonColor: "#774ef7",
        func: function () {},
      }),
    ],
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        label: "按钮",
        icon: "House",
        iconColor: "#ff0011",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "按鈕2",
        icon: "FullScreen",
        func: function () {},
      }),
    ],
    fromSchema: [
      {
        prop: "name",
        inputtype: "rtinput",
        title: "这是input",
        // rules: [required()],
      },
      {
        prop: "select",
        inputtype: "rtSelectV2",
        title: "这是select",
        tag: true,
        width: "150",
        loadData: [
          {
            label: "主险",
            value: "1",
            color: "#FF6600",
          },
          {
            label: "附加险",
            value: "2",
            color: "#14CCCC",
          },
        ],
      },
      {
        prop: "tag1",
        inputtype: "rttag",
        title: "显示tag",
        width: "150",
        loadData: [
          {
            label: "主险",
            value: "1",
            color: "#FF6600",
          },
          {
            label: "附加险",
            value: "2",
            color: "#14CCCC",
          },
        ],
      },
      {
        prop: "date",
        inputtype: "rtdatepicker",
        title: "这是datepicker",
        // rules: [required()],
        expand: true,
      },
      {
        prop: "kaiguan",
        inputtype: "rtswitch",
        title: "这是编辑表格内的",
        inactiveText: "否",
        activeText: "是",
        expand: true,
      },
      {
        prop: "selectInput",
        inputtype: "rtselect",
        typeCode: "cIndustryTyp",
        title: "这是select",
        // rules: [required("change")],
        expand: true,
      },
      {
        prop: "cvrgType",
        inputtype: "rtselect",
        title: "险别类型",
        tag: true,
        loadData: [
          {
            label: "主险",
            value: "1",
            color: "#FF6600",
          },
          {
            label: "附加险",
            value: "2",
            color: "#14CCCC",
          },
        ],
        expand: true,
      },
      {
        prop: "grouinput",
        inputtype: "rtcheckbox",
        title: "单选框",
        type: "button",
        group: "group2",
        keymap: {
          y: "1",
          n: "2",
        },
        showExBtn: true,
        btnWidth: 20,
        btnItems: createFreeButtonBase({
          label: "测试",
          buttonColor: "#774ef7",
          func: () => {},
        }),
        expand: true,
      },
      {
        prop: "number",
        inputtype: "rtnumber",
        title: "这是number",
        prefix: "$",
        suffix: "元",
      },
      {
        prop: "otherdatepicker",
        inputtype: "rtdatepicker",
        type: "datetime",
        // type: "daterange", //时间组件,可以直接选择时间区间
        title: "这是时间组件",
        disabledDate: function (time: Date) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            value: new Date(),
          },
          {
            text: "昨天",
            value: () => {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              return date;
            },
          },
          {
            text: "一周前",
            value: () => {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              return date;
            },
          },
        ],
      },
      {
        prop: "radiogro1",
        inputtype: "rtradio",
        title: "单选框",
        expand: true,
        loadData: [
          {
            label: "单选1",
            value: "1",
          },
          {
            label: "单选2",
            value: "2",
          },
          {
            label: "单选3",
            value: "3",
          },
          {
            label: "单选4",
            value: "4",
          },
        ],
      },
      {
        prop: "cgrp23",
        inputtype: "rtcheckboxgroup",
        title: "多选框",
        group: "group2",
        expand: true,
        loadData: [
          {
            label: "多选1",
            value: "1",
          },
          {
            label: "多选2",
            value: "2",
          },
          {
            label: "多选3",
            value: "3",
          },
          {
            label: "多选4",
            value: "4",
          },
          {
            label: "多选5",
            value: "5",
          },
          {
            label: "多选6",
            value: "6",
          },
        ],
      },
    ],
    fromUi: createGridFromUiConfig({
      cols: 3,
    }),
  })
);

const formconfig1 = reactive<AppFreeEditConfig>(createAppFreeEditConfig({}));

import { formInit } from "@/shared/from-init";
onMounted(async () => {
  const param = await fetch("/param/param.json");
  const str = await param.text();
  const formconfig11 = formInit(str, method, exRules);
  console.log(formconfig11);
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },

  submit: async () => {
    const r = await freeEditRef.value.validate();
    console.log(r);
    console.log(freeEditRef.value?.getFromValue);
  },
  setTbaleValue: () => {
    freeEditRef.value?.setFormValue({
      name: "test",
      edittable: [
        {
          date: "2022-01-01",
          number: 100,
          select: "1",
          tag1: "2",
        },
        {
          name: "test",
          date: "2022-01-01",
          number: 123,
          selectInput: "10",
          select: "2",
          tag1: "1",
        },
        {
          name: "test2",
          date: "2022-01-02",
          number: 223,
        },
      ],
    });
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};
</script>

<style scoped></style>
