<template>
  <el-dialog v-model="dialogVisible" width="90%" class="system-dialog-scroll">
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  saveKindInfo,
} from "@/api/prod";
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
const SysOrgIeempWdconfigAddComponent = defineAsyncComponent(() => import("./sys-org-ieemp-wdconfig-add.component.vue"));
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '网点管理',
    fromUi: {
      cols: 2
    },
		endBtnsPosition: "center",
		endBtns: [
			createFreeButtonBase({
				type: "primary",
				label: "新增",
        position: 'btn-left',
				func: async () => {
					dzmodal.open(SysOrgIeempWdconfigAddComponent).then(() => {});
				},
			}),
			createFreeButtonBase({
				type: "primary",
				label: "查询",
        position: 'btn-left',
				func: async () => {
					save()
				},
			})
		],
    fromSchema: [
      {
        prop: 'CCde',
        title: '网点编码',
        inputtype: "rtinput"
      },
      {
        prop: 'CInfo',
        title: '网点名称',
        inputtype: "rtinput"
      },

      // {
      //   prop: "CIsValid",
      //   inputtype: "rtswitch",
      //   title: "是否有效",
      //   keymap: {
      //     y: "1",
      //     n: "0",
      //   },
      //   activeText: '有效',
      //   inactiveText: '无效',
      //   inlinePrompt: true,
      //   func: (val) => {
      //     console.log(val);
      //   },
      // }
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
		editFlag: true,
		editList: ["cStatus"],
		fromSchema: [
    {
        prop: 'CCde',
        title: '网点编码',
        inputtype: "rtinput"
      },
      {
        prop: 'CInfo',
        title: '网点名称',
        inputtype: "rtinput"
      },
      {
        prop: "CIsValid",
        inputtype: "rtswitch",
        title: "是否有效",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: '有效',
        inactiveText: '无效',
        inlinePrompt: true,
        func: (val) => {
          console.log(val);
        },
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

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>
