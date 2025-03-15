<template>
  <el-dialog v-model="dialogVisible" width="90%" title="反洗钱扩展信息">
		<appExtendInfo/>
		<insExtendInfo/>
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
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType, position } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
const appExtendInfo = defineAsyncComponent(() => import("./app-extend-info/app-extend-info.vue"));
const insExtendInfo = defineAsyncComponent(() => import("./ins-extend-info/ins-extend-info.vue"));
import {
  getButtonByFacKey,
  getFactorList,
  getInputGroupList,
  saveFactor,
  saveKindInfo,
} from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  creatCardConfig,
} from "@/shared/mytemplate/card-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";

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
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
const freeEditRef3 = ref<AppFreeEditMethod | null>(null);
const freeEditRef4 = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
const cardConfig = reactive<CardConfig>(
	creatCardConfig({
		title: '投保人-法人扩展信息',
		showMyfromBtm: true
	})
)
const formconfig = {
    fromUi: {
      cols: 2
    },
		shadow:false,
    fromSchema: [
      {
        prop: 'CPlanNo',
        title: '方案号',
        inputtype: "rtinput"
      },
      {
        prop: 'CPlanNme',
        title: '方案名称',
        inputtype: "rtinput"
      }
    ]
}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig(Object.assign(formconfig, {
    title: '控股股东或实际控制人：',
	}))
);
const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig(Object.assign(formconfig, {
    title: '法定代表人：',
	}))
);
const formconfig3 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig(Object.assign(formconfig, {
    title: '负责人：',
	}))
);
const formconfig4 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig(Object.assign(formconfig, {
    title: '授权代理人：',
	}))
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
		title:'投保人-客户受益所有人',
		isPage: 'false',
		titleBtns: [
			createFreeButtonBase({
				type: "primary",
				label: "新增",
				func: async () => {
					console.log('新增')
				},
			}),
			createFreeButtonBase({
				type: "primary",
				label: "删除",
				func: async () => {
					console.log('删除')
				},
			})			
		],
		fromSchema: [
			{
				prop: "",
        inputtype: "rtinput",
				title: "序号",
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "姓",
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "名",
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "证件类型",				
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "证件号码",				
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "证件有效起期",				
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "证件有效止期",				
			},
			{
				prop: "",
        inputtype: "rtinput",
				title: "地址",				
			}
		],
	})
);
onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
/** 查询 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign({ type: props.type }, formParam);
      saveKindInfo(param)
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

/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (showBtnConfig.value) {
    s["showExBtn"] = "1";
  } else {
    s["showExBtn"] = "0";
  }
  if (s) {
    const param = Object.assign(s);
    if (props.type === "edit") {
      param["cPkId"] = props.data.cPkId;
    }
    if (freeEditRefBtn.value) {
      let btnjson = freeEditRefBtn.value?.getFromValue();
      btnjson.initid = uuidv4().replace(/-/g, "");
      param["btn"] = btnjson;
    }
    if (tableRef.value) {
      const tabjson = tableRef.value?.getFromValue();
      let selectList = tabjson.filter((item: any) => item.isChecked === "1");
      param["tabjson"] = selectList;
    }
    return param;
  }
}
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	pageresult.list = [{
		cOpgrpCnm: '角色名称',
		cName: '图表名称',
		cType: '1',
		cCode: '1',
	}];
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign(s, r);	
	sysRolechatsMgrService.searchPlan(param)
		.then((res) => {
			const { code, data, msg } = res;
			if (200 === code) {
				pageresult.list = [];
				pageresult.list = data.result;
				pageresult.total = data.total;
			} else {
				//ElMessage.error(msg);
			}
		})
		.finally(() => {});
}
</script>

<style scoped></style>
