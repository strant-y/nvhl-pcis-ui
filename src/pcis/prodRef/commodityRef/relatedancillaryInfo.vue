<!-- 商品编辑--新增 -->
<template>
    <div>
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
    createFromUiConfig,
  } from "@/shared/app-free-edit-config";
  import { createFreeButtonBase } from "@/shared/button-config";
  import { useValidator } from "@/typings/useValidator";
  import { useDzModal } from "@/common/dzmodel/DzModalService";
  import { getPlanBasePage } from "@/api/prod";
  import { dataOpertaor } from "@/store/modules/data-opertaor";
  const opertaor = dataOpertaor();
  import {
    AppTableConfig,
    AppTableMethod,
    createTableEditConfig,
  } from "@/shared/app-table-config";
  import { ref, reactive, onMounted } from "vue";
  const relatedancillaryAdd = defineAsyncComponent(
    () => import("./relatedancillaryAdd.vue")
  );
  import { saveCvrgRiskRel, queryCommodityPlanList } from "@/api/prod";
  const dzmodal = useDzModal();
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
  import { useRoute } from "vue-router";
  import { c } from "vite/dist/node/types.d-aGj9QkWt";
  const route = useRoute();
  const query = ref(route.query);
  const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
  
  const { getRules } = useValidator();
  
  const freeEditRef = ref<AppFreeEditMethod | null>(null);
  
  const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      title: "关联附属信息",
      endBtnsPosition: "right",
      endBtns: [
        createFreeButtonBase({
          type: "primary",
          label: "查询",
          icon: "Search",
          func: async () => {
            handleQuery();
          },
        }),
        createFreeButtonBase({
          label: "重置",
          icon: "RefreshRight",
          func: () => {},
        }),
      ],
      fromSchema: [
        {
          prop: "cPlanNo",
          inputtype: "rtinput",
          title: "险种大类",
        },
        {
          prop: "CPlanCn",
          inputtype: "rtinput",
          title: "险种名称",
        },
      ],
      fromUi: createFromUiConfig({
        cols: 3,
      }),
    })
  );
  const tableRef = ref<AppTableMethod | null>(null);
  const pageresult = reactive<Pageresult>({
    result: "",
    list: [],
    total: 0,
  });
  const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
      titleBtns: [
        createFreeButtonBase({
          id: "add-planConf",
          label: "新增",
          type: "success",
          func: function () {
            console.log('点这里 选择方案',)
  
            console.log(tabref.getFromValue());
            // if(!tabref.getFromValue()['cCommodityNo']){
            //   ElMessage.error('产品代码为空,请保存后操作!');
            //   return false;
            // }
            // return false;
            dzmodal
              .open(relatedancillaryAdd, { type: "add", data:tabref.getFromValue() })
              .then((res) => {
  
  
               
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
          tooltip: "查看",
          type: "success",
          size: "large",
          icon: "View",
          tableClick: (row) => {
            console.log(row);
            dzmodal.open(factorEdit, { type: "view", data: row }).then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
          },
        }),
        createFreeButtonBase({
          id: "score",
          type: "danger",
          tooltip: "删除",
          icon: "Delete",
          link: true,
          tableClick: (row) => {
            delRiskRel(row)
              .then((res) => {
                const { code, data, msg } = res;
                if (200 === code) {
                  ElMessage.success("删除成功");
                  handleQuery();
                } else {
                  ElMessage.error(msg);
                }
              })
              .finally(() => {});
          },
        }),
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "编辑",
          type: "success",
          size: "large",
          icon: "Edit",
          tableClick: (row) => {
            console.log(row);
            dzmodal.open(factorEdit, { type: "edit", data: row }).then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
          },
        }),
      ],
      fromSchema: [
        {
          prop: "CPlanNo",
          inputtype: "rtinput",
          title: "商品编码",
        },
        {
          prop: "CPlanCn",
          inputtype: "rtinput",
          title: "险种大类",
        },
        {
          prop: "CIsMainProdPlan",
          inputtype: "rtinput",
          title: "险种名称",
        },
        {
          prop: "CDispNme",
          inputtype: "rtinput",
          title: "倒签单天数",
        },
        {
          prop: "CSaleName",
          inputtype: "rtinput",
          title: "pdf电子保单样式",
        },
      ],
      tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "success",
        tooltip: "编辑",
        icon: "Edit",
        link: true,
        tableClick: (row) => {
        //   dzmodal
        //     .open(AddInstituTaxRateModal, { type: "edit", data: row })
        //     .then((res) => {
        //       if (res.type === "ok") {
        //         handleQuery();
        //       }
        //     });
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
        //   delProdTaxRateInfoById(row)
        //     .then((res) => {
        //       const { code, data, msg } = res;
        //       if (200 === code) {
        //         ElMessage.success("删除成功");
        //         handleQuery();
        //       } else {
        //         ElMessage.error(msg);
        //       }
        //     })
        //     .finally(() => {});
        },
      }),
    ],
    })
  );
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
  function setDisa() {
    formconfig1.fromSchema?.forEach((e) => {
      if (e.prop === "cProdNo" || e.prop === "cKindNo") {
        e.disabled = true;
      }
    });
  }
  /** 查询 */
  function handleQuery() {
    console.log("查询条件:", sessionStorage.getItem("user"));
    const r = tableRef.value?.getPartnerPage(); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const c = tabref.getFromValue().cCommodityNo;
    const param = Object.assign(s, r, { cCommodityNo: c });
    if (c == null) {
      ElMessage.error("商品编号为空,请保存后操作!");
      return;
    } else {
      queryCommodityPlanList(param)
        .then((res) => {
          const { code, data, msg } = res;
          console.log(data,'1212')
          if (200 === code) {
            pageresult.list = data;
            pageresult.total = data.length;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    }
  }
  onMounted(() => {
    if (param.editType === "edit") {
      setDisa();
    }
  });
  
  defineExpose({
    getFromValue,
    setFormValue,
    validate,
    setValue,
    getValue,
  });
  </script>
  