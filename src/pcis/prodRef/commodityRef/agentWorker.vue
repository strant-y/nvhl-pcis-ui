<template>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
        @page-change="handleQuery(false)" />
</template>

<script setup lang="ts">
import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
    createFromUiConfig,
} from "@/shared/app-free-edit-config";
import {
    AppTableConfig,
    AppTableMethod,
    createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();
import { useRoute } from "vue-router";
const route = useRoute();
const routeParam = route.params.param;
const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    method: {
        type: Object,
        default: () => ({}),
    },
});
const emits = defineEmits(["handleClose"]);
const queryLoading = ref(false);         // 控制按钮 loading 图标
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
    result: "",
    /** 数据列表 */
    list: [],
    /** 总数 */
    total: 0,
});
const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
        title: "",
        endBtnsPosition: "right",
        endBtns: [
            createFreeButtonBase({
                type: "primary",
                label: "查询",
                loading: queryLoading,   // 新增
                func: async () => {
                    freeEditRef.value?.validate().then((isValid) => {
                        if (isValid) {
                            handleQuery();
                        } else {
                            ElMessage.error("请填写必填项");
                        }
                    });
                },
            }),
        ],
        fromSchema: [
            {
                prop: "CDptCde",
                inputtype: "rtinput",
                title: "机构部门",
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
                prop: "CEmail",
                inputtype: "rtinput",
                title: "邮箱",
            },
        ],
        rowDbClickFun(row) {
            props.data.method.getSelected(row)
        }
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
}

/** 查询 */
function handleQuery(flag?: boolean) {
    queryLoading.value = true;
    const user = JSON.parse(sessionStorage.getItem("user"));
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据

    const param = Object.assign(s, r);
    const params = Object.assign(param,{
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        CBsnsTyp: props.data.data['CBsnsTyp'],
        CDptCde: props.data.data['CDptCde'] ? props.data.data['CDptCde']:  routeParam.cDptCde,
        CBrkrCde: props.data.data['CBrkrCde'],
        CSlsTyp: props.data.data['CSlsTyp'],
        CChaType: props.data.data['CChaType'],
				CChaSubtype: props.data.data['cChaSubtype'],
        CDptAttr: props.data.data['CDptAttr'],
        // CSlsCde: props.data.data['CSlsCde'],
        subSidiary: props.data.data['subSidiary'],
        leading: props.data.data['leading'],

    });

    policyService.getWebOrgSelsList(params).then((res: any) => {
      if (res && res["code"] === 200) {
        const pageData = res.data;
        if (pageData) {
          pageresult.total = pageData.total;
          pageresult.list = pageData.result;
          ElMessage.success('查询成功');
          queryLoading.value = false;
        }
      }
    });
}

onMounted(() => {
    console.log('param', props.data)
    nextTick(() => {
        // setValue('CDptCde', props.data.data.CDptCde)
        // setValue('CDptCnm',routeParam.cDptCnm || props.data.data['cDptCnm'])
        setValue('CDptCde',  props.data.data['CDptCde'])
    })
  // 页面加载时触发一次查询
    handleQuery();
});

defineExpose({
    getFromValue,
    setFormValue,
    validate,
    setValue,
    getValue,
});
</script>
