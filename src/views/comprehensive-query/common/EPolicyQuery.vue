<!-- 生成电子保单查询 -->
<template>
    <div class="app-container">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @page-change="handleQuery(false)">
            <!-- policyInfo 列的具名插槽 -->
            <template #column-policyInfo="{ row, column, index }">
                <div class="policy-info-cell">
                    <div v-if="row.cAppNo" class="policy-number-row">
                        <span>{{ row.cAppNo }}</span>
                        <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                    <div v-if="row.cPlyNo" class="policy-number-row">
                        <span>{{ row.cPlyNo }}</span>
                        <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </div>
            </template>
            <template #column-cProdNmeCn="{ row }">
                <span v-html="row.cProdNmeCn || ''"></span>
            </template>
            <template #column-cAppNme="{ row, column, index }">
                <el-tooltip :content="row.cAppNme" placement="top">
                    <span v-html="row.cAppNme || ''" class="twoLine"></span>
                </el-tooltip>
            </template>
            <template #column-InsurancePeriod="{ row, column, index }">
                <div class="policy-info-cell">
                    <div v-if="row.tInsrncBgnTm" class="policy-period-row">
                        <span v-html="row.tInsrncBgnTm?.replace(/T/g, ' ')"></span>
                    </div>
                    <div v-if="row.tInsrncEndTm" class="policy-period-row">
                        <span v-html="row.tInsrncEndTm?.replace(/T/g, ' ')"></span>
                    </div>
                </div>
            </template>
            <template #column-cEdrNo="{ row, column, index }">
                <div class="policy-info-cell">
                    <div v-if="row.cEdrNo" class="policy-number-row">
                        <span>{{ row.cEdrNo }}</span>
                        <el-icon class="copy-icon" @click="copyText(row.cEdrNo)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </div>
            </template>
        </app-table>
        <comDialog ref="dialogRef"></comDialog>
    </div>
</template>

<script setup lang="ts">
import { codeListViewStore, useUserStore } from '@/store'
import { useValidator } from '@/typings/useValidator'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { AppFreeEditConfig, AppFreeEditMethod, createAppFreeEditConfig } from '@/shared/app-free-edit-config'
import { createFreeButtonBase, FreeButtonBase } from '@/shared/button-config'
import { AppTableConfig, AppTableMethod, createTableEditConfig } from '@/shared/app-table-config'
import { useDzModal } from '@/common/dzmodel/DzModalService'
import { PcisQueryService } from '@/views/payinfoManagement/service/pcis-query-service'
import { base64encoder, rsaEncoder } from '@/utils/encipher'
import { DialogMethod } from '@/common/dzmodel/ComDialogConf'
import { DocumentCopy } from "@element-plus/icons-vue";
// @ts-ignore
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import moment from 'moment'
import { getProdEnableList } from "@/api/prod";

const { getRules } = useValidator()
const router = useRouter()
const route = useRoute()
const codeListStore = codeListViewStore()
const freeEditRef = ref<AppFreeEditMethod | null>(null)
const pcisQueryService = new PcisQueryService()
const userStore = useUserStore()
const user: any = ref(userStore.user) || ref({ companyId: '', opCde: '', companyCnm: '' })
const dzmodal = useDzModal()
const tableRef = ref<AppTableMethod | null>(null)
const departmentTree = defineAsyncComponent(() => import('@/pcis/prodRef/commodityRef/DepartmentTree.vue'))
const props = defineProps({
    refreshData: {
        type: Boolean,
        default: false
    }
})
const sessionUser: any = sessionStorage.getItem('user')
const btnList = ref<Array<FreeButtonBase>>([])
const dialogRef = ref<DialogMethod | null>(null)
let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码
const cPard = ref(null);

const buttonList = [
    createFreeButtonBase({
        label: '雇主责任险在保证明',
        type: 'primary',
        id: 'zbzmGenEPolicy',
        func: () => {
            genZBZMEPolicy()
        }
    }),
    createFreeButtonBase({
        label: '生成',
        type: 'primary',
        id: 'generateEPolicy',
        func: () => {
            createEPolicy()
        }
    }),
    createFreeButtonBase({
        label: '下载',
        type: 'primary',
        id: 'downloadEPolicy',
        func: () => {
            downloadEPolicy()
        }
    }),
    createFreeButtonBase({
        label: '批量下载',
        type: 'primary',
        id: 'batchDownloadEPolicy',
        func: () => {
            batchDownloadEPolicy()
        }
    }),
    createFreeButtonBase({
        type: 'primary',
        label: '查询',
        func: async () => {
            handleQuery()
        }
    }),
    createFreeButtonBase({
        label: '重置',
        func: () => {
            const freeEditRefs = freeEditRef.value;
            const s = freeEditRefs?.getFromValue(); //获取表单数据
            for (const k in s) {
                s[k] = null;
            }
            freeEditRefs?.setFormValue({
                ...s,
                CDptCde: user.value.companyId,
                CLoadSub: '1',
                CPlyTyp: 'PLY',
                TIssueTm: [
                    dayjs(new Date()).subtract(1, 'month').format('YYYY-MM-DD 00:00:00'),
                    moment(new Date()).format('YYYY-MM-DD 23:59:59'),
                ]
            })
            setFormItem('CDptCde', {
                loadData: [
                    {
                        label: user.value.companyId + user.value.companyCnm,
                        value: user.value.companyId
                    }
                ]
            })
        }
    })
]
btnList.value = buttonList;

function extractCode(str: string) {
    // 匹配 "P+数字" 或 "纯数字"
    const pattern = /^(P\d+|\d+)/;
    return str.match(pattern)?.[0] || "";
}
const kindData: any = computed(() => {
    return prodTotalDatas.value.map((item: any) => ({
        label: item.code + " " + item.value,
        value: item.code,
        list: item.list,
    }));
});
const cProdData = ref([]);
const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
        endBtnsPosition: 'right',
        endBtns: buttonList,
        fromSchema: [
            {
                prop: 'CDptCde',
                inputtype: 'rtselect',
                title: '承保机构',
                btnWidth: 10,
                itemWidth: 2,
                showExBtn: true,
                rules: [getRules('required', {})],
                btnItems: {
                    icon: 'Search',
                    type: 'primary',
                    func: () => {
                        dzmodal.open(departmentTree, { type: 'Issuer', data: {} }).then((res: any) => {
                            if (res.body) {
                                const selectObj = res.body
                                let obj = {
                                    loadData: [
                                        {
                                            label: selectObj.name,
                                            value: selectObj.id
                                        }
                                    ]
                                }
                                freeEditRef.value?.setValue('CDptCde', selectObj.id)
                                setFormItem('CDptCde', {
                                    loadData: [
                                        {
                                            label: `${selectObj.id}${selectObj.name}`,
                                            value: selectObj.id
                                        }
                                    ]
                                })
                            }
                        })
                    }
                }
            },
            {
                prop: 'CLoadSub',
                inputtype: 'rtcheckbox',
                title: '包含下级机构',
                keymap: {
                    y: '1',
                    n: '0'
                }
            },
            {
                prop: "CKindNo",
                inputtype: "rtselect",
                title: "产品大类",
                itemWidth: 1,
                rules: [{ type: "required" }],
                typeCode: "KIND_LIST_GRT",
                child: "cProdNo",
                filterable: true,
                clearable: true,
                codeParam: {
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
                loadData: kindData,
                func: (val: any) => {
                    setValue("cProdNo", "")
                    cTermNo = "";      // 重置条款编码
                    cPard.value = val;
                    formconfig1.fromSchema?.forEach((item) => {
                        if (
                            item.prop === "CEmployeeName" ||
                            item.prop === "CIdentificationNumber" ||
                            item.prop === "CPlateNo" ||
                            item.prop === "CEngineNo" ||
                            item.prop === "CIndustryType" ||
                            item.prop === "CProjectName" ||
                            item.prop === "CDetailedAddress" ||
                            item.prop === "CProjectType" ||
                            item.prop === "cPrjCtgTyp" ||
                            item.prop === "cPrjCtgMidTyp" ||
                            item.prop === "cPrjCtgSubTyp"
                        ) {
                            item.hidden = true;
                        }
                    });
                    if (val && val.length > 0) {
                        let options: any = [];
                        kindData.value.forEach((item: any) => {
                            if (val.includes(item.value)) {
                                const list = item.list.map((item: any) => ({
                                    label: item.code + " " + item.value,
                                    value: item.code,
                                    list: item.list,
                                }));
                                options = options.concat(list);
                            }
                        });
                        cProdData.value = options;
                        setFormItem("CProdNo", { loadData: options });
                        freeEditRef.value?.setValue("CProdNo", null);
                    } else {
                        setFormItem("CProdNo", { loadData: [] });
                        freeEditRef.value?.setValue("CProdNo", null);
                    }
                },
            },
            {
                prop: 'CProdNo',
                inputtype: 'rtselect',
                title: '产品名称',
                itemWidth: 1,
                rules: [getRules('required', {})],
                // typeCode: 'EPolicy_List',
                filterable: true,
                clearable: true,
                func: (val: any) => {
                    const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
                    if ((val == '089900' && plyTyp == 'PLY') || (val == '010022' && plyTyp == 'PLY') || plyTyp == 'BL') {
                        setFormItem('CTyp', { disabled: false })
                    } else {
                        setFormItem('CTyp', { disabled: true })
                    }
                    if (val && val.length > 0) {
                        let options: any = [];
                        cProdData.value.forEach((item: any) => {
                            if (val.includes(item.value)) {
                                const list = item.list.map((item: any) => ({
                                    label: item.code + " " + item.value,
                                    value: item.code,
                                    list: item.list,
                                }));
                                options = options.concat(list);
                            }
                        });
                        setFormItem("CTermNo", { loadData: options });
                        freeEditRef.value?.setValue("CTermNo", null);
                    } else {
                        setFormItem("CTermNo", { loadData: [] });
                        freeEditRef.value?.setValue("CTermNo", null);
                    }
                }
            },
            {
                prop: "CTermNo",
                inputtype: "rtselect",
                title: "条款",
                itemWidth: 1,
                rules: [{ type: "required" }],
                filterable: true,
                clearable: true,

                func: (val: any) => {

                    if (val) {
                        if (cTermNoList.value.length > 0) {
                            cTermNoList.value.forEach((ele) => {
                                if (ele['value'] === val) {
                                    cTermNo = extractCode(ele['label'])
                                }
                            });
                        }
                    } else {
                        cTermNo = "";
                    }
                    formconfig1.fromSchema?.forEach((item) => {
                        if (
                            item.prop === "CEmployeeName" ||
                            item.prop === "CIdentificationNumber" ||
                            item.prop === "CPlateNo" ||
                            item.prop === "CEngineNo" ||
                            item.prop === "CIndustryType" ||
                            item.prop === "CProjectName" ||
                            item.prop === "CDetailedAddress" ||
                            item.prop === "CProjectType" ||
                            item.prop === "cPrjCtgTyp" ||
                            item.prop === "cPrjCtgMidTyp" ||
                            item.prop === "cPrjCtgSubTyp"
                        ) {
                            item.hidden = true;
                        }
                    });
                },
            },
            {
                prop: 'CPlyNo',
                inputtype: 'rtinput',
                title: '保单号',
                clearable: true
            },
            {
                prop: 'CAppNo',
                inputtype: 'rtinput',
                title: '申请单号',
                clearable: true
            },
            {
                prop: 'CAppNme',
                inputtype: 'rtinput',
                title: '投保人名称',
                clearable: true
            },
            {
                prop: 'CAppCertfCde',
                inputtype: 'rtinput',
                title: '投保人证件号码',
                clearable: true
            },
            {
                prop: 'CInsuredNme',
                inputtype: 'rtinput',
                title: '被保人名称',
                clearable: true
            },
            {
                prop: 'CInsuredCertfCde',
                inputtype: 'rtinput',
                title: '被保人证件号码',
                clearable: true
            },
            {
                prop: 'TAppTm',
                inputtype: 'rtdatepicker',
                title: '投保申请日期',
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                clearable: true,
                type: 'datetimerange'
            },
            {
                prop: 'TEdrAppTm',
                inputtype: 'rtdatepicker',
                title: '批改申请日期',
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                clearable: true,
                type: 'datetimerange'
            },
            {
                prop: 'TIssueTm',
                inputtype: 'rtdatepicker',
                title: '签单日期',
                format: 'YYYY-MM-DD',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                clearable: true,
                type: 'datetimerange'
            },
            {
                prop: 'CBatchNo',
                inputtype: 'rtinput',
                title: '导入保单批次号',
                clearable: true
            },
            {
                prop: 'CPlyTyp',
                inputtype: 'rtselect',
                title: '单证类型',
                clearable: true,
                loadData: [
                    { label: '电子保单', value: 'PLY' },
                    { label: '电子保函/电子保险凭证', value: 'BL' },
                    { label: '电子投保单', value: 'TBD' },
                    { label: '电子批单', value: 'EDR' },
                    { label: '诚信声明', value: 'SOG' }
                ],
                func: (val: any) => {
                    const prodNo = freeEditRef.value?.getValue('CProdNo')
                    if ((prodNo == '089900' && val == 'PLY') || (prodNo == '010022' && val == 'PLY') || val == 'BL') {
                        setFormItem('CTyp', { disabled: false })
                    } else {
                        setFormItem('CTyp', { disabled: true })
                    }
                }
            },
            {
                prop: 'CTyp',
                inputtype: 'rtselect',
                title: '保单类型',
                clearable: true,
                disabled: true,
                loadData: [
                    { label: '保单', value: 'A' },
                    { label: '批单', value: 'E' }
                ]
            },
            {
                prop: 'CDzbdTyp',
                inputtype: 'rtselect',
                title: '生成电子保单方式',
                clearable: true,
                loadData: [
                    { label: '全国版', value: '01' },
                    { label: '江苏南通版', value: '02' },
                    { label: '江苏9附加险模板', value: '03' },
                    { label: '江苏10条附加险模板', value: '04' },
                    { label: '校车承运人责任险模板', value: '05' },
                    { label: '非营运客车承运人责任险模板', value: '06' },
                    { label: '货运险不展示保费、费率', value: '07' },
                    { label: '诉责险不打印保险期间', value: '08' }
                ]
            }
        ]
    })
)

const pageresult = reactive<Pageresult>({
    result: '',
    /** 数据列表 */
    list: [],
    /** 总数 */
    total: 0
})

const platTypeMap: any = { TBD: '投保单', BL: '保函', PLY: '保单', EDR: '批单' }

const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
        tableBtnType: 'btn',
        tableBtnWidth: 90,
        tableBtnPosition: 'right',
        showSelection: true,
        fromSchema: [
            {
                prop: "policyInfo",
                inputtype: "rtinput",
                title: "申请单号\n保单号",
                lengthNum: 21,
                lengthIsNumber: true,
                slotName: "policyInfo"
            },
            {
                prop: 'cAppNo',
                inputtype: 'rtinput',
                title: '申请单号',
                isShow: false,
                width: 136,
            },
            {
                prop: 'cPlyNo',
                inputtype: 'rtinput',
                title: '保单号',
                isShow: false,
                width: 136,
            },
            {
                prop: 'cEdrNo',
                inputtype: 'rtinput',
                title: '批单号',
                lengthNum: 21,
                lengthIsNumber: true,
                slotName: "cEdrNo"
            },
            {
                prop: 'cAppNme',
                inputtype: 'rtinput',
                title: '投保人名称',
                slotName: "cAppNme",
                align: 'left',
                lengthNum: 12,
            },
            {
                prop: 'nPrm',
                inputtype: 'rtinput',
                title: '保险费',
                lengthNum: 12,
                lengthIsNumber: true,
                align: "left",
                formatter: (val: any) => {
                    return val.toLocaleString()
                }
            },
            {
                prop: 'cProdNmeCn',
                inputtype: 'rtinput',
                title: '产品',
                lengthNum: 13,
                slotName: "cProdNmeCn",
                align: 'left',
            },
            {
                prop: 'cSlsNme',
                inputtype: 'rtinput',
                title: '业务员名称',
                lengthNum: 5,
                align: 'left',
            },
            {
                prop: 'tAppTm',
                inputtype: 'rtinput',
                title: '投保申请日期',
                lengthNum: 17,
                lengthIsNumber: true,
                formatter: (val: any) => {
                    return val?.replace(/T/g, ' ')
                }
            },
            {
                prop: "InsurancePeriod",
                inputtype: "rtinput",
                title: "保险期间",
                lengthNum: 17,
                lengthIsNumber: true,
                slotName: "InsurancePeriod"
            },
            {
                prop: 'tUdrTm',
                inputtype: 'rtinput',
                title: '核保日期',
                lengthNum: 17,
                lengthIsNumber: true,
                formatter: (val: any) => {
                    return val?.replace(/T/g, ' ')
                }
            }
        ]
    })
)

const prodTotalDatas = ref([]);
onBeforeMount(() => {
    let params = {
        level: 2,
        type: 1,
        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
    }
    getProdEnableList(params).then((res: any) => {
        if (res.data && res.data.length > 0) {
            prodTotalDatas.value = res.data;
        }
    });
});

onMounted(async () => {
    nextTick(() => {
        freeEditRef.value?.setValue('CLoadSub', '1')
        freeEditRef.value?.setValue('CDptCde', user.value.companyId)
        freeEditRef.value?.setValue('CPlyTyp', 'PLY')
        setFormItem('CDptCde', {
            loadData: [
                {
                    label: user.value.companyId + user.value.companyCnm,
                    value: user.value.companyId
                }
            ]
        })
        const beginTime = dayjs(new Date()).subtract(1, 'month').format('YYYY-MM-DD 00:00:00')
        const endTime = moment(new Date()).format('YYYY-MM-DD 23:59:59')
        freeEditRef.value?.setValue('TIssueTm', [beginTime, endTime])
    })
})

// 绑定方法
const method = {
    func1: () => {
        console.log(getRules)
    }
}

watch(
    () => props.refreshData,
    (n, o) => {
        // 自动刷新列表获取数据
        // pageresult.list = []
        // pageresult.total = 0
        // 上面代码是仅用于本地调试
        if (n) {
            handleQuery(true);
        }
    },
    {
        deep: true,
        immediate: true
    }
)

/** 查询 */
function handleQuery(flag?: boolean) {
    freeEditRef.value?.validate().then((isValid: any) => {
        if (isValid) {
            const r = tableRef.value?.getPartnerPage(flag) //获取分页数据
            const s = freeEditRef.value?.getFromValue() //获取表单数据
            if (s.TAppTm && s.TAppTm[1]) {
                s.TAppTm[1] = dayjs(s.TAppTm[1]).format("YYYY-MM-DD 23:59:59")
            }
            if (s.TEdrAppTm && s.TEdrAppTm[1]) {
                s.TEdrAppTm[1] = dayjs(s.TEdrAppTm[1]).format("YYYY-MM-DD 23:59:59")
            }
            if (s.TIssueTm && s.TIssueTm[1]) {
                s.TIssueTm[1] = dayjs(s.TIssueTm[1]).format("YYYY-MM-DD 23:59:59")
            }
            const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
            const appNme = freeEditRef.value?.getValue('CAppNme')
            if (!!appNme && appNme.length < 2) {
                ElMessage.warning('投保人名称至少输入2位!')
                return
            }
            const insuredNme = freeEditRef.value?.getValue('CInsuredNme')
            if (!!insuredNme && insuredNme.length < 2) {
                ElMessage.warning('被保人名称至少输入2位!')
                return
            }
            const appNo = freeEditRef.value?.getValue('CAppNo')
            const plyNo = freeEditRef.value?.getValue('CPlyNo')
            const appTm = freeEditRef.value?.getValue('TAppTm')
            const edrAppTm = freeEditRef.value?.getValue('TEdrAppTm')
            const issueTm = freeEditRef.value?.getValue('TIssueTm')
            const appCertfCde = freeEditRef.value?.getValue('CAppCertfCde')
            const insuredCertfCde = freeEditRef.value?.getValue('CInsuredCertfCde')
            const batchNo = freeEditRef.value?.getValue('CBatchNo')
            if (
                (appNo != null && appNo != '') ||
                (plyNo != null && plyNo != '') ||
                (appNme != null && appNme != '') ||
                (appCertfCde != null && appCertfCde != '') ||
                (insuredNme != null && insuredNme != '') ||
                (insuredCertfCde != null && insuredCertfCde != '') ||
                (batchNo != null && batchNo != '')
            ) {
            } else {
                if ((appTm != null && appTm != '') || (edrAppTm != null && edrAppTm != '') || (issueTm != null && issueTm != '')) {
                } else {
                    ElMessage.warning('申请日期和签单日期不能同时为空!')
                    return
                }
            }
            let CAppTyp = plyTyp === 'EDR' ? 'E' : 'A'
            const CTyp = freeEditRef.value?.getValue('CTyp')
            if (plyTyp === 'BL' && !!CTyp) {
                CAppTyp = CTyp
            }
            const param = Object.assign(
                {
                    CurrentUser: user.value.opCde,
                    CurrentUserOrg: user.value.companyId,
                    CAppTyp: CAppTyp
                },
                s,
                r
            )
            // 投保申请日期
            if (!!s.TAppTm && s.TAppTm.length > 1) {
                param['TAppTmStart'] = s.TAppTm[0]
                param['TAppTmEnd'] = s.TAppTm[1]
                delete param.TAppTm
            }
            // 批改申请日期
            if (!!s.TEdrAppTm && s.TEdrAppTm.length > 1) {
                param['TEdrAppTmStart'] = s.TEdrAppTm[0]
                param['TEdrAppTmEnd'] = s.TEdrAppTm[1]
                delete param.TEdrAppTm
            }
            // 签单日期
            if (!!s.TIssueTm && s.TIssueTm.length > 1) {
                param['TIssueBgnTm'] = s.TIssueTm[0]
                param['TIssueEndTm'] = s.TIssueTm[1]
                delete param.TEdrAppTm
            }
            param["cTermNo"] = cTermNo;        // 条款编码
            delete param.cProdNo;

            pcisQueryService
                .getEpolicyPolicyList(param)
                .then((res: any) => {
                    const { code, data } = res
                    if (200 === code) {
                        pageresult.list = []
                        pageresult.list = data.result
                        pageresult.list = data.result.map((item) => ({
                            ...item,
                            // 创建一个新字段合并两个值
                            policyInfo: `${item.cAppNo || ''}\n${item.cPlyNo || ''}`,
                            InsurancePeriod: `${item.tInsrncBgnTm || ''} - ${item.tInsrncEndTm || ''}`,
                        }))
                        pageresult.total = data.total
                        if (!!data.code && !!data.message && data.code == '0') {
                            ElMessage.warning(data.message)
                        }
                    }
                })
                .finally(() => { })
        }
    })
}
/**
 * 在保证明
 */
function genZBZMEPolicy() {
    const prodNo = freeEditRef.value?.getValue('CProdNo')
    if (prodNo == null || prodNo == undefined) {
        ElMessage.warning('请选择产品!')
        return
    }
    if (prodNo != '040002') {
        ElMessage.warning('非雇主责任险不可操作!')
        return
    }
    dialogRef.value?.open(
        'epolicyWorker',
        {
            type: 'show',
            data: {
                leading: 'CSlsId'
            },
            method: {
                getSelected: (params: any) => {
                    dialogRef.value?.handleClose()
                }
            }
        },
        {
            isOk: (selectdata: any) => {
                console.log('a', selectdata)
            }
        },
        { title: '在保证明', width: 85 }
    )
}
/**
 * 生成电子保单
 */
function createEPolicy() {
    const btn = getBtn('generateEPolicy')
    const prodNo = freeEditRef.value?.getValue('CProdNo')
    if (prodNo == null || prodNo == undefined) {
        ElMessage.warning('请选择产品!')
        return
    }
    const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
    if (plyTyp == null || plyTyp == undefined) {
        ElMessage.warning('请选择单证类型!')
        return
    }
    if (plyTyp == 'TBD' && prodNo != '019003') {
        ElMessage.warning('非019003产品，不存在电子投保单业务!')
        return
    }
    var dzbdTyp = freeEditRef.value?.getValue('CDzbdTyp')
    if ((dzbdTyp == null || dzbdTyp == '' || dzbdTyp == undefined) && prodNo == '059002' && plyTyp == 'PLY') {
        ElMessage.warning('请选择生成电子保单方式!')
        return
    }
    if (prodNo != '059011' && prodNo != '059015' && prodNo != '059012' && prodNo != '059013' && prodNo != '059016' && prodNo != '059017' && prodNo != '059018' && prodNo != '059019' && prodNo != '059020' && prodNo != '040019' && prodNo != '047002' && plyTyp == 'BL') {
        ElMessage.warning('该产品没有电子保函模板!')
        return false
    }
    if (plyTyp == 'SOG' && prodNo != '047002') {
        ElMessage.warning('该产品没有诚信声明模板!')
        return false
    }
    const CTyp = freeEditRef.value?.getValue('CTyp')
    if (CTyp != 'E' && prodNo == '089900' && plyTyp == 'PLY') {
        ElMessage.warning('该产品保单不允许在核心生成电子保单!')
        return
    }
    const selectData = tableRef.value?.getselectionData()
    if (!selectData || selectData.length <= 0) {
        ElMessage.warning('所选记录为空！')
        return
    }
    if (selectData.length > 100) {
        ElMessage.warning('生成电子保单数量最大为100单！')
        return
    }
    const CUniqueNos: any[] = []
    selectData.forEach((item: any) => {
        CUniqueNos[CUniqueNos.length] = item.cAppNo
    })
    if (!CUniqueNos[0]) {
        ElMessage.warning('所选记录为空！')
        return
    }
    setButton(btn, true)
    const vCUniqueNo = CUniqueNos.join('-,-')
    const param = {
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        vCUniqueNo: vCUniqueNo,
        CPlyTyp: plyTyp,
        CDzbdTyp: dzbdTyp
    }
    pcisQueryService
        .generatingEPolicy(param)
        .then((res: any) => {
            const { code, msg } = res
            if (200 === code) {
                ElMessage.success(msg)
            } else {
                ElMessage.warning(msg)
            }
        })
        .finally(() => {
            setButton(btn, false)
        })
}

/**
 * 下载电子保单
 */
function downloadEPolicy() {
    const btn = getBtn('downloadEPolicy')
    const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
    if (plyTyp == null || plyTyp == undefined) {
        ElMessage.warning('请选择单证类型!')
        return
    }
    const selectData = tableRef.value?.getselectionData()
    if (!selectData || selectData.length <= 0) {
        ElMessage.warning('所选记录为空！')
        return
    }
    if (selectData.length > 1) {
        ElMessage.warning('每次只能下载1个单据！')
        return
    }
    let plyNo = selectData[0].cPlyNo
    if (!plyNo) {
        ElMessage.warning('没有数据，请核实确认！')
        return
    }
    if (plyTyp == 'EDR') {
        plyNo = selectData[0].cEdrNo
    } else if (plyTyp == 'TBD') {
        plyNo = selectData[0].cAppNo
    }
    const data = {
        plyNo: base64encoder(rsaEncoder(plyNo)),
        type: 'EXP_EPOLICY_IMP_PDF',
        impType: plyTyp
    }
    setButton(btn, true)
    pcisQueryService
        .downloadEPolicy(data)
        .then((res: any) => {
            if (res == '' || res == '500' || res.data.size <= 3) {
                ElMessage.error('下载出错，请核实是否有生成电子' + platTypeMap[plyTyp] + '！')
                return
            }
            const fileName = `${plyNo}.pdf`
            const blob = new Blob([res.data], { type: 'application/pdf;charset=UTF-8' })
            saveAs(blob, fileName)
        })
        .catch(e => {
            ElMessage.error('电子单据下载失败' + e)
        })
        .finally(() => {
            setButton(btn, false)
        })
}

/**
 * 批量下载
 */
function batchDownloadEPolicy() {
    const btn = getBtn('batchDownloadEPolicy')
    const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
    if (plyTyp == null || plyTyp == undefined) {
        ElMessage.warning('请选择单证类型!')
        return
    }
    const selectData = tableRef.value?.getselectionData()
    if (!selectData || selectData.length <= 0) {
        ElMessage.warning('所选记录为空！')
        return
    }
    let targetPlyNo = ''
    selectData.forEach((item: any, idx: number) => {
        let plyNo = item.cPlyNo
        if (plyTyp == 'EDR') {
            plyNo = item.cEdrNo
        } else if (plyTyp == 'TBD') {
            plyNo = item.cAppNo
        }
        if (idx == 0) {
            targetPlyNo += plyNo;
        } else {
            targetPlyNo += ',' + plyNo;
        }
    })
    const data = {
        plyNo: base64encoder(rsaEncoder(targetPlyNo)),
        type: 'EXP_EPOLICY_IMP_PDF',
        impType: plyTyp
    }
    setButton(btn, true)
    pcisQueryService
        .batchDownloadEPolicy(data)
        .then((res: any) => {
            if (res == '' || res == '500' || res.data.size <= 3) {
                ElMessage.error('批量下载，请核实是否有生成电子' + platTypeMap[plyTyp] + '！')
                return
            }
            if (res.code == 500) {
                ElMessage.error('批量下载' + platTypeMap[plyTyp] + '出错，请联系管理员！')
                return
            }
            const fileName = 'epolicyPdfFile.zip'
            const blob = new Blob([res.data], { type: 'application/octet-stream;charset=UTF-8' })
            saveAs(blob, fileName)
        })
        .catch(e => {
            ElMessage.error('批量下载电子单据下载失败' + e)
        })
        .finally(() => {
            setButton(btn, false)
        })

}

function formatTwoLine(text, num = 7) {
    if (!text) return '';
    const len = text.length;
    const maxLen = num * 2 - 1;
    if (len <= maxLen) {
        return `${text.slice(0, num)}<br/>${text.slice(num)}`;
    }
    return `${text.slice(0, num)}<br/>${text.slice(num, maxLen)}…`;
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
    if (obj && Object.keys(obj).length) {
        formconfig1.fromSchema?.forEach(item => {
            if (item.prop === key) {
                //控制尾部按钮的
                if (item.btnItems && obj.btnItems) {
                    for (let key in obj.btnItems) {
                        item.btnItems[key] = obj.btnItems[key]
                    }
                } else {
                    Object.assign(item, obj)
                }
            }
        })
    }
}
function setButton(btn: any, val: boolean) {
    if (!!btn) {
        btn.loading = val
        btn.disabled = val
    }
}
/**
 * 获取button
 * @param id
 */
const getBtn = (id: any) => {
    return btnList.value.find(item => {
        return id === item.id
    })
}

// 添加 copyText 方法
const copyText = (text: any) => {
    if (!text) {
        ElMessage.warning('没有可复制的内容');
        return;
    }

    // 检查 navigator.clipboard 是否存在
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
            () => {
                ElMessage.success('复制成功');
            },
            () => {
                ElMessage.error('复制失败');
            }
        );
    } else {
        // 使用 document.execCommand('copy') 方法作为备选方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const result = document.execCommand('copy');
            if (result) {
                ElMessage.success('复制成功');
            } else {
                ElMessage.error('复制失败');
            }
        } catch (err) {
            ElMessage.error('复制失败，请稍后再试');
        } finally {
            document.body.removeChild(textarea); // 清理创建的 textarea 元素
        }
    }
};

function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
    return freeEditRef?.value?.getValue(key);
}
defineExpose({
    setValue,
    getValue
});

</script>

<style scoped>
.copy-icon {
    margin-left: 5px;
    cursor: pointer;
    color: #409eff;
}

.policy-info-cell {
    display: flex;
    flex-direction: column;
}

.policy-number-row {
    display: flex;
    align-items: center;
    height: 16px;
}

.policy-number-row span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
}

:deep(.el-table__body .el-table__row .el-table__cell:first-child .cell) {
    white-space: break-spaces;
}

:deep(.el-table th:nth-child(2) .cell) {
    white-space: pre-line;
}

.twoLine {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-all;
    overflow: hidden;
}
</style>
