<template>
  <el-dialog v-model="dialogVisible" width="90%" title="账户信息修改">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
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
import { createFreeButtonBase } from "@/shared/button-config";
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
import { FinService } from './service/fin.service';
import { useUserStore } from "@/store/modules/user";
import { cloneDeep } from "lodash-es";
const userStore = useUserStore();
const user = ref(userStore.user);
const finService = new FinService();
const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

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
    title: '账户信息修改',
    endBtnsPosition: "right",
		endBtns: [
    createFreeButtonBase({
				type: "primary",
				label: "读取银行卡",
        position: 'btn-left',
				func: async () => {
					console.log("读取银行卡")
				},
			}),
			createFreeButtonBase({
				type: "primary",
				label: "提交审核",
				func: async () => {
					console.log("提交审核")
          saveSubmit('commit');
				},
			})
		],
    fromSchema: [
      {
        prop: "",
        inputtype: "rtselect",
        typeCode: "",
        title: "收款人姓名",
        rules: [getRules("required", {})],
        disabled: true,
      },
      {
        prop: '',
        title: '收款人账号',
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "收款银行大类",
        rules: [getRules("required", {})],
        typeCode: "",
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行省",
        rules: [getRules("required", {})],
        typeCode: "",
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行市",
        rules: [getRules("required", {})],
        typeCode: "",
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行县",
        rules: [getRules("required", {})],
        typeCode: "",
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户银行",
        rules: [getRules("required", {})],
        typeCode: "",
        disabled: true,
      },  
      {
        prop: "",
        inputtype: "rtinput",
        title: "CNAPS号"
      },
      {
        prop: '',
        title: '开户行地址',
        inputtype: "rtinput"
      },
      {
        prop: '',
        title: '对公对私',
        inputtype: "rtinput",
        disabled: true,
      }
    ]
  })
);
const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
    title: "审核修改记录",
    isPage: true,
		fromSchema: [
			{
				prop: "CCustSeq",
				inputtype: "rtinput",
				title: "业务唯一流水号",
			},
			{
				prop: "CPlyNo",
				inputtype: "rtinput",
				title: "保单号",
			},
			{
				prop: "CEdrNo",
				inputtype: "rtinput",
				title: "批单号",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "账户名",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "账户",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "提交人",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "提交时间",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "操作类型",
			},
			{
				prop: "",
				inputtype: "rtinput",
				title: "审批意见",
			}
		],
	})
);
onMounted(async () => {
  if (props.type === "update" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
      handleQuery(true);
    }, 50);
  }
});
/** 查询 */
function handleQuery(flag?: boolean) {
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	//const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign({}, r, {
    currentUser: user.value['opCde'],
    currentUserOrg: user.value['companyId'],
    cId: props.data['CId'],
    cCustSeq: props.data['CCustSeq'],    
  });	
	finService.getEditFinReback(param)
		.then((res) => {
			const { code, data, msg } = res;
			if (200 === code) {
				pageresult.list = [];
				pageresult.list = data.data;
				pageresult.total = data.total;
			} else {
				ElMessage.error(msg);
			}
		})
		.finally(() => {});
}

/** 保存 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign({ type: props.type }, formParam);
      finService.saveFinReback(param)
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
/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  // if (showBtnConfig.value) {
  //   s["showExBtn"] = "1";
  // } else {
  //   s["showExBtn"] = "0";
  // }
  if (s) {
    const param = Object.assign(s);
    // if (props.type === "edit") {
    //   param["cPkId"] = props.data.cPkId;
    // }
    // if (freeEditRefBtn.value) {
    //   let btnjson = freeEditRefBtn.value?.getFromValue();
    //   btnjson.initid = uuidv4().replace(/-/g, "");
    //   param["btn"] = btnjson;
    // }
    // if (tableRef.value) {
    //   const tabjson = tableRef.value?.getFromValue();
    //   let selectList = tabjson.filter((item: any) => item.isChecked === "1");
    //   param["tabjson"] = selectList;
    // }
    return param;
  }
}
</script>

<style scoped></style>
