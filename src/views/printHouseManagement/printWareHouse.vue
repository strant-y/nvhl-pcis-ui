<!-- 责任配置 -->
<template>
    <div class="app-container">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { useValidator } from "@/typings/useValidator";
  const { getRules } = useValidator();
  
  import { ref } from "vue";
  import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
  } from "@/shared/app-free-edit-config";
  
  import dayjs from 'dayjs'
  const freeEditRef = ref<AppFreeEditMethod | null>(null);
  import { createFreeButtonBase } from "@/shared/button-config";
  import { yesOrNo, size, inputtype } from "@/utils/utilKey";
  import { useDzModal } from "@/views/dzmodel/DzModalService";
  import {
    AppTableConfig,
    AppTableMethod,
    createTableEditConfig,
  } from "@/shared/app-table-config";
  import { deleteFactorBykey, getFactorList, getBasicRiskList } from "@/api/prod";
  import { template } from "lodash";
  const dzmodal = useDzModal();
  
  const riskEdit = defineAsyncComponent(() => import("./printWareHoseEdit.vue"));
  const tableRef = ref<AppTableMethod | null>(null);
  const applicationStatus = reactive( [{
          value: '1',
          label: '暂存'
        }, {
          value: '2',
          label: '退回'
        }]);
  const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      title: "责任配置",
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
          func: () => {},
        }),
      ],
      fromSchema: [
      {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "申请机构",
          clearable: true,
        },
        {
          prop: "cNmeCn",
          inputtype: "rtinput",
          title: "申请人",
          clearable: true,
        },
        {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "申请类型",
          typeCode: "KIND_LIST_ALL",
          params: { cStatus: "1" },
          clearable: true,
        },
        {
          prop: "tBgnTm",
          inputtype: "rtdatepicker",
          title: "新增日期",
          func: (val: any) => {
            freeEditRef.value?.setFormValue({
              cCriterionTimeUnit: "A",
              tBgnTm: dayjs(val).format("YYYY-MM-DD"),
              tAdbTm: dayjs(val).add(3, "day").format("YYYY-MM-DD"),
            });
            },
        },
        {
          prop: "tAdbTm",
          inputtype: "rtdatepicker",
          title: "至",

        },
        {
            inputtype: "rtselect",
            loadData: applicationStatus,
            title: "申请状态",
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
      editFlag: true,
      editList: ["cStatus"],
      titleBtns: [
        createFreeButtonBase({
          id: "score",
          label: "新增",
          type: "success",
          icon: "Plus",
          func: function () {
            dzmodal.open(riskEdit, { type: "add", data: {} }).then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
          },
        }),
      ],
      tableBtnType: "btn",
      tableBtnWidth: 220,
      tableBtnPosition: "right",
      tableBtn: [
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "编辑",
          type: "success",
          size: "large",
          icon: "Edit",
          tableClick: (row) => {
            console.log(row);
            dzmodal.open(riskEdit, { type: "edit", data: row }).then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
          },
        }),
      ],
      fromSchema: [
        {
          prop: "cKindNo",
          inputtype: "rtinput",
          title: "单证类型",
          clearable: true,
          rules: [getRules("required", {})],
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "起始印刷号",
        },
        {
          prop: "cNmeCn",
          inputtype: "rtinput",
          title: "终止印刷号",
        },
        {
          prop: "cNmeCn",
          inputtype: "rtinput",
          title: "子订单号",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "份数",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "申请状态",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "申请机构名称",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "申请人名称",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "申请时间",
        },
        {
          prop: "cNmeEn",
          inputtype: "rtinput",
          title: "退回时间",
        },
      ],
    })
  );
  
  onMounted(async () => {});
  
  // 绑定方法
  const method = {
    func1: () => {
      console.log(getRules);
    },
  };
  
  // 绑定特殊验证器
  const exRules = {
    byrtInput: (rule: any, value: any, callback: any) => {
      const r = freeEditRef.value?.getFromValue();
      if (r["name"]) {
        callback();
      } else {
        callback("姓名");
      }
    },
  };
  
  /** 查询 */
  function handleQuery(flag?: boolean) {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r);
    getBasicRiskList(param)
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
      .finally(() => {});
  }
  </script>
  
  <style scoped></style>
  