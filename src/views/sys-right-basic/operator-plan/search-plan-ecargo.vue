<template>
  <el-dialog v-model="dialogVisible" width="90%" title="Ecargo操作员方案配置" class="system-dialog-scroll">
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
        @selection-change="handleSelectionChange"
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
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { SysOperatorPlanService } from '@/views/sys-right-basic/service/sys-operator-plan.service';

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
const dialogVisible = ref(true);
const policyService = new PolicyService()
const sysOperatorPlanService = new SysOperatorPlanService()
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const multipleSelection = ref([]);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '',
    fromUi: {
      cols: 2
    },
		endBtnsPosition: "center",
		endBtns: [
			createFreeButtonBase({
				type: "primary",
				label: "查询",
				func: async () => {
					handleQuery();
				},
			})
		],
    fromSchema: [
      {
        prop: 'cPlanNo',
        title: '方案号',
        inputtype: "rtinput"
      },
      {
        prop: 'cPlanNme',
        title: '方案名称',
        inputtype: "rtinput"
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        typeCode: "KIND_LIST_GRT",
        params: {'cStatus': '1'},
        title: "产品大类",
        func: (val, option)=>{
          // let s = freeEditRef.value?.getFromSchemaItem('cProdNo')
          // s['params'] = {'cParCde': '', 'cKindNo': val};
        }
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        params: {'cParCde': ''},
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
    showSelection: true,
		fromSchema: [
			{
				prop: "cPlanNo",
        inputtype: "rtinput",
				title: "方案号",
			},
			{
				prop: "cPlanNme",
        inputtype: "rtinput",
				title: "方案名称",
			},
			{
				prop: "cDesc",
        inputtype: "rtinput",
				title: "描述",
			}
		],
	})
);
onMounted(async () => {
  if (props.type === "update" && props.data) {
    nextTick(()=>{
      freeEditRef.value?.setFormValue(props.data);
    })
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val;
};
/** 保存 */
function save() {
  if (multipleSelection.value.length < 1 ) {
    ElMessage.warning('请至少选中一条方案！');
    return ;
  }
  let cPlanNoList = '';
  multipleSelection.value.forEach(item => {
    cPlanNoList = !!cPlanNoList ? cPlanNoList + ',' + item['cPlanNo'] : item['cPlanNo'];
  });
  console.log("cPlanNoList", cPlanNoList)
  const param = {
    cChaEmpCde: props.data.cChaEmpCde,
    cDptCde: props.data.cDptCde ,
    cPlanNoList: cPlanNoList
  };
  sysOperatorPlanService.saveEcargoOperatorPlanList(param)
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
}
/** 查询 */
function handleQuery(flag?: boolean) {
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign(s, r, {
    cPlanMrk: '3'
  });	
	policyService.searchPlan(param)
		.then((resp) => {
			const { code, res, msg } = resp;
			if (200 === code) {
				pageresult.list = [];
				pageresult.list = res.result;
				pageresult.total = res.total;
			} else {
				ElMessage.error(msg);
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
