<template>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
        @page-change="handleQuery(false, false)" />
</template>

<script setup lang="ts">
import { AppFreeEditConfig, AppFreeEditMethod, createAppFreeEditConfig, createFromUiConfig } from '@/shared/app-free-edit-config'
import { AppTableConfig, AppTableMethod, createTableEditConfig } from '@/shared/app-table-config'
import { createFreeButtonBase, FreeButtonBase } from '@/shared/button-config'
import { useValidator } from '@/typings/useValidator'
import { dataOpertaor } from '@/store/modules/data-opertaor'
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service'
import { PcisQueryService } from '@/views/payinfoManagement/service/pcis-query-service'
import { rsaEncoder, base64encoder } from '@/utils/encipher'
const policyService = new PolicyService()
const opertaor = dataOpertaor()
const { getRules } = useValidator()
import { useRoute } from 'vue-router'
// @ts-ignore
import { saveAs } from 'file-saver'
const route = useRoute()
const routeParam = route.params.param
const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    },
    method: {
        type: Object,
        default: () => ({})
    }
})
const emits = defineEmits(['handleClose'])
const freeEditRef = ref<AppFreeEditMethod | null>(null)
const tableRef = ref<AppTableMethod | null>(null)
const sessionUser: any = sessionStorage.getItem('user')
const user = JSON.parse(sessionUser)
const pcisQueryService = new PcisQueryService()
const pageresult = reactive<Pageresult>({
    result: '',
    /** 数据列表 */
    list: [],
    /** 总数 */
    total: 0
})
const btnList = ref<Array<FreeButtonBase>>([])
const buttonList = [
    createFreeButtonBase({
        type: 'primary',
        label: '生成在保证明',
        id: 'gen_ZBZM_Btn',
        func: async () => {
            generateEPolicy()
        }
    }),
    createFreeButtonBase({
        type: 'primary',
        label: '在保证明下载',
        id: 'down_ZBZM_Btn',
        func: async () => {
            downloadEPolicy()
        }
    }),
    createFreeButtonBase({
        type: 'primary',
        label: '查询',
        func: async () => {
            handleQuery(false, true)
        }
    })
]
btnList.value = buttonList
const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
        title: '',
        endBtnsPosition: 'right',
        endBtns: buttonList,
        fromSchema: [
            {
                prop: 'CPlyNo',
                inputtype: 'rtinput',
                title: '保单号',
                itemWidth: 1
            },
            {
                prop: 'CEdrNo',
                inputtype: 'rtinput',
                title: '批单号',
                itemWidth: 1
            }
        ],
        fromUi: createFromUiConfig({
            cols: 3
        })
    })
)
const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
        showSelection: true,
        fromSchema: [
            {
                prop: 'cAppNo',
                inputtype: 'rtinput',
                title: '申请单号'
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
                prop: 'nEdrPrjNo',
                inputtype: 'rtinput',
                title: '批改序号'
            },
            {
                prop: 'tInsrncBgnTm',
                inputtype: 'rtinput',
                title: '保险起期'
            },
            {
                prop: 'tIssueTm',
                inputtype: 'rtinput',
                title: '签单日期'
            },
            {
                prop: 'cResvTxt10',
                inputtype: 'rtselect',
                title: '是否生成在保证明',
                loadData: [
                    {
                        label: '未生成',
                        value: '0'
                    },
                    {
                        label: '已生成',
                        value: '1'
                    }
                ]
            }
        ]
    })
)

function getFromValue() {
    return freeEditRef?.value?.getFromValue()
}

function setFormValue(value: any) {
    freeEditRef?.value?.setFormValue(value)
}

function validate() {
    return freeEditRef?.value?.validate()
}

function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value)
}

function getValue(key: string) {
    return freeEditRef?.value?.getValue(key)
}

/** 查询 */
function handleQuery(flag?: boolean, isAlert?: boolean) {
    const plyNo = freeEditRef.value?.getValue('CPlyNo')
    const edrNo = freeEditRef.value?.getValue('CEdrNo')
    if (!plyNo && !edrNo) {
        ElMessage.warning('保单号和批单号不能同时为空，请录入后进行查询!')
        return
    }
    const r = tableRef.value?.getPartnerPage(flag) //获取分页数据
    const s = freeEditRef.value?.getFromValue() //获取表单数据
    const param = Object.assign(s, r)
    const params = Object.assign(
        {
            CurrentUser: user.opCde,
            CurrentUserOrg: user.companyId,
            CPlyNo: props.data.data['CPlyNo'],
            CEdrNo: props.data.data['CEdrNo']
        },
        param
    )
    pcisQueryService
        .queryEmpEPolicyList(params)
        .then((res: any) => {
            const { code, data, msg } = res
            if (200 === code) {
                pageresult.list = []
                pageresult.list = data.result
                pageresult.total = data.total
                if (isAlert) {
                    ElMessage.success(data.message)
                }
            } else {
                ElMessage.warning(msg)
            }
        }
        )
        .finally(() => { })
}

/**
 * 在保证明生成
 */
function generateEPolicy() {
    const btn = getBtn('gen_ZBZM_Btn')
    const selectData = tableRef.value?.getselectionData()
    if (!selectData || selectData.length <= 0) {
        ElMessage.warning('所选记录为空！')
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
        vCUniqueNo: vCUniqueNo,
        CPlyTyp: 'ZBZM',
        CDzbdTyp: 'PLY'
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
            handleQuery(false, false)
        })
}

/**
 * 在保证明下载
 */
function downloadEPolicy() {
    const btn = getBtn('down_ZBZM_Btn')
    const selectData = tableRef.value?.getselectionData()
    if (!selectData || selectData.length <= 0) {
        ElMessage.warning('所选记录为空！')
        return
    }
    if (selectData.length > 1) {
        ElMessage.warning('每次只能下载1个单据！')
        return
    }
    const appNo = selectData[0].cAppNo
    if (!appNo) {
        ElMessage.warning('没有数据，请核实确认！')
        return
    }
    const data = {
        plyNo: base64encoder(rsaEncoder(appNo)),
        type: 'EXP_EPOLICY_IMP_PDF',
        impType: 'ZBZM'
    }
    setButton(btn, true)
    pcisQueryService
        .downloadEPolicy(data)
        .then((res: any) => {
            if (res == '' || res == '500' || res.size <= 0) {
                ElMessage.error('下载出错，请核实是否有生成在保证明！')
                return
            }
            const fileName = `${appNo}.pdf`
            const blob = new Blob([res.data], { type: 'application/pdf;charset=UTF-8' })
            saveAs(blob, fileName)
        })
        .catch(e => {
            ElMessage.error('在保证明下载失败' + e)
        })
        .finally(() => {
            setButton(btn, false)
        })
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

onMounted(() => {
    nextTick(() => {
        // setValue('CDptCde', props.data.data.CDptCde)
        // setValue('CDptCnm',routeParam.cDptCnm)
    })
})

defineExpose({
    getFromValue,
    setFormValue,
    validate,
    setValue,
    getValue
})
</script>
