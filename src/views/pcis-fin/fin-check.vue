<template>
  <el-dialog v-model="dialogVisible" width="90%" :title="'资金退票审核'">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '提交',
            func: () => {
              saveSubmit('commit');
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
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { cloneDeep } from "lodash-es";
import { FinService } from './service/fin.service';
const finService = new FinService();

const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

// 绑定方法
const method = {
  func1: () => {
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '资金退票审核',
    fromSchema: [
      {
        prop: "cAcctNme",
        inputtype: "rtselect",
        typeCode: "",
        title: "收款人姓名",
        disabled: true,
      },
      {
        prop: 'cAcctNo',
        title: '收款人账号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: "cBankRelTyp",
        inputtype: "rtselect",
        title: "收款银行大类",
        typeCode: 'CBankRelTypList',
        disabled: true,
      },
      {
        prop: "cBankPro",
        inputtype: "rtinput",
        title: "开户行省",
        typeCode: "CBankProList",
        disabled: true,
      
      },
      {
        prop: "cBankArea",
        inputtype: "rtinput",
        title: "开户行市",
        disabled: true,
      },
      {
        prop: "cBankCounty",
        inputtype: "rtselect",
        title: "开户行县",
        disabled: true,

      },
      {
        prop: "cBankCde",
        inputtype: "rtselect",
        title: "开户银行",
        disabled: true,
      },  
      {
        prop: "cBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号",
        disabled: true,
      },
      {
        prop: 'cBankAddr',
        title: '开户行地址',
        disabled: true,
        inputtype: "rtinput"
      },
      {
        prop: 'cPubPri',
        title: '对公对私',
        inputtype: "rtselect",
        disabled: true,
        loadData: [
          { label: "对公", value: "1" },
          { label: "对私", value: "2" },
        ],
      },
      {
        prop: 'cStatus',
        title: '状态',
        inputtype: "rtselect",
        rules: [getRules("required", {
          trigger: 'change'
        })],
        loadData :[
          { label:'同意',value:'2' },
          { label:'不同意',value:'3' },
        ]
      },
      {
        prop: 'cCheckOpn',
        title: '审核意见',
        type: 'textarea',
        inputtype: "rtinput"
      }
    ]
  })
);
onMounted(async () => {
  if (props.type === "check" && props.data) {


    nextTick(() => {
   

          setFormItem("cBankCounty", {
              typeCode: 'CBankCountyList',
              codeParam: { 'areaname':  props.data.cBankArea},
            });

      freeEditRef.value?.setFormValue(props.data);
      setValue('cStatus',null);

    })
  }
});


/** 提交审核 */
function saveSubmit(obj) {

	freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
      const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
      const prm = obj + '|' + props.data['cCustSeq'];
      if (obj === 'commit') {
        const returnData = finService.comitFinReback({param: prm, banckTraVOList: [s]});
        returnData.then((res: any) => {
            if (null != res && null != res['code']) {
                if (res['code'] === 200) {
                          
                    emits("ok", {});
                    ElMessage.success(res['msg']);
                    dialogVisible.value = false;
                }else {
                    ElMessage.warning(res['msg']);
                }
            }
        }, error => {
            ElMessage.error('后台服务异常,请联系管理员');
        });
      }
		} else {
			ElMessage.error("请填写必填项");
		}
	})
}


//给表单下拉项赋值
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
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
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
})
</script>

<style scoped></style>
