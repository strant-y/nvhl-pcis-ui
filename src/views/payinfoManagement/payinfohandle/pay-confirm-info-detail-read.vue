<template>
  <el-dialog v-model="dialogVisible" width="90%" title="缴费信息详情查看">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '返回',
            func: () => {
              dialogVisible = false
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { useUserStore } from "@/store/modules/user";
import { PcisQueryService } from '../service/pcis-query-service';
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const userStore = useUserStore();
const user = ref(userStore.user);
const pcisQueryService = new PcisQueryService();

const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '',
    fromSchema: [
      {
				prop: "CRegDptCde",
				inputtype: "rtselect",
				title: "机构",
        typeCode: "PLYDPT_LIST",
        disabled: true,
				params: { 'CDptCde': user.value['companyId'] }, 
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
        disabled: true,
        // params: {'cStatus': '1'},
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
        title: '申请单号',
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
        disabled: true,

      },
      {
        prop: 'TEndTm',
        title: '保险止期',
        inputtype: "rtdatepicker",
        disabled: true,

      },
      {
        prop: 'TUdrTm',
        title: '核保时间',
        // inputtype: "rtdatepicker",
        inputtype: "rtinput",
        format: 'YYYY-MM-DD HH:mm:ss',
        disabled: true,
        
      },
      {
        prop: 'TPlEdrMakeTm',
        title: '保批单生成时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:MM:SS',
        disabled: true,
        
      },
      {
        prop: 'TPlyedrPrnTm',
        title: '打印时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        disabled: true,
        
      },
      {
        prop: 'NPayAmt',
        title: '实收金额',
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
        title: '实收保费',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'TPayConfTm',
        title: '缴费确认时间',
        inputtype: "rtdatepicker",
        format: 'YYYY-MM-DD HH:mm:ss',
        disabled: true,
      },
      {
        prop: 'NStampTax',
        title: '印花税',
        inputtype: "rtinput",
        disabled: true,
      }
    ]
  })
);
onMounted(async () => {
  if (props.type === "view" && props.data) {
    nextTick(()=>{
      // freeEditRef.value?.setFormValue(props.data);
      // const param = {
      //   'CUniqueNo': props.data.CUniqueNo,
      //   'CurrentUser': user.value['opCde']
      // };
        const param = {
            'CUniqueNo': props.data.cUniqueNo,
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
      ElMessage.error('连接失败！' + error);
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
