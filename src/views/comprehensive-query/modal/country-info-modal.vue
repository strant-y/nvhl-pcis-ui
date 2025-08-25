<!-- 地点查询 弹框 -->

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
const route = useRoute();
const query = ref(route.query);
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo, getPageList, selCountryPort, addCountryPort } from "@/api/prod";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean;
  data: object
}>();

const emit = defineEmits<{
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "地点查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          handleQuery();
        },
      }),
      // createFreeButtonBase({
      //   type: "primary",
      //   label: "新增",
      //   func: () => {
      //     addFunc();
      //   },
      // }),
    ],
    fromSchema: [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }
      
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
    isPage:'true',
    fromSchema: [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }
    ],
    rowDbClickFun(rowData) {
      dialogVisible.value = false;
      emit("ok", rowData);

    },
  })
);

// 添加校验
const validateForm = (formData) => {
  const chinesePattern = /^[\u4e00-\u9fa50-9()（）,，.。、\- ]+$/;
  const englishPattern = /^[a-zA-Z0-9(),. \-]+$/;

  for (const field of formconfig.fromSchema) {
    const { prop, title } = field;
    let value = formData[prop]; 
    if (value === null || value === undefined) {
      value = '';
    }
    const trimmedValue = String(value).trim(); // 转为字符串并去空格

    // 条件1：检查是否有有效值（null/空字符串/纯空格都算无效）
    if (!trimmedValue) {
      ElMessage.error(`请填写${title}`);
      return false;
    }

    if (prop.endsWith('Cn')) {
      // 中文校验
      if (!chinesePattern.test(trimmedValue)) {
        ElMessage.error(`${title}包含无效字符，请使用中文及常见符号`);
        return false;
      }
    } else if (prop.endsWith('En')) {
      // 英文校验
      if (!englishPattern.test(trimmedValue)) {
        ElMessage.error(`${title}包含无效字符，请使用英文及常见符号`);
        return false;
      }
    }
  }

  // 所有校验通过
  return true;
};


// 新增
const addFunc = () => {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  if ( validateForm(s)) {
  const param = { ...s }
  addCountryPort(param)
    .then((res) => {
      const { code, data, msg, totalCount } = res;
      if (200 == code) {
          ElMessage.success(msg);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });

     }
  
}


/** 查询 */
function handleQuery(reset = true) {
  // const r = tableRef.value?.getPartnerPage(); //获取分页数据
  // const s = freeEditRef.value?.getFromValue(); //获取表单数据
  // const param = {...r,...s }
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  let param = Object.assign(s, r);
  selCountryPort(param)
    .then((res) => {
      const { code, data, msg, total } = res;
      if (200 == code) {
        pageresult.list = data;
        pageresult.total = total

      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

onMounted(() => {
  if(props.data?.whichType === 'A'){
    formconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }

    ]
    tableconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }
    ]
  }else if(props.data?.whichType === 'B') {
    formconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }
    ]
    tableconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      }
    ]

  }else if(props.data?.whichType === 'C'){
    formconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cAirportCn",
        inputtype: "rtinput",
        title: "机场中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      },
      {
        prop: "cAirportEn",
        inputtype: "rtinput",
        title: "机场英文名称",
      },
    ]
    tableconfig.fromSchema = [
      {
        prop: "cCountryCn",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "cPortCn",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "cAirportCn",
        inputtype: "rtinput",
        title: "机场中文名称",
      },
      {
        prop: "cCountryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
      },
      {
        prop: "cPortEn",
        inputtype: "rtinput",
        title: "港口英文名称",
      },
      {
        prop: "cAirportEn",
        inputtype: "rtinput",
        title: "机场英文名称",
      },
    ]
  }
  nextTick(()=>{
handleQuery()
  })
    
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