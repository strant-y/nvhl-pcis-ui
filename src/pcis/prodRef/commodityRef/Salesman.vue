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



const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");


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
          // handleSave();
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "机构代码",
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
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "add-responsibility",
    //     label: "公共问题新增",
    //     type: "success",
    //     func: function () {
    //       dzmodal.open(publicProblem, { type: "add", data: {} }).then((res) => {
    //         if (res.type === "ok") {
    //           handleQuery();
    //         }
    //       });
    //     },
    //   }),
    // ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    // tableBtn: [
    //   createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "删除",
    //     icon: "Delete",
    //     link: true,
    //     tableClick: (row) => {
    //       //   delRiskRel(row)
    //       //     .then((res) => {
    //       //       const { code, data, msg } = res;
    //       //       if (200 === code) {
    //       //         ElMessage.success("删除成功");
    //       //         handleQuery();
    //       //       } else {
    //       //         ElMessage.error(msg);
    //       //       }
    //       //     })
    //       //     .finally(() => {});
    //     },
    //   }),
    // ],
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
        inputtype: "rtinput",
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
          // console.log('111',row)
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

/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据


console.log(user.value)

console.log(props.data)

const obj = {
  CurrentUser: user.value ? user.value["opCde"] : "",   // 用户代码
  CurrentUserOrg: user.value ? user.value["companyId"] : "", // 用户机构代码

        CBsnsTyp: props.data['cBsnsTyp'],
        CBrkrCde: props.data['cBrkrCde'],
        CSlsTyp: props.data['cSlsTyp'],
        CChaType: props.data['cChaType'],
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
     
        // pageresult.total =2
        // pageresult.list = [{CSlsCde:122,CSlsNme:"张三", },{CSlsCde:123,CSlsNme:"张三2"}];
      }
    });
}
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
