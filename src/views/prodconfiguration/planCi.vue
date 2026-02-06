<template>
  <div class="app-container">
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
import { saveProdInfo } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const planCiEdit = defineAsyncComponent(() => import("./planCiEdit.vue"));
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { pageFindPlanCiSNLBByParams,deletePlanCiInfoById } from "@/api/prod";
import { inputtype } from "@/utils/utilKey";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";


const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "联共保信息配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => { 
          freeEditRef.value?.validate().then((isValid) => {
            if (isValid) {
              handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
				func: () => {
					freeEditRef.value?.setFormValue({
            cPlanNo: "",
            cBrkrCde: "",
            cAgtAgrNo: "",
          });
				},
      }),
    ],

    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        rules: [getRules("required", {})],
      },
      {
        prop: "cBrkrCde",
        inputtype: "rtinput",
        title: "代理人代码",
      },
      {
        prop: "cAgtAgrNo",
        inputtype: "rtinput",
        title: "代理协议号",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "add-relatedTerms",
        label: "增加",
        type: "success",
        func: function () {
          dzmodal.open(planCiEdit, { type: "add", data: {} }).then((res) => {
						if (res?.type === "ok") {
							setValue('cPlanNo',res.body.formData.cPlanNo || '')
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
					dzmodal.open(planCiEdit, { type: "edit", data: row }).then((res) => {
						if (res?.type === "ok") { 
							setValue('cPlanNo',res.body.formData.cPlanNo || '')
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
          console.log('删除')
          ElMessageBox.confirm("是否要删除此行？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
					.then(() => {
						deletePlanCiInfoById(row).then((res) => {
								const { code, data, msg } = res;
								if (200 === code) {
									ElMessage.success("删除成功");
									handleQuery();
								} else {
									ElMessage.error(msg);
								}
						})
						.finally(() => {});
					})
					.catch(() => {
						// 取消删除
					});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNo",
        title: "方案编号",
        inputtype: "rtinput",
      },
      {
        prop: "cCiSubComp",
        title: "共保子公司",
        inputtype: "rtinput",
      },
      {
        prop: "cGroupId",
        title: "共同代理人",
        inputtype: "rtinput",
      },
      {
        prop: "cBrkrCde",
        title: "代理人",
        inputtype: "rtinput",
      },
      {
        prop: "cSlsId",
        title: "业务员代码",
        inputtype: "rtinput",
      },
      {
        prop: "cJiMrk",
        title: "主从联标志",
        inputtype: "rtselect",
        loadData: [{ value: '1', label: '主联' }, { value: '0', label: '从联' }],
      },
      {
        prop: "cIssueMrk",
        title: "出单标志",
        inputtype: "rtselect",
        loadData: [{label: "启用",value: "1"},{label: "禁用",value: "0"}],
      },
      {
        prop: "nCiShare",
        title: "共保比例",
        inputtype: "rtinput",
      },
      {
        prop: "cStatus",
        title: "状态",
				inputtype: "rtselect",
        loadData: [{ value: '1', label: '有效' }, { value: '0', label: '无效' }]
      },
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

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  console.log('数据内容',r,s)
  pageFindPlanCiSNLBByParams(param)
    .then((res) => {
      console.log(res)
      if (res.code === '1') {
        pageresult.list = res.result;
        pageresult.total = res.total;
      } else {
        ElMessage.error(res.msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {});

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
