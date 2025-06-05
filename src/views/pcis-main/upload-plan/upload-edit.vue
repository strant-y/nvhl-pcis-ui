<template>
  <el-dialog v-model="dialogVisible" width="90%" title="批量导入">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @selection-change="handleSelectionChange"
      />
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
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { useUserStore } from "@/store/modules/user";
const policyService = new PolicyService();
const userStore = useUserStore();
const user = ref(userStore.user);
const props = defineProps({
  data: Object,
  type: String,
});
const multipleSelection = ref([]);
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
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
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNme",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
        //rules: [getRules("required", {})],
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "WEB_SYS_STA_DICT",
        params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
      }
    ],
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
    isPage: false,
    showSelection: true,
    isRadio: true,
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "导入",
        func: async () => {
          if (multipleSelection.value.length < 1 ) {
            ElMessage.warning('请选择一条方案');
            return ;
          }
          //待补充
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "下载模板",
        func: async () => {
          if (multipleSelection.value.length < 1 ) {
            ElMessage.warning('请先选择方案');
            return ;
          }
          const planName = multipleSelection.value[0].cPlanNme;
          const cPlanNo = multipleSelection.value[0].cPlanNo;
          const param = {planName: planName, CPlanNo: cPlanNo, CType: 'planList'};
          policyService.excelDown(param)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                console.log("qqqqq", data)
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => { });
          },
      }),
    ],
		fromSchema: [
			{
				prop: "cPlanNme",
        inputtype: "rtinput",
				title: "方案名称",
			},
			{
				prop: "cDesc",
        inputtype: "rtinput",
				title: "方案说明",
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
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val;
};
/** 查询 */
function handleQuery(flag = true) {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      pageresult.list = [{
        cPlanNme: 'cPlanNme',
        cDesc: 'cDesc',
        cPlanNo: 'cPlanNo'
      },{
        cPlanNme: 'cPlanNme2',
        cDesc: 'cDesc2',
        cPlanNo: 'cPlanNo2'        
      }]
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
      const param = Object.assign(s, r, {
        companyId: user.value['companyId']
      });
      policyService.searchPlanPolicy(param)
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
        .finally(() => { });
    }
  });
}
</script>

<style scoped></style>
