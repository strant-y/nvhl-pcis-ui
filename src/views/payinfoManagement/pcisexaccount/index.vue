<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useRouter } from "vue-router";
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
import moment from 'moment';
import { useUserStore } from "@/store/modules/user";
import { PcisQueryService } from '../service/pcis-query-service';
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user);
const dzmodal = useDzModal();
const router = useRouter();
const startTm = moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00')
const endTm = moment(new Date(Date.now())).format('YYYY-MM-DD 23:59:59')
//const searchPlanEcargo = defineAsyncComponent(() => import("./search-plan-ecargo.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "待批改单查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery()
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: (row) => {
          freeEditRef.value?.resetFields()
          nextTick(()=>{
            freeEditRef.value?.setValue('TAppTmStart', startTm)
            freeEditRef.value?.setValue('TAppTmEnd', endTm)
          })
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        //rules: [getRules("required", {})],
				params: { 'CDptCde': user.value['companyId'] }, 
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
      },
      {
        prop: "CLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
      },
			{
				prop: "CKindNo",
				inputtype: "rtselect",
				title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},

			},
			{
				prop: "CProdNo",
				inputtype: "rtselect",
				title: "产品",
        typeCode: "PROD_LIST_GRT",
        params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
			},
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "批改申请号"
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号"
      },
			{
				prop: "TAppTmStart",
				inputtype: "rtdatepicker",
				title: "批改申请起期",
        type: 'date',
        rules: [getRules("required", {trigger: 'change'})],
        format: "YYYY-MM-DD 00:00:00",
        valueFormat: "YYYY-MM-DD 00:00:00",
        defaultValue: new Date(Date.now() - 6 * 1000 * 60 * 60 * 24),
        func: (val) => {
          if (!!val) {
            const dates = moment(new Date(Date.parse(val))).format('YYYY-MM-DD 23:59:59');
            const endDates = moment(dates).add(6, 'day').format('YYYY-MM-DD 23:59:59');
            freeEditRef.value?.setValue('TAppTmEnd', endDates)
          }
        }
			},
			{
				prop: "TAppTmEnd",
				inputtype: "rtdatepicker",
				title: "批改申请止期",
        type: 'date',
        rules: [getRules("required", {trigger: 'change'})],
        format: "YYYY-MM-DD 23:59:59",
        valueFormat: "YYYY-MM-DD 23:59:59",
        defaultValue: new Date(Date.now())
			},

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
    isPage: true,
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log("编辑", row)

          // const en = this.encoderService.encryptByEnAES(JSON.stringify({
          //     CAppNo: row.cAppNo,
          //     CPlyNo: row.cPlyNo,
          //     CEdrNo: row.CEdrNo,
          //     CCoinsurerCde: row.CCoinsurerCde,
          //     CFeetypCde: row.CFeetypCde
          // }));
          router.push({ path: '/payinfo/editAccountExDispose', query: { data: {} } });
        },
      })
    ],
    fromSchema: [
      {
        prop: "CCoinsurerNme",
        inputtype: "rtinput",
        title: "保险公司",
      },
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "批改申请单号",
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "CEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "CProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "TEdrAppTm",
        inputtype: "rtinput",
        title: "批改申请日期",
      },
      {
        prop: "ErrorMessage",
        inputtype: "rtinput",
        title: "失败原因",
      }
    ],
  })
);
onMounted(async () => {
  nextTick(()=>{
    freeEditRef.value?.setValue('TAppTmStart', startTm)
    freeEditRef.value?.setValue('TAppTmEnd', endTm)
  })  
});
/** 查询 */
function handleQuery(flag?: boolean) {
  pageresult.list =[
    {
      dCFeetypCde: 'dCFeetypCde', CCoinsurerCde: 'CCoinsurerCde', CEdrNo: 'CEdrNo', CAppNo: 'CAppNo', CPlyNo: 'CPlyNo'
    }
  ]
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const CPlyNo = freeEditRef.value?.getValue('CPlyNo');
      if(!CPlyNo) {
        const form = freeEditRef.value?.getFromValue(); //获取表单数据
        const start = Date.parse(form.cTimeStart);
        const end = Date.parse(form.cTimeEnd);
        if (start - end > 0) {
            ElMessage.warning('投保起期不能大于投保止期');
            return;
        }
        if (end - start >= 7 * 1000 * 60 * 60 * 24) {
            ElMessage.warning('投保时间范围请控制在7天以内');
            return;
        }
      }

      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(s, r, {
        sortField: 'name',
        _allow_anonymous: true,
        CurrentUser: user.value['opCde'],
        CurrentUserOrg: user.value['companyId'],
        CCommodityType: null,
        payflag: '3',
        //codeListMap: this.codeListMap
      });
      pcisQueryService.qryPrmDueList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data.result;
            pageresult.total = data.total;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => { });
    }});
}
</script>

<style scoped></style>
