<template>
  <el-dialog v-model="dialogVisible" width="90%" title="缴费类型转换">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '保存',
            func: () => {
              save();
            },
          }"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { useUserStore } from "@/store/modules/user";
import {
    isReadScene
} from '@/constants/tab-constants';
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { PcisQueryService } from '../service/pcis-query-service';
const pcisQueryService = new PcisQueryService();
const props = defineProps({
  data: Object,
  type: String,
});
const userStore = useUserStore();
const user = ref(userStore.user);
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
let payTypCodeParam = {};


const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '',
    fromSchema: [
    {
          prop: "CRegDptCde",
          inputtype: "rtselect",
          title: "机构",
          // typeCode: "PLYDPT_LIST",
          disabled: true,
          // codeParam: { 'CDptCde': user.value['companyId'] },
          func: (val) =>{
            console.log("qqqqqqqqqq", val)
            // let s = freeEditRef.value?.getFromSchemaItem('cProdNo')
            // s['params'] = {'CRegDptCde': val, 'cStatus': '1'};
            // s['typeCode'] = 'PROD_LIST';
          }
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_IN_GUIDE",
        // params: {'cStatus': '1'},
      },
      {
        prop: "CPayTyp",
        inputtype: "rtselect",
        title: "缴费类型",
        typeCode: "CHARGE_TYPE_CACHE",
        params: payTypCodeParam,
        rules: [getRules("required", {trigger: 'change'})],
        
      },
      {
        prop: "CAppTyp",
        inputtype: "rtselect",
        title: "申请类型",
        disabled: true,
        loadData :[
          { label:'投保',value:"A" },
          { label:'批改',value:"E" },
        ]
      },
      {
        prop: 'CAppNo',
        title: '投保单号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CPlyNo',
        title: '生成保批单号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CUniqueNo',
        title: '收据流水号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CCardNo',
        title: '卡号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CChqueNo',
        title: '支票号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'TBgnTm',
        title: '保险起期',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        type: "daterange",
        disabled: true,
      },
      {
        prop: 'TEndTm',
        title: '保险止期',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        type: "daterange",
        disabled: true,
      },
      {
        prop: 'TEndTm',
        title: '核保时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        type: "daterange",
        disabled: true,
      },
      {
        prop: 'TChargeTm',
        title: '保批单生成时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        type: "daterange",
        disabled: true,
      },
      {
        prop: 'TPlyedrPrnTm',
        title: '打印时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        type: "daterange",
        disabled: true,
      },
      {
        prop: 'NPayAmt',
        title: '实收保费',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'NTax',
        title: '车船税',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'NPrm',
        title: '实收金额',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'TPayConfTm',
        title: '缴费确认时间',
        inputtype: "rtinput",
        format: 'YYYY-MM-DD HH:mm:ss',
        disabled: true,
      },
      {
        prop: 'CBankcode',
        title: '开户行',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CProvinces',
        title: '省',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CCity',
        title: '市',
        inputtype: "rtinput",
        disabled: true,
      }
    ]
  })
);
onMounted(async () => {
  //if (parameter.scene && isReadScene(parameter.scene)) {
     // payTypCodeParam = {'cCde': [ '2', '3', '5',     '99']};
  //} else {
      payTypCodeParam = {'cCde': [ '2', '3', '5',    '99']};
  //}
  if (props.type === "check" && props.data) {
    nextTick(()=>{
      const param = {
        'CUniqueNo': props.data.CUniqueNos,
      };  
      loadPayConfirmInfo(param);    
    })
  }
});

function loadPayConfirmInfo(param: any) {
  pcisQueryService.loadPayConfirmInfo(param).then((res: any) => {
      if (null != res && null != res['code']) {
          if (res['code'] === 200) {
              const data = res['data'];
              console.log("eeeeeeee", data)
              const newdata = {};
              Object.keys(data).forEach((key) => {
                  const k = firstCharUpper(key);
                  newdata[k] = data[key];
              });
              freeEditRef.value?.setFormValue(newdata);
          }
      }
  }, error => {
      this.msg.error('连接失败！' + error, {nzDuration: 5000});
  });  
}
/** 保存 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      // if (this.CRelAppNos) {
      //   ElMessage.warning('所选单据包含联合单，必须联合进行缴费类型转换，是否合并转换？')
      // }
      let s = freeEditRef.value?.getFromValue(); //获取表单数据
      //const param = Object.assign({ type: props.type }, s);
      const typeandno = [
          {
              CPayTyp:s.CPayTyp,
              CUniqueNo:props.data.CUniqueNos
          }
      ];
      const param = {
        typeandno: typeandno,
        UserId: user.value['opCde']   
      };
      console.log(param)
      pcisQueryService.changePayType(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            emits("ok", {});
            ElMessage.success("保存成功");
            dialogVisible.value = false;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}
/**
 * 首字母转换大写
 * @param {string} str
 * @returns {string}
 */
function  firstCharUpper(str: string) {
    return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2;
    });
}
</script>

<style scoped></style>
