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
    console.log(getRules);
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '资金退票审核',
    fromSchema: [
      {
        prop: "submitBtn",
        inputtype: "rtselect",
        typeCode: "",
        title: "收款人姓名",
        disabled: true,
      },
      {
        prop: 'CAcctNo',
        title: '收款人账号',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: "CBankRelTyp",
        inputtype: "rtselect",
        title: "收款银行大类",
        typeCode: "",
        disabled: true,
      },
      {
        prop: "CBankPro",
        inputtype: "rtselect",
        title: "开户行省",
        typeCode: "",
        disabled: true,
      },
      {
        prop: "CBankArea",
        inputtype: "rtselect",
        title: "开户行市",
        typeCode: "",
        disabled: true,
      },
      {
        prop: "CBankCounty",
        inputtype: "rtselect",
        title: "开户行县",
        typeCode: "",
        disabled: true,
      },
      {
        prop: "CBankCde",
        inputtype: "rtselect",
        title: "开户银行",
        typeCode: "",
        disabled: true,
      },  
      {
        prop: "CBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号"
      },
      {
        prop: 'CBankAddr',
        title: '开户行地址',
        inputtype: "rtinput"
      },
      {
        prop: 'CPubPri',
        title: '对公对私',
        inputtype: "rtinput",
        disabled: true,
      },
      {
        prop: 'CStatus',
        title: '状态',
        inputtype: "rtselect",
        rules: [getRules("required", {
          trigger: 'change'
        })],
        loadData :[
          { label:'同意',value:1 },
          { label:'不同意',value:0 },
        ]
      },
      {
        prop: 'CCheckOpn',
        title: '审核意见',
        type: 'textarea',
        inputtype: "rtinput"
      }
    ]
  })
);
onMounted(async () => {
  if (props.type === "check" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});


/** 提交审核 */
function saveSubmit(obj) {
	freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
      const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
      const prm = obj + '|' + props.data['CCustSeq'];
      if (obj === 'commit') {
        const saveFormData = Object.assign({CStatus: '1'}, s);
        const returnData = finService.saveFinReback({param: prm, banckTraVOList: [saveFormData]});
        returnData.then((res: any) => {
            if (null != res && null != res['code']) {
                if (res['code'] === 200) {
                    ElMessage.success(res['msg']);
                }else {
                    ElMessage.warning(res['msg']);
                }
            }
        }, error => {
            console.log('出错了', error);
            ElMessage.error('后台服务异常,请联系管理员');
        });
      }
		} else {
			ElMessage.error("请填写必填项");
		}
	})
}

</script>

<style scoped></style>
