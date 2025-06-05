<!--商品配置-出单权限分配-出单员-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
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
import { saveRiskInfo ,getPageList} from "@/api/prod";
// import {  } from "@/api/code-list-service";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok",data:Object): void;
}>();
// const emits = defineEmits(["ok", "cancel"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "出单员",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          // save();
          handleQuery();
          // refreshData();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "slsNme",
        inputtype: "rtinput",
        title: "出单员名称",
      },
      {
        prop: "slsCde",
        inputtype: "rtinput",
        title: "出单员代码",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

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
    // createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "选择",
    //     icon: "Edit",
    //     link: true,
    //     tableClick: (row) => {


    //       emit("ok",row);
    //       dialogVisible.value=false;
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
        prop: "cSlsCde",
        inputtype: "rtradio",
        title: "编号",
      },
      {
        prop: "cSlsCde",
        inputtype: "rtinput",
        title: "出单员代码",
      },
      {
        
        prop: "cSlsNme",
        inputtype: "rtinput",
        title: "出单员名称",
      },
      // {
      //   prop: "CProdNme",
      //   title: "人员分类",
      // },
      // {
      //   prop: "CProdNme",
      //   title: "执业证号",
      // },
      {
        prop: "cMobile",
        inputtype: "rtinput",
        title: "联系电话",
      },
      // {
      //   prop: "CProdNme",
      //   title: "邮箱",
      // },
      {
        
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "所在部门",
      },
      // {
      //   prop: "CProdNme",
      //   title: "部门代码",
      // },
      // {
      //   prop: "CProdNme",
      //   title: "电话",
      // },
    ],
    rowDbClickFun:(row: any)=>{
              emit("ok",row);
          dialogVisible.value=false;
    }
  })
);
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const c = { codeListName: "WEB_ORG_OPER_DPT_ALL" };
  // const param = Object.assign(s, r,c,{
  //   // "slsTyp": "020004",
  //   // "type": "operAll",
  // });

  const param = Object.assign(c, {
    codeListParam: s,
    r,
    // parCde: s.cMidCde,
  });

  console.log('参数',param)
  getPageList(param)
    .then((res) => {
      const { code, data, msg,totalCount } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = totalCount
   
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}



const save = async (flag?: boolean)=>{
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  // param.cProdNo = props.data.data.cProdNo;

  console.log(param, '参数')
  await getPageList("WEB_ORG_OPER_DPT_ALL",param); //保存接口调用
}

// 刷新表格数据
  const refreshData = (reset = false)=> {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  console.log( param)
  // return false;
        // 查询参数
        // let slsCde =freeEditRef.value?.getFromValue()['cSlsCde'];
        // let slsNme =freeEditRef.value?.getFromValue()['cSlsNme'];
        // // 传参数 空字符串
        // if ('' === slsCde) {
        //     slsCde = null;
        // }
        // if ('' === slsNme) {
        //     slsNme = null;
        // }
        // const dptCde = this.data.dptCde;
        // const chaType = this.data.chaType;
        // const brkrCde = this.data.brkrCde;
        // const type = this.data.type;
        // let slsTyp = '';
        // if (chaType === '1900201') {	// 个人代理时
        //     slsTyp = '020003';
        // } else if (chaType !== '19001' && chaType !== '1900201') {	// 非直销且非个人代理
        //     slsTyp = '020004';
        // }
        // 分页回传数据条数
        // const params = {
        //     'slsTyp': slsTyp, 'type': type,
        //     'slsCde': slsCde, 'slsNme': slsNme, 'pagePos': this._current, 'pageSize': this._pageSize, 'totalCount': this._total
        // };
        // if (reset) {
        //     this._current = 1;
        // }
        // return false;
        // 调用api 查询业务员信息
        //  getSaleManInfo(params);
    }



const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await saveRiskInfo(formData); //保存接口调用
      ElMessage.success("保存成功");
      emit("save");
      // dialogVisible(false);
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>
