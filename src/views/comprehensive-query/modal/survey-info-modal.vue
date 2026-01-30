<!-- 检验代理人 查勘代理人 弹框 -->
<template>
  <el-dialog v-model="dialogVisible" title="" width="80%" @update:model-value="handleVisibleUpdate">
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" @selection-change="handleSelectionChange" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <!-- <el-button type="primary" @click="handleSave">保存</el-button> -->
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { carSelCountryPort } from "@/api/prod";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
//   const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
const route = useRoute();
const query = ref(route.query);
//   const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { useValidator } from "@/typings/useValidator";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";


const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean;
  data: object
}>();
let cAddrData:any = null;
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "查勘代理人",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        // type: "primary",
        icon: "RefreshRight",
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAddr",
        inputtype: "rtselect",
        title: "大洲",
        typeCode: "Continent",
         clearable: true,
        func: (row: any) => {
          cAddrData = row;
          if (row) {
            codeListStore.queryCodeList({
              codeListName: "Continent_Country",
              codeListParam: {cAddr: row},
            }).then((res) => {
              setFormItem('cAraCde', { loadData: res })
            });
          } else {
            setFormItem('cAraCde', { loadData: [] })
          }
          setValue('cAraCde','')
        },
      },
      {
        prop: "cAraCde",
        inputtype: "rtselect",
        title: "国家",
         clearable: true,
        func: (row: any) => {
          if (row) {
            codeListStore.queryCodeList({
              codeListName: "Country_City",
              codeListParam: {cAddr: cAddrData, cAraCde: row},
            }).then((res) => {
              setFormItem('cCtyCnm', { loadData: res })
            });
          } else {
            setFormItem('cCtyCnm', { loadData: [] })
          }
          setValue('cCtyCnm','')
        }
      },
      {
        // prop: "cSrvyCde",
        prop: "cCtyCnm",
        inputtype: "rtselect",
        title: "城市",
         clearable: true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};

const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    fromSchema: [
      {
        prop: "cSrvyCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "编码",
      },
      {
        prop: "cAddr",
        inputtype: "rtinput",
        title: "大洲",
      },
      {
        prop: "cAraCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "国家",
      },
      {
        prop: "cCtyCnm",
        inputtype: "rtinput",
        title: "城市",
      },
      {
        prop: "cWhlAraMrk",
        // inputtype: "rtinput",
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        title: "全境代理人",
      },
      {
        prop: "cSryDoc",
        inputtype: "rtinput",
        title: "代理人信息",
      },
    ],
    rowDbClickFun(rowData) {
      console.log('选中数据', rowData)
      dialogVisible.value = false;
      emit("ok", rowData);
    },
  })
);
/** 查询 */
function handleQuery(reset = true) {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = { ...r, ...s }
  carSelCountryPort(param).then((res) => {
    const { code, data, msg ,total} = res;

    console.log('返回数据', data)
    if (200 === code) {
      pageresult.list = data;
      pageresult.total =total

    } else {
      ElMessage.error(msg);
    }
  })
    .finally(() => { });
}
onMounted(() => {
});

//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>