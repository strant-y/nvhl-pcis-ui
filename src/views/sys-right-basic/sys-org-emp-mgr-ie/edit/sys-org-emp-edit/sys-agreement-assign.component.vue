<template>
  <div class="app-container">
    <el-dialog v-model="dialogVisible" width="90%" :title="props.title">
      <div>
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRefDialog" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
          @page-change="handleQuery(false)" @selection-change="handleSelectionChange"/>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
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
import { SysOrgEmpMgrService } from '@/views/sys-right-basic/service/sys-org-emp-mgr.service';

const props = defineProps({
  data: Object,
  type: String,
  title: String,
  cDptCde: String, //机构代码
  cEmpCde: String, //员工代码
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const sysOrgEmpMgrService = new SysOrgEmpMgrService();

const freeEditRefDialog = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
// 1. 创建响应式变量追踪 cType
const currentCType = ref('1'); // 默认值与表单初始值保持一致
// 2. 使用计算属性动态返回按钮文本
const addBtnLabel = computed(() => {
  return currentCType.value == '1' ? '删除' : '保存';
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRefDialog.value?.resetFields()
          freeEditRefDialog.value?.setValue('cEcOperId', props?.cEmpCde)
          freeEditRefDialog.value?.setValue('cType', '1')
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cEcOperId",
        inputtype: "rtinput",
        title: "外部出单员编码",
        disabled: true,
      },
      {
        prop: "cEcAgrNo",
        inputtype: "rtinput",
        title: "协议号",
      },
      {
        prop: "cType",
        inputtype: "rtselect",
        title: "已关联协议单",
        loadData: [{ value: '0', label: '否' }, { value: '1', label: '是' }],
        func: (val: string) => {
          currentCType.value = val;
          handleQuery(true);
        }
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
const tableconfig = computed(()=>
  createTableEditConfig({
    editFlag: true,
    editList: ["cIsValid"],
    showSelection:true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: addBtnLabel.value,
        type: currentCType.value === '1' ? 'danger' : 'success',
        func: handleTitleBtnClick,
      }),
    ],
    fromSchema: [
      {
        prop: "cEcOperId",
        inputtype: "rtinput",
        title: "外部出单员 id"
      },
      {
        prop: "cEcAgrNo",
        inputtype: "rtinput",
        title: "协议号",
      },
      {
        prop: "cEnableStatus",
        inputtype: "rtinput",
        title: "状态",
        formatter: (val: string) => {
          const cSex = [{ value: '1', label: '启用' }, { value: '0', label: '禁用' }]
          const result = cSex.find(item => item.value === val);
          return result ? result.label : val;
        }
      },
      {
        prop: "cCrtCde",
        inputtype: "rtinput",
        title: "创建人",
      },
      {
        prop: "tCrtTm",
        inputtype: "rtinput",
        title: "创建时间",
      },
      {
        prop: "cUpdCde",
        inputtype: "rtinput",
        title: "修改人",
      },
      {
        prop: "tUpdTm",
        inputtype: "rtinput",
        title: "修改时间",
      },
    ],
  })
);

onMounted(async () => {
  nextTick(() => {
    freeEditRefDialog.value?.setValue('cEcOperId', props?.cEmpCde)
    freeEditRefDialog.value?.setValue('cType', '1')
    handleQuery(true);
  })
});

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRefDialog.value?.validate().then((isValid: any) => {
    if (!isValid) {
      return false;
    } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRefDialog.value?.getFromValue(); //获取表单数据
			const param = Object.assign(s, r);
      sysOrgEmpMgrService.queryOcExtOperRel(param)
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

/** 表格选中 */
const multipleSelection:any = ref([]);
function handleSelectionChange(val: any[]){
  multipleSelection.value = val;
};

/** 保存或者删除方法 */
const handleTitleBtnClick = async () => {
  if (currentCType.value === '1') {
    const confirmed = await askConfirm('此操作将永久删除该记录，是否继续？', '删除确认');
    if (confirmed) {
      
      const param ={
        cPkIds: multipleSelection.value.map((item: any) => item.cPkId)
      }
      debugger
      sysOrgEmpMgrService.logicalDeleteOcExtOperRel(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          emits("ok", {});
          ElMessage.success(msg || "删除成功");
          dialogVisible.value = false;
        } else {
          ElMessage.error(msg);
        }
      })
    }
  } else {
    const confirmed = await askConfirm('确认要保存当前数据吗？', '保存确认');
    if (confirmed) {
      const param ={
        items: multipleSelection.value.map((item: any) => ({
          ...item, // 展开原有对象的所有属性
          cEcOperId: props?.cEmpCde // 覆盖或新增 cEcOperId 的值
        }))
      }
      sysOrgEmpMgrService.batchSaveOcExtOperRel(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          emits("ok", {});
          ElMessage.success(msg || "保存成功");
          dialogVisible.value = false;
        } else {
          ElMessage.error(msg);
        }
      })
    }
  }
};

// 封装一个通用的确认函数
const askConfirm = async (message: string, title = '操作确认') => {
  try {
    await ElMessageBox.confirm(message, title, { 
      confirmButtonText: '确定', 
      cancelButtonText: '取消', 
      type: 'warning' 
    });
    return true; // 用户点击确认
  } catch {
    return false; // 用户点击取消
  }
}
</script>

<style scoped></style>
