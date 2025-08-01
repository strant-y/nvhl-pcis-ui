<!-- 生成电子保单查询 -->
<template>
    <div class="app-container">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @page-change="handleQuery(false)" />
        <comDialog ref="dialogRef"></comDialog>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { useValidator } from '@/typings/useValidator'
import { useRouter, useRoute } from 'vue-router'
const { getRules } = useValidator()
const router = useRouter()
const route = useRoute()
import { ref } from 'vue'
import { codeListViewStore } from '@/store'
const codeListStore = codeListViewStore()
import { AppFreeEditConfig, AppFreeEditMethod, createAppFreeEditConfig } from '@/shared/app-free-edit-config'
const freeEditRef = ref<AppFreeEditMethod | null>(null)
import { createFreeButtonBase, FreeButtonBase } from '@/shared/button-config'
import { AppTableConfig, AppTableMethod, createTableEditConfig } from '@/shared/app-table-config'
import { useDzModal } from '@/common/dzmodel/DzModalService'
import { SCENE_PLY_APP_READ } from '@/constants/tab-constants'
import { PcisQueryService } from '@/views/payinfoManagement/service/pcis-query-service'
import { rsaEncoder, base64encoder } from '@/utils/encipher'
import { DialogMethod } from '@/common/dzmodel/ComDialogConf'
// @ts-ignore
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import moment from 'moment'
const pcisQueryService = new PcisQueryService()
const userStore = useUserStore()
const user = ref(userStore.user) || ref({ companyId: '', opCde: '', companyCnm: '' })
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
                        label: user.value.companyCnm,
                        value: user.value.companyId
                    }
                ]
            })
        }
    })
]
btnList.value = buttonList
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
                prop: 'CProdNo',
                inputtype: 'rtselect',
                title: '产品',
                itemWidth: 1,
                rules: [getRules('required', {})],
                typeCode: 'EPolicyProdList',
                filterable: true,
                clearable: true,
                func: (val: any) => {
                    const plyTyp = freeEditRef.value?.getValue('CPlyTyp')
                    if ((val == '089900' && plyTyp == 'PLY') || (val == '010022' && plyTyp == 'PLY') || plyTyp == 'BL') {
                        setFormItem('CTyp', { disabled: false })
                    } else {
                        setFormItem('CTyp', { disabled: true })
                    }
                }
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
                title: '投保单号',
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
                title: '被保人姓名',
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
                format: 'YYYY-MM-DD HH:mm:ss',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                clearable: true,
                type: 'datetimerange'
            },
            {
                prop: 'TEdrAppTm',
                inputtype: 'rtdatepicker',
                title: '批改申请日期',
                format: 'YYYY-MM-DD HH:mm:ss',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                clearable: true,
                type: 'datetimerange'
            },
            {
                prop: 'TIssueTm',
                inputtype: 'rtdatepicker',
                title: '签单日期',
                format: 'YYYY-MM-DD HH:mm:ss',
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
                ]
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
                    { label: '非营运客车承运人责任险模板', value: '06' }
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
                prop: 'cAppNo',
                inputtype: 'rtinput',
                title: '投保单号'
            },
            {
                prop: 'cPlyNo',
                inputtype: 'rtinput',
                title: '保单号'
            },
            {
                prop: 'cEdrNo',
                inputtype: 'rtinput',
                title: '批单号'
            },
            {
                prop: 'cAppNme',
                inputtype: 'rtinput',
                title: '投保人名称'
            },
            {
                prop: 'nPrm',
                inputtype: 'rtinput',
                title: '保险费'
            },
            {
                prop: 'cProdNmeCn',
                inputtype: 'rtinput',
                title: '产品'
            },
            {
                prop: 'cSlsNme',
                inputtype: 'rtinput',
                title: '业务员名称'
            },
            {
                prop: 'tAppTm',
                inputtype: 'rtinput',
                title: '投保申请日期'
            },
            {
                prop: 'tInsrncBgnTm',
                inputtype: 'rtinput',
                title: '保险起期'
            },
            {
                prop: 'tInsrncEndTm',
                inputtype: 'rtinput',
                title: '保险止期'
            },
            {
                prop: 'tUdrTm',
                inputtype: 'rtinput',
                title: '核保日期'
            }
        ]
    })
)

onMounted(async () => {
    nextTick(() => {
        freeEditRef.value?.setValue('CLoadSub', '1')
        freeEditRef.value?.setValue('CDptCde', user.value.companyId)
        freeEditRef.value?.setValue('CPlyTyp', 'PLY')
        setFormItem('CDptCde', {
            loadData: [
                {
                    label: user.value.companyCnm,
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
        pageresult.list = [{}, {}]
        pageresult.total = 2
        // 上面代码是仅用于本地调试
        if (n) {
            // handleQuery(true);
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
            const param = Object.assign(
                {
                    CurrentUser: user.value.opCde,
                    CurrentUserOrg: user.value.companyId,
                    CAppTyp: plyTyp === 'EDR' ? 'E' : 'A'
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
            pcisQueryService
                .getEpolicyPolicyList(param)
                .then((res: any) => {
                    const { code, data } = res
                    if (200 === code) {
                        pageresult.list = []
                        pageresult.list = data.result
                        pageresult.total = data.total
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
</script>

<style scoped></style>
