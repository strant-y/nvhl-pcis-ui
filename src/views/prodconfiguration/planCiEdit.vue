<template>
  <el-dialog v-model="dialogVisible" title="" width="80%" @update:model-value="handleVisibleUpdate">
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="handleCancel">返回</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
// import { ElMessage } from "element-plus";
import { savePlanCiInfo } from "@/api/prod"; // api接口
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const props = defineProps<{
  data: Object;
  type: string;
  visible: boolean;
}>();

// const props = defineProps<{
//   data: Object;
//   type: string;
// }>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
let para = []; //银行大类 list

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "方案共保信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "nSeqNo",
        // inputtype: "rtselect",
        inputtype: "rtnumber",
        title: "序号",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cCiAgrmntNo",
        inputtype: "rtinput",
        title: "共保协议号",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cMajorAgrmntMrk",
        inputtype: "rtselect",
        title: "主从协议标志",
        // clearable: true,
        readOnly: true,
        // disabled: true,
        loadData: [
          { value: '0', label: '主协议' }, { value: '1', label: '从协议' }
        ],

      },
      {
        prop: "cCoinsurerCde",
        inputtype: "rtselect",
        typeCode: 'Comm_Code_LIST',
        codeParam: { 'CParCde': '327' },
        title: "共保人",
        rules: [getRules("required", { change: true })],
        func: (val: any) => {
          if (!val) {
            return;
          }
          ciSubCompOnChangeHandle(val)
        }
      },
      {
        prop: "cCiSubComp",
        inputtype: "rtselect",
        title: "共保子公司",
        func: (val: any) => {
          console.log(val)
          // {"codeListName":"CDptCde_List","codeListParam":{"CDptCde":"0237020000000","cParCde":"0237020000000"}}
          if (val) {
            //   setFormItem("cDptCde", {
            //   // readOnly
            //   // clearable: false,
            //   // readOnly: true,

            // })

            setFormItem("cDptCde", {
              disabled: false,
              typeCode: 'CDptCde_List_Cache',
              codeParam: { "CDptCde": val, cParCde: val },
            });


            // 【出单机构】设置为 只读

          }



        }
        // rules: [getRules("required", { change: true })],   // 处理完这块code  注释解开 必填项这是
      },
      {
        prop: "cChiefMrk",
        inputtype: "rtselect",
        title: "主共标志",
        typeCode: 'WEB_SYS_STA_DICT',
        codeParam: { 'cParCde': 'yes_no' },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIssueMrk",
        inputtype: "rtselect",
        title: "出单标志",
        rules: [getRules("required", { change: true })],
        loadData: [
          {
            label: "启用",
            value: "1",
          },
          {
            label: "禁用",
            value: "0",
          },
        ],
      },
      {
        prop: "nCiShare",
        inputtype: "rtnumber",
        precision: 6,
        title: "共保比例",

        rules: [getRules("required", { change: true })],
      },
      {
        prop: "nPlyFeeRate",
        inputtype: "rtnumber",
        precision: 6,
        title: "出单费率",
        // rules: [getRules("required", { change: true })],
      },


      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "出单机构",
        typeCode: 'cDptCde_List',
        // param: { 'cParCde': 'yes_no' },
      },
      {
        prop: "cJiMrk",
        inputtype: "rtselect",
        title: "主从联标识",

        loadData: [{ value: '1', label: '主联' }, { value: '0', label: '从联' }],
      },
      {
        // prop: "cRiskNo",
        // inputtype: "rtselect",
        // title: "责任选择",
        // typeCode: "term_risk_list",
        prop: "cAcctNo",
        inputtype: "rtinput",
        title: "账号",
        func: (val: any) => {

        }
      },
      {
        prop: "cAcctNme",
        inputtype: "rtinput",
        title: "账户名",
        func: (val: any) => {

        }
      },
      {
        prop: "cBankRelTyp",
        inputtype: "rtselect",
        // typeCode: "SELECT_CBANKRELTYP",SELECT_CBANKRELTYP
        typeCode: 'CBankRelTypList',
        clearable: true,
        title: "收款银行大类",
        func: (val: any) => {
          if (!val) {
            return false
          }
          para = val.split('_');
          const bankname = para[1];  	// 银行名称
          const isdefault = para[2]; 	// 是否默认值
          const banktype = para[3];  	// 银行大类
          console.log(para)
          if (val == null || val == undefined) {
            return
          }
          // 1直连银行 开户行 省、市、对公对私必填   0是非直联，开户行 省、市、区/县、开户行、对公对私必填
          //   setFormItem("cBankPro", {
          //   rules: [getRules("required", {})],
          // });
          // return false
          // setValue("cBankPro", '')
          // setValue("cBankArea", '')
          // setValue("cBankCounty", '')

          if (isdefault === '1') {
            setFormItem("cBankPro", {
              disabled: false,
              rules: [getRules("required", {})],
            });
            setFormItem("cBankArea", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCounty", {
              disabled: true,
              rules: null,
            });

            setFormItem("cBankCde", {
              // disabled: true,
              rules: null,
            });


          } else {
            setFormItem("cBankPro", {
              rules: [getRules("required", {})],
            });
            setFormItem("cBankArea", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCounty", {
              disabled: true,
              rules: [getRules("required", {})],
            });

            setFormItem("cBankCde", {
              disabled: true,
              rules: [getRules("required", {})],
            });



            // setFormItem("cPubPri", {
            //   rules: [getRules("required", {})],
            // });
          }

          // 清空开户行

          // setValue("cBankPro",'')
          // setValue("cBankArea",'')
          // setValue("cBankCounty",'')
          setFormItem("cBankCde", {
            disabled: true,
          });
        },
        // }
      },
      {
        prop: "cBankPro",
        inputtype: "rtselect",
        title: "开户行省",
        typeCode: "CBankProList",
        disabled: true,
        func: (val: any) => {

          setFormItem("cBankArea", {
            disabled: false,
            // typeCode: 'CBankAreaList',
            codeParam: { 'areaprovince': val },
            // rules: [getRules("required", {})],
          });
          // setValue("cBankArea", null)
          // setValue("cBankCounty", null)
        }
      },
      {
        prop: "cBankArea",
        inputtype: "rtselect",
        typeCode: 'CBankAreaList',
        title: "开户行市",
        disabled: true,
        func: (val: any) => {
          if (val) {
            setFormItem("cBankCounty", {

              // typeCode: 'CBankCountyList',
              codeParam: { 'areaname': val },
              disabled: false,
              // rules: [getRules("required", {})],
            });
          }

        }
      },
      {
        prop: "cBankCounty",
        inputtype: "rtselect",
        typeCode: 'CBankCountyList',
        title: "开户行县",
        disabled: true,
        func: (val: any) => {
          if (val) {
            setFormItem("cBankCde", {
              disabled: false,
              typeCode: 'CBankCdeList',
              codeParam: { 'banktypecod': para[3], 'areacode': val },
              // rules: [getRules("required", {})],
            });
          }
        }
      },
      {
        prop: "cBankCde",
        inputtype: "rtselect",

        disabled: true,
        title: "开户银行",
      },
      {
        prop: "cBankAddr",
        inputtype: "rtinput",
        title: "开户行地址",
      },
      {
        prop: "cBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号",
      },
      // {
      //   prop: "CUseDpt",
      //   inputtype: "rtinput",
      //   title: "共同代理人",
      // },
      // {
      //   prop: "CUseDpt",
      //   inputtype: "rtselect",
      //   title: "联共保业务",
      // },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
        loadData: [{ value: '1', label: '有效' }, { value: '0', label: '无效' }]
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = () => {

  const formData = freeEditRef.value?.getFromValue();
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      try {
        savePlanCiInfo(formData); // 调用保存接口
        ElMessage.success("保存成功");
        emits("ok", {});
        dialogVisible.value = false;

      } catch (error) {
        ElMessage.error("保存失败");
      }
    }

  })


};

const handleCancel = () => {
  dialogVisible.value = false;
};


const ciSubCompOnChangeHandle = (value: string) => {
   // 若选择的是我司
  if ('327001' === value) {

    //  共保子公司 根据内容查询
    setFormItem("cCiSubComp", {
      typeCode: 'Comm_Code_LIST',
      // "CParCde":"subdpt","cParCde":"327001"}
      // codeParam
      codeParam: { "CParCde": "subdpt", cParCde: "327001" },
    });



    // 【出单机构】设置为 只读
    setFormItem("cDptCde", {

      typeCode: '',
      disabled: false,
    })
  } else {
    // 共保子公司 设置为其他
    setValue('cCiSubComp', '')
    setFormItem("cCiSubComp", {
      // typeCode: "Cvrg_LIST",
      loadData: [{ value: '1', label: '其他' }]
    });

    // 【出单机构】设置为 只读
    setValue('cDptCde', '')
    setFormItem("cDptCde", {
      // readOnly
      // clearable: false,
      // readOnly: true,
      disabled: true,
    })
  }
}


onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});


//给表单下拉项赋值
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
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
  return formconfig;
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

<style scoped>
/* 确保样式与现有组件一致 */
</style>
