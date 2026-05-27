<!--商品配置-出单权限分配-业务员--> 
<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <!-- @selection-change="handleSelectionChange" -->
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
  
    />
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
import { descryptParameter, encryptParameter } from "@/utils/encipher";


const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
const route = useRoute();
const query = ref(route.query);

const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}"); 


import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo } from "@/api/prod";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();


import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref<any>(userStore.user);

const props = defineProps<{
  // visible: boolean;
  data: {
        type: Object,
        default: () => ({}),
    },
}>();
// const props = defineProps<{
//   data: Object;
//   type: string;
//   visible: boolean;
// }>();


const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "业务员",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
         
             handleQuery(true);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "机构代码",
         disabled: true,
      },
      {
        prop: "CSlsCde",
        inputtype: "rtinput",
        title: "业务员工号",
      },
      {
        prop: "CSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    fromSchema: [
      {
        prop: "CSlsCde",
        inputtype: "rtinput",
        title: "业务员员工号",
      },
      {
        prop: "CSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
      },
      {
        prop: "CSlsTyp",
        inputtype: "rtSelectV2",
        typeCode: "PERSONNEL_LIST",
        title: "人员分类",
      },
      {
        prop: "CDptName", 
        inputtype: "rtinput",
        title: "所在部门",
      },
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "所在部门代码",
      },
      {
        prop: "CTel",
        inputtype: "rtinput",
        title: "联系电话",
      },
      {
        prop: "CProdNme",
        inputtype: "rtinput",
        title: "邮箱",
      },
    ],
    rowDbClickFun(row) {
          emit("ok", row);
          dialogVisible.value = false;
        }
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

onMounted(() => {
    nextTick(()=>{
        setValue('CDptCde',props.data['cDptCde'])
        handleQuery(true);
    })

})
// cDptCde
/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据

const obj = {
  CurrentUser: user.value ? user.value["opCde"] : "",   // 用户代码
  CurrentUserOrg: user.value ? user.value["companyId"] : "", // 用户机构代码

        CBsnsTyp: props.data['cBsnsTyp'],
        CBrkrCde: props.data['cBrkrCde'],
        CSlsTyp: props.data['cSlsTyp'],
        CChaType: props.data['cChaType'],
				CChaSubtype: props.data['cChaSubtype'],
        CDptAttr: props.data['cDptAttr'],
        subSidiary: props.data['subSidiary'],
        leading: props.data['leading'],

  // CDptCde: formData.value["CDptCde"],   // 业务员代码
  // CSlsNme: formData.value["CSlsNme"],   // 名称
  // CSlsCde: formData.value["CSlsCde"],    // 工号
  // CBsnsTyp: tab2["cBsnsTyp"],  //渠道类别
  // CChaType: tab2["cChaType"],  // 渠道中类
  // CSlsTyp: formData.value["CSlsTyp"],   // 人员分类
  // leading: "CSlsId",   // 业务分类
  // CBrkrCde: tab2["cBrkrCde"],  // 代理人/经纪人

};
const params = Object.assign(s, r, obj);

console.log('参数',params) 
policyService.getWebOrgSelsList(params).then((res: any) => {
      if (res && res["code"] === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageresult.list = pageData.result;
        }
      }
    });
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
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


</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
